import type { AppState } from "../providers/types";
import type { QuotaNotificationMessage, QuotaNotificationResponse, QuotaNotificationView } from "../shared/quota-notification-client";
import {
  applyQuotaNotificationChange, evaluateQuotaNotifications, isQuotaNotificationEventCurrent, normalizeQuotaNotificationStore,
  type QuotaNotificationEvent, type QuotaNotificationStore,
} from "../shared/quota-notifications";

type Dependencies = {
  readState: () => Promise<AppState | null>;
  readStore: () => Promise<unknown>;
  writeStore: (store: QuotaNotificationStore) => Promise<void>;
  permission: () => Promise<QuotaNotificationView["permission"]>;
  deliver: (event: QuotaNotificationEvent | { kind: "test" }, state: AppState) => Promise<void>;
  now?: () => number;
};

/** One background writer owns both preferences and the durable event ledger. */
export function createQuotaNotificationController(dependencies: Dependencies) {
  let tail: Promise<unknown> = Promise.resolve();
  function serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = tail.then(operation, operation);
    tail = result.catch(() => undefined);
    return result;
  }
  async function context() {
    const state = await dependencies.readState();
    const store = normalizeQuotaNotificationStore(await dependencies.readStore(), state?.settings.warningThresholdPercent);
    const permission = await dependencies.permission();
    return { state, store, permission };
  }
  function evaluate() {
    return serialize(async () => {
      const saved = normalizeQuotaNotificationStore(await dependencies.readStore());
      if (!saved.preferences.enabled && Object.keys(saved.ledger).length === 0
        && saved.preferences.disabledAccountKeys.length === 0 && saved.preferences.disabledWindowKeys.length === 0) return;
      const { state, store, permission } = await context();
      if (!state) {
        await dependencies.writeStore(normalizeQuotaNotificationStore(undefined));
        return;
      }
      const result = evaluateQuotaNotifications(state, store, dependencies.now?.() ?? Date.now(), permission === "granted");
      if (JSON.stringify(result.store) !== JSON.stringify(store)) await dependencies.writeStore(result.store);
      // Persist before delivery: a crash or OS rejection may miss one event, never spam a restart.
      for (const event of result.events) {
        if (await dependencies.permission() !== "granted") break;
        const latest = await dependencies.readState();
        if (!latest || !isQuotaNotificationEventCurrent(latest, event, dependencies.now?.() ?? Date.now())) continue;
        await dependencies.deliver(event, latest).catch(() => undefined);
      }
    });
  }
  function reset() {
    return serialize(async () => {
      const state = await dependencies.readState();
      await dependencies.writeStore(normalizeQuotaNotificationStore(undefined, state?.settings.warningThresholdPercent));
    });
  }
  function handle(message: QuotaNotificationMessage): Promise<QuotaNotificationResponse> {
    return serialize(async () => {
      if (!["quota-notifications:read", "quota-notifications:update", "quota-notifications:test"].includes(message.type)) return { ok: false };
      const { state, store, permission } = await context();
      if (!state) return { ok: false };
      let current = store;
      if (message.type === "quota-notifications:update") {
        if (!message.change || !["enabled", "paused", "threshold", "account", "window"].includes(message.change.type)) return { ok: false };
        if (message.change.type === "enabled" && message.change.value && permission !== "granted") return { ok: false };
        current = applyQuotaNotificationChange(store, message.change);
        current = evaluateQuotaNotifications(state, current, dependencies.now?.() ?? Date.now(), permission === "granted").store;
        await dependencies.writeStore(current);
      }
      const view: QuotaNotificationView = { preferences: current.preferences, permission };
      if (message.type === "quota-notifications:test") {
        if (!current.preferences.enabled || current.preferences.paused || permission !== "granted") return { ok: true, view, tested: false };
        const tested = await dependencies.deliver({ kind: "test" }, state).then(() => true, () => false);
        return { ok: true, view, tested };
      }
      return { ok: true, view };
    });
  }
  return { evaluate, reset, handle };
}
