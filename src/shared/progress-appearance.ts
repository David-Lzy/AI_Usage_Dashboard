import type {
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressGradientStop,
} from "../providers/types";

export type ProgressGradientPresetId =
  | "warning"
  | "ocean"
  | "sunset"
  | "meadow"
  | "aurora"
  | "calm-blue"
  | "fire"
  | "glacier"
  | "forest"
  | "rose-gold"
  | "violet"
  | "neon"
  | "lake"
  | "citrus"
  | "berry"
  | "slate";

export type ProgressGradientPreset = {
  id: ProgressGradientPresetId;
  stops: readonly ProgressGradientStop[];
};

export const PROGRESS_THICKNESS_MIN_PX = 1;
export const PROGRESS_THICKNESS_MAX_PX = 20;
export const PROGRESS_THICKNESS_SLIDER_MIN = 0;
export const PROGRESS_THICKNESS_SLIDER_MAX = 1000;
export const DEFAULT_PROGRESS_THICKNESS_PX = 10;

const PROGRESS_COLOR_HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const PROGRESS_COLOR_BAND_KEYS = new Set([
  "id",
  "minimumPercent",
  "maximumPercent",
  "colorHex",
]);
const PROGRESS_GRADIENT_STOP_KEYS = new Set([
  "id",
  "positionPercent",
  "colorHex",
]);
const PROGRESS_COLOR_APPEARANCE_KEYS = new Set([
  "mode",
  "bands",
  "stops",
]);

export const DEFAULT_PROGRESS_COLOR_BANDS: readonly ProgressColorBand[] = [
  {
    id: "low",
    minimumPercent: 0,
    maximumPercent: 20,
    colorHex: "#B3261E",
  },
  {
    id: "medium",
    minimumPercent: 21,
    maximumPercent: 49,
    colorHex: "#8A4B00",
  },
  {
    id: "high",
    minimumPercent: 50,
    maximumPercent: 100,
    colorHex: "#146C2E",
  },
];

export const DEFAULT_PROGRESS_GRADIENT_STOPS: readonly ProgressGradientStop[] = [
  {
    id: "low",
    positionPercent: 0,
    colorHex: "#B3261E",
  },
  {
    id: "medium",
    positionPercent: 49,
    colorHex: "#8A4B00",
  },
  {
    id: "high",
    positionPercent: 100,
    colorHex: "#146C2E",
  },
];

