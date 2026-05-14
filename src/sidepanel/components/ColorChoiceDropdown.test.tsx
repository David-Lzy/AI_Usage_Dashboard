import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ColorChoiceDropdown,
  getColorChoiceSelectionLabel,
  normalizeColorChoiceHex,
} from "./ColorChoiceDropdown";

describe("ColorChoiceDropdown", () => {
  const copy = {
    customLabel: "Custom color",
    customHelp: "Enter a color.",
    customHexLabel: "Color code",
    customPickerLabel: "Open color picker",
    applyCustom: "Apply custom color",
    invalidHex: "Use a valid color.",
  };
  const sections = [
    {
      id: "recommended",
      label: "Recommended colors",
      choices: [
        { id: "red", hex: "#B3261E", label: "Red" },
        { id: "indigo", hex: "#4F46E5", label: "Indigo" },
      ],
    },
  ];

  it("renders a closed Material-style color dropdown trigger", () => {
    const html = renderToStaticMarkup(
      <ColorChoiceDropdown
        label="Accent preset"
        valueHex="#4f46e5"
        sections={sections}
        copy={copy}
        fieldIdPrefix="accent-color"
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-color-choice-dropdown="accent-color"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Indigo");
    expect(html).toContain("#4F46E5");
    expect(html).not.toContain("color-choice-dropdown__hex");
    expect(html).not.toContain('type="color"');
  });

  it("normalizes hex drafts and computes fallback selection labels", () => {
    expect(normalizeColorChoiceHex("4f46e5")).toBe("#4F46E5");
    expect(normalizeColorChoiceHex("#abc")).toBe("#AABBCC");
    expect(normalizeColorChoiceHex("not-a-color")).toBeNull();
    expect(getColorChoiceSelectionLabel("#B3261E", sections, "Custom")).toBe(
      "Red",
    );
    expect(getColorChoiceSelectionLabel("#111111", sections, "Custom")).toBe(
      "#111111",
    );
  });
});
