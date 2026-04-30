import { describe, expect, it } from "vitest";

import {
  normalizeSyncIntervalMinutes,
  normalizeWarningThresholdPercent,
} from "./settings-preferences";

describe("settings preference normalization", () => {
  it("accepts integer sync intervals inside the supported range", () => {
    expect(normalizeSyncIntervalMinutes(15)).toBe(15);
    expect(normalizeSyncIntervalMinutes("45")).toBe(45);
    expect(normalizeSyncIntervalMinutes(240)).toBe(240);
  });

  it("falls back for unsupported sync intervals", () => {
    expect(normalizeSyncIntervalMinutes(14)).toBe(30);
    expect(normalizeSyncIntervalMinutes(241)).toBe(30);
    expect(normalizeSyncIntervalMinutes(30.5)).toBe(30);
    expect(normalizeSyncIntervalMinutes("soon")).toBe(30);
  });

  it("accepts integer warning thresholds inside the supported range", () => {
    expect(normalizeWarningThresholdPercent(50)).toBe(50);
    expect(normalizeWarningThresholdPercent("85")).toBe(85);
    expect(normalizeWarningThresholdPercent(99)).toBe(99);
  });

  it("falls back for unsupported warning thresholds", () => {
    expect(normalizeWarningThresholdPercent(49)).toBe(80);
    expect(normalizeWarningThresholdPercent(100)).toBe(80);
    expect(normalizeWarningThresholdPercent(80.5)).toBe(80);
    expect(normalizeWarningThresholdPercent("high")).toBe(80);
  });
});
