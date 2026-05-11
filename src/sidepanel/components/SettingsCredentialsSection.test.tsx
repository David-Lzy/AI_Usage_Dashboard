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
        sectionId="settings-credentials-test"
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

    expect(html).toContain('id="settings-credentials-test"');
    expect(html).toContain('data-credential-provider-id="cursor"');
    expect(html).toContain('data-credential-provider-id="codex"');
    expect(html).toContain('class="credential-form"');
    expect(html).toContain('type="password"');
    expect(html).toContain(">Save key<");
    expect(html).toContain(">Save config<");
  });
});
