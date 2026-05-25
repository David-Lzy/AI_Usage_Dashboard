import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ColorChoiceDropdown,
  getColorChoiceSelectionLabel,
  normalizeColorChoiceHex,
} from "./ColorChoiceDropdown";
import {
  resolveAdaptiveDropdownMenuChoiceWidth,
  resolveAdaptiveDropdownMenuColumnCount,
} from "./AdaptiveDropdownMenuGrid";

const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);

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

  it("can restore an active dropdown and custom color panel from session state", () => {
    const html = renderToStaticMarkup(
      <ColorChoiceDropdown
        label="Accent preset"
        valueHex="#4f46e5"
        sections={sections}
        copy={copy}
        fieldIdPrefix="accent-color"
        sessionPopoverId="accent-color"
        activePopover={{
          id: "accent-color",
          customPanelOpen: true,
        }}
        onActivePopoverChange={() => {}}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("color-choice-dropdown__menu");
    expect(html).toContain("color-choice-dropdown__menu-header");
    expect(html).toContain("color-choice-dropdown__custom-panel");
    expect(html).toContain("Apply custom color");
  });

  it("can render a compact floating menu for dense color-band rows", () => {
    const html = renderToStaticMarkup(
      <ColorChoiceDropdown
        label="Band color"
        valueHex="#4f46e5"
        sections={sections}
        copy={copy}
        fieldIdPrefix="progress-color-band-low"
        menuDensity="compact"
        sessionPopoverId="progress-color-band:low:color"
        activePopover={{
          id: "progress-color-band:low:color",
        }}
        onActivePopoverChange={() => {}}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-color-choice-menu-density="compact"');
    expect(html).toContain("color-choice-dropdown__menu--compact");
  });

  it("uses body-large trigger typography for color names and custom hex values", () => {
    expect(formControlsCss).toContain(".color-choice-dropdown__button {");
    expect(formControlsCss).toContain(
      "min-height: var(--app-control-height-large);",
    );
    expect(formControlsCss).toContain(
      "font-size: var(--md-sys-typescale-body-large-size);",
    );
    expect(formControlsCss).toContain(
      "line-height: var(--md-sys-typescale-body-large-line-height);",
    );
    expect(formControlsCss).toContain(".color-choice-dropdown__value {");
    expect(formControlsCss).toContain("display: inline-flex;");
    expect(formControlsCss).toContain("align-items: center;");
  });

  it("uses an in-app Material-style custom color picker instead of native color input styling", () => {
    expect(formControlsCss).toContain(
      ".color-choice-dropdown__material-picker {",
    );
    expect(formControlsCss).toContain(".color-choice-dropdown__picker-plane {");
    expect(formControlsCss).toContain(".color-choice-dropdown__hue-range {");
    expect(formControlsCss).not.toContain('input[type="color"]');
  });

  it("keeps the custom color entry in the menu header and stretches color choices responsively", () => {
    expect(formControlsCss).toContain(".color-choice-dropdown__menu-header {");
    expect(formControlsCss).toContain(
      "var(--adaptive-dropdown-menu-choice-min)",
    );
    expect(formControlsCss).toContain(
      ".adaptive-dropdown-menu-grid__measurer {",
    );
    expect(formControlsCss).toContain(
      ".adaptive-dropdown-menu-grid__measure-choice--compact {",
    );
  });

  it("uses the shared dropdown menu grid formula", () => {
    const columnCount = resolveAdaptiveDropdownMenuColumnCount({
      availableWidthPx: 480,
      columnGapPx: 8,
      itemCount: 16,
      minWidthPx: 112,
    });

    expect(columnCount).toBe(4);
    expect(
      resolveAdaptiveDropdownMenuChoiceWidth({
        availableWidthPx: 480,
        columnCount: columnCount ?? 1,
        columnGapPx: 8,
      }),
    ).toBe(114);
    expect(
      resolveAdaptiveDropdownMenuColumnCount({
        availableWidthPx: 220,
        columnGapPx: 8,
        itemCount: 16,
        minWidthPx: 112,
      }),
    ).toBe(1);
  });

  it("keeps closed triggers and floating menus bounded in adaptive grids", () => {
    expect(formControlsCss).toContain(
      ".adaptive-control-grid .color-choice-dropdown__button,",
    );
    expect(formControlsCss).toContain(".color-choice-dropdown__menu--floating {");
    expect(formControlsCss).toContain("max-inline-size: calc(100vw - 32px);");
  });
});
