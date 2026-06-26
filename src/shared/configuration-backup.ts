import type {
  AppSettings,
  AppState,
  LegacyProviderId,
  ProviderId,
  ProviderSetting,
  ProviderSourcePreference,
} from "../providers/types";
import { normalizeProviderId } from "../providers/provider-definitions";
import { normalizeSourcePreference } from "./provider-sources";
import {
  normalizeCustomSourceSettings,
  type CustomSourceSetting,
} from "./custom-sources";

export const CONFIGURATION_BACKUP_FORMAT =
  "ai-usage-dashboard.configuration";
export const CONFIGURATION_BACKUP_SCHEMA_VERSION = 1;
export const CONFIGURATION_SYNC_MANIFEST_KEY =
  "aiUsageDashboard.configurationSync.manifest.v1";
export const CONFIGURATION_SYNC_CHUNK_PREFIX =
  "aiUsageDashboard.configurationSync.chunk.v1.";

const CONFIGURATION_SYNC_CHUNK_SIZE = 7000;
const CONFIGURATION_SYNC_MAX_CHUNKS = 12;

export type ConfigurationBackupProviderSetting = Pick<
  ProviderSetting,
  "id" | "displayEnabled" | "sourcePreference"
> & {
  enabled?: boolean;
};

export type ConfigurationBackupCustomSourceSetting = Pick<
  CustomSourceSetting,
  | "id"
  | "label"
  | "endpointUrl"
  | "displayEnabled"
  | "refreshIntervalMinutes"
  | "createdAt"
  | "updatedAt"
> & {
  enabled?: boolean;
};

export type ConfigurationBackupDocument = {
  format: typeof CONFIGURATION_BACKUP_FORMAT;
  schemaVersion: typeof CONFIGURATION_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  payload: {
    settings: AppSettings;
    providerSettings: ConfigurationBackupProviderSetting[];
    customSources?: ConfigurationBackupCustomSourceSetting[];
  };
  excludedFields: string[];
};

type ConfigurationBackupOptions = {
  includeCustomToolbarIconImage?: boolean;
};

type ConfigurationSyncManifest = {
  format: typeof CONFIGURATION_BACKUP_FORMAT;
  schemaVersion: typeof CONFIGURATION_BACKUP_SCHEMA_VERSION;
  updatedAt: string;
  chunkCount: number;
  byteLength: number;
};

export type ConfigurationBackupParseResult =
  | { ok: true; backup: ConfigurationBackupDocument }
  | { ok: false; error: string };

function cloneSettings(settings: AppSettings): AppSettings {
  return structuredClone(settings);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwnProperty(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function getUtf8ByteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).byteLength;
  }

  return value.length;
}

function chunkString(value: string): string[] {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += CONFIGURATION_SYNC_CHUNK_SIZE) {
    chunks.push(value.slice(index, index + CONFIGURATION_SYNC_CHUNK_SIZE));
  }

  return chunks;
}

function buildProviderSettingsBackup(
  providerSettings: ProviderSetting[],
): ConfigurationBackupProviderSetting[] {
  return providerSettings.map((provider) => ({
    id: provider.id,
    displayEnabled: provider.displayEnabled,
    sourcePreference: provider.sourcePreference,
  }));
}

function buildCustomSourcesBackup(
  customSources: readonly CustomSourceSetting[] | undefined,
): ConfigurationBackupCustomSourceSetting[] {
  return (customSources ?? []).map((source) => ({
    id: source.id,
    label: source.label,
    endpointUrl: source.endpointUrl,
    displayEnabled: source.displayEnabled,
    refreshIntervalMinutes: source.refreshIntervalMinutes,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }));
}

