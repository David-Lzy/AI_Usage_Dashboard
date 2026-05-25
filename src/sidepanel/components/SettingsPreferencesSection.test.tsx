import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import type { SettingsPreferencesSurfaceSessionControls } from "../use-settings-surface-session-state";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsPreferencesSection } from "./SettingsPreferencesSection";
import { canUseFloatingToolbarPopupPreview } from "./SettingsUiMoreSection";
import {
  POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
} from "./ToolbarPopupPreview";

describe("SettingsPreferencesSection", () => {
  function createSurfaceSessionControls(
    settings = SAMPLE_APP_STATE.settings,
  ): SettingsPreferencesSurfaceSessionControls {
    return {
      uiMoreOpen: settings.themePreset === "custom",
      setUiMoreOpen: () => {},
      toolbarPopupPreviewOpen: false,
      setToolbarPopupPreviewOpen: () => {},
      popupPreviewRemainingPercent:
        POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
      setPopupPreviewRemainingPercent: () => {},
      toolbarPopupPreviewPosition: null,
      setToolbarPopupPreviewPosition: () => {},
      activePopover: null,
      setActivePopover: () => {},
    };
  }

  function renderPreferencesSection(
    settings = SAMPLE_APP_STATE.settings,
  ): string {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);

    return renderToStaticMarkup(
      <SettingsPreferencesSection
        sectionId={SETTINGS_SECTION_IDS.appearance}
        settings={settings}
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        i18n={i18n}
        settingsCopy={settingsCopy}
        surfaceSessionState={createSurfaceSessionControls(settings)}
        userLevelVisibility={getSettingsUserLevelVisibility("debug")}
        onSyncIntervalChange={() => {}}
        onWarningThresholdChange={() => {}}
        onThemePresetChange={() => {}}
        onPopupProgressStyleChange={() => {}}
        onSidebarProgressStyleChange={() => {}}
        onFullPageProgressStyleChange={() => {}}
        onPopupSizePresetChange={() => {}}
        onPopupCornerStyleChange={() => {}}
        onPopupCircularProgressItemsPerRowChange={() => {}}
        onPopupShadowStyleChange={() => {}}
        onProgressThicknessPxChange={() => {}}
        onProgressColorBandsChange={() => {}}
        onMotionModeChange={() => {}}
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
        onThemeCustomSeedChange={() => {}}
        onUiFontFamilyChange={() => {}}
      />,
    );
  }

  it("renders the always-visible controls plus the collapsible more section", () => {
    const html = renderPreferencesSection();

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.appearance}"`);
    expect(html).toContain('class="settings-grid settings-grid--balanced-settings"');
    expect(html).toContain('data-settings-custom-number-field="sync-interval"');
    expect(html).toContain('data-settings-custom-number-field="warning-threshold"');
    expect(html).not.toContain('data-settings-material-select="locale-preference"');
    expect(html).not.toContain('data-settings-material-select="theme-mode"');
    expect(html).toContain('data-color-choice-dropdown="accent-color"');
    expect(html).toContain('data-settings-material-select="motion-mode"');
    expect(html).toContain("material-info-tooltip__trigger");
    expect(html).toContain('class="form-field__label-row"');
    expect(html).toContain('role="tooltip"');
    expect(html).not.toContain("settings-preferences__field-with-helper");
    expect(html).not.toContain("settings-preferences__inline-helper");
    expect(html).toContain('data-action-badge-selection-controls=""');
    expect(html).toContain('data-action-badge-mode-switch=""');
    expect(html).toContain("Badge selection mode");
    expect(html).toContain(
      "Automatic mode shows attention count until provider quota badges are available",
    );
    expect(html).not.toContain('data-action-badge-mode-control=""');
    expect(html).not.toContain('data-action-badge-mode-reset=""');
    expect(html).toContain("Badge rotation interval");
    expect(html).toContain('data-settings-material-select="toolbar-icon-mode"');
    expect(html).toContain('data-configuration-backup=""');
    expect(html).toContain("Configuration backup and sync");
    expect(html).toContain("Export JSON");
    expect(html).toContain("Save to Chrome Sync");
    expect(html).toContain("Initialize configuration");
    expect(html).toContain("Toolbar icon");
    expect(html).toContain(">More UI settings<");
    expect(html).toContain('class="settings-preferences__more-toggle"');
    expect(html).toContain("settings-preferences__more-toggle-icon");
    expect(html).toContain('data-material-icon="keyboard-arrow-down"');
    expect(html).not.toContain(
      'class="source-card__details-toggle settings-preferences__more-toggle"',
    );
    expect(html).toContain(">Open toolbar popup preview<");
    expect(html).not.toContain('data-settings-material-select="popup-circular-row-count"');
    expect(html).not.toContain('data-settings-material-select="ui-font-family"');
    expect(html).not.toContain('data-progress-appearance-preferences=""');
    expect(html).not.toContain("Tune thickness and remaining-color bands");
    expect(html).not.toContain("#B3261E");
    expect(html).not.toContain('data-toolbar-popup-preview=');
    expect(html).not.toContain('data-provider-order-preferences=""');
    expect(html).not.toContain('data-provider-progress-preferences=""');
    expect(html).not.toContain("Provider display settings");
    expect(html).not.toContain("Quick glance");
    expect(html).not.toContain('class="theme-customization-form"');
  });

  it("moves badge auto/manual mode into the badge selector label row", () => {
    const autoHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      actionBadgeSelectionMode: "auto",
    });

    expect(autoHtml).toContain('data-action-badge-selection-mode="auto"');
    expect(autoHtml).toContain("Automatic");
    expect(autoHtml).toContain('aria-pressed="true"');
    expect(autoHtml).toContain('aria-readonly="true"');
    expect(autoHtml).not.toContain("Restore automatic");

    const manualHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      actionBadgeSelectionMode: "manual",
    });

    expect(manualHtml).toContain('data-action-badge-selection-mode="manual"');
    expect(manualHtml).toContain("Manual");
    expect(manualHtml).toContain('aria-pressed="false"');
    expect(manualHtml).toContain('aria-readonly="false"');
  });

  it("uses the narrow threshold for floating toolbar popup preview", () => {
    expect(canUseFloatingToolbarPopupPreview(639)).toBe(false);
    expect(canUseFloatingToolbarPopupPreview(640)).toBe(true);
    expect(canUseFloatingToolbarPopupPreview(760)).toBe(true);
  });

  it("renders the advanced UI controls only when the more section starts open", () => {
    const html = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
    });

    expect(html).toContain(">Collapse UI settings<");
    expect(html).toContain("settings-preferences__more-toggle-icon");
    expect(html).toContain('data-material-icon="keyboard-arrow-up"');
    expect(html).toContain('data-settings-material-select="popup-circular-row-count"');
    expect(html).toContain('data-settings-material-select="ui-font-family"');
    expect(html).toContain("Circular items per row");
    expect(html).toContain("4 per row");
    expect(html).toContain("UI font");
    expect(html).toContain(
      "Uses safe local system font stacks across the popup",
    );
    expect(html).toContain("material-info-tooltip__trigger");
    expect(html).toContain('class="form-field__label-row"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Line progress stays one item per row.");
    expect(html).not.toContain("settings-preferences__field-with-helper");
    expect(html).not.toContain("settings-preferences__inline-helper");
    expect(html).toContain('data-progress-appearance-preferences=""');
    expect(html).toContain("Tune thickness and remaining-color bands");
    expect(html).toContain("#B3261E");
    expect(html).not.toContain('data-toolbar-popup-preview=');
    expect(
      html.indexOf('data-progress-appearance-preferences=""'),
    ).toBeGreaterThan(
      html.indexOf('data-settings-material-select="popup-shadow-style"'),
    );
  });

  it("renders provider and custom toolbar icon controls only for matching modes", () => {
    const providerHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      toolbarIconMode: "provider",
      toolbarIconProviderId: "codex-personal-page",
    });

    expect(providerHtml).toContain(
      'data-settings-material-select="toolbar-icon-provider"',
    );
    expect(providerHtml).toContain("Codex Personal Usage Page");
    expect(providerHtml).not.toContain('data-toolbar-icon-custom-field=""');

    const customHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      toolbarIconMode: "custom",
      toolbarIconCustomImageDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    });

    expect(customHtml).toContain('data-toolbar-icon-custom-field=""');
    expect(customHtml).toContain("Custom image selected");
    expect(customHtml).toContain('type="file"');
    expect(customHtml).not.toContain(
      'data-settings-material-select="toolbar-icon-provider"',
    );
  });
});
