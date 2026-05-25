import { afterEach, describe, expect, it, vi } from "vitest";

import { sendAppMessage } from "./app-client";
import type { AppMessageResponse } from "../background/message-bus";

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

  it("falls back to local message handling when extension messaging fails", async () => {
    const response: AppMessageResponse = { ok: false, error: "fallback" };
    const sendMessage = vi.fn(async () => {
      throw new Error("sendMessage unavailable");
    });

    handleAppMessageMock.mockResolvedValue(response);
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
    expect(handleAppMessageMock).toHaveBeenCalledWith({
      type: "app:read-state",
    });
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
