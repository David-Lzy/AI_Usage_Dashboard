import type { AppState, ProviderId } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";

export type PopupHideProviderActionResult =
  | { status: "ready"; state: AppState }
  | { status: "error"; message: string };

type PopupHideProviderActionDeps = {
  sendMessage?: typeof sendAppMessage;
};

export async function runPopupHideProviderAction(
  providerId: ProviderId,
  {
    sendMessage = sendAppMessage,
  }: PopupHideProviderActionDeps = {},
): Promise<PopupHideProviderActionResult> {
  const response = await sendMessage({
    type: "app:set-provider-enabled",
    providerId,
    enabled: false,
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
