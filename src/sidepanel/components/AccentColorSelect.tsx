import type { ThemePreset } from "../../providers/types";
import { RECOMMENDED_COLOR_CHOICES } from "../../shared/color-choices";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import { normalizeThemeCustomSeedHex } from "../../shared/theme";
import type { MaterialSelectOption } from "./MaterialSelect";
import {
  ColorChoiceDropdown,
  type ColorChoiceDropdownChoice,
  type ColorChoiceDropdownSection,
} from "./ColorChoiceDropdown";

const THEME_PRESET_SWATCH_HEX: Record<Exclude<ThemePreset, "custom">, string> = {
  default: "#005AC1",
  meadow: "#2A6A31",
  sunset: "#9A4D00",
};

type AccentColorSelectProps = {
  label: string;
  themePreset: ThemePreset;
  themeCustomSeedHex: string | null;
  themePresetOptions: Array<MaterialSelectOption<ThemePreset>>;
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"];
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onThemeCustomSeedChange: (themeCustomSeedHex: string) => void;
};

function buildThemePresetChoices(
  themePresetOptions: readonly MaterialSelectOption<ThemePreset>[],
): ColorChoiceDropdownChoice[] {
  return themePresetOptions
    .filter(
      (option): option is MaterialSelectOption<Exclude<ThemePreset, "custom">> =>
        option.value !== "custom",
    )
    .map((option) => ({
      id: `preset-${option.value}`,
      hex: THEME_PRESET_SWATCH_HEX[option.value],
      label: option.label,
    }));
}

export function buildRecommendedColorChoices(
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"],
): ColorChoiceDropdownChoice[] {
  return RECOMMENDED_COLOR_CHOICES.map((choice) => ({
    id: `color-${choice.id}`,
    hex: choice.hex,
    label: copy.colorNames[choice.id],
  }));
}

export function buildAccentColorChoiceSections(
  themePresetOptions: readonly MaterialSelectOption<ThemePreset>[],
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"],
): ColorChoiceDropdownSection[] {
  return [
    {
      id: "theme-presets",
      label: copy.themePresetsLabel,
      choices: buildThemePresetChoices(themePresetOptions),
    },
    {
      id: "recommended-colors",
      label: copy.recommendedColorsLabel,
      choices: buildRecommendedColorChoices(copy),
    },
  ];
}

export function getAccentColorSelection(
  themePreset: ThemePreset,
  themeCustomSeedHex: string | null,
  themePresetOptions: readonly MaterialSelectOption<ThemePreset>[],
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"],
): { hex: string; label: string } {
  if (themePreset !== "custom") {
    const presetLabel =
      themePresetOptions.find((option) => option.value === themePreset)?.label ??
      themePreset;

    return {
      hex: THEME_PRESET_SWATCH_HEX[themePreset],
      label: presetLabel,
    };
  }

  const normalizedSeed = normalizeThemeCustomSeedHex(themeCustomSeedHex);

  if (!normalizedSeed) {
    return {
      hex: "#4F46E5",
      label: copy.customLabel,
    };
  }

  const matchingRecommendedChoice = buildRecommendedColorChoices(copy).find(
    (choice) => normalizeThemeCustomSeedHex(choice.hex) === normalizedSeed,
  );

  return {
    hex: normalizedSeed,
    label: matchingRecommendedChoice?.label ?? copy.customLabel,
  };
}

export function AccentColorSelect({
  label,
  themePreset,
  themeCustomSeedHex,
  themePresetOptions,
  copy,
  activePopover,
  onActivePopoverChange,
  onThemePresetChange,
  onThemeCustomSeedChange,
}: AccentColorSelectProps) {
  const sections = buildAccentColorChoiceSections(themePresetOptions, copy);
  const selection = getAccentColorSelection(
    themePreset,
    themeCustomSeedHex,
    themePresetOptions,
    copy,
  );

  function handleChoiceSelect(choice: ColorChoiceDropdownChoice) {
    if (choice.id.startsWith("preset-")) {
      const nextThemePreset = choice.id.replace("preset-", "") as ThemePreset;

      if (
        nextThemePreset === "default" ||
        nextThemePreset === "meadow" ||
        nextThemePreset === "sunset"
      ) {
        onThemePresetChange(nextThemePreset);
      }

      return;
    }

    onThemeCustomSeedChange(choice.hex);
  }

  return (
    <ColorChoiceDropdown
      label={label}
      valueHex={selection.hex}
      selectedLabel={selection.label}
      sections={sections}
      copy={copy}
      fieldIdPrefix="accent-color"
      sessionPopoverId="accent-color"
      activePopover={activePopover}
      onActivePopoverChange={onActivePopoverChange}
      onChange={onThemeCustomSeedChange}
      onChoiceSelect={handleChoiceSelect}
    />
  );
}
