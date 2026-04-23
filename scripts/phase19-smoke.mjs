import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist");
const previewUrl = "http://127.0.0.1:4173/src/sidepanel/index.html";
const userDataDir = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForServiceWorker(context, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error("Timed out waiting for extension service worker to start");
}

async function runPreviewChecks(browser) {
  console.log("preview: open dashboard");
  const page = await browser.newPage();
  await page.goto(previewUrl, { waitUntil: "networkidle" });

  await page.waitForSelector("text=AI Usage Dashboard");
  console.log("preview: open settings");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector("text=Permission controls");
  await page.waitForSelector("text=Hybrid source labels");
  await page.waitForSelector("text=Policy only");

  console.log("preview: simulate host access toggle");
  await page
    .getByRole("button", { name: "Request access" })
    .first()
    .click();
  await page.waitForSelector("text=access simulated");

  console.log("preview: verify detail route");
  await page.getByRole("button", { name: "Back" }).click();
  await page.waitForSelector("text=Provider cards");

  await page.getByRole("button", { name: "Open" }).first().click();
  await page.waitForSelector("text=Provider Detail");
  await page.getByRole("button", { name: "Back" }).click();
  await page.waitForSelector("text=Provider cards");

  await page.close();
}

async function runExtensionChecks(context) {
  console.log("extension: wait for service worker");
  const serviceWorker = await waitForServiceWorker(context);

  const extensionId = serviceWorker.url().split("/")[2];
  assert(extensionId, "Failed to resolve extension id from service worker url");

  console.log("extension: open side panel page");
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`, {
    waitUntil: "networkidle",
  });

  await page.waitForSelector("text=AI Usage Dashboard");
  console.log("extension: open settings");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector("text=Permission controls");
  await page.waitForSelector("text=Hybrid source labels");
  await page.waitForSelector("text=No host access required");
  const sessionPageButtons = page.getByRole("button", {
    name: "Find or open page",
  });
  await sessionPageButtons.first().waitFor();
  const sessionPageButtonCount = await sessionPageButtons.count();
  assert(
    sessionPageButtonCount >= 2,
    "Expected at least two session-page helper buttons in extension mode",
  );

  const geminiButton = page.getByRole("button", { name: "No action needed" });
  await geminiButton.waitFor();
  assert(await geminiButton.isDisabled(), "Gemini permission button should be disabled");

  const hasPermissionsApi = await page.evaluate(
    () => typeof chrome.permissions?.request === "function",
  );
  assert(hasPermissionsApi, "chrome.permissions API should be available in extension mode");

  const jetbrainsBadge = page.locator("text=Host access missing").first();
  await jetbrainsBadge.waitFor();

  console.log("extension: verify detail route");
  await page.getByRole("button", { name: "Back" }).click();
  await page.waitForSelector("text=Provider cards");
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.waitForSelector("text=Provider Detail");
  await page.getByRole("button", { name: "Back" }).click();
  await page.waitForSelector("text=Provider cards");

  await page.close();
}

let browser;
let context;

try {
  console.log("launch preview browser");
  browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  await runPreviewChecks(browser);
  await browser.close();
  browser = null;

  console.log("launch extension browser");
  context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  await runExtensionChecks(context);

  console.log("Phase 19 smoke checks passed");
} finally {
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
