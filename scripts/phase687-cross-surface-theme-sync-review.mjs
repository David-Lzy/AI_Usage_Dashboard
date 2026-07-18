import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase687-cross-surface-theme-sync-review",
);
const userDataDir = await mkdtemp(
  path.join(tmpdir(), "ai-usage-dashboard-phase687-"),
);

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

async function setThemeMode(page, themeMode) {
  const response = await page.evaluate(
    async (nextThemeMode) =>
      chrome.runtime.sendMessage({
        type: "app:update-settings",
        settings: { themeMode: nextThemeMode },
      }),
    themeMode,
  );

  assert(response?.ok, `Failed to set the shared theme mode to ${themeMode}.`);
}

async function waitForThemeMode(page, themeMode) {
  await page.waitForFunction(
    (expectedThemeMode) =>
      document.documentElement.dataset.themeMode === expectedThemeMode,
    themeMode,
  );
}

await rm(artifactDir, { recursive: true, force: true });
await mkdir(artifactDir, { recursive: true });

let context;

try {
  context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const serviceWorker = await waitForServiceWorker(context);
  const extensionId = serviceWorker.url().split("/")[2];
  assert(extensionId, "Failed to resolve the extension id.");

  const settingsPage = await context.newPage();
  const popupPage = await context.newPage();
  const settingsUrl = `chrome-extension://${extensionId}/src/sidepanel/index.html?surface=full-page#settings`;
  const popupUrl = `chrome-extension://${extensionId}/src/popup/index.html`;

  await settingsPage.goto(settingsUrl, { waitUntil: "domcontentloaded" });
  await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await settingsPage.waitForSelector(
    '[data-settings-material-select="theme-mode"]',
  );
  await popupPage.waitForSelector('[data-popup-toggle-theme-mode="true"]');

  await setThemeMode(settingsPage, "light");
  await Promise.all([
    waitForThemeMode(settingsPage, "light"),
    waitForThemeMode(popupPage, "light"),
  ]);

  await popupPage.locator('[data-popup-toggle-theme-mode="true"]').click();
  const themeOptions = popupPage.locator('[role="menuitemradio"]');
  assert((await themeOptions.count()) === 4, "Theme menu is incomplete.");
  await themeOptions.nth(2).click();

  await Promise.all([
    waitForThemeMode(popupPage, "dark"),
    waitForThemeMode(settingsPage, "dark"),
  ]);

  const settingsThemeText = await settingsPage
    .locator(
      '[data-settings-material-select="theme-mode"] .material-select__value',
    )
    .textContent();
  const settingsTopBarText = await settingsPage
    .locator('[data-topbar-toggle-theme-mode="true"]')
    .textContent();

  assert(
    settingsThemeText?.trim() === "Dark",
    `Settings select stayed at ${JSON.stringify(settingsThemeText)} after the popup selected Dark.`,
  );
  assert(
    settingsTopBarText?.trim() === "Dark",
    `Settings top bar stayed at ${JSON.stringify(settingsTopBarText)} after the popup selected Dark.`,
  );

  await settingsPage.screenshot({
    path: path.join(artifactDir, "settings-after-popup-dark-theme.png"),
    fullPage: true,
  });

  await setThemeMode(settingsPage, "light");
  await Promise.all([
    waitForThemeMode(settingsPage, "light"),
    waitForThemeMode(popupPage, "light"),
  ]);

  assert(
    (await popupPage
      .locator('[data-popup-toggle-theme-mode="true"]')
      .getAttribute("data-theme-mode")) === "light",
    "Popup did not receive the Settings theme update.",
  );

  await popupPage.screenshot({
    path: path.join(artifactDir, "popup-after-settings-light-theme.png"),
    fullPage: true,
  });

  console.log("phase687: cross-surface theme synchronization verified");
} finally {
  await context?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
