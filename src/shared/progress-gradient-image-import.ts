import type { ProgressGradientStop } from "../providers/types";
import { normalizeProgressGradientStops } from "./progress-appearance";

export const PROGRESS_GRADIENT_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
export const PROGRESS_GRADIENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROGRESS_GRADIENT_IMAGE_MAX_DIMENSION_PX = 1024;
export const PROGRESS_GRADIENT_IMAGE_MAX_STOPS = 8;

export type ProgressGradientImageImportErrorCode =
  | "unsupported_type"
  | "file_too_large"
  | "decode_failed"
  | "canvas_unavailable";

export class ProgressGradientImageImportError extends Error {
  readonly code: ProgressGradientImageImportErrorCode;

  constructor(code: ProgressGradientImageImportErrorCode) {
    super(code);
    this.name = "ProgressGradientImageImportError";
    this.code = code;
  }
}

type ImageDataLike = {
  width: number;
  height: number;
  data: Uint8ClampedArray | readonly number[];
};

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function toHexPair(value: number): string {
  return clampChannel(value).toString(16).padStart(2, "0").toUpperCase();
}

function formatColorHex(red: number, green: number, blue: number): string {
  return `#${toHexPair(red)}${toHexPair(green)}${toHexPair(blue)}`;
}

function averageColumnColor(imageData: ImageDataLike, x: number): string {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alphaWeight = 0;

  for (let y = 0; y < imageData.height; y += 1) {
    const offset = (y * imageData.width + x) * 4;
    const alpha = (imageData.data[offset + 3] ?? 255) / 255;

    red += (imageData.data[offset] ?? 0) * alpha;
    green += (imageData.data[offset + 1] ?? 0) * alpha;
    blue += (imageData.data[offset + 2] ?? 0) * alpha;
    alphaWeight += alpha;
  }

  if (alphaWeight <= 0) {
    return "#000000";
  }

  return formatColorHex(red / alphaWeight, green / alphaWeight, blue / alphaWeight);
}

function normalizeStopCount(value: number): number {
  if (!Number.isFinite(value)) {
    return PROGRESS_GRADIENT_IMAGE_MAX_STOPS;
  }

  return Math.min(
    PROGRESS_GRADIENT_IMAGE_MAX_STOPS,
    Math.max(2, Math.round(value)),
  );
}

export function createProgressGradientStopsFromImageData(
  imageData: ImageDataLike,
  stopCount = PROGRESS_GRADIENT_IMAGE_MAX_STOPS,
): ProgressGradientStop[] {
  if (
    !Number.isInteger(imageData.width) ||
    !Number.isInteger(imageData.height) ||
    imageData.width <= 0 ||
    imageData.height <= 0 ||
    imageData.data.length < imageData.width * imageData.height * 4
  ) {
    throw new ProgressGradientImageImportError("decode_failed");
  }

  const normalizedStopCount = normalizeStopCount(
    Math.min(stopCount, imageData.width),
  );
  const stops = Array.from({ length: normalizedStopCount }, (_, index) => {
    const positionPercent =
      normalizedStopCount === 1
        ? 0
        : Math.round((index / (normalizedStopCount - 1)) * 10000) / 100;
    const x =
      normalizedStopCount === 1
        ? 0
        : Math.round((index / (normalizedStopCount - 1)) * (imageData.width - 1));

    return {
      id: `image-${index + 1}`,
      positionPercent,
      colorHex: averageColumnColor(imageData, x),
    };
  });

  return normalizeProgressGradientStops(stops);
}

export function validateProgressGradientImageFile(file: File): void {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new ProgressGradientImageImportError("unsupported_type");
  }

  if (file.size > PROGRESS_GRADIENT_IMAGE_MAX_BYTES) {
    throw new ProgressGradientImageImportError("file_too_large");
  }
}

function getScaledImageSize(width: number, height: number) {
  const scale = Math.min(
    1,
    PROGRESS_GRADIENT_IMAGE_MAX_DIMENSION_PX / Math.max(width, height),
  );

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function createProgressGradientStopsFromImageFile(
  file: File,
): Promise<ProgressGradientStop[]> {
  validateProgressGradientImageFile(file);

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    throw new ProgressGradientImageImportError("canvas_unavailable");
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const { width, height } = getScaledImageSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new ProgressGradientImageImportError("canvas_unavailable");
    }

    context.drawImage(bitmap, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    return createProgressGradientStopsFromImageData(imageData);
  } catch (error) {
    if (error instanceof ProgressGradientImageImportError) {
      throw error;
    }

    throw new ProgressGradientImageImportError("decode_failed");
  } finally {
    bitmap?.close();
  }
}
