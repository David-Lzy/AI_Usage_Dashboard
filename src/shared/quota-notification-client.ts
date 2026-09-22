import { getExtensionApiNamespace, getExtensionPermissionsApi, hasExtensionRuntime } from "./extension-api";
import { createDefaultQuotaNotificationPreferences, QUOTA_NOTIFICATION_STORAGE_KEY, type QuotaNotificationChange, type QuotaNotificationPreferences } from "./quota-notifications";

export type QuotaNotificationView = {
  preferences: QuotaNotificationPreferences;
  permission: "granted" | "denied" | "unsupported";
};
export type QuotaNotificationMessage =
  | { type: "quota-notifications:read" }
  | { type: "quota-notifications:update"; change: QuotaNotificationChange }
  | { type: "quota-notifications:test" };
export type QuotaNotificationResponse = { ok: true; view: QuotaNotificationView; tested?: boolean } | { ok: false };

async function send(message: QuotaNotificationMessage): Promise<QuotaNotificationResponse> {
  const api = getExtensionApiNamespace();
  if (!hasExtensionRuntime(api) || !api?.runtime?.sendMessage) {
    return { ok: true, view: { preferences: createDefaultQuotaNotificationPreferences(), permission: "unsupported" }, tested: false };
  }
  const response = await api.runtime.sendMessage(message) as QuotaNotificationResponse;
  if (!response?.ok) throw new Error("Notification settings are unavailable.");
  return response;
}
export async function readQuotaNotificationSettings(): Promise<QuotaNotificationView> {
  const response = await send({ type: "quota-notifications:read" });
  if (!response.ok) throw new Error("Notification settings are unavailable.");
  return response.view;
}
export async function updateQuotaNotificationSettings(change: QuotaNotificationChange): Promise<QuotaNotificationView> {
  const response = await send({ type: "quota-notifications:update", change });
  if (!response.ok) throw new Error("Notification settings are unavailable.");
  return response.view;
}
export async function sendQuotaNotificationTest(): Promise<boolean> {
  const response = await send({ type: "quota-notifications:test" });
  return response.ok && response.tested === true;
}
/** Call directly from the enable gesture, before awaiting anything else. */
export async function requestQuotaNotificationPermission(): Promise<boolean> {
  try { return (await getExtensionPermissionsApi()?.request?.({ permissions: ["notifications"] })) === true; }
  catch { return false; }
}
export function subscribeToQuotaNotificationSettings(onChange: () => void): () => void {
  const changes = typeof chrome !== "undefined" ? chrome.storage?.onChanged : undefined;
  const preferences = (value: unknown) => value && typeof value === "object" && "preferences" in value ? value.preferences : undefined;
  const listener = (values: Record<string, chrome.storage.StorageChange>, area: string) => {
    const change = values[QUOTA_NOTIFICATION_STORAGE_KEY];
    if (area === "local" && change && JSON.stringify(preferences(change.oldValue)) !== JSON.stringify(preferences(change.newValue))) onChange();
  };
  changes?.addListener(listener);
  const permissions = getExtensionPermissionsApi();
  permissions?.onAdded?.addListener(onChange);
  permissions?.onRemoved?.addListener(onChange);
  return () => {
    changes?.removeListener(listener);
    permissions?.onAdded?.removeListener(onChange);
    permissions?.onRemoved?.removeListener(onChange);
  };
}
