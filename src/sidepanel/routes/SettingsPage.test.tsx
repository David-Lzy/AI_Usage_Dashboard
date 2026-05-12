import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SettingsPage } from "./SettingsPage";

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
      {...overrides}
    />,
  );
}

describe("SettingsPage", () => {
  it("renders the top-bar navigation, overview controls, and basic-mode quick setup", () => {
    const html = renderSettingsPage();

    expect(html).toContain('class="top-app-bar__bottom"');
    expect(html).toContain('class="settings-section-nav"');
    expect(html).toContain('data-settings-material-select="settings-user-level"');
    expect(html).toContain(">Quick Setup<");
    expect(html).toContain('data-settings-material-select="action-badge-selection"');
    expect(html).toContain(">More<");
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
    expect(html).toContain('data-settings-material-select="action-badge-selection"');
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

  it("marks more providers for attention when no quick-setup provider is visible", () => {
    const html = renderSettingsPage({
      providers: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        enabled: false,
      })),
    });

    expect(html).toContain('data-quick-setup-empty-visible="true"');
    expect(html).toContain('data-quick-setup-attention="true"');
    expect(html).toContain('data-quick-setup-first-provider-id="codex"');
    expect(html).toContain(">Start with Codex<");
    expect(html).toContain(">Enable Codex<");
  });
});
