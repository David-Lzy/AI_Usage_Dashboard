import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase107-custom-seed-compact-width-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const codexDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/codex";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";

const widths = [360, 420];
const viewportHeights = {
  dashboard: 900,
  settings: 980,
  detail: 900,
  popup: 900,
};

const modes = [
  {
    slug: "light",
    themeMode: "light",
    expectedResolved: "light",
  },
  {
    slug: "dark",
    themeMode: "dark",
    expectedResolved: "dark",
  },
];

const customSeedHex = "#4F46E5";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

async function applyCustomSeed(page, mode) {
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
  const customSeedInput = page
    .locator("label.form-field")
    .filter({ hasText: "Custom seed color" })
    .locator("input");
  const applyButton = page.getByRole("button", { name: "Apply custom seed" });

  await themeModeSelect.waitFor({ state: "visible", timeout: 20_000 });
  await themePresetSelect.waitFor({ state: "visible", timeout: 20_000 });

  await themeModeSelect.selectOption(mode.themeMode);
  await themePresetSelect.selectOption("custom");
  await customSeedInput.waitFor({ state: "visible", timeout: 20_000 });
  await customSeedInput.fill(customSeedHex);
  await applyButton.click();

  await page.waitForFunction(
    ({ expectedThemeMode, expectedResolved, expectedSeed }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themePreset === "custom" &&
        root.dataset.themeResolved === expectedResolved &&
        root.dataset.themeCustomSeedHex === expectedSeed
      );
    },
    {
      expectedThemeMode: mode.themeMode,
      expectedResolved: mode.expectedResolved,
      expectedSeed: customSeedHex,
    },
  );
}

async function waitForThemeState(page, mode) {
  await page.waitForFunction(
    ({ expectedThemeMode, expectedResolved, expectedSeed }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themePreset === "custom" &&
        root.dataset.themeResolved === expectedResolved &&
        root.dataset.themeCustomSeedHex === expectedSeed
      );
    },
    {
      expectedThemeMode: mode.themeMode,
      expectedResolved: mode.expectedResolved,
      expectedSeed: customSeedHex,
    },
  );
}

async function collectLayoutSnapshot(page, selectors = {}) {
  return page.evaluate((currentSelectors) => {
    const root = document.documentElement;
    const topBar = document.querySelector(".top-app-bar");
    const styles = getComputedStyle(root);

    return {
      themeMode: root.dataset.themeMode ?? null,
      themePreset: root.dataset.themePreset ?? null,
      themeResolved: root.dataset.themeResolved ?? null,
      themeCustomSeedHex: root.dataset.themeCustomSeedHex ?? null,
      cssVars: {
        primary: styles.getPropertyValue("--md-sys-color-primary").trim(),
        tertiary: styles.getPropertyValue("--md-sys-color-tertiary").trim(),
      },
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      topBarTop: topBar ? Math.round(topBar.getBoundingClientRect().top) : null,
      anchors: Object.fromEntries(
        Object.entries(currentSelectors).map(([key, selector]) => {
          const element = document.querySelector(selector);

          if (!(element instanceof HTMLElement)) {
            return [key, null];
          }

          const elementStyles = getComputedStyle(element);

          return [
            key,
            {
              color: elementStyles.color,
              backgroundColor: elementStyles.backgroundColor,
              borderColor: elementStyles.borderColor,
            },
          ];
        }),
      ),
    };
  }, selectors);
}

function verifyThemeSnapshot(label, snapshot, mode) {
  assert(
    snapshot.themeMode === mode.themeMode,
    `${label}: expected theme mode ${mode.themeMode}, received ${snapshot.themeMode}`,
  );
  assert(
    snapshot.themePreset === "custom",
    `${label}: expected preset custom, received ${snapshot.themePreset}`,
  );
  assert(
    snapshot.themeResolved === mode.expectedResolved,
    `${label}: expected resolved mode ${mode.expectedResolved}, received ${snapshot.themeResolved}`,
  );
  assert(
    snapshot.themeCustomSeedHex === customSeedHex,
    `${label}: expected custom seed ${customSeedHex}, received ${snapshot.themeCustomSeedHex}`,
  );
}

async function captureRoute(page, options) {
  await page.setViewportSize({
    width: options.width,
    height: options.height,
  });
  await page.goto(options.url, { waitUntil: "load" });
  await page.waitForSelector(options.readyText);
  await waitForThemeState(page, options.mode);

  for (const selector of Object.values(options.selectors)) {
    await page.waitForSelector(selector);
  }

  const beforeScroll = await collectLayoutSnapshot(page, options.selectors);

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(150);
  const afterScroll = await collectLayoutSnapshot(page, options.selectors);

  const screenshotPath = path.join(
    artifactDir,
    `${options.mode.slug}-${options.route}-${options.width}.png`,
  );

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return {
    route: options.route,
    width: options.width,
    screenshotPath,
    beforeScroll,
    afterScroll,
  };
}

