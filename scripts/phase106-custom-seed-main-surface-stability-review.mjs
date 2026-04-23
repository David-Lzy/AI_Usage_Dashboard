import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase106-custom-seed-main-surface-stability-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const codexDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/codex";

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

function assertSurfaceMatches(left, right, label) {
  assert(left !== null, `${label}: left surface missing`);
  assert(right !== null, `${label}: right surface missing`);
  assert(
    normalize(left.backgroundColor) === normalize(right.backgroundColor),
    `${label}: expected matching background colors, received ${left.backgroundColor} vs ${right.backgroundColor}`,
  );
  assert(
    normalize(left.borderColor) === normalize(right.borderColor),
    `${label}: expected matching border colors, received ${left.borderColor} vs ${right.borderColor}`,
  );
}

async function applyThemeVariant(page, mode, variant) {
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

  if (variant === "default") {
    await themePresetSelect.selectOption("default");
    await page.waitForFunction(
      ({ expectedThemeMode, expectedResolved }) => {
        const root = document.documentElement;

        return (
          root.dataset.themeMode === expectedThemeMode &&
          root.dataset.themePreset === "default" &&
          root.dataset.themeResolved === expectedResolved &&
          !("themeCustomSeedHex" in root.dataset)
        );
      },
      {
        expectedThemeMode: mode.themeMode,
        expectedResolved: mode.expectedResolved,
      },
    );
    return;
  }

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

async function waitForThemeState(page, mode, variant) {
  await page.waitForFunction(
    ({ expectedThemeMode, expectedResolved, expectedPreset, expectedSeed }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themePreset === expectedPreset &&
        root.dataset.themeResolved === expectedResolved &&
        ((expectedSeed === null && !("themeCustomSeedHex" in root.dataset)) ||
          root.dataset.themeCustomSeedHex === expectedSeed)
      );
    },
    {
      expectedThemeMode: mode.themeMode,
      expectedResolved: mode.expectedResolved,
      expectedPreset: variant,
      expectedSeed: variant === "custom" ? customSeedHex : null,
    },
  );
}

async function readSurfaceSnapshot(page, selectors) {
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
      themeCustomSeedHex: root.dataset.themeCustomSeedHex ?? null,
      cssVars: {
        primary: rootStyles.getPropertyValue("--md-sys-color-primary").trim(),
        tertiary: rootStyles.getPropertyValue("--md-sys-color-tertiary").trim(),
      },
      surfaces: Object.fromEntries(
        Object.entries(currentSelectors).map(([key, selector]) => [
          key,
          styleSnapshot(document.querySelector(selector)),
        ]),
      ),
    };
  }, selectors);
}

function verifyThemeState(label, snapshot, mode, variant) {
  assert(
    snapshot.themeMode === mode.themeMode,
    `${label}: expected theme mode ${mode.themeMode}, received ${snapshot.themeMode}`,
  );
  assert(
    snapshot.themePreset === variant,
    `${label}: expected preset ${variant}, received ${snapshot.themePreset}`,
  );
  assert(
    snapshot.themeResolved === mode.expectedResolved,
    `${label}: expected resolved mode ${mode.expectedResolved}, received ${snapshot.themeResolved}`,
  );

  if (variant === "custom") {
    assert(
      snapshot.themeCustomSeedHex === customSeedHex,
      `${label}: expected custom seed ${customSeedHex}, received ${snapshot.themeCustomSeedHex}`,
    );
  } else {
    assert(
      snapshot.themeCustomSeedHex === null,
      `${label}: expected no active custom seed, received ${snapshot.themeCustomSeedHex}`,
    );
  }
}

