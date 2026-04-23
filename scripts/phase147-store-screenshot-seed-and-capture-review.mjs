import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";

import { chromium } from "playwright";

import {
  buildStoreScreenshotSeedRoutePath,
  STORE_SCREENSHOT_SEED_APPLIED_TITLE,
  STORE_SCREENSHOT_SEED_CLEARED_TITLE,
} from "./lib/store-screenshot-rdp-capture.mjs";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist");
const outputDir = path.join(
  projectRoot,
  "tmp",
  "phase147-store-screenshot-seed-and-capture-review",
);
const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
const STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY =
  "ai-usage-dashboard.store-screenshot-seed-lock";
const STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY =
  "ai-usage-dashboard.store-screenshot-seed-backup";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

function buildExtensionUrl(extensionId, relativePathWithHash) {
  return `chrome-extension://${extensionId}/${relativePathWithHash}`;
}

async function openExtensionPage(context, extensionId, relativePathWithHash) {
  const hashIndex = relativePathWithHash.indexOf("#");
  const pathWithSearch =
    hashIndex === -1
      ? relativePathWithHash
      : relativePathWithHash.slice(0, hashIndex);
  const hash =
    hashIndex === -1 ? "" : relativePathWithHash.slice(hashIndex);
  const page = await context.newPage();
  await page.goto(buildExtensionUrl(extensionId, pathWithSearch), {
    waitUntil: "load",
  });

  if (hash.length > 0) {
    await page.evaluate((nextHash) => {
      window.location.hash = nextHash;
    }, hash);
  }

  return page;
}

async function waitForTitle(page, expectedTitle, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if ((await page.title()) === expectedTitle) {
      return;
    }

    await page.waitForTimeout(250);
  }

  throw new Error(
    `Timed out waiting for page title \`${expectedTitle}\`; last title was \`${await page.title()}\`.`,
  );
}

async function readChromeStorageValue(page, storageKey) {
  return page.evaluate(async (key) => {
    const stored = await chrome.storage.local.get(key);
    return stored[key] ?? null;
  }, storageKey);
}

async function readSeedLock(page) {
  return page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY);
}

async function readSeedBackup(page) {
  return page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  }, STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY);
}

async function applySeedPreset(context, extensionId, preset) {
  const page = await openExtensionPage(
    context,
    extensionId,
    buildStoreScreenshotSeedRoutePath(preset),
  );
  await waitForTitle(
    page,
    preset === "unlock"
      ? STORE_SCREENSHOT_SEED_CLEARED_TITLE
      : STORE_SCREENSHOT_SEED_APPLIED_TITLE,
  );

  return page;
}

async function waitForPopupReady(page) {
  await page.waitForSelector("text=Quick glance");
}

async function waitForSettingsReady(page) {
  await page.waitForSelector("text=Global Preferences");
}

async function waitForProviderDetailReady(page) {
  await page.waitForSelector("text=Provider Detail");
}

