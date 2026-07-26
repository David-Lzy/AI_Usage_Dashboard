import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ApiKeyProviderId, ProviderSetting } from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import {
  SettingsCredentialsSection,
  type CredentialProviderSection,
} from "./SettingsCredentialsSection";

describe("SettingsCredentialsSection", () => {
  it("renders credential cards with stable credential hooks", () => {
    const cursorProvider = SAMPLE_APP_STATE.providerSettings.find(
      (
        provider,
      ): provider is ProviderSetting & { id: ApiKeyProviderId } =>
        provider.id === "cursor-team-api",
    );
    const codexProvider = SAMPLE_APP_STATE.providerSettings.find(
      (provider): provider is ProviderSetting & { id: "codex-enterprise-api" } =>
        provider.id === "codex-enterprise-api",
    );

    expect(cursorProvider).toBeDefined();
    expect(codexProvider).toBeDefined();

    const credentialProviders: CredentialProviderSection[] = [
      {
        provider: {
          ...cursorProvider!,
          credentialStatus: "configured",
        },
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
        sectionId="settings-credentials-test"
        eyebrow="Credentials"
        title="Provider credentials"
        detail="Add optional provider credentials."
        focusedProviderId="codex-enterprise-api"
        credentialProviders={credentialProviders}
        codexProvider={codexProvider!}
        credentialInputs={{
          "cursor-team-api": "",
          "claude-code-admin-api": "",
          "codex-enterprise-api": "",
        }}
        codexAnalyticsApiKeyInput="codex-key"
        codexSessionTokenInput="temporary-token"
        codexWorkspaceIdInput="workspace-1"
        codexSessionLabels={{
          title: "Codex temporary session token",
          state: "Session only",
          help: "Advanced recovery only.",
          input: "Temporary access token",
          placeholder: "Paste only the token value",
          save: "Use for this browser session",
          clear: "Clear temporary token",
          footer: "Stored in session only.",
        }}
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
        locale="en"
        onSaveProviderApiKey={() => {}}
        onTestProviderConnection={() => {}}
        onClearProviderApiKey={() => {}}
        onProviderApiKeyInputChange={() => {}}
        onSaveCodexConfig={() => {}}
        onClearCodexConfig={() => {}}
        onSaveCodexSessionToken={() => {}}
        onClearCodexSessionToken={() => {}}
        onCodexAnalyticsApiKeyInputChange={() => {}}
        onCodexSessionTokenInputChange={() => {}}
        onCodexWorkspaceIdInputChange={() => {}}
      />,
    );

    expect(html).toContain('id="settings-credentials-test"');
    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain('data-provider-carousel-active-id="codex-enterprise-api"');
    expect(html).toContain('data-credential-provider-id="cursor-team-api"');
    expect(html).toContain('data-credential-provider-id="codex-enterprise-api"');
    expect(html).toContain('data-credential-provider-id="codex-session-token"');
    expect(html).toContain('data-codex-session-token-input=""');
    expect(html).toContain('class="credential-form"');
    expect(html).toContain('type="password"');
    expect(html).toContain('data-stored-credential-placeholder=""');
    expect(html).toContain('placeholder="••••••••••••"');
    expect(html).toContain('class="credential-secret-row"');
    expect(html).toContain('data-credential-action="test"');
    expect(html).toContain(">Test<");
    expect(html).toContain(">Save key<");
    expect(html).toContain(">Save config<");
    expect(html).toContain(">Use for this browser session<");
  });
});
