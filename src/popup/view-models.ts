import type {
  AppState,
  ProviderSetting,
} from "../providers/types";
import { getRecommendedFirstSetupProvider } from "../shared/first-provider-setup";
import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/localized-copy";
import type { ProviderSourceDisplayCopy } from "../shared/provider-sources";
import { getVisibleProviders } from "../sidepanel/view-models";
import type {
  PopupFirstSetupProvider,
  PopupSummaryLabels,
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
  buildFeaturedSection,
  buildLocalizedFeaturedSection,
} from "./featured-section-view-models";
import {
  buildGuidanceCard,
  buildLocalizedGuidanceCard,
} from "./guidance-card-view-models";
import {
  buildLocalizedSnapshotStatus,
  buildSnapshotStatus,
} from "./snapshot-status-view-models";
import {
  buildActionSection,
  buildLocalizedActionSection,
  buildLocalizedSurfaceRolesCard,
  buildSurfaceRolesCard,
} from "./surface-route-view-models";

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
    summaryItems: buildPopupSummaryItems(
      visibleProviders,
      setupCoverage,
      summaryLabels,
      formatValue,
    ),
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
