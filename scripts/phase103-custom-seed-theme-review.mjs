import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase103-custom-seed-theme-review");
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const auditHubUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit";

const scenarios = [
  {
    slug: "custom-seed-light",
    themeMode: "light",
    themePreset: "custom",
    themeCustomSeedHex: "#4F46E5",
    expectedResolved: "light",
  },
  {
    slug: "custom-seed-dark",
    themeMode: "dark",
    themePreset: "custom",
    themeCustomSeedHex: "#4F46E5",
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

  const value = input.trim().toLowerCase();

  if (value.startsWith("#")) {
    if (value.length === 4) {
      return {
        r: Number.parseInt(value[1] + value[1], 16),
        g: Number.parseInt(value[2] + value[2], 16),
        b: Number.parseInt(value[3] + value[3], 16),
      };
    }

    if (value.length === 7) {
      return {
        r: Number.parseInt(value.slice(1, 3), 16),
        g: Number.parseInt(value.slice(3, 5), 16),
        b: Number.parseInt(value.slice(5, 7), 16),
      };
    }
  }

  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);

  if (rgbMatch) {
    const [r, g, b] = rgbMatch[1]
      .split(",")
      .slice(0, 3)
      .map((part) => Number.parseFloat(part.trim()));

    return { r, g, b };
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

async function setCustomSeedTheme(page, scenario) {
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
  await customSeedInput.waitFor({ state: "visible", timeout: 20_000 });

  await themeModeSelect.selectOption(scenario.themeMode);
  await themePresetSelect.selectOption("custom");
  await customSeedInput.fill(scenario.themeCustomSeedHex);
  await applyButton.click();

  await page.waitForFunction(
    ({
      expectedThemeMode,
      expectedThemePreset,
      expectedResolved,
      expectedSeed,
    }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themePreset === expectedThemePreset &&
        root.dataset.themeResolved === expectedResolved &&
        root.dataset.themeCustomSeedHex === expectedSeed
      );
    },
    {
      expectedThemeMode: scenario.themeMode,
      expectedThemePreset: scenario.themePreset,
      expectedResolved: scenario.expectedResolved,
      expectedSeed: scenario.themeCustomSeedHex,
    },
  );
}

async function waitForThemeState(page, scenario) {
  await page.waitForFunction(
    ({
      expectedThemeMode,
      expectedThemePreset,
      expectedResolved,
      expectedSeed,
    }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themePreset === expectedThemePreset &&
        root.dataset.themeResolved === expectedResolved &&
        root.dataset.themeCustomSeedHex === expectedSeed
      );
    },
    {
      expectedThemeMode: scenario.themeMode,
      expectedThemePreset: scenario.themePreset,
      expectedResolved: scenario.expectedResolved,
      expectedSeed: scenario.themeCustomSeedHex,
    },
  );
}

async function readSurfaceSnapshot(page, extraSelectors = {}) {
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
        secondaryContainer: rootStyles
          .getPropertyValue("--md-sys-color-secondary-container")
          .trim(),
        tertiary: rootStyles.getPropertyValue("--md-sys-color-tertiary").trim(),
      },
      previewPrimary: currentSelectors.previewPrimary
        ? styleSnapshot(document.querySelector(currentSelectors.previewPrimary))
        : null,
      previewSecondaryContainer: currentSelectors.previewSecondaryContainer
        ? styleSnapshot(
            document.querySelector(currentSelectors.previewSecondaryContainer),
          )
        : null,
      previewTertiary: currentSelectors.previewTertiary
        ? styleSnapshot(document.querySelector(currentSelectors.previewTertiary))
        : null,
      heroLabel: currentSelectors.heroLabel
        ? styleSnapshot(document.querySelector(currentSelectors.heroLabel))
        : null,
      heroChip: currentSelectors.heroChip
        ? styleSnapshot(document.querySelector(currentSelectors.heroChip))
        : null,
    };
  }, extraSelectors);
}

