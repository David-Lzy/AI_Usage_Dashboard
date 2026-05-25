import type { AppState } from "../providers/types";
import {
  ACTION_BADGE_ATTENTION_SELECTION,
  findActionBadgeQuotaCandidate,
  getEffectiveActionBadgeSelection,
  type ActionBadgeQuotaCandidate,
} from "../shared/action-badge-preferences";
import { getVisibleProviders, type ProviderViewModel } from "./view-models";

export type ActionBadgeModel = {
  text: string;
  title: string;
  backgroundColor: [number, number, number, number];
};

function buildAttentionBadgeModel(
  state: AppState,
  titleNote: string | null = null,
): ActionBadgeModel {
  const visibleProviders = getVisibleProviders(state);
  const attentionProviders = visibleProviders.filter(
    (provider) => provider.displaySyncStatus !== "ok",
  );
  const attentionCount = attentionProviders.length;
  const hasError = attentionProviders.some(
    (provider) => provider.displaySyncStatus === "error",
  );

  if (attentionCount === 0) {
    return {
      text: "",
      title: [
        "AI Usage Dashboard: all visible providers are healthy",
        titleNote,
      ]
        .filter((line): line is string => Boolean(line))
        .join("\n"),
      backgroundColor: [0, 0, 0, 0],
    };
  }

  const providerDetails = attentionProviders
    .map((provider) => {
      const reason =
        provider.warningReason ??
        provider.currentSourceStateDetail ??
        provider.currentSourceAvailabilitySummary;

      return reason
        ? `${provider.providerLabel}: ${reason}`
        : provider.providerLabel;
    })
    .slice(0, 4);

  return {
    text: String(attentionCount),
    title: [
      attentionCount === 1
        ? "AI Usage Dashboard: 1 visible provider needs attention"
        : `AI Usage Dashboard: ${attentionCount} visible providers need attention`,
      titleNote,
      ...providerDetails,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n"),
    backgroundColor: hasError ? [179, 38, 30, 255] : [161, 84, 0, 255],
  };
}

function formatBadgeNumber(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }

  if (absoluteValue >= 10_000) {
    return `${Math.round(value / 1_000)}k`;
  }

  if (absoluteValue >= 1_000) {
    return `${Number.parseFloat((value / 1_000).toFixed(1))}k`;
  }

  return String(Math.round(value));
}

function formatQuotaBadgeText(candidate: ActionBadgeQuotaCandidate): string {
  if (candidate.quotaUnit === "percent") {
    const roundedPercent = Math.round(candidate.remaining);

    return roundedPercent >= 100 ? "100" : `${roundedPercent}%`;
  }

  return formatBadgeNumber(candidate.remaining);
}

function formatQuotaTitleValue(candidate: ActionBadgeQuotaCandidate): string {
  if (candidate.quotaUnit === "percent") {
    return `${Math.round(candidate.remaining)}% remaining`;
  }

  return `${formatBadgeNumber(candidate.remaining)} ${candidate.quotaUnit} remaining`;
}

function formatStatusLabel(provider: ProviderViewModel): string {
  switch (provider.displaySyncStatus) {
    case "ok":
      return "Healthy";
    case "warning":
      return "Needs review";
    case "error":
      return "Sync issue";
  }
}

function formatResetTitleValue(
  candidate: ActionBadgeQuotaCandidate,
): string | null {
  if (!candidate.resetLabel) {
    return null;
  }

  const sourcePrefix = `${candidate.sourceLabel} resets at `;

  if (
    candidate.resetLabel
      .toLocaleLowerCase()
      .startsWith(sourcePrefix.toLocaleLowerCase())
  ) {
    return candidate.resetLabel.slice(sourcePrefix.length);
  }

  return candidate.resetLabel;
}

function formatProviderRemainingLine(
  provider: ProviderViewModel,
): string | null {
  if (
    typeof provider.remaining !== "number" ||
    !Number.isFinite(provider.remaining)
  ) {
    return null;
  }

  if (provider.quotaUnit === "percent") {
    return `${provider.quotaWindow}: ${Math.round(
      provider.remaining,
    )}% remaining`;
  }

  return `${provider.quotaWindow}: ${formatBadgeNumber(provider.remaining)} ${provider.quotaUnit} remaining`;
}

function buildProviderUsageWindowLines(provider: ProviderViewModel): string[] {
  return (provider.usageWindows ?? [])
    .filter(
      (usageWindow) =>
        typeof usageWindow.remaining === "number" &&
        Number.isFinite(usageWindow.remaining),
    )
    .slice(0, 3)
    .map(
      (usageWindow) =>
        `${usageWindow.normalizedLabel}: ${Math.round(
          usageWindow.remaining ?? 0,
        )}% remaining`,
    );
}