async function run() {
  const issues = [];
  const userDataDir = await mkdtemp(
    path.join(tmpdir(), "ai-usage-dashboard-phase147-"),
  );
  await mkdir(outputDir, { recursive: true });

  let context;

  try {
    context = await launchExtensionContext(userDataDir);
    const extensionId = await getExtensionId(context);

    const quickGlanceSeedPage = await applySeedPreset(
      context,
      extensionId,
      "toolbar-first-quick-glance",
    );
    const quickGlanceState = await readChromeStorageValue(
      quickGlanceSeedPage,
      APP_STATE_STORAGE_KEY,
    );
    const quickGlanceLock = await readSeedLock(quickGlanceSeedPage);
    const quickGlanceBackup = await readSeedBackup(quickGlanceSeedPage);
    const preSeedAppState = quickGlanceBackup?.hasBackup
      ? (quickGlanceBackup.appState ?? null)
      : null;

    if (quickGlanceLock !== "true") {
      issues.push("Quick-glance seed did not enable the side-panel screenshot seed lock.");
    }

    const enabledQuickGlanceProviders = quickGlanceState?.providerSettings
      ?.filter((provider) => provider.enabled)
      ?.map((provider) => provider.id) ?? [];

    if (
      JSON.stringify(enabledQuickGlanceProviders) !==
      JSON.stringify(["cursor", "claude-code", "codex"])
    ) {
      issues.push(
        `Quick-glance seed enabled providers ${JSON.stringify(enabledQuickGlanceProviders)} instead of cursor/claude-code/codex.`,
      );
    }

    const popupQuickGlancePage = await openExtensionPage(
      context,
      extensionId,
      "src/popup/index.html",
    );
    await waitForPopupReady(popupQuickGlancePage);
    await popupQuickGlancePage.waitForSelector("text=Cursor");
    await popupQuickGlancePage.waitForSelector("text=Claude Code");
    await popupQuickGlancePage.waitForSelector("text=Codex");
    await popupQuickGlancePage.screenshot({
      path: path.join(outputDir, "popup-quick-glance.png"),
    });

    const settingsSeedPage = await applySeedPreset(
      context,
      extensionId,
      "settings-and-setup-depth",
    );
    const settingsSeedState = await readChromeStorageValue(
      settingsSeedPage,
      APP_STATE_STORAGE_KEY,
    );
    const cursorStatus =
      settingsSeedState?.providerSettings?.find((provider) => provider.id === "cursor")
        ?.status ?? null;
    const codexCredentialStatus =
      settingsSeedState?.providerSettings?.find((provider) => provider.id === "codex")
        ?.credentialStatus ?? null;

    if (cursorStatus !== "missing" || codexCredentialStatus !== "missing") {
      issues.push(
        `Settings seed state drifted before capture. cursor.status=${cursorStatus} codex.credentialStatus=${codexCredentialStatus}.`,
      );
    }

    const settingsPage = await openExtensionPage(
      context,
      extensionId,
      "src/sidepanel/index.html#settings",
    );
    await waitForSettingsReady(settingsPage);
    const settingsState = await readChromeStorageValue(
      settingsPage,
      APP_STATE_STORAGE_KEY,
    );
    const settingsCursorStatus =
      settingsState?.providerSettings?.find((provider) => provider.id === "cursor")
        ?.status ?? null;
    const settingsCodexCredentialStatus =
      settingsState?.providerSettings?.find((provider) => provider.id === "codex")
        ?.credentialStatus ?? null;

    if (
      settingsCursorStatus !== "missing" ||
      settingsCodexCredentialStatus !== "missing"
    ) {
      issues.push(
        `Settings page init overwrote the screenshot seed. cursor.status=${settingsCursorStatus} codex.credentialStatus=${settingsCodexCredentialStatus}.`,
      );
    }

    await settingsPage.waitForSelector("text=Cursor");
    await settingsPage.waitForSelector("text=Codex");
    await settingsPage.screenshot({
      path: path.join(outputDir, "settings-setup-depth.png"),
      fullPage: true,
    });

    const contractOnlySeedPage = await applySeedPreset(
      context,
      extensionId,
      "honest-contract-or-policy-only",
    );
    const contractOnlyState = await readChromeStorageValue(
      contractOnlySeedPage,
      APP_STATE_STORAGE_KEY,
    );
    const enabledContractOnlyProviders = contractOnlyState?.providerSettings
      ?.filter((provider) => provider.enabled)
      ?.map((provider) => provider.id) ?? [];

    if (JSON.stringify(enabledContractOnlyProviders) !== JSON.stringify(["gemini"])) {
      issues.push(
        `Contract-only seed enabled providers ${JSON.stringify(enabledContractOnlyProviders)} instead of just gemini.`,
      );
    }

    const popupContractOnlyPage = await openExtensionPage(
      context,
      extensionId,
      "src/popup/index.html",
    );
    await waitForPopupReady(popupContractOnlyPage);
    await popupContractOnlyPage.waitForSelector("text=Gemini");
    await popupContractOnlyPage.screenshot({
      path: path.join(outputDir, "popup-contract-only.png"),
    });

    const providerDepthSeedPage = await applySeedPreset(
      context,
      extensionId,
      "provider-or-dashboard-depth",
    );
    const providerDepthState = await readChromeStorageValue(
      providerDepthSeedPage,
      APP_STATE_STORAGE_KEY,
    );
    const codexWarningReason =
      providerDepthState?.providers?.find(
        (provider) => provider.providerId === "codex",
      )?.warningReason ?? "";

    if (!String(codexWarningReason).includes("Enterprise analytics API selected")) {
      issues.push("Provider-depth seed did not preserve the Codex warning reason.");
    }

    const providerDetailPage = await openExtensionPage(
      context,
      extensionId,
      "src/sidepanel/index.html#provider-detail/codex",
    );
    await waitForProviderDetailReady(providerDetailPage);
    await providerDetailPage.waitForSelector("text=Codex");
    await providerDetailPage.screenshot({
      path: path.join(outputDir, "provider-detail-depth.png"),
      fullPage: true,
    });

    const unlockPage = await applySeedPreset(context, extensionId, "unlock");
    const unlockedState = await readChromeStorageValue(
      unlockPage,
      APP_STATE_STORAGE_KEY,
    );
    const unlockLock = await readSeedLock(unlockPage);

    if (!isDeepStrictEqual(unlockedState, preSeedAppState)) {
      issues.push(
        "Unlock did not restore the pre-seed app state baseline in the temp extension profile.",
      );
    }

    if (unlockLock !== null) {
      issues.push("Unlock did not clear the local screenshot seed lock.");
    }

    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, "package.json"), "utf8"),
    );
    if (!packageJson.scripts?.["store:apply-rdp-screenshot-seed"]) {
      issues.push("package.json is missing store:apply-rdp-screenshot-seed.");
    }
    if (!packageJson.scripts?.["store:capture-screenshot-request-from-rdp"]) {
      issues.push("package.json is missing store:capture-screenshot-request-from-rdp.");
    }

    const runbook = await readFile(
      path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Runbook.md"),
      "utf8",
    );
    if (!runbook.includes("store:capture-screenshot-request-from-rdp")) {
      issues.push("Store screenshot runbook is missing the request capture runner command.");
    }

    if (!runbook.includes("store:apply-rdp-screenshot-seed")) {
      issues.push("Store screenshot runbook is missing the seed helper command.");
    }
    await writeFile(
      path.join(outputDir, "phase147-results.json"),
      `${JSON.stringify(
        {
          issues,
          enabledQuickGlanceProviders,
          enabledContractOnlyProviders,
          codexWarningReason,
          artifactPaths: [
            "tmp/phase147-store-screenshot-seed-and-capture-review/popup-quick-glance.png",
            "tmp/phase147-store-screenshot-seed-and-capture-review/settings-setup-depth.png",
            "tmp/phase147-store-screenshot-seed-and-capture-review/popup-contract-only.png",
            "tmp/phase147-store-screenshot-seed-and-capture-review/provider-detail-depth.png",
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    if (issues.length > 0) {
      throw new Error(
        `phase147: store screenshot seed review found ${issues.length} issue(s).\n${issues
          .map((issue) => `- ${issue}`)
          .join("\n")}`,
      );
    }

    console.log("phase147: store screenshot seed and capture workflow verified");
  } finally {
    await context?.close().catch(() => {});
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
