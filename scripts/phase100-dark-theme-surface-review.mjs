import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase100-dark-theme-surface-review",
);
const sidePanelSettingsUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const sidePanelDashboardUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const cursorDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/cursor";
const jetbrainsDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/jetbrains";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function slugify(label) {
  return label.toLowerCase().replaceAll(/\s+/g, "-");
}

async function setThemeMode(page, themeMode) {
  await page.goto(sidePanelSettingsUrl, { waitUntil: "load" });
  const themeSelect = page.locator(
    'label.form-field:has-text("Theme mode") select',
  );
  await themeSelect.waitFor({ state: "visible", timeout: 20_000 });
  await themeSelect.selectOption(themeMode);
  await waitForTheme(page, themeMode, themeMode);
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

async function readSurfaceSnapshot(page, selectors) {
  return page.evaluate((currentSelectors) => {
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
        boxShadow: styles.boxShadow,
      };
    }

    function contrastFor(textNode, backgroundNode) {
      if (!(textNode instanceof HTMLElement) || !(backgroundNode instanceof HTMLElement)) {
        return null;
      }

      const textStyles = getComputedStyle(textNode);
      const backgroundStyles = getComputedStyle(backgroundNode);
      const textColor = parseColor(textStyles.color);
      const backgroundColor = parseColor(backgroundStyles.backgroundColor);

      if (!textColor || !backgroundColor) {
        return null;
      }

      return Number(contrastRatio(textColor, backgroundColor).toFixed(2));
    }

    const root = document.documentElement;
    const container = document.querySelector(currentSelectors.container);
    const title = currentSelectors.title
      ? document.querySelector(currentSelectors.title)
      : null;
    const supporting = currentSelectors.supporting
      ? document.querySelector(currentSelectors.supporting)
      : null;
    const fill = currentSelectors.fill
      ? document.querySelector(currentSelectors.fill)
      : null;

    return {
      themeMode: root.dataset.themeMode ?? null,
      themeResolved: root.dataset.themeResolved ?? null,
      computedColorScheme: getComputedStyle(root).colorScheme,
      container: styleSnapshot(container),
      title: styleSnapshot(title),
      supporting: styleSnapshot(supporting),
      fill: styleSnapshot(fill),
      titleContrast: contrastFor(title, container),
      supportingContrast: contrastFor(supporting, container),
    };
  }, selectors);
}

async function captureReview(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "load" });
  await config.ready(page);
  await waitForTheme(page, "dark", "dark");

  const result = {};

  for (const [key, selectors] of Object.entries(config.surfaces)) {
    result[key] = await readSurfaceSnapshot(page, selectors);
  }

  const screenshotPath = path.join(artifactDir, `${slugify(config.slug)}.png`);

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return {
    slug: config.slug,
    screenshotPath,
    surfaces: result,
  };
}

async function runDarkThemeSurfaceReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const context = await browser.newContext({
      colorScheme: "light",
    });

    const settingsPage = await context.newPage();
    settingsPage.setDefaultTimeout(20_000);
    console.log("phase100: setting explicit dark theme");
    await setThemeMode(settingsPage, "dark");

    const dashboardPage = await context.newPage();
    dashboardPage.setDefaultTimeout(20_000);
    console.log("phase100: capturing dashboard surfaces");
    const dashboard = await captureReview(dashboardPage, {
      slug: "dashboard-dark-toned-surfaces",
      url: sidePanelDashboardUrl,
      viewport: { width: 420, height: 980 },
      ready: async (page) => {
        await page.waitForSelector("text=Provider cards");
        await page.waitForSelector(".provider-card--warning");
        await page.waitForSelector(".provider-card--error");
      },
      surfaces: {
        neutralCard: {
          container:
            ".provider-card:not(.provider-card--warning):not(.provider-card--error)",
          title:
            ".provider-card:not(.provider-card--warning):not(.provider-card--error) .provider-card__provider",
          supporting:
            ".provider-card:not(.provider-card--warning):not(.provider-card--error) .supporting-copy",
        },
        warningCard: {
          container: ".provider-card--warning",
          title: ".provider-card--warning .provider-card__provider",
          supporting: ".provider-card--warning .supporting-copy",
        },
        errorCard: {
          container: ".provider-card--error",
          title: ".provider-card--error .provider-card__provider",
          supporting: ".provider-card--error .supporting-copy",
        },
        neutralProgress: {
          container:
            ".provider-card:not(.provider-card--warning):not(.provider-card--error) .usage-progress__track--neutral",
          fill:
            ".provider-card:not(.provider-card--warning):not(.provider-card--error) .usage-progress__track--neutral .usage-progress__fill",
        },
        warningProgress: {
          container: ".provider-card--warning .usage-progress__track--warning",
          fill: ".provider-card--warning .usage-progress__track--warning .usage-progress__fill",
        },
        errorProgress: {
          container: ".provider-card--error .usage-progress__track--error",
          fill: ".provider-card--error .usage-progress__track--error .usage-progress__fill",
        },
      },
    });

    const settingsReviewPage = await context.newPage();
    settingsReviewPage.setDefaultTimeout(20_000);
    console.log("phase100: capturing settings surfaces");
    const settings = await captureReview(settingsReviewPage, {
      slug: "settings-dark-toned-surfaces",
      url: sidePanelSettingsUrl,
      viewport: { width: 420, height: 1200 },
      ready: async (page) => {
        await page.waitForSelector("text=Hybrid source contracts");
        await page.locator('summary:has-text("Detailed diagnostics")').first().click();
        await page.waitForSelector(".source-card__diagnostic-group");
        await page.waitForSelector(".permission-prompt--warning");
        await page.waitForSelector(".detail-note--warning");
        await page.waitForSelector(".detail-note--error");
        await page.waitForSelector(".detail-note--neutral");
      },
      surfaces: {
        neutralSection: {
          container: ".status-card.settings-section-anchor",
          title: ".status-card.settings-section-anchor .section-label",
          supporting: ".settings-overview .supporting-copy",
        },
        warningPrompt: {
          container: ".permission-prompt--warning",
          title: ".permission-prompt--warning .permission-prompt__provider",
          supporting: ".permission-prompt--warning .supporting-copy",
        },
        neutralNote: {
          container: ".detail-note--neutral",
          title: ".detail-note--neutral .detail-note__label",
          supporting: ".detail-note--neutral .supporting-copy",
        },
        warningNote: {
          container: ".detail-note--warning",
          title: ".detail-note--warning .detail-note__label",
          supporting: ".detail-note--warning .supporting-copy",
        },
        errorNote: {
          container: ".detail-note--error",
          title: ".detail-note--error .detail-note__label",
          supporting: ".detail-note--error .supporting-copy",
        },
        sourceCard: {
          container: ".source-card",
          title: ".source-card .source-card__provider",
          supporting: ".source-card .supporting-copy",
        },
        diagnosticGroup: {
          container: ".source-card__diagnostic-group",
          title: ".source-card__diagnostic-title",
          supporting: ".source-card__value",
        },
      },
    });

    const cursorDetailPage = await context.newPage();
    cursorDetailPage.setDefaultTimeout(20_000);
    console.log("phase100: capturing cursor detail surfaces");
    const cursorDetail = await captureReview(cursorDetailPage, {
      slug: "cursor-detail-dark-surfaces",
      url: cursorDetailUrl,
      viewport: { width: 420, height: 1100 },
      ready: async (page) => {
        await page.waitForSelector("text=Cursor");
        await page.waitForSelector(".detail-note--neutral");
        await page.waitForSelector(".usage-progress__track--neutral");
      },
      surfaces: {
        neutralNote: {
          container: ".detail-note--neutral",
          title: ".detail-note--neutral .detail-note__label",
          supporting: ".detail-note--neutral .supporting-copy",
        },
        neutralProgress: {
          container: ".usage-progress__track--neutral",
          fill: ".usage-progress__track--neutral .usage-progress__fill",
        },
      },
    });

    const jetbrainsDetailPage = await context.newPage();
    jetbrainsDetailPage.setDefaultTimeout(20_000);
    console.log("phase100: capturing jetbrains detail surfaces");
    const jetbrainsDetail = await captureReview(jetbrainsDetailPage, {
      slug: "jetbrains-detail-dark-surfaces",
      url: jetbrainsDetailUrl,
      viewport: { width: 420, height: 1100 },
      ready: async (page) => {
        await page.waitForSelector("text=JetBrains AI");
        await page.waitForSelector(".detail-note--warning");
        await page.waitForSelector(".usage-progress__track--warning");
      },
      surfaces: {
        warningNote: {
          container: ".detail-note--warning",
          title: ".detail-note--warning .detail-note__label",
          supporting: ".detail-note--warning .supporting-copy",
        },
        warningProgress: {
          container: ".usage-progress__track--warning",
          fill: ".usage-progress__track--warning .usage-progress__fill",
        },
      },
    });

    for (const result of [dashboard, settings, cursorDetail, jetbrainsDetail]) {
      for (const surface of Object.values(result.surfaces)) {
        assert(
          surface.themeMode === "dark" && surface.themeResolved === "dark",
          `${result.slug} contains a surface that did not resolve to explicit dark mode.`,
        );
        assert(
          surface.computedColorScheme === "dark",
          `${result.slug} contains a surface with computed color-scheme=${surface.computedColorScheme}.`,
        );
      }
    }

    assert(
      dashboard.surfaces.neutralCard.container.backgroundColor !==
        dashboard.surfaces.warningCard.container.backgroundColor,
      "Dashboard warning card collapsed into the neutral background in dark mode.",
    );
    assert(
      dashboard.surfaces.neutralCard.container.backgroundColor !==
        dashboard.surfaces.errorCard.container.backgroundColor,
      "Dashboard error card collapsed into the neutral background in dark mode.",
    );
    assert(
      dashboard.surfaces.warningCard.supportingContrast !== null &&
        dashboard.surfaces.warningCard.supportingContrast >= 4.5,
      `Dashboard warning supporting contrast is too low in dark mode: ${dashboard.surfaces.warningCard.supportingContrast}.`,
    );
    assert(
      dashboard.surfaces.errorCard.supportingContrast !== null &&
        dashboard.surfaces.errorCard.supportingContrast >= 4.5,
      `Dashboard error supporting contrast is too low in dark mode: ${dashboard.surfaces.errorCard.supportingContrast}.`,
    );
    assert(
      dashboard.surfaces.neutralProgress.container.backgroundColor !==
        dashboard.surfaces.warningProgress.container.backgroundColor,
      "Dashboard warning progress track collapsed into the neutral track in dark mode.",
    );
    assert(
      dashboard.surfaces.neutralProgress.container.backgroundColor !==
        dashboard.surfaces.errorProgress.container.backgroundColor,
      "Dashboard error progress track collapsed into the neutral track in dark mode.",
    );
    assert(
      dashboard.surfaces.neutralProgress.fill.backgroundColor !==
        dashboard.surfaces.warningProgress.fill.backgroundColor,
      "Dashboard warning progress fill collapsed into the neutral fill in dark mode.",
    );
    assert(
      dashboard.surfaces.neutralProgress.fill.backgroundColor !==
        dashboard.surfaces.errorProgress.fill.backgroundColor,
      "Dashboard error progress fill collapsed into the neutral fill in dark mode.",
    );

    assert(
      settings.surfaces.warningPrompt.container.backgroundColor !==
        settings.surfaces.neutralSection.container.backgroundColor,
      "Settings warning permission prompt collapsed into a neutral card in dark mode.",
    );
    assert(
      settings.surfaces.warningPrompt.supportingContrast !== null &&
        settings.surfaces.warningPrompt.supportingContrast >= 4.5,
      `Settings warning prompt supporting contrast is too low in dark mode: ${settings.surfaces.warningPrompt.supportingContrast}.`,
    );
    assert(
      settings.surfaces.neutralNote.container.backgroundColor !==
        settings.surfaces.warningNote.container.backgroundColor,
      "Settings warning detail notes collapsed into neutral notes in dark mode.",
    );
    assert(
      settings.surfaces.warningNote.container.backgroundColor !==
        settings.surfaces.errorNote.container.backgroundColor,
      "Settings warning and error detail notes collapsed into the same dark surface.",
    );
    assert(
      settings.surfaces.neutralNote.supportingContrast !== null &&
        settings.surfaces.neutralNote.supportingContrast >= 4.5,
      `Settings neutral detail-note supporting contrast is too low: ${settings.surfaces.neutralNote.supportingContrast}.`,
    );
    assert(
      settings.surfaces.warningNote.supportingContrast !== null &&
        settings.surfaces.warningNote.supportingContrast >= 4.5,
      `Settings warning detail-note supporting contrast is too low: ${settings.surfaces.warningNote.supportingContrast}.`,
    );
    assert(
      settings.surfaces.errorNote.supportingContrast !== null &&
        settings.surfaces.errorNote.supportingContrast >= 4.5,
      `Settings error detail-note supporting contrast is too low: ${settings.surfaces.errorNote.supportingContrast}.`,
    );
    assert(
      settings.surfaces.sourceCard.container.backgroundColor !==
        settings.surfaces.diagnosticGroup.container.backgroundColor,
      "Settings diagnostic groups collapsed into the same background as the outer source card in dark mode.",
    );
    assert(
      settings.surfaces.sourceCard.container.borderColor !==
        settings.surfaces.diagnosticGroup.container.borderColor,
      "Settings diagnostic groups collapsed into the same border as the outer source card in dark mode.",
    );

    assert(
      cursorDetail.surfaces.neutralNote.supportingContrast !== null &&
        cursorDetail.surfaces.neutralNote.supportingContrast >= 4.5,
      `Cursor detail neutral note supporting contrast is too low: ${cursorDetail.surfaces.neutralNote.supportingContrast}.`,
    );
    assert(
      jetbrainsDetail.surfaces.warningNote.supportingContrast !== null &&
        jetbrainsDetail.surfaces.warningNote.supportingContrast >= 4.5,
      `JetBrains detail warning note supporting contrast is too low: ${jetbrainsDetail.surfaces.warningNote.supportingContrast}.`,
    );
    assert(
      cursorDetail.surfaces.neutralNote.container.backgroundColor !==
        jetbrainsDetail.surfaces.warningNote.container.backgroundColor,
      "Provider-detail neutral and warning notes collapsed into the same dark surface.",
    );
    assert(
      cursorDetail.surfaces.neutralProgress.container.backgroundColor !==
        jetbrainsDetail.surfaces.warningProgress.container.backgroundColor,
      "Provider-detail warning progress collapsed into the neutral track in dark mode.",
    );
    assert(
      cursorDetail.surfaces.neutralProgress.fill.backgroundColor !==
        jetbrainsDetail.surfaces.warningProgress.fill.backgroundColor,
      "Provider-detail warning progress fill collapsed into the neutral fill in dark mode.",
    );

    const results = {
      dashboard,
      settings,
      cursorDetail,
      jetbrainsDetail,
    };
    const reportPath = path.join(artifactDir, "phase100-results.json");
    await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

    console.log(`phase100: saved artifacts under ${artifactDir}`);
    console.log(`phase100: saved machine-readable results to ${reportPath}`);
    console.log(
      [
        "phase100:",
        `dashboard_warning_contrast=${dashboard.surfaces.warningCard.supportingContrast}`,
        `dashboard_error_contrast=${dashboard.surfaces.errorCard.supportingContrast}`,
        `settings_warning_note_contrast=${settings.surfaces.warningNote.supportingContrast}`,
        `settings_error_note_contrast=${settings.surfaces.errorNote.supportingContrast}`,
        `jetbrains_warning_note_contrast=${jetbrainsDetail.surfaces.warningNote.supportingContrast}`,
      ].join(" "),
    );
  } finally {
    await browser.close();
  }
}

await runDarkThemeSurfaceReview();
