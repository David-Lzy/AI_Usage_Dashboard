import { describe, expect, it } from "vitest";

import {
  DEFAULT_MOTION_MODE,
  MOTION_MODE_OPTIONS,
  normalizeMotionMode,
} from "./motion-preferences";

describe("motion preferences", () => {
  it("keeps full motion as the default mode", () => {
    expect(DEFAULT_MOTION_MODE).toBe("full");
  });

  it("exposes motion options in settings display order", () => {
    expect(MOTION_MODE_OPTIONS.map((option) => option.value)).toEqual([
      "system",
      "full",
      "reduced",
    ]);
  });

  it("preserves supported motion modes", () => {
    expect(normalizeMotionMode("system")).toBe("system");
    expect(normalizeMotionMode("full")).toBe("full");
    expect(normalizeMotionMode("reduced")).toBe("reduced");
  });

  it("falls back to the default for unsupported values", () => {
    expect(normalizeMotionMode("animated")).toBe(DEFAULT_MOTION_MODE);
    expect(normalizeMotionMode("")).toBe(DEFAULT_MOTION_MODE);
    expect(normalizeMotionMode(null)).toBe(DEFAULT_MOTION_MODE);
    expect(normalizeMotionMode(undefined)).toBe(DEFAULT_MOTION_MODE);
    expect(normalizeMotionMode({ value: "reduced" })).toBe(
      DEFAULT_MOTION_MODE,
    );
  });
});
