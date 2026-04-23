import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase99-theme-mode-review");
const sidePanelSettingsUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const sidePanelDashboardUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";

const scenarios = [
  {
    slug: "explicit-light-overrides-dark-system",
    contextColorScheme: "dark",
    themeMode: "light",
    expectedResolved: "light",
  },
  {
    slug: "explicit-dark-overrides-light-system",
    contextColorScheme: "light",
    themeMode: "dark",
    expectedResolved: "dark",
  },
  {
    slug: "system-light-follows-browser",
    contextColorScheme: "light",
    themeMode: "system",
    expectedResolved: "light",
  },
  {
    slug: "system-dark-follows-browser",
    contextColorScheme: "dark",
    themeMode: "system",
    expectedResolved: "dark",
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

  const rgbMatch = input.match(/rgba?\(([^)]+)\)/i);

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

  const srgbMatch = input.match(/color\(srgb\s+([^\)]+)\)/i);

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

function srgbToLinear(value) {
  const normalized = value / 255;

  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  return (
    0.2126 * srgbToLinear(color.r) +
    0.7152 * srgbToLinear(color.g) +
    0.0722 * srgbToLinear(color.b)
  );
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

function slugify(label) {
  return label.toLowerCase().replaceAll(/\s+/g, "-");
}

async function setThemeMode(page, themeMode) {
  await page.goto(sidePanelSettingsUrl, { waitUntil: "load" });
  await page.waitForSelector("text=Global Preferences");

  const select = page.locator('label.form-field:has-text("Theme mode") select');
  await select.selectOption(themeMode);

  await page.waitForFunction(
    ({ expectedThemeMode, expectedResolved }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themeResolved === expectedResolved
      );
    },
    {
      expectedThemeMode: themeMode,
      expectedResolved:
        themeMode === "light" || themeMode === "dark"
          ? themeMode
          : undefined,
    },
  ).catch(() => {});
}

async function waitForTheme(page, expectedThemeMode, expectedResolved) {
  await page.waitForFunction(
    ({ themeMode, resolved }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === themeMode &&
        root.dataset.themeResolved === resolved
      );
    },
    {
      themeMode: expectedThemeMode,
      resolved: expectedResolved,
    },
  );
}

async function collectSurfaceSnapshot(page, selectors) {
  return page.evaluate(({ cardSelector, titleSelector, supportingSelector }) => {
    function parseColor(input) {
      if (typeof input !== "string") {
        return null;
      }

      const rgbMatch = input.match(/rgba?\(([^)]+)\)/i);

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

      const srgbMatch = input.match(/color\(srgb\s+([^\)]+)\)/i);

      if (srgbMatch) {
        const [channels, alpha] = srgbMatch[1]
          .split("/")
          .map((part) => part.trim());
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

    function srgbToLinear(value) {
      const normalized = value / 255;

      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    }

    function luminance(color) {
      return (
        0.2126 * srgbToLinear(color.r) +
        0.7152 * srgbToLinear(color.g) +
        0.0722 * srgbToLinear(color.b)
      );
    }

    function contrastRatio(foreground, background) {
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));

      return (lighter + 0.05) / (darker + 0.05);
    }

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
    const card = document.querySelector(cardSelector);
    const title = document.querySelector(titleSelector);
    const supporting = document.querySelector(supportingSelector);
    const cardStyles = styleSnapshot(card);
    const titleStyles = styleSnapshot(title);
    const supportingStyles = styleSnapshot(supporting);
    const cardBackground = parseColor(cardStyles?.backgroundColor ?? "");
    const titleColor = parseColor(titleStyles?.color ?? "");
    const supportingColor = parseColor(supportingStyles?.color ?? "");

    return {
      themeMode: root.dataset.themeMode ?? null,
      themeResolved: root.dataset.themeResolved ?? null,
      computedColorScheme: getComputedStyle(root).colorScheme,
      cardStyles,
      titleStyles,
      supportingStyles,
      titleContrast:
        titleColor && cardBackground
          ? Number(contrastRatio(titleColor, cardBackground).toFixed(2))
          : null,
      supportingContrast:
        supportingColor && cardBackground
          ? Number(contrastRatio(supportingColor, cardBackground).toFixed(2))
          : null,
      backgroundLuminance:
        cardBackground !== null
          ? Number(luminance(cardBackground).toFixed(4))
          : null,
    };
  }, selectors);
}

async function captureSurface(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "load" });
  await config.ready(page);
  const snapshot = await collectSurfaceSnapshot(page, config.selectors);
  const screenshotPath = path.join(
    artifactDir,
    `${slugify(config.slug)}.png`,
  );

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return {
    screenshotPath,
    ...snapshot,
  };
}

