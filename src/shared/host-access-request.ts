import type { AppState, ProviderId, ProviderSetting } from "../providers/types";
import { getExtensionPermissionsApi } from "./extension-api";

export function hasDirectHostAccessRequest(): boolean {
  return typeof getExtensionPermissionsApi()?.request === "function";
}

function canRequestHostAccess(provider: ProviderSetting): boolean {
  return provider.hostOrigins.length > 0 && provider.status === "missing";
}

export function findHostAccessRefreshCandidate(
  state: AppState,
  providerId?: ProviderId,
): ProviderSetting | null {
  if (providerId) {
    const provider =
      state.providerSettings.find((setting) => setting.id === providerId) ??
      null;

    return provider && canRequestHostAccess(provider) ? provider : null;
  }

  const candidates = state.providerSettings.filter(
    (provider) => provider.displayEnabled && canRequestHostAccess(provider),
  );

  return candidates.length === 1 ? candidates[0] : null;
}

export async function requestHostAccessForProvider(
  provider: ProviderSetting,
): Promise<boolean> {
  const permissionsApi = getExtensionPermissionsApi();

  if (typeof permissionsApi?.request !== "function") {
    return false;
  }

  return permissionsApi.request({
    origins: provider.hostOrigins,
  });
}
