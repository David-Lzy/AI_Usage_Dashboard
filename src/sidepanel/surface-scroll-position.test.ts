import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSurfaceScrollY,
  restoreSurfaceScrollYAfterLayout,
} from "./surface-scroll-position";

describe("surface scroll position", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reads the real document scroll position when window.scrollY is stale", () => {
    const documentElement = { scrollTop: 384 };
    const body = { scrollTop: 128 };

    vi.stubGlobal("window", {
      scrollY: 0,
    });
    vi.stubGlobal("document", {
      scrollingElement: documentElement,
      documentElement,
      body,
    });

    expect(getSurfaceScrollY()).toBe(384);
  });

  it("restores both window and document scroll positions after layout settles", async () => {
    const documentElement = { scrollTop: 0 };
    const body = { scrollTop: 0 };
    const scrollTo = vi.fn();

    vi.stubGlobal("window", {
      scrollTo,
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });
    vi.stubGlobal("document", {
      scrollingElement: documentElement,
      documentElement,
      body,
    });

    await restoreSurfaceScrollYAfterLayout(512);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 512,
      behavior: "auto",
    });
    expect(documentElement.scrollTop).toBe(512);
    expect(body.scrollTop).toBe(512);
  });
});
