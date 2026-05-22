import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase111-custom-seed-extension-mode-recovered-state-review",
);
const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
const PROVIDER_SECRETS_STORAGE_KEY = "ai-usage-dashboard.provider-secrets";
const customSeedHex = "#4F46E5";
const grantedOrigins = [
  "https://api.cursor.com/*",
  "https://cursor.com/*",
  "https://api.chatgpt.com/*",
  "https://chatgpt.com/*",
];
const cursorPermissionOrigins = ["https://api.cursor.com/*", "https://cursor.com/*"];
const codexPermissionOrigins = [
  "https://api.chatgpt.com/*",
  "https://chatgpt.com/*",
];
const cursorVendorUrl = "https://cursor.com/dashboard/usage";
const codexVendorUrl = "https://chatgpt.com/codex/cloud/settings/analytics#usage";

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalize(value) {
  return String(value ?? "").trim();
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

function unionStrings(existingValues, nextValues) {
  return [...new Set([...(existingValues ?? []), ...(nextValues ?? [])])];
}

function createCursorSyntheticHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cursor Dashboard Usage</title>
  </head>
  <body>
    <main>
      <h1>Cursor usage</h1>
      <section>
        <p>Apr 1 - Apr 30</p>
        <p>Usage per day across this billing period</p>
        <p>Usage</p>
        <p>Pro</p>
        <p>On-demand usage is on</p>
        <p>Export CSV</p>
      </section>
    </main>
  </body>
</html>`;
}

function createCodexSyntheticHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Codex Cloud Analytics</title>
  </head>
  <body>
    <main>
      <h1>Codex usage</h1>
      <section>
        <p>5 hour usage window</p>
        <p>97%</p>
        <p>Reset time: 2026-04-23 19:45</p>
      </section>
      <section>
        <p>Weekly usage window</p>
        <p>88%</p>
        <p>Reset time: 2026-04-24 09:00</p>
      </section>
    </main>
  </body>
</html>`;
}

async function waitForServiceWorker(context, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for the extension service worker.");
}

async function getExtensionId(context) {
  const serviceWorker = await waitForServiceWorker(context);
  const extensionId = serviceWorker.url().split("/")[2];
  assert(extensionId, "Failed to resolve extension id from service worker URL.");
  return extensionId;
}

async function launchExtensionContext(userDataDir) {
  return chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}

function ensurePermissionBlock(container, key, origins) {
  const block =
    typeof container[key] === "object" && container[key] !== null
      ? container[key]
      : {};

  container[key] = {
    api: Array.isArray(block.api) ? block.api : [],
    explicit_host: unionStrings(
      Array.isArray(block.explicit_host) ? block.explicit_host : [],
      origins,
    ),
    manifest_permissions: Array.isArray(block.manifest_permissions)
      ? block.manifest_permissions
      : [],
    scriptable_host: Array.isArray(block.scriptable_host)
      ? block.scriptable_host
      : [],
  };
}

async function patchProfileGrantedHosts(userDataDir, extensionId, origins) {
  const preferencesPath = path.join(userDataDir, "Default", "Preferences");
  const rawPreferences = await readFile(preferencesPath, "utf8");
  const preferences = JSON.parse(rawPreferences);
  const extensionSettings = preferences?.extensions?.settings?.[extensionId] ?? null;

  assert(
    extensionSettings !== null,
    `Could not find unpacked extension settings for ${extensionId}.`,
  );

  ensurePermissionBlock(extensionSettings, "active_permissions", origins);
  ensurePermissionBlock(extensionSettings, "granted_permissions", origins);
  ensurePermissionBlock(extensionSettings, "runtime_granted_permissions", origins);

  await writeFile(preferencesPath, JSON.stringify(preferences));
}

async function createExtensionRuntime({ grantHosts }) {
  const userDataDir = await mkdtemp(
    path.join(tmpdir(), "ai-usage-dashboard-phase111-"),
  );

  let context = await launchExtensionContext(userDataDir);
  const extensionId = await getExtensionId(context);
  await context.close();

  if (grantHosts) {
    await patchProfileGrantedHosts(userDataDir, extensionId, grantedOrigins);
  }

  context = await launchExtensionContext(userDataDir);

  return {
    userDataDir,
    context,
    extensionId: await getExtensionId(context),
  };
}

