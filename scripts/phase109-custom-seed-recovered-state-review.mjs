import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase109-custom-seed-recovered-state-review",
);
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const cursorDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/cursor";
const codexDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/codex";
const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
const PROVIDER_SECRETS_STORAGE_KEY = "ai-usage-dashboard.provider-secrets";

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

function createEmptyPageBinding() {
  return {
    mode: "auto",
    status: "unbound",
    tabId: null,
    matchedUrl: null,
    matchedTitle: null,
    updatedAt: null,
  };
}

function createScenarioState(baseState, mode, scenario) {
  const state = structuredClone(baseState);

  state.settings = {
    ...state.settings,
    syncIntervalMinutes: 30,
    warningThresholdPercent: 80,
    themeMode: mode.themeMode,
    themePreset: "custom",
    themeCustomSeedHex: customSeedHex,
  };

  state.providerSettings = state.providerSettings.map((setting) => {
    if (setting.id === "cursor") {
      return {
        ...setting,
        enabled: true,
        status: scenario === "degraded" ? "missing" : "granted",
        sourcePreference: "session_page",
        pageBinding: createEmptyPageBinding(),
      };
    }

    if (setting.id === "codex") {
      return {
        ...setting,
        enabled: true,
        status: scenario === "degraded" ? "missing" : "granted",
        sourcePreference: "session_page",
        pageBinding: createEmptyPageBinding(),
      };
    }

    return {
      ...setting,
      enabled: false,
      pageBinding:
        setting.id === "jetbrains" ? setting.pageBinding : createEmptyPageBinding(),
    };
  });

  return state;
}

async function resetPreviewStorage(page) {
  await page.goto(settingsUrl, { waitUntil: "load" });
  await page.waitForSelector("text=Global Preferences");

  await page.evaluate(
    ({ appKey, secretsKey }) => {
      localStorage.removeItem(appKey);
      localStorage.removeItem(secretsKey);
    },
    {
      appKey: APP_STATE_STORAGE_KEY,
      secretsKey: PROVIDER_SECRETS_STORAGE_KEY,
    },
  );

  await page.reload({ waitUntil: "load" });
  await page.waitForSelector("text=Global Preferences");
}

async function readStoredAppState(page) {
  return page.evaluate((storageKey) => {
    const rawState = localStorage.getItem(storageKey);
    if (!rawState) {
      throw new Error("Missing stored app state after preview reset.");
    }
    return JSON.parse(rawState);
  }, APP_STATE_STORAGE_KEY);
}

