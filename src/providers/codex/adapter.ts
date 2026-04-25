import type {
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceKind,
  ProviderSyncOutcome,
} from "../types";
import { formatSyncTimestamp } from "../normalize";
import {
  getSourceAttemptOrder,
  normalizeSourcePreference,
} from "../../shared/provider-sources";
import {
  buildNoSourceAvailableReason,
  buildSourceFallbackReason,
  buildSourceSelectionReason,
  shouldAttemptFallback,
  type SourceAttemptFailure,
} from "../../shared/source-selection";
import {
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createNoLiveSourceFallbackDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
} from "../diagnostics";
import {
  createCodexAnalyticsClient,
  type CodexAnalyticsUsageRecord,
} from "./official";
import { createCodexPersonalPageClient } from "./personal-page-client";
import type { CodexPersonalUsageWindow } from "./personal-page-parser";

type CodexAdapterContext = {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
};

type CodexSourceAttemptResult =
  | {
      ok: true;
      kind: ProviderSourceKind;
      snapshot: ProviderSnapshot;
      setting?: ProviderSetting;
    }
  | {
      ok: false;
      failure: SourceAttemptFailure;
      snapshot: ProviderSnapshot;
      setting?: ProviderSetting;
    };

function buildCodexRefreshLabel(): string {
  return "Codex Analytics API synced just now";
}

function buildCodexPersonalRefreshLabel(source: "fixture" | "live"): string {
  return source === "fixture"
    ? "Codex personal fixture loaded"
    : "Codex personal usage page synced just now";
}

function hasCodexAnalyticsConfig(secrets: ProviderSecrets): boolean {
  return Boolean(secrets.codex.analyticsApiKey && secrets.codex.workspaceId);
}

function canUseLiveCodexPersonalPage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.tabs?.query === "function" &&
    typeof chrome.scripting?.executeScript === "function"
  );
}

function buildAdditionalWindowsSummary(
  windows: CodexPersonalUsageWindow[],
  primaryWindow: CodexPersonalUsageWindow,
): string | null {
  const additionalWindows = windows
    .filter((window) => window.label !== primaryWindow.label)
    .filter((window) => window.remainingPercent !== null)
    .slice(0, 2)
    .map((window) => {
      const remainingPercent = window.remainingPercent ?? 0;
      return `${window.normalizedLabel}: ${remainingPercent}% remaining`;
    });

  return additionalWindows.length > 0 ? additionalWindows.join(" · ") : null;
}

function getMetricValue(
  record: CodexAnalyticsUsageRecord,
  metric: keyof NonNullable<CodexAnalyticsUsageRecord["metrics"]>,
): number | null {
  const topLevelValue = record[metric];

  if (typeof topLevelValue === "number" && Number.isFinite(topLevelValue)) {
    return topLevelValue;
  }

  const nestedValue = record.metrics?.[metric];
  return typeof nestedValue === "number" && Number.isFinite(nestedValue)
    ? nestedValue
    : null;
}

function getRecordDay(record: CodexAnalyticsUsageRecord): string | null {
  const rawDay = record.date ?? record.end_time ?? record.start_time ?? null;

  if (typeof rawDay !== "string" || rawDay.length < 10) {
    return null;
  }

  return rawDay.slice(0, 10);
}

function summarizeLatestDay(records: CodexAnalyticsUsageRecord[]): {
  day: string;
  credits: number | null;
  threads: number | null;
  turns: number | null;
  breakdownCount: number;
} | null {
  const dayBuckets = new Map<
    string,
    {
      credits: number | null;
      threads: number | null;
      turns: number | null;
      breakdownCount: number;
    }
  >();

  for (const record of records) {
    const day = getRecordDay(record);

    if (!day) {
      continue;
    }

    const credits = getMetricValue(record, "credits");
    const threads = getMetricValue(record, "threads");
    const turns = getMetricValue(record, "turns");
    const current =
      dayBuckets.get(day) ??
      ({
        credits: null,
        threads: null,
        turns: null,
        breakdownCount: 0,
      } satisfies {
        credits: number | null;
        threads: number | null;
        turns: number | null;
        breakdownCount: number;
      });

    dayBuckets.set(day, {
      credits:
        credits === null ? current.credits : (current.credits ?? 0) + credits,
      threads:
        threads === null ? current.threads : (current.threads ?? 0) + threads,
      turns: turns === null ? current.turns : (current.turns ?? 0) + turns,
      breakdownCount: current.breakdownCount + 1,
    });
  }

  const latestDay = [...dayBuckets.keys()].sort().at(-1);

  if (!latestDay) {
    return null;
  }

  return {
    day: latestDay,
    ...dayBuckets.get(latestDay)!,
  };
}