export const PROGRESS_GRADIENT_PRESETS: readonly ProgressGradientPreset[] = [
  {
    id: "warning",
    stops: [
      { id: "warning-critical", positionPercent: 0, colorHex: "#B3261E" },
      { id: "warning-watch", positionPercent: 49, colorHex: "#8A4B00" },
      { id: "warning-clear", positionPercent: 100, colorHex: "#146C2E" },
    ],
  },
  {
    id: "ocean",
    stops: [
      { id: "ocean-deep", positionPercent: 0, colorHex: "#006874" },
      { id: "ocean-current", positionPercent: 48, colorHex: "#005AC1" },
      { id: "ocean-clear", positionPercent: 100, colorHex: "#4F46E5" },
    ],
  },
  {
    id: "sunset",
    stops: [
      { id: "sunset-ember", positionPercent: 0, colorHex: "#B3261E" },
      { id: "sunset-gold", positionPercent: 46, colorHex: "#B26A00" },
      { id: "sunset-violet", positionPercent: 100, colorHex: "#7B3DB2" },
    ],
  },
  {
    id: "meadow",
    stops: [
      { id: "meadow-moss", positionPercent: 0, colorHex: "#5F6F00" },
      { id: "meadow-leaf", positionPercent: 54, colorHex: "#146C2E" },
      { id: "meadow-mint", positionPercent: 100, colorHex: "#006D3F" },
    ],
  },
  {
    id: "aurora",
    stops: [
      { id: "aurora-indigo", positionPercent: 0, colorHex: "#4F46E5" },
      { id: "aurora-teal", positionPercent: 50, colorHex: "#006A60" },
      { id: "aurora-rose", positionPercent: 100, colorHex: "#A7356B" },
    ],
  },
  {
    id: "calm-blue",
    stops: [
      { id: "calm-shadow", positionPercent: 0, colorHex: "#006A60" },
      { id: "calm-blue", positionPercent: 52, colorHex: "#005AC1" },
      { id: "calm-lavender", positionPercent: 100, colorHex: "#6D43A6" },
    ],
  },
  {
    id: "fire",
    stops: [
      { id: "fire-coal", positionPercent: 0, colorHex: "#7A1C12" },
      { id: "fire-ember", positionPercent: 44, colorHex: "#D65A00" },
      { id: "fire-gold", positionPercent: 100, colorHex: "#FFD166" },
    ],
  },
  {
    id: "glacier",
    stops: [
      { id: "glacier-deep", positionPercent: 0, colorHex: "#005C73" },
      { id: "glacier-ice", positionPercent: 50, colorHex: "#6EC6E8" },
      { id: "glacier-snow", positionPercent: 100, colorHex: "#E6F7FF" },
    ],
  },
  {
    id: "forest",
    stops: [
      { id: "forest-moss", positionPercent: 0, colorHex: "#3F5300" },
      { id: "forest-leaf", positionPercent: 52, colorHex: "#146C2E" },
      { id: "forest-bright", positionPercent: 100, colorHex: "#00A36C" },
    ],
  },
  {
    id: "rose-gold",
    stops: [
      { id: "rose-gold-rose", positionPercent: 0, colorHex: "#A7356B" },
      { id: "rose-gold-amber", positionPercent: 48, colorHex: "#C77700" },
      { id: "rose-gold-soft", positionPercent: 100, colorHex: "#F4C7B8" },
    ],
  },
  {
    id: "violet",
    stops: [
      { id: "violet-deep", positionPercent: 0, colorHex: "#4527A0" },
      { id: "violet-clear", positionPercent: 50, colorHex: "#7B3DB2" },
      { id: "violet-soft", positionPercent: 100, colorHex: "#C77DFF" },
    ],
  },
  {
    id: "neon",
    stops: [
      { id: "neon-night", positionPercent: 0, colorHex: "#0B132B" },
      { id: "neon-teal", positionPercent: 50, colorHex: "#00D1B2" },
      { id: "neon-pink", positionPercent: 100, colorHex: "#F72585" },
    ],
  },
  {
    id: "lake",
    stops: [
      { id: "lake-deep", positionPercent: 0, colorHex: "#004E64" },
      { id: "lake-bright", positionPercent: 50, colorHex: "#00A6A6" },
      { id: "lake-mint", positionPercent: 100, colorHex: "#7AE7C7" },
    ],
  },
  {
    id: "citrus",
    stops: [
      { id: "citrus-brown", positionPercent: 0, colorHex: "#7A4F00" },
      { id: "citrus-orange", positionPercent: 50, colorHex: "#B26A00" },
      { id: "citrus-lemon", positionPercent: 100, colorHex: "#D9A300" },
    ],
  },
  {
    id: "berry",
    stops: [
      { id: "berry-deep", positionPercent: 0, colorHex: "#6D214F" },
      { id: "berry-rose", positionPercent: 50, colorHex: "#A7356B" },
      { id: "berry-bright", positionPercent: 100, colorHex: "#E84A8A" },
    ],
  },
  {
    id: "slate",
    stops: [
      { id: "slate-ink", positionPercent: 0, colorHex: "#374151" },
      { id: "slate-teal", positionPercent: 50, colorHex: "#007A78" },
      { id: "slate-blue", positionPercent: 100, colorHex: "#2563EB" },
    ],
  },
];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneDefaultProgressColorBands(): ProgressColorBand[] {
  return DEFAULT_PROGRESS_COLOR_BANDS.map((band) => ({ ...band }));
}

function cloneDefaultProgressGradientStops(): ProgressGradientStop[] {
  return DEFAULT_PROGRESS_GRADIENT_STOPS.map((stop) => ({ ...stop }));
}

function cloneProgressGradientPresetStops(
  preset: ProgressGradientPreset,
): ProgressGradientStop[] {
  return preset.stops.map((stop) => ({ ...stop }));
}

function normalizeInteger(value: unknown): number | null {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function normalizeFiniteNumber(value: unknown): number | null {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function clampNumber(value: number, minimumValue: number, maximumValue: number) {
  return Math.min(maximumValue, Math.max(minimumValue, value));
}

function normalizeColorHex(value: unknown): string | null {
  if (typeof value !== "string" || !PROGRESS_COLOR_HEX_PATTERN.test(value)) {
    return null;
  }

  return value.toUpperCase();
}

function normalizeBandId(value: unknown, index: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(trimmedValue)) {
    return null;
  }

  return trimmedValue || `band-${index + 1}`;
}

function normalizeGradientStopId(value: unknown, index: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(trimmedValue)) {
    return null;
  }

  return trimmedValue || `stop-${index + 1}`;
}

