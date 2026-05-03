import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import {
  SettingsBackToTopButton,
  SettingsSectionNavigation,
} from "./SettingsNavigation";

describe("SettingsNavigation", () => {
  it("renders section chips with one active section", () => {
    const html = renderToStaticMarkup(
      <SettingsSectionNavigation
        ariaLabel="Settings sections"
        activeSectionId={SETTINGS_SECTION_IDS.visibility}
        items={[
          { id: SETTINGS_SECTION_IDS.preferences, label: "Preferences" },
          { id: SETTINGS_SECTION_IDS.visibility, label: "Visibility" },
        ]}
        onSelectSection={() => {}}
      />,
    );

    expect(html).toContain('class="settings-section-nav"');
    expect(html).toContain(">Preferences<");
    expect(html).toContain(">Visibility<");
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
});
