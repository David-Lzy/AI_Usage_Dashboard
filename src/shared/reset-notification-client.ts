import { getExtensionApiNamespace, getExtensionPermissionsApi, hasExtensionRuntime } from "./extension-api";
import { RESET_NOTIFICATION_STORAGE_KEY, normalizeResetNotificationStore, type ResetNotificationChange, type ResetNotificationPreferences } from "./reset-notifications";

export type ResetNotificationView = { preferences: ResetNotificationPreferences; permission: "granted" | "denied" | "unsupported"; accountEligible: boolean };
export type ResetNotificationMessage =
  | { type: "reset-notifications:read" }
  | { type: "reset-notifications:update"; change: ResetNotificationChange }
  | { type: "reset-notifications:test"; group: "community" | "account" };
export type ResetNotificationResponse = { ok: true; view: ResetNotificationView; tested?: boolean } | { ok: false };
export async function sendResetNotificationMessage(message: ResetNotificationMessage): Promise<ResetNotificationResponse> {
  const api = getExtensionApiNamespace();
  if (!hasExtensionRuntime(api) || !api?.runtime?.sendMessage) return { ok: true,
    view: { preferences: normalizeResetNotificationStore(undefined).preferences, permission: "unsupported", accountEligible: false }, tested: false };
  const result = await api.runtime.sendMessage(message) as ResetNotificationResponse;
  if (!result?.ok) throw new Error("Reset notification settings are unavailable.");
  return result;
}
export async function requestResetNotificationPermission(): Promise<boolean> {
  try { return await getExtensionPermissionsApi()?.request?.({ permissions: ["notifications"] }) === true; }
  catch { return false; }
}
export function subscribeToResetNotificationChanges(listener: () => void): () => void {
  const changes = typeof chrome !== "undefined" ? chrome.storage?.onChanged : undefined;
  const callback = (values: Record<string, chrome.storage.StorageChange>, area: string) => { if (area === "local" && values[RESET_NOTIFICATION_STORAGE_KEY]) listener(); };
  changes?.addListener(callback);
  const permissions = getExtensionPermissionsApi();
  permissions?.onAdded?.addListener(listener); permissions?.onRemoved?.addListener(listener);
  return () => { changes?.removeListener(callback); permissions?.onAdded?.removeListener(listener); permissions?.onRemoved?.removeListener(listener); };
}
