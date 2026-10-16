import { afterEach, describe, expect, it, vi } from "vitest";
import { requestResetNotificationPermission, sendResetNotificationMessage } from "./reset-notification-client";

afterEach(() => vi.unstubAllGlobals());
describe("explicit reset notification gestures", () => {
  it("requests only notifications and handles rejection without a fallback request", async () => {
    const request = vi.fn(async () => false);
    vi.stubGlobal("chrome", { runtime: { id: "test" }, permissions: { request } });
    expect(await requestResetNotificationPermission()).toBe(false);
    expect(request).toHaveBeenCalledOnce(); expect(request).toHaveBeenCalledWith({ permissions: ["notifications"] });
  });
  it("localhost stays unsupported/default-off and never creates a system notification", async () => {
    vi.stubGlobal("chrome", undefined);
    expect(await sendResetNotificationMessage({ type: "reset-notifications:test", group: "account" })).toMatchObject({ ok: true, tested: false,
      view: { permission: "unsupported", accountEligible: false, preferences: { grantAccountKeys: [] } } });
  });
});
