import { afterEach, describe, expect, it, vi } from "vitest";
import { requestCommunityResetAccess, sendCommunityResetMessage } from "./community-reset-client";

afterEach(() => vi.unstubAllGlobals());
describe("community feed permission gestures", () => {
  it("requests only selected exact origins and optional desktop permission", async () => {
    const request = vi.fn(async () => true);
    vi.stubGlobal("chrome", { runtime: { id: "test" }, permissions: { request } });
    expect(await requestCommunityResetAccess(["codex-reset", "codex-reset"], true)).toBe(true);
    expect(request).toHaveBeenCalledWith({ origins: ["https://codex-reset.com/*"], permissions: ["notifications"] });
  });
  it("permission refusal is contained and localhost preview never polls real sources", async () => {
    vi.stubGlobal("chrome", { runtime: { id: "test" }, permissions: { request: async () => { throw new Error("denied"); } } });
    expect(await requestCommunityResetAccess(["codex-resets"])).toBe(false);
    vi.stubGlobal("chrome", undefined);
    expect((await sendCommunityResetMessage({ type: "community-resets:refresh" })).store.preferences.mode).toBe("off");
  });
});