function verifyThemeState(label, snapshot, scenario) {
  assert(
    snapshot.themeMode === scenario.themeMode,
    `${label}: expected theme mode ${scenario.themeMode}, received ${snapshot.themeMode}`,
  );
  assert(
    snapshot.themePreset === scenario.themePreset,
    `${label}: expected theme preset ${scenario.themePreset}, received ${snapshot.themePreset}`,
  );
  assert(
    snapshot.themeResolved === scenario.expectedResolved,
    `${label}: expected resolved theme ${scenario.expectedResolved}, received ${snapshot.themeResolved}`,
  );
  assert(
    snapshot.themeCustomSeedHex === scenario.themeCustomSeedHex,
    `${label}: expected theme seed ${scenario.themeCustomSeedHex}, received ${snapshot.themeCustomSeedHex}`,
  );
}

function verifyMatchingPalette(label, snapshot, baselineSnapshot) {
  assert(
    normalizeHex(snapshot.cssVars.primary) ===
      normalizeHex(baselineSnapshot.cssVars.primary),
    `${label}: expected primary ${baselineSnapshot.cssVars.primary}, received ${snapshot.cssVars.primary}`,
  );
  assert(
    normalizeHex(snapshot.cssVars.secondaryContainer) ===
      normalizeHex(baselineSnapshot.cssVars.secondaryContainer),
    `${label}: expected secondary container ${baselineSnapshot.cssVars.secondaryContainer}, received ${snapshot.cssVars.secondaryContainer}`,
  );
  assert(
    normalizeHex(snapshot.cssVars.tertiary) ===
      normalizeHex(baselineSnapshot.cssVars.tertiary),
    `${label}: expected tertiary ${baselineSnapshot.cssVars.tertiary}, received ${snapshot.cssVars.tertiary}`,
  );
}

