import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";
import { installSafeLocalStorageHelpers } from "./lib/browser-local-storage-helpers.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase110-custom-seed-preview-interaction-recovery-review",
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
const customSeedHex = "#4F46E5";

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

const sourceScopedProviderIds = ["cursor", "codex"];
const hiddenProviderIds = ["claude-code", "gemini", "jetbrains"];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function permissionPromptSelector(providerId) {
  return `.permission-prompt[data-provider-id="${providerId}"]`;
}

function visibilityToggleSelector(providerId) {
  return `[data-visibility-toggle="${providerId}"]`;
}

function visibilityRowSelector(providerId) {
  return `[data-visibility-provider-id="${providerId}"]`;
}

function sourcePreferenceSelector(providerId) {
  return `.source-card[data-provider-id="${providerId}"] select`;
}

async function waitForSettingsReady(page) {
  await installSafeLocalStorageHelpers(page);
  await page.goto(settingsUrl, { waitUntil: "load" });
  await page.waitForSelector("text=Global Preferences");
}

async function dismissToast(page) {
  const toast = page.locator(".toast");
  const dismissButton = page.getByRole("button", { name: "Dismiss" }).first();

  await toast.waitFor({ state: "visible", timeout: 2_000 }).catch(() => {});

  if (await dismissButton.isVisible().catch(() => false)) {
    await dismissButton.click();
    await toast.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => {});
  }
}

