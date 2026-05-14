import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

describe("MaterialInfoTooltip", () => {
  it("renders a focusable trigger and hidden tooltip content", () => {
    const html = renderToStaticMarkup(
      <MaterialInfoTooltip>Helpful settings detail.</MaterialInfoTooltip>,
    );

    expect(html).toContain('class="material-info-tooltip"');
    expect(html).toContain('class="material-info-tooltip__trigger"');
    expect(html).toContain('aria-label="Helpful settings detail."');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Helpful settings detail.");
  });
});
