import { describe, expect, it } from "vitest";

import { RECOMMENDED_COLOR_CHOICES } from "./color-choices";

describe("recommended color choices", () => {
  it("keeps the palette at sixteen choices for balanced dropdown grids", () => {
    expect(RECOMMENDED_COLOR_CHOICES).toHaveLength(16);
  });

  it("keeps color ids in display order", () => {
    expect(RECOMMENDED_COLOR_CHOICES.map((choice) => choice.id)).toEqual([
      "red",
      "orange",
      "brown",
      "amber",
      "yellow",
      "lime",
      "green",
      "mint",
      "teal",
      "cyan",
      "blue",
      "indigo",
      "purple",
      "violet",
      "pink",
      "slate",
    ]);
  });

  it("uses unique ids and unique normalized hex values", () => {
    const ids = RECOMMENDED_COLOR_CHOICES.map((choice) => choice.id);
    const hexValues = RECOMMENDED_COLOR_CHOICES.map((choice) => choice.hex);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(hexValues).size).toBe(hexValues.length);
    expect(hexValues.every((hex) => /^#[0-9A-F]{6}$/u.test(hex))).toBe(true);
  });
});