async function resetPreviewStorage(page) {
  await waitForSettingsReady(page);

  await page.evaluate(
    ({ appKey, secretsKey }) => {
      const storage = globalThis.__aiUsageDashboardSafeLocalStorage;

      for (const [key, label] of [
        [appKey, "app state"],
        [secretsKey, "provider secrets"],
      ]) {
        const removeResult = storage?.removeItem(key) ?? {
          ok: false,
          error: "Safe localStorage helper was not installed.",
        };

        if (!removeResult.ok) {
          throw new Error(`Unable to clear ${label}: ${removeResult.error}`);
        }
      }
    },
    {
      appKey: APP_STATE_STORAGE_KEY,
      secretsKey: PROVIDER_SECRETS_STORAGE_KEY,
    },
  );

  await page.reload({ waitUntil: "load" });
  await page.waitForSelector("text=Global Preferences");
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

async function applyCustomSeedTheme(page, mode) {
  await waitForSettingsReady(page);

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
  await customSeedInput.fill(customSeedHex);
  await applyButton.click();

  await waitForThemeState(page, mode);
  await dismissToast(page);
}

async function setProviderVisibility(page, providerId, enabled) {
  const toggle = page.locator(visibilityToggleSelector(providerId));
  await toggle.waitFor({ state: "attached", timeout: 20_000 });
  await toggle.scrollIntoViewIfNeeded().catch(() => {});

  const isChecked = await toggle.isChecked();
  if (isChecked === enabled) {
    return;
  }

  if (enabled) {
    await toggle.check({ force: true });
  } else {
    await toggle.uncheck({ force: true });
  }

  await page.waitForFunction(
    ({ selector, expected }) =>
      document.querySelector(selector)?.getAttribute("data-visibility-enabled") ===
      expected,
    {
      selector: visibilityRowSelector(providerId),
      expected: enabled ? "true" : "false",
    },
  );
  await dismissToast(page);
}

async function setSourcePreference(page, providerId, sourcePreference) {
  const select = page.locator(sourcePreferenceSelector(providerId));
  await select.waitFor({ state: "visible", timeout: 20_000 });

  if ((await select.inputValue()) === sourcePreference) {
    return;
  }

  await select.selectOption(sourcePreference);
  await page.waitForFunction(
    ({ selector, expected }) =>
      document.querySelector(selector) instanceof HTMLSelectElement &&
      document.querySelector(selector).value === expected,
    {
      selector: sourcePreferenceSelector(providerId),
      expected: sourcePreference,
    },
  );
  await dismissToast(page);
}

async function setPermissionStatus(page, providerId, desiredStatus) {
  const prompt = page.locator(permissionPromptSelector(providerId));
  await prompt.waitFor({ state: "visible", timeout: 20_000 });

  const currentStatus = await prompt.getAttribute("data-permission-status");
  if (currentStatus === desiredStatus) {
    return;
  }

  const action =
    desiredStatus === "granted"
      ? '[data-permission-action="request"]'
      : '[data-permission-action="remove"]';

  await prompt.locator(action).click();
  await page.waitForFunction(
    ({ selector, expected }) =>
      document.querySelector(selector)?.getAttribute("data-permission-status") ===
      expected,
    {
      selector: permissionPromptSelector(providerId),
      expected: desiredStatus,
    },
  );
  await dismissToast(page);
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

function assertSurfaceClassExcludes(surface, fragment, label) {
  assertSurfacePresent(surface, label);
  assert(
    !surface.className.includes(fragment),
    `${label}: expected class ${fragment} to be absent, received ${surface.className}`,
  );
}

function assertSurfaceTextIncludes(surface, fragment, label) {
  assertSurfacePresent(surface, label);
  assert(
    surface.text?.includes(fragment),
    `${label}: expected text to include ${fragment}, received ${surface.text}`,
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

async function captureScenario(context, settingsPage, mode, scenario) {
  await waitForThemeState(settingsPage, mode);
  await dismissToast(settingsPage);

  const permissionSection = settingsPage.locator("#settings-permissions");
  await permissionSection.scrollIntoViewIfNeeded();
  await settingsPage.waitForSelector(
    `${permissionPromptSelector("cursor")} .meta-chip`,
  );
  await settingsPage.waitForSelector(
    `${permissionPromptSelector("codex")} .meta-chip`,
  );

  const settingsSnapshot = await readSurfaceSnapshot(settingsPage, {
    cursorPermissionPrompt: {
      selector: permissionPromptSelector("cursor"),
    },
    cursorPermissionChip: {
      selector: `${permissionPromptSelector("cursor")} .meta-chip`,
    },
    cursorPermissionButton: {
      selector: `${permissionPromptSelector("cursor")} .text-button`,
    },
    codexPermissionPrompt: {
      selector: permissionPromptSelector("codex"),
    },
    codexPermissionChip: {
      selector: `${permissionPromptSelector("codex")} .meta-chip`,
    },
    codexPermissionButton: {
      selector: `${permissionPromptSelector("codex")} .text-button`,
    },
  });

  const settingsScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-settings-preview-interaction-recovery.png`,
  );
  await permissionSection.screenshot({
    path: settingsScreenshotPath,
  });

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

  const dashboardScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-dashboard-preview-interaction-recovery.png`,
  );
  await dashboardPage.screenshot({
    path: dashboardScreenshotPath,
    fullPage: true,
  });

  const popupPage = await context.newPage();
  popupPage.setDefaultTimeout(20_000);
  await popupPage.goto(popupUrl, { waitUntil: "load" });
  await popupPage.waitForSelector(
    '[data-theme-local-surface="popup-snapshot-status-card"] .status-chip',
  );
  await popupPage.waitForSelector(
    '[data-theme-local-surface="popup-first-provider-card"]',
  );
  await waitForThemeState(popupPage, mode);

  const popupSnapshot = await readSurfaceSnapshot(popupPage, {
    snapshotStatusCard: {
      selector: '[data-theme-local-surface="popup-snapshot-status-card"]',
    },
    snapshotStatusChip: {
      selector:
        '[data-theme-local-surface="popup-snapshot-status-card"] .status-chip',
    },
    firstProviderCard: {
      selector: '[data-theme-local-surface="popup-first-provider-card"]',
    },
    firstProviderStatusChip: {
      selector:
        '[data-theme-local-surface="popup-first-provider-card"] .status-chip',
    },
  });

  const popupScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-popup-preview-interaction-recovery.png`,
  );
  await popupPage.screenshot({
    path: popupScreenshotPath,
    fullPage: true,
  });

  const cursorDetailPage = await context.newPage();
  cursorDetailPage.setDefaultTimeout(20_000);
  await cursorDetailPage.goto(cursorDetailUrl, { waitUntil: "load" });
  await cursorDetailPage.waitForSelector(
    '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
  );
  await waitForThemeState(cursorDetailPage, mode);

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

  const cursorDetailScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-cursor-detail-preview-interaction-recovery.png`,
  );
  await cursorDetailPage.screenshot({
    path: cursorDetailScreenshotPath,
    fullPage: true,
  });

  const codexDetailPage = await context.newPage();
  codexDetailPage.setDefaultTimeout(20_000);
  await codexDetailPage.goto(codexDetailUrl, { waitUntil: "load" });
  await codexDetailPage.waitForSelector(
    '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
  );
  await waitForThemeState(codexDetailPage, mode);

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

  const codexDetailScreenshotPath = path.join(
    artifactDir,
    `${mode.slug}-${scenario}-codex-detail-preview-interaction-recovery.png`,
  );
  await codexDetailPage.screenshot({
    path: codexDetailScreenshotPath,
    fullPage: true,
  });

  for (const [label, snapshot] of [
    [`${scenario} settings`, settingsSnapshot],
    [`${scenario} dashboard`, dashboardSnapshot],
    [`${scenario} popup`, popupSnapshot],
    [`${scenario} cursor detail`, cursorDetailSnapshot],
    [`${scenario} codex detail`, codexDetailSnapshot],
  ]) {
    verifyThemeState(`${mode.slug} ${label}`, snapshot, mode);
  }

  await dashboardPage.close();
  await popupPage.close();
  await cursorDetailPage.close();
  await codexDetailPage.close();

  return {
    settingsScreenshotPath,
    dashboardScreenshotPath,
    popupScreenshotPath,
    cursorDetailScreenshotPath,
    codexDetailScreenshotPath,
    settings: settingsSnapshot,
    dashboard: dashboardSnapshot,
    popup: popupSnapshot,
    cursorDetail: cursorDetailSnapshot,
    codexDetail: codexDetailSnapshot,
  };
}

async function configurePreviewInteractionScenario(settingsPage, mode) {
  await applyCustomSeedTheme(settingsPage, mode);

  for (const providerId of sourceScopedProviderIds) {
    await setProviderVisibility(settingsPage, providerId, true);
  }

  for (const providerId of hiddenProviderIds) {
    await setProviderVisibility(settingsPage, providerId, false);
  }

  for (const providerId of sourceScopedProviderIds) {
    await setSourcePreference(settingsPage, providerId, "session_page");
  }
}

async function runPreviewInteractionRecoveryReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const results = [];

    for (const mode of modes) {
      console.log(`phase110: preparing ${mode.slug}`);

      const context = await browser.newContext({
        colorScheme: mode.expectedResolved,
      });
      const settingsPage = await context.newPage();
      settingsPage.setDefaultTimeout(20_000);

      await resetPreviewStorage(settingsPage);
      await configurePreviewInteractionScenario(settingsPage, mode);

      for (const providerId of sourceScopedProviderIds) {
        await setPermissionStatus(settingsPage, providerId, "missing");
      }
      const degraded = await captureScenario(
        context,
        settingsPage,
        mode,
        "degraded",
      );

      for (const providerId of sourceScopedProviderIds) {
        await setPermissionStatus(settingsPage, providerId, "granted");
      }
      const recovered = await captureScenario(
        context,
        settingsPage,
        mode,
        "recovered",
      );

      for (const scope of [
        "settings",
        "dashboard",
        "popup",
        "cursorDetail",
        "codexDetail",
      ]) {
        assert(
          normalize(degraded[scope].cssVars.primary) ===
            normalize(recovered[scope].cssVars.primary),
          `${mode.slug}: expected ${scope} primary role to stay stable across permission recovery`,
        );
        assert(
          normalize(degraded[scope].cssVars.tertiary) ===
            normalize(recovered[scope].cssVars.tertiary),
          `${mode.slug}: expected ${scope} tertiary role to stay stable across permission recovery`,
        );
      }

      for (const [label, prompt, chip, button] of [
        [
          "cursor",
          degraded.settings.surfaces.cursorPermissionPrompt,
          degraded.settings.surfaces.cursorPermissionChip,
          degraded.settings.surfaces.cursorPermissionButton,
        ],
        [
          "codex",
          degraded.settings.surfaces.codexPermissionPrompt,
          degraded.settings.surfaces.codexPermissionChip,
          degraded.settings.surfaces.codexPermissionButton,
        ],
      ]) {
        assertSurfaceClassIncludes(
          prompt,
          "permission-prompt--warning",
          `${mode.slug}: degraded ${label} permission prompt`,
        );
        assertSurfaceTextIncludes(
          chip,
          "Host access missing",
          `${mode.slug}: degraded ${label} permission chip`,
        );
        assertSurfaceTextIncludes(
          button,
          "Request access",
          `${mode.slug}: degraded ${label} permission button`,
        );
      }

      for (const [label, prompt, chip, button] of [
        [
          "cursor",
          recovered.settings.surfaces.cursorPermissionPrompt,
          recovered.settings.surfaces.cursorPermissionChip,
          recovered.settings.surfaces.cursorPermissionButton,
        ],
        [
          "codex",
          recovered.settings.surfaces.codexPermissionPrompt,
          recovered.settings.surfaces.codexPermissionChip,
          recovered.settings.surfaces.codexPermissionButton,
        ],
      ]) {
        assertSurfaceClassExcludes(
          prompt,
          "permission-prompt--warning",
          `${mode.slug}: recovered ${label} permission prompt`,
        );
        assertSurfaceTextIncludes(
          chip,
          "Host access granted",
          `${mode.slug}: recovered ${label} permission chip`,
        );
        assertSurfaceTextIncludes(
          button,
          "Remove access",
          `${mode.slug}: recovered ${label} permission button`,
        );
      }

      for (const key of [
        "cursorPermissionPrompt",
        "cursorPermissionChip",
        "codexPermissionPrompt",
        "codexPermissionChip",
      ]) {
        assertSurfaceChanges(
          degraded.settings.surfaces[key],
          recovered.settings.surfaces[key],
          `${mode.slug}: settings ${key}`,
        );
      }

      assertSurfaceStable(
        recovered.settings.surfaces.cursorPermissionPrompt,
        recovered.settings.surfaces.codexPermissionPrompt,
        `${mode.slug}: recovered settings permission prompts`,
      );
      assertSurfaceStable(
        recovered.settings.surfaces.cursorPermissionChip,
        recovered.settings.surfaces.codexPermissionChip,
        `${mode.slug}: recovered settings permission chips`,
      );

      for (const [scope, keys] of [
        [
          "dashboard",
          [
            "cursorCard",
            "cursorStatusChip",
            "cursorProgressTrack",
            "cursorProgressFill",
            "codexCard",
            "codexStatusChip",
            "codexProgressTrack",
            "codexProgressFill",
          ],
        ],
        [
          "popup",
          [
            "snapshotStatusCard",
            "snapshotStatusChip",
            "firstProviderCard",
            "firstProviderStatusChip",
          ],
        ],
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
        assertSurfaceClassIncludes(
          surface,
          "status-chip--warning",
          `${mode.slug}: ${label}`,
        );
      }

      for (const [label, surface] of [
        ["recovered dashboard cursor status chip", recovered.dashboard.surfaces.cursorStatusChip],
        ["recovered dashboard codex status chip", recovered.dashboard.surfaces.codexStatusChip],
        ["recovered popup snapshot status chip", recovered.popup.surfaces.snapshotStatusChip],
        ["recovered popup first provider status chip", recovered.popup.surfaces.firstProviderStatusChip],
        ["recovered cursor detail sync status chip", recovered.cursorDetail.surfaces.syncStatusChip],
        ["recovered codex detail sync status chip", recovered.codexDetail.surfaces.syncStatusChip],
      ]) {
        assertSurfaceClassIncludes(
          surface,
          "status-chip--neutral",
          `${mode.slug}: ${label}`,
        );
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

      results.push({
        mode: mode.slug,
        degraded,
        recovered,
      });

      await settingsPage.close();
      await context.close();
    }

    const resultsPath = path.join(artifactDir, "phase110-results.json");
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

    console.log(`phase110: wrote artifacts under ${artifactDir}`);
  } finally {
    await browser.close();
  }
}

await runPreviewInteractionRecoveryReview();
