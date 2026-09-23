import { afterEach, describe, expect, it, vi } from "vitest";

import { sendAppMessage } from "./app-client";
import type { AppMessageResponse } from "./app-message-types";
import { createRuntimeI18n } from "./i18n";

const handleAppMessageMock = vi.hoisted(() => vi.fn());

vi.mock("../background/message-bus", () => ({
  handleAppMessage: handleAppMessageMock,
}));

describe("app client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    handleAppMessageMock.mockReset();
  });

  it("prefers extension runtime messaging", async () => {
    const response: AppMessageResponse = { ok: false, error: "runtime" };
    const sendMessage = vi.fn(async () => response);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        sendMessage,
      },
    });

    await expect(sendAppMessage({ type: "app:read-state" })).resolves.toBe(
      response,
    );

    expect(sendMessage).toHaveBeenCalledWith({ type: "app:read-state" });
    expect(handleAppMessageMock).not.toHaveBeenCalled();
  });

  it("fails closed without replaying a mutation when extension messaging fails", async () => {
    const sendMessage = vi.fn(async () => {
      throw new Error("sendMessage unavailable");
    });

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        sendMessage,
      },
    });

    const message = { type: "app:update-settings", settings: { warningThresholdPercent: 60 } } as const;
    await expect(sendAppMessage(message)).resolves.toEqual({
      ok: false, error: createRuntimeI18n("system").t("app.error.detail_fallback"),
    });

    expect(sendMessage).toHaveBeenCalledWith(message);
    expect(handleAppMessageMock).not.toHaveBeenCalled();
  });

  it("does not start a second writer when an extension context is invalidated", async () => {
    vi.stubGlobal("location", { protocol: "moz-extension:" });
    vi.stubGlobal("chrome", {});
    vi.stubGlobal("document", { documentElement: { lang: "ar" } });
    await expect(sendAppMessage({ type: "app:read-state" })).resolves.toEqual({
      ok: false, error: createRuntimeI18n("ar").t("app.error.detail_fallback"),
    });
    expect(handleAppMessageMock).not.toHaveBeenCalled();
  });

  it("reports a missing service-worker response without local replay", async () => {
    vi.stubGlobal("chrome", { runtime: { id: "extension-id", sendMessage: async () => undefined } });
    await expect(sendAppMessage({ type: "app:read-state" })).resolves.toMatchObject({ ok: false });
    expect(handleAppMessageMock).not.toHaveBeenCalled();
  });

  it("uses local message handling for non-extension preview runtime", async () => {
    const response: AppMessageResponse = { ok: false, error: "fallback" };

    handleAppMessageMock.mockResolvedValue(response);

    await expect(sendAppMessage({ type: "app:read-state" })).resolves.toBe(
      response,
    );

    expect(handleAppMessageMock).toHaveBeenCalledWith({
      type: "app:read-state",
    });
  });
});
