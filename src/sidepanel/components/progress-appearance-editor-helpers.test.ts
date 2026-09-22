import { describe, expect, it } from "vitest";

import {
  clampGradientStopPosition,
  findAvailableGradientStopPosition,
  parseCompleteThicknessDraft,
  parseDraftBands,
  resolveGradientStopDragPosition,
  shouldSkipGradientStopCreation,
  toDraftBands,
} from "./progress-appearance-editor-helpers";

describe("progress appearance editor helpers", () => {
  it("retains partial thickness drafts while only parsing complete in-range values", () => {
    expect(parseCompleteThicknessDraft("")).toBeNull();
    expect(parseCompleteThicknessDraft("10.")).toBeNull();
    expect(parseCompleteThicknessDraft("0.9")).toBeNull();
    expect(parseCompleteThicknessDraft("10.567")).toBeNull();
    expect(parseCompleteThicknessDraft("10.5")).toBe(10.5);
  });

  it("keeps invalid color-band drafts uncommittable and preserves valid draft data", () => {
    expect(
      parseDraftBands([
        { id: "low", minimumPercent: "", maximumPercent: "30", colorHex: "#B3261E" },
      ]),
    ).toBeNull();
    expect(
      parseDraftBands([
        { id: "low", minimumPercent: "2.5", maximumPercent: "30", colorHex: "#B3261E" },
      ]),
    ).toBeNull();
    expect(
      parseDraftBands([
        { id: "low", minimumPercent: "0", maximumPercent: "30", colorHex: " #B3261E " },
      ]),
    ).toEqual([{ id: "low", minimumPercent: 0, maximumPercent: 30, colorHex: "#B3261E" }]);
    expect(
      toDraftBands([{ id: "low", minimumPercent: 0, maximumPercent: 30, colorHex: "#B3261E" }]),
    ).toEqual([{ id: "low", minimumPercent: "0", maximumPercent: "30", colorHex: "#B3261E" }]);
  });

  it("clamps drag geometry and avoids occupied stop positions", () => {
    const stops = [
      { id: "empty", positionPercent: 0, colorHex: "#B3261E" },
      { id: "middle", positionPercent: 50, colorHex: "#8A4B00" },
      { id: "full", positionPercent: 100, colorHex: "#146C2E" },
    ];

    expect(clampGradientStopPosition(-1)).toBe(0.01);
    expect(clampGradientStopPosition(120)).toBe(99.99);
    expect(findAvailableGradientStopPosition(50, stops)).toBe(50.01);
    expect(
      resolveGradientStopDragPosition({
        currentClientX: 240,
        initialClientX: 200,
        initialPositionPercent: 50,
        trackWidthPx: 400,
      }),
    ).toBe(60);
  });

  it("suppresses new stops inside the pixel or percentage proximity threshold", () => {
    const stops = [
      { id: "empty", positionPercent: 0, colorHex: "#B3261E" },
      { id: "middle", positionPercent: 50, colorHex: "#8A4B00" },
      { id: "full", positionPercent: 100, colorHex: "#146C2E" },
    ];

    expect(shouldSkipGradientStopCreation({ positionPercent: 54.9, stops, trackWidthPx: 400 })).toBe(true);
    expect(shouldSkipGradientStopCreation({ positionPercent: 56, stops, trackWidthPx: 400 })).toBe(false);
    expect(shouldSkipGradientStopCreation({ positionPercent: 12, stops, trackWidthPx: 120 })).toBe(true);
  });
});
