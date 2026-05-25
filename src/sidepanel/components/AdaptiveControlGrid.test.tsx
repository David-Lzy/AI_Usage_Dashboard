import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AdaptiveControlGrid,
  getAdaptiveControlMeasurementLabels,
  resolveAdaptiveControlMinWidth,
} from "./AdaptiveControlGrid";

const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);

describe("AdaptiveControlGrid", () => {
  it("renders an adaptive grid with explicit measurement labels", () => {
    const html = renderToStaticMarkup(
      <AdaptiveControlGrid measurementLabels={["Short", "Longer option"]}>
        <div className="form-field">Display level</div>
        <div className="form-field">Application language</div>
      </AdaptiveControlGrid>,
    );

    expect(html).toContain('data-adaptive-control-grid=""');
    expect(html).toContain('style="--adaptive-control-min:168px"');
    expect(html).toContain("adaptive-control-grid__measurer");
    expect(html).toContain("Short");
    expect(html).toContain("Longer option");
    expect(html).toContain("Display level");
    expect(html).toContain("Application language");
  });

  it("normalizes and deduplicates measurement labels", () => {
    expect(
      getAdaptiveControlMeasurementLabels({
        measurementLabels: ["  Developer  ", "Developer", "", "Light"],
      }),
    ).toEqual(["Developer", "Light"]);
  });

  it("uses the cap label as the only measurement source when provided", () => {
    expect(
      getAdaptiveControlMeasurementLabels({
        measurementLabels: ["Very long provider name", "Another long value"],
        measurementCapLabel: "Attention count",
      }),
    ).toEqual(["Attention count"]);
  });

  it("resolves measured widths against the fallback width", () => {
    expect(resolveAdaptiveControlMinWidth([], 168)).toBe(168);
    expect(resolveAdaptiveControlMinWidth([82.1, 191.2], 168)).toBe(192);
    expect(resolveAdaptiveControlMinWidth([0, Number.NaN], 144.2)).toBe(145);
  });

  it("defines the adaptive grid and hidden DOM measurer in shared CSS", () => {
    expect(formControlsCss).toContain(".adaptive-control-grid {");
    expect(formControlsCss).toContain("repeat(");
    expect(formControlsCss).toContain("auto-fit,");
    expect(formControlsCss).toContain(
      "minmax(min(100%, var(--adaptive-control-min)), 1fr)",
    );
    expect(formControlsCss).toContain(".adaptive-control-grid__measurer {");
    expect(formControlsCss).toContain(
      "font-size: var(--md-sys-typescale-body-large-size);",
    );
    expect(formControlsCss).toContain(
      "grid-template-columns: max-content var(--app-control-icon-slot);",
    );
  });
});
