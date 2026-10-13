import type { AppState } from "../providers/types";
import type { CodexResetCapture } from "../shared/codex-reset-capture";
import type { CommunityResetSource, CommunityResetStore } from "../shared/community-reset-feeds";
import type { ResetNotificationMessage, ResetNotificationResponse, ResetNotificationView } from "../shared/reset-notification-client";
import {
  applyResetNotificationChange, evaluateResetNotifications, isResetNotificationCurrent, normalizeResetNotificationStore, readCurrentCreditObservation,
  normalizeResetNotificationTarget,
  type ResetNotificationEvent, type ResetNotificationStore, type ResetNotificationTarget,
} from "../shared/reset-notifications";

type Dependencies = {
  readState: () => Promise<AppState | null>;
  readFeed: () => Promise<CommunityResetStore>;
  readStore: () => Promise<unknown>;
  writeStore: (store: ResetNotificationStore) => Promise<void>;
  readCapture: () => Promise<CodexResetCapture | null>;
  permission: () => Promise<ResetNotificationView["permission"]>;
  sourceAccess: (source: CommunityResetSource) => Promise<boolean>;
  suppressed: () => Promise<boolean>;
  deliver: (id: string, event: ResetNotificationEvent | { kind: "test" }, state: AppState) => Promise<void>;
  openTarget: (target: ResetNotificationTarget, state: AppState | null) => Promise<void>;
  stopCommunityDesktop?: () => Promise<void>;
  now?: () => number;
  id?: () => string;
};
export function createResetNotificationController(deps: Dependencies) {
  let generation = 0, tail: Promise<unknown> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => { const result = tail.then(work, work); tail = result.catch(() => undefined); return result; };
  const now = () => deps.now?.() ?? Date.now();
  async function context() {
    const state = await deps.readState(), feed = await deps.readFeed(), store = normalizeResetNotificationStore(await deps.readStore());
    const capture = await deps.readCapture();
    const permission = await deps.suppressed() ? "denied" : await deps.permission();
    const observation = state ? readCurrentCreditObservation(state, capture, now()) : null;
    return { state, feed, store, capture, permission, view: { preferences: store.preferences, permission,
      accountEligible: observation !== null && observation.availableCount !== null } satisfies ResetNotificationView };
  }
  function invalidate() { generation += 1; }
  function evaluate() {
    const token = generation;
    return serial(async () => {
      const saved = normalizeResetNotificationStore(await deps.readStore()), feed = await deps.readFeed();
      if ((feed.preferences.mode !== "desktop" || saved.preferences.communityPaused)
        && (saved.preferences.grantAccountKeys.length === 0 || saved.preferences.accountPaused)
        && saved.community.configuration === null && Object.keys(saved.community.seen).length === 0 && Object.keys(saved.grants).length === 0) return;
      const ctx = await context();
      if (!ctx.state) return;
      const result = evaluateResetNotifications(ctx.state, ctx.feed, ctx.store, ctx.capture, now(), ctx.permission === "granted");
      if (JSON.stringify(result.store) !== JSON.stringify(ctx.store)) await deps.writeStore(result.store);
      for (const event of result.events) {
        const latest = await context();
        if (token !== generation || !latest.state || latest.permission !== "granted" || await deps.suppressed()
          || !isResetNotificationCurrent(event, latest.state, latest.feed, latest.store, latest.capture, now())) continue;
        if (event.kind === "community_report" && !(await Promise.all(event.sources.map(deps.sourceAccess))).every(Boolean)) continue;
        const id = deps.id?.() ?? `ai-usage-reset-${crypto.randomUUID()}`;
        const clicks = Object.fromEntries(Object.entries(latest.store.clicks).sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt)).slice(0, 63));
        await deps.writeStore({ ...latest.store, clicks: { ...clicks, [id]: { target: event.target, createdAt: new Date(now()).toISOString() } } });
        if (token !== generation || await deps.suppressed() || await deps.permission() !== "granted") continue;
        // Ledger and target are durable before the best-effort OS call; failed delivery is never replayed.
        await deps.deliver(id, event, latest.state).catch(() => undefined);
      }
    });
  }
  function reset() {
    invalidate();
    return serial(async () => { await deps.writeStore(normalizeResetNotificationStore(undefined)); await deps.stopCommunityDesktop?.(); });
  }
  function handle(message: ResetNotificationMessage): Promise<ResetNotificationResponse> {
    if (message.type === "reset-notifications:update") invalidate();
    return serial(async () => {
      const ctx = await context();
      if (!ctx.state) return { ok: false };
      if (message.type === "reset-notifications:update") {
        if (!message.change || !["community-paused", "account-paused", "account-grants"].includes(message.change.type)) return { ok: false };
        if (message.change.type === "account-grants" && message.change.value && ctx.permission !== "granted") return { ok: false };
        let next = applyResetNotificationChange(ctx.store, message.change);
        next = evaluateResetNotifications(ctx.state, ctx.feed, next, ctx.capture, now(), ctx.permission === "granted").store;
        await deps.writeStore(next);
        return { ok: true, view: { ...ctx.view, preferences: next.preferences } };
      }
      if (message.type === "reset-notifications:test") {
        const enabled = message.group === "community" ? ctx.feed.preferences.mode === "desktop" && !ctx.store.preferences.communityPaused
          : message.group === "account" && ctx.store.preferences.grantAccountKeys.length > 0 && !ctx.store.preferences.accountPaused;
        if (!enabled || ctx.permission !== "granted") return { ok: true, view: ctx.view, tested: false };
        return { ok: true, view: ctx.view, tested: await deps.deliver(`ai-usage-reset-${crypto.randomUUID()}`, { kind: "test" }, ctx.state).then(() => true, () => false) };
      }
      return message.type === "reset-notifications:read" ? { ok: true, view: ctx.view } : { ok: false };
    });
  }
  function click(id: string): Promise<boolean> {
    return serial(async () => {
      if (await deps.suppressed()) return false;
      const store = normalizeResetNotificationStore(await deps.readStore()), entry = store.clicks[id];
      if (!entry || now() - Date.parse(entry.createdAt) > 24 * 60 * 60_000) return false;
      delete store.clicks[id];
      await deps.writeStore(store);
      await deps.openTarget(entry.target, await deps.readState());
      return true;
    });
  }
  function registerClick(id: string, value: ResetNotificationTarget) {
    return serial(async () => {
      const target = normalizeResetNotificationTarget(value);
      if (!target || !/^(?:ai-usage-reset|ai-usage-dashboard-quota)-[a-f0-9-]{36}$/.test(id)) return;
      const store = normalizeResetNotificationStore(await deps.readStore());
      const clicks = Object.fromEntries(Object.entries(store.clicks).sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt)).slice(0, 63));
      await deps.writeStore({ ...store, clicks: { ...clicks, [id]: { target, createdAt: new Date(now()).toISOString() } } });
    });
  }
  return { evaluate, reset, handle, click, registerClick, invalidate };
}
