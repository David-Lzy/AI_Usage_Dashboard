import {
  handleAppMessage,
  type AppMessage,
  type AppMessageResponse,
} from "../background/message-bus";

function hasExtensionMessaging(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.runtime.sendMessage === "function"
  );
}

export async function sendAppMessage(
  message: AppMessage,
): Promise<AppMessageResponse> {
  if (hasExtensionMessaging()) {
    try {
      return (await chrome.runtime.sendMessage(message)) as AppMessageResponse;
    } catch {
      return handleAppMessage(message);
    }
  }

  return handleAppMessage(message);
}
