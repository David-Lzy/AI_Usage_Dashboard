import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSurfaceScrollProgress,
  getSurfaceScrollY,
  restoreSurfacePopoverAnchorAfterLayout,
  restoreSurfaceScrollPositionAfterLayout,
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

  it("computes a normalized scroll progress from the active scroll range", () => {
    const documentElement = {
      clientHeight: 400,
      scrollHeight: 1_200,
      scrollTop: 320,
    };
    const body = {
      clientHeight: 400,
      scrollHeight: 1_200,
      scrollTop: 0,
    };

    vi.stubGlobal("window", {
      innerHeight: 400,
      scrollY: 0,
    });
    vi.stubGlobal("document", {
      scrollingElement: documentElement,
      documentElement,
      body,
    });

    expect(getSurfaceScrollProgress()).toBe(0.4);
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

  it("restores by scroll progress before falling back to the absolute scroll position", async () => {
    const documentElement = {
      clientHeight: 500,
      scrollHeight: 1_500,
      scrollTop: 0,
    };
    const body = {
      clientHeight: 500,
      scrollHeight: 1_500,
      scrollTop: 0,
    };
    const scrollTo = vi.fn();

    vi.stubGlobal("window", {
      innerHeight: 500,
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
      scrollTo,
    });
    vi.stubGlobal("document", {
      scrollingElement: documentElement,
      documentElement,
      body,
    });

    await restoreSurfaceScrollPositionAfterLayout({
      scrollProgress: 0.5,
      scrollY: 100,
    });

    expect(scrollTo).toHaveBeenCalledWith({
      top: 500,
      behavior: "auto",
    });
    expect(documentElement.scrollTop).toBe(500);
    expect(body.scrollTop).toBe(500);
  });

  it("restores a tracked popover anchor after layout settles", async () => {
    const scrollIntoView = vi.fn();
    const matchingElement = {
      getAttribute: vi.fn((attribute: string) =>
        attribute === "data-session-popover-id" ? "popup-progress-style" : null,
      ),
      scrollIntoView,
    };

    vi.stubGlobal("window", {
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });
    vi.stubGlobal("document", {
      querySelectorAll: vi.fn(() => [matchingElement]),
    });

    await expect(
      restoreSurfacePopoverAnchorAfterLayout("popup-progress-style"),
    ).resolves.toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "center",
      inline: "nearest",
      behavior: "auto",
    });
  });

  it("retries until a late popover anchor is mounted and visible", async () => {
    const scrollIntoView = vi.fn();
    const getBoundingClientRect = vi
      .fn()
      .mockReturnValueOnce({ bottom: -20, top: -80 })
      .mockReturnValue({ bottom: 220, top: 160 });
    const matchingElement = {
      getAttribute: vi.fn((attribute: string) =>
        attribute === "data-session-popover-id" ? "late-popover" : null,
      ),
      getBoundingClientRect,
      scrollIntoView,
    };
    const querySelectorAll = vi
      .fn()
      .mockReturnValueOnce([])
      .mockReturnValue([matchingElement]);

    vi.stubGlobal("window", {
      innerHeight: 500,
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });
    vi.stubGlobal("document", {
      querySelectorAll,
    });

    await expect(
      restoreSurfacePopoverAnchorAfterLayout("late-popover"),
    ).resolves.toBe(true);
    expect(querySelectorAll).toHaveBeenCalledTimes(3);
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });
});
