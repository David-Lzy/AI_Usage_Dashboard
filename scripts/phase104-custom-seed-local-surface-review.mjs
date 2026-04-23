import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase104-custom-seed-local-surface-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const auditHubUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit";

const scenarios = [
  {
    slug: "custom-seed-local-light",
    themeMode: "light",
    themePreset: "custom",
    themeCustomSeedHex: "#4F46E5",
    expectedResolved: "light",
  },
  {
    slug: "custom-seed-local-dark",
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
        secondaryContainer: rootStyles
          .getPropertyValue("--md-sys-color-secondary-container")
          .trim(),
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
    `${label}: expected custom seed ${scenario.themeCustomSeedHex}, received ${snapshot.themeCustomSeedHex}`,
  );
}

async function runLocalSurfaceReview() {
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
      console.log(`phase104: reviewing ${scenario.slug}`);
      await setCustomSeedTheme(settingsPage, scenario);

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

      const popupSnapshot = await readSurfaceSnapshot(popupPage, {
        headerLabel: '[data-theme-local-surface="popup-header-label"]',
        actionsLabel: '[data-theme-local-surface="popup-actions-label"]',
        featuredSectionLabel:
          '[data-theme-local-surface="popup-featured-section-label"]',
        openDashboardButton:
          '[data-theme-local-surface="popup-open-dashboard"]',
        firstOpenDetailButton:
          '[data-theme-local-surface="popup-first-open-detail"]',
      });
      const auditSnapshot = await readSurfaceSnapshot(auditPage, {
        heroLabel: '[data-theme-local-surface="audit-hero-label"]',
        heroChip: '[data-theme-local-surface="audit-hero-chip"]',
        openSettingsLink:
          '[data-theme-local-surface="audit-open-settings-link"]',
      });

      verifyThemeState(`${scenario.slug} popup`, popupSnapshot, scenario);
      verifyThemeState(`${scenario.slug} audit`, auditSnapshot, scenario);

      assert(
        colorsClose(
          popupSnapshot.surfaces.headerLabel?.color,
          popupSnapshot.cssVars.tertiary,
        ),
        `${scenario.slug}: expected popup header label to use the tertiary role`,
      );
      assert(
        colorsClose(
          popupSnapshot.surfaces.actionsLabel?.color,
          popupSnapshot.cssVars.tertiary,
        ),
        `${scenario.slug}: expected popup actions label to use the tertiary role`,
      );
      assert(
        colorsClose(
          popupSnapshot.surfaces.featuredSectionLabel?.color,
          popupSnapshot.cssVars.tertiary,
        ),
        `${scenario.slug}: expected popup featured section label to use the tertiary role`,
      );
      assert(
        colorsClose(
          popupSnapshot.surfaces.openDashboardButton?.color,
          popupSnapshot.cssVars.primary,
        ),
        `${scenario.slug}: expected popup quick-action button to use the primary role`,
      );
      assert(
        colorsClose(
          popupSnapshot.surfaces.firstOpenDetailButton?.color,
          popupSnapshot.cssVars.primary,
        ),
        `${scenario.slug}: expected popup provider-detail button to use the primary role`,
      );
      assert(
        colorsClose(
          auditSnapshot.surfaces.heroLabel?.color,
          auditSnapshot.cssVars.tertiary,
        ),
        `${scenario.slug}: expected audit hero label to use the tertiary role`,
      );
      assert(
        colorsClose(
          auditSnapshot.surfaces.heroChip?.backgroundColor,
          auditSnapshot.cssVars.secondaryContainer,
        ),
        `${scenario.slug}: expected audit hero chip to use the secondary-container role`,
      );
      assert(
        colorsClose(
          auditSnapshot.surfaces.openSettingsLink?.color,
          auditSnapshot.cssVars.primary,
        ),
        `${scenario.slug}: expected audit open-settings link to use the primary role`,
      );

      const popupScreenshotPath = path.join(
        artifactDir,
        `${scenario.slug}-popup-local-surfaces.png`,
      );
      const auditScreenshotPath = path.join(
        artifactDir,
        `${scenario.slug}-audit-local-surfaces.png`,
      );

      await popupPage.screenshot({ path: popupScreenshotPath, fullPage: true });
      await auditPage.screenshot({ path: auditScreenshotPath, fullPage: true });

      results.push({
        slug: scenario.slug,
        themeMode: scenario.themeMode,
        themePreset: scenario.themePreset,
        themeCustomSeedHex: scenario.themeCustomSeedHex,
        expectedResolved: scenario.expectedResolved,
        popupScreenshotPath,
        auditScreenshotPath,
        snapshots: {
          popup: popupSnapshot,
          audit: auditSnapshot,
        },
      });

      await popupPage.close();
      await auditPage.close();
    }

    assert(
      results.length === 2 &&
        results[0].snapshots.popup.cssVars.primary !==
          results[1].snapshots.popup.cssVars.primary,
      "expected explicit light and dark custom-seed local surfaces to resolve different primary roles for the same seed",
    );

    const resultsPath = path.join(artifactDir, "phase104-results.json");
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

    console.log(`phase104: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runLocalSurfaceReview();