function formatMetric(value: number | null): string {
  if (value === null) {
    return "unavailable";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, "");
}

function buildPersonalWarningReason(
  primaryWindow: CodexPersonalUsageWindow,
  warningThresholdPercent: number,
  windows: CodexPersonalUsageWindow[],
): string | null {
  const usedPercent = primaryWindow.usedPercent ?? null;
  const remainingPercent = primaryWindow.remainingPercent ?? null;

  if (
    usedPercent !== null &&
    remainingPercent !== null &&
    usedPercent >= warningThresholdPercent
  ) {
    return `${primaryWindow.normalizedLabel}: ${remainingPercent}% remaining`;
  }

  return buildAdditionalWindowsSummary(windows, primaryWindow);
}

function finalizeCodexSnapshot(
  snapshot: ProviderSnapshot,
  sourcePreference: ProviderSetting["sourcePreference"],
  selectedKind: ProviderSourceKind,
  fallbackFailure: SourceAttemptFailure | null,
): ProviderSnapshot {
  const sourceSelectionReason = buildSourceSelectionReason(
    "codex",
    sourcePreference,
    selectedKind,
    fallbackFailure !== null,
  );
  const sourceFallbackReason = fallbackFailure
    ? buildSourceFallbackReason(fallbackFailure)
    : null;

  return {
    ...snapshot,
    sourceSelectionReason,
    sourceFallbackReason,
    sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
      providerId: "codex",
      sourcePreference,
      selectedKind,
      hadFallback: fallbackFailure !== null,
      rawMessage: sourceSelectionReason,
    }),
    sourceFallbackDiagnostic:
      fallbackFailure && sourceFallbackReason
        ? createSourceFallbackDiagnostic({
            providerId: "codex",
            sourcePreference,
            failure: fallbackFailure,
            rawMessage: sourceFallbackReason,
          })
        : null,
  };
}

function finalizeCodexNoSourceSnapshot(
  snapshot: ProviderSnapshot,
  sourcePreference: ProviderSetting["sourcePreference"],
  failures: SourceAttemptFailure[],
): ProviderSnapshot {
  const sourceSelectionReason = buildNoSourceAvailableReason(sourcePreference);
  const sourceFallbackReason =
    failures.length > 1
      ? failures.map((failure) => buildSourceFallbackReason(failure)).join(" · ")
      : null;

  return {
    ...snapshot,
    sourceSelectionReason,
    sourceFallbackReason,
    sourceSelectionDiagnostic: null,
    sourceFallbackDiagnostic: sourceFallbackReason
      ? createNoLiveSourceFallbackDiagnostic({
          providerId: "codex",
          sourcePreference,
          failureCount: failures.length,
          rawMessage: sourceFallbackReason,
        })
      : null,
  };
}