export function buildConfigurationBackup(
  state: AppState,
  options: ConfigurationBackupOptions = {},
): ConfigurationBackupDocument {
  const includeCustomToolbarIconImage =
    options.includeCustomToolbarIconImage ?? true;
  const settings = cloneSettings(state.settings);
  const excludedFields = [
    "providers",
    "providerSettings.status",
    "providerSettings.credentialStatus",
    "providerSettings.pageBinding",
    "providerSettings.hostOrigins",
    "providerSettings.hostsLabel",
    "providerSettings.description",
    "customSourceStates",
    "customSources.headers",
    "customSources.apiTokens",
    "customSources.lastResponseBody",
    "providerSecrets",
  ];

  if (!includeCustomToolbarIconImage) {
    settings.toolbarIconCustomImageDataUrl = null;

    if (settings.toolbarIconMode === "custom") {
      settings.toolbarIconMode = "default";
    }

    excludedFields.push("settings.toolbarIconCustomImageDataUrl");
  }

  return {
    format: CONFIGURATION_BACKUP_FORMAT,
    schemaVersion: CONFIGURATION_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    payload: {
      settings,
      providerSettings: buildProviderSettingsBackup(state.providerSettings),
      customSources: buildCustomSourcesBackup(state.customSources),
    },
    excludedFields,
  };
}

export function parseConfigurationBackupJson(
  rawJson: string,
): ConfigurationBackupParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson) as unknown;
  } catch {
    return {
      ok: false,
      error: "Configuration JSON could not be parsed.",
    };
  }

  if (
    !isRecord(parsed) ||
    parsed.format !== CONFIGURATION_BACKUP_FORMAT ||
    parsed.schemaVersion !== CONFIGURATION_BACKUP_SCHEMA_VERSION ||
    !isRecord(parsed.payload) ||
    !isRecord(parsed.payload.settings) ||
    !Array.isArray(parsed.payload.providerSettings) ||
    (
      parsed.payload.customSources !== undefined &&
      !Array.isArray(parsed.payload.customSources)
    )
  ) {
    return {
      ok: false,
      error: "Configuration JSON does not match the expected backup format.",
    };
  }

  return {
    ok: true,
    backup: parsed as ConfigurationBackupDocument,
  };
}

export function applyConfigurationBackupToState(
  state: AppState,
  backup: ConfigurationBackupDocument,
): AppState {
  const importedSettings = backup.payload.settings;
  const settings = {
    ...state.settings,
    ...importedSettings,
  };

  if (
    !hasOwnProperty(importedSettings, "progressColorAppearance") &&
    Array.isArray(importedSettings.progressColorBands)
  ) {
    settings.progressColorAppearance = {
      mode: "traditional",
      bands: structuredClone(importedSettings.progressColorBands),
    };
  }

  const importedProviderSettings = new Map<
    ProviderId,
    Partial<ConfigurationBackupProviderSetting>
  >();

  for (const importedProvider of backup.payload.providerSettings) {
    if (
      isRecord(importedProvider) &&
      typeof importedProvider.id === "string"
    ) {
      const providerId = normalizeProviderId(
        importedProvider.id as ProviderId | LegacyProviderId,
      );

      if (!providerId) {
        continue;
      }

      importedProviderSettings.set(
        providerId,
        importedProvider as Partial<ConfigurationBackupProviderSetting>,
      );
    }
  }

  return {
    ...state,
    settings,
    customSources: normalizeCustomSourceSettings(backup.payload.customSources),
    providerSettings: state.providerSettings.map((provider) => {
      const importedProvider = importedProviderSettings.get(provider.id);

      if (!importedProvider) {
        return provider;
      }

      return {
        ...provider,
        displayEnabled:
          typeof importedProvider.displayEnabled === "boolean"
            ? importedProvider.displayEnabled
            : typeof importedProvider.enabled === "boolean"
              ? importedProvider.enabled
            : provider.displayEnabled,
        sourcePreference: normalizeSourcePreference(
          provider.id,
          importedProvider.sourcePreference as ProviderSourcePreference,
        ),
      };
    }),
  };
}

