import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { getSettingsRouteFocusElement, SettingsPage } from "./SettingsPage";

function renderSettingsPage(overrides: Partial<Parameters<typeof SettingsPage>[0]> = {}) {
  return renderToStaticMarkup(
    <SettingsPage
      onBack={() => {}}
      settings={SAMPLE_APP_STATE.settings}
      providers={SAMPLE_APP_STATE.providerSettings}
      snapshots={SAMPLE_APP_STATE.providers}
      toast={null}
      onDismissToast={() => {}}
      onSavePreferences={() => {}}
      onSyncIntervalChange={() => {}}
      onLocalePreferenceChange={() => {}}
      onUserLevelChange={() => {}}
      onWarningThresholdChange={() => {}}
      onThemeModeChange={() => {}}
      onThemePresetChange={() => {}}
      onUiFontFamilyChange={() => {}}
      onPopupProgressStyleChange={() => {}}
      onSidebarProgressStyleChange={() => {}}
      onFullPageProgressStyleChange={() => {}}
      onPopupSizePresetChange={() => {}}
      onPopupCornerStyleChange={() => {}}
      onPopupCircularProgressItemsPerRowChange={() => {}}
      onPopupShadowStyleChange={() => {}}
      onProviderOrderBySurfaceChange={() => {}}
      onProgressItemsBySurfaceChange={() => {}}
      onProgressThicknessPxChange={() => {}}
      onProgressColorBandsChange={() => {}}
      onActionBadgeSelectionsChange={() => {}}
      onActionBadgeRotationIntervalSecondsChange={() => {}}
      onExportConfiguration={() => {}}
      onImportConfigurationJson={() => {}}
      onSaveConfigurationToChromeSync={() => {}}
      onRestoreConfigurationFromChromeSync={() => {}}
      onToolbarIconModeChange={() => {}}
      onToolbarIconProviderIdChange={() => {}}
      onToolbarIconCustomImageDataUrlChange={() => {}}
      onSaveThemeCustomSeed={() => {}}
      onToggleProvider={() => {}}
      onTogglePermission={() => {}}
      onSetSourcePreference={() => {}}
      onSaveProviderAdminApiKey={() => {}}
      onClearProviderAdminApiKey={() => {}}
      onSaveCodexWorkspaceConfig={() => {}}
      onClearCodexWorkspaceConfig={() => {}}
      onClearPageBinding={() => {}}
      onOpenSessionPage={() => {}}
      onAttachActiveSessionPage={() => {}}
      sessionPageNavigationAvailable={false}
      activeSessionPageAttachAvailable={false}
      {...overrides}
    />,
  );
}

