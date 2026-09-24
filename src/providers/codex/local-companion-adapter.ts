import type { ProviderSnapshot, ProviderUsageWindow } from "../types";
import { DEFAULT_APP_STATE } from "../../shared/constants";
import { fetchCodexLocalSummary, type CodexLocalSummary, type CodexLocalWindow } from "../../shared/codex-local-bridge";
import { hasCustomSourceHostAccess } from "../../shared/custom-source-host-access";
import type { LocalCompanionPairing } from "../../shared/local-companion-pairing";
import { withSnapshotFreshness } from "../../shared/snapshot-freshness";

const baseline = DEFAULT_APP_STATE.providers.find((provider) => provider.providerId === "codex-personal-page")!;

function usageWindow(window: CodexLocalWindow): ProviderUsageWindow {
  const label = window.kind === "weekly" ? "Weekly limit" : window.kind === "rolling_5h" ? "5-hour limit" : "Usage limit";
  return {
    label, normalizedLabel: label, kind: window.kind, modelLabel: null,
    quotaUnit: "percent", used: window.usedPercent, remaining: 100 - window.usedPercent,
    total: 100, resetAt: window.resetAt, resetLabel: null,
  };
}

export function buildCodexLocalSnapshot(previous: ProviderSnapshot, summary: CodexLocalSummary, now: Date): ProviderSnapshot {
  const windows = summary.windows.map(usageWindow);
  const primary = windows.find((window) => window.kind === "weekly") ?? windows[0]!;
  const remaining = primary.remaining;
  const safePrevious = previous.syncSource === "local_companion" ? previous : baseline;
  return withSnapshotFreshness(safePrevious, {
    ...baseline,
    providerId: "codex-personal-page",
    planName: "Codex CLI",
    quotaUnit: "percent",
    quotaWindow: "rolling",
    used: primary.used,
    remaining,
    total: 100,
    resetAt: primary.resetAt ?? "",
    resetLabel: "",
    syncedAt: summary.observedAt,
    syncSource: "local_companion",
    syncStatus: "ok",
    warningReason: null,
    warningDiagnostic: null,
    lastSyncLabel: "Local Codex quota synced just now",
    sourceSelectionReason: "Paired local Codex CLI app-server",
    sourceFallbackReason: null,
    usageWindows: windows,
    usageBalances: [],
    usageFacts: [],
    usageHistory: undefined,
    codexLocal: {
      availableResetCount: summary.availableResetCount,
      accountVerified: summary.accountDigest !== null,
      estimates: summary.estimates,
    },
    tone: remaining !== null && remaining <= 20 ? "warning" : "neutral",
  }, now, summary.observedAt);
}

export function buildCodexLocalFailure(previous: ProviderSnapshot, now: Date): ProviderSnapshot {
  const safePrevious = previous.syncSource === "local_companion" ? previous : baseline;
  return withSnapshotFreshness(safePrevious, {
    ...safePrevious,
    syncSource: "local_companion",
    syncStatus: "error",
    tone: "error",
    warningReason: "Local Codex companion unavailable; showing only the last successful local capture.",
    warningDiagnostic: null,
    lastSyncLabel: "Local Codex refresh failed",
    sourceSelectionReason: "Paired local Codex CLI app-server",
    sourceFallbackReason: null,
  }, now, safePrevious.lastSuccessAt);
}

export async function syncCodexLocalProvider(
  previous: ProviderSnapshot,
  pairing: LocalCompanionPairing | null,
  now: Date,
  deps: {
    hasAccess?: typeof hasCustomSourceHostAccess;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<{ snapshot: ProviderSnapshot; accountDigest: string | null }> {
  if (!pairing?.token || !pairing.codexAvailable || !await (deps.hasAccess ?? hasCustomSourceHostAccess)(pairing.baseUrl).catch(() => false)) {
    return { snapshot: buildCodexLocalFailure(previous, now), accountDigest: null };
  }
  const result = await fetchCodexLocalSummary(pairing.baseUrl, pairing.token, deps.fetchImpl);
  return result.ok
    ? { snapshot: buildCodexLocalSnapshot(previous, result.value, now), accountDigest: result.value.accountDigest }
    : { snapshot: buildCodexLocalFailure(previous, now), accountDigest: null };
}
