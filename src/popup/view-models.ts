import type {
  AppState,
  ProviderSetting,
} from "../providers/types";
import { getRecommendedFirstSetupProvider } from "../shared/first-provider-setup";
import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/localized-copy";
import type { ProviderSourceDisplayCopy } from "../shared/provider-sources";
import {
  getVisibleProviders,
  type ProviderViewModel,
} from "../sidepanel/view-models";
import type {
  PopupActionSection,
  PopupFeaturedSection,
  PopupFirstSetupProvider,
  PopupGuidanceAction,
  PopupGuidanceCard,
  PopupSummaryLabels,
  PopupSurfaceRolesCard,
  PopupValueFormatter,
  PopupViewModel,
} from "./view-model-types";
import {
  DEFAULT_POPUP_SUMMARY_LABELS,
  DEFAULT_POPUP_VALUE_FORMATTER,
  buildLocalizedHeaderDetail,
  buildLocalizedSetupCoverage,
  buildPopupHeaderDetail,
  buildPopupSummaryItems,
  buildSetupCoverage,
  needsAttention,
} from "./setup-coverage-view-models";
import {
  buildLocalizedFeaturedProviderCard,
  buildPopupFeaturedProviderCard,
} from "./featured-provider-card-view-models";
import {
  buildGuidanceCard,
  buildLocalizedGuidanceCard,
} from "./guidance-card-view-models";
import {
  buildLocalizedSnapshotStatus,
  buildSnapshotStatus,
} from "./snapshot-status-view-models";

export type {
  PopupActionSection,
  PopupFeaturedProviderCard,
  PopupFeaturedSection,
  PopupFirstSetupProvider,
  PopupGuidanceAction,
  PopupGuidanceCard,
  PopupSetupCoverage,
  PopupSnapshotStatus,
  PopupSummaryLabels,
  PopupSurfaceRolesCard,
  PopupUsageProgressCircle,
  PopupViewModel,
} from "./view-model-types";

function buildFirstSetupProvider(
  providers: ProviderSetting[],
): PopupFirstSetupProvider | null {
  const provider = getRecommendedFirstSetupProvider(providers);

  if (!provider) {
    return null;
  }

  return {
    providerId: provider.id,
    providerLabel: provider.label,
  };
}

