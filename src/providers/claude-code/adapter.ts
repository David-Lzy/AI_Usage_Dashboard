import type {
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceKind,
  ProviderSyncOutcome,
  ProviderUsageFact,
  ProviderUsageWindow,
  SyncTrigger,
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
import { hasPageBindingFingerprint } from "../../shared/page-bindings";
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
  createClaudeCodeAnalyticsClient,
  type ClaudeCodeAnalyticsRecord,
} from "./official";
import { createClaudePersonalPageClient } from "./personal-page-client";
import { hasLivePageSessionApis } from "../page-session";
import type {
  ClaudePersonalUsageFact,
  ClaudePersonalUsageWindow,
} from "./personal-page-parser";

type ClaudeCodeAdapterContext = {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
  trigger?: SyncTrigger;
};

type ClaudeSourceAttemptResult =
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

function buildClaudeRefreshLabel(): string {
  return "Claude Code Analytics API synced just now";
}

function buildClaudePersonalRefreshLabel(source: "fixture" | "live"): string {
  return source === "fixture"
    ? "Claude personal upgrade fixture loaded"
    : "Claude usage page synced just now";
}

function formatUtcCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function inferStartingAt(now: Date): string {
  const previousDay = new Date(now);
  previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  return formatUtcCalendarDate(previousDay);
}

function getActorLabel(record: ClaudeCodeAnalyticsRecord): string {
  return record.actor.type === "user_actor"
    ? record.actor.email_address
    : record.actor.api_key_name;
}

function canUseLiveClaudePersonalPage(): boolean {
  return hasLivePageSessionApis();
}

