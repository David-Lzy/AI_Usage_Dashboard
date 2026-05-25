import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PROGRESS_GRADIENT_IMAGE_MAX_BYTES,
  ProgressGradientImageImportError,
  createProgressGradientStopsFromImageFile,
  createProgressGradientStopsFromImageData,
  validateProgressGradientImageFile,
} from "./progress-gradient-image-import";

describe("progress gradient image import", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("averages image columns vertically into normalized editable stops", () => {
    const stops = createProgressGradientStopsFromImageData(
      {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 0, 0, 255, 0, 255, 0, 255,
          0, 0, 255, 255, 255, 255, 255, 255,
        ]),
      },
      2,
    );

    expect(stops).toEqual([
      {
        id: "image-1",
        positionPercent: 0,
        colorHex: "#800080",
      },
      {
        id: "image-2",
        positionPercent: 100,
        colorHex: "#80FF80",
      },
    ]);
  });

  it("bounds generated image stops to a small editable set", () => {
    const data = new Uint8ClampedArray(24 * 1 * 4).fill(255);
    const stops = createProgressGradientStopsFromImageData({
      width: 24,
      height: 1,
      data,
    });

    expect(stops).toHaveLength(8);
    expect(stops[0]?.positionPercent).toBe(0);
    expect(stops[7]?.positionPercent).toBe(100);
  });

  it("rejects unsupported or oversized files before decoding", () => {
    expect(() =>
      validateProgressGradientImageFile(
        new File(["text"], "note.txt", { type: "text/plain" }),
      ),
    ).toThrow(ProgressGradientImageImportError);
    expect(() =>
      validateProgressGradientImageFile(
        new File([new Uint8Array(PROGRESS_GRADIENT_IMAGE_MAX_BYTES + 1)], "big.png", {
          type: "image/png",
        }),
      ),
    ).toThrow(ProgressGradientImageImportError);
  });

  it("closes decoded bitmaps when canvas work fails", async () => {
    const close = vi.fn();

    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 2,
        height: 2,
        close,
      }) as unknown as ImageBitmap),
    );
    vi.stubGlobal("document", {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage: () => {
            throw new Error("draw failed");
          },
          getImageData: vi.fn(),
        }),
      }),
    });

    await expect(
      createProgressGradientStopsFromImageFile(
        new File(["image"], "gradient.png", { type: "image/png" }),
      ),
    ).rejects.toMatchObject({
      code: "decode_failed",
    });

    expect(close).toHaveBeenCalledTimes(1);
  });
});
