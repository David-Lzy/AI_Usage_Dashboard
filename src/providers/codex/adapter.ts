import type {
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceKind,
  ProviderSyncOutcome,
  SyncTrigger,
  ProviderUsageBalance,
  ProviderUsageWindow,
} from "../types";
import { formatSyncTimestamp } from "../normalize";
import { normalizeSourcePreference } from "../../shared/provider-sources";
import {
  buildNoSourceAvailableReason,
  buildSourceFallbackReason,
  buildSourceSelectionReason,
  type SourceAttemptFailure,
} from "../../shared/source-selection";
import {
  createAdapterErrorDiagnostic,
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createNoLiveSourceFallbackDiagnostic,
  createPageSessionDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../diagnostics";
import {
  createCodexAnalyticsClient,
  type CodexAnalyticsUsageRecord,
} from "./official";
import { createCodexPersonalPageClient } from "./personal-page-client";
import type { CodexSessionApiFailureCode } from "./session-api-client";
import { hasPageBindingFingerprint } from "../../shared/page-bindings";
import {
  mergeProviderUsageHistoryModules,
} from "../../shared/provider-usage-history";
import { hasLivePageSessionApis } from "../page-session";
import {
  providerSourceStrategyRunner,
  type ProviderSourceAttempt,
} from "../provider-source-strategy";
import type {
  CodexPersonalUsageBalance,
  CodexPersonalUsageWindow,
} from "./personal-page-parser";

type CodexAdapterContext = {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
  trigger?: SyncTrigger;
};

type CodexSourceAttemptResult = ProviderSourceAttempt;

function buildCodexRefreshLabel(): string {
  return "Codex Analytics API synced just now";
}

function buildCodexPersonalRefreshLabel(
  source: "fixture" | "page_parse" | "session_api",
): string {
  if (source === "fixture") {
    return "Codex personal fixture loaded";
  }

  return source === "session_api"
    ? "Codex session usage synced just now"
    : "Codex personal usage page synced just now";
}

function hasRetainableCodexData(provider: ProviderSnapshot): boolean {
  return Boolean(
    provider.used !== null ||
      provider.remaining !== null ||
      provider.usageWindows?.length ||
      provider.usageBalances?.length ||
      provider.usageHistory,
  );
}

function buildCodexDirectFailureLabel(
  code: CodexSessionApiFailureCode,
): string {
  switch (code) {
    case "auth_missing":
      return "Codex session authentication required";
    case "auth_cooldown":
      return "Codex session authentication cooling down";
    case "unauthorized":
      return "Codex session authentication expired";
    case "forbidden":
      return "Codex session account access unavailable";
    case "rate_limited":
      return "Codex session usage temporarily rate limited";
    case "request_timeout":
      return "Codex session usage request timed out";
    case "network_error":
      return "Codex session usage network unavailable";
    case "server_error":
      return "Codex session usage service unavailable";
    case "protocol_drift":
      return "Codex session usage protocol changed";
  }
}

function hasCodexAnalyticsConfig(secrets: ProviderSecrets): boolean {
  return Boolean(
    secrets["codex-enterprise-api"].analyticsApiKey &&
      secrets["codex-enterprise-api"].workspaceId,
  );
}

function canUseLiveCodexPersonalPage(): boolean {
  return hasLivePageSessionApis();
}

function shouldOpenCodexPageWhenMissing({
  provider,
  setting,
  trigger,
}: {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
  trigger: SyncTrigger;
}): boolean {
  if (trigger === "bootstrap") {
    return false;
  }

  if (
    trigger === "alarm" &&
    provider.warningDiagnostic?.code === "page_session.logged_out"
  ) {
    return false;
  }

  if (hasPageBindingFingerprint(setting.pageBinding)) {
    return true;
  }

  return (
    setting.sourcePreference === "auto" ||
    setting.sourcePreference === "session_page"
  );
}

function getCodexPageSessionDiagnosticKind(
  status:
    | "logged_out"
    | "open_page_required"
    | "capture_unavailable"
    | "route_drift",
): "logged_out" | "open_page_required" | "capture_unavailable" {
  if (status === "logged_out" || status === "open_page_required") {
    return status;
  }

  return "capture_unavailable";
}

function toProviderUsageWindow(
  window: CodexPersonalUsageWindow,
): ProviderUsageWindow {
  return {
    label: window.label,
    normalizedLabel: window.normalizedLabel,
    kind: window.kind,
    modelLabel: window.modelLabel,
    quotaUnit: "percent",
    used: window.usedPercent,
    remaining: window.remainingPercent,
    total: window.totalPercent,
    resetAt: window.resetAt,
    resetLabel: window.resetAt
      ? `${window.normalizedLabel} resets at ${window.resetAt}`
      : window.resetText,
  };
}

function buildCodexUsageWindows(
  windows: CodexPersonalUsageWindow[],
): ProviderUsageWindow[] {
  return windows
    .filter((window) => window.remainingPercent !== null)
    .map(toProviderUsageWindow);
}

function toProviderUsageBalance(
  balance: CodexPersonalUsageBalance,
): ProviderUsageBalance {
  return {
    label: balance.label,
    normalizedLabel: balance.normalizedLabel,
    kind: balance.kind,
    quotaUnit: "credits",
    remaining: balance.remainingCredits,
    total: balance.totalCredits,
    detail: balance.detail,
  };
}

function buildCodexUsageBalances(
  balances: CodexPersonalUsageBalance[],
): ProviderUsageBalance[] {
  return balances
    .filter((balance) => balance.remainingCredits !== null)
    .map(toProviderUsageBalance);
}

function chooseMostConstrainedWindow(
  windows: CodexPersonalUsageWindow[],
  fallbackWindow: CodexPersonalUsageWindow,
): CodexPersonalUsageWindow {
  return windows
    .filter((window) => window.remainingPercent !== null)
    .reduce((mostConstrained, window) => {
      const currentRemaining = window.remainingPercent ?? Number.POSITIVE_INFINITY;
      const lowestRemaining =
        mostConstrained.remainingPercent ?? Number.POSITIVE_INFINITY;

      if (currentRemaining < lowestRemaining) {
        return window;
      }

      return mostConstrained;
    }, fallbackWindow);
}

function buildPersonalUsageSummary(
  windows: CodexPersonalUsageWindow[],
  balances: CodexPersonalUsageBalance[],
): string | null {
  const windowSummaries = windows
    .filter((window) => window.remainingPercent !== null)
    .slice(0, 4)
    .map((window) => {
      const remainingPercent = window.remainingPercent ?? 0;
      return `${window.normalizedLabel}: ${remainingPercent}% remaining`;
    });
  const balanceSummaries = balances
    .filter((balance) => balance.remainingCredits !== null)
    .slice(0, 2)
    .map((balance) => {
      const remainingCredits = balance.remainingCredits ?? 0;
      return `${balance.normalizedLabel}: ${formatMetric(remainingCredits)} credits`;
    });

  if (balanceSummaries.length === 0) {
    return windowSummaries.length > 1
      ? `Visible Codex windows: ${windowSummaries.join(" · ")}`
      : null;
  }

  return `Visible Codex usage: ${[...windowSummaries, ...balanceSummaries].join(" · ")}`;
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

  return null;
}

function finalizeCodexSnapshot(
  snapshot: ProviderSnapshot,
  sourcePreference: ProviderSetting["sourcePreference"],
  selectedKind: ProviderSourceKind,
  fallbackFailure: SourceAttemptFailure | null,
): ProviderSnapshot {
  const sourceSelectionReason = buildSourceSelectionReason(
    snapshot.providerId,
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
      providerId: snapshot.providerId,
      sourcePreference,
      selectedKind,
      hadFallback: fallbackFailure !== null,
      rawMessage: sourceSelectionReason,
    }),
    sourceFallbackDiagnostic:
      fallbackFailure && sourceFallbackReason
        ? createSourceFallbackDiagnostic({
            providerId: snapshot.providerId,
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
          providerId: snapshot.providerId,
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
  signal,
}: {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  syncedAt: string;
  setting: ProviderSetting;
  signal: AbortSignal;
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
          providerId: provider.providerId,
          sourceKind: "official_api",
          hostLabel: setting.hostsLabel,
          rawMessage: warningReason,
        }),
        usageWindows: undefined,
        usageBalances: undefined,
        usageSummary: null,
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
          providerId: provider.providerId,
          credentialKind: "workspace_config",
          rawMessage: warningReason,
        }),
        usageWindows: undefined,
        usageBalances: undefined,
        usageSummary: null,
        lastSyncLabel: "Codex analytics config required",
        resetLabel:
          "Store both the analytics API key and workspace ID to use the Enterprise source",
      },
    };
  }

  try {
    const client = createCodexAnalyticsClient({
      source: "live",
      apiKey: secrets["codex-enterprise-api"].analyticsApiKey!,
      workspaceId: secrets["codex-enterprise-api"].workspaceId!,
      signal,
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
          usageWindows: undefined,
          usageBalances: undefined,
          usageSummary: null,
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
        usageWindows: undefined,
        usageBalances: undefined,
        usageSummary: null,
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
        warningDiagnostic: createAdapterErrorDiagnostic({
          providerId: provider.providerId,
          adapterErrorKind: "unexpected_error",
          sourceKind: "official_api",
          failureCode: "sync_error",
          parserStage: "analytics_api",
          rawMessage: detail,
        }),
        usageWindows: undefined,
        usageBalances: undefined,
        usageSummary: null,
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
  trigger,
}: {
  provider: ProviderSnapshot;
  syncedAt: string;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  trigger: SyncTrigger;
}): Promise<CodexSourceAttemptResult> {
  if (setting.status === "missing") {
    const hasPreviousData = hasRetainableCodexData(provider);
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
          providerId: provider.providerId,
          sourceKind: "session_page",
          hostLabel: setting.hostsLabel,
          rawMessage: warningReason,
        }),
        usageWindows: hasPreviousData ? provider.usageWindows : undefined,
        usageBalances: hasPreviousData ? provider.usageBalances : undefined,
        usageSummary: hasPreviousData ? provider.usageSummary : null,
        usageHistory: hasPreviousData ? provider.usageHistory : undefined,
        lastSyncLabel: hasPreviousData
          ? "Codex access required; showing last successful data"
          : "Codex usage page access required",
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
      trigger,
      openPageWhenMissing: shouldOpenCodexPageWhenMissing({
        provider,
        setting,
        trigger,
      }),
    });
    const {
      captureSource,
      directApiFailure,
      replacePreviousSnapshot,
      result,
      pageBinding,
    } = await client.getUsageSnapshot(setting.pageBinding);
    const nextSetting: ProviderSetting = {
      ...setting,
      pageBinding,
    };

    if (result.status !== "ok") {
      const hasPreviousData = hasRetainableCodexData(provider);
      const isRecoverable =
        result.status === "open_page_required" || result.status === "logged_out";
      const failureReason = directApiFailure
        ? `${directApiFailure.reason} Page fallback: ${result.reason}`
        : result.reason;
      const directFailureLabel = directApiFailure
        ? buildCodexDirectFailureLabel(directApiFailure.code)
        : null;

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
          detail: failureReason,
        },
        snapshot: {
          ...provider,
          providerLabel: "Codex",
          planName: "Codex Personal Usage Page",
          quotaUnit: "percent",
          quotaWindow: "rolling",
          used: hasPreviousData ? provider.used : null,
          remaining: hasPreviousData ? provider.remaining : null,
          total: hasPreviousData ? provider.total : 100,
          resetAt: hasPreviousData
            ? provider.resetAt
            : "Visible usage-window reset time",
          resetLabel:
            result.status === "logged_out"
              ? "Log back into ChatGPT and reopen the Codex usage page"
              : result.status === "open_page_required"
                ? "Open the logged-in Codex usage page and refresh again"
                : result.status === "capture_unavailable"
                  ? "Reload the Codex usage page and refresh again"
                  : "Inspect the live Codex page and update the parser assumptions",
          syncedAt,
          syncSource: "page_parse",
          syncStatus: hasPreviousData || isRecoverable ? "warning" : "error",
          tone: hasPreviousData || isRecoverable ? "warning" : "error",
          warningReason: failureReason,
          warningDiagnostic:
            directApiFailure
              ? createAdapterErrorDiagnostic({
                  providerId: provider.providerId,
                  adapterErrorKind:
                    directApiFailure.code === "protocol_drift"
                      ? "unsupported_response"
                      : "unexpected_error",
                  sourceKind: "session_page",
                  failureCode: directApiFailure.code,
                  parserStage: "session_usage_api",
                  rawMessage: failureReason,
                })
              : result.status === "route_drift"
              ? createAdapterErrorDiagnostic({
                  providerId: provider.providerId,
                  adapterErrorKind: "parse_failed",
                  sourceKind: "session_page",
                  failureCode: "route_drift",
                  parserStage: "personal_usage_page",
                  rawMessage: failureReason,
                })
              : createPageSessionDiagnostic({
                  providerId: provider.providerId,
                  pageSessionKind: getCodexPageSessionDiagnosticKind(
                    result.status,
                  ),
                  rawMessage: failureReason,
                }),
          usageWindows: hasPreviousData ? provider.usageWindows : undefined,
          usageBalances: hasPreviousData ? provider.usageBalances : undefined,
          usageSummary: hasPreviousData ? provider.usageSummary : null,
          usageHistory: hasPreviousData ? provider.usageHistory : undefined,
          lastSyncLabel: directFailureLabel
            ? hasPreviousData
              ? `${directFailureLabel}; showing last successful data`
              : directFailureLabel
            : result.status === "logged_out"
              ? "Codex usage page session missing"
              : result.status === "open_page_required"
                ? "Codex usage page not open"
                : result.status === "capture_unavailable"
                  ? "Codex usage page unavailable"
                  : "Codex usage page parse failed",
        },
        setting: nextSetting,
      };
    }

    const primaryWindow = result.snapshot.primaryWindow;
    const displayWindow = chooseMostConstrainedWindow(
      result.snapshot.windows,
      primaryWindow,
    );
    const warningReason = buildPersonalWarningReason(
      displayWindow,
      warningThresholdPercent,
    );
    const used = displayWindow.usedPercent ?? null;
    const remaining = displayWindow.remainingPercent ?? null;
    const total = displayWindow.totalPercent ?? 100;
    const usedPercent = used ?? 0;
    const usageThresholdDiagnostic =
      used !== null && usedPercent >= warningThresholdPercent && warningReason
        ? createUsageThresholdDiagnostic({
            providerId: provider.providerId,
            usageThresholdKind: "threshold_warning",
            rawMessage: warningReason,
            usagePercent: usedPercent,
            thresholdPercent: warningThresholdPercent,
            unitLabel: "percent",
          })
        : null;

    return {
      ok: true,
      kind: "session_page",
      snapshot: {
        ...provider,
        providerLabel: "Codex",
        planName: `Codex Personal Usage Page (${displayWindow.normalizedLabel})`,
        quotaUnit: "percent",
        quotaWindow: "rolling",
        used,
        remaining,
        total,
        resetAt: displayWindow.resetAt ?? "Visible usage-window reset time",
        resetLabel: displayWindow.resetAt
          ? `${displayWindow.normalizedLabel} resets at ${displayWindow.resetAt}`
          : `${displayWindow.normalizedLabel} reset time is visible only inside the current page session`,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: usedPercent >= warningThresholdPercent ? "warning" : "ok",
        tone: usedPercent >= warningThresholdPercent ? "warning" : "neutral",
        warningReason,
        warningDiagnostic: usageThresholdDiagnostic,
        usageWindows: buildCodexUsageWindows(result.snapshot.windows),
        usageBalances: buildCodexUsageBalances(result.snapshot.balances),
        usageHistory: mergeProviderUsageHistoryModules(
          result.snapshot.usageHistory,
          replacePreviousSnapshot ? undefined : provider.usageHistory,
        ),
        usageSummary: buildPersonalUsageSummary(
          result.snapshot.windows,
          result.snapshot.balances,
        ),
        lastSyncLabel: buildCodexPersonalRefreshLabel(
          captureSource ?? (personalSource === "fixture" ? "fixture" : "page_parse"),
        ),
      },
      setting: nextSetting,
    };
  } catch (error) {
    const hasPreviousData = hasRetainableCodexData(provider);
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
        syncStatus: hasPreviousData ? "warning" : "error",
        tone: hasPreviousData ? "warning" : "error",
        warningReason: detail,
        warningDiagnostic: createAdapterErrorDiagnostic({
          providerId: provider.providerId,
          adapterErrorKind: "unexpected_error",
          sourceKind: "session_page",
          failureCode: "sync_error",
          parserStage: "personal_usage_page",
          rawMessage: detail,
        }),
        usageWindows: hasPreviousData ? provider.usageWindows : undefined,
        usageBalances: hasPreviousData ? provider.usageBalances : undefined,
        usageSummary: hasPreviousData ? provider.usageSummary : null,
        usageHistory: hasPreviousData ? provider.usageHistory : undefined,
        lastSyncLabel: hasPreviousData
          ? "Codex sync failed; showing last successful data"
          : "Codex personal usage page sync failed just now",
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
  trigger = "manual",
}: CodexAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);
  const sourcePreference = normalizeSourcePreference(
    provider.providerId,
    setting.sourcePreference,
  );

  const isPersonalSource = provider.providerId === "codex-personal-page";
  const strategyResult = await providerSourceStrategyRunner.run({
    sourceEntryId: provider.providerId,
    trigger,
    strategies: isPersonalSource
      ? [
          {
            id: "codex_personal_session",
            kind: "page_capture",
            runAttempt: () =>
              tryCodexPersonalSource({
                provider,
                syncedAt,
                setting,
                warningThresholdPercent,
                trigger,
              }),
          },
        ]
      : [
          {
            id: "codex_enterprise_api",
            kind: "official_api",
            runAttempt: (signal) =>
              tryCodexOfficialSource({
                provider,
                secrets,
                syncedAt,
                setting,
                signal,
              }),
          },
        ],
  });
  const attempt = strategyResult.attempt;

  if (attempt?.ok) {
    return {
      snapshot: finalizeCodexSnapshot(
        attempt.snapshot,
        sourcePreference,
        attempt.kind,
        null,
      ),
      ...(attempt.setting ? { setting: attempt.setting } : {}),
    };
  }

  const failures = strategyResult.failure ? [strategyResult.failure] : [];
  const failureSnapshot =
    attempt && !attempt.ok
      ? attempt.snapshot
      : {
          ...provider,
          syncedAt,
          syncSource: isPersonalSource
            ? ("page_parse" as const)
            : ("official" as const),
          syncStatus: "warning" as const,
          tone: "warning" as const,
          warningReason:
            strategyResult.failure?.detail ??
            "Codex source orchestration did not complete.",
          warningDiagnostic: null,
          lastSyncLabel: "Codex source sync did not complete",
          resetLabel: "Retry the bounded Codex source refresh",
        };

  return {
    snapshot: finalizeCodexNoSourceSnapshot(
      failureSnapshot,
      sourcePreference,
      failures,
    ),
    ...(attempt && !attempt.ok && attempt.setting
      ? { setting: attempt.setting }
      : {}),
  };
}
