import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
  it("renders section navigation inside the top bar and a back-to-top action", () => {
    const html = renderToStaticMarkup(
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
        onWarningThresholdChange={() => {}}
        onThemeModeChange={() => {}}
        onThemePresetChange={() => {}}
        onPopupProgressStyleChange={() => {}}
        onSidebarProgressStyleChange={() => {}}
        onFullPageProgressStyleChange={() => {}}
        onPopupSizePresetChange={() => {}}
        onPopupCornerStyleChange={() => {}}
        onPopupShadowStyleChange={() => {}}
        onActionBadgeSelectionChange={() => {}}
        onSaveThemeCustomSeed={() => {}}
        onResetThemeCustomSeed={() => {}}
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
      />,
    );

    expect(html).toContain('class="top-app-bar__bottom"');
    expect(html).toContain('class="settings-section-nav"');
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('data-active="true"');
    expect(html).toContain('class="settings-back-to-top-fab"');
    expect(html).toContain('aria-label="Back to top"');
    expect(html).toContain('class="settings-back-to-top-fab__label"');
  });
});