function parseProgressColorBand(
  value: unknown,
  index: number,
): ProgressColorBand | null {
  if (!isRecord(value)) {
    return null;
  }

  if (Object.keys(value).some((key) => !PROGRESS_COLOR_BAND_KEYS.has(key))) {
    return null;
  }

  const id = normalizeBandId(value.id, index);
  const minimumPercent = normalizeInteger(value.minimumPercent);
  const maximumPercent = normalizeInteger(value.maximumPercent);
  const colorHex = normalizeColorHex(value.colorHex);

  if (
    id === null ||
    minimumPercent === null ||
    maximumPercent === null ||
    colorHex === null
  ) {
    return null;
  }

  return {
    id,
    minimumPercent,
    maximumPercent,
    colorHex,
  };
}

function parseProgressGradientStop(
  value: unknown,
  index: number,
): ProgressGradientStop | null {
  if (!isRecord(value)) {
    return null;
  }

  if (Object.keys(value).some((key) => !PROGRESS_GRADIENT_STOP_KEYS.has(key))) {
    return null;
  }

  const id = normalizeGradientStopId(value.id, index);
  const positionPercent = normalizeFiniteNumber(value.positionPercent);
  const colorHex = normalizeColorHex(value.colorHex);

  if (id === null || positionPercent === null || colorHex === null) {
    return null;
  }

  return {
    id,
    positionPercent: roundToTwoDecimals(positionPercent),
    colorHex,
  };
}

export function createDefaultProgressColorBands(): ProgressColorBand[] {
  return cloneDefaultProgressColorBands();
}

export function createDefaultProgressGradientStops(): ProgressGradientStop[] {
  return cloneDefaultProgressGradientStops();
}

export function createProgressGradientPresetStops(
  presetId: ProgressGradientPresetId,
): ProgressGradientStop[] | null {
  const preset =
    PROGRESS_GRADIENT_PRESETS.find((candidate) => candidate.id === presetId) ??
    null;

  return preset ? cloneProgressGradientPresetStops(preset) : null;
}

export function findProgressGradientPresetIdForStops(
  stops: readonly ProgressGradientStop[],
): ProgressGradientPresetId | null {
  const normalizedStops = normalizeProgressGradientStops(stops);

  for (const preset of PROGRESS_GRADIENT_PRESETS) {
    if (normalizedStops.length !== preset.stops.length) {
      continue;
    }

    const matches = normalizedStops.every((stop, index) => {
      const presetStop = preset.stops[index];

      return (
        presetStop !== undefined &&
        stop.positionPercent === presetStop.positionPercent &&
        stop.colorHex === presetStop.colorHex
      );
    });

    if (matches) {
      return preset.id;
    }
  }

  return null;
}

export function createDefaultProgressColorAppearance(): ProgressColorAppearance {
  return {
    mode: "traditional",
    bands: createDefaultProgressColorBands(),
  };
}

export function normalizeProgressThicknessPx(value: unknown): number {
  const parsedValue = normalizeFiniteNumber(value);

  if (
    parsedValue === null ||
    parsedValue < PROGRESS_THICKNESS_MIN_PX ||
    parsedValue > PROGRESS_THICKNESS_MAX_PX
  ) {
    return DEFAULT_PROGRESS_THICKNESS_PX;
  }

  return roundToTwoDecimals(parsedValue);
}

export function progressThicknessPxToSliderValue(value: unknown): number {
  const thicknessPx = normalizeProgressThicknessPx(value);
  const sliderRatio =
    Math.log(thicknessPx / PROGRESS_THICKNESS_MIN_PX) /
    Math.log(PROGRESS_THICKNESS_MAX_PX / PROGRESS_THICKNESS_MIN_PX);

  return Math.round(
    PROGRESS_THICKNESS_SLIDER_MIN +
      clampNumber(sliderRatio, 0, 1) *
        (PROGRESS_THICKNESS_SLIDER_MAX - PROGRESS_THICKNESS_SLIDER_MIN),
  );
}

