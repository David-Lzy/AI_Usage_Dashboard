import type {
  AppMessage,
  AppMessageResponse,
} from "./app-message-types";
import { createRuntimeI18n, normalizeAppLocalePreference } from "./i18n";

function isExtensionRuntime(): boolean {
  return (
    (typeof chrome !== "undefined" && Boolean(chrome.runtime?.id) &&
      typeof chrome.runtime.sendMessage === "function") ||
    (typeof location !== "undefined" &&
      ["chrome-extension:", "moz-extension:"].includes(location.protocol))
  );
}

function backgroundUnavailable(): AppMessageResponse {
  const locale = typeof document === "undefined" ? "system" : document.documentElement.lang;
  return { ok: false, error: createRuntimeI18n(normalizeAppLocalePreference(locale)).t("app.error.detail_fallback") };
}

export async function sendAppMessage(
  message: AppMessage,
): Promise<AppMessageResponse> {
  if (isExtensionRuntime()) {
    try {
      const response = await chrome.runtime.sendMessage(message) as AppMessageResponse | undefined;
      return response && typeof response.ok === "boolean" ? response : backgroundUnavailable();
    } catch {
      // Extension writes belong to the service worker's serialized queue. A
      // failed transport must not create a second background runtime in this UI.
      return backgroundUnavailable();
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
