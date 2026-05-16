import type { ProviderTone, SummaryItem } from "../providers/types";
import type { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import type { RuntimeI18n } from "../shared/i18n";
import {
  hasProviderProductAttention,
  type ProviderViewModel,
} from "../sidepanel/view-models";
import type {
  PopupFirstSetupProvider,
  PopupSetupCoverage,
  PopupSetupCoverageStats,
  PopupSummaryLabels,
  PopupValueFormatter,
} from "./view-model-types";

export const DEFAULT_POPUP_SUMMARY_LABELS: PopupSummaryLabels = {
  visible: "Visible",
  liveReady: "Live ready",
  setupBlockers: "Setup blockers",
  policyOnly: "Policy-only",
};

export const DEFAULT_POPUP_VALUE_FORMATTER: PopupValueFormatter = (value) =>
  String(value);

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function needsAttention(provider: ProviderViewModel): boolean {
  return hasProviderProductAttention(provider);
}

export function buildSetupCoverageStats(
  visibleProviders: ProviderViewModel[],
): PopupSetupCoverageStats {
  return {
    providerCount: visibleProviders.length,
    liveReadyProviders: visibleProviders.filter(
      (provider) =>
        provider.permissionStatus === "granted" &&
        provider.currentSourceStateKind === "ready",
    ),
    providersNeedingAccess: visibleProviders.filter(
      (provider) => provider.permissionStatus === "missing",
    ),
    providersNeedingCredentials: visibleProviders.filter(
      (provider) =>
        provider.permissionStatus === "granted" &&
        provider.currentSourceStateKind === "credential_missing",
    ),
    policyOnlyProviders: visibleProviders.filter(
      (provider) => provider.currentSourceStateKind === "policy_only",
    ),
    providersNeedingReview: visibleProviders.filter(
      (provider) =>
        provider.permissionStatus === "granted" &&
        provider.currentSourceStateKind !== "ready" &&
        provider.currentSourceStateKind !== "credential_missing" &&
        provider.currentSourceStateKind !== "policy_only",
    ),
  };
}

function buildSetupBlockerSentence(
  providersNeedingAccess: ProviderViewModel[],
  providersNeedingCredentials: ProviderViewModel[],
): string {
  const parts: string[] = [];

  if (providersNeedingAccess.length > 0) {
    parts.push(
      `${providersNeedingAccess.length} ${pluralize(
        providersNeedingAccess.length,
        "provider",
      )} ${providersNeedingAccess.length === 1 ? "needs" : "need"} host access.`,
    );
  }

  if (providersNeedingCredentials.length > 0) {
    parts.push(
      `${providersNeedingCredentials.length} ${pluralize(
        providersNeedingCredentials.length,
        "provider",
      )} ${providersNeedingCredentials.length === 1 ? "needs" : "need"} credentials.`,
    );
  }

  return parts.join(" ");
}

export function buildSetupCoverage(
  visibleProviders: ProviderViewModel[],
  formatValue: PopupValueFormatter = DEFAULT_POPUP_VALUE_FORMATTER,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupSetupCoverage {
  const {
    providerCount,
    liveReadyProviders,
    providersNeedingAccess,
    providersNeedingCredentials,
    policyOnlyProviders,
    providersNeedingReview,
  } = buildSetupCoverageStats(visibleProviders);

  if (visibleProviders.length === 0) {
    const providerLabel = firstSetupProvider?.providerLabel ?? "one provider";

    return {
      label: "Setup coverage",
      statusLabel: "Start setup",
      tone: "warning",
      headline: "No visible providers configured",
      detail:
        firstSetupProvider
          ? `Enable ${providerLabel} in Settings > Quick Setup first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.`
          : "Enable one provider in Settings > Quick Setup first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
      items: [
        {
          label: "Live ready",
          value: formatValue(0),
          tone: "neutral",
        },
        {
          label: "Host access",
          value: formatValue(0),
          tone: "neutral",
        },
        {
          label: "Credentials",
          value: formatValue(0),
          tone: "neutral",
        },
        {
          label: "Policy-only",
          value: formatValue(0),
          tone: "neutral",
        },
      ],
      action: {
        kind: "settings",
        label: firstSetupProvider ? "Open Quick Setup" : "Open settings",
        ...(firstSetupProvider
          ? { providerId: firstSetupProvider.providerId }
          : {}),
      },
    };
  }

  const setupBlockerCount =
    providersNeedingAccess.length + providersNeedingCredentials.length;
  const allPolicyOnly = policyOnlyProviders.length === providerCount;

  let statusLabel = "Ready";
  let tone: ProviderTone = "neutral";
  let detail =
    "No settings setup blockers are visible here. Use the grid below to confirm live-ready versus policy-only coverage.";

  if (setupBlockerCount > 0) {
    statusLabel = "Needs setup";
    tone = "warning";
    detail = `Finish settings setup before treating this popup as ready. ${buildSetupBlockerSentence(
      providersNeedingAccess,
      providersNeedingCredentials,
    )}`;
  } else if (providersNeedingReview.length > 0) {
    statusLabel = "Needs review";
    tone = providersNeedingReview.some(
      (provider) => provider.displaySyncStatus === "error",
    )
      ? "error"
      : "warning";
    detail = `Settings setup is clear, but ${providersNeedingReview.length} ${pluralize(
      providersNeedingReview.length,
      "provider",
    )} ${providersNeedingReview.length === 1 ? "still needs" : "still need"} in-product review after setup.`;
  } else if (allPolicyOnly) {
    statusLabel = "Contract-only";
    tone = "neutral";
    detail =
      "Visible providers are configured, but their current contract is policy-only rather than one live in-browser path.";
  } else if (policyOnlyProviders.length > 0) {
    detail = `${liveReadyProviders.length} ${pluralize(
      liveReadyProviders.length,
      "provider",
    )} ${liveReadyProviders.length === 1 ? "is" : "are"} live-ready. ${policyOnlyProviders.length} ${pluralize(
      policyOnlyProviders.length,
      "provider",
    )} ${policyOnlyProviders.length === 1 ? "is" : "are"} policy-only.`;
  }

  return {
    label: "Setup coverage",
    statusLabel,
    tone,
    headline: `${providerCount} visible ${pluralize(providerCount, "provider")}`,
    detail,
    items: [
      {
        label: "Live ready",
        value: formatValue(liveReadyProviders.length),
        tone: liveReadyProviders.length > 0 ? "neutral" : "warning",
      },
      {
        label: "Host access",
        value: formatValue(providersNeedingAccess.length),
        tone: providersNeedingAccess.length > 0 ? "warning" : "neutral",
      },
      {
        label: "Credentials",
        value: formatValue(providersNeedingCredentials.length),
        tone:
          providersNeedingCredentials.length > 0 ? "warning" : "neutral",
      },
      {
        label: "Policy-only",
        value: formatValue(policyOnlyProviders.length),
        tone: "neutral",
      },
    ],
    action: null,
  };
}

export function buildPopupHeaderDetail(
  visibleProviders: ProviderViewModel[],
  setupCoverage: PopupSetupCoverage,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): string {
  if (visibleProviders.length === 0) {
    return firstSetupProvider
      ? `Start in Settings > Quick Setup with ${firstSetupProvider.providerLabel}. Once one provider is visible, this popup will summarize live readiness and next steps.`
      : "Start in Settings > Quick Setup. Once one provider is visible, this popup will summarize live readiness and next steps.";
  }

  if (setupCoverage.statusLabel === "Needs setup") {
    return "Use this popup to separate setup blockers from the providers that are already ready.";
  }

  if (setupCoverage.statusLabel === "Contract-only") {
    return "This popup is showing current contract context rather than one live in-browser sync path.";
  }

  if (setupCoverage.statusLabel === "Needs review") {
    return "Settings setup is clear. Use this popup for quick review and freshness triage.";
  }

  return "Use this popup for quick freshness and provider triage without reopening the full dashboard.";
}

export function buildPopupSummaryItems(
  visibleProviders: ProviderViewModel[],
  setupCoverage: PopupSetupCoverage,
  labels: PopupSummaryLabels = DEFAULT_POPUP_SUMMARY_LABELS,
  formatValue: PopupValueFormatter = DEFAULT_POPUP_VALUE_FORMATTER,
): SummaryItem[] {
  const stats = buildSetupCoverageStats(visibleProviders);
  const setupBlockerCount =
    stats.providersNeedingAccess.length + stats.providersNeedingCredentials.length;

  return [
    {
      label: labels.visible,
      value: formatValue(stats.providerCount),
      tone: "neutral",
    },
    {
      label: labels.liveReady,
      value: formatValue(stats.liveReadyProviders.length),
      tone:
        stats.liveReadyProviders.length > 0 ||
        setupCoverage.statusLabel === "Contract-only" ||
        stats.providerCount === 0
          ? "neutral"
          : "warning",
    },
    {
      label: labels.setupBlockers,
      value: formatValue(setupBlockerCount),
      tone: setupBlockerCount > 0 ? "warning" : "neutral",
    },
    {
      label: labels.policyOnly,
      value: formatValue(stats.policyOnlyProviders.length),
      tone: "neutral",
    },
  ];
}

export function buildLocalizedSetupCoverage(
  visibleProviders: ProviderViewModel[],
  existingItems: SummaryItem[],
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupSetupCoverage {
  const {
    providerCount,
    liveReadyProviders,
    providersNeedingAccess,
    providersNeedingCredentials,
    policyOnlyProviders,
    providersNeedingReview,
  } = buildSetupCoverageStats(visibleProviders);

  if (visibleProviders.length === 0) {
    return {
      label: copy.setupCoverage.label,
      statusLabel: copy.setupCoverage.statusStartSetup,
      tone: "warning",
      headline: copy.setupCoverage.noVisibleHeadline,
      detail: firstSetupProvider
        ? copy.setupCoverage.noVisibleDetailForProvider(
            firstSetupProvider.providerLabel,
          )
        : copy.setupCoverage.noVisibleDetail,
      items: [
        {
          ...existingItems[0],
          label: copy.setupCoverage.liveReadyItemLabel,
        },
        {
          ...existingItems[1],
          label: copy.setupCoverage.hostAccessItemLabel,
        },
        {
          ...existingItems[2],
          label: copy.setupCoverage.credentialsItemLabel,
        },
        {
          ...existingItems[3],
          label: copy.setupCoverage.policyOnlyItemLabel,
        },
      ],
      action: {
        kind: "settings",
        label: firstSetupProvider
          ? copy.guidance.openQuickSetupAction
          : i18n.t("common.actions.open_settings"),
        ...(firstSetupProvider
          ? { providerId: firstSetupProvider.providerId }
          : {}),
      },
    };
  }

  const setupBlockerCount =
    providersNeedingAccess.length + providersNeedingCredentials.length;
  const allPolicyOnly = policyOnlyProviders.length === providerCount;

  let statusLabel = copy.setupCoverage.statusReady;
  let tone: ProviderTone = "neutral";
  let detail = copy.setupCoverage.readyDetail;

  if (setupBlockerCount > 0) {
    statusLabel = copy.setupCoverage.statusNeedsSetup;
    tone = "warning";
    detail = copy.setupCoverage.needsSetupDetail(
      copy.setupCoverage.buildSetupBlockerSentence(
        providersNeedingAccess.length,
        providersNeedingCredentials.length,
      ),
    );
  } else if (providersNeedingReview.length > 0) {
    statusLabel = copy.setupCoverage.statusNeedsReview;
    tone = providersNeedingReview.some(
      (provider) => provider.displaySyncStatus === "error",
    )
      ? "error"
      : "warning";
    detail = copy.setupCoverage.needsReviewDetail(providersNeedingReview.length);
  } else if (allPolicyOnly) {
    statusLabel = copy.setupCoverage.statusContractOnly;
    tone = "neutral";
    detail = copy.setupCoverage.contractOnlyDetail;
  } else if (policyOnlyProviders.length > 0) {
    detail = copy.setupCoverage.mixedReadyPolicyDetail(
      liveReadyProviders.length,
      policyOnlyProviders.length,
    );
  }

  return {
    label: copy.setupCoverage.label,
    statusLabel,
    tone,
    headline: copy.setupCoverage.visibleProvidersHeadline(providerCount),
    detail,
    items: [
      {
        ...existingItems[0],
        label: copy.setupCoverage.liveReadyItemLabel,
      },
      {
        ...existingItems[1],
        label: copy.setupCoverage.hostAccessItemLabel,
      },
      {
        ...existingItems[2],
        label: copy.setupCoverage.credentialsItemLabel,
      },
      {
        ...existingItems[3],
        label: copy.setupCoverage.policyOnlyItemLabel,
      },
    ],
    action: null,
  };
}

export function buildLocalizedHeaderDetail(
  visibleProviders: ProviderViewModel[],
  setupCoverage: PopupSetupCoverage,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
) {
  if (visibleProviders.length === 0) {
    return firstSetupProvider
      ? copy.header.noVisibleForProvider(firstSetupProvider.providerLabel)
      : copy.header.noVisible;
  }

  if (setupCoverage.statusLabel === copy.setupCoverage.statusNeedsSetup) {
    return copy.header.needsSetup;
  }

  if (setupCoverage.statusLabel === copy.setupCoverage.statusContractOnly) {
    return copy.header.contractOnly;
  }

  if (setupCoverage.statusLabel === copy.setupCoverage.statusNeedsReview) {
    return copy.header.needsReview;
  }

  return copy.header.ready;
}
