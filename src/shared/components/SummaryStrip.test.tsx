import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SummaryStrip } from "./SummaryStrip";

const layoutPrimitivesCss = readFileSync(
  new URL("../../sidepanel/theme/layout-primitives.css", import.meta.url),
  "utf8",
);

describe("SummaryStrip", () => {
  it("marks compact localized labels for visual overflow checks", () => {
    const html = renderToStaticMarkup(
      <SummaryStrip
        ariaLabel="Settings summary"
        items={[
          {
            label: "Gespeicherte Zugangsdaten",
            value: "2",
            tone: "neutral",
          },
        ]}
        variant="compact"
      />,
    );

    expect(html).toContain('data-i18n-layout-contract="compact-summary"');
    expect(html).toContain("data-i18n-summary-label");
    expect(html).toContain("data-i18n-summary-value");
  });

  it("uses an equal-height two-line compact label layout without ellipsis", () => {
    expect(layoutPrimitivesCss).toContain("grid-auto-rows: 1fr;");
    expect(layoutPrimitivesCss).toContain(
      "grid-template-columns: repeat(auto-fit, minmax(min(100%, 88px), 1fr));",
    );
    expect(layoutPrimitivesCss).toContain(
      "min-block-size: calc(2 * var(--md-sys-typescale-label-medium-line-height));",
    );
    expect(layoutPrimitivesCss).toContain("text-wrap: balance;");
    expect(layoutPrimitivesCss).not.toContain("-webkit-line-clamp");
    expect(layoutPrimitivesCss).not.toContain("text-overflow: ellipsis;");
    expect(layoutPrimitivesCss).not.toContain(
      ".summary-strip--compact .summary-pill__label {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;",
    );
  });
});
