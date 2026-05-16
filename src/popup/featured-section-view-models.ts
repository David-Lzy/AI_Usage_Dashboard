import { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import type { ProviderViewModel } from "../sidepanel/view-models";
import type {
  PopupFeaturedSection,
  PopupFirstSetupProvider,
} from "./view-model-types";

export function buildFeaturedSection(
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
        "The popup follows your visible provider order and keeps setup, sync, and quota status on each card.",
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
      "No visible provider currently needs setup or review, so this section keeps visible providers available for current path and freshness at a glance.",
    emptyStateHeadline: null,
    emptyStateDetail: null,
  };
}

export function buildLocalizedFeaturedSection(
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