function buildExtensionUrl(extensionId, relativePathWithHash) {
  return `chrome-extension://${extensionId}/${relativePathWithHash}`;
}

async function openExtensionPage(context, extensionId, relativePathWithHash) {
  const page = await context.newPage();
  await page.goto(buildExtensionUrl(extensionId, relativePathWithHash), {
    waitUntil: "load",
  });
  return page;
}

async function waitForSettingsReady(page) {
  await page.waitForSelector("text=Global Preferences");
}

async function waitForDashboardReady(page) {
  await page.waitForSelector("text=Provider cards");
  await page.waitForSelector('[data-provider-id="cursor"]');
  await page.waitForSelector('[data-provider-id="codex"]');
}

async function waitForPopupReady(page) {
  await page.waitForSelector("text=Quick glance");
}

async function waitForProviderDetailReady(page) {
  await page.waitForSelector("text=Provider Detail");
}

async function writeChromeStorageValue(page, storageKey, value) {
  await page.evaluate(
    async ({ key, nextValue }) => {
      await chrome.storage.local.set({
        [key]: nextValue,
      });
    },
    { key: storageKey, nextValue: value },
  );
}

async function readChromeStorageValue(page, storageKey) {
  return page.evaluate(async (key) => {
    const stored = await chrome.storage.local.get(key);
    return stored[key] ?? null;
  }, storageKey);
}

function buildScenarioState(baseState, mode) {
  const nextState = structuredClone(baseState);

  nextState.settings = {
    ...nextState.settings,
    syncIntervalMinutes: 30,
    warningThresholdPercent: 80,
    themeMode: mode.themeMode,
    themePreset: "custom",
    themeCustomSeedHex: customSeedHex,
  };

  nextState.providerSettings = nextState.providerSettings.map((provider) => {
    const isTargetProvider = provider.id === "cursor" || provider.id === "codex";

    return {
      ...provider,
      enabled: isTargetProvider,
      status: "missing",
      credentialStatus: provider.credentialStatus,
      sourcePreference: isTargetProvider ? "session_page" : provider.sourcePreference,
      pageBinding: createEmptyPageBinding(),
    };
  });

  return nextState;
}

function buildProviderSecrets() {
  return {
    cursor: { adminApiKey: null },
    "claude-code": { adminApiKey: null },
    codex: {
      analyticsApiKey: null,
      workspaceId: null,
    },
  };
}

