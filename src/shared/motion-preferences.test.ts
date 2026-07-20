import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_MOTION_MODE,
  MOTION_MODE_OPTIONS,
  normalizeMotionMode,
  resolveMotionMode,
} from "./motion-preferences";

const tokensCss = readFileSync(
  new URL("../sidepanel/theme/tokens.css", import.meta.url),
  "utf8",
);

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

  it("lets explicit modes override the operating-system preference", () => {
    const reducedMotionReader = {
      matchMedia: () => ({ matches: true }),
    };

    expect(resolveMotionMode("full", reducedMotionReader)).toBe("full");
    expect(
      resolveMotionMode("reduced", {
        matchMedia: () => ({ matches: false }),
      }),
    ).toBe("reduced");
    expect(resolveMotionMode("system", reducedMotionReader)).toBe("reduced");
    expect(
      resolveMotionMode("system", {
        matchMedia: () => ({ matches: false }),
      }),
    ).toBe("full");
  });

  it("uses one resolved root state to reduce all CSS motion", () => {
    expect(tokensCss).toContain(':root[data-motion-resolved="full"]');
    expect(tokensCss).toContain("--app-motion-distance-3: 18px;");
    expect(tokensCss).toContain(':root[data-motion-resolved="reduced"] *');
    expect(tokensCss).toContain("--app-motion-distance-3: 0px;");
    expect(tokensCss).toContain("animation-duration: 0.001ms !important;");
    expect(tokensCss).toContain("transition-duration: 0.001ms !important;");
    expect(tokensCss).toContain("scroll-behavior: auto !important;");
    expect(tokensCss).not.toContain("@media (prefers-reduced-motion: reduce)");
  });
});