async function tryCodexOfficialSource({
  provider,
  secrets,
  syncedAt,
  setting,
}: {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  syncedAt: string;
  setting: ProviderSetting;
}): Promise<CodexSourceAttemptResult> {
  if (setting.status === "missing") {
    const warningReason =
      "Host access missing; grant Codex access for api.chatgpt.com and chatgpt.com before live sync can run.";

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "host_access_missing",
        detail:
          "Grant Codex access for api.chatgpt.com and chatgpt.com before live sync can run.",
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: "codex",
          sourceKind: "official_api",
          hostLabel: setting.hostsLabel,
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Codex analytics API access required",
        resetLabel: "Grant Codex host access to sync Enterprise analytics",
      },
    };
  }

  if (!hasCodexAnalyticsConfig(secrets)) {
    const warningReason =
      "Codex analytics API key and workspace ID are not both configured. Add the Enterprise config or switch the source preference to Session page.";

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail:
          "Codex analytics API key and workspace ID are not both configured.",
      },
      snapshot: {
        ...provider,
        providerLabel: "Codex",
        planName: "Codex Analytics API (Enterprise workspace)",
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason,
        warningDiagnostic: createCredentialDiagnostic({
          providerId: "codex",
          credentialKind: "workspace_config",
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Codex analytics config required",
        resetLabel:
          "Store both the analytics API key and workspace ID to use the Enterprise source",
      },
    };
  }

  try {
    const client = createCodexAnalyticsClient({
      source: "live",
      apiKey: secrets.codex.analyticsApiKey!,
      workspaceId: secrets.codex.workspaceId!,
    });
    const report = await client.getUsageReport({
      limit: 100,
    });
    const latestDay = summarizeLatestDay(report.data);

    if (!latestDay) {
      return {
        ok: true,
        kind: "official_api",
        snapshot: {
          ...provider,
          syncedAt,
          providerLabel: "Codex",
          planName: "Codex Analytics API (Enterprise workspace)",
          quotaUnit: "credits",
          quotaWindow: "daily",
          used: null,
          remaining: null,
          total: null,
          resetAt: "Most recent analytics export window",
          resetLabel:
            "Analytics API returned no Codex workspace rows; remaining credits are still checked in the ChatGPT billing UI",
          syncSource: "official",
          syncStatus: "warning",
          tone: "warning",
          warningReason:
            "Analytics API returned no Codex workspace activity in the current export window.",
          warningDiagnostic: null,
          lastSyncLabel: buildCodexRefreshLabel(),
        },
      };
    }

    const warningParts = [
      `${formatMetric(latestDay.credits)} credits`,
      `${formatMetric(latestDay.threads)} threads`,
      `${formatMetric(latestDay.turns)} turns`,
      `on ${latestDay.day} UTC`,
    ];
    const breakdownSuffix =
      latestDay.breakdownCount > 1
        ? ` Aggregated from ${latestDay.breakdownCount} analytics rows for that day.`
        : "";

    return {
      ok: true,
      kind: "official_api",
      snapshot: {
        ...provider,
        providerLabel: "Codex",
        planName: "Codex Analytics API (Enterprise workspace)",
        quotaUnit: "credits",
        quotaWindow: "daily",
        used: latestDay.credits,
        remaining: null,
        total: null,
        resetAt: `${latestDay.day} UTC`,
        resetLabel:
          "Daily analytics snapshot; remaining workspace credits are checked in the ChatGPT billing UI",
        syncedAt,
        syncSource: "official",
        syncStatus: "warning",
        tone: "warning",
        warningReason: `${warningParts.join(" · ")}.${breakdownSuffix}`,
        warningDiagnostic: null,
        lastSyncLabel: buildCodexRefreshLabel(),
      },
    };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Codex analytics sync failed unexpectedly.";

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "sync_error",
        detail,
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason: detail,
        warningDiagnostic: null,
        lastSyncLabel: "Codex analytics sync failed just now",
        resetLabel:
          "Retry after checking Codex Enterprise analytics access and workspace configuration",
      },
    };
  }
}