async function seedScenarioState(page, mode) {
  const baseState = await readChromeStorageValue(page, APP_STATE_STORAGE_KEY);
  assert(baseState, "Missing app state in chrome.storage.local before scenario seed.");

  await writeChromeStorageValue(
    page,
    APP_STATE_STORAGE_KEY,
    buildScenarioState(baseState, mode),
  );
  await writeChromeStorageValue(
    page,
    PROVIDER_SECRETS_STORAGE_KEY,
    buildProviderSecrets(),
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

async function waitForPermissionStatus(page, providerId, expectedStatus) {
  await page.waitForFunction(
    ({ targetProviderId, expected }) =>
      document
        .querySelector(`.permission-prompt[data-provider-id="${targetProviderId}"]`)
        ?.getAttribute("data-permission-status") === expected,
    {
      targetProviderId: providerId,
      expected: expectedStatus,
    },
  );
}

async function waitForProviderCardStatus(page, providerId, expectedStatusLabel) {
  await page.waitForFunction(
    ({ targetProviderId, expected }) => {
      const card = document.querySelector(`article[data-provider-id="${targetProviderId}"]`);
      const statusChip = card?.querySelector(".status-chip");
      return statusChip?.textContent?.trim() === expected;
    },
    {
      targetProviderId: providerId,
      expected: expectedStatusLabel,
    },
  );
}

async function waitForPopupStatus(page, expectedSnapshotLabel, expectedProviderStatus) {
  await page.waitForFunction(
    ({ snapshotLabel, providerStatus }) => {
      const snapshotCard = document.querySelector(
        '[data-theme-local-surface="popup-snapshot-status-card"]',
      );
      const firstProviderCard = document.querySelector(".popup-provider-card");
      const snapshotStatus =
        snapshotCard?.querySelector(".status-chip")?.textContent?.trim() ?? null;
      const featuredStatus =
        firstProviderCard?.querySelector(".status-chip")?.textContent?.trim() ?? null;

      return snapshotStatus === snapshotLabel && featuredStatus === providerStatus;
    },
    {
      snapshotLabel: expectedSnapshotLabel,
      providerStatus: expectedProviderStatus,
    },
  );
}

async function waitForDetailStatus(page, expectedStatusLabel, accessNotePresent) {
  await page.waitForFunction(
    ({ expectedStatus, expectedAccessNote }) => {
      const syncStatusCard = document.querySelector(
        '[data-theme-stability-surface="provider-detail-sync-status-card"]',
      );
      const statusChip =
        syncStatusCard?.querySelector(".status-chip")?.textContent?.trim() ?? null;
      const noteLabels = Array.from(
        document.querySelectorAll(".detail-note__label"),
      ).map((node) => node.textContent?.trim() ?? "");
      const hasAccessNote = noteLabels.includes("Access status");

      return statusChip === expectedStatus && hasAccessNote === expectedAccessNote;
    },
    {
      expectedStatus: expectedStatusLabel,
      expectedAccessNote: accessNotePresent,
    },
  );
}

async function readPermissionSnapshot(page) {
  return page.evaluate(
    async ({ cursorOrigins, codexOrigins }) => ({
      cursor: await chrome.permissions.contains({ origins: cursorOrigins }),
      codex: await chrome.permissions.contains({ origins: codexOrigins }),
    }),
    {
      cursorOrigins: cursorPermissionOrigins,
      codexOrigins: codexPermissionOrigins,
    },
  );
}

async function readBadgeSnapshot(page) {
  return page.evaluate(async () => {
    if (
      typeof chrome.action?.getBadgeText !== "function" ||
      typeof chrome.action?.getTitle !== "function"
    ) {
      return {
        text: null,
        title: null,
      };
    }

    return {
      text: await chrome.action.getBadgeText({}),
      title: await chrome.action.getTitle({}),
    };
  });
}

async function readSettingsSnapshot(page) {
  return page.evaluate(() => {
    function themeSnapshot() {
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
      };
    }

    function permissionInfo(providerId) {
      const prompt = document.querySelector(
        `.permission-prompt[data-provider-id="${providerId}"]`,
      );

      if (!(prompt instanceof HTMLElement)) {
        return null;
      }

      const chipTexts = Array.from(prompt.querySelectorAll(".meta-chip")).map((chip) =>
        chip.textContent?.trim() ?? "",
      );
      const actionButton = prompt.querySelector("button[data-permission-action]");

      return {
        className: prompt.className,
        permissionStatus: prompt.dataset.permissionStatus ?? null,
        statusLabel: chipTexts[0] ?? null,
        actionLabel: actionButton?.textContent?.trim() ?? null,
      };
    }

    return {
      ...themeSnapshot(),
      permissions: {
        cursor: permissionInfo("cursor"),
        codex: permissionInfo("codex"),
      },
    };
  });
}

async function readDashboardSnapshot(page) {
  return page.evaluate(() => {
    function themeSnapshot() {
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
      };
    }

    function providerCardSnapshot(providerId) {
      const card = document.querySelector(`article[data-provider-id="${providerId}"]`);

      if (!(card instanceof HTMLElement)) {
        return null;
      }

      const chips = Array.from(card.querySelectorAll(".meta-chip")).map((chip) =>
        chip.textContent?.trim() ?? "",
      );
      const supportingCopy = Array.from(
        card.querySelectorAll(".supporting-copy"),
      ).map((node) => node.textContent?.trim() ?? "");

      return {
        className: card.className,
        providerLabel:
          card.querySelector(".provider-card__provider")?.textContent?.trim() ?? null,
        planLabel:
          card.querySelector(".provider-card__plan")?.textContent?.trim() ?? null,
        statusLabel:
          card.querySelector(".status-chip")?.textContent?.trim() ?? null,
        usageText: card.querySelector(".body-copy")?.textContent?.trim() ?? null,
        resetLabel: supportingCopy[0] ?? null,
        contractDetail: supportingCopy[1] ?? null,
        chips,
        hasHostAccessMissingChip: chips.includes("Host access missing"),
      };
    }

    return {
      ...themeSnapshot(),
      providers: {
        cursor: providerCardSnapshot("cursor"),
        codex: providerCardSnapshot("codex"),
      },
    };
  });
}

