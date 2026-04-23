import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import process from "node:process";

import { chromium } from "playwright";

const extensionPath = path.join(process.cwd(), "dist");
const userDataDir = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-phase27-"));

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

async function openExtensionPage(context) {
  const serviceWorker = await waitForServiceWorker(context);
  const extensionId = serviceWorker.url().split("/")[2];
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector("text=AI Usage Dashboard");
  return page;
}

async function verifyDashboardAndDetail(context) {
  const page = await openExtensionPage(context);
  console.log("phase27: dashboard loaded");

  await page.getByRole("button", { name: "Refresh All" }).click();
  await page.waitForSelector("text=All providers refreshed");
  console.log("phase27: refresh action surfaced success toast");

  await page.getByRole("button", { name: "Open" }).first().click();
  await page.waitForSelector("text=Provider Detail");
  await page.getByRole("button", { name: "Back" }).click();
  await page.waitForSelector("text=Provider cards");
  console.log("phase27: detail route round-trip passed");

  await page.close();
}

async function verifySettingsPersistence(context) {
  const page = await openExtensionPage(context);
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector("text=Permission controls");

  await page.selectOption("select", "60");
  await page.locator(".settings-grid select").nth(1).selectOption("90");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForSelector("text=Preferences saved");

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector("text=Permission controls");

  const selects = page.locator(".settings-grid select");
  const syncValue = await selects.nth(0).inputValue();
  const thresholdValue = await selects.nth(1).inputValue();

  assert(syncValue === "60", `Expected sync interval 60, got ${syncValue}`);
  assert(
    thresholdValue === "90",
    `Expected warning threshold 90, got ${thresholdValue}`,
  );
  console.log("phase27: settings persistence across reload passed");

  await page.close();
}

async function verifySettingsPersistenceAcrossRelaunch(browserType) {
  const context = await browserType.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    const page = await openExtensionPage(context);
    await page.getByRole("button", { name: "Settings" }).click();
    await page.waitForSelector("text=Permission controls");

    const selects = page.locator(".settings-grid select");
    const syncValue = await selects.nth(0).inputValue();
    const thresholdValue = await selects.nth(1).inputValue();

    assert(syncValue === "60", `Expected sync interval 60 after relaunch, got ${syncValue}`);
    assert(
      thresholdValue === "90",
      `Expected warning threshold 90 after relaunch, got ${thresholdValue}`,
    );
    console.log("phase27: settings persistence across relaunch passed");
    await page.close();
  } finally {
    await context.close();
  }
}

async function probePermissionPrompt(context) {
  const page = await openExtensionPage(context);
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector("text=Permission controls");

  const containsBefore = await page.evaluate(async () =>
    chrome.permissions.contains({
      origins: ["https://api.cursor.com/*"],
    }),
  );

  await page.getByRole("button", { name: "Request access" }).first().click();
  await page.waitForTimeout(1500);

  const containsAfter = await page.evaluate(async () =>
    chrome.permissions.contains({
      origins: ["https://api.cursor.com/*"],
    }),
  );
  const grantedToastCount = await page.locator("text=access granted").count();
  const deniedToastCount = await page.locator("text=access denied").count();

  console.log(
    `phase27: permission probe contains_before=${containsBefore} contains_after=${containsAfter} granted_toasts=${grantedToastCount} denied_toasts=${deniedToastCount}`,
  );

  await page.close();

  return {
    containsBefore,
    containsAfter,
    grantedToastCount,
    deniedToastCount,
  };
}

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

  await verifyDashboardAndDetail(context);
  await verifySettingsPersistence(context);
  await context.close();
  context = null;

  await verifySettingsPersistenceAcrossRelaunch(chromium);

  context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const permissionProbe = await probePermissionPrompt(context);

  if (
    permissionProbe.containsBefore === false &&
    permissionProbe.containsAfter === false &&
    permissionProbe.grantedToastCount === 0 &&
    permissionProbe.deniedToastCount === 0
  ) {
    console.log(
      "phase27: native host-permission prompt could not be completed in headless Chromium; operator GUI verification is still required",
    );
  }

  console.log("Phase 27 real-profile checks completed");
} finally {
  await context?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
