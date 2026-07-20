import type { AppState, ProviderSetting } from "../providers/types";
import { getProviderDefinition } from "../providers/provider-definitions";
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
  return `${getProviderDefinition(provider.id).shortLabel} access was not granted. Reopen the popup and refresh again after granting host access.`;
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
  let grantedProviderId: ProviderSetting["id"] | undefined;

  if (hostAccessCandidate && hasDirectHostAccess()) {
    try {
      const granted = await requestHostAccess(hostAccessCandidate);

      if (!granted) {
        return {
          status: "error",
          message: buildHostAccessDeniedMessage(hostAccessCandidate),
        };
      }

      grantedProviderId = hostAccessCandidate.id;
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

  const response = await sendMessage({
    type: "app:request-refresh",
    ...(grantedProviderId ? { providerId: grantedProviderId } : {}),
  });

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