async function tryCodexPersonalSource({
  provider,
  syncedAt,
  setting,
  warningThresholdPercent,
}: {
  provider: ProviderSnapshot;
  syncedAt: string;
  setting: ProviderSetting;
  warningThresholdPercent: number;
}): Promise<CodexSourceAttemptResult> {
  if (setting.status === "missing") {
    const warningReason =
      "Host access missing; grant Codex access for api.chatgpt.com and chatgpt.com before live sync can run.";

    return {
      ok: false,
      failure: {
        kind: "session_page",
        code: "host_access_missing",
        detail:
          "Grant Codex access for api.chatgpt.com and chatgpt.com before live sync can run.",
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: "codex",
          sourceKind: "session_page",
          hostLabel: setting.hostsLabel,
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Codex usage page access required",
        resetLabel:
          "Grant Codex host access to read the logged-in ChatGPT usage page",
      },
    };
  }

  try {
    const personalSource: "fixture" | "live" = canUseLiveCodexPersonalPage()
      ? "live"
      : "fixture";
    const client = createCodexPersonalPageClient({
      source: personalSource,
    });
    const { result, pageBinding } = await client.getUsageSnapshot(
      setting.pageBinding,
    );
    const nextSetting: ProviderSetting = {
      ...setting,
      pageBinding,
    };

    if (result.status !== "ok") {
      const isRecoverable =
        result.status === "open_page_required" || result.status === "logged_out";

      return {
        ok: false,
        failure: {
          kind: "session_page",
          code:
            result.status === "logged_out"
              ? "logged_out"
              : result.status === "open_page_required"
                ? "open_page_required"
                : "sync_error",
          detail: result.reason,
        },
        snapshot: {
          ...provider,
          providerLabel: "Codex",
          planName: "Codex Personal Usage Page",
          quotaUnit: "percent",
          quotaWindow: "rolling",
          used: null,
          remaining: null,
          total: 100,
          resetAt: "Visible usage-window reset time",
          resetLabel:
            result.status === "logged_out"
              ? "Log back into ChatGPT and reopen the Codex usage page"
              : result.status === "open_page_required"
                ? "Open the logged-in Codex usage page and refresh again"
                : "Inspect the live Codex page and update the parser assumptions",
          syncedAt,
          syncSource: "page_parse",
          syncStatus: isRecoverable ? "warning" : "error",
          tone: isRecoverable ? "warning" : "error",
          warningReason: result.reason,
          warningDiagnostic: null,
          lastSyncLabel:
            result.status === "logged_out"
              ? "Codex usage page session missing"
              : result.status === "open_page_required"
                ? "Codex usage page not open"
                : "Codex usage page parse failed",
        },
        setting: nextSetting,
      };
    }

    const primaryWindow = result.snapshot.primaryWindow;
    const warningReason = buildPersonalWarningReason(
      primaryWindow,
      warningThresholdPercent,
      result.snapshot.windows,
    );
    const used = primaryWindow.usedPercent ?? null;
    const remaining = primaryWindow.remainingPercent ?? null;
    const total = primaryWindow.totalPercent ?? 100;
    const usedPercent = used ?? 0;

    return {
      ok: true,
      kind: "session_page",
      snapshot: {
        ...provider,
        providerLabel: "Codex",
        planName: `Codex Personal Usage Page (${primaryWindow.normalizedLabel})`,
        quotaUnit: "percent",
        quotaWindow: "rolling",
        used,
        remaining,
        total,
        resetAt: primaryWindow.resetAt ?? "Visible usage-window reset time",
        resetLabel: primaryWindow.resetAt
          ? `${primaryWindow.normalizedLabel} resets at ${primaryWindow.resetAt}`
          : `${primaryWindow.normalizedLabel} reset time is visible only inside the current page session`,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: usedPercent >= warningThresholdPercent ? "warning" : "ok",
        tone: usedPercent >= warningThresholdPercent ? "warning" : "neutral",
        warningReason,
        warningDiagnostic: null,
        lastSyncLabel: buildCodexPersonalRefreshLabel(personalSource),
      },
      setting: nextSetting,
    };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Codex personal usage page sync failed unexpectedly.";

    return {
      ok: false,
      failure: {
        kind: "session_page",
        code: "sync_error",
        detail,
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "error",
        tone: "error",
        warningReason: detail,
        warningDiagnostic: null,
        lastSyncLabel: "Codex personal usage page sync failed just now",
        resetLabel:
          "Retry after checking the logged-in Codex page and parser assumptions",
      },
      setting,
    };
  }
}

export async function syncCodexProvider({
  provider,
  secrets,
  setting,
  warningThresholdPercent,
  now,
}: CodexAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);
  const sourcePreference = normalizeSourcePreference(
    "codex",
    setting.sourcePreference,
  );
  const attemptOrder = getSourceAttemptOrder("codex", sourcePreference);
  const failures: SourceAttemptFailure[] = [];
  let firstFailedSnapshot: ProviderSnapshot | null = null;

  for (const sourceKind of attemptOrder) {
    const attempt =
      sourceKind === "official_api"
        ? await tryCodexOfficialSource({
            provider,
            secrets,
            syncedAt,
            setting,
          })
        : await tryCodexPersonalSource({
            provider,
            syncedAt,
            setting,
            warningThresholdPercent,
          });

    if (attempt.ok) {
      return {
        snapshot: finalizeCodexSnapshot(
          attempt.snapshot,
          sourcePreference,
          attempt.kind,
          failures[0] ?? null,
        ),
        ...(attempt.setting ? { setting: attempt.setting } : {}),
      };
    }

    failures.push(attempt.failure);
    firstFailedSnapshot ??= attempt.snapshot;

    if (!shouldAttemptFallback(attempt.failure)) {
      return {
        snapshot: finalizeCodexNoSourceSnapshot(
          attempt.snapshot,
          sourcePreference,
          failures,
        ),
        ...(attempt.setting ? { setting: attempt.setting } : {}),
      };
    }
  }

  return {
    snapshot: finalizeCodexNoSourceSnapshot(
      firstFailedSnapshot ?? {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "error",
        tone: "error",
        warningReason: "Codex source selection could not resolve a live path.",
        warningDiagnostic: null,
        lastSyncLabel: "Codex source selection failed just now",
        resetLabel: "Check Codex source preferences and live prerequisites",
      },
      sourcePreference,
      failures,
    ),
  };
}
