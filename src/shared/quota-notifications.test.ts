import { describe, expect, it } from "vitest";
import { createDefaultAppState } from "./production-state";
import { applyQuotaNotificationChange, evaluateQuotaNotifications, listQuotaNotificationAccounts, normalizeQuotaNotificationStore } from "./quota-notifications";

const START = Date.parse("2026-09-22T12:00:00Z");
const RESET = new Date(START + 60 * 60_000).toISOString();
function fixture(used = 30, minute = 0, resetAt: string | null = RESET) {
  const state = createDefaultAppState();
  state.providers = state.providers.filter((provider) => provider.providerId === "codex-personal-page");
  state.providerSettings = state.providerSettings.filter((provider) => provider.id === "codex-personal-page");
  state.providerSettings[0].status = "granted";
  const capturedAt = new Date(START + minute * 60_000).toISOString();
  Object.assign(state.providers[0], { syncStatus: "ok", lastAttemptAt: capturedAt, lastSuccessAt: capturedAt,
    usageWindows: [{ kind: "weekly", label: "Weekly", normalizedLabel: "weekly", modelLabel: null, quotaUnit: "percent", used, remaining: 100 - used, total: 100, resetAt, resetLabel: null }] });
  return state;
}
function enabled() {
  return applyQuotaNotificationChange(normalizeQuotaNotificationStore(undefined), { type: "enabled", value: true });
}
function run(state = fixture(), store = enabled(), minute = 0, permission = true) {
  return evaluateQuotaNotifications(state, store, START + minute * 60_000, permission);
}