async function runCompactWidthReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const context = await browser.newContext({
      colorScheme: "light",
    });
    const settingsDriverPage = await context.newPage();
    settingsDriverPage.setDefaultTimeout(20_000);

    const results = [];

    for (const mode of modes) {
      console.log(`phase107: reviewing ${mode.slug}-custom`);
      await applyCustomSeed(settingsDriverPage, mode);

      const modeResult = {
        mode: mode.slug,
        widths: [],
      };

      let firstPrimary = null;
      let firstTertiary = null;

      for (const width of widths) {
        const dashboardPage = await context.newPage();
        dashboardPage.setDefaultTimeout(20_000);
        const dashboardResult = await captureRoute(dashboardPage, {
          route: "dashboard",
          width,
          height: viewportHeights.dashboard,
          url: dashboardUrl,
          readyText: "text=Provider cards",
          mode,
          selectors: {
            summaryPill: '[data-summary-tone="error"]',
            claudeCard: '[data-provider-id="claude-code"]',
          },
        });
        await dashboardPage.close();

        const settingsPage = await context.newPage();
        settingsPage.setDefaultTimeout(20_000);
        const settingsResult = await captureRoute(settingsPage, {
          route: "settings",
          width,
          height: viewportHeights.settings,
          url: settingsUrl,
          readyText: "text=Global Preferences",
          mode,
          selectors: {
            themeCard:
              '[data-theme-stability-surface="settings-theme-customization-card"]',
            cursorCard: '[data-provider-id="cursor"]',
          },
        });
        await settingsPage.close();

        const detailPage = await context.newPage();
        detailPage.setDefaultTimeout(20_000);
        const detailResult = await captureRoute(detailPage, {
          route: "provider-detail",
          width,
          height: viewportHeights.detail,
          url: codexDetailUrl,
          readyText: "text=Provider Detail",
          mode,
          selectors: {
            syncCard:
              '[data-theme-stability-surface="provider-detail-sync-status-card"]',
            trustNote:
              '[data-theme-stability-surface="provider-detail-trust-note"]',
          },
        });
        await detailPage.close();

        const popupPage = await context.newPage();
        popupPage.setDefaultTimeout(20_000);
        const popupResult = await captureRoute(popupPage, {
          route: "popup",
          width,
          height: viewportHeights.popup,
          url: popupUrl,
          readyText: "text=Quick glance",
          mode,
          selectors: {
            popupHeader: '[data-theme-local-surface="popup-header-label"]',
            popupCard: '[data-theme-local-surface="popup-snapshot-status-card"]',
          },
        });
        await popupPage.close();

        for (const routeResult of [
          dashboardResult,
          settingsResult,
          detailResult,
          popupResult,
        ]) {
          verifyThemeSnapshot(
            `${mode.slug}-${routeResult.route}-${width}`,
            routeResult.beforeScroll,
            mode,
          );
          assert(
            routeResult.beforeScroll.horizontalOverflow <= 1,
            `${mode.slug}-${routeResult.route}-${width}: overflow ${routeResult.beforeScroll.horizontalOverflow}px`,
          );
        }

        assert(
          settingsResult.afterScroll.topBarTop !== null &&
            settingsResult.afterScroll.topBarTop <= 32,
          `${mode.slug}-settings-${width}: sticky top bar drifted too far after scroll: top=${settingsResult.afterScroll.topBarTop}`,
        );

        if (firstPrimary === null) {
          firstPrimary = dashboardResult.beforeScroll.cssVars.primary;
          firstTertiary = dashboardResult.beforeScroll.cssVars.tertiary;
        } else {
          assert(
            normalize(firstPrimary) ===
              normalize(dashboardResult.beforeScroll.cssVars.primary),
            `${mode.slug}: expected compact widths to keep the same primary role, received ${firstPrimary} vs ${dashboardResult.beforeScroll.cssVars.primary}`,
          );
          assert(
            normalize(firstTertiary) ===
              normalize(dashboardResult.beforeScroll.cssVars.tertiary),
            `${mode.slug}: expected compact widths to keep the same tertiary role, received ${firstTertiary} vs ${dashboardResult.beforeScroll.cssVars.tertiary}`,
          );
        }

        modeResult.widths.push({
          width,
          dashboard: dashboardResult,
          settings: settingsResult,
          detail: detailResult,
          popup: popupResult,
        });
      }

      results.push(modeResult);
    }

    assert(
      normalize(results[0].widths[0].dashboard.beforeScroll.cssVars.primary) !==
        normalize(results[1].widths[0].dashboard.beforeScroll.cssVars.primary),
      "phase107: expected light and dark custom-seed primary roles to differ at compact width",
    );
    assert(
      normalize(results[0].widths[0].dashboard.beforeScroll.cssVars.tertiary) !==
        normalize(results[1].widths[0].dashboard.beforeScroll.cssVars.tertiary),
      "phase107: expected light and dark custom-seed tertiary roles to differ at compact width",
    );

    const resultsPath = path.join(artifactDir, "phase107-results.json");
    await writeFile(
      resultsPath,
      JSON.stringify(
        {
          reviewedAt: new Date().toISOString(),
          artifactDir,
          customSeedHex,
          widths,
          modes: results,
        },
        null,
        2,
      ),
    );

    console.log(`phase107: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runCompactWidthReview();
