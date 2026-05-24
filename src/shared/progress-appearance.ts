import type { ProgressColorBand } from "../providers/types";

export const PROGRESS_THICKNESS_MIN_PX = 1;
export const PROGRESS_THICKNESS_MAX_PX = 20;
export const PROGRESS_THICKNESS_SLIDER_MIN = 0;
export const PROGRESS_THICKNESS_SLIDER_MAX = 1000;
export const PROGRESS_THICKNESS_SLIDER_MIDPOINT = 500;
export const PROGRESS_THICKNESS_SCALE_PIVOT_PX = 10;
export const DEFAULT_PROGRESS_THICKNESS_PX = 10;

const PROGRESS_COLOR_HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const PROGRESS_COLOR_BAND_KEYS = new Set([
  "id",
  "minimumPercent",
  "maximumPercent",
  "colorHex",
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

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneDefaultProgressColorBands(): ProgressColorBand[] {
  return DEFAULT_PROGRESS_COLOR_BANDS.map((band) => ({ ...band }));
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

export function createDefaultProgressColorBands(): ProgressColorBand[] {
  return cloneDefaultProgressColorBands();
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

  if (thicknessPx <= PROGRESS_THICKNESS_SCALE_PIVOT_PX) {
    const ratio =
      Math.log(thicknessPx / PROGRESS_THICKNESS_MIN_PX) /
      Math.log(PROGRESS_THICKNESS_SCALE_PIVOT_PX / PROGRESS_THICKNESS_MIN_PX);

    return Math.round(ratio * PROGRESS_THICKNESS_SLIDER_MIDPOINT);
  }

  const ratio =
    Math.log(thicknessPx / PROGRESS_THICKNESS_SCALE_PIVOT_PX) /
    Math.log(PROGRESS_THICKNESS_MAX_PX / PROGRESS_THICKNESS_SCALE_PIVOT_PX);

  return Math.round(
    PROGRESS_THICKNESS_SLIDER_MIDPOINT +
      ratio *
        (PROGRESS_THICKNESS_SLIDER_MAX -
          PROGRESS_THICKNESS_SLIDER_MIDPOINT),
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

  if (sliderValue <= PROGRESS_THICKNESS_SLIDER_MIDPOINT) {
    const ratio = sliderValue / PROGRESS_THICKNESS_SLIDER_MIDPOINT;

    return normalizeProgressThicknessPx(
      PROGRESS_THICKNESS_MIN_PX *
        Math.exp(
          ratio *
            Math.log(
              PROGRESS_THICKNESS_SCALE_PIVOT_PX /
                PROGRESS_THICKNESS_MIN_PX,
            ),
        ),
    );
  }

  const ratio =
    (sliderValue - PROGRESS_THICKNESS_SLIDER_MIDPOINT) /
    (PROGRESS_THICKNESS_SLIDER_MAX - PROGRESS_THICKNESS_SLIDER_MIDPOINT);

  return normalizeProgressThicknessPx(
    PROGRESS_THICKNESS_SCALE_PIVOT_PX *
      Math.exp(
        ratio *
          Math.log(PROGRESS_THICKNESS_MAX_PX / PROGRESS_THICKNESS_SCALE_PIVOT_PX),
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
