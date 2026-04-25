import type {
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceKind,
  ProviderSyncOutcome,
} from "../types";
import {
  addMonths,
  buildUsageSignal,
  formatCalendarDate,
  formatSyncTimestamp,
} from "../normalize";
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
  createAdapterErrorDiagnostic,
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createNoLiveSourceFallbackDiagnostic,
  createPageSessionDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../diagnostics";
import { createCursorOfficialClient } from "./official";
import { createCursorPersonalPageClient } from "./personal-page-client";
import type { CursorPersonalUsageSnapshot } from "./personal-page-parser";

type CursorAdapterContext = {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
};

type CursorSourceAttemptResult =
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

function buildCursorRefreshLabel(): string {
  return "Cursor Admin API synced just now";
}

function buildCursorPersonalRefreshLabel(source: "fixture" | "live"): string {
  return source === "fixture"
    ? "Cursor personal fixture loaded"
    : "Cursor personal usage page synced just now";
}

function buildCursorPersonalUsageSummary(
  snapshot: CursorPersonalUsageSnapshot,
): string | null {
  const summaryParts = [
    snapshot.billingPeriodLabel
      ? `Billing period: ${snapshot.billingPeriodLabel}`
      : null,
    snapshot.usageSeriesLabel,
    snapshot.visiblePlanLabels.length > 0
      ? `Visible plans: ${snapshot.visiblePlanLabels.join(" · ")}`
      : null,
    snapshot.onDemandUsageState !== null
      ? `On-demand usage is ${snapshot.onDemandUsageState}.`
      : null,
    snapshot.exportCsvAvailable ? "CSV export available" : null,
  ].filter(Boolean);

  if (summaryParts.length === 0) {
    return null;
  }

  return `Visible Cursor usage: ${summaryParts.join(" · ")}`;
}

function hasCursorAdminApiKey(secrets: ProviderSecrets): boolean {
  return Boolean(secrets.cursor.adminApiKey);
}

function canUseLiveCursorPersonalPage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.tabs?.query === "function" &&
    typeof chrome.scripting?.executeScript === "function"
  );
}

function getCursorPageSessionDiagnosticKind(
  status: "logged_out" | "open_page_required" | "route_drift",
): "logged_out" | "open_page_required" | "capture_unavailable" {
  if (status === "logged_out" || status === "open_page_required") {
    return status;
  }

  return "capture_unavailable";
}

function finalizeCursorSnapshot(
  snapshot: ProviderSnapshot,
  sourcePreference: ProviderSetting["sourcePreference"],
  selectedKind: ProviderSourceKind,
  fallbackFailure: SourceAttemptFailure | null,
): ProviderSnapshot {
  const sourceSelectionReason = buildSourceSelectionReason(
    "cursor",
    sourcePreference,
    selectedKind,
    fallbackFailure !== null,
  );
  const sourceFallbackReason = fallbackFailure
    ? buildSourceFallbackReason(fallbackFailure)
    : null;

  return {
    ...snapshot,
    usageWindows:
      selectedKind === "session_page" ? snapshot.usageWindows : undefined,
    usageBalances:
      selectedKind === "session_page" ? snapshot.usageBalances : undefined,
    usageSummary:
      selectedKind === "session_page" ? (snapshot.usageSummary ?? null) : null,
    sourceSelectionReason,
    sourceFallbackReason,
    sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
      providerId: "cursor",
      sourcePreference,
      selectedKind,
      hadFallback: fallbackFailure !== null,
      rawMessage: sourceSelectionReason,
    }),
    sourceFallbackDiagnostic:
      fallbackFailure && sourceFallbackReason
        ? createSourceFallbackDiagnostic({
            providerId: "cursor",
            sourcePreference,
            failure: fallbackFailure,
            rawMessage: sourceFallbackReason,
          })
        : null,
  };
}

function finalizeCursorNoSourceSnapshot(
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
    usageWindows: undefined,
    usageBalances: undefined,
    usageSummary: null,
    sourceSelectionReason,
    sourceFallbackReason,
    sourceSelectionDiagnostic: null,
    sourceFallbackDiagnostic: sourceFallbackReason
      ? createNoLiveSourceFallbackDiagnostic({
          providerId: "cursor",
          sourcePreference,
          failureCount: failures.length,
          rawMessage: sourceFallbackReason,
        })
      : null,
  };
}

