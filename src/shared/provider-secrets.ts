import type {
  ApiKeyProviderId,
  LegacyProviderId,
  ProviderSecrets,
} from "../providers/types";
import {
  PROVIDER_SECRETS_STORAGE_KEY,
  SAMPLE_PROVIDER_SECRETS,
} from "./constants";
import { getSafeLocalStorage } from "./local-storage";

let memoryFallbackSecrets: ProviderSecrets | null = null;

function cloneProviderSecrets(secrets: ProviderSecrets): ProviderSecrets {
  return structuredClone(secrets);
}

function normalizeApiKey(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeWorkspaceId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

type StoredProviderSecrets = Partial<ProviderSecrets> &
  Partial<
    Record<
      LegacyProviderId,
      {
        adminApiKey?: unknown;
        analyticsApiKey?: unknown;
        workspaceId?: unknown;
      }
    >
  >;

function normalizeProviderSecrets(secrets: StoredProviderSecrets): ProviderSecrets {
  return {
    "cursor-team-api": {
      adminApiKey: normalizeApiKey(
        secrets["cursor-team-api"]?.adminApiKey ?? secrets.cursor?.adminApiKey,
      ),
    },
    "claude-code-admin-api": {
      adminApiKey: normalizeApiKey(
        secrets["claude-code-admin-api"]?.adminApiKey ??
          secrets["claude-code"]?.adminApiKey,
      ),
    },
    "codex-enterprise-api": {
      analyticsApiKey: normalizeApiKey(
        secrets["codex-enterprise-api"]?.analyticsApiKey ??
          secrets.codex?.analyticsApiKey,
      ),
      workspaceId: normalizeWorkspaceId(
        secrets["codex-enterprise-api"]?.workspaceId ?? secrets.codex?.workspaceId,
      ),
    },
  };
}

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.storage?.local !== "undefined";
}

function readLocalStorageSecrets(storage: Storage): ProviderSecrets {
  try {
    const rawSecrets = storage.getItem(PROVIDER_SECRETS_STORAGE_KEY);

    if (!rawSecrets) {
      return cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
    }

    return normalizeProviderSecrets(JSON.parse(rawSecrets) as StoredProviderSecrets);
  } catch {
    storage.removeItem(PROVIDER_SECRETS_STORAGE_KEY);
    return cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
  }
}

function writeLocalStorageSecrets(storage: Storage, secrets: ProviderSecrets) {
  storage.setItem(
    PROVIDER_SECRETS_STORAGE_KEY,
    JSON.stringify(secrets),
  );
}

export async function readProviderSecrets(): Promise<ProviderSecrets> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(PROVIDER_SECRETS_STORAGE_KEY);
    const rawSecrets = stored[PROVIDER_SECRETS_STORAGE_KEY] as
      | StoredProviderSecrets
      | undefined;

    return rawSecrets
      ? normalizeProviderSecrets(rawSecrets)
      : cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
  }

  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    return readLocalStorageSecrets(localStorage);
  }

  return memoryFallbackSecrets
    ? normalizeProviderSecrets(cloneProviderSecrets(memoryFallbackSecrets))
    : cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
}

export async function writeProviderSecrets(
  secrets: ProviderSecrets,
): Promise<ProviderSecrets> {
  const normalizedSecrets = normalizeProviderSecrets(cloneProviderSecrets(secrets));

  if (hasChromeStorage()) {
    await chrome.storage.local.set({
      [PROVIDER_SECRETS_STORAGE_KEY]: normalizedSecrets,
    });
  } else {
    const localStorage = getSafeLocalStorage();

    if (localStorage) {
      writeLocalStorageSecrets(localStorage, normalizedSecrets);
    } else {
      memoryFallbackSecrets = normalizedSecrets;
    }
  }

  return normalizedSecrets;
}

export async function updateProviderSecrets(
  updater: (secrets: ProviderSecrets) => ProviderSecrets,
): Promise<ProviderSecrets> {
  const current = await readProviderSecrets();
  const next = updater(cloneProviderSecrets(current));
  return writeProviderSecrets(next);
}

export async function setProviderAdminApiKey(
  providerId: ApiKeyProviderId,
  apiKey: string | null,
): Promise<ProviderSecrets> {
  if (providerId === "codex-enterprise-api") {
    return readProviderSecrets();
  }

  return updateProviderSecrets((current) => ({
    ...current,
    [providerId]: {
      ...current[providerId],
      adminApiKey: normalizeApiKey(apiKey),
    },
  }));
}

export async function setCodexWorkspaceConfig(
  analyticsApiKey: string | null,
  workspaceId: string | null,
): Promise<ProviderSecrets> {
  return updateProviderSecrets((current) => ({
    ...current,
    "codex-enterprise-api": {
      ...current["codex-enterprise-api"],
      analyticsApiKey: normalizeApiKey(analyticsApiKey),
      workspaceId: normalizeWorkspaceId(workspaceId),
    },
  }));
}
