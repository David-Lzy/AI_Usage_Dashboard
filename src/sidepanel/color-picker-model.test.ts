import { describe, expect, it } from "vitest";

import { clampHsvColor, hexToHsv, hsvToHex } from "./color-picker-model";

describe("color picker model", () => {
  it("round trips common colors between hex and HSV", () => {
    expect(hsvToHex(hexToHsv("#B3261E"))).toBe("#B3261E");
    expect(hsvToHex(hexToHsv("#146C2E"))).toBe("#146C2E");
    expect(hsvToHex(hexToHsv("#4f46e5"))).toBe("#4F46E5");
  });

  it("clamps HSV values to picker bounds", () => {
    expect(clampHsvColor({ hue: -30, saturation: 150, value: -20 })).toEqual({
      hue: 330,
      saturation: 100,
      value: 0,
    });
  });
});
