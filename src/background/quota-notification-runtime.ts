import { getProviderDefinition } from "../providers/provider-definitions";
import { getExtensionApiNamespace, getExtensionPermissionsApi, hasExtensionRuntime } from "../shared/extension-api";
import { createRuntimeI18n } from "../shared/i18n";
import { buildQuotaNotificationLocalizedCopy } from "../shared/quota-notification-localized-copy";
import { QUOTA_NOTIFICATION_STORAGE_KEY } from "../shared/quota-notifications";
import { readAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import { createQuotaNotificationController } from "./quota-notification-controller";

export async function quotaNotificationPermission(): Promise<"granted" | "denied" | "unsupported"> {
  const api = getExtensionApiNamespace();
  if (!hasExtensionRuntime(api) || !getExtensionPermissionsApi()?.contains) return "unsupported";
  try {
    if (!await getExtensionPermissionsApi()!.contains!({ permissions: ["notifications"] })) return "denied";
    if (!api?.notifications?.create) return "unsupported";
    return api.notifications.getPermissionLevel ? await api.notifications.getPermissionLevel() : "granted";
  } catch { return "denied"; }
}

export const quotaNotificationController = createQuotaNotificationController({
  readState: readAppState,
  readStore: async () => typeof chrome !== "undefined" && chrome.storage?.local
    ? (await chrome.storage.local.get(QUOTA_NOTIFICATION_STORAGE_KEY))[QUOTA_NOTIFICATION_STORAGE_KEY] : undefined,
  writeStore: async (store) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) await chrome.storage.local.set({ [QUOTA_NOTIFICATION_STORAGE_KEY]: store });
  },
  permission: async () => await readStoreScreenshotRuntimeLock() ? "denied" : quotaNotificationPermission(),
  deliver: async (event, state) => {
    const api = getExtensionApiNamespace();
    if (!api?.notifications?.create || !api.runtime?.getURL) throw new Error("Notifications are unavailable.");
    const i18n = createRuntimeI18n(state.settings.locale);
    const copy = buildQuotaNotificationLocalizedCopy(i18n.resolvedLocale);
    const format = (value: string) => event.kind === "test" ? value : value
      .replaceAll("{provider}", getProviderDefinition(event.providerId).label)
      .replaceAll("{remaining}", new Intl.NumberFormat(i18n.resolvedLocale, { maximumFractionDigits: 1 }).format(event.remainingPercent));
    const title = format(event.kind === "test" ? copy.notifyTestTitle : event.kind === "low" ? copy.notifyLowTitle : copy.notifyResetTitle);
    const message = format(event.kind === "test" ? copy.notifyTestBody : event.kind === "low" ? copy.notifyLowBody : copy.notifyResetBody);
    await api.notifications.create(`ai-usage-dashboard-quota-${crypto.randomUUID()}`, {
      type: "basic", iconUrl: api.runtime.getURL("icons/icon128.png"), title, message,
    });
  },
});