describe("quota notification transitions", () => {
  it("defaults off with the user's existing warning threshold", () => {
    const store = normalizeQuotaNotificationStore(undefined, 75);
    expect(store.preferences).toMatchObject({ enabled: false, paused: false, thresholdPercent: 75 });
    expect(run(fixture(90), store).events).toEqual([]);
    expect(run(fixture(90)).events).toEqual([]);
  });
  it("emits once per threshold crossing and survives a serialized restart", () => {
    let result = run();
    result = run(fixture(81, 1), result.store, 1);
    expect(result.events).toMatchObject([{ kind: "low", providerId: "codex-personal-page", remainingPercent: 19 }]);
    const restarted = normalizeQuotaNotificationStore(JSON.parse(JSON.stringify(result.store)));
    expect(run(fixture(81, 1), restarted, 1).events).toEqual([]);
    const rebound = run(fixture(10, 2), restarted, 2);
    expect(run(fixture(85, 3), rebound.store, 3).events).toEqual([]);
  });
  it("requires two fresh captures to confirm an expired window reset", () => {
    const first = run(fixture(90));
    const nextReset = new Date(START + 8 * 24 * 60 * 60_000).toISOString();
    const candidate = run(fixture(0, 61, nextReset), first.store, 61);
    expect(candidate.events).toEqual([]);
    expect(run(fixture(0, 61, nextReset), candidate.store, 61).events).toEqual([]);
    const confirmed = run(fixture(2, 62, nextReset), candidate.store, 62);
    expect(confirmed.events).toMatchObject([{ kind: "reset", remainingPercent: 98 }]);
    expect(run(fixture(3, 63, nextReset), confirmed.store, 63).events).toEqual([]);
    expect(run(fixture(85, 64, nextReset), confirmed.store, 64).events[0].kind).toBe("low");
  });
  it("does not treat a lone zero, time shift or rebound as a reset", () => {
    const first = run(fixture(90));
    const zero = run(fixture(0, 1), first.store, 1);
    expect(zero.events).toEqual([]);
    expect(run(fixture(90, 2), zero.store, 2).events).toEqual([]);
    const shifted = new Date(START + 2 * 60 * 60_000).toISOString();
    expect(run(fixture(1, 3, shifted), first.store, 3).events).toEqual([]);
    const candidate = run(fixture(0, 61, shifted), first.store, 61);
    expect(run(fixture(90, 62, shifted), candidate.store, 62).events).toEqual([]);
  });
  it("ignores failed, cached, old, future and unknown captures", () => {
    const baseline = run().store;
    for (const mutation of [
      { syncStatus: "error" }, { lastSuccessAt: null }, { lastAttemptAt: new Date(START + 2 * 60_000).toISOString() },
      { lastSuccessAt: new Date(START - 2 * 60 * 60_000).toISOString() }, { lastSuccessAt: new Date(START + 10 * 60_000).toISOString() },
    ]) {
      const state = fixture(90, 1);
      Object.assign(state.providers[0], mutation);
      expect(run(state, baseline, 1).events).toEqual([]);
    }
    expect(run(fixture(90, 0), baseline, 1).events).toEqual([]);
    const expired = fixture(90, 61);
    expect(run(expired, baseline, 61).events).toEqual([]);
  });
  it("confirms zero remaining quota before emitting a low alert", () => {
    const baseline = run().store;
    const empty = run(fixture(100, 1), baseline, 1);
    expect(empty.events).toEqual([]);
    expect(run(fixture(30, 2), empty.store, 2).events).toEqual([]);
    const confirmed = run(fixture(100, 2), normalizeQuotaNotificationStore(JSON.parse(JSON.stringify(empty.store))), 2);
    expect(confirmed.events).toMatchObject([{ kind: "low", remainingPercent: 0 }]);
  });
  it("suppresses permission-denied, paused and disabled scopes and does not catch up later", () => {
    const first = run().store;
    const account = listQuotaNotificationAccounts(fixture())[0];
    for (const store of [
      applyQuotaNotificationChange(first, { type: "paused", value: true }),
      applyQuotaNotificationChange(first, { type: "account", key: account.key, enabled: false }),
      applyQuotaNotificationChange(first, { type: "window", key: account.windows[0].key, enabled: false }),
    ]) expect(run(fixture(90, 1), store, 1).events).toEqual([]);
    const denied = run(fixture(90, 1), first, 1, false);
    expect(denied.events).toEqual([]);
    expect(run(fixture(91, 2), denied.store, 2).events).toEqual([]);
  });
  it("does not invent quota from invalid or conflicting values", () => {
    for (const value of [NaN, Infinity, -1, 101]) {
      const state = fixture();
      state.providers[0].usageWindows![0].used = value;
      expect(run(state).store.ledger).toEqual({});
    }
    const conflicting = fixture(80);
    conflicting.providers[0].usageWindows![0].remaining = 80;
    expect(run(conflicting).store.ledger).toEqual({});
    conflicting.providers[0].usageWindows![0].used = null;
    conflicting.providers[0].usageWindows![0].remaining = null;
    expect(run(conflicting).store.ledger).toEqual({});
  });
  it("ignores ambiguous duplicate or unknown windows", () => {
    const state = fixture();
    state.providers[0].usageWindows!.push({ ...state.providers[0].usageWindows![0] });
    expect(run(state).store.ledger).toEqual({});
    state.providers[0].usageWindows = [{ ...state.providers[0].usageWindows![0], kind: "unknown" }];
    expect(listQuotaNotificationAccounts(state)[0].windows).toEqual([]);
  });
  it("prunes removed accounts but retains a disabled window during temporary missing data", () => {
    const state = fixture();
    const account = listQuotaNotificationAccounts(state)[0];
    let store = applyQuotaNotificationChange(run().store, { type: "window", key: account.windows[0].key, enabled: false });
    const missing = fixture();
    missing.providers[0].usageWindows = [];
    store = run(missing, store).store;
    expect(store.preferences.disabledWindowKeys).toEqual([account.windows[0].key]);
    expect(run(fixture(90, 1), store, 1).events).toEqual([]);
    expect(run({ ...state, providers: [], providerSettings: [] }, store).store).toMatchObject({ ledger: {}, preferences: { disabledWindowKeys: [] } });
  });
  it("keeps different configured accounts isolated without refreshing them", () => {
    const state = fixture();
    const snapshot = state.providers[0], setting = state.providerSettings[0];
    state.providerAccounts = { "codex-personal-page": { activeAccountId: "a", accounts: ["a", "b"].map((id) => ({ id, label: id, createdAt: null, lastSuccessAt: null })), inactiveAccounts: { b: { snapshot: { ...snapshot, usageWindows: fixture(50).providers[0].usageWindows }, setting } } } };
    const first = run(state);
    expect(Object.keys(first.store.ledger)).toHaveLength(2);
    const newer = fixture(90, 1).providers[0];
    state.providerAccounts["codex-personal-page"]!.inactiveAccounts.b.snapshot = newer;
    const second = run(state, first.store, 1);
    expect(second.events).toHaveLength(1);
    expect(second.events[0].accountKey).toBe(JSON.stringify(["codex-personal-page", "b"]));
    state.providerAccounts["codex-personal-page"]!.accounts.pop();
    expect(Object.keys(run(state, second.store, 1).store.ledger)).toHaveLength(1);
  });
  it("normalizes malformed persisted data and restarts baselines after threshold edits", () => {
    const store = normalizeQuotaNotificationStore({ schemaVersion: 1, preferences: { enabled: "true", thresholdPercent: Infinity }, ledger: { "[bad]": { capturedAt: "secret", usedPercent: 30 } } }, 75);
    expect(store).toMatchObject({ preferences: { enabled: false, thresholdPercent: 75 }, ledger: {} });
    const changed = applyQuotaNotificationChange(run().store, { type: "threshold", value: 20 });
    expect(run(fixture(30, 1), changed, 1).events).toEqual([]);
  });
});
