import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase102-interaction-audit-theme-alignment-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const auditHubUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit";

const initialScenario = {
  slug: "initial-meadow-dark",
  themeMode: "dark",
  themePreset: "meadow",
  expectedResolved: "dark",
  expectedPalette: {
    primary: "#90d58f",
    secondaryContainer: "#364b38",
    tertiary: "#9fd0d5",
  },
};

const liveUpdateScenario = {
  slug: "live-sunset-light",
  themeMode: "light",
  themePreset: "sunset",
  expectedResolved: "light",
  expectedPalette: {
    primary: "#9a4d00",
    secondaryContainer: "#ffdccd",
    tertiary: "#6d5b91",
  },
};

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

  if (!rgbMatch) {
    return null;
  }

  const [r, g, b] = rgbMatch[1]
    .split(",")
    .slice(0, 3)
    .map((part) => Number.parseFloat(part.trim()));

  return { r, g, b };
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
    ({ themeMode, themePreset, themeResolved }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === themeMode &&
        root.dataset.themePreset === themePreset &&
        root.dataset.themeResolved === themeResolved
      );
    },
    {
      themeMode: scenario.themeMode,
      themePreset: scenario.themePreset,
      themeResolved: scenario.expectedResolved,
    },
  );
}

async function waitForAuditTheme(page, scenario) {
  await page.waitForFunction(
    ({ themeMode, themePreset, themeResolved }) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === themeMode &&
        root.dataset.themePreset === themePreset &&
        root.dataset.themeResolved === themeResolved
      );
    },
    {
      themeMode: scenario.themeMode,
      themePreset: scenario.themePreset,
      themeResolved: scenario.expectedResolved,
    },
  );
}

async function readAuditSnapshot(page) {
  return page.evaluate(() => {
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
      heroLabel: styleSnapshot(
        document.querySelector(".interaction-audit-shell .hero-card .section-label"),
      ),
      heroChip: styleSnapshot(
        document.querySelector(".interaction-audit-shell .hero-card .token-chip"),
      ),
    };
  });
}

function verifyAuditSnapshot(label, snapshot, scenario) {
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
    normalizeHex(snapshot.cssVars.primary) ===
      normalizeHex(scenario.expectedPalette.primary),
    `${label}: expected primary ${scenario.expectedPalette.primary}, received ${snapshot.cssVars.primary}`,
  );
  assert(
    normalizeHex(snapshot.cssVars.secondaryContainer) ===
      normalizeHex(scenario.expectedPalette.secondaryContainer),
    `${label}: expected secondary container ${scenario.expectedPalette.secondaryContainer}, received ${snapshot.cssVars.secondaryContainer}`,
  );
  assert(
    normalizeHex(snapshot.cssVars.tertiary) ===
      normalizeHex(scenario.expectedPalette.tertiary),
    `${label}: expected tertiary ${scenario.expectedPalette.tertiary}, received ${snapshot.cssVars.tertiary}`,
  );
  assert(
    colorsClose(snapshot.heroLabel?.color, snapshot.cssVars.tertiary),
    `${label}: expected audit-hub hero label to use the tertiary role`,
  );
  assert(
    colorsClose(
      snapshot.heroChip?.backgroundColor,
      snapshot.cssVars.secondaryContainer,
    ),
    `${label}: expected audit-hub hero chip to use the secondary-container role`,
  );
}

async function runInteractionAuditThemeAlignmentReview() {
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
    console.log("phase102: setting initial shared theme");
    await setThemeSettings(settingsPage, initialScenario);

    const auditPage = await context.newPage();
    auditPage.setDefaultTimeout(20_000);
    await auditPage.setViewportSize({ width: 1480, height: 1600 });
    await auditPage.goto(auditHubUrl, { waitUntil: "load" });
    await auditPage.waitForSelector(
      '.interaction-audit-frame[title="Settings audit frame"]',
    );
    await auditPage.waitForSelector(".interaction-audit-shell .hero-card .token-chip");
    await waitForAuditTheme(auditPage, initialScenario);

    const initialSnapshot = await readAuditSnapshot(auditPage);
    verifyAuditSnapshot("initial snapshot", initialSnapshot, initialScenario);

    const initialScreenshotPath = path.join(
      artifactDir,
      `${initialScenario.slug}.png`,
    );
    await auditPage.screenshot({
      path: initialScreenshotPath,
      fullPage: true,
    });

    console.log("phase102: updating shared theme from embedded settings frame");
    const settingsFrame = auditPage.frameLocator(
      '.interaction-audit-frame[title="Settings audit frame"]',
    );
    await settingsFrame
      .locator("label.form-field")
      .filter({ hasText: "Theme mode" })
      .locator("select")
      .selectOption(liveUpdateScenario.themeMode);
    await settingsFrame
      .locator("label.form-field")
      .filter({ hasText: "Accent preset" })
      .locator("select")
      .selectOption(liveUpdateScenario.themePreset);

    await waitForAuditTheme(auditPage, liveUpdateScenario);

    const liveUpdateSnapshot = await readAuditSnapshot(auditPage);
    verifyAuditSnapshot(
      "live update snapshot",
      liveUpdateSnapshot,
      liveUpdateScenario,
    );

    const liveUpdateScreenshotPath = path.join(
      artifactDir,
      `${liveUpdateScenario.slug}.png`,
    );
    await auditPage.screenshot({
      path: liveUpdateScreenshotPath,
      fullPage: true,
    });

    const result = {
      reviewedAt: new Date().toISOString(),
      artifactDir,
      initialScenario: {
        ...initialScenario,
        screenshotPath: initialScreenshotPath,
        snapshot: initialSnapshot,
      },
      liveUpdateScenario: {
        ...liveUpdateScenario,
        screenshotPath: liveUpdateScreenshotPath,
        snapshot: liveUpdateSnapshot,
      },
    };

    await writeFile(
      path.join(artifactDir, "phase102-results.json"),
      `${JSON.stringify(result, null, 2)}\n`,
      "utf8",
    );

    console.log(`phase102: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

runInteractionAuditThemeAlignmentReview().catch((error) => {
  console.error("phase102 failed");
  console.error(error);
  process.exitCode = 1;
});
