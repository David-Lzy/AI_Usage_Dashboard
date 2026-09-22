import { PROVIDER_IDS, getProviderDefinition } from "../providers/provider-definitions";
import type { AppState, ProviderId, ProviderSnapshot, ProviderUsageWindow } from "../providers/types";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";

export const QUOTA_NOTIFICATION_STORAGE_KEY = "ai-usage-dashboard.quota-notifications";
export const MAX_NOTIFICATION_CAPTURE_AGE_MS = 30 * 60 * 1000;
export type QuotaNotificationPreferences = {
  enabled: boolean;
  paused: boolean;
  thresholdPercent: number;
  disabledAccountKeys: string[];
  disabledWindowKeys: string[];
};
export type QuotaNotificationChange =
  | { type: "enabled" | "paused"; value: boolean }
  | { type: "threshold"; value: number }
  | { type: "account" | "window"; key: string; enabled: boolean };
export type QuotaNotificationSourceState = Pick<AppState, "providers" | "providerSettings" | "providerAccounts">;
export type QuotaNotificationAccount = {
  key: string;
  providerId: ProviderId;
  accountId: string;
  label: string;
  active: boolean;
  windows: { key: string; label: string; kind: ProviderUsageWindow["kind"]; modelLabel: string | null }[];
};
export type QuotaNotificationEvent = {
  kind: "low" | "reset";
  providerId: ProviderId;
  accountKey: string;
  windowKey: string;
  remainingPercent: number;
  capturedAt: string;
};
type Observation = {
  capturedAt: string;
  resetAt: string | null;
  usedPercent: number;
};
export type QuotaNotificationWindowState = Observation & {
  lowNotified: boolean;
  pendingReset?: Observation;
  pendingExtreme?: Observation;
};
export type QuotaNotificationStore = {
  schemaVersion: 1;
  preferences: QuotaNotificationPreferences;
  ledger: Record<string, QuotaNotificationWindowState>;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function threshold(value: unknown, fallback = 80): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 100
    ? value : fallback;
}
function keyList(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((key): key is string =>
    typeof key === "string" && key.length <= 1024 && key.startsWith("[")))].slice(0, 512) : [];
}
export function createDefaultQuotaNotificationPreferences(defaultThreshold = 80): QuotaNotificationPreferences {
  return { enabled: false, paused: false, thresholdPercent: threshold(defaultThreshold), disabledAccountKeys: [], disabledWindowKeys: [] };
}
function normalizeObservation(value: unknown): Observation | null {
  if (!record(value)) return null;
  const capturedAt = normalizeSnapshotTimestamp(value.capturedAt);
  if (!capturedAt || typeof value.usedPercent !== "number" || !Number.isFinite(value.usedPercent) || value.usedPercent < 0 || value.usedPercent > 100) return null;
  return { capturedAt, usedPercent: value.usedPercent, resetAt: normalizeSnapshotTimestamp(value.resetAt) };
}
export function normalizeQuotaNotificationStore(value: unknown, defaultThreshold = 80): QuotaNotificationStore {
  const input = record(value) && value.schemaVersion === 1 ? value : {};
  const preferences = record(input.preferences) ? input.preferences : {};
  const ledger: QuotaNotificationStore["ledger"] = {};
  if (record(input.ledger)) for (const [key, entry] of Object.entries(input.ledger).slice(0, 512)) {
    const observation = normalizeObservation(entry);
    if (!observation || !record(entry) || !key.startsWith("[") || key.length > 1024) continue;
    const pendingReset = normalizeObservation(entry.pendingReset);
    const pendingExtreme = normalizeObservation(entry.pendingExtreme);
    ledger[key] = { ...observation, lowNotified: entry.lowNotified === true,
      ...(pendingReset ? { pendingReset } : {}), ...(pendingExtreme ? { pendingExtreme } : {}) };
  }
  return {
    schemaVersion: 1,
    preferences: { enabled: preferences.enabled === true, paused: preferences.paused === true,
      thresholdPercent: threshold(preferences.thresholdPercent, threshold(defaultThreshold)),
      disabledAccountKeys: keyList(preferences.disabledAccountKeys), disabledWindowKeys: keyList(preferences.disabledWindowKeys) },
    ledger,
  };
}

