import type {
  AppState,
  CredentialStatus,
  PermissionStatus,
  ProviderSetting,
} from "../providers/types";
import { APP_STATE_STORAGE_KEY, SAMPLE_APP_STATE } from "./constants";
import { normalizePageBinding } from "./page-bindings";
import { normalizeSourcePreference } from "./provider-sources";
import { normalizeAppLocalePreference } from "./i18n";
import {
  normalizeThemeCustomSeedHex,
  normalizeThemeMode,
  normalizeThemePreset,
} from "./theme";
import { normalizeUiFontFamily } from "./ui-font-family";
import {
  DEFAULT_FULL_PAGE_PROGRESS_STYLE,
  DEFAULT_POPUP_PROGRESS_STYLE,
  DEFAULT_SIDEBAR_PROGRESS_STYLE,
  normalizeProgressDisplayStyle,
} from "./progress-display";
import {
  DEFAULT_POPUP_CORNER_STYLE,
  DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
  DEFAULT_POPUP_SHADOW_STYLE,
  DEFAULT_POPUP_SIZE_PRESET,
  normalizePopupCircularProgressItemsPerRow,
  normalizePopupCornerStyle,
  normalizePopupShadowStyle,
  normalizePopupSizePreset,
} from "./popup-appearance";
import {
  normalizeSyncIntervalMinutes,
  normalizeWarningThresholdPercent,
} from "./settings-preferences";
import { normalizeActionBadgeSelection } from "./action-badge-preferences";
import {
  normalizeToolbarIconCustomImageDataUrl,
  normalizeToolbarIconMode,
  normalizeToolbarIconProviderId,
} from "./toolbar-icon-preferences";
import {
  normalizeProgressItemsBySurface,
  normalizeProviderOrderBySurface,
} from "./display-preferences";
import {
  normalizeProgressColorBands,
  normalizeProgressThicknessPx,
} from "./progress-appearance";
import { buildProviderProgressItemIdsByProvider } from "./provider-progress-items";
import { normalizeSettingsUserLevel } from "./settings-user-level";

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
  const knownProviderIds = SAMPLE_APP_STATE.providerSettings.map(
    (provider) => provider.id,
  );
  const knownProgressItemIdsByProvider =
    buildProviderProgressItemIdsByProvider(providers);

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
      syncIntervalMinutes: normalizeSyncIntervalMinutes(
        state.settings?.syncIntervalMinutes,
      ),
      warningThresholdPercent: normalizeWarningThresholdPercent(
        state.settings?.warningThresholdPercent,
      ),
      locale: normalizeAppLocalePreference(state.settings?.locale),
      userLevel: normalizeSettingsUserLevel(state.settings?.userLevel),
      themeMode: normalizeThemeMode(state.settings?.themeMode),
      themePreset: normalizeThemePreset(state.settings?.themePreset),
      themeCustomSeedHex: normalizeThemeCustomSeedHex(
        state.settings?.themeCustomSeedHex,
      ),
      uiFontFamily: normalizeUiFontFamily(state.settings?.uiFontFamily),
      popupProgressStyle: normalizeProgressDisplayStyle(
        state.settings?.popupProgressStyle,
        DEFAULT_POPUP_PROGRESS_STYLE,
      ),
      sidebarProgressStyle: normalizeProgressDisplayStyle(
        state.settings?.sidebarProgressStyle,
        DEFAULT_SIDEBAR_PROGRESS_STYLE,
      ),
      fullPageProgressStyle: normalizeProgressDisplayStyle(
        state.settings?.fullPageProgressStyle,
        DEFAULT_FULL_PAGE_PROGRESS_STYLE,
      ),
      popupSizePreset: normalizePopupSizePreset(
        state.settings?.popupSizePreset,
        DEFAULT_POPUP_SIZE_PRESET,
      ),
      popupCornerStyle: normalizePopupCornerStyle(
        state.settings?.popupCornerStyle,
        DEFAULT_POPUP_CORNER_STYLE,
      ),
      popupShadowStyle: normalizePopupShadowStyle(
        state.settings?.popupShadowStyle,
        DEFAULT_POPUP_SHADOW_STYLE,
      ),
      popupCircularProgressItemsPerRow:
        normalizePopupCircularProgressItemsPerRow(
          state.settings?.popupCircularProgressItemsPerRow,
          DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
        ),
      actionBadgeSelection: normalizeActionBadgeSelection(
        state.settings?.actionBadgeSelection,
      ),
      toolbarIconMode: normalizeToolbarIconMode(
        state.settings?.toolbarIconMode,
      ),
      toolbarIconProviderId: normalizeToolbarIconProviderId(
        state.settings?.toolbarIconProviderId,
        knownProviderIds,
      ),
      toolbarIconCustomImageDataUrl: normalizeToolbarIconCustomImageDataUrl(
        state.settings?.toolbarIconCustomImageDataUrl,
      ),
      providerOrderBySurface: normalizeProviderOrderBySurface(
        state.settings?.providerOrderBySurface,
        knownProviderIds,
      ),
      progressItemsBySurface: normalizeProgressItemsBySurface(
        state.settings?.progressItemsBySurface,
        knownProviderIds,
        knownProgressItemIdsByProvider,
      ),
      progressThicknessPx: normalizeProgressThicknessPx(
        state.settings?.progressThicknessPx,
      ),
      progressColorBands: normalizeProgressColorBands(
        state.settings?.progressColorBands,
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
