import type {
  ActionBadgeSelectionMode,
  ActionBadgeSelection,
  ActionBadgeSelections,
  AppState,
  ProviderId,
  ProviderSnapshot,
  ProviderUsageBalance,
  ProviderUsageWindow,
} from "../providers/types";
import type { DashboardSourceId } from "./custom-sources";
import { getVisibleCustomSources } from "./custom-source-view-models";
import {
  DISPLAY_SURFACES,
  resolveProgressItemPreferences,
} from "./display-preferences";
import type { RuntimeI18n } from "./i18n";
import { buildRuntimeCommonCopy } from "./i18n";
import { buildProviderProgressItems } from "./provider-progress-items";
import { normalizeActionBadgeRotationIntervalSeconds } from "./settings-preferences";

export const ACTION_BADGE_ATTENTION_SELECTION: ActionBadgeSelection = "attention";
export const DEFAULT_ACTION_BADGE_SELECTION = ACTION_BADGE_ATTENTION_SELECTION;
export const DEFAULT_ACTION_BADGE_SELECTIONS: ActionBadgeSelections = [
  ACTION_BADGE_ATTENTION_SELECTION,
];
export const DEFAULT_ACTION_BADGE_SELECTION_MODE: ActionBadgeSelectionMode =
  "auto";

const QUOTA_SELECTION_PREFIX = "quota:";

export type ActionBadgeQuotaCandidateKind =
  | "provider_remaining"
  | "usage_window"
  | "usage_balance"
  | "custom_source";

export type ActionBadgeQuotaCandidate = {
  value: ActionBadgeSelection;
  kind: ActionBadgeQuotaCandidateKind;
  providerId: DashboardSourceId;
  progressItemId: string;
  providerLabel: string;
  sourceLabel: string;
  remaining: number;
  quotaUnit: string;
  total: number | null;
  resetLabel: string | null;
  syncedAt: string;
  usageSummary: string | null;
  warningReason: string | null;
};

export type ActionBadgeSelectOption = {
  value: ActionBadgeSelection;
  label: string;
};

