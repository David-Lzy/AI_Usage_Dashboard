import { describe, expect, it } from "vitest";

import {
  installPerformanceDebugCounters,
  isPerformanceDebugEnabled,
} from "./perf-debug";

class FakeElement {
  getBoundingClientRect() {
    return {
      bottom: 1,
      height: 1,
      left: 0,
      right: 1,
      top: 0,
      width: 1,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  }
}

function createWindowLike({ search = "", storageFlag = false } = {}) {
  class FakeResizeObserver {
    callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback([], this as unknown as ResizeObserver);
      void target;
    }

    disconnect() {}

    unobserve() {}
  }

  const windowLike = {
    Element: FakeElement,
    ResizeObserver: FakeResizeObserver,
    location: {
      search,
    },
    document: {
      title: "Test Page",
    },
    localStorage: {
      getItem: (key: string) =>
        key === "aiUsagePerfDebug" && storageFlag ? "1" : null,
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      callback(1);
      return 1;
    },
    setInterval: (handler: TimerHandler) => {
      if (typeof handler === "function") {
        handler();
      }

      return 1;
    },
    setTimeout: (handler: TimerHandler) => {
      if (typeof handler === "function") {
        handler();
      }

      return 1;
    },
  };

  return windowLike as unknown as Window &
    typeof globalThis & {
      __AI_USAGE_PERF_DEBUG__?: {
        snapshot: () => {
          counters: Record<string, { total: number }>;
        };
      };
    };
}

describe("performance debug counters", () => {
  it("stays disabled unless query or storage opts in", () => {
    const windowLike = createWindowLike();

    expect(isPerformanceDebugEnabled(windowLike)).toBe(false);
    expect(installPerformanceDebugCounters(windowLike)).toBe(false);
    expect(windowLike.__AI_USAGE_PERF_DEBUG__).toBeUndefined();
  });

  it("installs lightweight gated counters for common repeated work sources", () => {
    const windowLike = createWindowLike({ search: "?perf=1" });

    expect(installPerformanceDebugCounters(windowLike)).toBe(true);

    windowLike.requestAnimationFrame(() => {});
    windowLike.setInterval(() => {}, 1000);
    windowLike.setTimeout(() => {}, 0);
    new windowLike.ResizeObserver(() => {}).observe(new FakeElement() as Element);
    new windowLike.Element().getBoundingClientRect();

    const snapshot = windowLike.__AI_USAGE_PERF_DEBUG__?.snapshot();

    expect(snapshot?.counters["requestAnimationFrame.scheduled"].total).toBe(1);
    expect(snapshot?.counters["requestAnimationFrame.run"].total).toBe(1);
    expect(snapshot?.counters["setInterval.scheduled"].total).toBe(1);
    expect(snapshot?.counters["setInterval.tick"].total).toBe(1);
    expect(snapshot?.counters["setTimeout.scheduled"].total).toBe(1);
    expect(snapshot?.counters["setTimeout.run"].total).toBe(1);
    expect(snapshot?.counters["ResizeObserver.constructed"].total).toBe(1);
    expect(snapshot?.counters["ResizeObserver.observe"].total).toBe(1);
    expect(snapshot?.counters["ResizeObserver.callback"].total).toBe(1);
    expect(snapshot?.counters["layout.getBoundingClientRect"]).toBeUndefined();
  });

  it("keeps layout read tracing behind an explicit opt-in", () => {
    const windowLike = createWindowLike({ search: "?perf=1&perfLayout=1" });

    expect(installPerformanceDebugCounters(windowLike)).toBe(true);

    new windowLike.Element().getBoundingClientRect();

    const snapshot = windowLike.__AI_USAGE_PERF_DEBUG__?.snapshot();

    expect(snapshot?.counters["layout.getBoundingClientRect"].total).toBe(1);
  });

  it("can expose a compact title summary for live renderer checks", async () => {
    const windowLike = createWindowLike({ search: "?perf=1&perfTitle=1" });

    expect(installPerformanceDebugCounters(windowLike)).toBe(true);

    windowLike.requestAnimationFrame(() => {});
    windowLike.setInterval(() => {}, 1000);
    await Promise.resolve();

    expect(windowLike.document.title).toContain("AI Perf");
  });
});
