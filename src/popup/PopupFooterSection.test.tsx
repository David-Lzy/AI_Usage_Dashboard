import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import { PopupFooterSection } from "./PopupFooterSection";

describe("PopupFooterSection", () => {
  it("keeps popup identity and build metadata at the bottom", () => {
    const html = renderToStaticMarkup(
      <PopupFooterSection
        headerDetail="Everything is ready"
        hasFeaturedProviderCards={false}
        runtimeI18n={createRuntimeI18n("en")}
      />,
    );

    expect(html).toContain('class="popup-footer"');
    expect(html).toContain("Toolbar Popup");
    expect(html).toContain("Quick glance");
    expect(html).toContain("Everything is ready");
    expect(html).toContain("AI Usage Dashboard");
    expect(html).toContain("AGPL-3.0");
    expect(html).toContain("GitHub");
  });

  it("omits header detail when quota cards already lead the popup", () => {
    const html = renderToStaticMarkup(
      <PopupFooterSection
        headerDetail="Everything is ready"
        hasFeaturedProviderCards={true}
        runtimeI18n={createRuntimeI18n("en")}
      />,
    );

    expect(html).not.toContain("Everything is ready");
  });
});
