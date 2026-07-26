import { SETTINGS_SECTION_IDS } from "./settings-section-ids";
import type { SettingsRouteFocus } from "./route-state";

export function getSettingsRouteFocusElement(
  routeFocus: SettingsRouteFocus,
  documentRef: Document,
): HTMLElement | null {
  switch (routeFocus.kind) {
    case "section":
      return documentRef.getElementById(routeFocus.sectionId);
    case "quick-setup-provider":
      return (
        documentRef.querySelector<HTMLElement>(
          `[data-quick-setup-provider-id="${routeFocus.providerId}"]`,
        ) ?? documentRef.getElementById(SETTINGS_SECTION_IDS.quickSetup)
      );
    case "credential-provider":
      return (
        documentRef.querySelector<HTMLElement>(
          `[data-credential-provider-id="${routeFocus.providerId}"]`,
        ) ?? documentRef.getElementById(SETTINGS_SECTION_IDS.providerDisplay)
      );
    case "source-provider":
      return documentRef.querySelector<HTMLElement>(
        `.source-card[data-provider-id="${routeFocus.providerId}"]`,
      );
  }
}

export function getSettingsRouteFocusKey(
  routeFocus: SettingsRouteFocus | undefined,
): string | null {
  if (!routeFocus) {
    return null;
  }

  switch (routeFocus.kind) {
    case "section":
      return `section:${routeFocus.sectionId}`;
    case "quick-setup-provider":
      return `quick-setup-provider:${routeFocus.providerId}`;
    case "credential-provider":
      return `credential-provider:${routeFocus.providerId}`;
    case "source-provider":
      return `source-provider:${routeFocus.providerId}`;
  }
}