describe("SettingsPage", () => {
  it("renders the top-bar navigation, overview controls, and basic-mode quick setup", () => {
    const html = renderSettingsPage();

    expect(html).toContain('class="top-app-bar__bottom"');
    expect(html).toContain('class="settings-section-nav"');
    expect(html).toContain('class="settings-overview__controls"');
    expect(html).toContain('class="settings-overview__level-control"');
    expect(html).toContain('settings-overview__user-level-help');
    expect(html).toContain('data-settings-material-select="settings-user-level"');
    expect(html).toContain('data-settings-material-select="locale-preference"');
    expect(html).toContain('data-settings-material-select="theme-mode"');
    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain(">Quick Setup<");
    expect(html).toContain('data-quick-setup-source-modes="cursor"');
    expect(html).toContain('data-quick-setup-source-mode="official_api"');
    expect(html).toContain('data-quick-setup-source-mode="session_page"');
    expect(html).toContain("Cursor Team Admin API");
    expect(html).toContain("Cursor personal dashboard usage page");
    expect(html).toContain('data-settings-material-select="popup-circular-row-count"');
    expect(html).toContain('data-action-badge-selection-controls=""');
    expect(html).toContain('data-settings-material-select="toolbar-icon-mode"');
    expect(html).toContain('data-configuration-backup=""');
    expect(html).toContain('data-settings-provider-display-section=""');
    expect(html).toContain('data-provider-order-preferences=""');
    expect(html).toContain('data-provider-progress-preferences=""');
    expect(html).not.toContain('data-provider-order-row="jetbrains"');
    expect(html).toContain('data-progress-appearance-preferences=""');
    expect(html).toContain(">More UI settings<");
    expect(html).toContain(">Provider display settings<");
    expect(html.indexOf('id="settings-appearance"')).toBeLessThan(
      html.indexOf('id="settings-provider-display"'),
    );
    expect(html.indexOf('id="settings-provider-display"')).toBeLessThan(
      html.indexOf('class="settings-back-to-top-fab"'),
    );
    expect(html).not.toContain('data-credential-provider-id="cursor"');
    expect(html).toContain('class="settings-back-to-top-fab"');
    expect(html).toContain('aria-label="Back to top"');
  });

  it("reveals advanced credentials and debug diagnostics at debug level", () => {
    const html = renderSettingsPage({
      settings: {
        ...SAMPLE_APP_STATE.settings,
        userLevel: "debug",
      },
      sessionPageNavigationAvailable: true,
    });

    expect(html).toContain('data-credential-provider-id="cursor"');
    expect(html).toContain('data-settings-material-select="source-preference-cursor"');
    expect(html).toContain("Detailed diagnostics");
    expect(html).toContain('data-action-badge-selection-controls=""');
  });

  it("reveals the targeted advanced section for a credential-focused deep link", () => {
    const html = renderSettingsPage({
      routeFocus: {
        kind: "credential-provider",
        providerId: "cursor",
      },
    });

    expect(html).toContain('id="settings-advanced"');
    expect(html).toContain('data-credential-provider-id="cursor"');
  });

  it("reveals the targeted advanced source card for a source-focused deep link", () => {
    const html = renderSettingsPage({
      routeFocus: {
        kind: "source-provider",
        providerId: "gemini",
      },
    });

    expect(html).toContain('id="settings-advanced"');
    expect(html).toContain('class="source-card');
    expect(html).toContain('data-provider-id="gemini"');
    expect(html).toContain('data-provider-carousel-active-id="gemini"');
  });

  it("keeps quick-setup focused deep links out of advanced credentials", () => {
    const html = renderSettingsPage({
      routeFocus: {
        kind: "quick-setup-provider",
        providerId: "cursor",
      },
    });

    expect(html).toContain('data-quick-setup-provider-id="cursor"');
    expect(html).not.toContain('id="settings-advanced"');
    expect(html).not.toContain('data-credential-provider-id="cursor"');
  });

  it("uses the quick setup section as the fallback target for hidden provider deep links", () => {
    const providerTarget = {} as HTMLElement;
    const fallbackSection = {} as HTMLElement;
    const exactDocument = {
      querySelector: () => providerTarget,
      getElementById: () => fallbackSection,
    } as unknown as Document;
    const fallbackDocument = {
      querySelector: () => null,
      getElementById: (sectionId: string) =>
        sectionId === SETTINGS_SECTION_IDS.quickSetup ? fallbackSection : null,
    } as unknown as Document;

    expect(
      getSettingsRouteFocusElement(
        { kind: "quick-setup-provider", providerId: "cursor" },
        exactDocument,
      ),
    ).toBe(providerTarget);
    expect(
      getSettingsRouteFocusElement(
        { kind: "quick-setup-provider", providerId: "cursor" },
        fallbackDocument,
      ),
    ).toBe(fallbackSection);
  });

  it("keeps all providers in quick setup when every provider is hidden", () => {
    const hiddenProviders = SAMPLE_APP_STATE.providerSettings.map((provider) => ({
      ...provider,
      enabled: false,
    }));
    const html = renderSettingsPage({
      providers: hiddenProviders,
    });

    expect(html).toContain(
      `data-provider-carousel-count="${hiddenProviders.length}"`,
    );
    for (const provider of hiddenProviders) {
      expect(html).toContain(`data-quick-setup-provider-id="${provider.id}"`);
      expect(html).toContain(`data-visibility-toggle="${provider.id}"`);
      expect(html).toContain(`data-quick-setup-source-modes="${provider.id}"`);
    }
    expect(html).not.toContain('class="quick-setup-card__more"');
    expect(html).not.toContain("More Provider");
    expect(html).toContain('data-quick-setup-first-provider-id="codex"');
    expect(html).toContain('data-provider-carousel-active-id="codex"');
    expect(html).toContain(">Start with Codex<");
    expect(html).toContain(">Enable Codex<");
  });
});
