import type { ThemeMode, ThemePreset } from "../providers/types";

const DARK_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const LIGHT_TEXT_HEX = "#FFFFFF";
const DARK_TEXT_HEX = "#111418";

export type ResolvedThemeMode = "light" | "dark";
export type ThemeSettings = {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  themeCustomSeedHex: string | null;
};
export type ThemeRolePalette = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  themeMode: "system",
  themePreset: "default",
  themeCustomSeedHex: null,
};

export const THEME_PRESET_OPTIONS: Array<{
  value: ThemePreset;
  label: string;
}> = [
  {
    value: "default",
    label: "Default Blue",
  },
  {
    value: "meadow",
    label: "Meadow",
  },
  {
    value: "sunset",
    label: "Sunset",
  },
  {
    value: "custom",
    label: "Custom Seed",
  },
];

type MatchMediaReader = {
  matchMedia?: ((query: string) => MediaQueryListLike) | undefined;
};

type MediaQueryListLike = {
  matches: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

type ThemeStyleRoot = {
  colorScheme?: string;
  setProperty?: (property: string, value: string) => void;
  removeProperty?: (property: string) => void;
};

type ThemeRoot = {
  dataset: Record<string, string | undefined>;
  style?: ThemeStyleRoot;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

const CUSTOM_THEME_STYLE_VARIABLES = [
  "--md-sys-color-primary",
  "--md-sys-color-on-primary",
  "--md-sys-color-primary-container",
  "--md-sys-color-on-primary-container",
  "--md-sys-color-secondary",
  "--md-sys-color-on-secondary",
  "--md-sys-color-secondary-container",
  "--md-sys-color-on-secondary-container",
  "--md-sys-color-tertiary",
  "--md-sys-color-on-tertiary",
  "--md-sys-color-tertiary-container",
  "--md-sys-color-on-tertiary-container",
] as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function parseHexColor(value: string): RgbColor | null {
  const normalizedValue = normalizeThemeCustomSeedHex(value);

  if (!normalizedValue) {
    return null;
  }

  return {
    r: Number.parseInt(normalizedValue.slice(1, 3), 16),
    g: Number.parseInt(normalizedValue.slice(3, 5), 16),
    b: Number.parseInt(normalizedValue.slice(5, 7), 16),
  };
}

function formatHexColor(color: RgbColor): string {
  return `#${Math.round(color.r).toString(16).padStart(2, "0")}${Math.round(
    color.g,
  )
    .toString(16)
    .padStart(2, "0")}${Math.round(color.b)
    .toString(16)
    .padStart(2, "0")}`.toUpperCase();
}

function mixHexColors(
  leftHex: string,
  rightHex: string,
  rightWeight: number,
): string {
  const left = parseHexColor(leftHex);
  const right = parseHexColor(rightHex);

  if (!left || !right) {
    return leftHex;
  }

  const weight = clamp(rightWeight, 0, 1);

  return formatHexColor({
    r: left.r * (1 - weight) + right.r * weight,
    g: left.g * (1 - weight) + right.g * weight,
    b: left.b * (1 - weight) + right.b * weight,
  });
}

function rgbToHsl(color: RgbColor): HslColor {
  const red = color.r / 255;
  const green = color.g / 255;
  const blue = color.b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation =
    delta / (1 - Math.abs(2 * lightness - 1));

  let hue = 0;

  switch (max) {
    case red:
      hue = ((green - blue) / delta) % 6;
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    h: (hue * 60 + 360) % 360,
    s: saturation,
    l: lightness,
  };
}

function hueToRgb(
  first: number,
  second: number,
  hue: number,
): number {
  let adjustedHue = hue;

  if (adjustedHue < 0) {
    adjustedHue += 1;
  }

  if (adjustedHue > 1) {
    adjustedHue -= 1;
  }

  if (adjustedHue < 1 / 6) {
    return first + (second - first) * 6 * adjustedHue;
  }

  if (adjustedHue < 1 / 2) {
    return second;
  }

  if (adjustedHue < 2 / 3) {
    return first + (second - first) * (2 / 3 - adjustedHue) * 6;
  }

  return first;
}

function hslToRgb(color: HslColor): RgbColor {
  const hue = ((color.h % 360) + 360) % 360 / 360;
  const saturation = clamp(color.s, 0, 1);
  const lightness = clamp(color.l, 0, 1);

  if (saturation === 0) {
    const channel = lightness * 255;

    return {
      r: channel,
      g: channel,
      b: channel,
    };
  }

  const second =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const first = 2 * lightness - second;

  return {
    r: hueToRgb(first, second, hue + 1 / 3) * 255,
    g: hueToRgb(first, second, hue) * 255,
    b: hueToRgb(first, second, hue - 1 / 3) * 255,
  };
}

function deriveVariantSeed(
  seedHex: string,
  hueShift: number,
  saturationMultiplier: number,
  lightnessOffset: number,
): string {
  const rgb = parseHexColor(seedHex);

  if (!rgb) {
    return seedHex;
  }

  const hsl = rgbToHsl(rgb);

  return formatHexColor(
    hslToRgb({
      h: hsl.h + hueShift,
      s: clamp(hsl.s * saturationMultiplier, 0.18, 0.78),
      l: clamp(hsl.l + lightnessOffset, 0.18, 0.72),
    }),
  );
}

function linearizeChannel(channel: number): number {
  const normalizedChannel = channel / 255;

  return normalizedChannel <= 0.03928
    ? normalizedChannel / 12.92
    : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const color = parseHexColor(hex);

  if (!color) {
    return 0;
  }

  return (
    0.2126 * linearizeChannel(color.r) +
    0.7152 * linearizeChannel(color.g) +
    0.0722 * linearizeChannel(color.b)
  );
}

function contrastRatio(leftHex: string, rightHex: string): number {
  const leftLuminance = relativeLuminance(leftHex);
  const rightLuminance = relativeLuminance(rightHex);
  const lighter = Math.max(leftLuminance, rightLuminance);
  const darker = Math.min(leftLuminance, rightLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function chooseReadableText(backgroundHex: string): string {
  return contrastRatio(backgroundHex, LIGHT_TEXT_HEX) >=
    contrastRatio(backgroundHex, DARK_TEXT_HEX)
    ? LIGHT_TEXT_HEX
    : DARK_TEXT_HEX;
}

function buildAccentFamily(
  seedHex: string,
  resolvedThemeMode: ResolvedThemeMode,
): Pick<
  ThemeRolePalette,
  | "primary"
  | "onPrimary"
  | "primaryContainer"
  | "onPrimaryContainer"
> {
  const primary =
    resolvedThemeMode === "dark"
      ? mixHexColors(seedHex, "#FFFFFF", 0.42)
      : seedHex;
  const primaryContainer =
    resolvedThemeMode === "dark"
      ? mixHexColors(seedHex, "#000000", 0.52)
      : mixHexColors(seedHex, "#FFFFFF", 0.82);

  return {
    primary,
    onPrimary: chooseReadableText(primary),
    primaryContainer,
    onPrimaryContainer: chooseReadableText(primaryContainer),
  };
}

function applyCustomThemePalette(
  style: ThemeStyleRoot | undefined,
  palette: ThemeRolePalette | null,
) {
  if (!style?.setProperty || !style.removeProperty) {
    return;
  }

  if (!palette) {
    for (const variableName of CUSTOM_THEME_STYLE_VARIABLES) {
      style.removeProperty(variableName);
    }

    return;
  }

  style.setProperty("--md-sys-color-primary", palette.primary);
  style.setProperty("--md-sys-color-on-primary", palette.onPrimary);
  style.setProperty(
    "--md-sys-color-primary-container",
    palette.primaryContainer,
  );
  style.setProperty(
    "--md-sys-color-on-primary-container",
    palette.onPrimaryContainer,
  );
  style.setProperty("--md-sys-color-secondary", palette.secondary);
  style.setProperty("--md-sys-color-on-secondary", palette.onSecondary);
  style.setProperty(
    "--md-sys-color-secondary-container",
    palette.secondaryContainer,
  );
  style.setProperty(
    "--md-sys-color-on-secondary-container",
    palette.onSecondaryContainer,
  );
  style.setProperty("--md-sys-color-tertiary", palette.tertiary);
  style.setProperty("--md-sys-color-on-tertiary", palette.onTertiary);
  style.setProperty(
    "--md-sys-color-tertiary-container",
    palette.tertiaryContainer,
  );
  style.setProperty(
    "--md-sys-color-on-tertiary-container",
    palette.onTertiaryContainer,
  );
}

export function normalizeThemeMode(value: unknown): ThemeMode {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : "system";
}

export function normalizeThemePreset(value: unknown): ThemePreset {
  return value === "default" ||
    value === "meadow" ||
    value === "sunset" ||
    value === "custom"
    ? value
    : "default";
}

export function normalizeThemeCustomSeedHex(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const rawHex = trimmedValue.startsWith("#")
    ? trimmedValue.slice(1)
    : trimmedValue;

  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(rawHex)) {
    return null;
  }

  const expandedHex =
    rawHex.length === 3
      ? rawHex
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : rawHex;

  return `#${expandedHex.toUpperCase()}`;
}

export function buildCustomThemePalette(
  seedHex: string,
  resolvedThemeMode: ResolvedThemeMode,
): ThemeRolePalette {
  const normalizedSeedHex = normalizeThemeCustomSeedHex(seedHex) ?? "#4F46E5";
  const secondarySeed = deriveVariantSeed(
    normalizedSeedHex,
    18,
    0.38,
    resolvedThemeMode === "dark" ? 0.03 : -0.02,
  );
  const tertiarySeed = deriveVariantSeed(
    normalizedSeedHex,
    56,
    0.52,
    resolvedThemeMode === "dark" ? 0.06 : 0.04,
  );
  const primaryFamily = buildAccentFamily(normalizedSeedHex, resolvedThemeMode);
  const secondaryFamily = buildAccentFamily(secondarySeed, resolvedThemeMode);
  const tertiaryFamily = buildAccentFamily(tertiarySeed, resolvedThemeMode);

  return {
    primary: primaryFamily.primary,
    onPrimary: primaryFamily.onPrimary,
    primaryContainer: primaryFamily.primaryContainer,
    onPrimaryContainer: primaryFamily.onPrimaryContainer,
    secondary: secondaryFamily.primary,
    onSecondary: secondaryFamily.onPrimary,
    secondaryContainer: secondaryFamily.primaryContainer,
    onSecondaryContainer: secondaryFamily.onPrimaryContainer,
    tertiary: tertiaryFamily.primary,
    onTertiary: tertiaryFamily.onPrimary,
    tertiaryContainer: tertiaryFamily.primaryContainer,
    onTertiaryContainer: tertiaryFamily.onPrimaryContainer,
  };
}

export function normalizeThemeSettings(
  value: Partial<ThemeSettings> | null | undefined,
): ThemeSettings {
  return {
    themeMode: normalizeThemeMode(value?.themeMode),
    themePreset: normalizeThemePreset(value?.themePreset),
    themeCustomSeedHex: normalizeThemeCustomSeedHex(value?.themeCustomSeedHex),
  };
}

export function resolveThemeMode(
  themeMode: ThemeMode,
  reader?: MatchMediaReader,
): ResolvedThemeMode {
  if (themeMode === "light" || themeMode === "dark") {
    return themeMode;
  }

  return reader?.matchMedia?.(DARK_COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

export function buildQuickThemeToggle(
  themeMode: ThemeMode,
  reader?: MatchMediaReader,
): { nextMode: ResolvedThemeMode; label: "Light" | "Dark"; title: string } {
  const resolvedThemeMode = resolveThemeMode(themeMode, reader);
  const nextMode = resolvedThemeMode === "dark" ? "light" : "dark";
  const label = nextMode === "dark" ? "Dark" : "Light";

  return {
    nextMode,
    label,
    title: `Switch to ${nextMode} mode`,
  };
}

export function applyThemeMode(
  themeMode: ThemeMode,
  root: ThemeRoot,
  reader?: MatchMediaReader,
): ResolvedThemeMode {
  return applyThemeSettings(
    {
      ...DEFAULT_THEME_SETTINGS,
      themeMode,
    },
    root,
    reader,
  );
}

export function applyThemeSettings(
  settings: ThemeSettings,
  root: ThemeRoot,
  reader?: MatchMediaReader,
): ResolvedThemeMode {
  const normalizedSettings = normalizeThemeSettings(settings);
  const resolvedThemeMode = resolveThemeMode(normalizedSettings.themeMode, reader);
  const customPalette =
    normalizedSettings.themePreset === "custom" &&
    normalizedSettings.themeCustomSeedHex
      ? buildCustomThemePalette(
          normalizedSettings.themeCustomSeedHex,
          resolvedThemeMode,
        )
      : null;

  root.dataset.themeMode = normalizedSettings.themeMode;
  root.dataset.themePreset = normalizedSettings.themePreset;
  root.dataset.themeResolved = resolvedThemeMode;

  if (normalizedSettings.themePreset === "custom") {
    if (normalizedSettings.themeCustomSeedHex) {
      root.dataset.themeCustomSeedHex = normalizedSettings.themeCustomSeedHex;
    } else {
      delete root.dataset.themeCustomSeedHex;
    }
  } else {
    delete root.dataset.themeCustomSeedHex;
  }

  if (root.style) {
    root.style.colorScheme = resolvedThemeMode;
  }

  applyCustomThemePalette(root.style, customPalette);

  return resolvedThemeMode;
}

export function startThemeModeSync(
  themeMode: ThemeMode,
  root: ThemeRoot,
  reader?: MatchMediaReader,
): () => void {
  return startThemeSettingsSync(
    {
      ...DEFAULT_THEME_SETTINGS,
      themeMode,
    },
    root,
    reader,
  );
}

export function startThemeSettingsSync(
  settings: ThemeSettings,
  root: ThemeRoot,
  reader?: MatchMediaReader,
): () => void {
  const normalizedSettings = normalizeThemeSettings(settings);

  applyThemeSettings(normalizedSettings, root, reader);

  if (normalizedSettings.themeMode !== "system") {
    return () => {};
  }

  const mediaQuery = reader?.matchMedia?.(DARK_COLOR_SCHEME_QUERY);

  if (!mediaQuery) {
    return () => {};
  }

  const handleChange = () => {
    applyThemeSettings(normalizedSettings, root, reader);
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
    };
  }

  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeListener?.(handleChange);
    };
  }

  return () => {};
}