function encodeSelectionPart(value: string | null | undefined): string {
  return encodeURIComponent(value ?? "");
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function normalizeActionBadgeSelection(
  value: unknown,
): ActionBadgeSelection {
  if (value === ACTION_BADGE_ATTENTION_SELECTION) {
    return ACTION_BADGE_ATTENTION_SELECTION;
  }

  if (typeof value === "string" && value.startsWith(QUOTA_SELECTION_PREFIX)) {
    return value as ActionBadgeSelection;
  }

  return DEFAULT_ACTION_BADGE_SELECTION;
}

export function normalizeActionBadgeSelections(
  value: unknown,
  legacyValue: unknown = DEFAULT_ACTION_BADGE_SELECTION,
): ActionBadgeSelections {
  const rawValues = Array.isArray(value) ? value : [legacyValue];
  const normalizedSelections: ActionBadgeSelection[] = [];

  for (const rawValue of rawValues) {
    const normalizedSelection = normalizeActionBadgeSelection(rawValue);

    if (!normalizedSelections.includes(normalizedSelection)) {
      normalizedSelections.push(normalizedSelection);
    }
  }

  return normalizedSelections.length > 0
    ? normalizedSelections
    : [...DEFAULT_ACTION_BADGE_SELECTIONS];
}

function isDefaultOrEmptyActionBadgeSelection(
  value: unknown,
  legacyValue: unknown,
): boolean {
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  return normalizeActionBadgeSelections(value, legacyValue).every(
    (selection) => selection === ACTION_BADGE_ATTENTION_SELECTION,
  );
}

export function normalizeActionBadgeSelectionMode(
  value: unknown,
  selections: unknown,
  legacySelection: unknown,
): ActionBadgeSelectionMode {
  if (value === "auto" || value === "manual") {
    return value;
  }

  return isDefaultOrEmptyActionBadgeSelection(selections, legacySelection)
    ? "auto"
    : "manual";
}

function getEnabledProviderIds(state: AppState): Set<ProviderId> {
  return new Set(
    state.providerSettings
      .filter((provider) => provider.displayEnabled)
      .map((provider) => provider.id),
  );
}

function buildProviderRemainingCandidate(
  provider: ProviderSnapshot,
): ActionBadgeQuotaCandidate | null {
  if (!isFiniteNumber(provider.remaining)) {
    return null;
  }

  return {
    value: `${QUOTA_SELECTION_PREFIX}${provider.providerId}:primary`,
    kind: "provider_remaining",
    providerId: provider.providerId,
    progressItemId: "primary",
    providerLabel: provider.providerLabel,
    sourceLabel: provider.planName || provider.providerLabel,
    remaining: provider.remaining,
    quotaUnit: provider.quotaUnit,
    total: provider.total,
    resetLabel: provider.resetLabel || provider.resetAt || null,
    syncedAt: provider.syncedAt,
    usageSummary: provider.usageSummary ?? null,
    warningReason: provider.warningReason,
  };
}

function buildUsageWindowCandidate(
  provider: ProviderSnapshot,
  usageWindow: ProviderUsageWindow,
  index: number,
): ActionBadgeQuotaCandidate | null {
  if (!isFiniteNumber(usageWindow.remaining)) {
    return null;
  }

  const sourceKey = [
    usageWindow.kind,
    usageWindow.normalizedLabel,
    usageWindow.modelLabel ?? "",
    String(index),
  ]
    .map(encodeSelectionPart)
    .join(":");

  return {
    value: `${QUOTA_SELECTION_PREFIX}${provider.providerId}:window:${sourceKey}`,
    kind: "usage_window",
    providerId: provider.providerId,
    progressItemId: `window:${sourceKey}`,
    providerLabel: provider.providerLabel,
    sourceLabel: usageWindow.normalizedLabel || usageWindow.label,
    remaining: usageWindow.remaining,
    quotaUnit: usageWindow.quotaUnit,
    total: usageWindow.total,
    resetLabel: usageWindow.resetLabel ?? usageWindow.resetAt ?? null,
    syncedAt: provider.syncedAt,
    usageSummary: provider.usageSummary ?? null,
    warningReason: provider.warningReason,
  };
}

function buildUsageBalanceCandidate(
  provider: ProviderSnapshot,
  usageBalance: ProviderUsageBalance,
  index: number,
): ActionBadgeQuotaCandidate | null {
  if (!isFiniteNumber(usageBalance.remaining)) {
    return null;
  }

  const sourceKey = [
    usageBalance.kind,
    usageBalance.normalizedLabel,
    String(index),
  ]
    .map(encodeSelectionPart)
    .join(":");

  return {
    value: `${QUOTA_SELECTION_PREFIX}${provider.providerId}:balance:${sourceKey}`,
    kind: "usage_balance",
    providerId: provider.providerId,
    progressItemId: `balance:${sourceKey}`,
    providerLabel: provider.providerLabel,
    sourceLabel: usageBalance.normalizedLabel || usageBalance.label,
    remaining: usageBalance.remaining,
    quotaUnit: usageBalance.quotaUnit,
    total: usageBalance.total,
    resetLabel: usageBalance.detail,
    syncedAt: provider.syncedAt,
    usageSummary: provider.usageSummary ?? null,
    warningReason: provider.warningReason,
  };
}

export function buildActionBadgeQuotaCandidates(
  state: AppState,
): ActionBadgeQuotaCandidate[] {
  const enabledProviderIds = getEnabledProviderIds(state);
  const candidates: ActionBadgeQuotaCandidate[] = [];

  for (const provider of state.providers) {
    if (!enabledProviderIds.has(provider.providerId)) {
      continue;
    }

    const usageWindowCandidates = (provider.usageWindows ?? [])
      .map((usageWindow, index) =>
        buildUsageWindowCandidate(provider, usageWindow, index),
      )
      .filter(
        (candidate): candidate is ActionBadgeQuotaCandidate =>
          candidate !== null,
      );
    const usageBalanceCandidates = (provider.usageBalances ?? [])
      .map((usageBalance, index) =>
        buildUsageBalanceCandidate(provider, usageBalance, index),
      )
      .filter(
        (candidate): candidate is ActionBadgeQuotaCandidate =>
          candidate !== null,
      );
    const providerRemainingCandidate = buildProviderRemainingCandidate(provider);

    candidates.push(...usageWindowCandidates);

    if (
      providerRemainingCandidate &&
      (usageWindowCandidates.length === 0 ||
        providerRemainingCandidate.quotaUnit !== "percent")
    ) {
      candidates.push(providerRemainingCandidate);
    }

    candidates.push(...usageBalanceCandidates);
  }

  for (const source of getVisibleCustomSources(state)) {
    for (const item of source.progressItems) {
      if (!isFiniteNumber(item.remaining)) {
        continue;
      }

      candidates.push({
        value: `${QUOTA_SELECTION_PREFIX}${source.sourceId}:${item.id}`,
        kind: "custom_source",
        providerId: source.sourceId,
        progressItemId: item.id,
        providerLabel: source.label,
        sourceLabel: item.label,
        remaining: item.remaining,
        quotaUnit: item.quotaUnit,
        total: item.total,
        resetLabel: item.resetLabel ?? item.resetAt,
        syncedAt: source.lastSyncLabel,
        usageSummary: source.usageSummary,
        warningReason: source.warningReason,
      });
    }
  }

  return candidates;
}

function buildKnownProgressItemIdsBySource(
  state: AppState,
): Map<DashboardSourceId, readonly string[]> {
  const knownItemIds = new Map<DashboardSourceId, readonly string[]>();

  for (const provider of state.providers) {
    knownItemIds.set(
      provider.providerId,
      buildProviderProgressItems(provider).map((item) => item.id),
    );
  }

  for (const source of getVisibleCustomSources(state)) {
    knownItemIds.set(
      source.sourceId,
      source.progressItems.map((item) => item.id),
    );
  }

  return knownItemIds;
}

function isCandidateVisibleOnAnySurface(
  state: AppState,
  candidate: ActionBadgeQuotaCandidate,
  knownItemIdsBySource: ReadonlyMap<DashboardSourceId, readonly string[]>,
): boolean {
  const knownItemIds = knownItemIdsBySource.get(candidate.providerId) ?? [];

  if (!knownItemIds.includes(candidate.progressItemId)) {
    return false;
  }

  return DISPLAY_SURFACES.some((surface) =>
    resolveProgressItemPreferences(
      state.settings.progressItemsBySurface[surface][candidate.providerId],
      knownItemIds,
    ).some(
      (preference) =>
        preference.id === candidate.progressItemId && preference.visible,
    ),
  );
}

export function findActionBadgeQuotaCandidate(
  state: AppState,
  selection: ActionBadgeSelection,
): ActionBadgeQuotaCandidate | null {
  if (selection === ACTION_BADGE_ATTENTION_SELECTION) {
    return null;
  }

  return (
    buildActionBadgeQuotaCandidates(state).find(
      (candidate) => candidate.value === selection,
    ) ?? null
  );
}

export function getAvailableActionBadgeSelections(
  state: AppState,
): ActionBadgeSelections {
  return [
    ACTION_BADGE_ATTENTION_SELECTION,
    ...buildActionBadgeQuotaCandidates(state).map((candidate) => candidate.value),
  ];
}

export function getSelectedActionBadgeSelections(
  state: AppState,
): ActionBadgeSelections {
  return getEffectiveActionBadgeSelections(state);
}

export function getEffectiveActionBadgeSelections(
  state: AppState,
): ActionBadgeSelections {
  const quotaCandidates = buildActionBadgeQuotaCandidates(state);

  if (state.settings.actionBadgeSelectionMode === "auto") {
    const knownItemIdsBySource = buildKnownProgressItemIdsBySource(state);
    const quotaSelections = quotaCandidates
      .filter((candidate) =>
        isCandidateVisibleOnAnySurface(
          state,
          candidate,
          knownItemIdsBySource,
        ),
      )
      .map((candidate) => candidate.value);

    return quotaSelections.length > 0
      ? quotaSelections
      : [...DEFAULT_ACTION_BADGE_SELECTIONS];
  }

  const quotaSelections = quotaCandidates.map((candidate) => candidate.value);

  const availableSelectionSet = new Set<ActionBadgeSelection>([
    ACTION_BADGE_ATTENTION_SELECTION,
    ...quotaSelections,
  ]);
  const selections = normalizeActionBadgeSelections(
    state.settings.actionBadgeSelections,
    state.settings.actionBadgeSelection,
  ).filter((selection) => availableSelectionSet.has(selection));

  return selections.length > 0 ? selections : [...DEFAULT_ACTION_BADGE_SELECTIONS];
}

export function getStoredActionBadgeSelections(
  state: AppState,
): ActionBadgeSelections {
  return normalizeActionBadgeSelections(
    state.settings.actionBadgeSelections,
    state.settings.actionBadgeSelection,
  );
}

export function getEffectiveActionBadgeSelection(
  state: AppState,
  timestampMs = Date.now(),
): ActionBadgeSelection {
  const selections = getEffectiveActionBadgeSelections(state);

  if (selections.length <= 1) {
    return selections[0] ?? ACTION_BADGE_ATTENTION_SELECTION;
  }

  const rotationIntervalMs = Math.max(
    1,
    normalizeActionBadgeRotationIntervalSeconds(
      state.settings.actionBadgeRotationIntervalSeconds,
    ) * 1000,
  );
  const rotationIndex =
    Math.floor(Math.max(0, timestampMs) / rotationIntervalMs) %
    selections.length;

  return selections[rotationIndex] ?? ACTION_BADGE_ATTENTION_SELECTION;
}

function formatCandidateUnit(
  candidate: ActionBadgeQuotaCandidate,
  i18n: RuntimeI18n,
): string {
  const commonCopy = buildRuntimeCommonCopy(i18n);

  if (candidate.quotaUnit === "percent") {
    return commonCopy.remaining;
  }

  return commonCopy.quotaUnitRemainingLabel(candidate.quotaUnit);
}

export function buildActionBadgeSelectOptions(
  state: AppState,
  i18n: RuntimeI18n,
): ActionBadgeSelectOption[] {
  const attentionLabel = buildRuntimeCommonCopy(i18n).needsAttentionCount;

  return [
    {
      value: ACTION_BADGE_ATTENTION_SELECTION,
      label: attentionLabel,
    },
    ...buildActionBadgeQuotaCandidates(state).map((candidate) => ({
      value: candidate.value,
      label:
        candidate.quotaUnit === "percent"
          ? `${candidate.providerLabel} · ${candidate.sourceLabel} ${formatCandidateUnit(candidate, i18n)}`
          : `${candidate.providerLabel} · ${candidate.sourceLabel} · ${formatCandidateUnit(candidate, i18n)}`,
    })),
  ];
}