function shouldOpenClaudePageWhenMissing({
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

  // P0 fix: A previous implementation stopped auto-opening whenever an alarm
  // sync returned logged_out. For personal Pro/Max accounts a background tab
  // opened by the extension may transiently show the upgrade page before the
  // real usage page renders, producing a false logged_out result. We now only
  // block auto-opening when there is no prior page-binding fingerprint,
  // meaning the account genuinely never reached a usable usage page. When a
  // fingerprint exists the extension previously succeeded, so we keep retrying.
  if (
    trigger === "alarm" &&
    provider.warningDiagnostic?.code === "page_session.logged_out" &&
    !hasPageBindingFingerprint(setting.pageBinding)
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

function getClaudePageSessionDiagnosticKind(
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

function formatMetric(value: number | null): string {
  if (value === null) {
    return "unavailable";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatClaudeWindowResetLabel(
  window: Pick<
    ClaudePersonalUsageWindow,
    "normalizedLabel" | "resetAt" | "resetText"
  >,
): string | null {
  if (!window.resetAt) {
    return window.resetText;
  }

  const resetPrefix = /^\s*(?:in|within)\b/i.test(window.resetAt)
    ? "resets"
    : "resets at";

  return `${window.normalizedLabel} ${resetPrefix} ${window.resetAt}`;
}

function toProviderUsageWindow(
  window: ClaudePersonalUsageWindow,
): ProviderUsageWindow {
  return {
    label: window.label,
    normalizedLabel: window.normalizedLabel,
    kind:
      window.kind === "rolling_5h" || window.kind === "weekly"
        ? window.kind
        : "unknown",
    modelLabel: null,
    quotaUnit: "percent",
    used: window.usedPercent,
    remaining: window.remainingPercent,
    total: window.totalPercent,
    resetAt: window.resetAt,
    resetLabel: formatClaudeWindowResetLabel(window),
  };
}

function buildClaudeUsageWindows(
  windows: ClaudePersonalUsageWindow[],
): ProviderUsageWindow[] {
  return windows
    .filter((window) => window.remainingPercent !== null)
    .map(toProviderUsageWindow);
}

function toProviderUsageFact(fact: ClaudePersonalUsageFact): ProviderUsageFact {
  return {
    label: fact.label,
    value: fact.value,
    detail: fact.detail,
  };
}

function buildClaudeUsageSummary(
  windows: ClaudePersonalUsageWindow[],
  facts: ClaudePersonalUsageFact[],
): string | null {
  const windowSummaries = windows
    .filter((window) => window.remainingPercent !== null)
    .slice(0, 4)
    .map((window) => {
      const remainingPercent = window.remainingPercent ?? 0;
      return `${window.normalizedLabel}: ${remainingPercent}% remaining`;
    });
  const factSummaries = facts.slice(0, 4).map((fact) => `${fact.label}: ${fact.value}`);
  const summaries = [...windowSummaries, ...factSummaries];

  return summaries.length > 0
    ? `Visible Claude usage: ${summaries.join(" · ")}`
    : null;
}

function buildPersonalWarningReason(
  primaryWindow: ClaudePersonalUsageWindow | null,
  warningThresholdPercent: number,
): string | null {
  const usedPercent = primaryWindow?.usedPercent ?? null;
  const remainingPercent = primaryWindow?.remainingPercent ?? null;

  if (
    primaryWindow &&
    usedPercent !== null &&
    remainingPercent !== null &&
    usedPercent >= warningThresholdPercent
  ) {
    return `${primaryWindow.normalizedLabel}: ${remainingPercent}% remaining`;
  }

  return null;
}

function finalizeClaudeSnapshot(
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

function finalizeClaudeNoSourceSnapshot(
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

async function tryClaudeOfficialSource({
  provider,
  secrets,
  syncedAt,
  setting,
  now,
}: {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  syncedAt: string;
  setting: ProviderSetting;
  now: Date;
}): Promise<ClaudeSourceAttemptResult> {
  if (setting.status === "missing") {
    const warningReason = `Host access missing; grant Claude access for ${setting.hostsLabel} before live sync can run.`;

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "host_access_missing",
        detail: `Grant Claude access for ${setting.hostsLabel} before live sync can run.`,
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
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: "Claude Admin API access required",
        resetLabel: "Grant Claude host access to sync analytics",
      },
    };
  }

  if (!secrets["claude-code-admin-api"].adminApiKey) {
    const warningReason =
      "A Claude Admin API key is not configured. Add an organization Admin API key or use the logged-in Claude usage page source.";

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: "Claude Admin API key is not configured.",
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason,
        warningDiagnostic: createCredentialDiagnostic({
          providerId: provider.providerId,
          credentialKind: "admin_api_key",
          rawMessage: warningReason,
        }),
        usageWindows: undefined,
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: "Claude Admin API key required",
        resetLabel:
          "Add a Claude organization Admin API key or switch to the session-page source",
      },
    };
  }

  try {
    const client = createClaudeCodeAnalyticsClient({
      source: "live",
      apiKey: secrets["claude-code-admin-api"].adminApiKey,
    });
    const startingAt = inferStartingAt(now);
    const report = await client.getUsageReport({
      startingAt,
      limit: 100,
    });

    if (report.data.length === 0) {
      return {
        ok: true,
        kind: "official_api",
        snapshot: {
          ...provider,
          syncedAt,
          providerLabel: "Claude Code",
          planName: "Analytics Admin API",
          quotaUnit: "sessions",
          quotaWindow: "daily",
          used: 0,
          remaining: null,
          total: null,
          resetAt: `${startingAt} UTC`,
          resetLabel:
            "Daily analytics returned no activity; exact remaining quota unavailable",
          syncSource: "official",
          syncStatus: "warning",
          tone: "warning",
          warningReason:
            "Analytics API returned no Claude Code activity for the selected UTC day.",
          warningDiagnostic: null,
          usageWindows: undefined,
          usageFacts: undefined,
          usageSummary: null,
          lastSyncLabel: buildClaudeRefreshLabel(),
        },
      };
    }

    const uniqueActors = new Set(report.data.map(getActorLabel)).size;
    const totalSessions = report.data.reduce(
      (sum, record) => sum + record.num_sessions,
      0,
    );
    const totalLinesAdded = report.data.reduce(
      (sum, record) => sum + record.lines_of_code.added,
      0,
    );
    const totalEstimatedCostCents = report.data.reduce(
      (sum, record) =>
        sum +
        record.models.reduce(
          (modelSum, model) => modelSum + model.estimated_cost.amount,
          0,
        ),
      0,
    );
    const customerTypes = [
      ...new Set(report.data.map((record) => record.customer_type)),
    ];
    const scopeLabel =
      customerTypes.length === 1
        ? customerTypes[0] === "api"
          ? "API org"
          : "Subscription org"
        : "Mixed org";
    const reportDay = report.data[0]?.date.slice(0, 10) ?? startingAt;

    return {
      ok: true,
      kind: "official_api",
      snapshot: {
        ...provider,
        providerLabel: "Claude Code",
        planName: `Analytics Admin API (${scopeLabel}, ${uniqueActors} members)`,
        quotaUnit: "sessions",
        quotaWindow: "daily",
        used: totalSessions,
        remaining: null,
        total: null,
        resetAt: `${reportDay} UTC`,
        resetLabel:
          "Daily analytics snapshot; exact remaining Claude Code quota unavailable",
        syncedAt,
        syncSource: "official",
        syncStatus: "warning",
        tone: "warning",
        warningReason: `${totalSessions} sessions · ${totalLinesAdded} lines added · $${(totalEstimatedCostCents / 100).toFixed(2)} estimated cost on ${reportDay} UTC`,
        warningDiagnostic: null,
        usageWindows: undefined,
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: buildClaudeRefreshLabel(),
      },
    };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Claude Code analytics sync failed unexpectedly.";

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
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: "Claude analytics sync failed just now",
        resetLabel:
          "Retry after checking Claude Admin API access and analytics configuration",
      },
    };
  }
}

async function tryClaudePersonalSource({
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
}): Promise<ClaudeSourceAttemptResult> {
  if (setting.status === "missing") {
    const warningReason = `Host access missing; grant Claude access for ${setting.hostsLabel} before live usage-page sync can run.`;

    return {
      ok: false,
      failure: {
        kind: "session_page",
        code: "host_access_missing",
        detail: `Grant Claude access for ${setting.hostsLabel} before live usage-page sync can run.`,
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
        usageWindows: undefined,
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: "Claude usage page access required",
        resetLabel:
          "Grant Claude host access to read the logged-in Claude usage page",
      },
    };
  }

  try {
    const personalSource: "fixture" | "live" = canUseLiveClaudePersonalPage()
      ? "live"
      : "fixture";
    const client = createClaudePersonalPageClient({
      source: personalSource,
      openPageWhenMissing: shouldOpenClaudePageWhenMissing({
        provider,
        setting,
        trigger,
      }),
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
          providerLabel: "Claude Code",
          planName: "Claude Team Usage Page",
          quotaUnit: "percent",
          quotaWindow: "rolling",
          used: null,
          remaining: null,
          total: 100,
          resetAt: "Visible Claude usage page",
          resetLabel:
            result.status === "logged_out"
              ? "Log back into Claude Team and reopen the usage page"
              : result.status === "open_page_required"
                ? "Open the logged-in Claude settings usage page and refresh again"
                : result.status === "capture_unavailable"
                  ? "Reload the Claude usage page and refresh again"
                  : "Inspect the live Claude usage page and update the parser assumptions",
          syncedAt,
          syncSource: "page_parse",
          syncStatus: isRecoverable ? "warning" : "error",
          tone: isRecoverable ? "warning" : "error",
          warningReason: result.reason,
          warningDiagnostic:
            result.status === "route_drift"
              ? createAdapterErrorDiagnostic({
                  providerId: provider.providerId,
                  adapterErrorKind: "parse_failed",
                  sourceKind: "session_page",
                  failureCode: "route_drift",
                  parserStage: "personal_usage_page",
                  rawMessage: result.reason,
                })
              : createPageSessionDiagnostic({
                  providerId: provider.providerId,
                  pageSessionKind: getClaudePageSessionDiagnosticKind(
                    result.status,
                  ),
                  rawMessage: result.reason,
                }),
          // P2 fix: preserve the last successful usage windows and facts as
          // stale context instead of clearing them on every error. The warning
          // banner already signals that the data is not live, so showing the
          // last-seen percentages is more useful than showing nothing.
          usageWindows:
            provider.usageWindows && provider.usageWindows.length > 0
              ? provider.usageWindows
              : undefined,
          usageFacts:
            provider.usageFacts && provider.usageFacts.length > 0
              ? provider.usageFacts
              : undefined,
          usageSummary: provider.usageSummary ?? null,
          lastSyncLabel:
            result.status === "logged_out"
              ? "Claude usage page session missing"
              : result.status === "open_page_required"
                ? "Claude usage page not open"
                : result.status === "capture_unavailable"
                  ? "Claude usage page unavailable"
                  : "Claude usage page parse failed",
        },
        setting: nextSetting,
      };
    }

    const primaryWindow = result.snapshot.primaryWindow;
    const warningReason = buildPersonalWarningReason(
      primaryWindow,
      warningThresholdPercent,
    );
    const used = primaryWindow?.usedPercent ?? null;
    const remaining = primaryWindow?.remainingPercent ?? null;
    const total = primaryWindow?.totalPercent ?? null;
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
        providerLabel: "Claude Code",
        planName: primaryWindow
          ? `Claude Team Usage Page (${primaryWindow.normalizedLabel})`
          : "Claude Team Usage Page",
        quotaUnit: primaryWindow ? "percent" : "requests",
        quotaWindow: primaryWindow?.kind === "monthly" ? "monthly" : "rolling",
        used,
        remaining,
        total,
        resetAt: primaryWindow?.resetAt ?? "Visible Claude usage page",
        resetLabel: primaryWindow
          ? formatClaudeWindowResetLabel(primaryWindow) ??
            `${primaryWindow.normalizedLabel} reset timing is visible only inside the current page session`
          : "Claude usage page captured; no exact remaining percentage was visible",
        syncedAt,
        syncSource: "page_parse",
        syncStatus: usedPercent >= warningThresholdPercent ? "warning" : "ok",
        tone: usedPercent >= warningThresholdPercent ? "warning" : "neutral",
        warningReason,
        warningDiagnostic: usageThresholdDiagnostic,
        usageWindows: buildClaudeUsageWindows(result.snapshot.windows),
        usageFacts: result.snapshot.facts.map(toProviderUsageFact),
        usageSummary: buildClaudeUsageSummary(
          result.snapshot.windows,
          result.snapshot.facts,
        ),
        lastSyncLabel: buildClaudePersonalRefreshLabel(personalSource),
      },
      setting: nextSetting,
    };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Claude usage page sync failed unexpectedly.";

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
        warningDiagnostic: createAdapterErrorDiagnostic({
          providerId: provider.providerId,
          adapterErrorKind: "unexpected_error",
          sourceKind: "session_page",
          failureCode: "sync_error",
          parserStage: "personal_usage_page",
          rawMessage: detail,
        }),
        usageWindows: undefined,
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: "Claude usage page sync failed just now",
        resetLabel:
          "Retry after checking the logged-in Claude usage page and parser assumptions",
      },
      setting,
    };
  }
}

