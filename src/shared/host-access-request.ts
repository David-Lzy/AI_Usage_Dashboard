import type { AppState, ProviderId, ProviderSetting } from "../providers/types";

export function hasDirectHostAccessRequest(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.permissions?.request === "function"
  );
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
    (provider) => provider.enabled && canRequestHostAccess(provider),
  );

  return candidates.length === 1 ? candidates[0] : null;
}

export async function requestHostAccessForProvider(
  provider: ProviderSetting,
): Promise<boolean> {
  if (!hasDirectHostAccessRequest()) {
    return false;
  }

  return chrome.permissions.request({
    origins: provider.hostOrigins,
  });
}