async function tryCursorOfficialSource({
  provider,
  secrets,
  syncedAt,
  setting,
  warningThresholdPercent,
  now,
}: {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  syncedAt: string;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
}): Promise<CursorSourceAttemptResult> {
  if (setting.status === "missing") {
    const warningReason =
      "Host access missing; grant Cursor access for api.cursor.com and cursor.com before live sync can run.";

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "host_access_missing",
        detail:
          "Grant Cursor access for api.cursor.com and cursor.com before live sync can run.",
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: "cursor",
          sourceKind: "official_api",
          hostLabel: setting.hostsLabel,
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Cursor Admin API access required",
        resetLabel: "Grant Cursor host access to sync the Admin API path",
      },
    };
  }

  if (!hasCursorAdminApiKey(secrets)) {
    const warningReason =
      "No Cursor Admin API key is stored. Add a key or switch the source preference to Session page.";

    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: "No Cursor Admin API key is stored.",
      },
      snapshot: {
        ...provider,
        providerLabel: "Cursor",
        planName: "Cursor Team",
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason,
        warningDiagnostic: createCredentialDiagnostic({
          providerId: "cursor",
          credentialKind: "admin_api_key",
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Cursor Admin API key required",
        resetLabel: "Store a Cursor Admin API key to use the official team source",
      },
    };
  }

  try {
    const client = createCursorOfficialClient({
      source: "live",
      apiKey: secrets.cursor.adminApiKey!,
    });
    const [members, spend] = await Promise.all([
      client.getTeamMembers(),
      client.getTeamSpend(),
    ]);
    const dailyUsage = await client.getDailyUsageData({
      startDate: spend.subscriptionCycleStart,
      endDate: now.getTime(),
    });

    const billableUserCount = members.teamMembers.filter(
      (member) => member.role === "owner" || member.role === "member",
    ).length;
    const includedUsed = dailyUsage.data.reduce(
      (sum, row) => sum + row.subscriptionIncludedReqs,
      0,
    );
    const usageBasedRequests = dailyUsage.data.reduce(
      (sum, row) => sum + row.usageBasedReqs,
      0,
    );
    const total = billableUserCount > 0 ? billableUserCount * 500 : null;
    const remaining = total !== null ? Math.max(total - includedUsed, 0) : null;
    const cycleStart = new Date(spend.subscriptionCycleStart);
    const cycleReset = inferNextBillingReset(cycleStart, now);
    const usageSignal = buildUsageSignal(
      includedUsed,
      total,
      warningThresholdPercent,
      "requests",
      usageBasedRequests,
      "cursor",
    );

    return {
      ok: true,
      kind: "official_api",
      snapshot: {
        ...provider,
        providerLabel: "Cursor",
        planName:
          billableUserCount > 0
            ? `Cursor Team (${billableUserCount} billed)`
            : "Cursor Team",
        quotaUnit: "requests",
        quotaWindow: "monthly",
        used: includedUsed,
        remaining,
        total,
        resetAt: formatCalendarDate(cycleReset),
        resetLabel: `Billing cycle resets ${formatCalendarDate(cycleReset)}`,
        syncedAt,
        syncSource: "official",
        syncStatus: usageSignal.syncStatus,
        tone: usageSignal.tone,
        warningReason: usageSignal.warningReason,
        warningDiagnostic: usageSignal.warningDiagnostic,
        lastSyncLabel: buildCursorRefreshLabel(),
      },
    };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Cursor sync failed unexpectedly.";

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
          providerId: "cursor",
          adapterErrorKind: "unexpected_error",
          sourceKind: "official_api",
          failureCode: "sync_error",
          parserStage: "admin_api",
          rawMessage: detail,
        }),
        lastSyncLabel: "Cursor sync failed just now",
        resetLabel: "Retry after checking the Cursor Admin API configuration",
      },
    };
  }
}