async function readPopupSnapshot(page) {
  return page.evaluate(() => {
    function themeSnapshot() {
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
      };
    }

    const snapshotCard = document.querySelector(
      '[data-theme-local-surface="popup-snapshot-status-card"]',
    );
    const firstProviderCard = document.querySelector(".popup-provider-card");

    return {
      ...themeSnapshot(),
      snapshotStatus: {
        label:
          snapshotCard?.querySelector(".status-chip")?.textContent?.trim() ?? null,
        headline:
          snapshotCard?.querySelector(".section-title")?.textContent?.trim() ?? null,
      },
      firstProvider: firstProviderCard
        ? {
            providerLabel:
              firstProviderCard
                .querySelector(".popup-provider-card__provider")
                ?.textContent?.trim() ?? null,
            planLabel:
              firstProviderCard
                .querySelector(".popup-provider-card__plan")
                ?.textContent?.trim() ?? null,
            statusLabel:
              firstProviderCard
                .querySelector(".status-chip")
                ?.textContent?.trim() ?? null,
            detailLines: Array.from(
              firstProviderCard.querySelectorAll(".supporting-copy"),
            ).map((node) => node.textContent?.trim() ?? ""),
          }
        : null,
    };
  });
}

async function readProviderDetailSnapshot(page) {
  return page.evaluate(() => {
    function themeSnapshot() {
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
      };
    }

    function fieldValue(label) {
      const field = Array.from(document.querySelectorAll(".detail-field")).find(
        (node) =>
          node.querySelector(".detail-field__label")?.textContent?.trim() === label,
      );

      return (
        field?.querySelector(".detail-field__value")?.textContent?.trim() ?? null
      );
    }

    const noteLabels = Array.from(document.querySelectorAll(".detail-note__label")).map(
      (node) => node.textContent?.trim() ?? "",
    );

    return {
      ...themeSnapshot(),
      headline:
        document.querySelector(".display-headline")?.textContent?.trim() ?? null,
      statusLabel:
        document
          .querySelector(
            '[data-theme-stability-surface="provider-detail-sync-status-card"] .status-chip',
          )
          ?.textContent?.trim() ?? null,
      fields: {
        used: fieldValue("Used"),
        remaining: fieldValue("Remaining"),
        resetTime: fieldValue("Reset time"),
        syncSource: fieldValue("Sync source"),
        sourceState: fieldValue("Source state"),
        hostAccess: fieldValue("Host access"),
      },
      notes: {
        accessStatusPresent: noteLabels.includes("Access status"),
        sourceStatePresent: noteLabels.includes("Source state"),
        warningReasonPresent: noteLabels.includes("Warning reason"),
      },
    };
  });
}

function verifyThemeState(label, snapshot, mode) {
  assert(
    snapshot.themeMode === mode.themeMode,
    `${label}: expected theme mode ${mode.themeMode}, received ${snapshot.themeMode}`,
  );
  assert(
    snapshot.themePreset === "custom",
    `${label}: expected theme preset custom, received ${snapshot.themePreset}`,
  );
  assert(
    snapshot.themeResolved === mode.expectedResolved,
    `${label}: expected resolved theme ${mode.expectedResolved}, received ${snapshot.themeResolved}`,
  );
  assert(
    snapshot.themeCustomSeedHex === customSeedHex,
    `${label}: expected custom seed ${customSeedHex}, received ${snapshot.themeCustomSeedHex}`,
  );
}

