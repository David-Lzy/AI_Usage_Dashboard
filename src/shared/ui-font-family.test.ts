import { describe, expect, it } from "vitest";

import {
  DEFAULT_UI_FONT_FAMILY,
  UI_FONT_FAMILY_OPTIONS,
  getUiFontFamilyStack,
  normalizeUiFontFamily,
} from "./ui-font-family";

describe("UI font family preferences", () => {
  it("ships a small safe local font registry", () => {
    expect(UI_FONT_FAMILY_OPTIONS.map((option) => option.value)).toEqual([
      "default",
      "system",
      "serif",
      "mono",
    ]);
  });

  it("normalizes unknown stored values to the default", () => {
    expect(normalizeUiFontFamily("serif")).toBe("serif");
    expect(normalizeUiFontFamily("not-a-font")).toBe(DEFAULT_UI_FONT_FAMILY);
    expect(normalizeUiFontFamily(null)).toBe(DEFAULT_UI_FONT_FAMILY);
  });

  it("resolves font stacks without loading remote font assets", () => {
    expect(getUiFontFamilyStack("default")).toContain("Noto Sans");
    expect(getUiFontFamilyStack("serif")).toContain("Noto Serif");
    expect(getUiFontFamilyStack("mono")).toContain("monospace");
    expect(getUiFontFamilyStack("unknown")).toBe(
      getUiFontFamilyStack(DEFAULT_UI_FONT_FAMILY),
    );
  });
});
