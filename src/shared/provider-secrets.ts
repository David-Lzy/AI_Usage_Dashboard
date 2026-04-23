import type { ApiKeyProviderId, ProviderSecrets } from "../providers/types";
import {
  PROVIDER_SECRETS_STORAGE_KEY,
  SAMPLE_PROVIDER_SECRETS,
} from "./constants";

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

function normalizeProviderSecrets(secrets: Partial<ProviderSecrets>): ProviderSecrets {
  return {
    cursor: {
      adminApiKey: normalizeApiKey(secrets.cursor?.adminApiKey),
    },
    "claude-code": {
      adminApiKey: normalizeApiKey(secrets["claude-code"]?.adminApiKey),
    },
    codex: {
      analyticsApiKey: normalizeApiKey(secrets.codex?.analyticsApiKey),
      workspaceId: normalizeWorkspaceId(secrets.codex?.workspaceId),
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

function readLocalStorageSecrets(): ProviderSecrets {
  try {
    const rawSecrets = globalThis.localStorage.getItem(PROVIDER_SECRETS_STORAGE_KEY);

    if (!rawSecrets) {
      return cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
    }

    return normalizeProviderSecrets(JSON.parse(rawSecrets) as ProviderSecrets);
  } catch {
    globalThis.localStorage.removeItem(PROVIDER_SECRETS_STORAGE_KEY);
    return cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
  }
}

function writeLocalStorageSecrets(secrets: ProviderSecrets) {
  globalThis.localStorage.setItem(
    PROVIDER_SECRETS_STORAGE_KEY,
    JSON.stringify(secrets),
  );
}

export async function readProviderSecrets(): Promise<ProviderSecrets> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(PROVIDER_SECRETS_STORAGE_KEY);
    const rawSecrets = stored[PROVIDER_SECRETS_STORAGE_KEY] as
      | ProviderSecrets
      | undefined;

    return rawSecrets
      ? normalizeProviderSecrets(rawSecrets)
      : cloneProviderSecrets(SAMPLE_PROVIDER_SECRETS);
  }

  if (hasLocalStorage()) {
    return readLocalStorageSecrets();
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
  } else if (hasLocalStorage()) {
    writeLocalStorageSecrets(normalizedSecrets);
  } else {
    memoryFallbackSecrets = normalizedSecrets;
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
    codex: {
      ...current.codex,
      analyticsApiKey: normalizeApiKey(analyticsApiKey),
      workspaceId: normalizeWorkspaceId(workspaceId),
    },
  }));
}