function verifySharedPalette(label, snapshots) {
  const [reference, ...rest] = snapshots;
  assert(reference, `${label}: expected at least one snapshot`);

  for (const snapshot of rest) {
    assert(
      snapshot.cssVars.primary === reference.cssVars.primary,
      `${label}: expected shared primary ${reference.cssVars.primary}, received ${snapshot.cssVars.primary}`,
    );
    assert(
      snapshot.cssVars.tertiary === reference.cssVars.tertiary,
      `${label}: expected shared tertiary ${reference.cssVars.tertiary}, received ${snapshot.cssVars.tertiary}`,
    );
  }
}

function verifySettingsSnapshot(snapshot, scenarioLabel) {
  const expectedPermissionStatus = scenarioLabel === "degraded" ? "missing" : "granted";
  const expectedStatusLabel =
    scenarioLabel === "degraded" ? "Host access missing" : "Host access granted";
  const expectedActionLabel =
    scenarioLabel === "degraded" ? "Request access" : "Remove access";

  for (const providerId of ["cursor", "codex"]) {
    const permission = snapshot.permissions[providerId];
    assert(permission !== null, `settings: missing permission prompt for ${providerId}`);
    assert(
      permission.permissionStatus === expectedPermissionStatus,
      `settings:${providerId}: expected permission status ${expectedPermissionStatus}, received ${permission.permissionStatus}`,
    );
    assert(
      permission.statusLabel === expectedStatusLabel,
      `settings:${providerId}: expected status label ${expectedStatusLabel}, received ${permission.statusLabel}`,
    );
    assert(
      permission.actionLabel === expectedActionLabel,
      `settings:${providerId}: expected action ${expectedActionLabel}, received ${permission.actionLabel}`,
    );

    if (scenarioLabel === "degraded") {
      assert(
        permission.className.includes("permission-prompt--warning"),
        `settings:${providerId}: expected warning class while degraded`,
      );
    } else {
      assert(
        !permission.className.includes("permission-prompt--warning"),
        `settings:${providerId}: did not expect warning class while recovered`,
      );
    }
  }
}

function verifyDashboardSnapshot(snapshot, scenarioLabel) {
  const expectedStatusLabel = scenarioLabel === "degraded" ? "Needs access" : "Healthy";

  for (const providerId of ["cursor", "codex"]) {
    const provider = snapshot.providers[providerId];
    assert(provider !== null, `dashboard: missing provider card for ${providerId}`);
    assert(
      provider.statusLabel === expectedStatusLabel,
      `dashboard:${providerId}: expected status ${expectedStatusLabel}, received ${provider.statusLabel}`,
    );

    if (scenarioLabel === "degraded") {
      assert(
        provider.hasHostAccessMissingChip === true,
        `dashboard:${providerId}: expected host access missing chip`,
      );
    } else {
      assert(
        provider.hasHostAccessMissingChip === false,
        `dashboard:${providerId}: did not expect host access missing chip`,
      );
    }
  }

  if (scenarioLabel === "degraded") {
    assert(
      normalize(snapshot.providers.cursor.resetLabel) ===
        "Grant Cursor host access to read the logged-in personal usage page",
      `dashboard: unexpected degraded Cursor reset label ${snapshot.providers.cursor.resetLabel}`,
    );
    assert(
      normalize(snapshot.providers.codex.resetLabel) ===
        "Grant Codex host access to read the logged-in ChatGPT usage page",
      `dashboard: unexpected degraded Codex reset label ${snapshot.providers.codex.resetLabel}`,
    );
  } else {
    assert(
      normalize(snapshot.providers.cursor.resetLabel) ===
        "Usage per day across this billing period",
      `dashboard: unexpected recovered Cursor reset label ${snapshot.providers.cursor.resetLabel}`,
    );
    assert(
      normalize(snapshot.providers.codex.resetLabel) ===
        "5-hour usage window resets at 2026-04-23 19:45",
      `dashboard: unexpected recovered Codex reset label ${snapshot.providers.codex.resetLabel}`,
    );
    assert(
      normalize(snapshot.providers.codex.usageText) === "3% used · 97% remaining",
      `dashboard: unexpected recovered Codex usage text ${snapshot.providers.codex.usageText}`,
    );
  }
}

