import { communityRecord, communityTimestamp } from "./community-reset-feeds";

export const CODEX_RESET_CAPTURE_KEY = "ai-usage-dashboard.codex-reset-capture.v1";
export type CodexResetCapture = { accountKey: string; identity: string; pairingTag: string; capturedAt: string };
export function normalizeCodexResetCapture(value: unknown): CodexResetCapture | null {
  if (!communityRecord(value) || typeof value.identity !== "string" || !/^[a-f0-9]{64}$/.test(value.identity)
    || typeof value.pairingTag !== "string" || !/^[a-f0-9]{64}$/.test(value.pairingTag)
    || typeof value.accountKey !== "string" || value.accountKey.length > 256) return null;
  const capturedAt = communityTimestamp(value.capturedAt);
  try {
    const key: unknown = JSON.parse(value.accountKey);
    if (!Array.isArray(key) || key.length !== 2 || key[0] !== "codex-personal-page" || typeof key[1] !== "string") return null;
  } catch { return null; }
  return capturedAt ? { accountKey: value.accountKey, identity: value.identity, pairingTag: value.pairingTag, capturedAt } : null;
}
export async function codexResetPairingTag(baseUrl: string, token: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(["reset-capture-v1", baseUrl, token])));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
/** Only the accepted sync result supplies this keyed digest; it never enters AppState or exports. */
export async function writeCodexResetCapture(value: CodexResetCapture | null): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return;
  const safe = normalizeCodexResetCapture(value);
  if (safe) await chrome.storage.local.set({ [CODEX_RESET_CAPTURE_KEY]: safe });
  else await chrome.storage.local.remove(CODEX_RESET_CAPTURE_KEY);
}
export async function readCodexResetCapture(): Promise<CodexResetCapture | null> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return null;
  return normalizeCodexResetCapture((await chrome.storage.local.get(CODEX_RESET_CAPTURE_KEY))[CODEX_RESET_CAPTURE_KEY]);
}
