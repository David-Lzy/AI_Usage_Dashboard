type PerformanceDebugCounter = {
  total: number;
  sources: Record<string, number>;
};

type PerformanceDebugSnapshot = {
  enabled: true;
  generatedAt: string;
  counters: Record<string, PerformanceDebugCounter>;
};

type PerformanceDebugApi = {
  enabled: true;
  reset: () => void;
  snapshot: () => PerformanceDebugSnapshot;
};

type PerformanceDebugWindow = Window &
  typeof globalThis & {
    __AI_USAGE_PERF_DEBUG__?: PerformanceDebugApi;
    __AI_USAGE_PERF_DEBUG_INSTALLED__?: true;
  };

const PERFORMANCE_DEBUG_STORAGE_KEY = "aiUsagePerfDebug";
const PERFORMANCE_LAYOUT_DEBUG_STORAGE_KEY = "aiUsagePerfLayoutDebug";
const PERFORMANCE_TITLE_DEBUG_STORAGE_KEY = "aiUsagePerfTitleDebug";
const PERFORMANCE_NO_EFFECTS_STORAGE_KEY = "aiUsagePerfNoEffects";
const MAX_SOURCES_PER_COUNTER = 24;

function safeGetLocalStorageFlag(win: Window & typeof globalThis): boolean {
  try {
    return win.localStorage?.getItem(PERFORMANCE_DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isPerformanceDebugEnabled(
  win: Window & typeof globalThis = window,
): boolean {
  try {
    const searchParams = new URLSearchParams(win.location.search);

    if (searchParams.get("perf") === "1") {
      return true;
    }
  } catch {
    // Fall through to localStorage.
  }

  return safeGetLocalStorageFlag(win);
}

function isSearchFlagEnabled(
  win: Window & typeof globalThis,
  flagName: string,
): boolean {
  try {
    return new URLSearchParams(win.location.search).get(flagName) === "1";
  } catch {
    return false;
  }
}

function isStorageFlagEnabled(
  win: Window & typeof globalThis,
  storageKey: string,
): boolean {
  try {
    return win.localStorage?.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

function isPerformanceLayoutDebugEnabled(
  win: Window & typeof globalThis,
): boolean {
  return (
    isSearchFlagEnabled(win, "perfLayout") ||
    isStorageFlagEnabled(win, PERFORMANCE_LAYOUT_DEBUG_STORAGE_KEY)
  );
}

function isPerformanceTitleDebugEnabled(
  win: Window & typeof globalThis,
): boolean {
  return (
    isSearchFlagEnabled(win, "perfTitle") ||
    isStorageFlagEnabled(win, PERFORMANCE_TITLE_DEBUG_STORAGE_KEY)
  );
}

function isPerformanceNoEffectsEnabled(
  win: Window & typeof globalThis,
): boolean {
  return (
    isSearchFlagEnabled(win, "perfNoEffects") ||
    isStorageFlagEnabled(win, PERFORMANCE_NO_EFFECTS_STORAGE_KEY)
  );
}

function createSourceLabel(fallback: string): string {
  const stack = new Error().stack;

  if (!stack) {
    return fallback;
  }

  const source = stack
    .split("\n")
    .map((line) => line.trim())
    .find(
      (line) =>
        line.length > 0 &&
        !line.includes("perf-debug") &&
        !line.includes("createSourceLabel"),
    );

  return source?.slice(0, 180) ?? fallback;
}

function createCounterStore() {
  const counters = new Map<string, PerformanceDebugCounter>();

  function increment(name: string, source: string) {
    const counter = counters.get(name) ?? {
      total: 0,
      sources: {},
    };
    const sourceKey =
      Object.hasOwn(counter.sources, source) ||
      Object.keys(counter.sources).length < MAX_SOURCES_PER_COUNTER
        ? source
        : "__other__";

    counter.total += 1;
    counter.sources[sourceKey] = (counter.sources[sourceKey] ?? 0) + 1;
    counters.set(name, counter);
  }

  function snapshot(): PerformanceDebugSnapshot {
    return {
      enabled: true,
      generatedAt: new Date().toISOString(),
      counters: Object.fromEntries(
        Array.from(counters.entries()).map(([name, counter]) => [
          name,
          {
            total: counter.total,
            sources: { ...counter.sources },
          },
        ]),
      ),
    };
  }

  function reset() {
    counters.clear();
  }

  return {
    increment,
    reset,
    snapshot,
  };
}

function installTitleSummary(
  win: Window & typeof globalThis,
  counterStore: ReturnType<typeof createCounterStore>,
) {
  if (!isPerformanceTitleDebugEnabled(win)) {
    return;
  }

  const baseTitle = win.document?.title || "AI Usage Dashboard";
  const previousTotals = new Map<string, number>();

  function summarize() {
    const snapshot = counterStore.snapshot();
    const summary = Object.entries(snapshot.counters)
      .map(([name, counter]) => {
        const previousTotal = previousTotals.get(name) ?? counter.total;
        const delta = counter.total - previousTotal;
        previousTotals.set(name, counter.total);

        return {
          name,
          delta,
          total: counter.total,
        };
      })
      .sort((left, right) => right.delta - left.delta)
      .slice(0, 4)
      .map(({ name, delta, total }) => `${name}:${delta}/2s(${total})`)
      .join(" | ");

    win.document.title = summary
      ? `AI Perf ${summary}`
      : `AI Perf idle - ${baseTitle}`;
  }

  summarize();
  win.setInterval(summarize, 2000);
}

function installNoEffectsStyles(win: Window & typeof globalThis) {
  if (!isPerformanceNoEffectsEnabled(win) || !win.document?.head) {
    return;
  }

  const style = win.document.createElement("style");
  style.dataset.aiUsagePerfNoEffects = "true";
  style.textContent = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
  `;
  win.document.head.append(style);
}

export function installPerformanceDebugCounters(
  win: Window & typeof globalThis = window,
): boolean {
  const debugWindow = win as PerformanceDebugWindow;

  if (
    !isPerformanceDebugEnabled(win) ||
    debugWindow.__AI_USAGE_PERF_DEBUG_INSTALLED__
  ) {
    return false;
  }

  const counterStore = createCounterStore();

  installNoEffectsStyles(win);

  if (typeof win.requestAnimationFrame === "function") {
    const originalRequestAnimationFrame = win.requestAnimationFrame.bind(win);

    win.requestAnimationFrame = ((callback: FrameRequestCallback): number => {
      const source = createSourceLabel("requestAnimationFrame");
      counterStore.increment("requestAnimationFrame.scheduled", source);

      return originalRequestAnimationFrame((time) => {
        counterStore.increment("requestAnimationFrame.run", source);
        callback(time);
      });
    }) as typeof win.requestAnimationFrame;
  }

  if (typeof win.setInterval === "function") {
    const originalSetInterval = win.setInterval.bind(win);

    win.setInterval = ((
      handler: TimerHandler,
      timeout?: number,
      ...args: unknown[]
    ): number => {
      const source = createSourceLabel("setInterval");
      counterStore.increment("setInterval.scheduled", source);

      if (typeof handler !== "function") {
        return originalSetInterval(handler, timeout, ...args);
      }

      return originalSetInterval(
        (...handlerArgs: unknown[]) => {
          counterStore.increment("setInterval.tick", source);
          handler(...handlerArgs);
        },
        timeout,
        ...args,
      );
    }) as typeof win.setInterval;
  }

  if (typeof win.setTimeout === "function") {
    const originalSetTimeout = win.setTimeout.bind(win);

    win.setTimeout = ((
      handler: TimerHandler,
      timeout?: number,
      ...args: unknown[]
    ): number => {
      const source = createSourceLabel("setTimeout");
      counterStore.increment("setTimeout.scheduled", source);

      if (typeof handler !== "function") {
        return originalSetTimeout(handler, timeout, ...args);
      }

      return originalSetTimeout(
        (...handlerArgs: unknown[]) => {
          counterStore.increment("setTimeout.run", source);
          handler(...handlerArgs);
        },
        timeout,
        ...args,
      );
    }) as typeof win.setTimeout;
  }

  if (typeof win.ResizeObserver === "function") {
    const OriginalResizeObserver = win.ResizeObserver;

    win.ResizeObserver = class PerformanceDebugResizeObserver extends OriginalResizeObserver {
      readonly #source: string;

      constructor(callback: ResizeObserverCallback) {
        const source = createSourceLabel("ResizeObserver");
        counterStore.increment("ResizeObserver.constructed", source);
        super((entries, observer) => {
          counterStore.increment("ResizeObserver.callback", source);
          callback(entries, observer);
        });
        this.#source = source;
      }

      observe(target: Element, options?: ResizeObserverOptions): void {
        counterStore.increment("ResizeObserver.observe", this.#source);
        super.observe(target, options);
      }
    };
  }

  if (isPerformanceLayoutDebugEnabled(win) && typeof win.Element === "function") {
    const originalGetBoundingClientRect =
      win.Element.prototype.getBoundingClientRect;

    win.Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
      counterStore.increment(
        "layout.getBoundingClientRect",
        createSourceLabel("getBoundingClientRect"),
      );

      return originalGetBoundingClientRect.call(this);
    };
  }

  debugWindow.__AI_USAGE_PERF_DEBUG_INSTALLED__ = true;
  debugWindow.__AI_USAGE_PERF_DEBUG__ = {
    enabled: true,
    reset: counterStore.reset,
    snapshot: counterStore.snapshot,
  };
  installTitleSummary(win, counterStore);

  return true;
}
