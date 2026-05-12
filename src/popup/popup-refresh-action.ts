import type { AppState, ProviderSetting } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  findHostAccessRefreshCandidate,
  hasDirectHostAccessRequest,
  requestHostAccessForProvider,
} from "../shared/host-access-request";

export type PopupRefreshActionResult =
  | { status: "ready"; state: AppState }
  | { status: "error"; message: string };

type PopupRefreshActionDeps = {
  hasDirectHostAccess?: typeof hasDirectHostAccessRequest;
  requestHostAccess?: typeof requestHostAccessForProvider;
  sendMessage?: typeof sendAppMessage;
};

function buildHostAccessDeniedMessage(provider: ProviderSetting): string {
  return `${provider.label} access was not granted. Reopen the popup and refresh again after granting host access.`;
}

export async function runPopupRefreshAction(
  appState: AppState | null | undefined,
  {
    hasDirectHostAccess = hasDirectHostAccessRequest,
    requestHostAccess = requestHostAccessForProvider,
    sendMessage = sendAppMessage,
  }: PopupRefreshActionDeps = {},
): Promise<PopupRefreshActionResult> {
  const hostAccessCandidate = appState
    ? findHostAccessRefreshCandidate(appState)
    : null;

  if (hostAccessCandidate && hasDirectHostAccess()) {
    try {
      const granted = await requestHostAccess(hostAccessCandidate);

      if (!granted) {
        return {
          status: "error",
          message: buildHostAccessDeniedMessage(hostAccessCandidate),
        };
      }
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The browser rejected the host access request.",
      };
    }
  }

  const response = await sendMessage({ type: "app:request-refresh" });

  if (!response.ok) {
    return {
      status: "error",
      message: response.error,
    };
  }

  return {
    status: "ready",
    state: response.state,
  };
}