export function progressThicknessSliderValueToPx(value: unknown): number {
  const parsedValue = normalizeFiniteNumber(value);

  if (parsedValue === null) {
    return DEFAULT_PROGRESS_THICKNESS_PX;
  }

  const sliderValue = clampNumber(
    parsedValue,
    PROGRESS_THICKNESS_SLIDER_MIN,
    PROGRESS_THICKNESS_SLIDER_MAX,
  );
  const sliderRatio =
    (sliderValue - PROGRESS_THICKNESS_SLIDER_MIN) /
    (PROGRESS_THICKNESS_SLIDER_MAX - PROGRESS_THICKNESS_SLIDER_MIN);

  return normalizeProgressThicknessPx(
    PROGRESS_THICKNESS_MIN_PX *
      Math.exp(
        sliderRatio *
          Math.log(PROGRESS_THICKNESS_MAX_PX / PROGRESS_THICKNESS_MIN_PX),
      ),
  );
}

export function areProgressColorBandsValid(
  bands: readonly ProgressColorBand[],
): boolean {
  if (bands.length === 0) {
    return false;
  }

  const seenIds = new Set<string>();
  const sortedBands = [...bands].sort(
    (firstBand, secondBand) =>
      firstBand.minimumPercent - secondBand.minimumPercent,
  );

  for (const band of sortedBands) {
    if (
      !/^[a-zA-Z0-9_-]{1,64}$/.test(band.id) ||
      seenIds.has(band.id) ||
      !PROGRESS_COLOR_HEX_PATTERN.test(band.colorHex) ||
      !Number.isInteger(band.minimumPercent) ||
      !Number.isInteger(band.maximumPercent) ||
      band.minimumPercent < 0 ||
      band.maximumPercent > 100 ||
      band.minimumPercent > band.maximumPercent
    ) {
      return false;
    }

    seenIds.add(band.id);
  }

  if (
    sortedBands[0]?.minimumPercent !== 0 ||
    sortedBands[sortedBands.length - 1]?.maximumPercent !== 100
  ) {
    return false;
  }

  for (let index = 1; index < sortedBands.length; index += 1) {
    if (
      sortedBands[index].minimumPercent !==
      sortedBands[index - 1].maximumPercent + 1
    ) {
      return false;
    }
  }

  return true;
}

export function normalizeProgressColorBands(value: unknown): ProgressColorBand[] {
  if (!Array.isArray(value)) {
    return cloneDefaultProgressColorBands();
  }

  const normalizedBands = value.map(parseProgressColorBand);

  if (
    normalizedBands.some((band) => band === null) ||
    !areProgressColorBandsValid(normalizedBands as ProgressColorBand[])
  ) {
    return cloneDefaultProgressColorBands();
  }

  return (normalizedBands as ProgressColorBand[]).map((band) => ({
    ...band,
    colorHex: band.colorHex.toUpperCase(),
  }));
}

export function areProgressGradientStopsValid(
  stops: readonly ProgressGradientStop[],
): boolean {
  if (stops.length < 2) {
    return false;
  }

  const seenIds = new Set<string>();
  const seenPositions = new Set<number>();
  const sortedStops = [...stops].sort(
    (firstStop, secondStop) =>
      firstStop.positionPercent - secondStop.positionPercent,
  );

  for (const stop of sortedStops) {
    if (
      !/^[a-zA-Z0-9_-]{1,64}$/.test(stop.id) ||
      seenIds.has(stop.id) ||
      !PROGRESS_COLOR_HEX_PATTERN.test(stop.colorHex) ||
      !Number.isFinite(stop.positionPercent) ||
      stop.positionPercent < 0 ||
      stop.positionPercent > 100 ||
      seenPositions.has(stop.positionPercent)
    ) {
      return false;
    }

    seenIds.add(stop.id);
    seenPositions.add(stop.positionPercent);
  }

  return (
    sortedStops[0]?.positionPercent === 0 &&
    sortedStops[sortedStops.length - 1]?.positionPercent === 100
  );
}