async function runMainSurfaceStabilityReview() {
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

    const results = [];

    for (const mode of modes) {
      const modeResult = {
        mode: mode.slug,
        default: null,
        custom: null,
      };

      for (const variant of ["default", "custom"]) {
        console.log(`phase106: reviewing ${mode.slug}-${variant}`);
        await applyThemeVariant(settingsPage, mode, variant);

        const dashboardPage = await context.newPage();
        dashboardPage.setDefaultTimeout(20_000);
        await dashboardPage.goto(dashboardUrl, { waitUntil: "load" });
        await dashboardPage.waitForSelector("text=Provider cards");
        await waitForThemeState(dashboardPage, mode, variant);
        await dashboardPage.waitForSelector('[data-summary-tone="error"]');
        await dashboardPage.waitForSelector('[data-provider-id="claude-code"]');
        await dashboardPage.waitForSelector('[data-provider-id="gemini"]');

        const settingsSurfacePage = await context.newPage();
        settingsSurfacePage.setDefaultTimeout(20_000);
        await settingsSurfacePage.goto(settingsUrl, { waitUntil: "load" });
        await settingsSurfacePage.waitForSelector("text=Global Preferences");
        await waitForThemeState(settingsSurfacePage, mode, variant);
        await settingsSurfacePage.waitForSelector(
          '[data-theme-stability-surface="settings-theme-customization-card"]',
        );
        await settingsSurfacePage.waitForSelector('[data-provider-id="cursor"]');
        await settingsSurfacePage.waitForSelector(
          '[data-theme-stability-surface="settings-cursor-operational-note"]',
        );
        await settingsSurfacePage.waitForSelector(
          '[data-theme-stability-surface="settings-cursor-session-note"]',
        );

        const detailPage = await context.newPage();
        detailPage.setDefaultTimeout(20_000);
        await detailPage.goto(codexDetailUrl, { waitUntil: "load" });
        await detailPage.waitForSelector("text=Provider Detail");
        await waitForThemeState(detailPage, mode, variant);
        await detailPage.waitForSelector(
          '[data-theme-stability-surface="provider-detail-sync-status-card"]',
        );
        await detailPage.waitForSelector(
          '[data-theme-stability-surface="provider-detail-fidelity-note"]',
        );

        const dashboardSnapshot = await readSurfaceSnapshot(dashboardPage, {
          errorSummaryPill: '[data-summary-tone="error"]',
          claudeCard: '[data-provider-id="claude-code"]',
          geminiCard: '[data-provider-id="gemini"]',
        });
        const settingsSnapshot = await readSurfaceSnapshot(settingsSurfacePage, {
          themeCustomizationCard:
            '[data-theme-stability-surface="settings-theme-customization-card"]',
          cursorSourceCard: '[data-provider-id="cursor"]',
          cursorOperationalNote:
            '[data-theme-stability-surface="settings-cursor-operational-note"]',
          cursorSessionNote:
            '[data-theme-stability-surface="settings-cursor-session-note"]',
        });
        const detailSnapshot = await readSurfaceSnapshot(detailPage, {
          syncStatusCard:
            '[data-theme-stability-surface="provider-detail-sync-status-card"]',
          usageCard:
            '[data-theme-stability-surface="provider-detail-usage-card"]',
          fidelityNote:
            '[data-theme-stability-surface="provider-detail-fidelity-note"]',
          contractNote:
            '[data-theme-stability-surface="provider-detail-contract-note"]',
          trustNote:
            '[data-theme-stability-surface="provider-detail-trust-note"]',
        });

        verifyThemeState(
          `${mode.slug}-${variant} dashboard`,
          dashboardSnapshot,
          mode,
          variant,
        );
        verifyThemeState(
          `${mode.slug}-${variant} settings`,
          settingsSnapshot,
          mode,
          variant,
        );
        verifyThemeState(
          `${mode.slug}-${variant} detail`,
          detailSnapshot,
          mode,
          variant,
        );

        const dashboardScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-dashboard-main-surface-stability.png`,
        );
        const settingsScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-settings-main-surface-stability.png`,
        );
        const detailScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-detail-main-surface-stability.png`,
        );

        await dashboardPage.screenshot({
          path: dashboardScreenshotPath,
          fullPage: true,
        });
        await settingsSurfacePage.screenshot({
          path: settingsScreenshotPath,
          fullPage: true,
        });
        await detailPage.screenshot({
          path: detailScreenshotPath,
          fullPage: true,
        });

        modeResult[variant] = {
          dashboardScreenshotPath,
          settingsScreenshotPath,
          detailScreenshotPath,
          dashboard: dashboardSnapshot,
          settings: settingsSnapshot,
          detail: detailSnapshot,
        };

        await dashboardPage.close();
        await settingsSurfacePage.close();
        await detailPage.close();
      }

      assert(
        normalize(modeResult.default.dashboard.cssVars.primary) !==
          normalize(modeResult.custom.dashboard.cssVars.primary),
        `${mode.slug}: expected custom seed to change dashboard primary role`,
      );
      assert(
        normalize(modeResult.default.dashboard.cssVars.tertiary) !==
          normalize(modeResult.custom.dashboard.cssVars.tertiary),
        `${mode.slug}: expected custom seed to change dashboard tertiary role`,
      );

      assertSurfaceMatches(
        modeResult.default.dashboard.surfaces.errorSummaryPill,
        modeResult.custom.dashboard.surfaces.errorSummaryPill,
        `${mode.slug}: dashboard error summary pill`,
      );
      assertSurfaceMatches(
        modeResult.default.dashboard.surfaces.claudeCard,
        modeResult.custom.dashboard.surfaces.claudeCard,
        `${mode.slug}: dashboard Claude error card`,
      );
      assertSurfaceMatches(
        modeResult.default.dashboard.surfaces.geminiCard,
        modeResult.custom.dashboard.surfaces.geminiCard,
        `${mode.slug}: dashboard Gemini warning card`,
      );

      assertSurfaceMatches(
        modeResult.default.settings.surfaces.themeCustomizationCard,
        modeResult.custom.settings.surfaces.themeCustomizationCard,
        `${mode.slug}: settings theme customization card`,
      );
      assertSurfaceMatches(
        modeResult.default.settings.surfaces.cursorSourceCard,
        modeResult.custom.settings.surfaces.cursorSourceCard,
        `${mode.slug}: settings Cursor source card`,
      );
      assertSurfaceMatches(
        modeResult.default.settings.surfaces.cursorOperationalNote,
        modeResult.custom.settings.surfaces.cursorOperationalNote,
        `${mode.slug}: settings Cursor operational note`,
      );
      assertSurfaceMatches(
        modeResult.default.settings.surfaces.cursorSessionNote,
        modeResult.custom.settings.surfaces.cursorSessionNote,
        `${mode.slug}: settings Cursor session note`,
      );

      assertSurfaceMatches(
        modeResult.default.detail.surfaces.syncStatusCard,
        modeResult.custom.detail.surfaces.syncStatusCard,
        `${mode.slug}: provider detail sync-status card`,
      );
      assertSurfaceMatches(
        modeResult.default.detail.surfaces.usageCard,
        modeResult.custom.detail.surfaces.usageCard,
        `${mode.slug}: provider detail usage card`,
      );
      assertSurfaceMatches(
        modeResult.default.detail.surfaces.fidelityNote,
        modeResult.custom.detail.surfaces.fidelityNote,
        `${mode.slug}: provider detail fidelity note`,
      );
      assertSurfaceMatches(
        modeResult.default.detail.surfaces.contractNote,
        modeResult.custom.detail.surfaces.contractNote,
        `${mode.slug}: provider detail contract note`,
      );
      assertSurfaceMatches(
        modeResult.default.detail.surfaces.trustNote,
        modeResult.custom.detail.surfaces.trustNote,
        `${mode.slug}: provider detail trust note`,
      );

      results.push(modeResult);
    }

    const resultsPath = path.join(artifactDir, "phase106-results.json");
    await writeFile(
      resultsPath,
      JSON.stringify(
        {
          reviewedAt: new Date().toISOString(),
          artifactDir,
          customSeedHex,
          modes: results,
        },
        null,
        2,
      ),
    );

    console.log(`phase106: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runMainSurfaceStabilityReview();
