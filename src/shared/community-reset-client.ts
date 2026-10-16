import { getExtensionApiNamespace, getExtensionPermissionsApi, hasExtensionRuntime } from "./extension-api";
import {
  COMMUNITY_RESET_CONFIG, COMMUNITY_RESET_STORAGE_KEY, normalizeCommunityResetStore,
  type CommunityResetPreferences, type CommunityResetSource, type CommunityResetStore,
} from "./community-reset-feeds";

export type CommunityResetView = { store: CommunityResetStore; access: Partial<Record<CommunityResetSource, boolean>> };
export type CommunityResetMessage =
  | { type: "community-resets:read" | "community-resets:refresh" }
  | { type: "community-resets:update"; preferences: CommunityResetPreferences; expectedRevision?: number };
export type CommunityResetResponse = { ok: true; view: CommunityResetView } | { ok: false };
export async function sendCommunityResetMessage(message: CommunityResetMessage): Promise<CommunityResetView> {
  const api = getExtensionApiNamespace();
  if (!hasExtensionRuntime(api) || !api?.runtime?.sendMessage) return { store: normalizeCommunityResetStore(undefined), access: {} };
  const result = await api.runtime.sendMessage(message) as CommunityResetResponse;
  if (!result?.ok) throw new Error("Community reset settings are unavailable.");
  return { store: normalizeCommunityResetStore(result.view.store), access: result.view.access };
}
/** Invoke synchronously from a user gesture; never from background polling. */
export async function requestCommunityResetAccess(sources: CommunityResetSource[], desktop = false): Promise<boolean> {
  try {
    return await getExtensionPermissionsApi()?.request?.({
      origins: [...new Set(sources)].filter((source) => Object.hasOwn(COMMUNITY_RESET_CONFIG, source)).map((source) => COMMUNITY_RESET_CONFIG[source].origin),
      ...(desktop ? { permissions: ["notifications"] } : {}),
    }) === true;
  } catch { return false; }
}
export function subscribeToCommunityResetChanges(listener: () => void): () => void {
  const changes = typeof chrome !== "undefined" ? chrome.storage?.onChanged : undefined;
  const callback = (values: Record<string, chrome.storage.StorageChange>, area: string) => { if (area === "local" && values[COMMUNITY_RESET_STORAGE_KEY]) listener(); };
  changes?.addListener(callback);
  return () => changes?.removeListener(callback);
}
