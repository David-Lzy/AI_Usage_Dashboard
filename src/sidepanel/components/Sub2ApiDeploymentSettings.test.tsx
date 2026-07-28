import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { DEFAULT_PROVIDER_ACCOUNT_ID } from "../../shared/provider-accounts";
import { saveSub2ApiDeployment } from "../../shared/sub2api-deployments";
import { Sub2ApiDeploymentSettings } from "./Sub2ApiDeploymentSettings";

const settingsAppearanceCss = readFileSync(
  new URL("../theme/settings-appearance.css", import.meta.url),
  "utf8",
);

function getSub2ApiSnapshot() {
  return (
    SAMPLE_APP_STATE.providers.find(
      ({ providerId }) => providerId === "sub2api-api-key",
    ) ?? null
  );
}

describe("Sub2ApiDeploymentSettings", () => {
  it("renders the selected popup presentation mode for multiple deployments", () => {
    const first = saveSub2ApiDeployment(
      structuredClone(SAMPLE_APP_STATE),
      {
        accountId: DEFAULT_PROVIDER_ACCOUNT_ID,
        displayLabel: "Primary gateway",
        baseUrl: "https://primary.example.test",
        apiKey: "primary-secret",
        insecureTransportAcknowledged: false,
      },
    );
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = saveSub2ApiDeployment(
      first.state,
      {
        accountId: null,
        displayLabel: "Backup gateway",
        baseUrl: "https://backup.example.test",
        apiKey: "backup-secret",
        insecureTransportAcknowledged: false,
      },
      { createAccountId: () => "account_backup12" },
    );
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    const html = renderToStaticMarkup(
      <Sub2ApiDeploymentSettings
        locale="en"
        popupAccountPresentationMode="cycle"
        providerAccounts={second.state.providerAccounts}
        snapshot={getSub2ApiSnapshot()}
        onSelectAccount={() => {}}
        onSave={() => {}}
        onTest={async () => true}
        onDisconnect={() => {}}
        onRemove={() => {}}
        onPopupAccountPresentationModeChange={() => {}}
      />,
    );

    expect(html).toContain("Popup deployment layout");
    expect(html).toContain("Next button");
    expect(html).toContain(
      'data-settings-material-select="sub2api-popup-account-presentation"',
    );
  });

  it("renders isolated deployment CRUD fields without exposing a saved key", () => {
    const connected = saveSub2ApiDeployment(
      structuredClone(SAMPLE_APP_STATE),
      {
        accountId: DEFAULT_PROVIDER_ACCOUNT_ID,
        displayLabel: "Private gateway",
        baseUrl: "https://gateway.example.test",
        apiKey: "must-not-render",
        insecureTransportAcknowledged: false,
      },
    );
    expect(connected.ok).toBe(true);
    if (!connected.ok) return;

    const html = renderToStaticMarkup(
      <Sub2ApiDeploymentSettings
        locale="en"
        popupAccountPresentationMode="select"
        providerAccounts={connected.state.providerAccounts}
        snapshot={getSub2ApiSnapshot()}
        onSelectAccount={() => {}}
        onSave={() => {}}
        onTest={async () => true}
        onDisconnect={() => {}}
        onRemove={() => {}}
        onPopupAccountPresentationModeChange={() => {}}
      />,
    );

    expect(html).toContain('data-sub2api-deployment-settings=""');
    expect(html).toContain("Sub2API connections");
    expect(html).toContain("Private gateway");
    expect(html).toContain("https://gateway.example.test");
    expect(html).toContain('type="password"');
    expect(html).toContain('data-stored-credential-placeholder=""');
    expect(html).toContain('placeholder="••••••••••••"');
    expect(html).toContain("Leave blank to keep the saved key.");
    expect(html).toMatch(
      /data-sub2api-action="test" type="button">Test<\/button>/,
    );
    expect(html).toContain('data-sub2api-action="save"');
    expect(html).toContain(">Test<");
    expect(html).toContain(">Save<");
    expect(html).toContain("Keep the last nonsecret summary");
    expect(html).toContain("GET /v1/usage");
    expect(html).not.toContain('disabled="" value="API key · GET /v1/usage"');
    expect(html).not.toContain("must-not-render");
  });

  it("disables connection testing until a deployment has been saved", () => {
    const html = renderToStaticMarkup(
      <Sub2ApiDeploymentSettings
        locale="en"
        popupAccountPresentationMode="select"
        providerAccounts={undefined}
        snapshot={null}
        onSelectAccount={() => {}}
        onSave={() => {}}
        onTest={async () => true}
        onDisconnect={() => {}}
        onRemove={() => {}}
        onPopupAccountPresentationModeChange={() => {}}
      />,
    );

    expect(html).toMatch(
      /data-sub2api-action="test" type="button" disabled="">Test<\/button>/,
    );
  });

  it("keeps a persistent warning for acknowledged non-loopback HTTP", () => {
    const connected = saveSub2ApiDeployment(
      structuredClone(SAMPLE_APP_STATE),
      {
        accountId: DEFAULT_PROVIDER_ACCOUNT_ID,
        displayLabel: "Lab gateway",
        baseUrl: "http://gateway.example.test",
        apiKey: "not-stored-in-state",
        insecureTransportAcknowledged: true,
      },
    );
    expect(connected.ok).toBe(true);
    if (!connected.ok) return;

    const html = renderToStaticMarkup(
      <Sub2ApiDeploymentSettings
        locale="en"
        popupAccountPresentationMode="select"
        providerAccounts={connected.state.providerAccounts}
        snapshot={getSub2ApiSnapshot()}
        onSelectAccount={() => {}}
        onSave={() => {}}
        onTest={async () => true}
        onDisconnect={() => {}}
        onRemove={() => {}}
        onPopupAccountPresentationModeChange={() => {}}
      />,
    );

    expect(html).toContain('data-sub2api-insecure-warning=""');
    expect(html).toContain("Unencrypted remote connection");
    expect(html).toContain("without transport encryption");
  });

  it("defines bounded responsive fields and shared compact ordering controls", () => {
    expect(settingsAppearanceCss).toContain(".sub2api-deployment-settings__form");
    expect(settingsAppearanceCss).toContain(
      ".sub2api-deployment-settings__connection-mode",
    );
    expect(settingsAppearanceCss).toContain(".credential-secret-row");
    expect(settingsAppearanceCss).toContain(
      "[data-stored-credential-placeholder]::placeholder",
    );
    expect(settingsAppearanceCss).toContain(
      ".sub2api-deployment-settings__test-progress",
    );
    expect(settingsAppearanceCss).toContain(
      ':root[data-motion-resolved="reduced"]',
    );
    expect(settingsAppearanceCss).toContain(
      ".api-gateway-module-preferences__surface-grid",
    );
    expect(settingsAppearanceCss).toContain(
      ".api-gateway-module-preferences__visibility",
    );
    expect(settingsAppearanceCss).toContain(
      ".provider-order-preferences__surfaces",
    );
    expect(settingsAppearanceCss).toContain(
      "grid-template-columns: repeat(3, minmax(0, 1fr));",
    );
    expect(settingsAppearanceCss).toContain("@media (max-width: 640px)");
    expect(settingsAppearanceCss).toContain("grid-column: auto;");
  });
});
