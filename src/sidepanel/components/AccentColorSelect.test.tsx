import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  AccentColorSelect,
  buildAccentColorChoiceSections,
  buildRecommendedColorChoices,
  getAccentColorSelection,
} from "./AccentColorSelect";

describe("AccentColorSelect", () => {
  const i18n = createRuntimeI18n("en");
  const copy = buildSettingsLocalizedCopy(i18n);
  const themePresetOptions = [
    { value: "default" as const, label: "Default Blue" },
    { value: "meadow" as const, label: "Meadow" },
    { value: "sunset" as const, label: "Sunset" },
    { value: "custom" as const, label: "Custom color" },
  ];

  it("renders the accent color dropdown instead of a plain theme preset select", () => {
    const html = renderToStaticMarkup(
      <AccentColorSelect
        label="Accent preset"
        themePreset="custom"
        themeCustomSeedHex="#4f46e5"
        themePresetOptions={themePresetOptions}
        copy={copy.colorChoices}
        onThemePresetChange={() => {}}
        onThemeCustomSeedChange={() => {}}
      />,
    );

    expect(html).toContain('data-color-choice-dropdown="accent-color"');
    expect(html).toContain("Indigo");
    expect(html).toContain("#4F46E5");
    expect(html).not.toContain('data-settings-material-select="theme-preset"');
  });

  it("keeps named presets and at least ten recommended colors in one model", () => {
    const sections = buildAccentColorChoiceSections(
      themePresetOptions,
      copy.colorChoices,
    );

    expect(sections[0].choices.map((choice) => choice.id)).toEqual([
      "preset-default",
      "preset-meadow",
      "preset-sunset",
    ]);
    expect(buildRecommendedColorChoices(copy.colorChoices)).toHaveLength(13);
  });

  it("resolves preset and custom seed labels for the closed trigger", () => {
    expect(
      getAccentColorSelection(
        "meadow",
        null,
        themePresetOptions,
        copy.colorChoices,
      ),
    ).toEqual({ hex: "#2A6A31", label: "Meadow" });
    expect(
      getAccentColorSelection(
        "custom",
        "#B3261E",
        themePresetOptions,
        copy.colorChoices,
      ),
    ).toEqual({ hex: "#B3261E", label: "Red" });
  });
});
