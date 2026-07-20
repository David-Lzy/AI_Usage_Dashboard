import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import {
  SettingsBackToTopButton,
  SettingsSectionNavigation,
} from "./SettingsNavigation";

const settingsNavigationCss = readFileSync(
  new URL("../theme/settings-navigation.css", import.meta.url),
  "utf8",
);
const settingsAppearanceCss = readFileSync(
  new URL("../theme/settings-appearance.css", import.meta.url),
  "utf8",
);

describe("SettingsNavigation", () => {
  it("renders section chips with one active section", () => {
    const html = renderToStaticMarkup(
      <SettingsSectionNavigation
        ariaLabel="Settings sections"
        activeSectionId={SETTINGS_SECTION_IDS.quickSetup}
        items={[
          { id: SETTINGS_SECTION_IDS.overview, label: "Overview" },
          { id: SETTINGS_SECTION_IDS.quickSetup, label: "Quick Setup" },
        ]}
        onSelectSection={() => {}}
      />,
    );

    expect(html).toContain('class="settings-section-nav"');
    expect(html).toContain(
      'data-i18n-layout-contract="settings-navigation"',
    );
    expect(html).toContain(">Overview<");
    expect(html).toContain(">Quick Setup<");
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-active="false"');
  });

  it("renders the back-to-top floating action", () => {
    const html = renderToStaticMarkup(
      <SettingsBackToTopButton
        label="Back to top"
        shortLabel="Top"
        onClick={() => {}}
      />,
    );

    expect(html).toContain('class="settings-back-to-top-fab"');
    expect(html).toContain('aria-label="Back to top"');
    expect(html).toContain('title="Back to top"');
    expect(html).toContain('class="settings-back-to-top-fab__label"');
    expect(html).toContain(">Top<");
  });

  it("keeps settings top-bar navigation and actions stable across widths", () => {
    expect(settingsNavigationCss).toContain(
      ".settings-shell .top-app-bar__actions {",
    );
    expect(settingsNavigationCss).toContain("grid-auto-flow: column;");
    expect(settingsNavigationCss).toContain(
      ".settings-shell .top-app-bar__actions .icon-button {",
    );
    expect(settingsNavigationCss).toContain("flex: none;");
    expect(settingsNavigationCss).toContain(
      "container: settings-shell / inline-size;",
    );
    expect(settingsNavigationCss).toContain(
      "@container settings-shell (max-width: 1840px)",
    );
    expect(settingsNavigationCss).toContain(
      "@container settings-shell (max-width: 940px)",
    );
    expect(settingsNavigationCss).toContain(
      "@container settings-shell (max-width: 820px)",
    );
    expect(settingsNavigationCss).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr));",
    );
    expect(settingsNavigationCss).toContain(
      "@container settings-shell (max-width: 360px)",
    );
    expect(settingsNavigationCss).toContain(
      "grid-template-columns: minmax(0, 1fr);",
    );
    expect(settingsAppearanceCss).toContain("container-type: inline-size;");
    expect(settingsAppearanceCss).toContain("@container (max-width: 430px) {");
    expect(settingsAppearanceCss).toContain("flex-wrap: wrap;");
  });
});
