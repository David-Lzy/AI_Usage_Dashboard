import type {
  AppState,
  PopupProviderAccountPresentationMode,
  ProviderAccountId,
  ProviderId,
  ProviderSetting,
} from "../providers/types";
import { getRecommendedFirstSetupProvider } from "../shared/first-provider-setup";
import type { ProviderSourceDisplayCopy } from "../shared/provider-sources";
import {
  buildProviderViewModel,
  getPopupProviders,
  type ProviderViewModel,
} from "../shared/provider-view-models";
import { getProviderDefinition } from "../providers/provider-definitions";
import type {
  PopupFeaturedProviderCard,
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
import { buildPopupFeaturedProviderCard } from "./featured-provider-card-view-models";
import { buildFeaturedSection } from "./featured-section-view-models";
import { buildGuidanceCard } from "./guidance-card-view-models";
import { buildSnapshotStatus } from "./snapshot-status-view-models";
import { resolvePopupProviderAccountPresentationMode } from "../shared/provider-account-presentation";
import {
  buildActionSection,
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

export { localizePopupViewModel } from "./localized-view-models";

function buildFirstSetupProvider(
  providers: ProviderSetting[],
): PopupFirstSetupProvider | null {
  const provider = getRecommendedFirstSetupProvider(providers);

  if (!provider) {
    return null;
  }

  return {
    providerId: provider.id,
    providerLabel: getProviderDefinition(provider.id).shortLabel,
  };
}

function withProviderAccountContext(
  provider: ProviderViewModel,
  accountId: ProviderAccountId | null,
  accountLabel: string | null,
  mode: PopupProviderAccountPresentationMode,
  cardId: string = provider.providerId,
): PopupFeaturedProviderCard {
  return {
    ...buildPopupFeaturedProviderCard(provider),
    cardId,
    providerAccountId: accountId,
    providerAccountLabel: accountLabel,
    providerAccountPresentationMode: mode,
  };
}

function buildPopupProviderCards(
  state: AppState,
  providers: readonly ProviderViewModel[],
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
): PopupFeaturedProviderCard[] {
  return providers.flatMap((provider) => {
    const collection = state.providerAccounts?.[provider.providerId];
    const mode = resolvePopupProviderAccountPresentationMode(
      state.settings.popupProviderAccountPresentationByProvider,
      provider.providerId,
    );
    const activeMetadata = collection?.accounts.find(
      ({ id }) => id === collection.activeAccountId,
    );

    if (mode !== "cards" || !collection || collection.accounts.length <= 1) {
      return [
        withProviderAccountContext(
          provider,
          collection?.activeAccountId ?? null,
          activeMetadata?.label ?? null,
          mode,
        ),
      ];
    }

    return collection.accounts.flatMap((account) => {
      const accountProvider =
        account.id === collection.activeAccountId
          ? provider
          : collection.inactiveAccounts[account.id]
            ? buildProviderViewModel(
                collection.inactiveAccounts[account.id].snapshot,
                collection.inactiveAccounts[account.id].setting,
                sourceDisplayCopy,
              )
            : null;

      return accountProvider
        ? [
            withProviderAccountContext(
              accountProvider,
              account.id,
              account.label,
              mode,
              `${provider.providerId}:${account.id}`,
            ),
          ]
        : [];
    });
  });
}

export function buildPopupViewModel(
  state: AppState,
  summaryLabels: PopupSummaryLabels = DEFAULT_POPUP_SUMMARY_LABELS,
  formatValue: PopupValueFormatter = DEFAULT_POPUP_VALUE_FORMATTER,
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
  hiddenProviderIds: readonly ProviderId[] = [],
): PopupViewModel {
  const visibleProviders = getPopupProviders(state, sourceDisplayCopy);
  const hiddenProviders = new Set(hiddenProviderIds);
  const featuredCandidateProviders = visibleProviders.filter(
    (provider) => !hiddenProviders.has(provider.providerId),
  );
  const attentionProviders = featuredCandidateProviders.filter(needsAttention);
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
  const popupProviders = featuredCandidateProviders;

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
    featuredProviderCards: buildPopupProviderCards(
      state,
      popupProviders,
      sourceDisplayCopy,
    ),
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
      featuredCandidateProviders,
      attentionProviders,
      firstSetupProvider,
    ),
    featuredProviders: popupProviders,
  };
}
