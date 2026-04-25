import type {
  AppState,
  ProviderId,
  ProviderTone,
  SummaryItem,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/localized-copy";
import type { ProviderSourceDisplayCopy } from "../shared/provider-sources";
import {
  getVisibleProviders,
  type ProviderViewModel,
} from "../sidepanel/view-models";

export type PopupSnapshotStatus = {
  label: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
};

export type PopupGuidanceAction = {
  kind: "settings" | "dashboard" | "provider-detail";
  label: string;
  providerId?: ProviderId;
};

export type PopupGuidanceCard = {
  label: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
  action: PopupGuidanceAction;
};

export type PopupFeaturedSection = {
  label: string;
  headline: string;
  detail: string;
  emptyStateHeadline: string | null;
  emptyStateDetail: string | null;
};

export type PopupSetupCoverage = {
  label: string;
  statusLabel: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
  items: SummaryItem[];
};

export type PopupActionSection = {
  label: string;
  detail: string;
  actions: PopupGuidanceAction[];
};

export type PopupSurfaceRolesCard = {
  label: string;
  headline: string;
  detail: string;
};

export type PopupFeaturedProviderCard = {
  provider: ProviderViewModel;
  statusLabel: string;
  metaChips: string[];
  primaryDetail: string;
  secondaryDetail: string;
  action: PopupGuidanceAction;
};

export type PopupViewModel = {
  headerDetail: string;
  summaryItems: SummaryItem[];
  visibleProviders: ProviderViewModel[];
  featuredProviders: ProviderViewModel[];
  featuredProviderCards: PopupFeaturedProviderCard[];
  showSnapshotStatus: boolean;
  snapshotStatus: PopupSnapshotStatus;
  guidanceCard: PopupGuidanceCard | null;
  setupCoverage: PopupSetupCoverage;
  actionSection: PopupActionSection;
  surfaceRolesCard: PopupSurfaceRolesCard;
  featuredSection: PopupFeaturedSection;
};

type PopupSetupCoverageStats = {
  providerCount: number;
  liveReadyProviders: ProviderViewModel[];
  providersNeedingAccess: ProviderViewModel[];
  providersNeedingCredentials: ProviderViewModel[];
  policyOnlyProviders: ProviderViewModel[];
  providersNeedingReview: ProviderViewModel[];
};

export type PopupSummaryLabels = {
  visible: string;
  liveReady: string;
  setupBlockers: string;
  policyOnly: string;
};

const DEFAULT_POPUP_SUMMARY_LABELS: PopupSummaryLabels = {
  visible: "Visible",
  liveReady: "Live ready",
  setupBlockers: "Setup blockers",
  policyOnly: "Policy-only",
};

type PopupValueFormatter = (value: number) => string;

const DEFAULT_POPUP_VALUE_FORMATTER: PopupValueFormatter = (value) => String(value);

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function needsAttention(provider: ProviderViewModel): boolean {
  return (
    provider.permissionStatus === "missing" ||
    provider.displaySyncStatus !== "ok" ||
    (provider.currentSourceStateKind !== "ready" &&
      provider.currentSourceStateKind !== "policy_only")
  );
}

function getNewestVisibleProvider(
  visibleProviders: ProviderViewModel[],
): ProviderViewModel | null {
  if (visibleProviders.length === 0) {
    return null;
  }

  return visibleProviders.reduce((newest, provider) =>
    provider.syncedAt.localeCompare(newest.syncedAt) > 0 ? provider : newest,
  );
}

function getOldestVisibleProvider(
  visibleProviders: ProviderViewModel[],
): ProviderViewModel | null {
  if (visibleProviders.length === 0) {
    return null;
  }

  return visibleProviders.reduce((oldest, provider) =>
    provider.syncedAt.localeCompare(oldest.syncedAt) < 0 ? provider : oldest,
  );
}

function buildSnapshotStatus(
  visibleProviders: ProviderViewModel[],
): PopupSnapshotStatus {
  if (visibleProviders.length === 0) {
    return {
      label: "No providers",
      tone: "warning",
      headline: "No visible providers",
      detail:
        "No shared popup snapshot exists yet. Enable one provider to start caching state here.",
    };
  }

  const newestProvider = getNewestVisibleProvider(visibleProviders);
  const oldestProvider = getOldestVisibleProvider(visibleProviders);

  if (!newestProvider || !oldestProvider) {
    return {
      label: "No providers",
      tone: "warning",
      headline: "No visible providers",
      detail:
        "No shared popup snapshot exists yet. Enable one provider to start caching state here.",
    };
  }

  const hasError = visibleProviders.some(
    (provider) => provider.displaySyncStatus === "error",
  );
  const hasWarnings = visibleProviders.some(
    (provider) =>
      provider.displaySyncStatus === "warning" ||
      provider.permissionStatus === "missing",
  );
  const isAligned = newestProvider.syncedAt === oldestProvider.syncedAt;

  const label = hasError
    ? "Sync issue"
    : hasWarnings || !isAligned
      ? "Mixed state"
      : "Aligned";
  const tone: ProviderTone = hasError
    ? "error"
    : hasWarnings || !isAligned
      ? "warning"
      : "neutral";

  return {
    label,
    tone,
    headline: newestProvider.lastSyncLabel,
    detail: isAligned
      ? visibleProviders.length === 1
        ? "The visible provider shares the same cached snapshot window."
        : `All ${visibleProviders.length} visible providers share the same cached snapshot window.`
      : `Newest visible snapshot: ${newestProvider.providerLabel} (${newestProvider.lastSyncLabel}). Oldest visible snapshot: ${oldestProvider.providerLabel} (${oldestProvider.lastSyncLabel}).`,
  };
}

function buildGuidanceCard(
  visibleProviders: ProviderViewModel[],
): PopupGuidanceCard | null {
  if (visibleProviders.length === 0) {
    return {
      label: "Start here",
      tone: "warning",
      headline: "Enable a provider in settings",
      detail:
        "The popup only becomes useful after at least one provider is visible. Start in settings, then return here for one-click status and attention triage.",
      action: {
        kind: "settings",
        label: "Open settings",
      },
    };
  }

  const providersMissingAccess = visibleProviders.filter(
    (provider) => provider.permissionStatus === "missing",
  );

  if (providersMissingAccess.length > 0) {
    const firstProvider = providersMissingAccess[0];

    return {
      label: "Next step",
      tone: "warning",
      headline:
        providersMissingAccess.length === 1
          ? `Grant access for ${firstProvider.providerLabel}`
          : "Grant host access in settings",
      detail:
        providersMissingAccess.length === 1
          ? firstProvider.hostAccessRequirementDetail ||
            firstProvider.currentSourceStateDetail ||
            `${firstProvider.providerLabel} still needs optional host access before the popup can report a healthy live state.`
          : `${providersMissingAccess.length} visible providers still need optional host access before the popup can settle into one aligned healthy snapshot.`,
      action: {
        kind: "settings",
        label: "Open settings",
      },
    };
  }

  const providersMissingCredential = visibleProviders.filter(
    (provider) => provider.currentSourceStateKind === "credential_missing",
  );

  if (providersMissingCredential.length > 0) {
    const firstProvider = providersMissingCredential[0];

    return {
      label: "Next step",
      tone: "warning",
      headline:
        providersMissingCredential.length === 1
          ? `Add credentials for ${firstProvider.providerLabel}`
          : "Add credentials in settings",
      detail:
        providersMissingCredential.length === 1
          ? firstProvider.currentSourceStateDetail ||
            `${firstProvider.providerLabel} still needs a configured credential before this path can run live sync.`
          : `${providersMissingCredential.length} visible providers still depend on one missing stored credential before their current live path can run cleanly.`,
      action: {
        kind: "settings",
        label: "Open settings",
      },
    };
  }

  const firstBlockedProvider = visibleProviders.find(
    (provider) =>
      provider.displaySyncStatus !== "ok" ||
      (provider.currentSourceStateKind !== "ready" &&
        provider.currentSourceStateKind !== "policy_only"),
  );

  if (firstBlockedProvider) {
    return {
      label: "Next step",
      tone: firstBlockedProvider.displayTone,
      headline: `Review ${firstBlockedProvider.providerLabel}`,
      detail:
        firstBlockedProvider.warningReason ??
        firstBlockedProvider.currentSourceStateDetail ??
        firstBlockedProvider.currentSourceAvailabilitySummary,
      action: {
        kind: "provider-detail",
        label: "Open detail",
        providerId: firstBlockedProvider.providerId,
      },
    };
  }

  const allPolicyOnly = visibleProviders.every(
    (provider) => provider.currentSourceStateKind === "policy_only",
  );

  if (allPolicyOnly) {
    return {
      label: "Current contract",
      tone: "neutral",
      headline: "Visible providers are policy-only",
      detail:
        "The popup can still summarize shared cached state, but these visible providers do not expose one live in-browser usage path in this profile. Use dashboard and settings to review the current provider contracts.",
      action: {
        kind: "dashboard",
        label: "Open dashboard",
      },
    };
  }

  return null;
}

function buildFeaturedSection(
  visibleProviders: ProviderViewModel[],
  attentionProviders: ProviderViewModel[],
): PopupFeaturedSection {
  if (visibleProviders.length === 0) {
    return {
      label: "Provider triage",
      headline: "Nothing to triage yet",
      detail:
        "This section becomes actionable after at least one provider is visible in settings.",
      emptyStateHeadline: "No provider cards yet",
      emptyStateDetail:
        "Enable one provider in settings, then come back here for one-click provider triage.",
    };
  }

  if (attentionProviders.length > 0) {
    return {
      label: "Needs attention",
      headline: "Featured providers",
      detail:
        "The popup shows up to three providers, preferring the ones that still need setup or in-product review.",
      emptyStateHeadline: null,
      emptyStateDetail: null,
    };
  }

  const allPolicyOnly = visibleProviders.every(
    (provider) => provider.currentSourceStateKind === "policy_only",
  );

  if (allPolicyOnly) {
    return {
      label: "Current contract",
      headline: "Policy-only providers",
      detail:
        "No visible provider exposes one live in-browser path in this profile, so these cards stay contract-focused instead of action-focused.",
      emptyStateHeadline: null,
      emptyStateDetail: null,
    };
  }

  return {
    label: "All clear",
    headline: "Healthy providers",
    detail:
      "No visible provider currently needs setup or review, so this section keeps the top providers visible for current path and freshness at a glance.",
    emptyStateHeadline: null,
    emptyStateDetail: null,
  };
}

function buildPopupFeaturedStatusLabel(provider: ProviderViewModel): string {
  if (provider.permissionStatus === "missing") {
    return "Needs access";
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return "Needs setup";
    case "open_page_required":
      return "Open page";
    case "logged_out":
      return "Sign in";
    case "sync_error":
      return "Needs review";
    case "policy_only":
      return "Contract-only";
    case "ready":
      return provider.displaySyncStatus === "ok"
        ? "Healthy"
        : provider.displaySyncStatus === "warning"
          ? "Warning"
          : "Sync issue";
  }

  return "Healthy";
}

function buildPopupFeaturedPrimaryDetail(provider: ProviderViewModel): string {
  if (provider.permissionStatus === "missing") {
    return "Current path is blocked on host access.";
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return "Current path still needs stored credentials.";
    case "open_page_required":
      return "Current path still needs a live page session.";
    case "logged_out":
      return "Current path needs the signed-in page again.";
    case "sync_error":
      return "Settings setup is clear, but this provider still needs review.";
    case "policy_only":
      return "Current contract is policy-only in this profile.";
    case "ready":
      return "Current path is live-ready in this profile.";
  }

  return "Current path is live-ready in this profile.";
}

function buildPopupFeaturedSecondaryDetail(provider: ProviderViewModel): string {
  if (provider.permissionStatus === "missing") {
    return (
      provider.hostAccessRequirementDetail ||
      provider.currentSourceStateDetail ||
      provider.currentSourceAvailabilitySummary
    );
  }

  if (
    provider.currentSourceStateKind === "policy_only" ||
    provider.currentSourceStateKind === "ready"
  ) {
    return provider.usageSummary ?? provider.currentSourceAvailabilitySummary;
  }

  return (
    provider.warningReason ??
    provider.currentSourceStateDetail ??
    provider.currentSourceAvailabilitySummary
  );
}

function buildPopupFeaturedMetaChips(provider: ProviderViewModel): string[] {
  return [provider.currentSourceContractLabel, provider.lastSyncLabel];
}

function buildLocalizedPopupFeaturedMetaChips(
  provider: ProviderViewModel,
  i18n: RuntimeI18n,
): string[] {
  return [
    provider.currentSourceContractLabel,
    i18n.localizeRelativeRuntimeLabel(provider.lastSyncLabel),
  ];
}

function buildPopupFeaturedProviderCard(
  provider: ProviderViewModel,
): PopupFeaturedProviderCard {
  return {
    provider,
    statusLabel: buildPopupFeaturedStatusLabel(provider),
    metaChips: buildPopupFeaturedMetaChips(provider),
    primaryDetail: buildPopupFeaturedPrimaryDetail(provider),
    secondaryDetail: buildPopupFeaturedSecondaryDetail(provider),
    action: buildPopupFeaturedAction(provider),
  };
}

function buildPopupFeaturedAction(provider: ProviderViewModel): PopupGuidanceAction {
  if (
    provider.permissionStatus === "missing" ||
    provider.currentSourceStateKind === "credential_missing"
  ) {
    return {
      kind: "settings",
      label: "Open settings",
    };
  }

  if (provider.currentSourceStateKind === "policy_only") {
    return {
      kind: "dashboard",
      label: "Open dashboard",
    };
  }

  if (
    provider.currentSourceStateKind !== "ready" ||
    provider.displaySyncStatus !== "ok"
  ) {
    return {
      kind: "provider-detail",
      label: "Review detail",
      providerId: provider.providerId,
    };
  }

  return {
    kind: "provider-detail",
    label: "Open detail",
    providerId: provider.providerId,
  };
}

function buildSetupCoverageStats(
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

function buildSetupCoverage(
  visibleProviders: ProviderViewModel[],
  formatValue: PopupValueFormatter = DEFAULT_POPUP_VALUE_FORMATTER,
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
      label: "Setup coverage",
      statusLabel: "Start setup",
      tone: "warning",
      headline: "No visible providers configured",
      detail:
        "Enable one provider in settings first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
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
  };
}

function buildPopupHeaderDetail(
  visibleProviders: ProviderViewModel[],
  setupCoverage: PopupSetupCoverage,
): string {
  if (visibleProviders.length === 0) {
    return "Start in settings. Once one provider is visible, this popup will summarize live readiness and next steps.";
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

function buildPopupSummaryItems(
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

function buildActionSection(
  guidanceCard: PopupGuidanceCard | null,
): PopupActionSection {
  const dashboardAction: PopupGuidanceAction = {
    kind: "dashboard",
    label: "Open dashboard",
  };
  const settingsAction: PopupGuidanceAction = {
    kind: "settings",
    label: "Open settings",
  };

  if (!guidanceCard) {
    return {
      label: "Quick Actions",
      detail:
        "Open the dashboard for the full multi-provider overview, or jump into settings when you need provider toggles, permissions, or source controls.",
      actions: [dashboardAction, settingsAction],
    };
  }

  if (guidanceCard.action.kind === "settings") {
    return {
      label: "Other route",
      detail:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      actions: [dashboardAction],
    };
  }

  if (guidanceCard.action.kind === "dashboard") {
    return {
      label: "Other route",
      detail:
        "The primary next step is above. Use settings when you need provider toggles, permissions, or stored credentials.",
      actions: [settingsAction],
    };
  }

  return {
    label: "Secondary actions",
    detail:
      "The primary next step is above. Use dashboard or settings if you need a broader surface.",
    actions: [dashboardAction, settingsAction],
  };
}

function buildSurfaceRolesCard(
  visibleProviders: ProviderViewModel[],
  guidanceCard: PopupGuidanceCard | null,
): PopupSurfaceRolesCard {
  if (visibleProviders.length === 0) {
    return {
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        "Use settings to enable providers, grant host access, and add credentials. The dashboard becomes useful after at least one provider is visible.",
    };
  }

  if (guidanceCard?.action.kind === "settings") {
    return {
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        "Use settings for provider toggles, host access, and stored credentials. The popup stays a quick triage layer until setup is clear.",
    };
  }

  if (guidanceCard?.action.kind === "dashboard") {
    return {
      label: "Surface roles",
      headline: "Dashboard owns contract review",
      detail:
        "Use dashboard for broader contract context across visible providers. Settings still owns provider controls and stored credentials.",
    };
  }

  if (guidanceCard?.action.kind === "provider-detail") {
    return {
      label: "Surface roles",
      headline: "Provider detail owns review",
      detail:
        "Use provider detail for one provider's current path and health after setup is already clear. Dashboard stays the broader multi-provider surface.",
    };
  }

  return {
    label: "Surface roles",
    headline: "Popup stays quick glance",
    detail:
      "Use dashboard for broader multi-provider context, settings for controls, and provider detail only when you need one provider's deeper contract and health.",
  };
}

function buildLocalizedSnapshotStatus(
  visibleProviders: ProviderViewModel[],
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupSnapshotStatus {
  if (visibleProviders.length === 0) {
    return {
      label: copy.snapshotStatus.noProvidersLabel,
      tone: "warning",
      headline: copy.snapshotStatus.noProvidersHeadline,
      detail: copy.snapshotStatus.noProvidersDetail,
    };
  }

  const newestProvider = getNewestVisibleProvider(visibleProviders);
  const oldestProvider = getOldestVisibleProvider(visibleProviders);

  if (!newestProvider || !oldestProvider) {
    return {
      label: copy.snapshotStatus.noProvidersLabel,
      tone: "warning",
      headline: copy.snapshotStatus.noProvidersHeadline,
      detail: copy.snapshotStatus.noProvidersDetail,
    };
  }

  const hasError = visibleProviders.some(
    (provider) => provider.displaySyncStatus === "error",
  );
  const hasWarnings = visibleProviders.some(
    (provider) =>
      provider.displaySyncStatus === "warning" ||
      provider.permissionStatus === "missing",
  );
  const isAligned = newestProvider.syncedAt === oldestProvider.syncedAt;
  const label = hasError
    ? copy.snapshotStatus.syncIssueLabel
    : hasWarnings || !isAligned
      ? copy.snapshotStatus.mixedStateLabel
      : copy.snapshotStatus.alignedLabel;
  const tone: ProviderTone = hasError
    ? "error"
    : hasWarnings || !isAligned
      ? "warning"
      : "neutral";
  const newestLastSyncLabel = i18n.localizeRelativeRuntimeLabel(
    newestProvider.lastSyncLabel,
  );
  const oldestLastSyncLabel = i18n.localizeRelativeRuntimeLabel(
    oldestProvider.lastSyncLabel,
  );

  return {
    label,
    tone,
    headline: newestLastSyncLabel,
    detail: isAligned
      ? visibleProviders.length === 1
        ? copy.snapshotStatus.alignedSingleDetail
        : copy.snapshotStatus.alignedManyDetail(visibleProviders.length)
      : copy.snapshotStatus.mixedDetail(
          newestProvider.providerLabel,
          newestLastSyncLabel,
          oldestProvider.providerLabel,
          oldestLastSyncLabel,
        ),
  };
}

function buildLocalizedGuidanceCard(
  visibleProviders: ProviderViewModel[],
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupGuidanceCard | null {
  if (visibleProviders.length === 0) {
    return {
      label: copy.guidance.startHereLabel,
      tone: "warning",
      headline: copy.guidance.enableProviderHeadline,
      detail: copy.guidance.enableProviderDetail,
      action: {
        kind: "settings",
        label: i18n.t("common.actions.open_settings"),
      },
    };
  }

  const providersMissingAccess = visibleProviders.filter(
    (provider) => provider.permissionStatus === "missing",
  );

  if (providersMissingAccess.length > 0) {
    const firstProvider = providersMissingAccess[0];

    return {
      label: copy.guidance.nextStepLabel,
      tone: "warning",
      headline:
        providersMissingAccess.length === 1
          ? copy.guidance.grantAccessSingleHeadline(firstProvider.providerLabel)
          : copy.guidance.grantAccessManyHeadline,
      detail:
        providersMissingAccess.length === 1
          ? copy.guidance.singleMissingAccessDetail(
              firstProvider.providerLabel,
              firstProvider.hostAccessRequirementDetail ||
                firstProvider.currentSourceStateDetail ||
                `${firstProvider.providerLabel} still needs optional host access before the popup can report a healthy live state.`,
            )
          : copy.guidance.multipleMissingAccessDetail(
              providersMissingAccess.length,
            ),
      action: {
        kind: "settings",
        label: i18n.t("common.actions.open_settings"),
      },
    };
  }

  const providersMissingCredential = visibleProviders.filter(
    (provider) => provider.currentSourceStateKind === "credential_missing",
  );

  if (providersMissingCredential.length > 0) {
    const firstProvider = providersMissingCredential[0];

    return {
      label: copy.guidance.nextStepLabel,
      tone: "warning",
      headline:
        providersMissingCredential.length === 1
          ? copy.guidance.addCredentialsSingleHeadline(firstProvider.providerLabel)
          : copy.guidance.addCredentialsManyHeadline,
      detail:
        providersMissingCredential.length === 1
          ? copy.guidance.singleMissingCredentialDetail(
              firstProvider.providerLabel,
              firstProvider.currentSourceStateDetail ||
                `${firstProvider.providerLabel} still needs a configured credential before this path can run live sync.`,
            )
          : copy.guidance.multipleMissingCredentialDetail(
              providersMissingCredential.length,
            ),
      action: {
        kind: "settings",
        label: i18n.t("common.actions.open_settings"),
      },
    };
  }

  const firstBlockedProvider = visibleProviders.find(
    (provider) =>
      provider.displaySyncStatus !== "ok" ||
      (provider.currentSourceStateKind !== "ready" &&
        provider.currentSourceStateKind !== "policy_only"),
  );

  if (firstBlockedProvider) {
    return {
      label: copy.guidance.nextStepLabel,
      tone: firstBlockedProvider.displayTone,
      headline: copy.guidance.reviewProviderHeadline(
        firstBlockedProvider.providerLabel,
      ),
      detail:
        firstBlockedProvider.warningReason ??
        firstBlockedProvider.currentSourceStateDetail ??
        firstBlockedProvider.currentSourceAvailabilitySummary,
      action: {
        kind: "provider-detail",
        label: copy.guidance.openDetail,
        providerId: firstBlockedProvider.providerId,
      },
    };
  }

  const allPolicyOnly = visibleProviders.every(
    (provider) => provider.currentSourceStateKind === "policy_only",
  );

  if (allPolicyOnly) {
    return {
      label: copy.guidance.currentContractLabel,
      tone: "neutral",
      headline: copy.guidance.policyOnlyHeadline,
      detail: copy.guidance.policyOnlyDetail,
      action: {
        kind: "dashboard",
        label: i18n.t("common.actions.open_dashboard"),
      },
    };
  }

  return null;
}

function buildLocalizedFeaturedSection(
  visibleProviders: ProviderViewModel[],
  attentionProviders: ProviderViewModel[],
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupFeaturedSection {
  if (visibleProviders.length === 0) {
    return {
      label: copy.featuredSection.providerTriageLabel,
      headline: copy.featuredSection.nothingToTriageHeadline,
      detail: copy.featuredSection.actionableAfterVisibleDetail,
      emptyStateHeadline: copy.featuredSection.noProviderCardsYetHeadline,
      emptyStateDetail: copy.featuredSection.enableProviderComeBackDetail,
    };
  }

  if (attentionProviders.length > 0) {
    return {
      label: copy.featuredSection.needsAttentionLabel,
      headline: copy.featuredSection.featuredProvidersHeadline,
      detail: copy.featuredSection.needsAttentionDetail,
      emptyStateHeadline: null,
      emptyStateDetail: null,
    };
  }

  const allPolicyOnly = visibleProviders.every(
    (provider) => provider.currentSourceStateKind === "policy_only",
  );

  if (allPolicyOnly) {
    return {
      label: copy.featuredSection.currentContractLabel,
      headline: copy.featuredSection.policyOnlyProvidersHeadline,
      detail: copy.featuredSection.policyOnlyProvidersDetail,
      emptyStateHeadline: null,
      emptyStateDetail: null,
    };
  }

  return {
    label: copy.featuredSection.allClearLabel,
    headline: copy.featuredSection.healthyProvidersHeadline,
    detail: copy.featuredSection.healthyProvidersDetail,
    emptyStateHeadline: null,
    emptyStateDetail: null,
  };
}

function buildLocalizedFeaturedStatusLabel(
  provider: ProviderViewModel,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): string {
  if (provider.permissionStatus === "missing") {
    return copy.featuredCard.statusNeedsAccess;
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return copy.featuredCard.statusNeedsSetup;
    case "open_page_required":
      return copy.featuredCard.statusOpenPage;
    case "logged_out":
      return copy.featuredCard.statusSignIn;
    case "sync_error":
      return copy.featuredCard.statusNeedsReview;
    case "policy_only":
      return copy.featuredCard.statusContractOnly;
    case "ready":
      return provider.displaySyncStatus === "ok"
        ? copy.featuredCard.statusHealthy
        : provider.displaySyncStatus === "warning"
          ? copy.featuredCard.statusWarning
          : copy.featuredCard.statusSyncIssue;
  }

  return copy.featuredCard.statusHealthy;
}

function buildLocalizedFeaturedPrimaryDetail(
  provider: ProviderViewModel,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): string {
  if (provider.permissionStatus === "missing") {
    return copy.featuredCard.primaryBlockedHostAccess;
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return copy.featuredCard.primaryNeedsCredentials;
    case "open_page_required":
      return copy.featuredCard.primaryNeedsLivePage;
    case "logged_out":
      return copy.featuredCard.primaryNeedsSignedInPage;
    case "sync_error":
      return copy.featuredCard.primaryNeedsReview;
    case "policy_only":
      return copy.featuredCard.primaryPolicyOnly;
    case "ready":
      return copy.featuredCard.primaryLiveReady;
  }

  return copy.featuredCard.primaryLiveReady;
}

function buildLocalizedFeaturedProviderCard(
  provider: ProviderViewModel,
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupFeaturedProviderCard {
  return {
    provider,
    statusLabel: buildLocalizedFeaturedStatusLabel(provider, copy),
    metaChips: buildLocalizedPopupFeaturedMetaChips(provider, i18n),
    primaryDetail: buildLocalizedFeaturedPrimaryDetail(provider, copy),
    secondaryDetail: buildPopupFeaturedSecondaryDetail(provider),
    action:
      provider.permissionStatus === "missing" ||
      provider.currentSourceStateKind === "credential_missing"
        ? {
            kind: "settings",
            label: i18n.t("common.actions.open_settings"),
          }
        : provider.currentSourceStateKind === "policy_only"
          ? {
              kind: "dashboard",
              label: i18n.t("common.actions.open_dashboard"),
            }
          : provider.currentSourceStateKind !== "ready" ||
              provider.displaySyncStatus !== "ok"
            ? {
                kind: "provider-detail",
                label: copy.featuredCard.reviewDetailAction,
                providerId: provider.providerId,
              }
            : {
                kind: "provider-detail",
                label: copy.featuredCard.openDetailAction,
                providerId: provider.providerId,
              },
  };
}

function buildLocalizedSetupCoverage(
  visibleProviders: ProviderViewModel[],
  existingItems: SummaryItem[],
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
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
      detail: copy.setupCoverage.noVisibleDetail,
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
  };
}

function buildLocalizedHeaderDetail(
  visibleProviders: ProviderViewModel[],
  setupCoverage: PopupSetupCoverage,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
) {
  if (visibleProviders.length === 0) {
    return copy.header.noVisible;
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

function buildLocalizedActionSection(
  guidanceCard: PopupGuidanceCard | null,
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupActionSection {
  const dashboardAction: PopupGuidanceAction = {
    kind: "dashboard",
    label: i18n.t("common.actions.open_dashboard"),
  };
  const settingsAction: PopupGuidanceAction = {
    kind: "settings",
    label: i18n.t("common.actions.open_settings"),
  };

  if (!guidanceCard) {
    return {
      label: copy.actionSection.quickActionsLabel,
      detail: copy.actionSection.detailBroaderSurface,
      actions: [dashboardAction, settingsAction],
    };
  }

  if (guidanceCard.action.kind === "settings") {
    return {
      label: copy.actionSection.otherRouteLabel,
      detail: copy.actionSection.detailDashboardFirst,
      actions: [dashboardAction],
    };
  }

  if (guidanceCard.action.kind === "dashboard") {
    return {
      label: copy.actionSection.otherRouteLabel,
      detail: copy.actionSection.detailSettingsFirst,
      actions: [settingsAction],
    };
  }

  return {
    label: copy.actionSection.secondaryActionsLabel,
    detail: copy.actionSection.detailBroaderSurface,
    actions: [dashboardAction, settingsAction],
  };
}

function buildLocalizedSurfaceRolesCard(
  visibleProviders: ProviderViewModel[],
  guidanceCard: PopupGuidanceCard | null,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupSurfaceRolesCard {
  if (visibleProviders.length === 0) {
    return {
      label: copy.surfaceRoles.label,
      headline: copy.surfaceRoles.settingsOwnsSetupHeadline,
      detail: copy.surfaceRoles.settingsOwnsSetupNoVisibleDetail,
    };
  }

  if (guidanceCard?.action.kind === "settings") {
    return {
      label: copy.surfaceRoles.label,
      headline: copy.surfaceRoles.settingsOwnsSetupHeadline,
      detail: copy.surfaceRoles.settingsOwnsSetupDetail,
    };
  }

  if (guidanceCard?.action.kind === "dashboard") {
    return {
      label: copy.surfaceRoles.label,
      headline: copy.surfaceRoles.dashboardOwnsContractReviewHeadline,
      detail: copy.surfaceRoles.dashboardOwnsContractReviewDetail,
    };
  }

  if (guidanceCard?.action.kind === "provider-detail") {
    return {
      label: copy.surfaceRoles.label,
      headline: copy.surfaceRoles.providerDetailOwnsReviewHeadline,
      detail: copy.surfaceRoles.providerDetailOwnsReviewDetail,
    };
  }

  return {
    label: copy.surfaceRoles.label,
    headline: copy.surfaceRoles.popupQuickGlanceHeadline,
    detail: copy.surfaceRoles.popupQuickGlanceDetail,
  };
}

export function localizePopupViewModel(
  model: PopupViewModel,
  i18n: RuntimeI18n,
): PopupViewModel {
  const copy = buildPopupLocalizedCopy(i18n);
  const visibleProviders = model.visibleProviders;
  const attentionProviders = visibleProviders.filter(needsAttention);
  const guidanceCard = buildLocalizedGuidanceCard(visibleProviders, i18n, copy);
  const setupCoverage = buildLocalizedSetupCoverage(
    visibleProviders,
    model.setupCoverage.items,
    copy,
  );

  return {
    ...model,
    headerDetail: buildLocalizedHeaderDetail(visibleProviders, setupCoverage, copy),
    summaryItems: [
      {
        ...model.summaryItems[0],
        label: i18n.t("popup.summary.visible"),
      },
      {
        ...model.summaryItems[1],
        label: i18n.t("popup.summary.live_ready"),
      },
      {
        ...model.summaryItems[2],
        label: i18n.t("popup.summary.setup_blockers"),
      },
      {
        ...model.summaryItems[3],
        label: i18n.t("popup.summary.policy_only"),
      },
    ],
    snapshotStatus: buildLocalizedSnapshotStatus(visibleProviders, i18n, copy),
    guidanceCard,
    setupCoverage,
    actionSection: buildLocalizedActionSection(guidanceCard, i18n, copy),
    surfaceRolesCard: buildLocalizedSurfaceRolesCard(
      visibleProviders,
      guidanceCard,
      copy,
    ),
    featuredSection: buildLocalizedFeaturedSection(
      visibleProviders,
      attentionProviders,
      copy,
    ),
    featuredProviderCards: model.featuredProviders.map((provider) =>
      buildLocalizedFeaturedProviderCard(provider, i18n, copy),
    ),
  };
}


export function buildPopupViewModel(
  state: AppState,
  summaryLabels: PopupSummaryLabels = DEFAULT_POPUP_SUMMARY_LABELS,
  formatValue: PopupValueFormatter = DEFAULT_POPUP_VALUE_FORMATTER,
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
): PopupViewModel {
  const visibleProviders = getVisibleProviders(state, sourceDisplayCopy);
  const attentionProviders = visibleProviders.filter(needsAttention);
  const guidanceCard = buildGuidanceCard(visibleProviders);
  const setupCoverage = buildSetupCoverage(visibleProviders, formatValue);
  const popupProviders =
    attentionProviders.length > 0
      ? attentionProviders.slice(0, 3)
      : visibleProviders.slice(0, 3);

  return {
    headerDetail: buildPopupHeaderDetail(visibleProviders, setupCoverage),
    summaryItems: buildPopupSummaryItems(visibleProviders, setupCoverage, summaryLabels, formatValue),
    visibleProviders,
    featuredProviderCards: popupProviders.map(buildPopupFeaturedProviderCard),
    showSnapshotStatus: visibleProviders.length > 0,
    snapshotStatus: buildSnapshotStatus(visibleProviders),
    guidanceCard,
    setupCoverage,
    actionSection: buildActionSection(guidanceCard),
    surfaceRolesCard: buildSurfaceRolesCard(visibleProviders, guidanceCard),
    featuredSection: buildFeaturedSection(visibleProviders, attentionProviders),
    featuredProviders: popupProviders,
  };
}
