import type {
  ActionBadgeSelection,
  AppState,
  ProviderId,
  ProviderSnapshot,
  ProviderUsageBalance,
  ProviderUsageWindow,
  QuotaUnit,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";

export const ACTION_BADGE_ATTENTION_SELECTION: ActionBadgeSelection = "attention";
export const DEFAULT_ACTION_BADGE_SELECTION = ACTION_BADGE_ATTENTION_SELECTION;

const QUOTA_SELECTION_PREFIX = "quota:";

export type ActionBadgeQuotaCandidateKind =
  | "provider_remaining"
  | "usage_window"
  | "usage_balance";

export type ActionBadgeQuotaCandidate = {
  value: ActionBadgeSelection;
  kind: ActionBadgeQuotaCandidateKind;
  providerId: ProviderId;
  providerLabel: string;
  sourceLabel: string;
  remaining: number;
  quotaUnit: QuotaUnit;
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

function getEnabledProviderIds(state: AppState): Set<ProviderId> {
  return new Set(
    state.providerSettings
      .filter((provider) => provider.enabled)
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

  return candidates;
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

export function getEffectiveActionBadgeSelection(
  state: AppState,
): ActionBadgeSelection {
  const selection = normalizeActionBadgeSelection(
    state.settings.actionBadgeSelection,
  );

  if (selection === ACTION_BADGE_ATTENTION_SELECTION) {
    return selection;
  }

  return findActionBadgeQuotaCandidate(state, selection)
    ? selection
    : ACTION_BADGE_ATTENTION_SELECTION;
}

function formatCandidateUnit(
  candidate: ActionBadgeQuotaCandidate,
  i18n: RuntimeI18n,
): string {
  if (candidate.quotaUnit === "percent") {
    return i18n.resolvedLocale === "zh-CN" ? "剩余" : "remaining";
  }

  if (i18n.resolvedLocale === "zh-CN") {
    switch (candidate.quotaUnit) {
      case "credits":
        return "积分剩余";
      case "requests":
        return "请求剩余";
      case "sessions":
        return "会话剩余";
      default:
        return "剩余";
    }
  }

  return `${candidate.quotaUnit} remaining`;
}

export function buildActionBadgeSelectOptions(
  state: AppState,
  i18n: RuntimeI18n,
): ActionBadgeSelectOption[] {
  const attentionLabel =
    i18n.resolvedLocale === "zh-CN" ? "异常数量" : "Needs attention count";

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