function verifyPopupSnapshot(snapshot, scenarioLabel) {
  const expectedSnapshotLabel = scenarioLabel === "degraded" ? "Mixed state" : "Aligned";
  const expectedProviderStatus = scenarioLabel === "degraded" ? "Needs access" : "Healthy";

  assert(
    snapshot.snapshotStatus.label === expectedSnapshotLabel,
    `popup: expected snapshot label ${expectedSnapshotLabel}, received ${snapshot.snapshotStatus.label}`,
  );
  assert(snapshot.firstProvider !== null, "popup: expected one featured provider");
  assert(
    snapshot.firstProvider.providerLabel === "Codex",
    `popup: expected Codex to remain the first featured provider, received ${snapshot.firstProvider.providerLabel}`,
  );
  assert(
    snapshot.firstProvider.statusLabel === expectedProviderStatus,
    `popup: expected first provider status ${expectedProviderStatus}, received ${snapshot.firstProvider.statusLabel}`,
  );

  if (scenarioLabel === "degraded") {
    assert(
      normalize(snapshot.firstProvider.detailLines[0]) ===
        "Current shipped contract for Codex personal users. The page exposes real usage-window percentages and reset timing, but not one absolute remaining balance across all visible windows.",
      `popup: unexpected degraded first-provider detail ${snapshot.firstProvider.detailLines[0]}`,
    );
  } else {
    assert(
      normalize(snapshot.firstProvider.detailLines[1]) ===
        "Weekly usage window: 88% remaining",
      `popup: unexpected recovered first-provider detail ${snapshot.firstProvider.detailLines[1]}`,
    );
  }
}

function verifyProviderDetailSnapshot(snapshot, scenarioLabel, providerId) {
  const expectedStatusLabel = scenarioLabel === "degraded" ? "Needs access" : "Healthy";

  assert(
    snapshot.statusLabel === expectedStatusLabel,
    `${providerId} detail: expected status ${expectedStatusLabel}, received ${snapshot.statusLabel}`,
  );

  if (scenarioLabel === "degraded") {
    assert(
      snapshot.notes.accessStatusPresent === true,
      `${providerId} detail: expected access-status note while degraded`,
    );
    assert(
      snapshot.notes.sourceStatePresent === true,
      `${providerId} detail: expected source-state note while degraded`,
    );
  } else {
    assert(
      snapshot.notes.accessStatusPresent === false,
      `${providerId} detail: did not expect access-status note while recovered`,
    );
    assert(
      snapshot.notes.sourceStatePresent === false,
      `${providerId} detail: did not expect source-state note while recovered`,
    );
  }

  if (scenarioLabel === "recovered" && providerId === "cursor") {
    assert(
      normalize(snapshot.fields.resetTime) === "Apr 1 - Apr 30",
      `cursor detail: unexpected recovered reset time ${snapshot.fields.resetTime}`,
    );
  }

  if (scenarioLabel === "recovered" && providerId === "codex") {
    assert(
      normalize(snapshot.fields.used) === "3% used · 97% remaining",
      `codex detail: unexpected recovered used field ${snapshot.fields.used}`,
    );
    assert(
      normalize(snapshot.fields.resetTime) === "2026-04-23 19:45",
      `codex detail: unexpected recovered reset time ${snapshot.fields.resetTime}`,
    );
  }
}

function verifyPermissionSnapshot(snapshot, scenarioLabel) {
  const expected = scenarioLabel === "degraded";
  assert(
    snapshot.cursor === !expected,
    `permission check: expected cursor granted=${!expected}, received ${snapshot.cursor}`,
  );
  assert(
    snapshot.codex === !expected,
    `permission check: expected codex granted=${!expected}, received ${snapshot.codex}`,
  );
}

function verifyBadgeSnapshot(snapshot, scenarioLabel) {
  const expectedText = scenarioLabel === "degraded" ? "2" : "";
  assert(
    snapshot.text === expectedText,
    `badge: expected text "${expectedText}", received "${snapshot.text}"`,
  );

  if (scenarioLabel === "degraded") {
    assert(
      normalize(snapshot.title).includes("2 visible providers need attention"),
      `badge: unexpected degraded title ${snapshot.title}`,
    );
  } else {
    assert(
      normalize(snapshot.title).includes("all visible providers are healthy"),
      `badge: unexpected recovered title ${snapshot.title}`,
    );
  }
}

