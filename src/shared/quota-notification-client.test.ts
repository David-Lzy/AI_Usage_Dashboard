import { afterEach, describe, expect, it, vi } from "vitest";
import { readQuotaNotificationSettings, requestQuotaNotificationPermission, sendQuotaNotificationTest, subscribeToQuotaNotificationSettings, updateQuotaNotificationSettings } from "./quota-notification-client";
import { QUOTA_NOTIFICATION_STORAGE_KEY } from "./quota-notifications";

afterEach(() => vi.unstubAllGlobals());
describe("notification user-gesture client", () => {
  it("requests only optional notifications and calls the browser before yielding", async () => {
    const request = vi.fn(async () => true);
    vi.stubGlobal("chrome", { runtime: { id: "qa" }, permissions: { request } });
    const pending = requestQuotaNotificationPermission();
    expect(request).toHaveBeenCalledWith({ permissions: ["notifications"] });
    expect(await pending).toBe(true);
  });
  it("handles Firefox Promise APIs, refusal and missing APIs without enabling", async () => {
    const request = vi.fn(async () => false);
    vi.stubGlobal("browser", { runtime: { id: "qa" }, permissions: { request } });
    expect(await requestQuotaNotificationPermission()).toBe(false);
    request.mockRejectedValueOnce(new Error("denied"));
    expect(await requestQuotaNotificationPermission()).toBe(false);
    vi.unstubAllGlobals();
    expect(await requestQuotaNotificationPermission()).toBe(false);
    expect((await readQuotaNotificationSettings()).permission).toBe("unsupported");
    expect(await sendQuotaNotificationTest()).toBe(false);
  });
  it("uses typed background commands and never prompts on read or edit", async () => {
    const request = vi.fn();
    const sendMessage = vi.fn(async () => ({ ok: true, view: { permission: "granted" }, tested: true }));
    vi.stubGlobal("chrome", { runtime: { id: "qa", sendMessage }, permissions: { request } });
    await readQuotaNotificationSettings();
    await updateQuotaNotificationSettings({ type: "paused", value: true });
    expect(await sendQuotaNotificationTest()).toBe(true);
    expect(sendMessage.mock.calls).toEqual([[{ type: "quota-notifications:read" }], [{ type: "quota-notifications:update", change: { type: "paused", value: true } }], [{ type: "quota-notifications:test" }]]);
    expect(request).not.toHaveBeenCalled();
    sendMessage.mockResolvedValueOnce({ ok: false } as never);
    await expect(readQuotaNotificationSettings()).rejects.toThrow("unavailable");
  });
  it("subscribes only to its local settings key and removes the listener", () => {
    const addListener = vi.fn(), removeListener = vi.fn(), changed = vi.fn();
    vi.stubGlobal("chrome", { storage: { onChanged: { addListener, removeListener } } });
    const remove = subscribeToQuotaNotificationSettings(changed);
    const listener = addListener.mock.calls[0][0];
    listener({ [QUOTA_NOTIFICATION_STORAGE_KEY]: { newValue: { preferences: { enabled: true } } } }, "sync");
    listener({ unrelated: {} }, "local");
    listener({ [QUOTA_NOTIFICATION_STORAGE_KEY]: { newValue: { preferences: { enabled: true } } } }, "local");
    listener({ [QUOTA_NOTIFICATION_STORAGE_KEY]: { oldValue: { preferences: { enabled: true }, ledger: {} }, newValue: { preferences: { enabled: true }, ledger: { changed: true } } } }, "local");
    expect(changed).toHaveBeenCalledTimes(1);
    remove();
    expect(removeListener).toHaveBeenCalledWith(listener);
  });
});
