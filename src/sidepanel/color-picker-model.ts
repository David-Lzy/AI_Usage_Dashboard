import { normalizeThemeCustomSeedHex } from "../shared/theme";

export type HsvColor = {
  hue: number;
  saturation: number;
  value: number;
};

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampByte(value: number): number {
  return Math.round(clamp(value, 0, 255));
}

function normalizeHue(value: number): number {
  return ((value % 360) + 360) % 360;
}

function hexToRgb(hex: string): RgbColor | null {
  const normalizedHex = normalizeThemeCustomSeedHex(hex);

  if (!normalizedHex) {
    return null;
  }

  return {
    red: parseInt(normalizedHex.slice(1, 3), 16),
    green: parseInt(normalizedHex.slice(3, 5), 16),
    blue: parseInt(normalizedHex.slice(5, 7), 16),
  };
}

function rgbToHex(color: RgbColor): string {
  return `#${[color.red, color.green, color.blue]
    .map((channel) => clampByte(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function rgbToHsv(color: RgbColor): HsvColor {
  const red = color.red / 255;
  const green = color.green / 255;
  const blue = color.blue / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / delta + 2);
    } else {
      hue = 60 * ((red - green) / delta + 4);
    }
  }

  return {
    hue: normalizeHue(hue),
    saturation: max === 0 ? 0 : (delta / max) * 100,
    value: max * 100,
  };
}

export function hexToHsv(hex: string): HsvColor {
  return rgbToHsv(hexToRgb(hex) ?? { red: 79, green: 70, blue: 229 });
}

export function hsvToHex(color: HsvColor): string {
  const hue = normalizeHue(color.hue);
  const saturation = clamp(color.saturation, 0, 100) / 100;
  const value = clamp(color.value, 0, 100) / 100;
  const chroma = value * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - chroma;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return rgbToHex({
    red: (red + m) * 255,
    green: (green + m) * 255,
    blue: (blue + m) * 255,
  });
}

export function clampHsvColor(color: HsvColor): HsvColor {
  return {
    hue: normalizeHue(color.hue),
    saturation: clamp(color.saturation, 0, 100),
    value: clamp(color.value, 0, 100),
  };
}