async function installSyntheticVendorRoutes(context) {
  const cursorHtml = createCursorSyntheticHtml();
  const codexHtml = createCodexSyntheticHtml();

  await context.route("https://cursor.com/dashboard/usage*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: cursorHtml,
    });
  });

  await context.route(
    "https://chatgpt.com/codex/cloud/settings/analytics*",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: codexHtml,
      });
    },
  );
}

async function openSyntheticVendorTabs(context) {
  const cursorPage = await context.newPage();
  await cursorPage.goto(cursorVendorUrl, { waitUntil: "load" });
  await cursorPage.waitForSelector("text=Usage per day across this billing period");

  const codexPage = await context.newPage();
  await codexPage.goto(codexVendorUrl, { waitUntil: "load" });
  await codexPage.waitForSelector("text=5 hour usage window");

  return [cursorPage, codexPage];
}

async function runScenario({ context, extensionId, mode, scenarioSlug }) {
  const scenarioDir = path.join(artifactDir, mode.slug, scenarioSlug);
  await mkdir(scenarioDir, { recursive: true });

  if (scenarioSlug === "recovered") {
    await installSyntheticVendorRoutes(context);
    await openSyntheticVendorTabs(context);
  }

  const settingsPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html#settings",
  );
  await waitForSettingsReady(settingsPage);
  await seedScenarioState(settingsPage, mode);
  await settingsPage.reload({ waitUntil: "load" });
  await waitForSettingsReady(settingsPage);
  await waitForThemeState(settingsPage, mode);
  await waitForPermissionStatus(
    settingsPage,
    "cursor",
    scenarioSlug === "degraded" ? "missing" : "granted",
  );
  await waitForPermissionStatus(
    settingsPage,
    "codex",
    scenarioSlug === "degraded" ? "missing" : "granted",
  );

  const dashboardPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html#dashboard",
  );
  await waitForDashboardReady(dashboardPage);
  await waitForThemeState(dashboardPage, mode);
  await waitForProviderCardStatus(
    dashboardPage,
    "cursor",
    scenarioSlug === "degraded" ? "Needs access" : "Healthy",
  );
  await waitForProviderCardStatus(
    dashboardPage,
    "codex",
    scenarioSlug === "degraded" ? "Needs access" : "Healthy",
  );

  const popupPage = await openExtensionPage(
    context,
    extensionId,
    "src/popup/index.html",
  );
  await waitForPopupReady(popupPage);
  await waitForThemeState(popupPage, mode);
  await waitForPopupStatus(
    popupPage,
    scenarioSlug === "degraded" ? "Mixed state" : "Aligned",
    scenarioSlug === "degraded" ? "Needs access" : "Healthy",
  );

  const cursorDetailPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html#provider-detail/cursor",
  );
  await waitForProviderDetailReady(cursorDetailPage);
  await waitForThemeState(cursorDetailPage, mode);
  await waitForDetailStatus(
    cursorDetailPage,
    scenarioSlug === "degraded" ? "Needs access" : "Healthy",
    scenarioSlug === "degraded",
  );

  const codexDetailPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html#provider-detail/codex",
  );
  await waitForProviderDetailReady(codexDetailPage);
  await waitForThemeState(codexDetailPage, mode);
  await waitForDetailStatus(
    codexDetailPage,
    scenarioSlug === "degraded" ? "Needs access" : "Healthy",
    scenarioSlug === "degraded",
  );

  const permissionSnapshot = await readPermissionSnapshot(settingsPage);
  const settingsSnapshot = await readSettingsSnapshot(settingsPage);
  const dashboardSnapshot = await readDashboardSnapshot(dashboardPage);
  const popupSnapshot = await readPopupSnapshot(popupPage);
  const cursorDetailSnapshot = await readProviderDetailSnapshot(cursorDetailPage);
  const codexDetailSnapshot = await readProviderDetailSnapshot(codexDetailPage);
  const badgeSnapshot = await readBadgeSnapshot(popupPage);

  await settingsPage.screenshot({
    path: path.join(scenarioDir, "settings.png"),
    fullPage: true,
  });
  await dashboardPage.screenshot({
    path: path.join(scenarioDir, "dashboard.png"),
    fullPage: true,
  });
  await popupPage.screenshot({
    path: path.join(scenarioDir, "popup.png"),
    fullPage: true,
  });
  await cursorDetailPage.screenshot({
    path: path.join(scenarioDir, "cursor-detail.png"),
    fullPage: true,
  });
  await codexDetailPage.screenshot({
    path: path.join(scenarioDir, "codex-detail.png"),
    fullPage: true,
  });

  await Promise.allSettled([
    settingsPage.close(),
    dashboardPage.close(),
    popupPage.close(),
    cursorDetailPage.close(),
    codexDetailPage.close(),
  ]);

  return {
    permissionSnapshot,
    badgeSnapshot,
    settings: settingsSnapshot,
    dashboard: dashboardSnapshot,
    popup: popupSnapshot,
    cursorDetail: cursorDetailSnapshot,
    codexDetail: codexDetailSnapshot,
  };
}

