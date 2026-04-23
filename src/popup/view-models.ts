import type {
  AppState,
  ProviderId,
  ProviderTone,
  SummaryItem,
} from "../providers/types";
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
    return provider.currentSourceAvailabilitySummary;
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
          value: "0",
          tone: "neutral",
        },
        {
          label: "Host access",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Credentials",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Policy-only",
          value: "0",
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
        value: String(liveReadyProviders.length),
        tone: liveReadyProviders.length > 0 ? "neutral" : "warning",
      },
      {
        label: "Host access",
        value: String(providersNeedingAccess.length),
        tone: providersNeedingAccess.length > 0 ? "warning" : "neutral",
      },
      {
        label: "Credentials",
        value: String(providersNeedingCredentials.length),
        tone:
          providersNeedingCredentials.length > 0 ? "warning" : "neutral",
      },
      {
        label: "Policy-only",
        value: String(policyOnlyProviders.length),
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
): SummaryItem[] {
  const stats = buildSetupCoverageStats(visibleProviders);
  const setupBlockerCount =
    stats.providersNeedingAccess.length + stats.providersNeedingCredentials.length;

  return [
    {
      label: "Visible",
      value: String(stats.providerCount),
      tone: "neutral",
    },
    {
      label: "Live ready",
      value: String(stats.liveReadyProviders.length),
      tone:
        stats.liveReadyProviders.length > 0 ||
        setupCoverage.statusLabel === "Contract-only" ||
        stats.providerCount === 0
          ? "neutral"
          : "warning",
    },
    {
      label: "Setup blockers",
      value: String(setupBlockerCount),
      tone: setupBlockerCount > 0 ? "warning" : "neutral",
    },
    {
      label: "Policy-only",
      value: String(stats.policyOnlyProviders.length),
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

export function buildPopupViewModel(state: AppState): PopupViewModel {
  const visibleProviders = getVisibleProviders(state);
  const attentionProviders = visibleProviders.filter(needsAttention);
  const guidanceCard = buildGuidanceCard(visibleProviders);
  const setupCoverage = buildSetupCoverage(visibleProviders);
  const popupProviders =
    attentionProviders.length > 0
      ? attentionProviders.slice(0, 3)
      : visibleProviders.slice(0, 3);

  return {
    headerDetail: buildPopupHeaderDetail(visibleProviders, setupCoverage),
    summaryItems: buildPopupSummaryItems(visibleProviders, setupCoverage),
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