export function buildConfigurationBackupFilename(exportedAt = new Date()) {
  return `ai-usage-dashboard-config-${exportedAt.toISOString().slice(0, 10)}.json`;
}

function hasChromeSyncStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage?.sync?.get === "function" &&
    typeof chrome.storage.sync.set === "function" &&
    typeof chrome.storage.sync.remove === "function"
  );
}

function getChunkKey(index: number) {
  return `${CONFIGURATION_SYNC_CHUNK_PREFIX}${index}`;
}

function isConfigurationSyncManifest(
  value: unknown,
): value is ConfigurationSyncManifest {
  return (
    isRecord(value) &&
    value.format === CONFIGURATION_BACKUP_FORMAT &&
    value.schemaVersion === CONFIGURATION_BACKUP_SCHEMA_VERSION &&
    typeof value.chunkCount === "number" &&
    value.chunkCount > 0 &&
    value.chunkCount <= CONFIGURATION_SYNC_MAX_CHUNKS
  );
}

export async function writeConfigurationBackupToChromeSync(
  backup: ConfigurationBackupDocument,
): Promise<void> {
  if (!hasChromeSyncStorage()) {
    throw new Error("Chrome sync storage is not available in this runtime.");
  }

  const rawJson = JSON.stringify(backup);
  const chunks = chunkString(rawJson);

  if (chunks.length > CONFIGURATION_SYNC_MAX_CHUNKS) {
    throw new Error(
      "Configuration is too large for Chrome Sync. Export JSON instead.",
    );
  }

  const previous = await chrome.storage.sync.get(CONFIGURATION_SYNC_MANIFEST_KEY);
  const previousManifest = previous[CONFIGURATION_SYNC_MANIFEST_KEY];
  const previousChunkCount = isConfigurationSyncManifest(previousManifest)
    ? previousManifest.chunkCount
    : 0;
  const previousChunkKeys = Array.from({ length: previousChunkCount }, (_, index) =>
    getChunkKey(index),
  );
  const nextChunkEntries = Object.fromEntries(
    chunks.map((chunk, index) => [getChunkKey(index), chunk]),
  );

  await chrome.storage.sync.remove([
    CONFIGURATION_SYNC_MANIFEST_KEY,
    ...previousChunkKeys,
  ]);
  await chrome.storage.sync.set({
    ...nextChunkEntries,
    [CONFIGURATION_SYNC_MANIFEST_KEY]: {
      format: CONFIGURATION_BACKUP_FORMAT,
      schemaVersion: CONFIGURATION_BACKUP_SCHEMA_VERSION,
      updatedAt: backup.exportedAt,
      chunkCount: chunks.length,
      byteLength: getUtf8ByteLength(rawJson),
    } satisfies ConfigurationSyncManifest,
  });
}

export async function readConfigurationBackupFromChromeSync(): Promise<
  ConfigurationBackupDocument | null
> {
  if (!hasChromeSyncStorage()) {
    throw new Error("Chrome sync storage is not available in this runtime.");
  }

  const manifestResult = await chrome.storage.sync.get(
    CONFIGURATION_SYNC_MANIFEST_KEY,
  );
  const manifest = manifestResult[CONFIGURATION_SYNC_MANIFEST_KEY];

  if (!isConfigurationSyncManifest(manifest)) {
    return null;
  }

  const chunkKeys = Array.from({ length: manifest.chunkCount }, (_, index) =>
    getChunkKey(index),
  );
  const chunkResult = await chrome.storage.sync.get(chunkKeys);
  const rawJson = chunkKeys.map((key) => chunkResult[key]).join("");

  if (!rawJson || chunkKeys.some((key) => typeof chunkResult[key] !== "string")) {
    throw new Error("Chrome Sync configuration backup is incomplete.");
  }

  const parsedBackup = parseConfigurationBackupJson(rawJson);

  if (!parsedBackup.ok) {
    throw new Error(parsedBackup.error);
  }

  return parsedBackup.backup;
}
