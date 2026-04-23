import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase101-theme-preset-review");
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";

const scenarios = [
  {
    slug: "default-light",
    contextColorScheme: "light",
    themeMode: "light",
    themePreset: "default",
    expectedResolved: "light",
    expectedPalette: {
      primary: "#005ac1",
      secondaryContainer: "#d7e3f8",
      tertiary: "#6b5778",
    },
  },
  {
    slug: "meadow-light",
    contextColorScheme: "light",
    themeMode: "light",
    themePreset: "meadow",
    expectedResolved: "light",
    expectedPalette: {
      primary: "#2a6a31",
      secondaryContainer: "#cfe8d0",
      tertiary: "#39656a",
    },
  },
  {
    slug: "sunset-light",
    contextColorScheme: "light",
    themeMode: "light",
    themePreset: "sunset",
    expectedResolved: "light",
    expectedPalette: {
      primary: "#9a4d00",
      secondaryContainer: "#ffdccd",
      tertiary: "#6d5b91",
    },
  },
  {
    slug: "default-dark",
    contextColorScheme: "dark",
    themeMode: "dark",
    themePreset: "default",
    expectedResolved: "dark",
    expectedPalette: {
      primary: "#adc7ff",
      secondaryContainer: "#3c4758",
      tertiary: "#d6bee4",
    },
  },
  {
    slug: "meadow-dark",
    contextColorScheme: "dark",
    themeMode: "dark",
    themePreset: "meadow",
    expectedResolved: "dark",
    expectedPalette: {
      primary: "#90d58f",
      secondaryContainer: "#364b38",
      tertiary: "#9fd0d5",
    },
  },
  {
    slug: "sunset-dark",
    contextColorScheme: "dark",
    themeMode: "dark",
    themePreset: "sunset",
    expectedResolved: "dark",
    expectedPalette: {
      primary: "#ffb784",
      secondaryContainer: "#5d4034",
      tertiary: "#cfbee8",
    },
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseColor(input) {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.trim().toLowerCase();

  if (value.startsWith("#")) {
    if (value.length === 4) {
      return {
        r: Number.parseInt(value[1] + value[1], 16),
        g: Number.parseInt(value[2] + value[2], 16),
        b: Number.parseInt(value[3] + value[3], 16),
        a: 1,
      };
    }

    if (value.length === 7) {
      return {
        r: Number.parseInt(value.slice(1, 3), 16),
        g: Number.parseInt(value.slice(3, 5), 16),
        b: Number.parseInt(value.slice(5, 7), 16),
        a: 1,
      };
    }
  }

  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);

  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(",")
      .map((part) => Number.parseFloat(part.trim()));

    if (parts.length >= 3) {
      return {
        r: parts[0],
        g: parts[1],
        b: parts[2],
        a: parts[3] ?? 1,
      };
    }
  }

  const srgbMatch = value.match(/color\(srgb\s+([^\)]+)\)/i);

  if (srgbMatch) {
    const [channels, alpha] = srgbMatch[1].split("/").map((part) => part.trim());
    const parts = channels
      .split(/\s+/)
      .map((part) => Number.parseFloat(part.trim()));

    if (parts.length >= 3) {
      return {
        r: Math.round(parts[0] * 255),
        g: Math.round(parts[1] * 255),
        b: Math.round(parts[2] * 255),
        a: alpha ? Number.parseFloat(alpha) : 1,
      };
    }
  }

  return null;
}

function colorsClose(left, right, tolerance = 3) {
  const leftColor = parseColor(left);
  const rightColor = parseColor(right);

  if (!leftColor || !rightColor) {
    return false;
  }

  return (
    Math.abs(leftColor.r - rightColor.r) <= tolerance &&
    Math.abs(leftColor.g - rightColor.g) <= tolerance &&
    Math.abs(leftColor.b - rightColor.b) <= tolerance
  );
}

function normalizeHex(input) {
  return String(input).trim().toLowerCase();
}

async function setThemeSettings(page, scenario) {
  await page.goto(settingsUrl, { waitUntil: "load" });
  await page.waitForSelector("text=Global Preferences");

  const themeModeSelect = page
    .locator("label.form-field")
    .filter({ hasText: "Theme mode" })
    .locator("select");
  const themePresetSelect = page
    .locator("label.form-field")
    .filter({ hasText: "Accent preset" })
    .locator("select");

  await themeModeSelect.waitFor({ state: "visible", timeout: 20_000 });
  await themePresetSelect.waitFor({ state: "visible", timeout: 20_000 });

  await themeModeSelect.selectOption(scenario.themeMode);
  await themePresetSelect.selectOption(scenario.themePreset);

  await page.waitForFunction(
    ({ expectedThemeMode, expectedThemeResolved, expectedThemePreset }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themeResolved === expectedThemeResolved &&
        root.dataset.themePreset === expectedThemePreset
      );
    },
    {
      expectedThemeMode: scenario.themeMode,
      expectedThemeResolved: scenario.expectedResolved,
      expectedThemePreset: scenario.themePreset,
    },
  );

  await themeModeSelect.evaluate((select) => select.blur());
}