export async function syncClaudeCodeProvider({
  provider,
  secrets,
  setting,
  warningThresholdPercent,
  now,
  trigger = "manual",
}: ClaudeCodeAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);
  const sourcePreference = normalizeSourcePreference(
    provider.providerId,
    setting.sourcePreference,
  );
  const attemptOrder = getSourceAttemptOrder(provider.providerId, sourcePreference);
  const failures: SourceAttemptFailure[] = [];
  let firstFailedSnapshot: ProviderSnapshot | null = null;

  for (const sourceKind of attemptOrder) {
    const attempt =
      sourceKind === "official_api"
        ? await tryClaudeOfficialSource({
            provider,
            secrets,
            syncedAt,
            setting,
            now,
          })
        : await tryClaudePersonalSource({
            provider,
            syncedAt,
            setting,
            warningThresholdPercent,
            trigger,
          });

    if (attempt.ok) {
      return {
        snapshot: finalizeClaudeSnapshot(
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
        snapshot: finalizeClaudeNoSourceSnapshot(
          attempt.snapshot,
          sourcePreference,
          failures,
        ),
        ...(attempt.setting ? { setting: attempt.setting } : {}),
      };
    }
  }

  return {
    snapshot: finalizeClaudeNoSourceSnapshot(
      firstFailedSnapshot ?? {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "error",
        tone: "error",
        warningReason: "Claude source selection could not resolve a live path.",
        warningDiagnostic: null,
        usageWindows: undefined,
        usageFacts: undefined,
        usageSummary: null,
        lastSyncLabel: "Claude source selection failed just now",
        resetLabel: "Check Claude source preferences and live prerequisites",
      },
      sourcePreference,
      failures,
    ),
  };
}
