import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SAMPLE_APP_STATE } from "../../shared/demo-state";
import { SettingsProviderConnectionControls } from "./SettingsProviderConnectionControls";

function render(providerId: string, enabled = true) {
  const provider = SAMPLE_APP_STATE.providerSettings.find((item) => item.id === providerId)!;
  return renderToStaticMarkup(<SettingsProviderConnectionControls
    provider={{ ...provider, displayEnabled: enabled }} snapshot={SAMPLE_APP_STATE.providers.find((item) => item.providerId === providerId) ?? null}
    locale="en" settings={SAMPLE_APP_STATE.settings} providerAccounts={SAMPLE_APP_STATE.providerAccounts}
    onSelectAccount={() => {}} onPopupAccountPresentationModeChange={() => {}}
    onSave={() => {}} onTest={async () => false} onDisconnect={() => {}} onRemove={() => {}} />);
}

describe("SettingsProviderConnectionControls", () => {
  it("places ordinary Codex pairing with the enabled Codex connection", () => {
    expect(render("codex-personal-page")).toContain('data-codex-local-settings=""');
    expect(render("codex-personal-page", false)).not.toContain('data-codex-local-settings=""');
    expect(render("claude-code-team-page")).not.toContain('data-codex-local-settings=""');
  });
  it("keeps deployment credentials and explicit actions under Sub2API", () => {
    const html = render("sub2api-api-key", false);
    expect(html).toContain('data-credential-provider-id="sub2api-api-key"');
    expect(html).toContain('data-sub2api-deployment-settings=""');
    expect(html).toContain('data-sub2api-action="save"');
    expect(html).toContain('data-sub2api-action="test"');
    expect(html).not.toContain('data-api-gateway-module-preferences=""');
  });
});
