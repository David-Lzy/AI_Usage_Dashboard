import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SETTINGS_SECTION_IDS } from "./settings-section-ids";
import { useSettingsSectionNavigation } from "./use-settings-section-navigation";

function SettingsSectionNavigationProbe() {
  const {
    activeSettingsSection,
    scrollToSection,
    scrollToSettingsTop,
  } = useSettingsSectionNavigation();

  return (
    <button
      data-active-section={activeSettingsSection}
      data-has-section-scroll={typeof scrollToSection === "function"}
      data-has-top-scroll={typeof scrollToSettingsTop === "function"}
      type="button"
    >
      {activeSettingsSection}
    </button>
  );
}

describe("useSettingsSectionNavigation", () => {
  it("exposes the default Settings section and scroll callbacks", () => {
    const html = renderToStaticMarkup(<SettingsSectionNavigationProbe />);

    expect(html).toContain(
      `data-active-section="${SETTINGS_SECTION_IDS.overview}"`,
    );
    expect(html).toContain('data-has-section-scroll="true"');
    expect(html).toContain('data-has-top-scroll="true"');
  });
});
