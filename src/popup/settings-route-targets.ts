import type { ProviderId } from "../providers/types";
import type { SettingsRouteFocus } from "../sidepanel/route-state";
import { SETTINGS_SECTION_IDS } from "../sidepanel/settings-section-ids";
import type { PopupGuidanceAction } from "./view-model-types";

type PopupSettingsTargetProvider = {
  currentSourceStateKind: string;
  permissionStatus: string;
  providerId: ProviderId;
};

function isCredentialSettingsProviderId(
  providerId: ProviderId,
): providerId is "cursor" | "claude-code" | "codex" {
  return (
    providerId === "cursor" ||
    providerId === "claude-code" ||
    providerId === "codex"
  );
}

export function getSettingsRouteFocusForPopupProvider(
  provider: PopupSettingsTargetProvider,
): SettingsRouteFocus | null {
  if (provider.permissionStatus === "missing") {
    return {
      kind: "quick-setup-provider",
      providerId: provider.providerId,
    };
  }

  if (
    provider.currentSourceStateKind === "credential_missing" &&
    isCredentialSettingsProviderId(provider.providerId)
  ) {
    return {
      kind: "credential-provider",
      providerId: provider.providerId,
    };
  }

  if (provider.currentSourceStateKind === "policy_only") {
    return {
      kind: "source-provider",
      providerId: provider.providerId,
    };
  }

  return null;
}

export function getSettingsRouteFocusForPopupVisibleProviders(
  visibleProviders: PopupSettingsTargetProvider[],
): SettingsRouteFocus | null {
  if (visibleProviders.length === 0) {
    return {
      kind: "section",
      sectionId: SETTINGS_SECTION_IDS.quickSetup,
    };
  }

  const providerTarget =
    visibleProviders
      .map((provider) => getSettingsRouteFocusForPopupProvider(provider))
      .find((target) => target !== null) ?? null;

  return providerTarget;
}

export function getSettingsRouteFocusForPopupAction(
  action: PopupGuidanceAction | null | undefined,
  visibleProviders: PopupSettingsTargetProvider[],
): SettingsRouteFocus | null {
  if (action?.kind !== "settings") {
    return null;
  }

  if (action.providerId) {
    return {
      kind: "quick-setup-provider",
      providerId: action.providerId,
    };
  }

  return getSettingsRouteFocusForPopupVisibleProviders(visibleProviders);
}
