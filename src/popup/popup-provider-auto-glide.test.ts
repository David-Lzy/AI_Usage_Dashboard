import { describe, expect, it } from "vitest";

import {
  normalizePopupProviderWheelDelta,
  resolveCircularAutoGlideViewportHeight,
  rotateCircularItems,
} from "./popup-provider-auto-glide";

describe("popup provider circular auto glide", () => {
  it("rotates the last provider directly back to the first in either direction", () => {
    const providers = ["claude", "codex", "sub2api"];

    expect(rotateCircularItems(providers, "next")).toEqual([
      "codex",
      "sub2api",
      "claude",
    ]);
    expect(rotateCircularItems(providers, "previous")).toEqual([
      "sub2api",
      "claude",
      "codex",
    ]);
  });

  it("keeps the viewport short enough to avoid a blank tail while recycling", () => {
    expect(resolveCircularAutoGlideViewportHeight(620, 240)).toBe(360);
    expect(resolveCircularAutoGlideViewportHeight(500, 260)).toBe(240);
    expect(resolveCircularAutoGlideViewportHeight(0, 260)).toBe(0);
  });

  it("normalizes pixel, line, and page wheel input to a bounded manual step", () => {
    expect(
      normalizePopupProviderWheelDelta(
        { deltaMode: 0, deltaY: 42 },
        320,
      ),
    ).toBe(42);
    expect(
      normalizePopupProviderWheelDelta(
        { deltaMode: 1, deltaY: 3 },
        320,
      ),
    ).toBe(48);
    expect(
      normalizePopupProviderWheelDelta(
        { deltaMode: 2, deltaY: -1 },
        320,
      ),
    ).toBe(-96);
  });
});
