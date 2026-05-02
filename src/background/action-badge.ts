import type { AppState } from "../providers/types";
import {
  ACTION_BADGE_ATTENTION_SELECTION,
  findActionBadgeQuotaCandidate,
  normalizeActionBadgeSelection,
  type ActionBadgeQuotaCandidate,
} from "../shared/action-badge-preferences";
import { getVisibleProviders } from "../sidepanel/view-models";

export type ActionBadgeModel = {
  text: string;
  title: string;
  backgroundColor: [number, number, number, number];
};

function hasChromeActionApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.action?.setBadgeText === "function" &&
    typeof chrome.action?.setBadgeBackgroundColor === "function" &&
    typeof chrome.action?.setTitle === "function"
  );
}

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
    return `${Math.round(candidate.remaining)}%`;
  }

  return formatBadgeNumber(candidate.remaining);
}

function formatQuotaTitleValue(candidate: ActionBadgeQuotaCandidate): string {
  if (candidate.quotaUnit === "percent") {
    return `${Math.round(candidate.remaining)}% remaining`;
  }

  return `${formatBadgeNumber(candidate.remaining)} ${candidate.quotaUnit} remaining`;
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
  const titleLines = [
    "AI Usage Dashboard",
    `${candidate.providerLabel}: ${candidate.sourceLabel}`,
    `Remaining: ${formatQuotaTitleValue(candidate)}`,
    candidate.resetLabel ? `Reset: ${candidate.resetLabel}` : null,
    candidate.syncedAt ? `Synced: ${candidate.syncedAt}` : null,
    candidate.usageSummary ? `Details: ${candidate.usageSummary}` : null,
    candidate.warningReason ? `Status: ${candidate.warningReason}` : null,
  ].filter((line): line is string => Boolean(line));

  return {
    text: formatQuotaBadgeText(candidate),
    title: titleLines.join("\n"),
    backgroundColor: getQuotaBadgeBackgroundColor(
      candidate,
      state.settings.warningThresholdPercent,
    ),
  };
}

export function buildActionBadgeModel(state: AppState): ActionBadgeModel {
  const selection = normalizeActionBadgeSelection(
    state.settings.actionBadgeSelection,
  );

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

export async function syncActionBadgeFromState(state: AppState): Promise<void> {
  if (!hasChromeActionApi()) {
    return;
  }

  const badge = buildActionBadgeModel(state);

  await chrome.action.setBadgeText({ text: badge.text });
  await chrome.action.setBadgeBackgroundColor({
    color: badge.backgroundColor,
  });
  await chrome.action.setTitle({ title: badge.title });
}
