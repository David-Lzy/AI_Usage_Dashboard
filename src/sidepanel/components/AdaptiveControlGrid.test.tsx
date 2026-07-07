import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AdaptiveControlGrid,
  getAdaptiveControlMeasurementLabels,
  rebalanceAdaptiveControlColumnCount,
  resolveAdaptiveControlBaseColumnCount,
  resolveAdaptiveControlColumnCount,
  resolveAdaptiveControlLayoutSignature,
  resolveAdaptiveControlMinWidth,
} from "./AdaptiveControlGrid";

const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);
const adaptiveControlGridSource = readFileSync(
  new URL("./AdaptiveControlGrid.tsx", import.meta.url),
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

  it("resolves base column counts from available width and gap", () => {
    expect(
      resolveAdaptiveControlBaseColumnCount({
        availableWidthPx: 760,
        columnGapPx: 10,
        itemCount: 8,
        minWidthPx: 100,
      }),
    ).toBe(7);
    expect(
      resolveAdaptiveControlBaseColumnCount({
        availableWidthPx: 320,
        columnGapPx: 12,
        itemCount: 8,
        minWidthPx: 148,
      }),
    ).toBe(2);
    expect(
      resolveAdaptiveControlBaseColumnCount({
        availableWidthPx: 0,
        itemCount: 8,
        minWidthPx: 100,
      }),
    ).toBeNull();
  });

  it("rebalances short final rows by transferring columns from previous rows", () => {
    expect(rebalanceAdaptiveControlColumnCount(7, 8)).toBe(4);
    expect(rebalanceAdaptiveControlColumnCount(6, 8)).toBe(4);
    expect(rebalanceAdaptiveControlColumnCount(7, 15)).toBe(5);
    expect(rebalanceAdaptiveControlColumnCount(7, 13)).toBe(7);
    expect(rebalanceAdaptiveControlColumnCount(4, 8)).toBe(4);
  });

  it("resolves balanced column counts without going below measured control width", () => {
    expect(
      resolveAdaptiveControlColumnCount({
        availableWidthPx: 760,
        columnGapPx: 10,
        itemCount: 8,
        minWidthPx: 100,
      }),
    ).toBe(4);
    expect(
      resolveAdaptiveControlColumnCount({
        availableWidthPx: 430,
        columnGapPx: 10,
        itemCount: 8,
        minWidthPx: 100,
      }),
    ).toBe(4);
    expect(
      resolveAdaptiveControlColumnCount({
        availableWidthPx: 210,
        columnGapPx: 10,
        itemCount: 8,
        minWidthPx: 100,
      }),
    ).toBe(2);
  });

  it("builds stable rounded layout signatures for ResizeObserver guards", () => {
    expect(
      resolveAdaptiveControlLayoutSignature({
        availableWidthPx: 430.4,
        columnGapPx: 10.2,
        itemCount: 8,
        minWidthPx: 100.1,
      }),
    ).toBe("430:10:8:101");
    expect(
      resolveAdaptiveControlLayoutSignature({
        availableWidthPx: 430.49,
        columnGapPx: 10.49,
        itemCount: 8,
        minWidthPx: 100.1,
      }),
    ).toBe("430:10:8:101");
    expect(
      resolveAdaptiveControlLayoutSignature({
        availableWidthPx: 0,
        itemCount: 8,
        minWidthPx: 100,
      }),
    ).toBeNull();
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
      "grid-template-rows: minmax(28px, auto) minmax(",
    );
    expect(formControlsCss).toContain("min-block-size: 28px;");
    expect(formControlsCss).toContain(
      "font-size: var(--md-sys-typescale-body-large-size);",
    );
    expect(formControlsCss).toContain(
      "grid-template-columns: max-content var(--app-control-icon-slot);",
    );
  });

  it("keeps adaptive measurement out of self-observing ResizeObserver loops", () => {
    expect(adaptiveControlGridSource).not.toContain(
      "resizeObserver?.observe(measurerRef.current)",
    );
    expect(adaptiveControlGridSource).not.toContain("new ResizeObserver");
    expect(adaptiveControlGridSource).toContain(
      "lastColumnMeasurementKeyRef",
    );
    expect(adaptiveControlGridSource).toContain(
      "resolveAdaptiveControlLayoutSignature",
    );
    expect(adaptiveControlGridSource).toContain(
      'document.addEventListener("visibilitychange", handleVisibilityChange);',
    );
  });
});