async function waitForThemeState(page, scenario) {
  await page.waitForFunction(
    ({ expectedThemeMode, expectedThemeResolved, expectedThemePreset }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themeResolved === expectedThemeResolved &&
        root.dataset.themePreset === expectedThemePreset
      );
    },
    {
      expectedThemeMode: scenario.themeMode,
      expectedThemeResolved: scenario.expectedResolved,
      expectedThemePreset: scenario.themePreset,
    },
  );
}

async function readSurface(page, selectors) {
  return page.evaluate((currentSelectors) => {
    function styleSnapshot(node) {
      if (!(node instanceof HTMLElement)) {
        return null;
      }

      const styles = getComputedStyle(node);

      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
      };
    }

    const root = document.documentElement;
    const rootStyles = getComputedStyle(root);

    return {
      themeMode: root.dataset.themeMode ?? null,
      themePreset: root.dataset.themePreset ?? null,
      themeResolved: root.dataset.themeResolved ?? null,
      cssVars: {
        primary: rootStyles.getPropertyValue("--md-sys-color-primary").trim(),
        secondaryContainer: rootStyles
          .getPropertyValue("--md-sys-color-secondary-container")
          .trim(),
        tertiary: rootStyles.getPropertyValue("--md-sys-color-tertiary").trim(),
      },
      primaryAction: currentSelectors.primaryAction
        ? styleSnapshot(document.querySelector(currentSelectors.primaryAction))
        : null,
      sectionLabel: styleSnapshot(
        document.querySelector(currentSelectors.sectionLabel),
      ),
      accentChip: currentSelectors.accentChip
        ? styleSnapshot(document.querySelector(currentSelectors.accentChip))
        : null,
    };
  }, selectors);
}

async function captureScenarioSurface(page, config, scenario, suffix) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "load" });
  await config.ready(page);
  await waitForThemeState(page, scenario);

  const snapshot = await readSurface(page, config.selectors);
  const screenshotPath = path.join(
    artifactDir,
    `${scenario.slug}-${suffix}.png`,
  );

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return {
    screenshotPath,
    snapshot,
  };
}

function verifySurface(label, surface, scenario) {
  assert(
    surface.snapshot.themeMode === scenario.themeMode,
    `${label}: expected theme mode ${scenario.themeMode}, received ${surface.snapshot.themeMode}`,
  );
  assert(
    surface.snapshot.themeResolved === scenario.expectedResolved,
    `${label}: expected resolved mode ${scenario.expectedResolved}, received ${surface.snapshot.themeResolved}`,
  );
  assert(
    surface.snapshot.themePreset === scenario.themePreset,
    `${label}: expected preset ${scenario.themePreset}, received ${surface.snapshot.themePreset}`,
  );
  assert(
    normalizeHex(surface.snapshot.cssVars.primary) ===
      normalizeHex(scenario.expectedPalette.primary),
    `${label}: expected primary ${scenario.expectedPalette.primary}, received ${surface.snapshot.cssVars.primary}`,
  );
  assert(
    normalizeHex(surface.snapshot.cssVars.secondaryContainer) ===
      normalizeHex(scenario.expectedPalette.secondaryContainer),
    `${label}: expected secondary container ${scenario.expectedPalette.secondaryContainer}, received ${surface.snapshot.cssVars.secondaryContainer}`,
  );
  assert(
    normalizeHex(surface.snapshot.cssVars.tertiary) ===
      normalizeHex(scenario.expectedPalette.tertiary),
    `${label}: expected tertiary ${scenario.expectedPalette.tertiary}, received ${surface.snapshot.cssVars.tertiary}`,
  );
  assert(
    colorsClose(surface.snapshot.sectionLabel?.color, surface.snapshot.cssVars.tertiary),
    `${label}: expected section label to use the tertiary role`,
  );

  if (surface.snapshot.accentChip) {
    assert(
      colorsClose(
        surface.snapshot.accentChip.backgroundColor,
        surface.snapshot.cssVars.secondaryContainer,
      ),
      `${label}: expected accent chip to use the secondary-container role`,
    );
  }
}

