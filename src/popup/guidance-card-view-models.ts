import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import type { ProviderViewModel } from "../shared/provider-view-models";
import type {
  PopupFirstSetupProvider,
  PopupGuidanceCard,
} from "./view-model-types";

export function buildGuidanceCard(
  visibleProviders: ProviderViewModel[],
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupGuidanceCard | null {
  if (visibleProviders.length === 0) {
    const providerLabel = firstSetupProvider?.providerLabel ?? "one provider";

    return {
      label: "Start here",
      tone: "warning",
      headline: firstSetupProvider
        ? `Start with ${providerLabel} in Quick Setup`
        : "Enable a provider in Quick Setup",
      detail:
        firstSetupProvider
          ? `Open Settings > Quick Setup and enable ${providerLabel}. Then follow the browser-access and usage-page steps before returning here for status triage.`
          : "Open Settings > Quick Setup and enable one provider. Then return here for one-click status and attention triage.",
      action: {
        kind: "settings",
        label: firstSetupProvider ? "Open Quick Setup" : "Open settings",
        ...(firstSetupProvider
          ? { providerId: firstSetupProvider.providerId }
          : {}),
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
        "The popup can still summarize shared cached state, but these visible providers do not expose one live in-browser usage path in this profile. Open settings to review the current provider contracts and source controls.",
      action: {
        kind: "settings",
        label: "Open settings",
      },
    };
  }

  return null;
}

export function buildLocalizedGuidanceCard(
  visibleProviders: ProviderViewModel[],
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupGuidanceCard | null {
  if (visibleProviders.length === 0) {
    return {
      label: copy.guidance.startHereLabel,
      tone: "warning",
      headline: firstSetupProvider
        ? copy.guidance.startWithProviderHeadline(
            firstSetupProvider.providerLabel,
          )
        : copy.guidance.enableProviderHeadline,
      detail: firstSetupProvider
        ? copy.guidance.startWithProviderDetail(firstSetupProvider.providerLabel)
        : copy.guidance.enableProviderDetail,
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
        kind: "settings",
        label: i18n.t("common.actions.open_settings"),
      },
    };
  }

  return null;
}