function buildFeaturedSection(
  visibleProviders: ProviderViewModel[],
  attentionProviders: ProviderViewModel[],
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupFeaturedSection {
  if (visibleProviders.length === 0) {
    const providerLabel = firstSetupProvider?.providerLabel ?? "one provider";

    return {
      label: "Provider triage",
      headline: "Nothing to triage yet",
      detail:
        firstSetupProvider
          ? `Enable ${providerLabel} in Settings > Quick Setup first, then this section becomes actionable.`
          : "This section becomes actionable after at least one provider is visible in Settings > Quick Setup.",
      emptyStateHeadline: "No provider cards yet",
      emptyStateDetail:
        firstSetupProvider
          ? `Start with ${providerLabel}, then come back here for one-click provider triage.`
          : "Enable one provider in Settings > Quick Setup, then come back here for one-click provider triage.",
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
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupSurfaceRolesCard {
  if (visibleProviders.length === 0) {
    return {
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        firstSetupProvider
          ? `Use Settings > Quick Setup to enable ${firstSetupProvider.providerLabel}, grant host access, and open the usage page. The dashboard becomes useful after at least one provider is visible.`
          : "Use Settings > Quick Setup to enable providers, grant host access, and open usage pages. The dashboard becomes useful after at least one provider is visible.",
    };
  }

  if (guidanceCard?.action.kind === "settings") {
    const allPolicyOnly =
      visibleProviders.length > 0 &&
      visibleProviders.every(
        (provider) => provider.currentSourceStateKind === "policy_only",
      );

    if (allPolicyOnly) {
      return {
        label: "Surface roles",
        headline: "Settings owns contract controls",
        detail:
          "Use settings to review provider contracts, source preference, and page-source controls. Dashboard stays the broader multi-provider context.",
      };
    }

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

function buildLocalizedFeaturedSection(
  visibleProviders: ProviderViewModel[],
  attentionProviders: ProviderViewModel[],
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupFeaturedSection {
  if (visibleProviders.length === 0) {
    return {
      label: copy.featuredSection.providerTriageLabel,
      headline: copy.featuredSection.nothingToTriageHeadline,
      detail: firstSetupProvider
        ? copy.featuredSection.actionableAfterFirstProviderDetail(
            firstSetupProvider.providerLabel,
          )
        : copy.featuredSection.actionableAfterVisibleDetail,
      emptyStateHeadline: copy.featuredSection.noProviderCardsYetHeadline,
      emptyStateDetail: firstSetupProvider
        ? copy.featuredSection.startFirstProviderComeBackDetail(
            firstSetupProvider.providerLabel,
          )
        : copy.featuredSection.enableProviderComeBackDetail,
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
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupSurfaceRolesCard {
  if (visibleProviders.length === 0) {
    return {
      label: copy.surfaceRoles.label,
      headline: copy.surfaceRoles.settingsOwnsSetupHeadline,
      detail: firstSetupProvider
        ? copy.surfaceRoles.settingsOwnsFirstProviderSetupDetail(
            firstSetupProvider.providerLabel,
          )
        : copy.surfaceRoles.settingsOwnsSetupNoVisibleDetail,
    };
  }

  if (guidanceCard?.action.kind === "settings") {
    const allPolicyOnly =
      visibleProviders.length > 0 &&
      visibleProviders.every(
        (provider) => provider.currentSourceStateKind === "policy_only",
      );

    if (allPolicyOnly) {
      return {
        label: copy.surfaceRoles.label,
        headline: copy.surfaceRoles.settingsOwnsContractControlsHeadline,
        detail: copy.surfaceRoles.settingsOwnsContractControlsDetail,
      };
    }

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
  const firstSetupProvider = model.firstSetupProvider;
  const guidanceCard = buildLocalizedGuidanceCard(
    visibleProviders,
    i18n,
    copy,
    firstSetupProvider,
  );
  const setupCoverage = buildLocalizedSetupCoverage(
    visibleProviders,
    model.setupCoverage.items,
    i18n,
    copy,
    firstSetupProvider,
  );

  return {
    ...model,
    headerDetail: buildLocalizedHeaderDetail(
      visibleProviders,
      setupCoverage,
      copy,
      firstSetupProvider,
    ),
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
      firstSetupProvider,
    ),
    featuredSection: buildLocalizedFeaturedSection(
      visibleProviders,
      attentionProviders,
      copy,
      firstSetupProvider,
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
  const firstSetupProvider =
    visibleProviders.length === 0
      ? buildFirstSetupProvider(state.providerSettings)
      : null;
  const guidanceCard = buildGuidanceCard(visibleProviders, firstSetupProvider);
  const setupCoverage = buildSetupCoverage(
    visibleProviders,
    formatValue,
    firstSetupProvider,
  );
  const popupProviders =
    attentionProviders.length > 0
      ? attentionProviders.slice(0, 3)
      : visibleProviders.slice(0, 3);

  return {
    headerDetail: buildPopupHeaderDetail(
      visibleProviders,
      setupCoverage,
      firstSetupProvider,
    ),
    summaryItems: buildPopupSummaryItems(visibleProviders, setupCoverage, summaryLabels, formatValue),
    firstSetupProvider,
    visibleProviders,
    featuredProviderCards: popupProviders.map(buildPopupFeaturedProviderCard),
    showSnapshotStatus: visibleProviders.length > 0,
    snapshotStatus: buildSnapshotStatus(visibleProviders),
    guidanceCard,
    setupCoverage,
    actionSection: buildActionSection(guidanceCard),
    surfaceRolesCard: buildSurfaceRolesCard(
      visibleProviders,
      guidanceCard,
      firstSetupProvider,
    ),
    featuredSection: buildFeaturedSection(
      visibleProviders,
      attentionProviders,
      firstSetupProvider,
    ),
    featuredProviders: popupProviders,
  };
}
