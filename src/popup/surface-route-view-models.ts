import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import type { ProviderViewModel } from "../sidepanel/view-models";
import type {
  PopupActionSection,
  PopupFirstSetupProvider,
  PopupGuidanceAction,
  PopupGuidanceCard,
  PopupSurfaceRolesCard,
} from "./view-model-types";

export function buildActionSection(
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

export function buildSurfaceRolesCard(
  visibleProviders: ProviderViewModel[],
  guidanceCard: PopupGuidanceCard | null,
  firstSetupProvider: PopupFirstSetupProvider | null = null,
): PopupSurfaceRolesCard {
  if (visibleProviders.length === 0) {
    return {
      label: "Surface roles",
      headline: "Settings owns setup",
      detail: firstSetupProvider
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

export function buildLocalizedActionSection(
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

export function buildLocalizedSurfaceRolesCard(
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
