import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import {
  SettingsPage,
} from "./SettingsPage";
import {
  getSettingsRouteFocusElement,
  getSettingsRouteFocusKey,
} from "../settings-route-focus";

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
      onMotionModeChange={() => {}}
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
      onCustomSourcesChange={() => {}}
      onProgressThicknessPxChange={() => {}}
      onProgressColorAppearanceChange={() => {}}
      onProgressColorBandsChange={() => {}}
      onActionBadgeSelectionsChange={() => {}}
      onActionBadgeSelectionModeChange={() => {}}
      onActionBadgeRotationIntervalSecondsChange={() => {}}
      onExportConfiguration={() => {}}
      onImportConfigurationJson={() => {}}
      onSaveConfigurationToChromeSync={() => {}}
      onRestoreConfigurationFromChromeSync={() => {}}
      onResetConfigurationToInitial={() => {}}
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
    expect(html).toContain(
      'class="adaptive-control-grid settings-overview__controls"',
    );
    expect(html).toContain('data-adaptive-control-grid=""');
    expect(html).toContain('class="settings-overview__level-control"');
    expect(html).not.toContain('class="settings-overview__paired-controls"');
    expect(html).toContain('class="form-field__label-row"');
    expect(html).toContain('data-settings-material-select="settings-user-level"');
    expect(html).toContain('data-settings-material-select="locale-preference"');
    expect(html).toContain('data-settings-material-select="theme-mode"');
    expect(html).toContain('data-settings-material-select="motion-mode"');
    expect(html.indexOf('id="settings-appearance"')).toBeLessThan(
      html.indexOf('data-settings-material-select="motion-mode"'),
    );
    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain(">Quick Setup<");
    expect(html).toContain('data-quick-setup-source-modes="cursor-personal-page"');
    expect(html).toContain('data-quick-setup-source-mode="session_page"');
    expect(html).toContain(
      'class="dashboard-section__header quick-setup-section__header"',
    );
    expect(html).toContain('data-quick-setup-team-api-toggle=""');
    expect(html).toContain(
      "text-button--outlined quick-setup-section__team-toggle",
    );
    expect(html).toContain("Show team/API providers");
    expect(html).not.toContain("Cursor Team Admin API");
    expect(html).toContain("Cursor personal dashboard usage page");
    expect(html).not.toContain('data-settings-material-select="popup-circular-row-count"');
    expect(html).toContain('data-action-badge-selection-controls=""');
    expect(html).toContain('data-settings-material-select="toolbar-icon-mode"');
    expect(html).toContain('data-configuration-backup=""');
    expect(html).toContain('data-settings-provider-display-section=""');
    expect(html).toContain('data-custom-source-settings=""');
    expect(html).toContain('data-provider-order-preferences=""');
    expect(html).toContain('data-provider-progress-preferences=""');
    expect(html).not.toContain('data-provider-order-row="jetbrains-org-page"');
    expect(html).not.toContain('data-progress-appearance-preferences=""');
    expect(html).toContain(">More UI settings<");
    expect(html).toContain(">Provider display settings<");
    expect(html.indexOf('id="settings-appearance"')).toBeLessThan(
      html.indexOf('id="settings-provider-display"'),
    );
    expect(html.indexOf('id="settings-provider-display"')).toBeLessThan(
      html.indexOf('class="settings-back-to-top-fab"'),
    );
    expect(html).not.toContain('data-credential-provider-id="cursor-team-api"');
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

    expect(html).toContain('data-credential-provider-id="cursor-team-api"');
    expect(html).toContain("Detailed diagnostics");
    expect(html).toContain('data-action-badge-selection-controls=""');
  });

  it("reveals the targeted advanced section for a credential-focused deep link", () => {
    const html = renderSettingsPage({
      routeFocus: {
        kind: "credential-provider",
        providerId: "cursor-team-api",
      },
    });

    expect(html).toContain('id="settings-advanced"');
    expect(html).toContain('data-credential-provider-id="cursor-team-api"');
  });

  it("reveals the targeted advanced source card for a source-focused deep link", () => {
    const html = renderSettingsPage({
      routeFocus: {
        kind: "source-provider",
        providerId: "gemini-policy",
      },
    });

    expect(html).toContain('id="settings-advanced"');
    expect(html).toContain('class="source-card');
    expect(html).toContain('data-provider-id="gemini-policy"');
    expect(html).toContain('data-provider-carousel-active-id="gemini-policy"');
  });

  it("keeps quick-setup focused deep links out of advanced credentials", () => {
    const html = renderSettingsPage({
      routeFocus: {
        kind: "quick-setup-provider",
        providerId: "cursor-team-api",
      },
    });

    expect(html).toContain('data-quick-setup-provider-id="cursor-personal-page"');
    expect(html).not.toContain('id="settings-advanced"');
    expect(html).not.toContain('data-credential-provider-id="cursor-team-api"');
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
        { kind: "quick-setup-provider", providerId: "cursor-team-api" },
        exactDocument,
      ),
    ).toBe(providerTarget);
    expect(
      getSettingsRouteFocusElement(
        { kind: "quick-setup-provider", providerId: "cursor-team-api" },
        fallbackDocument,
      ),
    ).toBe(fallbackSection);
  });

  it("builds stable route focus keys across equivalent parsed routes", () => {
    expect(
      getSettingsRouteFocusKey({
        kind: "section",
        sectionId: SETTINGS_SECTION_IDS.appearance,
      }),
    ).toBe(`section:${SETTINGS_SECTION_IDS.appearance}`);
    expect(
      getSettingsRouteFocusKey({
        kind: "quick-setup-provider",
        providerId: "codex-personal-page",
      }),
    ).toBe("quick-setup-provider:codex-personal-page");
    expect(
      getSettingsRouteFocusKey({
        kind: "credential-provider",
        providerId: "cursor-team-api",
      }),
    ).toBe("credential-provider:cursor-team-api");
    expect(
      getSettingsRouteFocusKey({
        kind: "source-provider",
        providerId: "gemini-policy",
      }),
    ).toBe("source-provider:gemini-policy");
    expect(getSettingsRouteFocusKey(undefined)).toBeNull();
  });

  it("keeps default personal and policy providers in quick setup when every provider is hidden", () => {
    const hiddenProviders = SAMPLE_APP_STATE.providerSettings.map((provider) => ({
      ...provider,
      displayEnabled: false,
    }));
    const defaultQuickSetupProviderIds = [
      "cursor-personal-page",
      "claude-code-team-page",
      "gemini-policy",
      "codex-personal-page",
    ];
    const html = renderSettingsPage({
      providers: hiddenProviders,
    });

    expect(html).toContain(
      `data-provider-carousel-count="${defaultQuickSetupProviderIds.length}"`,
    );
    for (const providerId of defaultQuickSetupProviderIds) {
      expect(html).toContain(`data-quick-setup-provider-id="${providerId}"`);
      expect(html).toContain(`data-visibility-toggle="${providerId}"`);
      expect(html).toContain(`data-quick-setup-source-modes="${providerId}"`);
    }
    expect(html).not.toContain('data-quick-setup-provider-id="cursor-team-api"');
    expect(html).not.toContain('class="quick-setup-card__more"');
    expect(html).not.toContain("More Provider");
    expect(html).toContain('data-quick-setup-first-provider-id="codex-personal-page"');
    expect(html).toContain('data-provider-carousel-active-id="codex-personal-page"');
    expect(html).toContain(">Start with Codex<");
    expect(html).toContain(">Enable Codex<");
  });
});