function parseNormalizedProgressGradientStops(
  value: unknown,
): ProgressGradientStop[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalizedStops = value.map(parseProgressGradientStop);

  if (
    normalizedStops.some((stop) => stop === null) ||
    !areProgressGradientStopsValid(normalizedStops as ProgressGradientStop[])
  ) {
    return null;
  }

  return (normalizedStops as ProgressGradientStop[])
    .map((stop) => ({
      ...stop,
      colorHex: stop.colorHex.toUpperCase(),
    }))
    .sort(
      (firstStop, secondStop) =>
        firstStop.positionPercent - secondStop.positionPercent,
    );
}

export function normalizeProgressGradientStops(
  value: unknown,
): ProgressGradientStop[] {
  return (
    parseNormalizedProgressGradientStops(value) ??
    cloneDefaultProgressGradientStops()
  );
}

export function normalizeProgressColorAppearance(
  value: unknown,
  fallbackBands?: unknown,
): ProgressColorAppearance {
  const normalizedFallbackBands = normalizeProgressColorBands(fallbackBands);
  const fallbackAppearance: ProgressColorAppearance = {
    mode: "traditional",
    bands: normalizedFallbackBands,
  };

  if (!isRecord(value)) {
    return fallbackAppearance;
  }

  if (
    Object.keys(value).some((key) => !PROGRESS_COLOR_APPEARANCE_KEYS.has(key))
  ) {
    return fallbackAppearance;
  }

  if (value.mode === "traditional") {
    return {
      mode: "traditional",
      bands: normalizeProgressColorBands(value.bands ?? normalizedFallbackBands),
    };
  }

  if (value.mode === "gradient") {
    const stops = parseNormalizedProgressGradientStops(value.stops);

    if (stops === null) {
      return fallbackAppearance;
    }

    return {
      mode: "gradient",
      stops,
    };
  }

  return fallbackAppearance;
}

export function resolveProgressColorBandForRemainingPercent(
  remainingPercent: number | null,
  colorBands: readonly ProgressColorBand[],
): ProgressColorBand | null {
  if (remainingPercent === null || !Number.isFinite(remainingPercent)) {
    return null;
  }

  const normalizedPercent = Math.min(100, Math.max(0, Math.round(remainingPercent)));
  const normalizedBands = normalizeProgressColorBands(colorBands);

  return (
    normalizedBands.find(
      (band) =>
        normalizedPercent >= band.minimumPercent &&
        normalizedPercent <= band.maximumPercent,
    ) ?? null
  );
}

export function resolveProgressColorForRemainingPercent(
  remainingPercent: number | null,
  colorBands: readonly ProgressColorBand[],
): string | null {
  return (
    resolveProgressColorBandForRemainingPercent(remainingPercent, colorBands)
      ?.colorHex ?? null
  );
}

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function parseRgbColorHex(colorHex: string): RgbColor {
  return {
    red: Number.parseInt(colorHex.slice(1, 3), 16),
    green: Number.parseInt(colorHex.slice(3, 5), 16),
    blue: Number.parseInt(colorHex.slice(5, 7), 16),
  };
}

