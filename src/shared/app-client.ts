import type {
  AppMessage,
  AppMessageResponse,
} from "./app-message-types";

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
      return handleAppMessageFallback(message);
    }
  }

  return handleAppMessageFallback(message);
}

async function handleAppMessageFallback(
  message: AppMessage,
): Promise<AppMessageResponse> {
  const { handleAppMessage } = await import("../background/message-bus");

  return handleAppMessage(message);
}
