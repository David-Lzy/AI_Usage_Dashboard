import { isCustomSourceId } from "./custom-sources";
import { normalizeLocalCompanionBearerToken, normalizeLocalCompanionBridgeBaseUrl, type LocalCompanionBridgeSourceIndexEntry } from "./local-companion-bridge";
import { getSafeLocalStorage, getSafeStorageItem, setSafeStorageItem, removeSafeStorageItem } from "./local-storage";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";
import type { LocalCompanionSettingsStatus } from "./local-companion-settings";
import { normalizeCodexLocalSourceMode, type CodexLocalSourceMode } from "./codex-local-bridge";

// A protocol-specific local key avoids overwriting a CodexBar token on the same origin.
export const LOCAL_COMPANION_PAIRING_KEY = "aiUsageDashboard.localCompanionPairing.v1";
export type LocalCompanionPairing = {
  baseUrl: string;
  token: string | null;
  status: Exclude<LocalCompanionSettingsStatus, "disconnected">;
  checkedAt: string | null;
  sources: LocalCompanionBridgeSourceIndexEntry[];
  codexMode?: CodexLocalSourceMode;
  codexAvailable?: boolean;
};
let memory: LocalCompanionPairing | null = null;

function normalize(value: unknown): LocalCompanionPairing | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const url = normalizeLocalCompanionBridgeBaseUrl(raw.baseUrl);
  if (!url.ok || !["connected", "expired", "unavailable"].includes(String(raw.status)) || !Array.isArray(raw.sources) || raw.sources.length > 32) return null;
  const seen = new Set<string>();
  const sources = raw.sources.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || !isCustomSourceId(entry.sourceId) || typeof entry.label !== "string" || !/^[^<>\u0000-\u001F\u007F]{1,96}$/u.test(entry.label) || seen.has(entry.sourceId)) return [];
    seen.add(entry.sourceId);
    return [{ sourceId: entry.sourceId, label: entry.label }];
  });
  if (sources.length !== raw.sources.length) return null;
  return { baseUrl: url.value, token: normalizeLocalCompanionBearerToken(raw.token), status: raw.status as LocalCompanionPairing["status"], checkedAt: normalizeSnapshotTimestamp(raw.checkedAt), sources, codexMode: normalizeCodexLocalSourceMode(raw.codexMode), codexAvailable: raw.codexAvailable === true };
}

export async function readLocalCompanionPairing(): Promise<LocalCompanionPairing | null> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const stored = await chrome.storage.local.get(LOCAL_COMPANION_PAIRING_KEY);
    return normalize(stored[LOCAL_COMPANION_PAIRING_KEY]);
  }
  const storage = getSafeLocalStorage();
  const raw = storage ? getSafeStorageItem(storage, LOCAL_COMPANION_PAIRING_KEY) : null;
  if (raw) {
    try { return normalize(JSON.parse(raw)); } catch { return null; }
  }
  return memory ? structuredClone(memory) : null;
}

/** Called only by the controller's ordered command queue, never stored in AppState. */
export async function writeLocalCompanionPairing(value: LocalCompanionPairing | null): Promise<void> {
  const safe = normalize(value);
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    if (safe) await chrome.storage.local.set({ [LOCAL_COMPANION_PAIRING_KEY]: safe });
    else await chrome.storage.local.remove(LOCAL_COMPANION_PAIRING_KEY);
    memory = null;
    return;
  }
  const storage = getSafeLocalStorage();
  if (storage) {
    if (!safe) { removeSafeStorageItem(storage, LOCAL_COMPANION_PAIRING_KEY); memory = null; return; }
    if (setSafeStorageItem(storage, LOCAL_COMPANION_PAIRING_KEY, JSON.stringify(safe))) { memory = null; return; }
  }
  memory = safe ? structuredClone(safe) : null;
}