function formatRgbColorHex(color: RgbColor): string {
  const toHexPair = (channel: number) =>
    Math.round(clampNumber(channel, 0, 255))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${toHexPair(color.red)}${toHexPair(color.green)}${toHexPair(
    color.blue,
  )}`;
}

function interpolateRgbColor(
  fromColor: RgbColor,
  toColor: RgbColor,
  ratio: number,
): RgbColor {
  return {
    red: fromColor.red + (toColor.red - fromColor.red) * ratio,
    green: fromColor.green + (toColor.green - fromColor.green) * ratio,
    blue: fromColor.blue + (toColor.blue - fromColor.blue) * ratio,
  };
}

export function resolveProgressGradientColorForRemainingPercent(
  remainingPercent: number | null,
  stops: readonly ProgressGradientStop[],
): string | null {
  if (remainingPercent === null || !Number.isFinite(remainingPercent)) {
    return null;
  }

  const normalizedPercent = clampNumber(remainingPercent, 0, 100);
  const normalizedStops = normalizeProgressGradientStops(stops);
  const firstStop = normalizedStops[0];

  if (!firstStop) {
    return null;
  }

  if (normalizedPercent <= firstStop.positionPercent) {
    return firstStop.colorHex;
  }

  for (let index = 1; index < normalizedStops.length; index += 1) {
    const previousStop = normalizedStops[index - 1];
    const nextStop = normalizedStops[index];

    if (!previousStop || !nextStop) {
      continue;
    }

    if (normalizedPercent > nextStop.positionPercent) {
      continue;
    }

    if (normalizedPercent === nextStop.positionPercent) {
      return nextStop.colorHex;
    }

    const span = nextStop.positionPercent - previousStop.positionPercent;
    const ratio =
      span <= 0
        ? 0
        : (normalizedPercent - previousStop.positionPercent) / span;

    return formatRgbColorHex(
      interpolateRgbColor(
        parseRgbColorHex(previousStop.colorHex),
        parseRgbColorHex(nextStop.colorHex),
        ratio,
      ),
    );
  }

  return normalizedStops[normalizedStops.length - 1]?.colorHex ?? null;
}

export function resolveProgressColorForAppearance(
  remainingPercent: number | null,
  colorAppearance: ProgressColorAppearance | null | undefined,
  fallbackBands: readonly ProgressColorBand[] = DEFAULT_PROGRESS_COLOR_BANDS,
): string | null {
  const normalizedAppearance = normalizeProgressColorAppearance(
    colorAppearance,
    fallbackBands,
  );

  if (normalizedAppearance.mode === "gradient") {
    return resolveProgressGradientColorForRemainingPercent(
      remainingPercent,
      normalizedAppearance.stops,
    );
  }

  return resolveProgressColorForRemainingPercent(
    remainingPercent,
    normalizedAppearance.bands,
  );
}

export function moveProgressColorBand(
  bands: readonly ProgressColorBand[],
  bandId: string,
  direction: "up" | "down",
): ProgressColorBand[] {
  const currentIndex = bands.findIndex((band) => band.id === bandId);

  if (currentIndex === -1) {
    return [...bands];
  }

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= bands.length) {
    return [...bands];
  }

  const nextBands = bands.map((band) => ({ ...band }));
  const [movedBand] = nextBands.splice(currentIndex, 1);
  nextBands.splice(nextIndex, 0, movedBand);
  return nextBands;
}

export function splitProgressColorBand(
  bands: readonly ProgressColorBand[],
): ProgressColorBand[] {
  const normalizedBands = normalizeProgressColorBands(bands);
  const existingIds = new Set(normalizedBands.map((band) => band.id));
  let customIndex = normalizedBands.length + 1;
  const widestBand = normalizedBands.reduce((widest, band) =>
    band.maximumPercent - band.minimumPercent >
    widest.maximumPercent - widest.minimumPercent
      ? band
      : widest,
  );
  const widestIndex = normalizedBands.findIndex(
    (band) => band.id === widestBand.id,
  );

  if (
    widestIndex === -1 ||
    widestBand.maximumPercent - widestBand.minimumPercent < 1
  ) {
    return normalizedBands;
  }

  const splitPoint = Math.floor(
    (widestBand.minimumPercent + widestBand.maximumPercent) / 2,
  );
  const nextBands = normalizedBands.map((band) => ({ ...band }));
  nextBands[widestIndex] = {
    ...widestBand,
    maximumPercent: splitPoint,
  };

  while (existingIds.has(`custom-${customIndex}`)) {
    customIndex += 1;
  }

  nextBands.splice(widestIndex + 1, 0, {
    id: `custom-${customIndex}`,
    minimumPercent: splitPoint + 1,
    maximumPercent: widestBand.maximumPercent,
    colorHex: widestBand.colorHex,
  });
  return nextBands;
}

export function removeProgressColorBand(
  bands: readonly ProgressColorBand[],
  bandId: string,
): ProgressColorBand[] {
  const normalizedBands = normalizeProgressColorBands(bands);

  if (normalizedBands.length <= 1) {
    return normalizedBands;
  }

  const sortedBands = [...normalizedBands].sort(
    (firstBand, secondBand) =>
      firstBand.minimumPercent - secondBand.minimumPercent,
  );
  const removedIndex = sortedBands.findIndex((band) => band.id === bandId);

  if (removedIndex === -1) {
    return normalizedBands;
  }

  const removedBand = sortedBands[removedIndex];

  if (removedIndex === 0) {
    sortedBands[1] = {
      ...sortedBands[1],
      minimumPercent: removedBand.minimumPercent,
    };
  } else {
    sortedBands[removedIndex - 1] = {
      ...sortedBands[removedIndex - 1],
      maximumPercent: removedBand.maximumPercent,
    };
  }

  return sortedBands.filter((band) => band.id !== bandId);
}