function accountEntries(state: QuotaNotificationSourceState) {
  return PROVIDER_IDS.flatMap((providerId) => {
    const current = state.providers.find((provider) => provider.providerId === providerId);
    const setting = state.providerSettings.find((provider) => provider.id === providerId);
    const collection = state.providerAccounts?.[providerId];
    const metadata = collection?.accounts ?? (current ? [{ id: "default", label: getProviderDefinition(providerId).label }] : []);
    const seen = new Set<string>();
    return metadata.slice(0, 64).filter((account) => {
      if (typeof account.id !== "string" || !account.id || seen.has(account.id)) return false;
      seen.add(account.id);
      return true;
    }).map((account) => {
      const active = !collection || collection.activeAccountId === account.id;
      const cached = collection && Object.hasOwn(collection.inactiveAccounts, account.id) ? collection.inactiveAccounts[account.id] : undefined;
      const snapshot = active ? current : cached?.snapshot;
      const accountSetting = active ? setting : cached?.setting;
      return { key: JSON.stringify([providerId, account.id]), providerId, accountId: account.id,
        label: metadata.length > 1 ? `${getProviderDefinition(providerId).label} · ${account.label}` : getProviderDefinition(providerId).label,
        active, setting: accountSetting?.id === providerId ? accountSetting : undefined,
        snapshot: snapshot?.providerId === providerId ? snapshot : undefined };
    });
  });
}
function supportedWindows(accountKey: string, snapshot: ProviderSnapshot | undefined) {
  const seen = new Set<string>();
  const entries = (snapshot?.usageWindows ?? []).slice(0, 64).flatMap((window) => {
    if (window.quotaUnit !== "percent" || !["rolling_5h", "weekly", "model_rolling_5h", "model_weekly"].includes(window.kind)) return [];
    const model = typeof window.modelLabel === "string" ? window.modelLabel.slice(0, 128) : "";
    const key = JSON.stringify([accountKey, window.kind, model]);
    return [{ key, window }];
  });
  const duplicates = new Set<string>();
  for (const { key } of entries) {
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return entries.filter(({ key }) => !duplicates.has(key));
}
export function listQuotaNotificationAccounts(state: QuotaNotificationSourceState): QuotaNotificationAccount[] {
  return accountEntries(state).map((account) => ({ key: account.key, providerId: account.providerId,
    accountId: account.accountId, label: account.label, active: account.active,
    windows: supportedWindows(account.key, account.snapshot).map(({ key, window }) => ({ key, label: window.label, kind: window.kind, modelLabel: window.modelLabel })) }));
}

function readObservation(snapshot: ProviderSnapshot, window: ProviderUsageWindow, now: number): Observation | null {
  const capturedAt = normalizeSnapshotTimestamp(snapshot.lastSuccessAt);
  const attemptedAt = normalizeSnapshotTimestamp(snapshot.lastAttemptAt);
  if (!capturedAt || snapshot.syncStatus === "error") return null;
  const time = Date.parse(capturedAt);
  if (time > now || now - time > MAX_NOTIFICATION_CAPTURE_AGE_MS || (attemptedAt && Date.parse(attemptedAt) > time)) return null;
  const used = window.used ?? (window.remaining === null ? null : 100 - window.remaining);
  if (typeof used !== "number" || !Number.isFinite(used) || used < 0 || used > 100 || (window.total !== null && window.total !== 100)) return null;
  if (window.remaining !== null && (!Number.isFinite(window.remaining) || Math.abs(100 - used - window.remaining) > 0.5)) return null;
  const resetAt = normalizeSnapshotTimestamp(window.resetAt);
  // An expired window awaiting a refreshed reset time is not a current observation.
  if (resetAt && Date.parse(resetAt) <= time) return null;
  return { capturedAt, usedPercent: used, resetAt };
}

/** Pure transition: only independent new captures can establish an event. */
export function evaluateQuotaNotifications(
  state: QuotaNotificationSourceState,
  store: QuotaNotificationStore,
  now = Date.now(),
  permissionGranted = true,
): { store: QuotaNotificationStore; events: QuotaNotificationEvent[] } {
  const preferences = { ...store.preferences };
  const ledger: QuotaNotificationStore["ledger"] = {};
  const events: QuotaNotificationEvent[] = [];
  const accounts = accountEntries(state);
  const accountKeys = new Set(accounts.map((account) => account.key));
  preferences.disabledAccountKeys = preferences.disabledAccountKeys.filter((key) => accountKeys.has(key));
  preferences.disabledWindowKeys = preferences.disabledWindowKeys.filter((key) => {
    try { const parts: unknown = JSON.parse(key); return Array.isArray(parts) && accountKeys.has(parts[0]); }
    catch { return false; }
  });
  for (const account of accounts) for (const { key, window } of supportedWindows(account.key, account.snapshot)) {
    const previous = store.ledger[key];
    const enabled = preferences.enabled && !preferences.paused && permissionGranted
      && !preferences.disabledAccountKeys.includes(account.key) && !preferences.disabledWindowKeys.includes(key);
    // Disabled or paused scopes restart from a baseline, not queued old events.
    if (!enabled) continue;
    if (previous) ledger[key] = previous;
    if (!account.snapshot || account.setting?.status !== "granted" || account.setting.sourceKind === "policy_only") continue;
    const current = readObservation(account.snapshot, window, now);
    if (!current || (previous && Date.parse(current.capturedAt) <= Date.parse(previous.pendingReset?.capturedAt ?? previous.pendingExtreme?.capturedAt ?? previous.capturedAt))) continue;
    if (!previous) { ledger[key] = { ...current, lowNotified: current.usedPercent >= preferences.thresholdPercent }; continue; }
    const resetCandidate = previous.resetAt !== null && current.resetAt !== null
      && Date.parse(previous.resetAt) <= Date.parse(current.capturedAt)
      && Date.parse(current.resetAt) > Date.parse(previous.resetAt)
      && current.usedPercent < previous.usedPercent;
    if (resetCandidate) {
      if (previous.pendingReset?.resetAt === current.resetAt) {
        events.push({ kind: "reset", providerId: account.providerId, accountKey: account.key, windowKey: key, remainingPercent: 100 - current.usedPercent, capturedAt: current.capturedAt });
        ledger[key] = { ...current, lowNotified: current.usedPercent >= preferences.thresholdPercent };
      } else ledger[key] = { ...previous, pendingExtreme: undefined, pendingReset: current };
      continue;
    }
    // A lone zero in used OR remaining quota may be an upstream placeholder.
    if ((current.usedPercent === 0 || current.usedPercent === 100)
      && previous.usedPercent !== current.usedPercent
      && previous.pendingExtreme?.usedPercent !== current.usedPercent) {
      ledger[key] = { ...previous, pendingReset: undefined, pendingExtreme: current };
      continue;
    }
    const crossed = previous.usedPercent < preferences.thresholdPercent && current.usedPercent >= preferences.thresholdPercent;
    const lowNotified = previous.lowNotified || crossed;
    if (crossed && !previous.lowNotified) events.push({ kind: "low", providerId: account.providerId, accountKey: account.key, windowKey: key, remainingPercent: 100 - current.usedPercent, capturedAt: current.capturedAt });
    ledger[key] = { ...current, lowNotified };
  }
  return { store: { schemaVersion: 1, preferences, ledger }, events };
}

export function applyQuotaNotificationChange(store: QuotaNotificationStore, change: QuotaNotificationChange): QuotaNotificationStore {
  const preferences = { ...store.preferences };
  switch (change.type) {
    case "enabled": preferences.enabled = change.value === true; break;
    case "paused": preferences.paused = change.value === true; break;
    case "threshold": preferences.thresholdPercent = threshold(change.value, preferences.thresholdPercent); break;
    case "account":
    case "window": {
      if (typeof change.key !== "string" || change.key.length > 1024 || !change.key.startsWith("[")) return store;
      const field = change.type === "account" ? "disabledAccountKeys" : "disabledWindowKeys";
      preferences[field] = change.enabled ? preferences[field].filter((key) => key !== change.key) : keyList([...preferences[field], change.key]);
      break;
    }
  }
  // Settings edits establish a new baseline; never turn an old crossing into a new event.
  return { schemaVersion: 1, preferences, ledger: {} };
}

export function isQuotaNotificationEventCurrent(state: QuotaNotificationSourceState, event: QuotaNotificationEvent, now: number): boolean {
  const account = accountEntries(state).find((entry) => entry.key === event.accountKey);
  if (!account?.snapshot || account.setting?.status !== "granted") return false;
  const window = supportedWindows(account.key, account.snapshot).find((entry) => entry.key === event.windowKey)?.window;
  return Boolean(window && readObservation(account.snapshot, window, now)?.capturedAt === event.capturedAt);
}
