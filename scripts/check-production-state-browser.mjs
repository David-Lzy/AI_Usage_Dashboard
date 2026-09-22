import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const extensionArg = process.argv.find((value) => value.startsWith("--extension="));
assert(extensionArg, "Pass --extension=<isolated build directory>; no live-build default is allowed.");
const extensionPath = path.resolve(extensionArg.slice("--extension=".length));
const manifest = JSON.parse(await readFile(path.join(extensionPath, "manifest.json"), "utf8"));
const artifactRoot = path.resolve("tmp/output/playwright/production-state");
await mkdir(artifactRoot, { recursive: true });
const output = await mkdtemp(path.join(artifactRoot, "run-"));
const browserOptions = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
  : { channel: "chromium" };
const context = await chromium.launchPersistentContext(path.join(output, "profile"), {
  ...browserOptions,
  headless: true,
  offline: true,
  viewport: { width: 430, height: 760 },
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});
const pageErrors = [];
const loadedAssets = new Set();
const stateKey = "ai-usage-dashboard.app-state";
let report;

async function settle(page) {
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter((animation) =>
      Number.isFinite(animation.effect?.getComputedTiming().endTime),
    ).map((animation) => animation.finished.catch(() => undefined)));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function assertBlank(state, label, allowAttempts = false) {
  assert.equal(state.providers.length, 9, label);
  for (const provider of state.providers) {
    for (const field of ["used", "remaining", "total", "lastSuccessAt"]) {
      assert.equal(provider[field] ?? null, null, `${label}: ${provider.providerId}.${field}`);
    }
    assert.equal(provider.resetAt, "", `${label}: invented reset`);
    assert(!provider.usageHistory && !provider.cursorUsage && !provider.apiGatewayMetering, `${label}: invented aggregate`);
    for (const field of ["usageWindows", "usageBalances", "usageFacts"]) assert.deepEqual(provider[field] ?? [], []);
    if (!allowAttempts) {
      assert.equal(provider.syncedAt, "");
      assert.equal(provider.lastAttemptAt, null);
    }
  }
}

try {
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker", { timeout: 15000 });
  const extensionId = new URL(worker.url()).host;
  const popup = await context.newPage();
  popup.on("pageerror", (error) => pageErrors.push(error.message));
  popup.on("request", (request) => loadedAssets.add(request.url()));
  await popup.goto(`chrome-extension://${extensionId}/${manifest.action.default_popup}`);
  await popup.locator(".popup-provider-card").first().waitFor();
  const fresh = await popup.evaluate(async (key) => {
    const response = await chrome.runtime.sendMessage({ type: "app:read-state" });
    return { response, stored: (await chrome.storage.local.get(key))[key], permissions: await chrome.permissions.getAll(), badge: await chrome.action.getBadgeText({}), title: await chrome.action.getTitle({}) };
  }, stateKey);
  assert.equal(fresh.response.ok, true);
  assertBlank(fresh.stored, "fresh offline install", true);
  const setupCount = fresh.stored.providerSettings.filter((setting) => setting.displayEnabled).length;
  assert.equal(fresh.badge, String(setupCount), "Fresh install badge must count setup blockers, not sample quota");
  assert(fresh.title.includes("need attention"), "Badge title must identify the setup count");
  assert.deepEqual(fresh.permissions.origins ?? [], []);
  assert.equal((fresh.permissions.permissions ?? []).includes("notifications"), false, "Fresh install must not grant optional notifications");
  await settle(popup);
  await popup.screenshot({ path: path.join(output, "fresh-popup.png"), fullPage: true });

  const initialized = await popup.evaluate(() => chrome.runtime.sendMessage({ type: "app:init" }));
  assert.equal(initialized.ok, true);
  assertBlank(initialized.state, "offline refresh", true);
  const dashboard = await context.newPage();
  dashboard.on("pageerror", (error) => pageErrors.push(error.message));
  dashboard.on("request", (request) => loadedAssets.add(request.url()));
  await dashboard.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html#dashboard`);
  await dashboard.locator(".provider-card").first().waitFor();
  assert(![...loadedAssets].some((url) => url.includes("StoreScreenshotSeedPage")), "Normal startup loaded the demo route");
  await settle(dashboard);
  await dashboard.screenshot({ path: path.join(output, "fresh-dashboard.png"), fullPage: true });

  await dashboard.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html?preset=toolbar-first-quick-glance#debug-store-screenshot-seed`);
  await dashboard.waitForFunction(() => document.title === "AI Usage Dashboard Screenshot Seed Applied");
  assert([...loadedAssets].some((url) => url.includes("StoreScreenshotSeedPage")), "Explicit demo route did not load");
  const seeded = await dashboard.evaluate(async (key) => (await chrome.storage.local.get(key))[key], stateKey);
  assert(seeded.providers.some((provider) => typeof provider.used === "number" && provider.used > 0), "Explicit demo did not seed synthetic values");
  await dashboard.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html?preset=unlock#debug-store-screenshot-seed`);
  await dashboard.waitForFunction(() => document.title === "AI Usage Dashboard Screenshot Seed Cleared");
  const restored = await dashboard.evaluate(async (key) => (await chrome.storage.local.get(key))[key], stateKey);
  assertBlank(restored, "restored pre-demo state", true);
  assert.deepEqual(pageErrors, []);
  report = { passed: true, checkedAt: new Date().toISOString(), extensionPath, version: manifest.version, browserVersion: context.browser()?.version(), offline: true, freshProviders: fresh.stored.providers.length, badge: fresh.badge, optionalHostPermissions: fresh.permissions.origins, demoLoadedOnlyOnExplicitRoute: true, demoBackupRestored: true, pageErrors };
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await context.pages().at(-1)?.screenshot({ path: path.join(output, "failure.png"), fullPage: true }).catch(() => undefined);
  report = { passed: false, extensionPath, error: error.message, pageErrors };
  throw error;
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  await context.close();
  console.log(`Evidence: ${output}`);
}
