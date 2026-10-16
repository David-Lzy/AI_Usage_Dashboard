import { describe, expect, it } from "vitest";
import { createDefaultAppState } from "./production-state";
import { applyQuotaNotificationChange, evaluateQuotaNotifications, listQuotaNotificationAccounts, normalizeQuotaNotificationStore } from "./quota-notifications";

const now = Date.parse("2026-10-13T06:00:00Z"), at = (minute: number) => new Date(now + minute * 60_000).toISOString();
function state(used = 20, minute = 0) {
  const next = createDefaultAppState();
  next.providers = next.providers.filter((provider) => provider.providerId === "cursor-personal-page");
  next.providerSettings = next.providerSettings.filter((provider) => provider.id === "cursor-personal-page");
  next.providerSettings[0].status = "granted";
  Object.assign(next.providers[0], { syncStatus: "ok", lastSuccessAt: at(minute), lastAttemptAt: at(minute), usageWindows: [], usageInsights: { quotaPools: [
    { source: "page", accountVerified: false, capturedAt: at(minute), id: "cursor_models", kind: "monthly", usedPercent: used, remainingPercent: 100 - used, resetAt: null },
    { source: "page", accountVerified: false, capturedAt: at(minute), id: "other_models", kind: "monthly", usedPercent: 30, remainingPercent: 70, resetAt: null },
  ] } });
  return next;
}
describe("stable notification pool identities", () => {
  it("baselines monthly pools and preserves independent opt-outs despite matching period labels", () => {
    const initial = state();
    const windows = listQuotaNotificationAccounts(initial)[0].windows;
    expect(windows).toHaveLength(2); expect(windows[0].key).not.toBe(windows[1].key);
    expect(windows.every((window) => window.kind === "monthly")).toBe(true);
    const enabled = applyQuotaNotificationChange(normalizeQuotaNotificationStore(undefined), { type: "enabled", value: true });
    const baseline = evaluateQuotaNotifications(initial, enabled, now).store;
    expect(evaluateQuotaNotifications(state(81, 1), baseline, now + 60_000).events).toMatchObject([{ kind: "low", windowKey: windows[0].key }]);
    const disabled = applyQuotaNotificationChange(enabled, { type: "window", key: windows[0].key, enabled: false });
    const quiet = evaluateQuotaNotifications(initial, disabled, now).store;
    expect(evaluateQuotaNotifications(state(81, 1), quiet, now + 60_000).events).toEqual([]);
  });
  it("never treats product composition or a replayed pool timestamp as new quota", () => {
    const enabled = applyQuotaNotificationChange(normalizeQuotaNotificationStore(undefined), { type: "enabled", value: true });
    const baseline = evaluateQuotaNotifications(state(), enabled, now).store;
    const replay = state(81, 1); replay.providers[0].usageInsights!.quotaPools![0].capturedAt = at(0);
    expect(evaluateQuotaNotifications(replay, baseline, now + 60_000).events).toEqual([]);
    replay.providers[0].usageInsights = { distribution: { source: "page", capturedAt: at(1), accountVerified: false, kind: "product", unit: "percent",
      rangeStart: null, rangeEnd: null, values: [{ id: "chat", label: "Chat", value: 99 }] } };
    expect(listQuotaNotificationAccounts(replay)[0].windows).toEqual([]);
    expect(evaluateQuotaNotifications(replay, baseline, now + 60_000).events).toEqual([]);
  });
});