async function runCustomSeedThemeReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const context = await browser.newContext({
      colorScheme: "light",
    });
    const results = [];

    const settingsPage = await context.newPage();
    settingsPage.setDefaultTimeout(20_000);

    for (const scenario of scenarios) {
      console.log(`phase103: reviewing ${scenario.slug}`);
      await setCustomSeedTheme(settingsPage, scenario);

      const dashboardPage = await context.newPage();
      dashboardPage.setDefaultTimeout(20_000);
      await dashboardPage.goto(dashboardUrl, { waitUntil: "load" });
      await dashboardPage.waitForSelector("text=AI Usage Dashboard");
      await waitForThemeState(dashboardPage, scenario);

      const popupPage = await context.newPage();
      popupPage.setDefaultTimeout(20_000);
      await popupPage.goto(popupUrl, { waitUntil: "load" });
      await popupPage.waitForSelector("text=Quick glance");
      await waitForThemeState(popupPage, scenario);

      const auditPage = await context.newPage();
      auditPage.setDefaultTimeout(20_000);
      await auditPage.goto(auditHubUrl, { waitUntil: "load" });
      await auditPage.waitForSelector("text=Interaction Audit");
      await waitForThemeState(auditPage, scenario);

      const settingsSnapshot = await readSurfaceSnapshot(settingsPage, {
        previewPrimary:
          ".theme-preview-grid .theme-preview-swatch:nth-child(1) .theme-preview-swatch__color",
        previewSecondaryContainer:
          ".theme-preview-grid .theme-preview-swatch:nth-child(2) .theme-preview-swatch__color",
        previewTertiary:
          ".theme-preview-grid .theme-preview-swatch:nth-child(3) .theme-preview-swatch__color",
      });
      const dashboardSnapshot = await readSurfaceSnapshot(dashboardPage);
      const popupSnapshot = await readSurfaceSnapshot(popupPage);
      const auditSnapshot = await readSurfaceSnapshot(auditPage, {
        heroLabel:
          ".interaction-audit-shell .hero-card .section-label",
        heroChip:
          ".interaction-audit-shell .hero-card .token-chip",
      });

      verifyThemeState(`${scenario.slug} settings`, settingsSnapshot, scenario);
      verifyThemeState(`${scenario.slug} dashboard`, dashboardSnapshot, scenario);
      verifyThemeState(`${scenario.slug} popup`, popupSnapshot, scenario);
      verifyThemeState(`${scenario.slug} audit`, auditSnapshot, scenario);

      verifyMatchingPalette(
        `${scenario.slug} dashboard`,
        dashboardSnapshot,
        settingsSnapshot,
      );
      verifyMatchingPalette(
        `${scenario.slug} popup`,
        popupSnapshot,
        settingsSnapshot,
      );
      verifyMatchingPalette(
        `${scenario.slug} audit`,
        auditSnapshot,
        settingsSnapshot,
      );

      assert(
        colorsClose(
          settingsSnapshot.previewPrimary?.backgroundColor,
          settingsSnapshot.cssVars.primary,
        ),
        `${scenario.slug}: expected settings primary preview to match the active primary role`,
      );
      assert(
        colorsClose(
          settingsSnapshot.previewSecondaryContainer?.backgroundColor,
          settingsSnapshot.cssVars.secondaryContainer,
        ),
        `${scenario.slug}: expected settings secondary preview to match the active secondary-container role`,
      );
      assert(
        colorsClose(
          settingsSnapshot.previewTertiary?.backgroundColor,
          settingsSnapshot.cssVars.tertiary,
        ),
        `${scenario.slug}: expected settings tertiary preview to match the active tertiary role`,
      );
      assert(
        colorsClose(auditSnapshot.heroLabel?.color, auditSnapshot.cssVars.tertiary),
        `${scenario.slug}: expected audit hero label to use the tertiary role`,
      );
      assert(
        colorsClose(
          auditSnapshot.heroChip?.backgroundColor,
          auditSnapshot.cssVars.secondaryContainer,
        ),
        `${scenario.slug}: expected audit hero chip to use the secondary-container role`,
      );

      const settingsScreenshotPath = path.join(
        artifactDir,
        `${scenario.slug}-settings.png`,
      );
      const dashboardScreenshotPath = path.join(
        artifactDir,
        `${scenario.slug}-dashboard.png`,
      );
      const popupScreenshotPath = path.join(
        artifactDir,
        `${scenario.slug}-popup.png`,
      );
      const auditScreenshotPath = path.join(
        artifactDir,
        `${scenario.slug}-audit.png`,
      );

      await settingsPage.screenshot({ path: settingsScreenshotPath, fullPage: true });
      await dashboardPage.screenshot({
        path: dashboardScreenshotPath,
        fullPage: true,
      });
      await popupPage.screenshot({ path: popupScreenshotPath, fullPage: true });
      await auditPage.screenshot({ path: auditScreenshotPath, fullPage: true });

      results.push({
        slug: scenario.slug,
        themeMode: scenario.themeMode,
        themePreset: scenario.themePreset,
        themeCustomSeedHex: scenario.themeCustomSeedHex,
        expectedResolved: scenario.expectedResolved,
        settingsScreenshotPath,
        dashboardScreenshotPath,
        popupScreenshotPath,
        auditScreenshotPath,
        snapshots: {
          settings: settingsSnapshot,
          dashboard: dashboardSnapshot,
          popup: popupSnapshot,
          audit: auditSnapshot,
        },
      });

      await dashboardPage.close();
      await popupPage.close();
      await auditPage.close();
    }

    assert(
      normalizeHex(results[0].snapshots.settings.cssVars.primary) !==
        normalizeHex(results[1].snapshots.settings.cssVars.primary),
      "expected explicit light and dark custom-seed primary roles to differ for the same seed",
    );

    const resultsPath = path.join(artifactDir, "phase103-results.json");
    await writeFile(
      resultsPath,
      JSON.stringify(
        {
          reviewedAt: new Date().toISOString(),
          artifactDir,
          scenarios: results,
        },
        null,
        2,
      ),
    );

    console.log(`phase103: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runCustomSeedThemeReview();
