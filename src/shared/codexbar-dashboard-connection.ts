import { CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY } from "./constants";
import { normalizeCodexBarDashboardEndpoint } from "./codexbar-dashboard-bridge";
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  removeSafeStorageItem,
  setSafeStorageItem,
} from "./local-storage";

const CONNECTION_SCHEMA_VERSION = 1 as const;

export type CodexBarDashboardConnection = {
  schemaVersion: typeof CONNECTION_SCHEMA_VERSION;
  enabled: true;
  endpointUrl: string;
};

let memoryFallback: CodexBarDashboardConnection | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeConnection(value: unknown): CodexBarDashboardConnection | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== CONNECTION_SCHEMA_VERSION ||
    value.enabled !== true
  ) {
    return null;
  }
  const endpoint = normalizeCodexBarDashboardEndpoint(value.endpointUrl);
  return endpoint.ok
    ? {
        schemaVersion: CONNECTION_SCHEMA_VERSION,
        enabled: true,
        endpointUrl: endpoint.value,
      }
    : null;
}

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage?.local?.get === "function" &&
    typeof chrome.storage.local.set === "function" &&
    typeof chrome.storage.local.remove === "function"
  );
}

export async function readCodexBarDashboardConnection(): Promise<CodexBarDashboardConnection | null> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(
      CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY,
    );
    return normalizeConnection(
      stored[CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY],
    );
  }

  const localStorage = getSafeLocalStorage();
  const raw = localStorage
    ? getSafeStorageItem(localStorage, CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY)
    : null;
  if (raw) {
    try {
      return normalizeConnection(JSON.parse(raw) as unknown);
    } catch {
      removeSafeStorageItem(
        localStorage,
        CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY,
      );
    }
  }
  return memoryFallback ? structuredClone(memoryFallback) : null;
}

export async function writeCodexBarDashboardConnection(
  endpointUrl: string,
): Promise<boolean> {
  const endpoint = normalizeCodexBarDashboardEndpoint(endpointUrl);
  if (!endpoint.ok) {
    return false;
  }
  const connection: CodexBarDashboardConnection = {
    schemaVersion: CONNECTION_SCHEMA_VERSION,
    enabled: true,
    endpointUrl: endpoint.value,
  };
  if (hasChromeStorage()) {
    await chrome.storage.local.set({
      [CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY]: connection,
    });
    memoryFallback = null;
    return true;
  }
  const localStorage = getSafeLocalStorage();
  if (
    localStorage &&
    setSafeStorageItem(
      localStorage,
      CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY,
      JSON.stringify(connection),
    )
  ) {
    memoryFallback = null;
    return true;
  }
  memoryFallback = structuredClone(connection);
  return true;
}

export async function clearCodexBarDashboardConnection(): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY);
  } else {
    const localStorage = getSafeLocalStorage();
    if (localStorage) {
      removeSafeStorageItem(
        localStorage,
        CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY,
      );
    }
  }
  memoryFallback = null;
}

export function resetCodexBarDashboardConnectionMemoryForTests(): void {
  memoryFallback = null;
}
