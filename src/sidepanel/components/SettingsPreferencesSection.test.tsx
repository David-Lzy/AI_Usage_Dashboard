import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { SettingsPreferencesSection } from "./SettingsPreferencesSection";

describe("SettingsPreferencesSection", () => {
  it("renders preference controls, popup preview, and theme customization", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <SettingsPreferencesSection
        sectionId={SETTINGS_SECTION_IDS.preferences}
        settings={SAMPLE_APP_STATE.settings}
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        i18n={i18n}
        settingsCopy={settingsCopy}
        resolvedThemeMode="light"
        themeCustomSeedDraft="#2f6fed"
        onSyncIntervalChange={() => {}}
        onWarningThresholdChange={() => {}}
        onLocalePreferenceChange={() => {}}
        onThemeModeChange={() => {}}
        onThemePresetChange={() => {}}
        onPopupProgressStyleChange={() => {}}
        onSidebarProgressStyleChange={() => {}}
        onFullPageProgressStyleChange={() => {}}
        onPopupSizePresetChange={() => {}}
        onPopupCornerStyleChange={() => {}}
        onPopupShadowStyleChange={() => {}}
        onActionBadgeSelectionChange={() => {}}
        onThemeCustomSeedDraftChange={() => {}}
        onApplyThemeCustomSeed={() => {}}
        onResetThemeCustomSeed={() => {}}
      />,
    );

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.preferences}"`);
    expect(html).toContain('data-settings-custom-number-field="sync-interval"');
    expect(html).toContain('data-settings-material-select="locale-preference"');
    expect(html).toContain('data-settings-material-select="action-badge-selection"');
    expect(html).toContain('class="popup-appearance-preview-card"');
    expect(html).toContain('class="theme-customization-form"');
    expect(html).toContain('class="theme-preview-grid"');
  });
});
