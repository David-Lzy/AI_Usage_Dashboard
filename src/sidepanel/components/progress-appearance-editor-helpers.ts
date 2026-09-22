import type { ProgressColorBand, ProgressGradientStop } from "../../providers/types";
import {
  PROGRESS_THICKNESS_MAX_PX,
  PROGRESS_THICKNESS_MIN_PX,
  normalizeProgressThicknessPx,
} from "../../shared/progress-appearance";

export type ProgressColorBandDraft = {
  id: string;
  minimumPercent: string;
  maximumPercent: string;
  colorHex: string;
};

export function formatThicknessDraft(thicknessPx: number): string {
  return String(normalizeProgressThicknessPx(thicknessPx));
}

export function hasValidThicknessDraftShape(value: string): boolean {
  return /^\d*(?:\.\d{0,2})?$/.test(value);
}

export function parseCompleteThicknessDraft(value: string): number | null {
  if (
    value.length === 0 ||
    value.endsWith(".") ||
    !/^\d+(?:\.\d{1,2})?$/.test(value)
  ) {
    return null;
  }

  const parsedValue = Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < PROGRESS_THICKNESS_MIN_PX ||
    parsedValue > PROGRESS_THICKNESS_MAX_PX
  ) {
    return null;
  }

  return normalizeProgressThicknessPx(parsedValue);
}

export function toDraftBands(
  colorBands: readonly ProgressColorBand[],
): ProgressColorBandDraft[] {
  return colorBands.map((band) => ({
    id: band.id,
    minimumPercent: String(band.minimumPercent),
    maximumPercent: String(band.maximumPercent),
    colorHex: band.colorHex,
  }));
}

export function parseDraftBands(
  draftBands: readonly ProgressColorBandDraft[],
): ProgressColorBand[] | null {
  const parsedBands = draftBands.map((band) => {
    const minimumDraft = band.minimumPercent.trim();
    const maximumDraft = band.maximumPercent.trim();

    if (minimumDraft.length === 0 || maximumDraft.length === 0) {
      return null;
    }

    const minimumPercent = Number(minimumDraft);
    const maximumPercent = Number(maximumDraft);

    if (!Number.isInteger(minimumPercent) || !Number.isInteger(maximumPercent)) {
      return null;
    }

    return {
      id: band.id,
      minimumPercent,
      maximumPercent,
      colorHex: band.colorHex.trim(),
    };
  });

  if (parsedBands.some((band) => band === null)) {
    return null;
  }

  return parsedBands as ProgressColorBand[];
}

export function normalizeColorDraft(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidColorInput(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function roundGradientStopPosition(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function clampGradientStopPosition(value: number): number {
  return Math.min(99.99, Math.max(0.01, roundGradientStopPosition(value)));
}

export function isGradientEndpointStop(stop: ProgressGradientStop): boolean {
  return stop.positionPercent === 0 || stop.positionPercent === 100;
}

export function findAvailableGradientStopPosition(
  positionPercent: number,
  stops: readonly ProgressGradientStop[],
  ignoredStopId?: string,
): number {
  const usedPositions = new Set(
    stops
      .filter((stop) => stop.id !== ignoredStopId)
      .map((stop) => stop.positionPercent),
  );
  const preferredPosition = clampGradientStopPosition(positionPercent);

  if (!usedPositions.has(preferredPosition)) {
    return preferredPosition;
  }

  for (let offset = 1; offset <= 9999; offset += 1) {
    const forwardPosition = roundGradientStopPosition(
      preferredPosition + offset / 100,
    );

    if (forwardPosition <= 99.99 && !usedPositions.has(forwardPosition)) {
      return forwardPosition;
    }

    const backwardPosition = roundGradientStopPosition(
      preferredPosition - offset / 100,
    );

    if (backwardPosition >= 0.01 && !usedPositions.has(backwardPosition)) {
      return backwardPosition;
    }
  }

  return preferredPosition;
}

export function createGradientStopId(
  stops: readonly ProgressGradientStop[],
): string {
  const existingIds = new Set(stops.map((stop) => stop.id));
  let customIndex = stops.length + 1;

  while (existingIds.has(`stop-${customIndex}`)) {
    customIndex += 1;
  }

  return `stop-${customIndex}`;
}

export function buildGradientTrackBackground(
  stops: readonly ProgressGradientStop[],
): string {
  return `linear-gradient(90deg, ${stops
    .map((stop) => `${stop.colorHex} ${stop.positionPercent}%`)
    .join(", ")})`;
}

export const PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PERCENT = 5;
export const PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PX = 16;

export function shouldSkipGradientStopCreation({
  positionPercent,
  stops,
  trackWidthPx,
}: {
  positionPercent: number;
  stops: readonly ProgressGradientStop[];
  trackWidthPx: number;
}): boolean {
  const pixelThresholdPercent =
    trackWidthPx > 0
      ? (PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PX / trackWidthPx) * 100
      : 0;
  const thresholdPercent = Math.max(
    PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PERCENT,
    pixelThresholdPercent,
  );

  return stops.some(
    (stop) =>
      Math.abs(stop.positionPercent - positionPercent) < thresholdPercent,
  );
}

export function resolveGradientStopDragPosition({
  currentClientX,
  initialClientX,
  initialPositionPercent,
  trackWidthPx,
}: {
  currentClientX: number;
  initialClientX: number;
  initialPositionPercent: number;
  trackWidthPx: number;
}): number {
  if (!Number.isFinite(trackWidthPx) || trackWidthPx <= 0) {
    return clampGradientStopPosition(initialPositionPercent);
  }

  const deltaPercent = ((currentClientX - initialClientX) / trackWidthPx) * 100;

  return clampGradientStopPosition(initialPositionPercent + deltaPercent);
}
