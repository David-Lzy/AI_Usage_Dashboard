import { describe, expect, it, vi } from "vitest";
import { createDefaultAppState } from "../shared/production-state";
import { applyQuotaNotificationChange, normalizeQuotaNotificationStore, type QuotaNotificationStore } from "../shared/quota-notifications";
import { createQuotaNotificationController } from "./quota-notification-controller";

function fixture() {
  const state = createDefaultAppState();
  const now = Date.parse("2026-09-22T12:00:00Z");
  const snapshot = state.providers.find((provider) => provider.providerId === "codex-personal-page")!;
  state.providerSettings.find((provider) => provider.id === snapshot.providerId)!.status = "granted";
  Object.assign(snapshot, { syncStatus: "ok", lastAttemptAt: new Date(now).toISOString(), lastSuccessAt: new Date(now).toISOString(), usageWindows: [{ kind: "weekly", label: "Weekly", normalizedLabel: "weekly", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: new Date(now + 3600_000).toISOString(), resetLabel: null }] });
  let stored: QuotaNotificationStore = applyQuotaNotificationChange(normalizeQuotaNotificationStore(undefined), { type: "enabled", value: true });
  let clock = now;
  let permission: "granted" | "denied" | "unsupported" = "granted";
  const deliver = vi.fn(async () => {});
  const writeStore = vi.fn(async (store: QuotaNotificationStore) => { stored = structuredClone(store); });
  const dependencies = { readState: async () => state, readStore: async () => structuredClone(stored), writeStore,
    permission: async () => permission, deliver, now: () => clock };
  return { state, snapshot, dependencies, deliver, writeStore, store: () => stored,
    setPermission: (value: typeof permission) => { permission = value; },
    advance: (used = 90) => {
      clock += 60_000;
      snapshot.lastAttemptAt = snapshot.lastSuccessAt = new Date(clock).toISOString();
      snapshot.usageWindows![0].used = used;
      snapshot.usageWindows![0].remaining = 100 - used;
    } };
}

describe("durable quota notification controller", () => {
  it("does not reread the full app state or probe the OS for the default-off feature", async () => {
    const test = fixture();
    const readState = vi.fn(test.dependencies.readState), permission = vi.fn(test.dependencies.permission);
    const controller = createQuotaNotificationController({ ...test.dependencies, readState, permission, readStore: async () => undefined });
    await controller.evaluate();
    expect(readState).not.toHaveBeenCalled();
    expect(permission).not.toHaveBeenCalled();
  });
  it("serializes concurrent captures and keeps at-most-once delivery after restart", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    await controller.evaluate();
    test.advance();
    await Promise.all([controller.evaluate(), controller.evaluate(), controller.evaluate()]);
    expect(test.deliver).toHaveBeenCalledTimes(1);
    expect(test.writeStore.mock.invocationCallOrder.at(-1)).toBeLessThan(test.deliver.mock.invocationCallOrder[0]);
    await createQuotaNotificationController(test.dependencies).evaluate();
    expect(test.deliver).toHaveBeenCalledTimes(1);
  });
  it("keeps the ledger even when the OS rejects delivery", async () => {
    const test = fixture();
    test.deliver.mockRejectedValue(new Error("synthetic OS rejection"));
    const controller = createQuotaNotificationController(test.dependencies);
    await controller.evaluate();
    test.advance();
    await controller.evaluate();
    await createQuotaNotificationController(test.dependencies).evaluate();
    expect(test.deliver).toHaveBeenCalledTimes(1);
  });
  it("does not deliver if durable persistence fails", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    await controller.evaluate();
    test.advance();
    test.writeStore.mockRejectedValueOnce(new Error("disk full"));
    await expect(controller.evaluate()).rejects.toThrow("disk full");
    expect(test.deliver).not.toHaveBeenCalled();
    await controller.evaluate();
    expect(test.deliver).toHaveBeenCalledTimes(1);
  });
  it("rejects enabling without permission and never requests permissions itself", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    test.setPermission("denied");
    expect(await controller.handle({ type: "quota-notifications:update", change: { type: "enabled", value: true } })).toEqual({ ok: false });
    expect(await controller.handle({ type: "quota-notifications:test" })).toMatchObject({ ok: true, tested: false });
    expect(test.deliver).not.toHaveBeenCalled();
  });
  it("merges concurrent settings edits and seeds current data without sending old crossings", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    await Promise.all([
      controller.handle({ type: "quota-notifications:update", change: { type: "threshold", value: 10 } }),
      controller.handle({ type: "quota-notifications:update", change: { type: "paused", value: true } }),
    ]);
    expect(test.store().preferences).toMatchObject({ thresholdPercent: 10, paused: true });
    expect(test.deliver).not.toHaveBeenCalled();
    await controller.handle({ type: "quota-notifications:update", change: { type: "paused", value: false } });
    await controller.evaluate();
    expect(test.deliver).not.toHaveBeenCalled();
  });
  it("tests only when enabled, allowed and unpaused, and reports OS failure", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    expect(await controller.handle({ type: "quota-notifications:test" })).toMatchObject({ tested: true });
    test.deliver.mockRejectedValueOnce(new Error("OS blocked"));
    expect(await controller.handle({ type: "quota-notifications:test" })).toMatchObject({ tested: false });
    await controller.handle({ type: "quota-notifications:update", change: { type: "paused", value: true } });
    expect(await controller.handle({ type: "quota-notifications:test" })).toMatchObject({ tested: false });
  });
  it("resets local preferences and event state without touching provider data", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    const before = structuredClone(test.state);
    await controller.evaluate();
    await controller.reset();
    expect(test.store()).toEqual(normalizeQuotaNotificationStore(undefined));
    expect(test.state).toEqual(before);
  });
  it("drops events when permission is revoked after persistence", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    await controller.evaluate();
    test.advance();
    test.dependencies.permission = vi.fn().mockResolvedValueOnce("granted").mockResolvedValue("denied");
    await controller.evaluate();
    expect(test.deliver).not.toHaveBeenCalled();
  });
  it("does not notify for an account removed while the event was being persisted", async () => {
    const test = fixture();
    const controller = createQuotaNotificationController(test.dependencies);
    await controller.evaluate();
    test.advance();
    test.writeStore.mockImplementationOnce(async () => { test.state.providers = []; });
    await controller.evaluate();
    expect(test.deliver).not.toHaveBeenCalled();
  });
});
