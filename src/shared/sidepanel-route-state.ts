import type { ApiKeyProviderId, ProviderId } from "../providers/types";
import { API_KEY_PROVIDER_IDS, PROVIDER_IDS } from "../providers/provider-definitions";
import {
  SETTINGS_SECTION_IDS,
  SETTINGS_SECTION_ID_VALUES,
  type SettingsSectionId,
} from "./settings-section-ids";

export type SettingsCredentialProviderId = ApiKeyProviderId;

export type SettingsRouteFocus =
  | { kind: "section"; sectionId: SettingsSectionId }
  | { kind: "quick-setup-provider"; providerId: ProviderId }
  | { kind: "credential-provider"; providerId: SettingsCredentialProviderId }
  | { kind: "source-provider"; providerId: ProviderId };

export type SidePanelRouteState =
  | { name: "dashboard" }
  | { name: "settings"; focus?: SettingsRouteFocus }
  | { name: "provider-detail"; providerId: ProviderId };

const VALID_PROVIDER_IDS = PROVIDER_IDS;
const VALID_CREDENTIAL_PROVIDER_IDS = API_KEY_PROVIDER_IDS;

function isProviderId(value: string): value is ProviderId {
  return VALID_PROVIDER_IDS.includes(value as ProviderId);
}

function isCredentialProviderId(
  value: string,
): value is SettingsCredentialProviderId {
  return VALID_CREDENTIAL_PROVIDER_IDS.includes(
    value as SettingsCredentialProviderId,
  );
}

function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_SECTION_ID_VALUES.includes(value as SettingsSectionId);
}

export function settingsRouteFocusRequiresAdvanced(
  focus: SettingsRouteFocus | undefined,
): boolean {
  return (
    focus?.kind === "credential-provider" || focus?.kind === "source-provider"
  );
}

export function buildSidePanelHash(route: SidePanelRouteState): string {
  switch (route.name) {
    case "dashboard":
      return "#dashboard";
    case "settings":
      if (!route.focus) {
        return "#settings";
      }

      switch (route.focus.kind) {
        case "section":
          return `#settings/section/${route.focus.sectionId}`;
        case "quick-setup-provider":
          return `#settings/quick-setup/${route.focus.providerId}`;
        case "credential-provider":
          return `#settings/credentials/${route.focus.providerId}`;
        case "source-provider":
          return `#settings/sources/${route.focus.providerId}`;
      }
    case "provider-detail":
      return `#provider-detail/${route.providerId}`;
  }
}

export function parseSidePanelHash(hash: string): SidePanelRouteState | null {
  if (hash === "" || hash === "#" || hash === "#dashboard") {
    return { name: "dashboard" };
  }

  if (hash === "#settings") {
    return { name: "settings" };
  }

  if (hash.startsWith("#settings/")) {
    const parts = hash.slice("#settings/".length).split("/");

    if (parts.length !== 2) {
      return null;
    }

    const [rawKind, rawTarget] = parts;

    if (rawKind === "section" && rawTarget && isSettingsSectionId(rawTarget)) {
      return {
        name: "settings",
        focus: {
          kind: "section",
          sectionId: rawTarget,
        },
      };
    }

    if (
      rawKind === "quick-setup" &&
      rawTarget &&
      isProviderId(rawTarget)
    ) {
      return {
        name: "settings",
        focus: {
          kind: "quick-setup-provider",
          providerId: rawTarget,
        },
      };
    }

    if (
      rawKind === "credentials" &&
      rawTarget &&
      isCredentialProviderId(rawTarget)
    ) {
      return {
        name: "settings",
        focus: {
          kind: "credential-provider",
          providerId: rawTarget,
        },
      };
    }

    if (rawKind === "sources" && rawTarget && isProviderId(rawTarget)) {
      return {
        name: "settings",
        focus: {
          kind: "source-provider",
          providerId: rawTarget,
        },
      };
    }
  }

  if (hash.startsWith("#provider-detail/")) {
    const providerId = hash.slice("#provider-detail/".length);

    if (!isProviderId(providerId)) {
      return null;
    }

    return {
      name: "provider-detail",
      providerId,
    };
  }

  return null;
}
