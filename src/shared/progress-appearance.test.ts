import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROGRESS_COLOR_BANDS,
  DEFAULT_PROGRESS_THICKNESS_PX,
  areProgressColorBandsValid,
  createDefaultProgressColorBands,
  moveProgressColorBand,
  normalizeProgressColorBands,
  normalizeProgressThicknessPx,
  removeProgressColorBand,
  resolveProgressColorForRemainingPercent,
  splitProgressColorBand,
} from "./progress-appearance";

describe("progress appearance preferences", () => {
  it("normalizes progress thickness to a bounded integer default", () => {
    expect(normalizeProgressThicknessPx(4)).toBe(4);
    expect(normalizeProgressThicknessPx("18")).toBe(18);
    expect(normalizeProgressThicknessPx(3)).toBe(DEFAULT_PROGRESS_THICKNESS_PX);
    expect(normalizeProgressThicknessPx(19)).toBe(DEFAULT_PROGRESS_THICKNESS_PX);
    expect(normalizeProgressThicknessPx(8.5)).toBe(DEFAULT_PROGRESS_THICKNESS_PX);
    expect(normalizeProgressThicknessPx("wide")).toBe(
      DEFAULT_PROGRESS_THICKNESS_PX,
    );
    expect(normalizeProgressThicknessPx(undefined)).toBe(
      DEFAULT_PROGRESS_THICKNESS_PX,
    );
  });

  it("clones default color bands for new settings", () => {
    const firstDefault = createDefaultProgressColorBands();
    const secondDefault = createDefaultProgressColorBands();

    firstDefault[0].colorHex = "#000000";

    expect(secondDefault).toEqual(DEFAULT_PROGRESS_COLOR_BANDS);
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
});
