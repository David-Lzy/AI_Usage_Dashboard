import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ApiKeyProviderId, ProviderSetting } from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import {
  SettingsCredentialsSection,
  SettingsOverviewSection,
  SettingsPermissionsSection,
  SettingsVisibilitySection,
  type CredentialProviderSection,
} from "./SettingsSections";

describe("SettingsSections", () => {
  it("renders the settings overview summary", () => {
    const html = renderToStaticMarkup(
      <SettingsOverviewSection
        ariaLabel="Settings summary"
        detail="Review global preferences and access."
        eyebrow="Dashboard preferences"
        items={[
          { label: "Visible", value: "4", tone: "neutral" },
          { label: "Needs access", value: "1", tone: "warning" },
        ]}
        title="Settings"
      />,
    );

    expect(html).toContain('class="status-card settings-overview"');
    expect(html).toContain('aria-label="Settings summary"');
    expect(html).toContain('class="summary-pill summary-pill--neutral"');
    expect(html).toContain('class="summary-pill summary-pill--warning"');
    expect(html).toContain(">Settings<");
  });

  it("renders visibility switch rows with stable provider hooks", () => {
    const html = renderToStaticMarkup(
      <SettingsVisibilitySection
        sectionId={SETTINGS_SECTION_IDS.visibility}
        eyebrow="Visibility"
        providers={SAMPLE_APP_STATE.providerSettings.slice(0, 2)}
        enabledDetail="Shown on dashboard."
        disabledDetail="Hidden from dashboard."
        onToggleProvider={() => {}}
      />,
    );

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.visibility}"`);
    expect(html).toContain('class="switch-row"');
    expect(html).toContain('data-visibility-provider-id="cursor"');
    expect(html).toContain('data-visibility-toggle="cursor"');
    expect(html).toContain('type="checkbox"');
  });

  it("renders permission prompts with stable permission hooks", () => {
    const html = renderToStaticMarkup(
      <SettingsPermissionsSection
        sectionId={SETTINGS_SECTION_IDS.permissions}
        eyebrow="Permissions"
        title="Host access"
        detail="Grant access only for providers you use."
        providers={SAMPLE_APP_STATE.providerSettings.slice(0, 2)}
        labels={{
          noHostAccessRequired: "No host access required",
          hostAccessGranted: "Granted",
          hostAccessMissing: "Needs access",
          noActionNeeded: "No action needed",
          removeAccess: "Remove access",
          requestAccess: "Request access",
        }}
        onTogglePermission={() => {}}
      />,
    );

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.permissions}"`);
    expect(html).toContain('class="permission-prompt');
    expect(html).toContain('data-provider-id="cursor"');
    expect(html).toContain('data-permission-status=');
    expect(html).toContain('data-permission-action=');
  });

  it("renders credential cards with stable credential hooks", () => {
    const cursorProvider = SAMPLE_APP_STATE.providerSettings.find(
      (
        provider,
      ): provider is ProviderSetting & { id: ApiKeyProviderId } =>
        provider.id === "cursor",
    );
    const codexProvider = SAMPLE_APP_STATE.providerSettings.find(
      (provider): provider is ProviderSetting & { id: "codex" } =>
        provider.id === "codex",
    );

    expect(cursorProvider).toBeDefined();
    expect(codexProvider).toBeDefined();

    const credentialProviders: CredentialProviderSection[] = [
      {
        provider: cursorProvider!,
        title: "Cursor Admin key",
        inputLabel: "Admin API key",
        helpText: "Stored locally.",
        footerText: "Team scope only.",
        placeholderMissing: "Paste key",
        placeholderConfigured: "Configured locally.",
      },
    ];

    const html = renderToStaticMarkup(
      <SettingsCredentialsSection
        sectionId={SETTINGS_SECTION_IDS.credentials}
        eyebrow="Credentials"
        title="Provider credentials"
        detail="Add optional provider credentials."
        credentialProviders={credentialProviders}
        codexProvider={codexProvider!}
        credentialInputs={{ cursor: "draft-key", "claude-code": "" }}
        codexAnalyticsApiKeyInput="codex-key"
        codexWorkspaceIdInput="workspace-1"
        labels={{
          sectionLabel: "Provider credential",
          configured: "Configured",
          missing: "Missing",
          saveKey: "Save key",
          clearStoredKey: "Clear stored key",
          saveConfig: "Save config",
          clearStoredConfig: "Clear stored config",
          adminApiKeyLabel: "Admin API key",
          analyticsApiKeyLabel: "Analytics API key",
          workspaceIdLabel: "Workspace ID",
          cursorTitle: "Cursor Team Admin API key",
          cursorHelpText: "Cursor help",
          cursorFooterText: "Cursor footer",
          cursorPlaceholderMissing: "Paste Cursor Admin API key",
          cursorPlaceholderConfigured: "Cursor configured",
          claudeTitle: "Claude Code Analytics Admin API key",
          claudeHelpText: "Claude help",
          claudeFooterText: "Claude footer",
          claudePlaceholderMissing: "Paste Anthropic Admin API key",
          claudePlaceholderConfigured: "Claude configured",
          codexTitle: "Codex Enterprise analytics config",
          codexHelpText: "Codex help",
          codexFooterText: "Codex footer",
          codexAnalyticsPlaceholderMissing: "Paste analytics key",
          codexAnalyticsPlaceholderConfigured: "Analytics configured",
          codexWorkspacePlaceholderMissing: "Paste workspace",
          codexWorkspacePlaceholderConfigured: "Workspace configured",
        }}
        onSaveProviderApiKey={() => {}}
        onClearProviderApiKey={() => {}}
        onProviderApiKeyInputChange={() => {}}
        onSaveCodexConfig={() => {}}
        onClearCodexConfig={() => {}}
        onCodexAnalyticsApiKeyInputChange={() => {}}
        onCodexWorkspaceIdInputChange={() => {}}
      />,
    );

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.credentials}"`);
    expect(html).toContain('data-credential-provider-id="cursor"');
    expect(html).toContain('data-credential-provider-id="codex"');
    expect(html).toContain('class="credential-form"');
    expect(html).toContain('type="password"');
    expect(html).toContain(">Save key<");
    expect(html).toContain(">Save config<");
  });
});
