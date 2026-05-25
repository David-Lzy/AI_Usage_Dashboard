import { describe, expect, it } from "vitest";

import type { ProgressColorAppearance } from "../providers/types";
import {
  DEFAULT_PROGRESS_COLOR_BANDS,
  DEFAULT_PROGRESS_GRADIENT_STOPS,
  DEFAULT_PROGRESS_THICKNESS_PX,
  areProgressColorBandsValid,
  areProgressGradientStopsValid,
  createDefaultProgressColorAppearance,
  createDefaultProgressColorBands,
  createDefaultProgressGradientStops,
  moveProgressColorBand,
  normalizeProgressColorAppearance,
  normalizeProgressColorBands,
  normalizeProgressGradientStops,
  normalizeProgressThicknessPx,
  progressThicknessPxToSliderValue,
  progressThicknessSliderValueToPx,
  removeProgressColorBand,
  resolveProgressColorForAppearance,
  resolveProgressColorForRemainingPercent,
  resolveProgressGradientColorForRemainingPercent,
  splitProgressColorBand,
} from "./progress-appearance";

describe("progress appearance preferences", () => {
  it("normalizes progress thickness to a bounded two-decimal value", () => {
    expect(normalizeProgressThicknessPx(1)).toBe(1);
    expect(normalizeProgressThicknessPx(4)).toBe(4);
    expect(normalizeProgressThicknessPx(1.25)).toBe(1.25);
    expect(normalizeProgressThicknessPx("2.5")).toBe(2.5);
    expect(normalizeProgressThicknessPx(8.555)).toBe(8.56);
    expect(normalizeProgressThicknessPx("20")).toBe(20);
    expect(normalizeProgressThicknessPx(0)).toBe(DEFAULT_PROGRESS_THICKNESS_PX);
    expect(normalizeProgressThicknessPx(21)).toBe(DEFAULT_PROGRESS_THICKNESS_PX);
    expect(normalizeProgressThicknessPx("wide")).toBe(
      DEFAULT_PROGRESS_THICKNESS_PX,
    );
    expect(normalizeProgressThicknessPx(undefined)).toBe(
      DEFAULT_PROGRESS_THICKNESS_PX,
    );
  });

  it("maps the progress thickness slider on a continuous logarithmic scale", () => {
    expect(progressThicknessPxToSliderValue(1)).toBe(0);
    expect(progressThicknessPxToSliderValue(2)).toBe(231);
    expect(progressThicknessPxToSliderValue(10)).toBe(769);
    expect(progressThicknessPxToSliderValue(20)).toBe(1000);
    expect(progressThicknessSliderValueToPx(0)).toBe(1);
    expect(progressThicknessSliderValueToPx(231)).toBe(2);
    expect(progressThicknessSliderValueToPx(500)).toBe(4.47);
    expect(progressThicknessSliderValueToPx(769)).toBe(10.01);
    expect(progressThicknessSliderValueToPx(1000)).toBe(20);
    expect(progressThicknessSliderValueToPx("invalid")).toBe(
      DEFAULT_PROGRESS_THICKNESS_PX,
    );
  });

  it("clones default color bands for new settings", () => {
    const firstDefault = createDefaultProgressColorBands();
    const secondDefault = createDefaultProgressColorBands();

    firstDefault[0].colorHex = "#000000";

    expect(secondDefault).toEqual(DEFAULT_PROGRESS_COLOR_BANDS);
  });

  it("clones default gradient stops and creates a traditional color appearance", () => {
    const firstDefault = createDefaultProgressGradientStops();
    const secondDefault = createDefaultProgressGradientStops();

    firstDefault[0].colorHex = "#000000";

    expect(secondDefault).toEqual(DEFAULT_PROGRESS_GRADIENT_STOPS);
    expect(createDefaultProgressColorAppearance()).toEqual({
      mode: "traditional",
      bands: DEFAULT_PROGRESS_COLOR_BANDS,
    });
  });

  it("normalizes valid color bands and uppercases colors", () => {
    expect(
      normalizeProgressColorBands([
        {
          id: "healthy",
          minimumPercent: "50",
          maximumPercent: 100,
          colorHex: "#146c2e",
        },
        {
          id: "low",
          minimumPercent: 0,
          maximumPercent: 20,
          colorHex: "#b3261e",
        },
        {
          id: "middle",
          minimumPercent: 21,
          maximumPercent: 49,
          colorHex: "#8a4b00",
        },
      ]),
    ).toEqual([
      {
        id: "healthy",
        minimumPercent: 50,
        maximumPercent: 100,
        colorHex: "#146C2E",
      },
      {
        id: "low",
        minimumPercent: 0,
        maximumPercent: 20,
        colorHex: "#B3261E",
      },
      {
        id: "middle",
        minimumPercent: 21,
        maximumPercent: 49,
        colorHex: "#8A4B00",
      },
    ]);
  });

  it("falls back to defaults for invalid color bands", () => {
    const invalidValues = [
      null,
      [],
      [
        {
          id: "unknown-field",
          minimumPercent: 0,
          maximumPercent: 100,
          colorHex: "#146C2E",
          unknown: true,
        },
      ],
      [
        {
          id: "bad-color",
          minimumPercent: 0,
          maximumPercent: 100,
          colorHex: "red",
        },
      ],
      [
        {
          id: "inverted",
          minimumPercent: 80,
          maximumPercent: 20,
          colorHex: "#B3261E",
        },
      ],
      [
        {
          id: "low",
          minimumPercent: 0,
          maximumPercent: 50,
          colorHex: "#B3261E",
        },
        {
          id: "overlap",
          minimumPercent: 50,
          maximumPercent: 100,
          colorHex: "#146C2E",
        },
      ],
      [
        {
          id: "low",
          minimumPercent: 0,
          maximumPercent: 20,
          colorHex: "#B3261E",
        },
        {
          id: "gap",
          minimumPercent: 22,
          maximumPercent: 100,
          colorHex: "#146C2E",
        },
      ],
      [
        {
          id: "duplicate",
          minimumPercent: 0,
          maximumPercent: 20,
          colorHex: "#B3261E",
        },
        {
          id: "duplicate",
          minimumPercent: 21,
          maximumPercent: 100,
          colorHex: "#146C2E",
        },
      ],
    ];

    for (const value of invalidValues) {
      expect(normalizeProgressColorBands(value)).toEqual(
        DEFAULT_PROGRESS_COLOR_BANDS,
      );
    }
  });

  it("normalizes valid gradient stops and uppercases colors", () => {
    expect(
      normalizeProgressGradientStops([
        {
          id: "high",
          positionPercent: 100,
          colorHex: "#ffffff",
        },
        {
          id: "low",
          positionPercent: "0",
          colorHex: "#000000",
        },
        {
          id: "middle",
          positionPercent: "50.555",
          colorHex: "#808080",
        },
      ]),
    ).toEqual([
      {
        id: "low",
        positionPercent: 0,
        colorHex: "#000000",
      },
      {
        id: "middle",
        positionPercent: 50.56,
        colorHex: "#808080",
      },
      {
        id: "high",
        positionPercent: 100,
        colorHex: "#FFFFFF",
      },
    ]);
  });

  it("rejects invalid gradient stops", () => {
    expect(
      areProgressGradientStopsValid([
        {
          id: "low",
          positionPercent: 0,
          colorHex: "#000000",
        },
        {
          id: "middle",
          positionPercent: 50,
          colorHex: "#808080",
        },
      ]),
    ).toBe(false);
    expect(
      normalizeProgressGradientStops([
        {
          id: "duplicate",
          positionPercent: 0,
          colorHex: "#000000",
        },
        {
          id: "duplicate",
          positionPercent: 100,
          colorHex: "#FFFFFF",
        },
      ]),
    ).toEqual(DEFAULT_PROGRESS_GRADIENT_STOPS);
  });

  it("normalizes progress color appearance with legacy band fallback", () => {
    const customBands = [
      {
        id: "danger",
        minimumPercent: 0,
        maximumPercent: 100,
        colorHex: "#b3261e",
      },
    ];

    expect(normalizeProgressColorAppearance(undefined, customBands)).toEqual({
      mode: "traditional",
      bands: [
        {
          id: "danger",
          minimumPercent: 0,
          maximumPercent: 100,
          colorHex: "#B3261E",
        },
      ],
    });
    expect(
      normalizeProgressColorAppearance(
        {
          mode: "gradient",
          stops: [
            {
              id: "end",
              positionPercent: 100,
              colorHex: "#ffffff",
            },
            {
              id: "start",
              positionPercent: 0,
              colorHex: "#000000",
            },
          ],
        },
        customBands,
      ),
    ).toEqual({
      mode: "gradient",
      stops: [
        {
          id: "start",
          positionPercent: 0,
          colorHex: "#000000",
        },
        {
          id: "end",
          positionPercent: 100,
          colorHex: "#FFFFFF",
        },
      ],
    });
    expect(
      normalizeProgressColorAppearance(
        {
          mode: "gradient",
          stops: [
            {
              id: "only",
              positionPercent: 0,
              colorHex: "#000000",
            },
          ],
        },
        customBands,
      ),
    ).toEqual({
      mode: "traditional",
      bands: [
        {
          id: "danger",
          minimumPercent: 0,
          maximumPercent: 100,
          colorHex: "#B3261E",
        },
      ],
    });
  });

  it("splits, removes, and reorders valid color bands without creating gaps", () => {
    const splitBands = splitProgressColorBand(DEFAULT_PROGRESS_COLOR_BANDS);

    expect(areProgressColorBandsValid(splitBands)).toBe(true);
    expect(splitBands).toHaveLength(4);
    expect(splitBands[3]).toMatchObject({
      id: "custom-4",
      minimumPercent: 76,
      maximumPercent: 100,
    });

    const movedBands = moveProgressColorBand(splitBands, "custom-4", "up");

    expect(movedBands.map((band) => band.id)).toEqual([
      "low",
      "medium",
      "custom-4",
      "high",
    ]);
    expect(areProgressColorBandsValid(movedBands)).toBe(true);

    const removedBands = removeProgressColorBand(movedBands, "medium");

    expect(areProgressColorBandsValid(removedBands)).toBe(true);
    expect(removedBands).toEqual([
      {
        id: "low",
        minimumPercent: 0,
        maximumPercent: 49,
        colorHex: "#B3261E",
      },
      {
        id: "high",
        minimumPercent: 50,
        maximumPercent: 75,
        colorHex: "#146C2E",
      },
      {
        id: "custom-4",
        minimumPercent: 76,
        maximumPercent: 100,
        colorHex: "#146C2E",
      },
    ]);
  });

  it("resolves remaining percent to the configured color band", () => {
    expect(resolveProgressColorForRemainingPercent(20, DEFAULT_PROGRESS_COLOR_BANDS)).toBe(
      "#B3261E",
    );
    expect(resolveProgressColorForRemainingPercent(21, DEFAULT_PROGRESS_COLOR_BANDS)).toBe(
      "#8A4B00",
    );
    expect(resolveProgressColorForRemainingPercent(50, DEFAULT_PROGRESS_COLOR_BANDS)).toBe(
      "#146C2E",
    );
    expect(resolveProgressColorForRemainingPercent(null, DEFAULT_PROGRESS_COLOR_BANDS)).toBeNull();
  });

  it("resolves gradient colors through the shared appearance resolver", () => {
    const gradientAppearance: ProgressColorAppearance = {
      mode: "gradient",
      stops: [
        {
          id: "empty",
          positionPercent: 0,
          colorHex: "#000000",
        },
        {
          id: "full",
          positionPercent: 100,
          colorHex: "#FFFFFF",
        },
      ],
    };

    expect(
      resolveProgressGradientColorForRemainingPercent(
        50,
        gradientAppearance.stops,
      ),
    ).toBe("#808080");
    expect(resolveProgressColorForAppearance(50, gradientAppearance)).toBe(
      "#808080",
    );
    expect(resolveProgressColorForAppearance(20, undefined)).toBe("#B3261E");
  });
});
