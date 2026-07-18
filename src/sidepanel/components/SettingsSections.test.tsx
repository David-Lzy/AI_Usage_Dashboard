import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import {
  SettingsOverviewSection,
  SettingsPermissionsSection,
  SettingsVisibilitySection,
} from "./SettingsSections";

const typographyCss = readFileSync(
  new URL("../theme/typography.css", import.meta.url),
  "utf8",
);
const settingsNavigationCss = readFileSync(
  new URL("../theme/settings-navigation.css", import.meta.url),
  "utf8",
);
const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);
const accessFeedbackCss = readFileSync(
  new URL("../theme/access-feedback.css", import.meta.url),
  "utf8",
);

describe("SettingsSections", () => {
  it("keeps section labels neutral instead of tertiary accent colored", () => {
    expect(typographyCss).toContain(".section-label {");
    expect(typographyCss).toContain(
      "color: var(--md-sys-color-on-surface-variant);",
    );
    expect(typographyCss).not.toContain(
      ".section-label {\n  margin: 0;\n  color: var(--md-sys-color-tertiary);",
    );
  });

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
    expect(html).toContain(
      'class="dashboard-section__header settings-overview__header"',
    );
    expect(html).toContain('class="settings-overview__eyebrow"');
    expect(html).toContain('aria-label="Settings summary"');
    expect(html).toContain(
      'class="summary-strip summary-strip--compact settings-overview__summary"',
    );
    expect(html).toContain('class="summary-pill summary-pill--neutral"');
    expect(html).toContain('class="summary-pill summary-pill--warning"');
    expect(html).toContain(">Settings<");
  });

  it("keeps overview summary and preference controls compact and adaptive", () => {
    expect(settingsNavigationCss).toContain(
      ".settings-overview__summary.summary-strip--compact {",
    );
    expect(settingsNavigationCss).toContain(".settings-overview__eyebrow {");
    expect(settingsNavigationCss).toContain(
      "--material-info-tooltip-size: var(--md-sys-typescale-label-medium-size);",
    );
    expect(settingsNavigationCss).toContain(
      "grid-template-columns: minmax(0, max-content) minmax(",
    );
    expect(settingsNavigationCss).toContain(
      "min(100%, 280px),\n      280px",
    );
    expect(settingsNavigationCss).toContain("justify-content: space-between;");
    expect(settingsNavigationCss).toContain(
      ".settings-overview__title > .section-title {",
    );
    expect(settingsNavigationCss).toContain(
      "inline-size: min(100%, 280px);",
    );
    expect(settingsNavigationCss).toContain(
      "grid-template-columns: repeat(auto-fit, minmax(min(100%, 80px), 1fr));",
    );
    expect(settingsNavigationCss).toContain(
      ".settings-overview__level-control {",
    );
    expect(formControlsCss).toContain(
      ".adaptive-control-grid.adaptive-control-grid {",
    );
    expect(formControlsCss).toContain(
      "grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(100%, var(--adaptive-control-min)), 1fr)\n  );",
    );
    expect(settingsNavigationCss).not.toContain(
      "grid-template-columns: repeat(auto-fit, minmax(min(100%, 168px), 1fr));",
    );
    expect(settingsNavigationCss).toContain(
      ".settings-grid--balanced-settings:not(.adaptive-control-grid):has(",
    );
    expect(settingsNavigationCss).not.toContain(
      ".settings-overview__paired-controls",
    );
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
    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain('class="switch-row"');
    expect(html).toContain('data-visibility-provider-id="cursor-personal-page"');
    expect(html).toContain('data-visibility-toggle="cursor-personal-page"');
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
    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain('class="permission-prompt');
    expect(html).toContain('data-provider-id="cursor-personal-page"');
    expect(html).toContain('data-permission-status=');
    expect(html).toContain('data-permission-action=');
  });

  it("highlights grant-access actions while preserving reduced-motion opt out", () => {
    expect(accessFeedbackCss).toContain("@keyframes app-access-cta-pulse");
    expect(accessFeedbackCss).toContain(
      '[data-quick-setup-primary-action="grant_access"]:not(:disabled)',
    );
    expect(accessFeedbackCss).toContain(
      '[data-permission-action="request"]:not(:disabled)',
    );
    expect(accessFeedbackCss).toContain(
      ':root[data-motion-resolved="reduced"]',
    );
    expect(accessFeedbackCss).toContain("animation: none;");
  });

});