function verifyScenario(mode, scenarioSlug, result) {
  const labelPrefix = `${mode.slug}/${scenarioSlug}`;
  const themeSnapshots = [
    result.settings,
    result.dashboard,
    result.popup,
    result.cursorDetail,
    result.codexDetail,
  ];

  for (const [index, snapshot] of themeSnapshots.entries()) {
    verifyThemeState(`${labelPrefix}:theme:${index}`, snapshot, mode);
  }

  verifySharedPalette(labelPrefix, themeSnapshots);
  verifyPermissionSnapshot(result.permissionSnapshot, scenarioSlug);
  verifyBadgeSnapshot(result.badgeSnapshot, scenarioSlug);
  verifySettingsSnapshot(result.settings, scenarioSlug);
  verifyDashboardSnapshot(result.dashboard, scenarioSlug);
  verifyPopupSnapshot(result.popup, scenarioSlug);
  verifyProviderDetailSnapshot(result.cursorDetail, scenarioSlug, "cursor");
  verifyProviderDetailSnapshot(result.codexDetail, scenarioSlug, "codex");
}

function verifyModePair(mode, degraded, recovered) {
  assert(
    degraded.settings.cssVars.primary === recovered.settings.cssVars.primary,
    `${mode.slug}: expected degraded and recovered primary to match`,
  );
  assert(
    degraded.settings.cssVars.tertiary === recovered.settings.cssVars.tertiary,
    `${mode.slug}: expected degraded and recovered tertiary to match`,
  );
}

const results = [];

try {
  await mkdir(artifactDir, { recursive: true });

  for (const mode of modes) {
    console.log(`phase111: preparing ${mode.slug}`);

    const degradedRuntime = await createExtensionRuntime({ grantHosts: false });
    let degradedResult;

    try {
      degradedResult = await runScenario({
        context: degradedRuntime.context,
        extensionId: degradedRuntime.extensionId,
        mode,
        scenarioSlug: "degraded",
      });
    } finally {
      await degradedRuntime.context.close().catch(() => {});
      await rm(degradedRuntime.userDataDir, {
        recursive: true,
        force: true,
      }).catch(() => {});
    }

    verifyScenario(mode, "degraded", degradedResult);

    const recoveredRuntime = await createExtensionRuntime({ grantHosts: true });
    let recoveredResult;

    try {
      recoveredResult = await runScenario({
        context: recoveredRuntime.context,
        extensionId: recoveredRuntime.extensionId,
        mode,
        scenarioSlug: "recovered",
      });
    } finally {
      await recoveredRuntime.context.close().catch(() => {});
      await rm(recoveredRuntime.userDataDir, {
        recursive: true,
        force: true,
      }).catch(() => {});
    }

    verifyScenario(mode, "recovered", recoveredResult);
    verifyModePair(mode, degradedResult, recoveredResult);

    results.push({
      mode: mode.slug,
      themeMode: mode.themeMode,
      expectedResolved: mode.expectedResolved,
      customSeedHex,
      degraded: degradedResult,
      recovered: recoveredResult,
    });
  }

  const resultsPath = path.join(artifactDir, "phase111-results.json");
  await writeFile(resultsPath, JSON.stringify(results, null, 2));

  console.log(`phase111: wrote artifacts under ${artifactDir}`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
