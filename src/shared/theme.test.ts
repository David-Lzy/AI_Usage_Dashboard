import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_THEME_SETTINGS,
  buildCustomThemePalette,
  applyThemeSettings,
  applyThemeMode,
  buildQuickThemeToggle,
  getMillisecondsUntilNextTimeThemeBoundary,
  normalizeThemeCustomSeedHex,
  normalizeThemeSettings,
  normalizeThemePreset,
  normalizeThemeMode,
  resolveThemeMode,
  resolveTimeThemeMode,
  startThemeSettingsSync,
  startThemeModeSync,
} from "./theme";

describe("theme helpers", () => {
  it("normalizes unsupported theme values back to system", () => {
    expect(normalizeThemeMode("system")).toBe("system");
    expect(normalizeThemeMode("light")).toBe("light");
    expect(normalizeThemeMode("dark")).toBe("dark");
    expect(normalizeThemeMode("time")).toBe("time");
    expect(normalizeThemeMode("unexpected")).toBe("system");
  });

  it("normalizes unsupported theme presets back to default", () => {
    expect(normalizeThemePreset("default")).toBe("default");
    expect(normalizeThemePreset("meadow")).toBe("meadow");
    expect(normalizeThemePreset("sunset")).toBe("sunset");
    expect(normalizeThemePreset("custom")).toBe("custom");
    expect(normalizeThemePreset("unexpected")).toBe("default");
  });

  it("normalizes theme custom seed hex values into canonical #RRGGBB", () => {
    expect(normalizeThemeCustomSeedHex("#4f46e5")).toBe("#4F46E5");
    expect(normalizeThemeCustomSeedHex("4f46e5")).toBe("#4F46E5");
    expect(normalizeThemeCustomSeedHex("#abc")).toBe("#AABBCC");
    expect(normalizeThemeCustomSeedHex("not-a-color")).toBeNull();
  });

  it("normalizes theme settings as one shared object", () => {
    expect(normalizeThemeSettings(undefined)).toEqual(DEFAULT_THEME_SETTINGS);
    expect(
      normalizeThemeSettings({
        themeMode: "dark",
        themePreset: "sunset",
        themeCustomSeedHex: "#4f46e5",
        uiFontFamily: "serif",
        motionMode: "reduced",
      }),
    ).toEqual({
      themeMode: "dark",
      themePreset: "sunset",
      themeCustomSeedHex: "#4F46E5",
      uiFontFamily: "serif",
      motionMode: "reduced",
    });
    expect(
      normalizeThemeSettings({
        themeMode: "unexpected" as never,
        themePreset: "unexpected" as never,
        themeCustomSeedHex: "bad-value",
        uiFontFamily: "unexpected" as never,
        motionMode: "unexpected" as never,
      }),
    ).toEqual(DEFAULT_THEME_SETTINGS);
  });

  it("builds a custom theme palette with distinct role colors", () => {
    const lightPalette = buildCustomThemePalette("#4F46E5", "light");
    const darkPalette = buildCustomThemePalette("#4F46E5", "dark");

    expect(lightPalette.primary).toBe("#4F46E5");
    expect(lightPalette.secondaryContainer).not.toBe(lightPalette.primary);
    expect(lightPalette.tertiary).not.toBe(lightPalette.primary);
    expect(darkPalette.primary).not.toBe(lightPalette.primary);
    expect(darkPalette.primaryContainer).not.toBe(lightPalette.primaryContainer);
  });

  it("resolves system mode from prefers-color-scheme", () => {
    expect(
      resolveThemeMode("system", {
        matchMedia: () => ({ matches: true }),
      }),
    ).toBe("dark");
    expect(
      resolveThemeMode("system", {
        matchMedia: () => ({ matches: false }),
      }),
    ).toBe("light");
  });

  it("resolves time mode from the device local clock", () => {
    expect(resolveTimeThemeMode(new Date(2026, 6, 14, 6, 59))).toBe("dark");
    expect(resolveTimeThemeMode(new Date(2026, 6, 14, 7, 0))).toBe("light");
    expect(resolveTimeThemeMode(new Date(2026, 6, 14, 18, 59))).toBe("light");
    expect(resolveTimeThemeMode(new Date(2026, 6, 14, 19, 0))).toBe("dark");
    expect(
      resolveThemeMode("time", {
        now: () => new Date(2026, 6, 14, 12, 0),
      }),
    ).toBe("light");
    expect(
      getMillisecondsUntilNextTimeThemeBoundary(
        new Date(2026, 6, 14, 18, 0),
      ),
    ).toBe(60 * 60 * 1_000);
  });

  it("cycles the quick theme action across all four modes", () => {
    expect(buildQuickThemeToggle("light")).toEqual({
      nextMode: "dark",
      label: "Dark",
      title: "Switch to dark mode",
    });
    expect(buildQuickThemeToggle("dark")).toEqual({
      nextMode: "system",
      label: "System",
      title: "Switch to system mode",
    });
    expect(buildQuickThemeToggle("system")).toEqual({
      nextMode: "time",
      label: "Time",
      title: "Switch to time mode",
    });
    expect(buildQuickThemeToggle("time")).toEqual({
      nextMode: "light",
      label: "Light",
      title: "Switch to light mode",
    });
  });

  it("applies explicit theme metadata to the root", () => {
    const root: {
      dataset: Record<string, string | undefined>;
      style: { colorScheme?: string };
    } = {
      dataset: {},
      style: {},
    };

    const resolved = applyThemeMode("dark", root);

    expect(resolved).toBe("dark");
    expect(root.dataset.themeMode).toBe("dark");
    expect(root.dataset.themeResolved).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
  });

  it("applies explicit theme preset metadata to the root", () => {
    const root: {
      dataset: Record<string, string | undefined>;
      style: { colorScheme?: string };
    } = {
      dataset: {},
      style: {},
    };

    const resolved = applyThemeSettings(
      {
        themeMode: "light",
        themePreset: "meadow",
        themeCustomSeedHex: null,
      },
      root,
    );

    expect(resolved).toBe("light");
    expect(root.dataset.themeMode).toBe("light");
    expect(root.dataset.themePreset).toBe("meadow");
    expect(root.dataset.themeResolved).toBe("light");
    expect(root.dataset.uiFontFamily).toBe("default");
    expect(root.dataset.motionMode).toBe("full");
    expect(root.dataset.motionResolved).toBe("full");
    expect(root.style.colorScheme).toBe("light");
  });

  it("publishes the effective motion state without letting the system override On", () => {
    const root: {
      dataset: Record<string, string | undefined>;
      style: { colorScheme?: string };
    } = { dataset: {}, style: {} };
    const reader = {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
      }),
    };

    applyThemeSettings(
      { themeMode: "light", motionMode: "full" },
      root,
      reader,
    );
    expect(root.dataset.motionMode).toBe("full");
    expect(root.dataset.motionResolved).toBe("full");

    applyThemeSettings(
      { themeMode: "light", motionMode: "system" },
      root,
      reader,
    );
    expect(root.dataset.motionMode).toBe("system");
    expect(root.dataset.motionResolved).toBe("reduced");
  });

  it("tracks live system motion changes only in Follow System mode", () => {
    const root: {
      dataset: Record<string, string | undefined>;
      style: { colorScheme?: string };
    } = { dataset: {}, style: {} };
    let reducedMotion = false;
    let triggerChange = () => {};
    const stop = startThemeSettingsSync(
      { themeMode: "light", motionMode: "system" },
      root,
      {
        matchMedia: (query: string) => ({
          get matches() {
            return (
              query === "(prefers-reduced-motion: reduce)" && reducedMotion
            );
          },
          addEventListener: (_type, listener) => {
            triggerChange = listener;
          },
          removeEventListener: (_type, listener) => {
            if (triggerChange === listener) {
              triggerChange = () => {};
            }
          },
        }),
      },
    );

    expect(root.dataset.motionResolved).toBe("full");
    reducedMotion = true;
    triggerChange();
    expect(root.dataset.motionResolved).toBe("reduced");

    stop();
    reducedMotion = false;
    triggerChange();
    expect(root.dataset.motionResolved).toBe("reduced");
  });

  it("applies UI font family metadata and typography variables to the root", () => {
    const properties = new Map<string, string>();
    const root: {
      dataset: Record<string, string | undefined>;
      style: {
        colorScheme?: string;
        setProperty: (property: string, value: string) => void;
        removeProperty: (property: string) => void;
      };
    } = {
      dataset: {},
      style: {
        setProperty: (property, value) => {
          properties.set(property, value);
        },
        removeProperty: (property) => {
          properties.delete(property);
        },
      },
    };

    applyThemeSettings(
      {
        themeMode: "light",
        themePreset: "default",
        themeCustomSeedHex: null,
        uiFontFamily: "mono",
      },
      root,
    );

    expect(root.dataset.uiFontFamily).toBe("mono");
    expect(properties.get("--md-sys-typescale-body-large-font")).toContain(
      "SFMono-Regular",
    );
    expect(properties.get("--md-sys-typescale-label-large-font")).toContain(
      "SFMono-Regular",
    );
  });

  it("applies custom theme palette metadata and css variables to the root", () => {
    const properties = new Map<string, string>();
    const root: {
      dataset: Record<string, string | undefined>;
      style: {
        colorScheme?: string;
        setProperty: (property: string, value: string) => void;
        removeProperty: (property: string) => void;
      };
    } = {
      dataset: {},
      style: {
        setProperty: (property, value) => {
          properties.set(property, value);
        },
        removeProperty: (property) => {
          properties.delete(property);
        },
      },
    };

    const resolved = applyThemeSettings(
      {
        themeMode: "light",
        themePreset: "custom",
        themeCustomSeedHex: "#4F46E5",
      },
      root,
    );

    expect(resolved).toBe("light");
    expect(root.dataset.themePreset).toBe("custom");
    expect(root.dataset.themeCustomSeedHex).toBe("#4F46E5");
    expect(properties.get("--md-sys-color-primary")).toBe("#4F46E5");
    expect(properties.get("--md-sys-color-secondary-container")).toBeTruthy();
  });

  it("subscribes to system theme changes only for system mode", () => {
    const root: {
      dataset: Record<string, string | undefined>;
      style: { colorScheme?: string };
    } = {
      dataset: {},
      style: {},
    };
    let triggerChange = () => {};
    let darkMode = false;
    const stop = startThemeModeSync("system", root, {
      matchMedia: () => ({
        get matches() {
          return darkMode;
        },
        addEventListener: (_type, nextListener: () => void) => {
          triggerChange = nextListener;
        },
        removeEventListener: (_type, nextListener: () => void) => {
          if (triggerChange === nextListener) {
            triggerChange = () => {};
          }
        },
      }),
    });

    expect(root.dataset.themeResolved).toBe("light");
    darkMode = true;
    triggerChange();
    expect(root.dataset.themeResolved).toBe("dark");

    stop();
    expect(triggerChange).not.toBeNull();
  });

  it("reschedules time mode only at the next local boundary", () => {
    vi.useFakeTimers();
    try {
      const root: {
        dataset: Record<string, string | undefined>;
        style: { colorScheme?: string };
      } = { dataset: {}, style: {} };
      let currentTime = new Date(2026, 6, 14, 18, 59, 59);
      const stop = startThemeModeSync("time", root, {
        now: () => currentTime,
      });

      expect(root.dataset.themeResolved).toBe("light");
      currentTime = new Date(2026, 6, 14, 19, 0, 0);
      vi.advanceTimersByTime(1_050);
      expect(root.dataset.themeResolved).toBe("dark");

      stop();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps theme preset metadata while system theme changes", () => {
    const root: {
      dataset: Record<string, string | undefined>;
      style: { colorScheme?: string };
    } = {
      dataset: {},
      style: {},
    };
    let triggerChange = () => {};
    let darkMode = false;
    const stop = startThemeSettingsSync(
      {
        themeMode: "system",
        themePreset: "sunset",
        themeCustomSeedHex: null,
      },
      root,
      {
        matchMedia: () => ({
          get matches() {
            return darkMode;
          },
          addEventListener: (_type, nextListener: () => void) => {
            triggerChange = nextListener;
          },
          removeEventListener: (_type, nextListener: () => void) => {
            if (triggerChange === nextListener) {
              triggerChange = () => {};
            }
          },
        }),
      },
    );

    expect(root.dataset.themePreset).toBe("sunset");
    expect(root.dataset.themeResolved).toBe("light");
    darkMode = true;
    triggerChange();
    expect(root.dataset.themePreset).toBe("sunset");
    expect(root.dataset.themeResolved).toBe("dark");

    stop();
  });

  it("keeps custom seed metadata while system theme changes", () => {
    const properties = new Map<string, string>();
    const root: {
      dataset: Record<string, string | undefined>;
      style: {
        colorScheme?: string;
        setProperty: (property: string, value: string) => void;
        removeProperty: (property: string) => void;
      };
    } = {
      dataset: {},
      style: {
        setProperty: (property, value) => {
          properties.set(property, value);
        },
        removeProperty: (property) => {
          properties.delete(property);
        },
      },
    };
    let triggerChange = () => {};
    let darkMode = false;
    const stop = startThemeSettingsSync(
      {
        themeMode: "system",
        themePreset: "custom",
        themeCustomSeedHex: "#4F46E5",
      },
      root,
      {
        matchMedia: () => ({
          get matches() {
            return darkMode;
          },
          addEventListener: (_type, nextListener: () => void) => {
            triggerChange = nextListener;
          },
          removeEventListener: (_type, nextListener: () => void) => {
            if (triggerChange === nextListener) {
              triggerChange = () => {};
            }
          },
        }),
      },
    );

    const lightPrimary = properties.get("--md-sys-color-primary");

    expect(root.dataset.themePreset).toBe("custom");
    expect(root.dataset.themeCustomSeedHex).toBe("#4F46E5");
    expect(root.dataset.themeResolved).toBe("light");
    darkMode = true;
    triggerChange();
    expect(root.dataset.themePreset).toBe("custom");
    expect(root.dataset.themeCustomSeedHex).toBe("#4F46E5");
    expect(root.dataset.themeResolved).toBe("dark");
    expect(properties.get("--md-sys-color-primary")).not.toBe(lightPrimary);

    stop();
  });
});
