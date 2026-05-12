import { describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { runPopupRefreshAction } from "./popup-refresh-action";

function createOkSendMessage(state: AppState = SAMPLE_APP_STATE) {
  return vi.fn(async () => ({
    ok: true as const,
    state,
  }));
}

function createStateWithSingleHostAccessCandidate(): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
      provider.id === "codex"
        ? {
            ...provider,
            enabled: true,
            status: "missing",
          }
        : {
            ...provider,
            status: "granted",
          },
    ),
  };
}

describe("runPopupRefreshAction", () => {
  it("requests a refresh directly when no host-access candidate is available", async () => {
    const sendMessage = createOkSendMessage();

    await expect(
      runPopupRefreshAction(SAMPLE_APP_STATE, {
        hasDirectHostAccess: () => true,
        sendMessage,
      }),
    ).resolves.toEqual({
      status: "ready",
      state: SAMPLE_APP_STATE,
    });
    expect(sendMessage).toHaveBeenCalledWith({ type: "app:request-refresh" });
  });

  it("returns the existing denied-access message without refreshing", async () => {
    const sendMessage = createOkSendMessage();
    const state = createStateWithSingleHostAccessCandidate();

    await expect(
      runPopupRefreshAction(state, {
        hasDirectHostAccess: () => true,
        requestHostAccess: vi.fn(async () => false),
        sendMessage,
      }),
    ).resolves.toEqual({
      status: "error",
      message:
        "Codex access was not granted. Reopen the popup and refresh again after granting host access.",
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns the browser-rejection fallback when host-access request throws a non-error value", async () => {
    const sendMessage = createOkSendMessage();
    const state = createStateWithSingleHostAccessCandidate();

    await expect(
      runPopupRefreshAction(state, {
        hasDirectHostAccess: () => true,
        requestHostAccess: vi.fn(async () => {
          throw "denied";
        }),
        sendMessage,
      }),
    ).resolves.toEqual({
      status: "error",
      message: "The browser rejected the host access request.",
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns the original browser error when host-access request throws an Error", async () => {
    const sendMessage = createOkSendMessage();
    const state = createStateWithSingleHostAccessCandidate();

    await expect(
      runPopupRefreshAction(state, {
        hasDirectHostAccess: () => true,
        requestHostAccess: vi.fn(async () => {
          throw new Error("Permission prompt failed.");
        }),
        sendMessage,
      }),
    ).resolves.toEqual({
      status: "error",
      message: "Permission prompt failed.",
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("refreshes after host access is granted", async () => {
    const sendMessage = createOkSendMessage();
    const requestHostAccess = vi.fn(async () => true);
    const state = createStateWithSingleHostAccessCandidate();

    await expect(
      runPopupRefreshAction(state, {
        hasDirectHostAccess: () => true,
        requestHostAccess,
        sendMessage,
      }),
    ).resolves.toEqual({
      status: "ready",
      state: SAMPLE_APP_STATE,
    });
    expect(requestHostAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "codex",
      }),
    );
    expect(sendMessage).toHaveBeenCalledWith({ type: "app:request-refresh" });
  });
});