async function runScenario(browser, scenario) {
  const context = await browser.newContext({
    colorScheme: scenario.contextColorScheme,
  });

  try {
    console.log(`phase99: starting ${scenario.slug}`);

    const settingsPage = await context.newPage();
    settingsPage.setDefaultTimeout(10_000);
    await settingsPage.setViewportSize({ width: 420, height: 980 });
    await setThemeMode(settingsPage, scenario.themeMode);
    await waitForTheme(
      settingsPage,
      scenario.themeMode,
      scenario.expectedResolved,
    );

    const settings = await captureSurface(settingsPage, {
      slug: `${scenario.slug}-settings`,
      url: sidePanelSettingsUrl,
      viewport: { width: 420, height: 980 },
      ready: async (page) => {
        await page.waitForSelector("text=Settings Overview");
        await waitForTheme(page, scenario.themeMode, scenario.expectedResolved);
      },
      selectors: {
        cardSelector: ".settings-overview",
        titleSelector: ".settings-overview .section-title",
        supportingSelector: ".settings-overview .supporting-copy",
      },
    });
    console.log(`phase99: captured ${scenario.slug} settings`);

    const dashboardPage = await context.newPage();
    dashboardPage.setDefaultTimeout(10_000);
    const dashboard = await captureSurface(dashboardPage, {
      slug: `${scenario.slug}-dashboard`,
      url: sidePanelDashboardUrl,
      viewport: { width: 420, height: 980 },
      ready: async (page) => {
        await page.waitForSelector("text=Provider cards");
        await page.waitForSelector(
          ".provider-card:not(.provider-card--warning):not(.provider-card--error)",
        );
        await waitForTheme(page, scenario.themeMode, scenario.expectedResolved);
      },
      selectors: {
        cardSelector:
          ".provider-card:not(.provider-card--warning):not(.provider-card--error)",
        titleSelector:
          ".provider-card:not(.provider-card--warning):not(.provider-card--error) .provider-card__provider",
        supportingSelector:
          ".provider-card:not(.provider-card--warning):not(.provider-card--error) .supporting-copy",
      },
    });
    console.log(`phase99: captured ${scenario.slug} dashboard`);

    const popupPage = await context.newPage();
    popupPage.setDefaultTimeout(10_000);
    const popup = await captureSurface(popupPage, {
      slug: `${scenario.slug}-popup`,
      url: popupUrl,
      viewport: { width: 380, height: 820 },
      ready: async (page) => {
        await page.waitForSelector("text=Quick glance");
        await page.waitForSelector(".status-card.popup-header");
        await waitForTheme(page, scenario.themeMode, scenario.expectedResolved);
      },
      selectors: {
        cardSelector: ".status-card.popup-header",
        titleSelector: ".status-card.popup-header .section-title",
        supportingSelector: ".status-card.popup-header .supporting-copy",
      },
    });
    console.log(`phase99: captured ${scenario.slug} popup`);

    for (const [surfaceName, surface] of Object.entries({
      settings,
      dashboard,
      popup,
    })) {
      assert(
        surface.themeMode === scenario.themeMode,
        `${scenario.slug} ${surfaceName} reported themeMode=${surface.themeMode}, expected ${scenario.themeMode}.`,
      );
      assert(
        surface.themeResolved === scenario.expectedResolved,
        `${scenario.slug} ${surfaceName} resolved ${surface.themeResolved}, expected ${scenario.expectedResolved}.`,
      );
      assert(
        surface.computedColorScheme === scenario.expectedResolved,
        `${scenario.slug} ${surfaceName} computed color-scheme=${surface.computedColorScheme}, expected ${scenario.expectedResolved}.`,
      );
      assert(
        surface.titleContrast !== null && surface.titleContrast >= 4.5,
        `${scenario.slug} ${surfaceName} title contrast is too low: ${surface.titleContrast}.`,
      );
      assert(
        surface.supportingContrast !== null && surface.supportingContrast >= 4.5,
        `${scenario.slug} ${surfaceName} supporting contrast is too low: ${surface.supportingContrast}.`,
      );
    }

    return {
      slug: scenario.slug,
      contextColorScheme: scenario.contextColorScheme,
      themeMode: scenario.themeMode,
      expectedResolved: scenario.expectedResolved,
      settings,
      dashboard,
      popup,
    };
  } finally {
    await context.close();
  }
}

async function runThemeModeReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const results = [];

    for (const scenario of scenarios) {
      results.push(await runScenario(browser, scenario));
    }

    const explicitLight = results.find(
      (result) => result.slug === "explicit-light-overrides-dark-system",
    );
    const explicitDark = results.find(
      (result) => result.slug === "explicit-dark-overrides-light-system",
    );

    assert(explicitLight, "Missing explicit-light scenario results.");
    assert(explicitDark, "Missing explicit-dark scenario results.");

    assert(
      explicitLight.dashboard.cardStyles.backgroundColor !==
        explicitDark.dashboard.cardStyles.backgroundColor,
      "Explicit light and explicit dark dashboard cards collapsed into the same background color.",
    );
    assert(
      explicitLight.popup.cardStyles.backgroundColor !==
        explicitDark.popup.cardStyles.backgroundColor,
      "Explicit light and explicit dark popup header cards collapsed into the same background color.",
    );
    assert(
      explicitLight.dashboard.backgroundLuminance !== null &&
        explicitDark.dashboard.backgroundLuminance !== null &&
        explicitLight.dashboard.backgroundLuminance >
          explicitDark.dashboard.backgroundLuminance,
      "Dashboard card luminance did not become darker in explicit dark mode.",
    );
    assert(
      explicitLight.popup.backgroundLuminance !== null &&
        explicitDark.popup.backgroundLuminance !== null &&
        explicitLight.popup.backgroundLuminance > explicitDark.popup.backgroundLuminance,
      "Popup header luminance did not become darker in explicit dark mode.",
    );

    const reportPath = path.join(artifactDir, "phase99-results.json");
    await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

    console.log(`phase99: saved artifacts under ${artifactDir}`);
    console.log(`phase99: saved machine-readable results to ${reportPath}`);

    for (const result of results) {
      console.log(
        [
          "phase99:",
          result.slug,
          `resolved=${result.expectedResolved}`,
          `settings_contrast=${result.settings.supportingContrast}`,
          `dashboard_contrast=${result.dashboard.supportingContrast}`,
          `popup_contrast=${result.popup.supportingContrast}`,
        ].join(" "),
      );
    }
  } finally {
    await browser.close();
  }
}

await runThemeModeReview();
