import { describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../shared/constants";
import { emptyCommunityResetCache, normalizeCommunityResetStore, parseCommunityResetPayload } from "../shared/community-reset-feeds";
import { normalizeResetNotificationStore, type ResetNotificationStore } from "../shared/reset-notifications";
import { createResetNotificationController } from "./reset-notification-controller";

const time = Date.parse("2026-10-13T06:00:00Z"), at = new Date(time).toISOString();
function setup() {
  let store = normalizeResetNotificationStore(undefined), now = time;
  const feed = normalizeCommunityResetStore(undefined); feed.preferences = { mode: "desktop", sources: ["codex-resets"] };
  const readState = vi.fn(async () => DEFAULT_APP_STATE);
  const readFeed = vi.fn(async () => feed);
  const deliver = vi.fn(async () => undefined), openTarget = vi.fn(async () => undefined);
  const permission = vi.fn(async (): Promise<"granted" | "denied" | "unsupported"> => "granted");
  const writeStore = vi.fn(async (next: ResetNotificationStore) => { store = next; });
  const deps = { readState, readFeed, deliver, openTarget, permission, writeStore, readStore: async () => store,
    readCapture: async () => null, sourceAccess: async () => true, suppressed: async () => false,
    now: () => now, id: () => "ai-usage-reset-00000000-0000-4000-8000-000000000001" };
  function event(id: string, state: "scheduled" | "reported" = "reported") {
    const row = { id, reset_type: "regular", announced_at: at, text: "Synthetic", source: { type: "x_post", author: "thsottiaux", url: `https://x.com/thsottiaux/status/${id}` },
      ...(state === "scheduled" ? { status: "scheduled", scheduled_for: at } : {}) };
    feed.caches.status = { ...emptyCommunityResetCache(), capturedAt: at, checkedAt: at, expiresAt: new Date(time + 3600_000).toISOString(),
      fragment: parseCommunityResetPayload("status", { meta: { api_version: "v1", generated_at: at }, data: { latest_reset: state === "reported" ? row : null,
        scheduled_reset: state === "scheduled" ? row : null, active_watch: null } }) };
  }
  return { deps, controller: createResetNotificationController(deps), event, read: () => store, setNow: (value: number) => { now = value; } };
}
describe("durable reset notification controller", () => {
  it("persists eligibility and validated click route before best-effort delivery and never replays failures", async () => {
    const { controller, deps, event, read } = setup();
    event("2100000000000000001", "scheduled"); await controller.evaluate();
    event("2100000000000000001");
    deps.deliver.mockImplementation(async () => {
      expect(Object.values(read().community.seen).every((entry) => entry.notified)).toBe(true);
      expect(Object.values(read().clicks)[0].target).toEqual({ kind: "community", source: "codex-resets" });
      throw new Error("OS unavailable");
    });
    await Promise.all([controller.evaluate(), controller.evaluate()]);
    expect(deps.deliver).toHaveBeenCalledTimes(1);
    await createResetNotificationController(deps).evaluate();
    expect(deps.deliver).toHaveBeenCalledTimes(1);
    expect(await controller.click("unknown")).toBe(false);
    expect(await controller.click(deps.id())).toBe(true);
    expect(deps.openTarget).toHaveBeenCalledWith({ kind: "community", source: "codex-resets" }, DEFAULT_APP_STATE);
    expect(await controller.click(deps.id())).toBe(false);
  });
  it("rechecks permission and generation between evaluation and delivery", async () => {
    const { controller, deps, event } = setup();
    event("2100000000000000001", "scheduled"); await controller.evaluate();
    event("2100000000000000001");
    deps.permission.mockResolvedValueOnce("granted").mockResolvedValue("denied");
    await controller.evaluate(); expect(deps.deliver).not.toHaveBeenCalled();
  });
  it("source changes and pause during an evaluation cancel pending notifications", async () => {
    const { controller, deps, event } = setup();
    event("2100000000000000001", "scheduled"); await controller.evaluate();
    event("2100000000000000001");
    const original = deps.writeStore.getMockImplementation()!;
    deps.writeStore.mockImplementationOnce(async (next) => {
      await original(next); controller.invalidate();
    });
    await controller.evaluate(); expect(deps.deliver).not.toHaveBeenCalled();
  });
  it("permission rejection and denied/paused test actions are truthful and do not notify", async () => {
    const { controller, deps } = setup();
    deps.permission.mockResolvedValue("denied");
    expect(await controller.handle({ type: "reset-notifications:update", change: { type: "account-grants", accountKey: '["codex-personal-page","default"]', value: true } })).toEqual({ ok: false });
    expect(await controller.handle({ type: "reset-notifications:test", group: "community" })).toMatchObject({ ok: true, tested: false });
    deps.permission.mockResolvedValue("granted");
    await controller.handle({ type: "reset-notifications:update", change: { type: "community-paused", value: true } });
    expect(await controller.handle({ type: "reset-notifications:test", group: "community" })).toMatchObject({ ok: true, tested: false });
    expect(deps.deliver).not.toHaveBeenCalled();
  });
  it("surfaces preference persistence failure without delivery", async () => {
    const { controller, deps } = setup();
    deps.writeStore.mockRejectedValueOnce(new Error("storage"));
    await expect(controller.handle({ type: "reset-notifications:update", change: { type: "community-paused", value: true } })).rejects.toThrow("storage");
    expect(deps.deliver).not.toHaveBeenCalled();
  });
  it("routes legacy account notifications without altering new subscriptions", async () => {
    const { controller, deps, read } = setup();
    const id = "ai-usage-dashboard-quota-00000000-0000-4000-8000-000000000001";
    await controller.registerClick(id, { kind: "account", providerId: "claude-code-team-page", accountKey: '["claude-code-team-page","default"]' });
    expect(read().preferences.grantAccountKeys).toEqual([]);
    expect(await controller.click(id)).toBe(true);
    expect(deps.openTarget).toHaveBeenCalledWith({ kind: "account", providerId: "claude-code-team-page", accountKey: '["claude-code-team-page","default"]' }, DEFAULT_APP_STATE);
  });
});
