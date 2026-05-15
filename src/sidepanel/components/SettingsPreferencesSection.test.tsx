import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsPreferencesSection } from "./SettingsPreferencesSection";

describe("SettingsPreferencesSection", () => {
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
        onProviderOrderBySurfaceChange={() => {}}
        onProgressItemsBySurfaceChange={() => {}}
        onProgressThicknessPxChange={() => {}}
        onProgressColorBandsChange={() => {}}
        onActionBadgeSelectionChange={() => {}}
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
    expect(html).toContain('data-settings-custom-number-field="sync-interval"');
    expect(html).toContain('data-settings-custom-number-field="warning-threshold"');
    expect(html).not.toContain('data-settings-material-select="locale-preference"');
    expect(html).not.toContain('data-settings-material-select="theme-mode"');
    expect(html).toContain('data-color-choice-dropdown="accent-color"');
    expect(html).toContain('data-settings-material-select="popup-circular-row-count"');
    expect(html).toContain('data-settings-material-select="ui-font-family"');
    expect(html).toContain("Circular items per row");
    expect(html).toContain("2 per row");
    expect(html).toContain("UI font");
    expect(html).toContain(
      "Uses safe local system font stacks across the popup",
    );
    expect(html).toContain("material-info-tooltip__trigger");
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Line progress stays one item per row.");
    expect(html).not.toContain("settings-preferences__inline-helper");
    expect(html).toContain('data-settings-material-select="action-badge-selection"');
    expect(html).toContain('data-settings-material-select="toolbar-icon-mode"');
    expect(html).toContain("Toolbar icon");
    expect(html).toContain('data-provider-order-preferences=""');
    expect(html).toContain('data-provider-progress-preferences=""');
    expect(html).toContain('data-progress-appearance-preferences=""');
    expect(html).toContain('data-provider-order-surface="popup"');
    expect(html).toContain('data-provider-order-surface="sidebar"');
    expect(html).toContain('data-provider-order-surface="fullPage"');
    expect(html).toContain('data-provider-progress-surface="popup"');
    expect(html).toContain('data-provider-progress-surface="sidebar"');
    expect(html).toContain('data-provider-progress-surface="fullPage"');
    expect(html).toContain("Choose the order per surface");
    expect(html).toContain("Tune thickness and remaining-color bands");
    expect(html).toContain("#B3261E");
    expect(html).toContain(">More UI settings<");
    expect(html).toContain(">Provider display controls<");
    expect(html).toContain('class="popup-appearance-preview-card"');
    expect(html).not.toContain('class="theme-customization-form"');
    expect(
      html.indexOf('data-progress-appearance-preferences=""'),
    ).toBeLessThan(html.indexOf('class="popup-appearance-preview-card"'));
    expect(html.indexOf('class="popup-appearance-preview-card"')).toBeLessThan(
      html.indexOf('data-provider-order-preferences=""'),
    );
    expect(html.indexOf('data-provider-order-preferences=""')).toBeLessThan(
      html.indexOf('data-provider-progress-preferences=""'),
    );
  });

  it("renders provider and custom toolbar icon controls only for matching modes", () => {
    const providerHtml = renderPreferencesSection({
      ...SAMPLE_APP_STATE.settings,
      toolbarIconMode: "provider",
      toolbarIconProviderId: "codex",
    });

    expect(providerHtml).toContain(
      'data-settings-material-select="toolbar-icon-provider"',
    );
    expect(providerHtml).toContain(">Codex<");
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
