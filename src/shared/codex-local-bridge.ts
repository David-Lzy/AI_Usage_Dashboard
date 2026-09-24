import {
  LOCAL_COMPANION_BRIDGE_PATHS,
  normalizeLocalCompanionBearerToken,
  requestLocalCompanion,
  type LocalCompanionBridgeResult,
} from "./local-companion-bridge";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";
import type { CodexObservedEstimate } from "../providers/types";

export const CODEX_LOCAL_SUMMARY_SCHEMA = "ai-usage-dashboard.codex-local.v1";
export type CodexLocalSourceMode = "browser" | "local" | "hybrid";
export type CodexLocalWindow = {
  id: "primary" | "secondary";
  kind: "rolling_5h" | "weekly" | "unknown";
  durationMinutes: number;
  usedPercent: number;
  resetAt: string | null;
};
export type CodexLocalSummary = {
  schema: typeof CODEX_LOCAL_SUMMARY_SCHEMA;
  observedAt: string;
  accountDigest: string | null;
  windows: CodexLocalWindow[];
  availableResetCount: number | null;
  estimates: CodexObservedEstimate[];
};

export function normalizeCodexLocalSourceMode(value: unknown): CodexLocalSourceMode {
  return value === "local" || value === "hybrid" ? value : "browser";
}

export function normalizeCodexLocalSummary(value: unknown): CodexLocalSummary | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const observedAt = normalizeSnapshotTimestamp(raw.observedAt);
  if (raw.schema !== CODEX_LOCAL_SUMMARY_SCHEMA || !observedAt || !Array.isArray(raw.windows) || raw.windows.length < 1 || raw.windows.length > 2) return null;
  if (raw.accountDigest !== null && (typeof raw.accountDigest !== "string" || !/^[a-f0-9]{64}$/u.test(raw.accountDigest))) return null;
  if (raw.availableResetCount !== null && (!Number.isSafeInteger(raw.availableResetCount) || Number(raw.availableResetCount) < 0)) return null;
  const windows: CodexLocalWindow[] = [];
  const seen = new Set<string>();
  for (const item of raw.windows) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const window = item as Record<string, unknown>;
    if ((window.id !== "primary" && window.id !== "secondary") || seen.has(window.id) || (window.kind !== "rolling_5h" && window.kind !== "weekly" && window.kind !== "unknown") || !Number.isSafeInteger(window.durationMinutes) || Number(window.durationMinutes) < 1 || Number(window.durationMinutes) > 44_640 || !Number.isInteger(window.usedPercent) || Number(window.usedPercent) < 0 || Number(window.usedPercent) > 100 || (window.resetAt !== null && !normalizeSnapshotTimestamp(window.resetAt))) return null;
    seen.add(window.id);
    windows.push({ id: window.id, kind: window.kind, durationMinutes: Number(window.durationMinutes), usedPercent: Number(window.usedPercent), resetAt: window.resetAt as string | null });
  }
  if (!Array.isArray(raw.estimates) || raw.estimates.length !== windows.length) return null;
  const estimates: CodexObservedEstimate[] = [];
  const estimateIds = new Set<string>();
  for (const [index, item] of raw.estimates.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const estimate = item as Record<string, unknown>;
    if ((estimate.windowId !== "primary" && estimate.windowId !== "secondary") || estimate.windowId !== windows[index]?.id || estimateIds.has(estimate.windowId) || !["learning", "ready", "unpriced", "unverified"].includes(String(estimate.status))) return null;
    estimateIds.add(estimate.windowId);
    const ready = estimate.status === "ready";
    const amounts = [estimate.usedEquivalentUsd, estimate.fullEquivalentUsd, estimate.fullLowerUsd, estimate.fullUpperUsd];
    if (ready && (amounts.some((entry) => typeof entry !== "number" || !Number.isFinite(entry) || entry < 0) || !Number.isSafeInteger(estimate.sampleCount) || Number(estimate.sampleCount) < 1 || Number(estimate.sampleCount) > 1_000_000 || (estimate.confidence !== "low" && estimate.confidence !== "medium") || estimate.priceDate !== "2026-09-24")) return null;
    estimates.push({
      windowId: estimate.windowId,
      status: ready ? "ready" : estimate.status === "unverified" ? "account_unknown" : estimate.status === "unpriced" ? "unpriced" : "learning",
      fullUsd: ready ? Number(estimate.fullEquivalentUsd) : null,
      fullLowerUsd: ready ? Number(estimate.fullLowerUsd) : null,
      fullUpperUsd: ready ? Number(estimate.fullUpperUsd) : null,
      currentUsd: ready ? Number(estimate.usedEquivalentUsd) : null,
      sampleCount: ready ? Number(estimate.sampleCount) : 0,
      confidence: ready ? estimate.confidence as "low" | "medium" : null,
      priceDate: ready ? "2026-09-24" : null,
    });
  }
  return { schema: CODEX_LOCAL_SUMMARY_SCHEMA, observedAt, accountDigest: raw.accountDigest, windows, availableResetCount: raw.availableResetCount as number | null, estimates };
}

export async function fetchCodexLocalSummary(baseUrl: string, token: string, fetchImpl?: typeof fetch): Promise<LocalCompanionBridgeResult<CodexLocalSummary>> {
  const safeToken = normalizeLocalCompanionBearerToken(token);
  if (!safeToken) return { ok: false, code: "invalid_token", message: "The local companion token is invalid." };
  const result = await requestLocalCompanion(baseUrl, LOCAL_COMPANION_BRIDGE_PATHS.codexSummary, {
    headers: { Accept: "application/json", Authorization: `Bearer ${safeToken}` },
  }, { fetchImpl, timeoutMs: 30_000 });
  if (!result.ok) return result;
  let parsed: unknown;
  try { parsed = JSON.parse(result.value); }
  catch { return { ok: false, code: "invalid_response", message: "The local Codex summary was not JSON." }; }
  const summary = normalizeCodexLocalSummary(parsed);
  return summary ? { ok: true, value: summary } : { ok: false, code: "invalid_response", message: "The local Codex summary is invalid." };
}

export async function computeCodexAccountDigest(token: string, accountId: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), "HMAC", false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(accountId));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
