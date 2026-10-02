import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/demo-state";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import type { SettingsPreferencesSurfaceSessionControls } from "../use-settings-surface-session-state";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsPreferencesSection } from "./SettingsPreferencesSection";
import { canUseFloatingToolbarPopupPreview } from "./SettingsUiMoreSection";
import { POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT } from "./ToolbarPopupPreview";

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
    providerAccounts = SAMPLE_APP_STATE.providerAccounts,
  ): string {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);

    return renderToStaticMarkup(
      <SettingsPreferencesSection
        sectionId={SETTINGS_SECTION_IDS.appearance}
        usageSectionId={SETTINGS_SECTION_IDS.usageNotifications}
        settings={settings}
        providerAccounts={providerAccounts}
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
        onPopupProviderBrowsingModeChange={() => {}}
        onPopupCornerStyleChange={() => {}}
        onPopupCircularProgressItemsPerRowChange={() => {}}
        onPopupShadowStyleChange={() => {}}
        onProgressThicknessPxChange={() => {}}
        onProgressColorAppearanceChange={() => {}}
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

  it("places multiple-deployment presentation in Popup layout", () => {
    const html = renderPreferencesSection(SAMPLE_APP_STATE.settings, {
      "sub2api-api-key": {
        activeAccountId: "default",
        accounts: ["default", "account_backup12"].map((id) => ({
          id,
          label: id,
          createdAt: null,
          lastSuccessAt: null,
        })),
        inactiveAccounts: {},
      },
    });
    const layout = html.slice(
      html.indexOf('data-settings-appearance-group="layout"'),
      html.indexOf('data-settings-appearance-group="content"'),
    );
    expect(layout).toContain(
      'data-fusion-field="sub2api-popup-account-presentation"',
    );
    expect(
      html.match(/data-fusion-field="sub2api-popup-account-presentation"/g),
    ).toHaveLength(1);
  });

  it("groups all preferences without hiding capabilities behind More UI", () => {
    const html = renderPreferencesSection();
    const usage = html.slice(
      html.indexOf('id="settings-usage-notifications"'),
      html.indexOf('id="settings-data"'),
    );
    const appearance = html.slice(html.indexOf('id="settings-appearance"'));
    expect(usage).toContain(
      'data-settings-custom-number-field="sync-interval"',
    );
    expect(usage).toContain(
      'data-settings-custom-number-field="warning-threshold"',
    );
    expect(usage).toContain('data-quota-notifications=""');
    expect(usage).toContain('data-quota-pace-forecast-setting=""');
    expect(usage).not.toContain('data-configuration-backup=""');
    expect(appearance).not.toContain('data-quota-pace-forecast-setting=""');
    expect(appearance).not.toContain(
      'data-settings-custom-number-field="sync-interval"',
    );
    for (const group of ["global", "layout", "content", "toolbar"]) {
      expect(appearance).toContain(`data-settings-appearance-group="${group}"`);
    }
    for (const field of [
      "motion-mode",
      "ui-font-family",
      "settings-editing-surface",
      "popup-progress-style",
      "popup-circular-row-count",
      "popup-provider-browsing-mode",
      "popup-size-preset",
      "popup-corner-style",
      "popup-shadow-style",
      "reset-time-display-mode",
      "toolbar-icon-mode",
    ]) {
      expect(appearance).toContain(`data-settings-material-select="${field}"`);
    }
    expect(appearance).not.toContain(
      'data-settings-material-select="sidebar-progress-style"',
    );
    expect(appearance).not.toContain(
      'data-settings-material-select="full-page-progress-style"',
    );
    expect(appearance).toContain('data-color-choice-dropdown="accent-color"');
    expect(appearance).toContain('data-progress-appearance-preferences=""');
    expect(appearance).toContain('data-action-badge-selection-controls=""');
    expect(appearance).not.toContain(">More UI settings<");
    expect(html).toContain('data-configuration-backup=""');
    expect(html).toContain("Export JSON");
    expect(html).toContain("Save to Chrome Sync");
    expect(html).toContain("Initialize configuration");
    expect(appearance).toContain(">Open toolbar popup preview<");
    expect(appearance).not.toContain("data-toolbar-popup-preview=");
    expect(
      appearance.indexOf('data-settings-appearance-group="global"'),
    ).toBeLessThan(
      appearance.indexOf('data-settings-appearance-group="layout"'),
    );
    expect(
      appearance.indexOf('data-settings-appearance-group="content"'),
    ).toBeLessThan(
      appearance.indexOf('data-settings-appearance-group="toolbar"'),
    );
  });

  it("renders badge selection mode as a closed dropdown setting", () => {
    const autoHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
      actionBadgeSelectionMode: "auto",
    });

    expect(autoHtml).toContain('data-action-badge-selection-mode="auto"');
    expect(autoHtml).not.toContain('data-action-badge-mode-switch=""');
    expect(autoHtml).toContain('aria-readonly="true"');
    expect(autoHtml).not.toContain("Restore automatic");

    const manualHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
      actionBadgeSelectionMode: "manual",
    });

    expect(manualHtml).toContain('data-action-badge-selection-mode="manual"');
    expect(manualHtml).not.toContain('data-action-badge-mode-switch=""');
    expect(manualHtml).toContain('aria-readonly="false"');
  });

  it("uses the narrow threshold for floating toolbar popup preview", () => {
    expect(canUseFloatingToolbarPopupPreview(639)).toBe(false);
    expect(canUseFloatingToolbarPopupPreview(640)).toBe(true);
    expect(canUseFloatingToolbarPopupPreview(760)).toBe(true);
  });

  it("preserves all advanced appearance controls with a custom theme", () => {
    const html = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
    });

    expect(html).toContain(">Global appearance<");
    expect(html).toContain(
      'class="adaptive-control-grid settings-grid settings-grid--balanced-settings"',
    );
    expect(html).toContain('data-settings-appearance-group="toolbar"');
    expect(html).toContain(
      'data-settings-material-select="popup-circular-row-count"',
    );
    expect(html).toContain(
      'data-settings-material-select="popup-provider-browsing-mode"',
    );
    expect(html).toContain("Popup provider browsing");
    expect(html).toContain("Collapsible list");
    expect(html).toContain("Previous and next");
    expect(html).toContain("Top switch");
    expect(html).toContain("Auto glide");
    expect(html).toContain('data-action-badge-selection-controls=""');
    expect(html).toContain("Badge rotation interval");
    expect(html).toContain('data-settings-material-select="toolbar-icon-mode"');
    expect(html).toContain('data-settings-material-select="ui-font-family"');
    expect(html).toContain(
      'data-settings-material-select="reset-time-display-mode"',
    );
    expect(html).toContain("Circular items per row");
    expect(html).toContain("4 per row");
    expect(html).toContain("UI font");
    expect(html).toContain("Reset time format");
    expect(html).toContain("Date and time");
    expect(html).toContain('data-quota-pace-forecast-setting=""');
    expect(html).toContain("Quota pace estimate");
    expect(html).toContain('type="checkbox"');
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
    expect(html).not.toContain("data-toolbar-popup-preview=");
    expect(
      html.indexOf('data-progress-appearance-preferences=""'),
    ).toBeLessThan(
      html.indexOf('data-settings-material-select="popup-shadow-style"'),
    );
    expect(
      html.indexOf('data-settings-material-select="toolbar-icon-mode"'),
    ).toBeGreaterThan(html.indexOf('data-settings-appearance-group="toolbar"'));
  });

  it("renders the quota pace preference as default-off and preserves opt-in", () => {
    const defaultHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
    });
    const enabledHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
      quotaPaceForecastEnabled: true,
    });

    expect(defaultHtml).toContain('data-quota-pace-forecast-setting=""');
    expect(defaultHtml).not.toContain(
      'data-quota-pace-forecast-setting=""><input type="checkbox" checked=""',
    );
    expect(enabledHtml).toContain(
      'data-quota-pace-forecast-setting=""><input type="checkbox" checked=""',
    );
  });

  it("renders provider and custom toolbar icon controls only for matching modes", () => {
    const providerHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      themePreset: "custom",
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
      themePreset: "custom",
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
