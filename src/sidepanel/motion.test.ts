import { describe, expect, it } from "vitest";

import { getPreferredScrollBehavior, prefersReducedMotion } from "./motion";

describe("motion helpers", () => {
  it("defaults to motion-safe behavior when matchMedia is unavailable", () => {
    expect(prefersReducedMotion(undefined)).toBe(false);
    expect(getPreferredScrollBehavior(undefined)).toBe("smooth");
  });

  it("uses reduced-motion behavior when the media query matches", () => {
    const reader = {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
      }),
    };

    expect(prefersReducedMotion(reader)).toBe(true);
    expect(getPreferredScrollBehavior(reader)).toBe("auto");
    expect(prefersReducedMotion(reader, "full")).toBe(false);
    expect(getPreferredScrollBehavior(reader, "full")).toBe("smooth");
  });

  it("keeps smooth scrolling when reduced motion does not match", () => {
    const reader = {
      matchMedia: () => ({
        matches: false,
      }),
    };

    expect(prefersReducedMotion(reader)).toBe(false);
    expect(getPreferredScrollBehavior(reader)).toBe("smooth");
    expect(prefersReducedMotion(reader, "reduced")).toBe(true);
    expect(getPreferredScrollBehavior(reader, "reduced")).toBe("auto");
  });
});