async function tryCursorPersonalSource({
  provider,
  syncedAt,
  setting,
}: {
  provider: ProviderSnapshot;
  syncedAt: string;
  setting: ProviderSetting;
}): Promise<CursorSourceAttemptResult> {
  if (setting.status === "missing") {
    const warningReason =
      "Host access missing; grant Cursor access for api.cursor.com and cursor.com before live sync can run.";

    return {
      ok: false,
      failure: {
        kind: "session_page",
        code: "host_access_missing",
        detail:
          "Grant Cursor access for api.cursor.com and cursor.com before live sync can run.",
      },
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: "cursor",
          sourceKind: "session_page",
          hostLabel: setting.hostsLabel,
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Cursor personal usage page access required",
        resetLabel: "Grant Cursor host access to read the logged-in personal usage page",
      },
    };
  }

  try {
    const personalSource: "fixture" | "live" = canUseLiveCursorPersonalPage()
      ? "live"
      : "fixture";
    const client = createCursorPersonalPageClient({
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
          providerLabel: "Cursor",
          planName: "Cursor Personal Dashboard",
          quotaUnit: "requests",
          quotaWindow: "monthly",
          used: null,
          remaining: null,
          total: null,
          resetAt: "Current billing period",
          resetLabel:
            result.status === "logged_out"
              ? "Log back into Cursor and reopen the dashboard usage page"
              : result.status === "open_page_required"
                ? "Open the logged-in Cursor dashboard usage page and refresh again"
                : "Inspect the live Cursor route and update the parser assumptions",
          syncedAt,
          syncSource: "page_parse",
          syncStatus: isRecoverable ? "warning" : "error",
          tone: isRecoverable ? "warning" : "error",
          warningReason: result.reason,
          warningDiagnostic:
            result.status === "route_drift"
              ? createAdapterErrorDiagnostic({
                  providerId: "cursor",
                  adapterErrorKind: "parse_failed",
                  sourceKind: "session_page",
                  failureCode: "route_drift",
                  parserStage: "personal_usage_page",
                  rawMessage: result.reason,
                })
              : createPageSessionDiagnostic({
                  providerId: "cursor",
                  pageSessionKind: getCursorPageSessionDiagnosticKind(
                    result.status,
                  ),
                  rawMessage: result.reason,
                }),
          lastSyncLabel:
            result.status === "logged_out"
              ? "Cursor usage page session missing"
              : result.status === "open_page_required"
                ? "Cursor usage page not open"
                : "Cursor usage page parse failed",
        },
        setting: nextSetting,
      };
    }

    const snapshot = result.snapshot;
    const usageSummary = buildCursorPersonalUsageSummary(snapshot);
    const visiblePlanLabel =
      snapshot.visiblePlanLabels.length > 0
        ? `Visible plans: ${snapshot.visiblePlanLabels.join(" · ")}`
        : null;
    const onDemandNote =
      snapshot.onDemandUsageState !== null
        ? `On-demand usage is ${snapshot.onDemandUsageState}.`
        : null;
    const warningReason =
      onDemandNote ??
      (snapshot.exportCsvAvailable
        ? "CSV export is available on the current billing-period page."
        : visiblePlanLabel);

    return {
      ok: true,
      kind: "session_page",
      snapshot: {
        ...provider,
        providerLabel: "Cursor",
        planName: "Cursor Personal Dashboard",
        quotaUnit: "requests",
        quotaWindow: "monthly",
        used: null,
        remaining: null,
        total: null,
        resetAt: snapshot.billingPeriodLabel ?? "Current billing period",
        resetLabel:
          snapshot.usageSeriesLabel ??
          (snapshot.billingPeriodLabel
            ? `Current billing period ${snapshot.billingPeriodLabel}`
            : "Billing-period usage page attached"),
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "ok",
        tone: "neutral",
        warningReason,
        warningDiagnostic:
          snapshot.onDemandUsageState === "off" && warningReason
            ? createUsageThresholdDiagnostic({
                providerId: "cursor",
                usageThresholdKind: "on_demand_off",
                rawMessage: warningReason,
                unitLabel: "requests",
              })
            : null,
        usageWindows: undefined,
        usageBalances: undefined,
        usageSummary,
        lastSyncLabel: buildCursorPersonalRefreshLabel(personalSource),
      },
      setting: nextSetting,
    };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Cursor personal usage page sync failed unexpectedly.";

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
          providerId: "cursor",
          adapterErrorKind: "unexpected_error",
          sourceKind: "session_page",
          failureCode: "sync_error",
          parserStage: "personal_usage_page",
          rawMessage: detail,
        }),
        lastSyncLabel: "Cursor personal usage page sync failed just now",
        resetLabel:
          "Retry after checking the Cursor dashboard page and parser assumptions",
      },
      setting,
    };
  }
}

export async function syncCursorProvider({
  provider,
  secrets,
  setting,
  warningThresholdPercent,
  now,
}: CursorAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);
  const sourcePreference = normalizeSourcePreference(
    "cursor",
    setting.sourcePreference,
  );
  const attemptOrder = getSourceAttemptOrder("cursor", sourcePreference);
  const failures: SourceAttemptFailure[] = [];
  let firstFailedSnapshot: ProviderSnapshot | null = null;

  for (const sourceKind of attemptOrder) {
    const attempt =
      sourceKind === "official_api"
        ? await tryCursorOfficialSource({
            provider,
            secrets,
            syncedAt,
            setting,
            warningThresholdPercent,
            now,
          })
        : await tryCursorPersonalSource({
            provider,
            syncedAt,
            setting,
          });

    if (attempt.ok) {
      return {
        snapshot: finalizeCursorSnapshot(
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
        snapshot: finalizeCursorNoSourceSnapshot(
          attempt.snapshot,
          sourcePreference,
          failures,
        ),
        ...(attempt.setting ? { setting: attempt.setting } : {}),
      };
    }
  }

  return {
    snapshot: finalizeCursorNoSourceSnapshot(
      firstFailedSnapshot ?? {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "error",
        tone: "error",
        warningReason: "Cursor source selection could not resolve a live path.",
        warningDiagnostic: null,
        lastSyncLabel: "Cursor source selection failed just now",
        resetLabel: "Check Cursor source preferences and live prerequisites",
      },
      sourcePreference,
      failures,
    ),
  };
}

function inferNextBillingReset(cycleStart: Date, now: Date): Date {
  let candidate = addMonths(cycleStart, 1);

  while (candidate.getTime() <= now.getTime()) {
    candidate = addMonths(candidate, 1);
  }

  return candidate;
}
