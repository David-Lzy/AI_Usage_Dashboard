import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BUILD_INFO } from "../shared/build-info";
import { createRuntimeI18n } from "../shared/i18n";
import { PopupFooterSection } from "./PopupFooterSection";

const popupThemeCss = readFileSync(
  new URL("./popup-theme.css", import.meta.url),
  "utf8",
);

function renderPopupFooter({
  hasFeaturedProviderCards = false,
  isCollapsed = false,
}: {
  hasFeaturedProviderCards?: boolean;
  isCollapsed?: boolean;
} = {}) {
  return renderToStaticMarkup(
    <PopupFooterSection
      headerDetail="Everything is ready"
      hasFeaturedProviderCards={hasFeaturedProviderCards}
      isCollapsed={isCollapsed}
      runtimeI18n={createRuntimeI18n("en")}
      onToggleCollapsed={() => undefined}
    />,
  );
}

describe("PopupFooterSection", () => {
  it("keeps popup identity and public package metadata at the bottom", () => {
    const html = renderPopupFooter();

    expect(html).toContain('class="popup-footer"');
    expect(html).toContain("Toolbar Popup");
    expect(html).toContain("Quick glance");
    expect(html).toContain("Everything is ready");
    expect(html).toContain("AI Usage Dashboard");
    expect(html).toContain("AGPL-3.0");
    expect(html).toContain("GitHub");
    expect(html).not.toContain(BUILD_INFO.gitCommit);
    expect(html).not.toContain(BUILD_INFO.buildTimestamp.slice(0, 10));
  });

  it("omits header detail when quota cards already lead the popup", () => {
    const html = renderPopupFooter({ hasFeaturedProviderCards: true });

    expect(html).not.toContain("Everything is ready");
  });

  it("renders an inverted footer collapse toggle", () => {
    const expandedHtml = renderPopupFooter();
    const collapsedHtml = renderPopupFooter({ isCollapsed: true });

    expect(expandedHtml).toContain('aria-controls="popup-footer-content"');
    expect(expandedHtml).toContain('aria-expanded="true"');
    expect(expandedHtml).toContain('aria-label="Hide footer info"');
    expect(expandedHtml).not.toContain("popup-footer--collapsed");

    expect(collapsedHtml).toContain("popup-footer--collapsed");
    expect(collapsedHtml).toContain('aria-expanded="false"');
    expect(collapsedHtml).toContain('aria-label="Show footer info"');
    expect(collapsedHtml).toContain("hidden");
  });

  it("keeps the footer collapse surface in CSS", () => {
    expect(popupThemeCss).toContain(".popup-footer--collapsed");
    expect(popupThemeCss).toContain(".popup-footer__collapse-toggle");
    expect(popupThemeCss).toContain("transform: translate(-50%, -50%);");
    expect(popupThemeCss).toContain(".popup-footer__content[hidden]");
  });
});
