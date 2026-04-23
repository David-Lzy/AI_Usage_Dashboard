import type {
  AppState,
  CredentialStatus,
  PermissionStatus,
  ProviderSetting,
} from "../providers/types";
import { APP_STATE_STORAGE_KEY, SAMPLE_APP_STATE } from "./constants";
import { normalizePageBinding } from "./page-bindings";
import { normalizeSourcePreference } from "./provider-sources";
import {
  normalizeThemeCustomSeedHex,
  normalizeThemeMode,
  normalizeThemePreset,
} from "./theme";

let memoryFallbackState: AppState | null = null;

function cloneAppState(state: AppState): AppState {
  return structuredClone(state);
}

function normalizeCredentialStatus(
  value: unknown,
  fallback: CredentialStatus,
): CredentialStatus {
  return value === "configured" || value === "missing" || value === "not_required"
    ? value
    : fallback;
}

function normalizePermissionStatus(
  value: unknown,
  fallback: PermissionStatus,
): PermissionStatus {
  return value === "granted" || value === "missing" ? value : fallback;
}

function normalizeProviderSetting(
  sampleProviderSetting: ProviderSetting,
  storedProviderSetting?: Partial<ProviderSetting>,
): ProviderSetting {
  return {
    id: sampleProviderSetting.id,
    label: sampleProviderSetting.label,
    enabled:
      typeof storedProviderSetting?.enabled === "boolean"
        ? storedProviderSetting.enabled
        : sampleProviderSetting.enabled,
    status: normalizePermissionStatus(
      storedProviderSetting?.status,
      sampleProviderSetting.status,
    ),
    credentialStatus: normalizeCredentialStatus(
      storedProviderSetting?.credentialStatus,
      sampleProviderSetting.credentialStatus,
    ),
    pageBinding: normalizePageBinding(
      storedProviderSetting?.pageBinding,
      sampleProviderSetting.pageBinding.mode,
    ),
    sourcePreference: normalizeSourcePreference(
      sampleProviderSetting.id,
      storedProviderSetting?.sourcePreference,
    ),
    hostsLabel: sampleProviderSetting.hostsLabel,
    hostOrigins: sampleProviderSetting.hostOrigins,
    description: sampleProviderSetting.description,
  };
}

function normalizeAppState(state: AppState): AppState {
  const sampleProviders = new Map(
    SAMPLE_APP_STATE.providers.map((provider) => [provider.providerId, provider]),
  );
  const sampleProviderSettings = new Map(
    SAMPLE_APP_STATE.providerSettings.map((provider) => [provider.id, provider]),
  );
  const storedProviders = new Map(
    state.providers.map((provider) => [provider.providerId, provider]),
  );
  const storedProviderSettings = new Map(
    state.providerSettings.map((provider) => [provider.id, provider]),
  );

  const providers = SAMPLE_APP_STATE.providers.map((sampleProvider) => ({
    ...sampleProvider,
    ...storedProviders.get(sampleProvider.providerId),
  }));

  const providerSettings = SAMPLE_APP_STATE.providerSettings.map(
    (sampleProviderSetting) => {
      const storedProviderSetting = storedProviderSettings.get(
        sampleProviderSetting.id,
      );

      return normalizeProviderSetting(sampleProviderSetting, storedProviderSetting);
    },
  );

  const extraProviders = state.providers.filter(
    (provider) => !sampleProviders.has(provider.providerId),
  );
  const extraProviderSettings = state.providerSettings
    .filter((provider) => !sampleProviderSettings.has(provider.id))
    .map((provider) =>
      normalizeProviderSetting({
        ...provider,
        hostOrigins: Array.isArray(provider.hostOrigins) ? provider.hostOrigins : [],
        credentialStatus: normalizeCredentialStatus(
          provider.credentialStatus,
          "not_required",
        ),
      }),
    );

  return {
    providers: [...providers, ...extraProviders],
    providerSettings: [...providerSettings, ...extraProviderSettings],
    settings: {
      ...SAMPLE_APP_STATE.settings,
      ...state.settings,
      themeMode: normalizeThemeMode(state.settings?.themeMode),
      themePreset: normalizeThemePreset(state.settings?.themePreset),
      themeCustomSeedHex: normalizeThemeCustomSeedHex(
        state.settings?.themeCustomSeedHex,
      ),
    },
  };
}

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.storage?.local !== "undefined";
}

function hasLocalStorage(): boolean {
  return (
    typeof globalThis.localStorage?.getItem === "function" &&
    typeof globalThis.localStorage?.setItem === "function" &&
    typeof globalThis.localStorage?.removeItem === "function"
  );
}

function readLocalStorageState(): AppState | null {
  try {
    const rawState = globalThis.localStorage.getItem(APP_STATE_STORAGE_KEY);

    if (!rawState) {
      return null;
    }

    return normalizeAppState(JSON.parse(rawState) as AppState);
  } catch {
    globalThis.localStorage.removeItem(APP_STATE_STORAGE_KEY);
    return null;
  }
}

function writeLocalStorageState(state: AppState) {
  globalThis.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
}

export async function readAppState(): Promise<AppState | null> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(APP_STATE_STORAGE_KEY);
    const rawState = stored[APP_STATE_STORAGE_KEY] as AppState | undefined;
    return rawState ? normalizeAppState(rawState) : null;
  }

  if (hasLocalStorage()) {
    return readLocalStorageState();
  }

  return memoryFallbackState ? normalizeAppState(cloneAppState(memoryFallbackState)) : null;
}

export async function writeAppState(state: AppState): Promise<AppState> {
  const clonedState = normalizeAppState(cloneAppState(state));

  if (hasChromeStorage()) {
    await chrome.storage.local.set({
      [APP_STATE_STORAGE_KEY]: clonedState,
    });
  } else if (hasLocalStorage()) {
    writeLocalStorageState(clonedState);
  } else {
    memoryFallbackState = clonedState;
  }

  return clonedState;
}

export async function clearAppState(): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(APP_STATE_STORAGE_KEY);
    return;
  }

  if (hasLocalStorage()) {
    globalThis.localStorage.removeItem(APP_STATE_STORAGE_KEY);
    return;
  }

  memoryFallbackState = null;
}

export async function seedAppStateIfEmpty(): Promise<AppState> {
  const existing = await readAppState();

  if (existing) {
    return existing;
  }

  return writeAppState(cloneAppState(SAMPLE_APP_STATE));
}

export async function updateAppState(
  updater: (state: AppState) => AppState,
): Promise<AppState> {
  const current = await seedAppStateIfEmpty();
  const next = updater(cloneAppState(current));
  return writeAppState(next);
}