function buildProviderUsageFactLines(provider: ProviderViewModel): string[] {
  const usageFacts = provider.usageFacts ?? [];

  if (usageFacts.length === 0) {
    return [];
  }

  const firstFact = usageFacts[0];
  const remainingFacts = usageFacts.slice(1, 4);
  const lines = [`${firstFact.label}: ${firstFact.value}`];

  if (remainingFacts.length > 0) {
    lines.push(
      remainingFacts
        .map((fact) => `${fact.label}: ${fact.value}`)
        .join("; "),
    );
  }

  return lines;
}

function buildProviderUsageBalanceLines(provider: ProviderViewModel): string[] {
  return (provider.usageBalances ?? [])
    .filter(
      (usageBalance) =>
        typeof usageBalance.remaining === "number" &&
        Number.isFinite(usageBalance.remaining),
    )
    .slice(0, 2)
    .map(
      (usageBalance) =>
        `${usageBalance.normalizedLabel}: ${formatBadgeNumber(
          usageBalance.remaining ?? 0,
        )} ${usageBalance.quotaUnit} remaining`,
    );
}

function buildProviderTooltipDetailLines(provider: ProviderViewModel): string[] {
  const structuredLines = [
    ...buildProviderUsageWindowLines(provider),
    ...buildProviderUsageBalanceLines(provider),
    ...buildProviderUsageFactLines(provider),
  ];
  const fallbackRemainingLine = formatProviderRemainingLine(provider);
  const lines =
    structuredLines.length > 0
      ? structuredLines
      : fallbackRemainingLine
        ? [fallbackRemainingLine]
        : [];

  if (provider.warningReason) {
    lines.push(`Status: ${provider.warningReason}`);
  }

  return lines.slice(0, 4);
}

function buildVisibleProviderTitleLines(state: AppState): string[] {
  const visibleProviders = getVisibleProviders(state);

  if (visibleProviders.length === 0) {
    return [];
  }

  const lines = ["", "Visible providers"];

  for (const provider of visibleProviders.slice(0, 5)) {
    lines.push(`  ${provider.providerLabel}: ${formatStatusLabel(provider)}`);

    for (const detailLine of buildProviderTooltipDetailLines(provider)) {
      lines.push(`    ${detailLine}`);
    }
  }

  if (visibleProviders.length > 5) {
    lines.push(`  +${visibleProviders.length - 5} more visible providers`);
  }

  return lines;
}

function getRemainingPercent(candidate: ActionBadgeQuotaCandidate): number | null {
  if (candidate.quotaUnit === "percent") {
    return candidate.remaining;
  }

  if (candidate.total === null || candidate.total <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, (candidate.remaining / candidate.total) * 100));
}

function getQuotaBadgeBackgroundColor(
  candidate: ActionBadgeQuotaCandidate,
  warningThresholdPercent: number,
): [number, number, number, number] {
  const remainingPercent = getRemainingPercent(candidate);

  if (remainingPercent === null) {
    return [46, 125, 50, 255];
  }

  if (remainingPercent <= 10) {
    return [179, 38, 30, 255];
  }

  if (remainingPercent <= 100 - warningThresholdPercent) {
    return [161, 84, 0, 255];
  }

  return [46, 125, 50, 255];
}

function buildQuotaBadgeModel(
  candidate: ActionBadgeQuotaCandidate,
  state: AppState,
): ActionBadgeModel {
  const resetTitleValue = formatResetTitleValue(candidate);
  const titleLines = [
    "AI Usage Dashboard",
    "",
    "Selected badge",
    `  Provider: ${candidate.providerLabel}`,
    `  Source: ${candidate.sourceLabel}`,
    `  Remaining: ${formatQuotaTitleValue(candidate)}`,
    resetTitleValue ? `  Reset: ${resetTitleValue}` : null,
    candidate.syncedAt ? `  Synced: ${candidate.syncedAt}` : null,
    candidate.warningReason ? `  Status: ${candidate.warningReason}` : null,
    ...buildVisibleProviderTitleLines(state),
  ].filter((line): line is string => line !== null);

  return {
    text: formatQuotaBadgeText(candidate),
    title: titleLines.join("\n"),
    backgroundColor: getQuotaBadgeBackgroundColor(
      candidate,
      state.settings.warningThresholdPercent,
    ),
  };
}

export function buildActionBadgeModel(
  state: AppState,
  timestampMs = Date.now(),
): ActionBadgeModel {
  const selection = getEffectiveActionBadgeSelection(state, timestampMs);

  if (selection === ACTION_BADGE_ATTENTION_SELECTION) {
    return buildAttentionBadgeModel(state);
  }

  const candidate = findActionBadgeQuotaCandidate(state, selection);

  if (!candidate) {
    return buildAttentionBadgeModel(
      state,
      "Selected quota badge source is no longer available.",
    );
  }

  return buildQuotaBadgeModel(candidate, state);
}
