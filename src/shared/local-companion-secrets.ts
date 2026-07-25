import { LOCAL_COMPANION_SECRETS_STORAGE_KEY } from "./constants";
import {
  normalizeLocalCompanionBearerToken,
  normalizeLocalCompanionBridgeBaseUrl,
} from "./local-companion-bridge";
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  removeSafeStorageItem,
  setSafeStorageItem,
} from "./local-storage";

const LOCAL_COMPANION_SECRETS_SCHEMA_VERSION = 1 as const;

type LocalCompanionSecretStore = {
  schemaVersion: typeof LOCAL_COMPANION_SECRETS_SCHEMA_VERSION;
  connections: Record<string, string>;
};

let memoryFallbackStore: LocalCompanionSecretStore | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStore(value: unknown): LocalCompanionSecretStore {
  if (
    !isRecord(value) ||
    value.schemaVersion !== LOCAL_COMPANION_SECRETS_SCHEMA_VERSION ||
    !isRecord(value.connections)
  ) {
    return { schemaVersion: LOCAL_COMPANION_SECRETS_SCHEMA_VERSION, connections: {} };
  }

  return {
    schemaVersion: LOCAL_COMPANION_SECRETS_SCHEMA_VERSION,
    connections: Object.fromEntries(
      Object.entries(value.connections).flatMap(([baseUrl, rawToken]) => {
        const normalizedUrl = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
        const token = normalizeLocalCompanionBearerToken(rawToken);
        return normalizedUrl.ok && token
          ? [[normalizedUrl.value, token] as const]
          : [];
      }),
    ),
  };
}

function cloneStore(store: LocalCompanionSecretStore): LocalCompanionSecretStore {
  return structuredClone(store);
}

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage?.local !== "undefined"
  );
}

async function readStore(): Promise<LocalCompanionSecretStore> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(
      LOCAL_COMPANION_SECRETS_STORAGE_KEY,
    );
    return normalizeStore(stored[LOCAL_COMPANION_SECRETS_STORAGE_KEY]);
  }

  const localStorage = getSafeLocalStorage();
  if (localStorage) {
    const raw = getSafeStorageItem(
      localStorage,
      LOCAL_COMPANION_SECRETS_STORAGE_KEY,
    );
    if (raw) {
      try {
        return normalizeStore(JSON.parse(raw) as unknown);
      } catch {
        removeSafeStorageItem(localStorage, LOCAL_COMPANION_SECRETS_STORAGE_KEY);
      }
    }
  }

  return memoryFallbackStore
    ? cloneStore(memoryFallbackStore)
    : { schemaVersion: LOCAL_COMPANION_SECRETS_SCHEMA_VERSION, connections: {} };
}

async function writeStore(store: LocalCompanionSecretStore): Promise<void> {
  const normalized = normalizeStore(store);
  if (hasChromeStorage()) {
    await chrome.storage.local.set({
      [LOCAL_COMPANION_SECRETS_STORAGE_KEY]: normalized,
    });
    memoryFallbackStore = null;
    return;
  }

  const localStorage = getSafeLocalStorage();
  if (
    localStorage &&
    setSafeStorageItem(
      localStorage,
      LOCAL_COMPANION_SECRETS_STORAGE_KEY,
      JSON.stringify(normalized),
    )
  ) {
    memoryFallbackStore = null;
    return;
  }

  memoryFallbackStore = cloneStore(normalized);
}

export async function readLocalCompanionToken(
  baseUrl: string,
): Promise<string | null> {
  const normalizedUrl = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
  if (!normalizedUrl.ok) {
    return null;
  }
  const store = await readStore();
  return store.connections[normalizedUrl.value] ?? null;
}

export async function writeLocalCompanionToken(
  baseUrl: string,
  token: string,
): Promise<boolean> {
  const normalizedUrl = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
  const normalizedToken = normalizeLocalCompanionBearerToken(token);
  if (!normalizedUrl.ok || !normalizedToken) {
    return false;
  }
  const store = await readStore();
  store.connections[normalizedUrl.value] = normalizedToken;
  await writeStore(store);
  return true;
}

export async function clearLocalCompanionToken(baseUrl: string): Promise<void> {
  const normalizedUrl = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
  if (!normalizedUrl.ok) {
    return;
  }
  const store = await readStore();
  delete store.connections[normalizedUrl.value];
  await writeStore(store);
}

export function resetLocalCompanionSecretMemoryForTests(): void {
  memoryFallbackStore = null;
}
