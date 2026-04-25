import type {
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSyncOutcome,
} from "../types";
import { formatSyncTimestamp } from "../normalize";
import { createAdapterErrorDiagnostic } from "../diagnostics";
import {
  createClaudeCodeAnalyticsClient,
  type ClaudeCodeAnalyticsRecord,
} from "./official";

type ClaudeCodeAdapterContext = {
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
};

function buildClaudeRefreshLabel(): string {
  return "Claude Code Analytics API synced just now";
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

export async function syncClaudeCodeProvider({
  provider,
  secrets,
  setting,
  warningThresholdPercent: _warningThresholdPercent,
  now,
}: ClaudeCodeAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);

  if (setting.status === "missing") {
    return {
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason:
          "Claude MVP currently supports organizations with Admin API access; personal Pro or Max plans are not supported.",
        lastSyncLabel: "Claude Admin API access required",
        sourceSelectionReason:
          "Official API is the only shipped live source for Claude Code.",
        sourceFallbackReason: null,
        resetLabel: "Connect a Claude organization with Admin API access to sync analytics",
      },
    };
  }

  if (!secrets["claude-code"].adminApiKey) {
    return {
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason:
          "A Claude Admin API key is required before live analytics sync can run.",
        lastSyncLabel: "Claude Admin API key required",
        sourceSelectionReason:
          "Official API is the only shipped live source for Claude Code.",
        sourceFallbackReason: null,
        resetLabel:
          "Add a Claude organization Admin API key in Settings to sync analytics",
      },
    };
  }

  try {
    const client = createClaudeCodeAnalyticsClient({
      source: "live",
      apiKey: secrets["claude-code"].adminApiKey,
    });
    const startingAt = inferStartingAt(now);
    const report = await client.getUsageReport({
      startingAt,
      limit: 100,
    });

    if (report.data.length === 0) {
      return {
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
          lastSyncLabel: buildClaudeRefreshLabel(),
          sourceSelectionReason:
            "Official API is the only shipped live source for Claude Code.",
          sourceFallbackReason: null,
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
    const customerTypes = [...new Set(report.data.map((record) => record.customer_type))];
    const scopeLabel =
      customerTypes.length === 1
        ? customerTypes[0] === "api"
          ? "API org"
          : "Subscription org"
        : "Mixed org";
    const reportDay = report.data[0]?.date.slice(0, 10) ?? startingAt;

    return {
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
        lastSyncLabel: buildClaudeRefreshLabel(),
        sourceSelectionReason:
          "Official API is the only shipped live source for Claude Code.",
        sourceFallbackReason: null,
      },
    };
  } catch (error) {
    const warningReason =
      error instanceof Error
        ? error.message
        : "Claude Code analytics sync failed unexpectedly.";

    return {
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "official",
        syncStatus: "error",
        tone: "error",
        warningReason,
        warningDiagnostic: createAdapterErrorDiagnostic({
          providerId: "claude-code",
          adapterErrorKind: "unexpected_error",
          sourceKind: "official_api",
          failureCode: "sync_error",
          parserStage: "analytics_api",
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Claude analytics sync failed just now",
        sourceSelectionReason:
          "Official API is the only shipped live source for Claude Code.",
        sourceFallbackReason: null,
        resetLabel:
          "Retry after checking Claude Admin API access and analytics configuration",
      },
    };
  }
}
