import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase105-custom-seed-surface-stability-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const auditHubUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit";

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

async function runSurfaceStabilityReview() {
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
        console.log(`phase105: reviewing ${mode.slug}-${variant}`);
        await applyThemeVariant(settingsPage, mode, variant);

        const popupPage = await context.newPage();
        popupPage.setDefaultTimeout(20_000);
        await popupPage.goto(popupUrl, { waitUntil: "load" });
        await popupPage.waitForSelector("text=Quick glance");
        await waitForThemeState(popupPage, mode, variant);

        const auditPage = await context.newPage();
        auditPage.setDefaultTimeout(20_000);
        await auditPage.goto(auditHubUrl, { waitUntil: "load" });
        await auditPage.waitForSelector("text=Interaction Audit");
        await waitForThemeState(auditPage, mode, variant);

        const popupSnapshot = await readSurfaceSnapshot(popupPage, {
          headerLabel: '[data-theme-local-surface="popup-header-label"]',
          snapshotStatusCard: '[data-theme-local-surface="popup-snapshot-status-card"]',
          actionsCard: '[data-theme-local-surface="popup-actions-card"]',
          contractCard: '[data-theme-local-surface="popup-contract-card"]',
          firstProviderCard: '[data-theme-local-surface="popup-first-provider-card"]',
        });
        const auditSnapshot = await readSurfaceSnapshot(auditPage, {
          openSettingsLink: '[data-theme-local-surface="audit-open-settings-link"]',
          requestScope: '[data-audit-request-scope]',
          reviewQueue: '[data-audit-review-queue]',
          signoffFeedback: '[data-audit-signoff-feedback]',
          handoffStatus: '[data-audit-handoff-status]',
          firstQueueItem: '[data-audit-review-queue-item]',
          signoffPreview: '[data-audit-signoff-preview]',
        });

        verifyThemeState(`${mode.slug}-${variant} popup`, popupSnapshot, mode, variant);
        verifyThemeState(`${mode.slug}-${variant} audit`, auditSnapshot, mode, variant);

        const popupScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-popup-surface-stability.png`,
        );
        const auditScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-audit-surface-stability.png`,
        );

        await popupPage.screenshot({ path: popupScreenshotPath, fullPage: true });
        await auditPage.screenshot({ path: auditScreenshotPath, fullPage: true });

        modeResult[variant] = {
          popupScreenshotPath,
          auditScreenshotPath,
          popup: popupSnapshot,
          audit: auditSnapshot,
        };

        await popupPage.close();
        await auditPage.close();
      }

      assert(
        normalize(modeResult.default.popup.cssVars.primary) !==
          normalize(modeResult.custom.popup.cssVars.primary),
        `${mode.slug}: expected custom seed to change popup primary role`,
      );
      assert(
        normalize(modeResult.default.popup.cssVars.tertiary) !==
          normalize(modeResult.custom.popup.cssVars.tertiary),
        `${mode.slug}: expected custom seed to change popup tertiary role`,
      );
      assert(
        normalize(modeResult.default.audit.cssVars.primary) !==
          normalize(modeResult.custom.audit.cssVars.primary),
        `${mode.slug}: expected custom seed to change audit primary role`,
      );

      assertSurfaceMatches(
        modeResult.default.popup.surfaces.snapshotStatusCard,
        modeResult.custom.popup.surfaces.snapshotStatusCard,
        `${mode.slug}: popup snapshot-status card`,
      );
      assertSurfaceMatches(
        modeResult.default.popup.surfaces.actionsCard,
        modeResult.custom.popup.surfaces.actionsCard,
        `${mode.slug}: popup actions card`,
      );
      assertSurfaceMatches(
        modeResult.default.popup.surfaces.contractCard,
        modeResult.custom.popup.surfaces.contractCard,
        `${mode.slug}: popup contract card`,
      );
      assertSurfaceMatches(
        modeResult.default.popup.surfaces.firstProviderCard,
        modeResult.custom.popup.surfaces.firstProviderCard,
        `${mode.slug}: popup first provider card`,
      );

      assertSurfaceMatches(
        modeResult.default.audit.surfaces.requestScope,
        modeResult.custom.audit.surfaces.requestScope,
        `${mode.slug}: audit request scope note`,
      );
      assertSurfaceMatches(
        modeResult.default.audit.surfaces.reviewQueue,
        modeResult.custom.audit.surfaces.reviewQueue,
        `${mode.slug}: audit review queue note`,
      );
      assertSurfaceMatches(
        modeResult.default.audit.surfaces.signoffFeedback,
        modeResult.custom.audit.surfaces.signoffFeedback,
        `${mode.slug}: audit workspace-state note`,
      );
      assertSurfaceMatches(
        modeResult.default.audit.surfaces.handoffStatus,
        modeResult.custom.audit.surfaces.handoffStatus,
        `${mode.slug}: audit handoff-status warning note`,
      );
      assertSurfaceMatches(
        modeResult.default.audit.surfaces.firstQueueItem,
        modeResult.custom.audit.surfaces.firstQueueItem,
        `${mode.slug}: audit first queue item`,
      );
      assertSurfaceMatches(
        modeResult.default.audit.surfaces.signoffPreview,
        modeResult.custom.audit.surfaces.signoffPreview,
        `${mode.slug}: audit signoff-preview surface`,
      );

      results.push(modeResult);
    }

    const resultsPath = path.join(artifactDir, "phase105-results.json");
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

    console.log(`phase105: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runSurfaceStabilityReview();
