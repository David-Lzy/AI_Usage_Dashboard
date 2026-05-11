import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import {
  SettingsOverviewSection,
  SettingsPermissionsSection,
  SettingsVisibilitySection,
} from "./SettingsSections";

describe("SettingsSections", () => {
  it("renders the settings overview summary", () => {
    const html = renderToStaticMarkup(
      <SettingsOverviewSection
        sectionId={SETTINGS_SECTION_IDS.overview}
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

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.overview}"`);
    expect(html).toContain(
      'class="status-card settings-overview settings-section-anchor"',
    );
    expect(html).toContain('aria-label="Settings summary"');
    expect(html).toContain('class="summary-pill summary-pill--neutral"');
    expect(html).toContain('class="summary-pill summary-pill--warning"');
    expect(html).toContain(">Settings<");
  });

  it("renders visibility switch rows with stable provider hooks", () => {
    const html = renderToStaticMarkup(
      <SettingsVisibilitySection
        sectionId="settings-visibility-test"
        eyebrow="Visibility"
        providers={SAMPLE_APP_STATE.providerSettings.slice(0, 2)}
        enabledDetail="Shown on dashboard."
        disabledDetail="Hidden from dashboard."
        onToggleProvider={() => {}}
      />,
    );

    expect(html).toContain('id="settings-visibility-test"');
    expect(html).toContain('class="switch-row"');
    expect(html).toContain('data-visibility-provider-id="cursor"');
    expect(html).toContain('data-visibility-toggle="cursor"');
    expect(html).toContain('type="checkbox"');
  });

  it("renders permission prompts with stable permission hooks", () => {
    const html = renderToStaticMarkup(
      <SettingsPermissionsSection
        sectionId="settings-permissions-test"
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

    expect(html).toContain('id="settings-permissions-test"');
    expect(html).toContain('class="permission-prompt');
    expect(html).toContain('data-provider-id="cursor"');
    expect(html).toContain('data-permission-status=');
    expect(html).toContain('data-permission-action=');
  });

});