async function writeSeededScenario(page, state) {
  await page.evaluate(
    ({ appKey, secretsKey, nextState }) => {
      localStorage.setItem(appKey, JSON.stringify(nextState));
      localStorage.setItem(
        secretsKey,
        JSON.stringify({
          cursor: { adminApiKey: null },
          "claude-code": { adminApiKey: null },
          codex: {
            analyticsApiKey: null,
            workspaceId: null,
          },
        }),
      );
    },
    {
      appKey: APP_STATE_STORAGE_KEY,
      secretsKey: PROVIDER_SECRETS_STORAGE_KEY,
      nextState: state,
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

function verifyThemeState(label, snapshot, mode) {
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

function assertSurfacePresent(surface, label) {
  assert(surface !== null, `${label}: expected surface to exist`);
}

function assertSurfaceMissing(surface, label) {
  assert(surface === null, `${label}: expected surface to be absent`);
}

function assertSurfaceClassIncludes(surface, fragment, label) {
  assertSurfacePresent(surface, label);
  assert(
    surface.className.includes(fragment),
    `${label}: expected class ${fragment}, received ${surface.className}`,
  );
}

function assertSurfaceChanges(left, right, label) {
  assertSurfacePresent(left, `${label}: left`);
  assertSurfacePresent(right, `${label}: right`);
  assert(
    normalize(left.backgroundColor) !== normalize(right.backgroundColor),
    `${label}: expected background color to change, received ${left.backgroundColor} vs ${right.backgroundColor}`,
  );
}

function assertSurfaceStable(left, right, label) {
  assertSurfacePresent(left, `${label}: left`);
  assertSurfacePresent(right, `${label}: right`);
  assert(
    normalize(left.backgroundColor) === normalize(right.backgroundColor),
    `${label}: expected matching background colors, received ${left.backgroundColor} vs ${right.backgroundColor}`,
  );
  assert(
    normalize(left.borderColor) === normalize(right.borderColor),
    `${label}: expected matching border colors, received ${left.borderColor} vs ${right.borderColor}`,
  );
}

async function openScenarioPages(context, mode, scenario) {
  const dashboardPage = await context.newPage();
  dashboardPage.setDefaultTimeout(20_000);
  await dashboardPage.goto(dashboardUrl, { waitUntil: "load" });
  await dashboardPage.waitForSelector(
    '.provider-card[data-provider-id="cursor"] .status-chip',
  );
  await dashboardPage.waitForSelector(
    '.provider-card[data-provider-id="codex"] .status-chip',
  );
  await waitForThemeState(dashboardPage, mode);

  const popupPage = await context.newPage();
  popupPage.setDefaultTimeout(20_000);
  await popupPage.goto(popupUrl, { waitUntil: "load" });
  await popupPage.waitForSelector(
    '[data-theme-local-surface="popup-snapshot-status-card"] .status-chip',
  );
  await popupPage.waitForSelector('[data-theme-local-surface="popup-first-provider-card"]');
  await waitForThemeState(popupPage, mode);

  const cursorDetailPage = await context.newPage();
  cursorDetailPage.setDefaultTimeout(20_000);
  await cursorDetailPage.goto(cursorDetailUrl, { waitUntil: "load" });
  await cursorDetailPage.waitForSelector(
    '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
  );
  await waitForThemeState(cursorDetailPage, mode);

  const codexDetailPage = await context.newPage();
  codexDetailPage.setDefaultTimeout(20_000);
  await codexDetailPage.goto(codexDetailUrl, { waitUntil: "load" });
  await codexDetailPage.waitForSelector(
    '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
  );
  await waitForThemeState(codexDetailPage, mode);

  const dashboardSnapshot = await readSurfaceSnapshot(dashboardPage, {
    cursorCard: {
      selector: '.provider-card[data-provider-id="cursor"]',
    },
    cursorStatusChip: {
      selector: '.provider-card[data-provider-id="cursor"] .status-chip',
    },
    cursorHostAccessChip: {
      selector: '.provider-card[data-provider-id="cursor"] .meta-chip--warning',
      textIncludes: "Host access missing",
    },
    cursorProgressTrack: {
      selector: '.provider-card[data-provider-id="cursor"] .usage-progress__track',
    },
    cursorProgressFill: {
      selector: '.provider-card[data-provider-id="cursor"] .usage-progress__fill',
    },
    codexCard: {
      selector: '.provider-card[data-provider-id="codex"]',
    },
    codexStatusChip: {
      selector: '.provider-card[data-provider-id="codex"] .status-chip',
    },
    codexHostAccessChip: {
      selector: '.provider-card[data-provider-id="codex"] .meta-chip--warning',
      textIncludes: "Host access missing",
    },
    codexProgressTrack: {
      selector: '.provider-card[data-provider-id="codex"] .usage-progress__track',
    },
    codexProgressFill: {
      selector: '.provider-card[data-provider-id="codex"] .usage-progress__fill',
    },
  });

  const popupSnapshot = await readSurfaceSnapshot(popupPage, {
    snapshotStatusCard: {
      selector: '[data-theme-local-surface="popup-snapshot-status-card"]',
    },
    snapshotStatusChip: {
      selector: '[data-theme-local-surface="popup-snapshot-status-card"] .status-chip',
    },
    firstProviderCard: {
      selector: '[data-theme-local-surface="popup-first-provider-card"]',
    },
    firstProviderStatusChip: {
      selector:
        '[data-theme-local-surface="popup-first-provider-card"] .status-chip',
    },
  });

  const cursorDetailSnapshot = await readSurfaceSnapshot(cursorDetailPage, {
    syncStatusChip: {
      selector:
        '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
    },
    accessStatusNote: {
      selector: ".detail-note--warning",
      textIncludes: "Access status",
    },
    sourceStateNote: {
      selector: ".detail-note--warning",
      textIncludes: "Source state",
    },
    usageTrack: {
      selector: ".usage-progress__track",
    },
    usageFill: {
      selector: ".usage-progress__fill",
    },
  });

  const codexDetailSnapshot = await readSurfaceSnapshot(codexDetailPage, {
    syncStatusChip: {
      selector:
        '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
    },
    accessStatusNote: {
      selector: ".detail-note--warning",
      textIncludes: "Access status",
    },
    sourceStateNote: {
      selector: ".detail-note--warning",
      textIncludes: "Source state",
    },
    usageTrack: {
      selector: ".usage-progress__track",
    },
    usageFill: {
      selector: ".usage-progress__fill",
    },
  });

  for (const [label, snapshot] of [
    [`${scenario} dashboard`, dashboardSnapshot],
    [`${scenario} popup`, popupSnapshot],
    [`${scenario} cursor detail`, cursorDetailSnapshot],
    [`${scenario} codex detail`, codexDetailSnapshot],
  ]) {
    verifyThemeState(`${mode.slug} ${label}`, snapshot, mode);
  }

  const dashboardScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-dashboard-recovered-state.png`,
  );
  const popupScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-popup-recovered-state.png`,
  );
  const cursorDetailScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-cursor-detail-recovered-state.png`,
  );
  const codexDetailScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-codex-detail-recovered-state.png`,
  );

  await dashboardPage.screenshot({
    path: dashboardScreenshotPath,
    fullPage: true,
  });
  await popupPage.screenshot({
    path: popupScreenshotPath,
    fullPage: true,
  });
  await cursorDetailPage.screenshot({
    path: cursorDetailScreenshotPath,
    fullPage: true,
  });
  await codexDetailPage.screenshot({
    path: codexDetailScreenshotPath,
    fullPage: true,
  });

  await dashboardPage.close();
  await popupPage.close();
  await cursorDetailPage.close();
  await codexDetailPage.close();

  return {
    dashboardScreenshotPath,
    popupScreenshotPath,
    cursorDetailScreenshotPath,
    codexDetailScreenshotPath,
    dashboard: dashboardSnapshot,
    popup: popupSnapshot,
    cursorDetail: cursorDetailSnapshot,
    codexDetail: codexDetailSnapshot,
  };
}

async function runRecoveredStateReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const results = [];

    for (const mode of modes) {
      console.log(`phase109: preparing ${mode.slug}`);

      const context = await browser.newContext({
        colorScheme: mode.expectedResolved,
      });
      const statePage = await context.newPage();
      statePage.setDefaultTimeout(20_000);

      await resetPreviewStorage(statePage);
      const baseState = await readStoredAppState(statePage);

      const degradedState = createScenarioState(baseState, mode, "degraded");
      await writeSeededScenario(statePage, degradedState);
      const degraded = await openScenarioPages(context, mode, "degraded");

      const recoveredState = createScenarioState(baseState, mode, "recovered");
      await writeSeededScenario(statePage, recoveredState);
      const recovered = await openScenarioPages(context, mode, "recovered");

      assert(
        normalize(degraded.dashboard.cssVars.primary) ===
          normalize(recovered.dashboard.cssVars.primary),
        `${mode.slug}: expected recovered scenario to keep the same primary role`,
      );
      assert(
        normalize(degraded.dashboard.cssVars.tertiary) ===
          normalize(recovered.dashboard.cssVars.tertiary),
        `${mode.slug}: expected recovered scenario to keep the same tertiary role`,
      );

      for (const [scope, keys] of [
        ["dashboard", ["cursorCard", "cursorStatusChip", "cursorProgressTrack", "cursorProgressFill", "codexCard", "codexStatusChip", "codexProgressTrack", "codexProgressFill"]],
        ["popup", ["snapshotStatusCard", "snapshotStatusChip", "firstProviderCard", "firstProviderStatusChip"]],
        ["cursorDetail", ["syncStatusChip", "usageTrack", "usageFill"]],
        ["codexDetail", ["syncStatusChip", "usageTrack", "usageFill"]],
      ]) {
        for (const key of keys) {
          assertSurfaceChanges(
            degraded[scope].surfaces[key],
            recovered[scope].surfaces[key],
            `${mode.slug}: ${scope} ${key}`,
          );
        }
      }

      assertSurfacePresent(
        degraded.dashboard.surfaces.cursorHostAccessChip,
        `${mode.slug}: degraded dashboard cursor host access chip`,
      );
      assertSurfacePresent(
        degraded.dashboard.surfaces.codexHostAccessChip,
        `${mode.slug}: degraded dashboard codex host access chip`,
      );
      assertSurfaceMissing(
        recovered.dashboard.surfaces.cursorHostAccessChip,
        `${mode.slug}: recovered dashboard cursor host access chip`,
      );
      assertSurfaceMissing(
        recovered.dashboard.surfaces.codexHostAccessChip,
        `${mode.slug}: recovered dashboard codex host access chip`,
      );

      for (const [scope, snapshot] of [
        ["cursor detail", degraded.cursorDetail],
        ["codex detail", degraded.codexDetail],
      ]) {
        assertSurfacePresent(
          snapshot.surfaces.accessStatusNote,
          `${mode.slug}: degraded ${scope} access status note`,
        );
        assertSurfacePresent(
          snapshot.surfaces.sourceStateNote,
          `${mode.slug}: degraded ${scope} source-state note`,
        );
      }

      for (const [scope, snapshot] of [
        ["cursor detail", recovered.cursorDetail],
        ["codex detail", recovered.codexDetail],
      ]) {
        assertSurfaceMissing(
          snapshot.surfaces.accessStatusNote,
          `${mode.slug}: recovered ${scope} access status note`,
        );
        assertSurfaceMissing(
          snapshot.surfaces.sourceStateNote,
          `${mode.slug}: recovered ${scope} source-state note`,
        );
      }

      for (const [label, surface] of [
        ["degraded dashboard cursor status chip", degraded.dashboard.surfaces.cursorStatusChip],
        ["degraded dashboard codex status chip", degraded.dashboard.surfaces.codexStatusChip],
        ["degraded popup snapshot status chip", degraded.popup.surfaces.snapshotStatusChip],
        ["degraded popup first provider status chip", degraded.popup.surfaces.firstProviderStatusChip],
        ["degraded cursor detail sync status chip", degraded.cursorDetail.surfaces.syncStatusChip],
        ["degraded codex detail sync status chip", degraded.codexDetail.surfaces.syncStatusChip],
      ]) {
        assertSurfaceClassIncludes(surface, "status-chip--warning", `${mode.slug}: ${label}`);
      }

      for (const [label, surface] of [
        ["recovered dashboard cursor status chip", recovered.dashboard.surfaces.cursorStatusChip],
        ["recovered dashboard codex status chip", recovered.dashboard.surfaces.codexStatusChip],
        ["recovered popup snapshot status chip", recovered.popup.surfaces.snapshotStatusChip],
        ["recovered popup first provider status chip", recovered.popup.surfaces.firstProviderStatusChip],
        ["recovered cursor detail sync status chip", recovered.cursorDetail.surfaces.syncStatusChip],
        ["recovered codex detail sync status chip", recovered.codexDetail.surfaces.syncStatusChip],
      ]) {
        assertSurfaceClassIncludes(surface, "status-chip--neutral", `${mode.slug}: ${label}`);
      }

      assertSurfaceStable(
        recovered.dashboard.surfaces.cursorStatusChip,
        recovered.dashboard.surfaces.codexStatusChip,
        `${mode.slug}: recovered dashboard healthy status chips`,
      );
      assertSurfaceStable(
        recovered.dashboard.surfaces.cursorProgressFill,
        recovered.dashboard.surfaces.codexProgressFill,
        `${mode.slug}: recovered dashboard healthy progress fills`,
      );
      assertSurfaceStable(
        recovered.cursorDetail.surfaces.syncStatusChip,
        recovered.codexDetail.surfaces.syncStatusChip,
        `${mode.slug}: recovered detail healthy status chips`,
      );
      assertSurfaceStable(
        recovered.cursorDetail.surfaces.usageFill,
        recovered.codexDetail.surfaces.usageFill,
        `${mode.slug}: recovered detail healthy progress fills`,
      );

      assert(
        recovered.popup.surfaces.firstProviderCard?.text?.includes("Codex"),
        `${mode.slug}: expected recovered popup first provider to remain Codex`,
      );
      assert(
        degraded.popup.surfaces.firstProviderCard?.text?.includes("Codex"),
        `${mode.slug}: expected degraded popup first provider to remain Codex`,
      );

      results.push({
        mode: mode.slug,
        degraded,
        recovered,
      });

      await statePage.close();
      await context.close();
    }

    const resultsPath = path.join(artifactDir, "phase109-results.json");
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

    console.log(`phase109: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runRecoveredStateReview();
