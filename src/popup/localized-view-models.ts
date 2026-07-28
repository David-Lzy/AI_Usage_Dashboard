import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import { buildLocalizedFeaturedProviderCard } from "./featured-provider-card-view-models";
import { buildLocalizedFeaturedSection } from "./featured-section-view-models";
import { buildLocalizedGuidanceCard } from "./guidance-card-view-models";
import {
  buildLocalizedHeaderDetail,
  buildLocalizedSetupCoverage,
  needsAttention,
} from "./setup-coverage-view-models";
import { buildLocalizedSnapshotStatus } from "./snapshot-status-view-models";
import {
  buildLocalizedActionSection,
  buildLocalizedSurfaceRolesCard,
} from "./surface-route-view-models";
import type { PopupViewModel } from "./view-model-types";

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
    featuredProviderCards: model.featuredProviderCards.map((card) => ({
      ...buildLocalizedFeaturedProviderCard(card.provider, i18n, copy),
      cardId: card.cardId,
      providerAccountId: card.providerAccountId,
      providerAccountLabel: card.providerAccountLabel,
      providerAccountPresentationMode: card.providerAccountPresentationMode,
    })),
  };
}
