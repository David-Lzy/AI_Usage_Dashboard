import { describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { runPopupHideProviderAction } from "./popup-hide-provider-action";

describe("runPopupHideProviderAction", () => {
  it("disables the requested provider through the existing app message", async () => {
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state: SAMPLE_APP_STATE,
    }));

    await expect(
      runPopupHideProviderAction("gemini", { sendMessage }),
    ).resolves.toEqual({
      status: "ready",
      state: SAMPLE_APP_STATE,
    });
    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:set-provider-enabled",
      providerId: "gemini",
      enabled: false,
    });
  });

  it("returns message-bus errors without inventing fallback copy", async () => {
    const sendMessage = vi.fn(async () => ({
      ok: false as const,
      error: "Provider update failed.",
    }));

    await expect(
      runPopupHideProviderAction("gemini", { sendMessage }),
    ).resolves.toEqual({
      status: "error",
      message: "Provider update failed.",
    });
  });
});