async function runThemePresetReview() {
  await mkdir(artifactDir, { recursive: true });

  const surfaceConfigs = {
    settings: {
      url: settingsUrl,
      viewport: { width: 440, height: 1100 },
      ready: async (page) => {
        await page.waitForSelector("text=Global Preferences");
      },
      selectors: {
        sectionLabel: ".settings-overview .section-label",
      },
    },
    dashboard: {
      url: dashboardUrl,
      viewport: { width: 440, height: 1040 },
      ready: async (page) => {
        await page.waitForSelector(".hero-card .token-chip");
      },
      selectors: {
        sectionLabel: ".hero-card .section-label",
        accentChip: ".hero-card .token-chip",
      },
    },
    popup: {
      url: popupUrl,
      viewport: { width: 400, height: 980 },
      ready: async (page) => {
        await page.waitForSelector(".popup-header .text-button");
      },
      selectors: {
        sectionLabel: ".popup-header .section-label",
      },
    },
  };

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const results = [];

    for (const scenario of scenarios) {
      console.log(`phase101: reviewing ${scenario.slug}`);
      const context = await browser.newContext({
        colorScheme: scenario.contextColorScheme,
      });
      const settingsPage = await context.newPage();
      settingsPage.setDefaultTimeout(20_000);
      await setThemeSettings(settingsPage, scenario);

      const dashboardPage = await context.newPage();
      dashboardPage.setDefaultTimeout(20_000);
      const popupPage = await context.newPage();
      popupPage.setDefaultTimeout(20_000);

      const settings = await captureScenarioSurface(
        settingsPage,
        surfaceConfigs.settings,
        scenario,
        "settings",
      );
      const dashboard = await captureScenarioSurface(
        dashboardPage,
        surfaceConfigs.dashboard,
        scenario,
        "dashboard",
      );
      const popup = await captureScenarioSurface(
        popupPage,
        surfaceConfigs.popup,
        scenario,
        "popup",
      );

      verifySurface("settings", settings, scenario);
      verifySurface("dashboard", dashboard, scenario);
      verifySurface("popup", popup, scenario);

      results.push({
        slug: scenario.slug,
        contextColorScheme: scenario.contextColorScheme,
        themeMode: scenario.themeMode,
        themePreset: scenario.themePreset,
        expectedResolved: scenario.expectedResolved,
        expectedPalette: scenario.expectedPalette,
        settings,
        dashboard,
        popup,
      });

      await context.close();
    }

    const resultBySlug = Object.fromEntries(
      results.map((scenario) => [scenario.slug, scenario]),
    );

    assert(
      resultBySlug["default-light"].dashboard.snapshot.cssVars.primary !==
        resultBySlug["meadow-light"].dashboard.snapshot.cssVars.primary,
      "expected meadow light primary role to differ from default light",
    );
    assert(
      resultBySlug["default-light"].dashboard.snapshot.cssVars.primary !==
        resultBySlug["sunset-light"].dashboard.snapshot.cssVars.primary,
      "expected sunset light primary role to differ from default light",
    );
    assert(
      resultBySlug["default-dark"].dashboard.snapshot.cssVars.primary !==
        resultBySlug["meadow-dark"].dashboard.snapshot.cssVars.primary,
      "expected meadow dark primary role to differ from default dark",
    );
    assert(
      resultBySlug["default-dark"].dashboard.snapshot.cssVars.primary !==
        resultBySlug["sunset-dark"].dashboard.snapshot.cssVars.primary,
      "expected sunset dark primary role to differ from default dark",
    );
    assert(
      resultBySlug["meadow-light"].dashboard.snapshot.cssVars.primary !==
        resultBySlug["meadow-dark"].dashboard.snapshot.cssVars.primary,
      "expected meadow light and meadow dark palettes to differ",
    );
    assert(
      resultBySlug["sunset-light"].dashboard.snapshot.cssVars.primary !==
        resultBySlug["sunset-dark"].dashboard.snapshot.cssVars.primary,
      "expected sunset light and sunset dark palettes to differ",
    );

    const output = {
      reviewedAt: new Date().toISOString(),
      artifactDir,
      scenarioCount: results.length,
      results,
    };

    await writeFile(
      path.join(artifactDir, "phase101-results.json"),
      `${JSON.stringify(output, null, 2)}\n`,
      "utf8",
    );

    console.log(`phase101: wrote ${results.length} scenario reviews`);
  } finally {
    await browser.close();
  }
}

runThemePresetReview().catch((error) => {
  console.error("phase101 failed");
  console.error(error);
  process.exitCode = 1;
});
