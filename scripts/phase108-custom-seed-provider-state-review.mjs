import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase108-custom-seed-provider-state-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const claudeDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/claude-code";
const geminiDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/gemini";
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
    function resolveNode(target) {
      const nodes = Array.from(document.querySelectorAll(target.selector));

      if (!target.textIncludes) {
        return nodes.find((node) => node instanceof HTMLElement) ?? null;
      }

      const expectedText = target.textIncludes.toLowerCase();

      return (
        nodes.find(
          (node) =>
            node instanceof HTMLElement &&
            node.textContent?.toLowerCase().includes(expectedText),
        ) ?? null
      );
    }

    function styleSnapshot(node) {
      if (!(node instanceof HTMLElement)) {
        return null;
      }

      const styles = getComputedStyle(node);

      return {
        className: node.className,
        text: node.textContent?.trim() ?? null,
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
        Object.entries(currentSelectors).map(([key, target]) => [
          key,
          styleSnapshot(resolveNode(target)),
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

function assertSurfaceStable(left, right, label) {
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

function assertSurfaceChanges(left, right, label) {
  assert(left !== null, `${label}: left surface missing`);
  assert(right !== null, `${label}: right surface missing`);
  assert(
    normalize(left.backgroundColor) !== normalize(right.backgroundColor),
    `${label}: expected background color to change, received ${left.backgroundColor} vs ${right.backgroundColor}`,
  );
}

async function runProviderStateReview() {
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
        console.log(`phase108: reviewing ${mode.slug}-${variant}`);
        await applyThemeVariant(settingsPage, mode, variant);

        const dashboardPage = await context.newPage();
        dashboardPage.setDefaultTimeout(20_000);
        await dashboardPage.goto(dashboardUrl, { waitUntil: "load" });
        await dashboardPage.waitForSelector("text=Provider cards");
        await waitForThemeState(dashboardPage, mode, variant);
        await dashboardPage.waitForSelector(
          '.provider-card[data-provider-id="claude-code"] .status-chip',
        );
        await dashboardPage.waitForSelector(
          '.provider-card[data-provider-id="gemini"] .status-chip',
        );
        await dashboardPage.waitForSelector(
          '.provider-card[data-provider-id="codex"] .usage-progress__fill',
        );

        const popupPage = await context.newPage();
        popupPage.setDefaultTimeout(20_000);
        await popupPage.goto(popupUrl, { waitUntil: "load" });
        await popupPage.waitForSelector("text=Quick glance");
        await waitForThemeState(popupPage, mode, variant);
        await popupPage.waitForSelector(".popup-provider-card--warning .status-chip");

        const claudeDetailPage = await context.newPage();
        claudeDetailPage.setDefaultTimeout(20_000);
        await claudeDetailPage.goto(claudeDetailUrl, { waitUntil: "load" });
        await claudeDetailPage.waitForSelector("text=Provider Detail");
        await waitForThemeState(claudeDetailPage, mode, variant);
        await claudeDetailPage.waitForSelector(".detail-note--error");

        const geminiDetailPage = await context.newPage();
        geminiDetailPage.setDefaultTimeout(20_000);
        await geminiDetailPage.goto(geminiDetailUrl, { waitUntil: "load" });
        await geminiDetailPage.waitForSelector("text=Provider Detail");
        await waitForThemeState(geminiDetailPage, mode, variant);
        await geminiDetailPage.waitForSelector(".detail-note--warning");

        const codexDetailPage = await context.newPage();
        codexDetailPage.setDefaultTimeout(20_000);
        await codexDetailPage.goto(codexDetailUrl, { waitUntil: "load" });
        await codexDetailPage.waitForSelector("text=Provider Detail");
        await waitForThemeState(codexDetailPage, mode, variant);
        await codexDetailPage.waitForSelector(".usage-progress__fill");

        const dashboardSnapshot = await readSurfaceSnapshot(dashboardPage, {
          claudeStatusChip: {
            selector: '.provider-card[data-provider-id="claude-code"] .status-chip',
          },
          claudeErrorMeta: {
            selector:
              '.provider-card[data-provider-id="claude-code"] .meta-chip--error',
            textIncludes: "Credential missing",
          },
          claudeWarningMeta: {
            selector:
              '.provider-card[data-provider-id="claude-code"] .meta-chip--warning',
            textIncludes: "Analytics snapshot",
          },
          claudeProgressTrack: {
            selector:
              '.provider-card[data-provider-id="claude-code"] .usage-progress__track',
          },
          claudeProgressFill: {
            selector:
              '.provider-card[data-provider-id="claude-code"] .usage-progress__fill',
          },
          geminiStatusChip: {
            selector: '.provider-card[data-provider-id="gemini"] .status-chip',
          },
          geminiWarningMeta: {
            selector:
              '.provider-card[data-provider-id="gemini"] .meta-chip--warning',
            textIncludes: "Documented policy",
          },
          geminiProgressTrack: {
            selector:
              '.provider-card[data-provider-id="gemini"] .usage-progress__track',
          },
          geminiProgressFill: {
            selector:
              '.provider-card[data-provider-id="gemini"] .usage-progress__fill',
          },
          codexStatusChip: {
            selector: '.provider-card[data-provider-id="codex"] .status-chip',
          },
          codexProgressTrack: {
            selector:
              '.provider-card[data-provider-id="codex"] .usage-progress__track',
          },
          codexProgressFill: {
            selector:
              '.provider-card[data-provider-id="codex"] .usage-progress__fill',
          },
        });

        const popupSnapshot = await readSurfaceSnapshot(popupPage, {
          snapshotStatusChip: {
            selector:
              '[data-theme-local-surface="popup-snapshot-status-card"] .status-chip',
          },
          firstWarningCard: {
            selector: ".popup-provider-card--warning",
          },
          firstWarningStatusChip: {
            selector: ".popup-provider-card--warning .status-chip",
          },
        });

        const claudeDetailSnapshot = await readSurfaceSnapshot(claudeDetailPage, {
          sourceState: {
            selector: ".detail-note--error",
            textIncludes: "Source state",
          },
          warningReason: {
            selector: ".detail-note--warning",
            textIncludes: "Warning reason",
          },
          usageTrack: {
            selector: ".usage-progress__track",
          },
          usageFill: {
            selector: ".usage-progress__fill",
          },
        });

        const geminiDetailSnapshot = await readSurfaceSnapshot(geminiDetailPage, {
          sourceState: {
            selector: ".detail-note--warning",
            textIncludes: "Source state",
          },
          warningReason: {
            selector: ".detail-note--warning",
            textIncludes: "Warning reason",
          },
          usageTrack: {
            selector: ".usage-progress__track",
          },
          usageFill: {
            selector: ".usage-progress__fill",
          },
        });

        const codexDetailSnapshot = await readSurfaceSnapshot(codexDetailPage, {
          fidelityNote: {
            selector: ".detail-note--warning",
            textIncludes: "Source fidelity",
          },
          warningReason: {
            selector: ".detail-note--warning",
            textIncludes: "Warning reason",
          },
          usageTrack: {
            selector: ".usage-progress__track",
          },
          usageFill: {
            selector: ".usage-progress__fill",
          },
        });

        for (const [label, snapshot] of [
          ["dashboard", dashboardSnapshot],
          ["popup", popupSnapshot],
          ["claude detail", claudeDetailSnapshot],
          ["gemini detail", geminiDetailSnapshot],
          ["codex detail", codexDetailSnapshot],
        ]) {
          verifyThemeState(
            `${mode.slug}-${variant} ${label}`,
            snapshot,
            mode,
            variant,
          );
        }

        const dashboardScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-dashboard-provider-state.png`,
        );
        const popupScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-popup-provider-state.png`,
        );
        const claudeDetailScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-claude-detail-provider-state.png`,
        );
        const geminiDetailScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-gemini-detail-provider-state.png`,
        );
        const codexDetailScreenshotPath = path.join(
          artifactDir,
          `${mode.slug}-${variant}-codex-detail-provider-state.png`,
        );

        await dashboardPage.screenshot({
          path: dashboardScreenshotPath,
          fullPage: true,
        });
        await popupPage.screenshot({
          path: popupScreenshotPath,
          fullPage: true,
        });
        await claudeDetailPage.screenshot({
          path: claudeDetailScreenshotPath,
          fullPage: true,
        });
        await geminiDetailPage.screenshot({
          path: geminiDetailScreenshotPath,
          fullPage: true,
        });
        await codexDetailPage.screenshot({
          path: codexDetailScreenshotPath,
          fullPage: true,
        });

        modeResult[variant] = {
          dashboardScreenshotPath,
          popupScreenshotPath,
          claudeDetailScreenshotPath,
          geminiDetailScreenshotPath,
          codexDetailScreenshotPath,
          dashboard: dashboardSnapshot,
          popup: popupSnapshot,
          claudeDetail: claudeDetailSnapshot,
          geminiDetail: geminiDetailSnapshot,
          codexDetail: codexDetailSnapshot,
        };

        await dashboardPage.close();
        await popupPage.close();
        await claudeDetailPage.close();
        await geminiDetailPage.close();
        await codexDetailPage.close();
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

      for (const [scope, keys] of [
        [
          "dashboard",
          [
            "claudeStatusChip",
            "claudeErrorMeta",
            "claudeWarningMeta",
            "claudeProgressTrack",
            "claudeProgressFill",
            "geminiStatusChip",
            "geminiWarningMeta",
            "geminiProgressTrack",
            "geminiProgressFill",
            "codexProgressTrack",
          ],
        ],
        ["popup", ["snapshotStatusChip", "firstWarningCard", "firstWarningStatusChip"]],
        ["claudeDetail", ["sourceState", "warningReason", "usageTrack", "usageFill"]],
        ["geminiDetail", ["sourceState", "warningReason", "usageTrack", "usageFill"]],
        ["codexDetail", ["fidelityNote", "warningReason", "usageTrack"]],
      ]) {
        for (const key of keys) {
          assertSurfaceStable(
            modeResult.default[scope].surfaces[key],
            modeResult.custom[scope].surfaces[key],
            `${mode.slug}: ${scope} ${key}`,
          );
        }
      }

      assertSurfaceChanges(
        modeResult.default.dashboard.surfaces.codexStatusChip,
        modeResult.custom.dashboard.surfaces.codexStatusChip,
        `${mode.slug}: dashboard codex status chip`,
      );
      assertSurfaceChanges(
        modeResult.default.dashboard.surfaces.codexProgressFill,
        modeResult.custom.dashboard.surfaces.codexProgressFill,
        `${mode.slug}: dashboard codex progress fill`,
      );
      assertSurfaceChanges(
        modeResult.default.codexDetail.surfaces.usageFill,
        modeResult.custom.codexDetail.surfaces.usageFill,
        `${mode.slug}: codex detail progress fill`,
      );

      results.push(modeResult);
    }

    const resultsPath = path.join(artifactDir, "phase108-results.json");
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

    console.log(`phase108: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runProviderStateReview();
