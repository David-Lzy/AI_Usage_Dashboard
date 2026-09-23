import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, utimes, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createLocalCompanionBridge } from "./lib/local-companion-bridge-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const extensionArg = process.argv.find((value) => value.startsWith("--extension="));
assert(extensionArg, "Pass --extension=<isolated build directory>.");
const inputExtension = path.resolve(extensionArg.slice("--extension=".length));
assert(!inputExtension.startsWith(path.resolve("dist") + path.sep), "Do not use a browser-loaded build as this test's input.");
const root = path.resolve("tmp/output/playwright/local-companion");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const extensionPath = path.join(output, "extension");
await cp(inputExtension, extensionPath, { recursive: true });
const manifestPath = path.join(extensionPath, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
// Grant only the synthetic loopback origin in this disposable fixture. Production
// still requests optional permission from a user gesture, exercised below.
manifest.host_permissions = [...new Set([...(manifest.host_permissions ?? []), "http://127.0.0.1/*"])];
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
const sourcePath = path.join(output, "synthetic-ccusage.json");
const input = { daily: [{ date: "2026-09-21", inputTokens: 100, outputTokens: 20, cacheCreationTokens: 10, cacheReadTokens: 30, totalTokens: 160, totalCost: 0.25, projectPath: "PRIVATE_PATH_SENTINEL", account: "PRIVATE_IDENTITY_SENTINEL" }], totals: {}, rawResponse: "PRIVATE_RAW_SENTINEL" };
await writeFile(sourcePath, JSON.stringify(input));
const modifiedAt = new Date(Math.floor((Date.now() - 7_200_000) / 1000) * 1000);
await utimes(sourcePath, modifiedAt, modifiedAt);
let pairingCode, bridge, address;
async function startBridge(port = 0) {
  bridge = createLocalCompanionBridge({ port, requestsPerMinute: 5000, pairAttemptsPerMinute: 100,
    sources: [{ sourceId: "custom:ccusage", label: "ccusage daily", filePath: sourcePath, format: "ccusage-daily.v1" }],
    onPairingCode: (code) => { pairingCode = code; },
  });
  address = await bridge.start(); pairingCode = address.pairingCode;
}
await startBridge();
let context, report, extensionId, worker;
const errors = [], cases = [], reads = [];
const stateKey = "ai-usage-dashboard.app-state";
const localeArg = process.argv.find((arg) => arg.startsWith("--locales="));
const locales = localeArg ? localeArg.slice(10).split(",") : SUPPORTED_RDP_CAPTURE_LOCALES;
const settingsUrl = (locale) => `chrome-extension://${extensionId}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`;
async function readState(page) {
  const result = await page.evaluate(async (stateKey) => {
    const started = Date.now();
    const response = await chrome.runtime.sendMessage({ type: "app:read-state" });
    const raw = (await chrome.storage.local.get(stateKey))[stateKey];
    return { state: response.state, started, ended: Date.now(), storedSources: raw.customSources.map((source) => source.id), storedSnapshots: raw.customSourceStates.map((source) => source.sourceId) };
  }, stateKey);
  reads.push({ ...result, state: { sources: result.state.customSources.map((source) => source.id), snapshots: result.state.customSourceStates.map((source) => source.sourceId) } });
  return result.state;
}
async function waitRows(page, count) {
  // This Playwright version treats an async predicate's Promise as truthy before
  // its boolean resolves. Poll the actual storage result, not the Promise.
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const ready = await page.evaluate(async ({ stateKey, count }) => {
      const state = (await chrome.storage.local.get(stateKey))[stateKey];
      const sources = (state?.customSources ?? []).filter((source) => source.managedBy === "local-companion");
      return sources.length === count && sources.every((source) => state.customSourceStates.some((entry) => entry.sourceId === source.id));
    }, { stateKey, count });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(`Managed sources did not reach ${count} complete persisted rows`);
}
try {
  context = await chromium.launchPersistentContext(path.join(output, "profile"), {
    headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker", { timeout: 15000 });
  await worker.evaluate((stateKey) => {
    const summarize = (state) => ({ sources: state?.customSources?.map((source) => source.id), snapshots: state?.customSourceStates?.map((source) => source.sourceId) });
    globalThis.__qaStateWrites = [];
    const record = (entry) => { globalThis.__qaStateWrites.push({ at: Date.now(), ...entry }); globalThis.__qaStateWrites = globalThis.__qaStateWrites.slice(-250); };
    const original = chrome.storage.local.set.bind(chrome.storage.local);
    chrome.storage.local.set = function (items, ...args) {
      if (items[stateKey]) record({ kind: "worker-write", state: summarize(items[stateKey]), stack: new Error().stack });
      return original(items, ...args);
    };
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[stateKey]) record({ kind: "stored-change", before: summarize(changes[stateKey].oldValue), after: summarize(changes[stateKey].newValue) });
    });
  }, stateKey);
  extensionId = new URL(worker.url()).host;
  for (const locale of locales) for (const [width, theme] of [[320, "dark"], [1280, "light"]]) {
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    try {
      await page.goto(settingsUrl(locale));
      await page.evaluate(async ({ locale, theme, stateKey }) => {
        const { state } = await chrome.runtime.sendMessage({ type: "app:read-state" });
        state.settings = { ...state.settings, userLevel: "developer", locale, themeMode: theme, motionMode: "off" };
        state.providerSettings = state.providerSettings.map((setting) => ({ ...setting, displayEnabled: false }));
        await chrome.storage.local.set({ [stateKey]: state });
      }, { locale, theme, stateKey });
      await page.reload();
      const control = page.locator("[data-local-companion-settings]");
      await control.waitFor();
      const url = control.locator('[data-companion-input="base-url"]');
      const code = control.locator('[data-companion-input="pairing-code"]');
      const inputHeights = [await url.boundingBox(), await code.boundingBox()].map((box) => box?.height ?? 0);
      assert(inputHeights.every((height) => height > 0) && Math.abs(inputHeights[0] - inputHeights[1]) <= 1,
        `Local companion inputs have different heights: ${inputHeights.join(", ")}`);
      const action = (name) => control.locator(`[data-companion-action="${name}"]`);
      await url.fill(address.baseUrl);
      if (locale === locales[0] && width === 320) {
        await page.evaluate(() => { window.__nativePermissionRequest = chrome.permissions.request.bind(chrome.permissions); chrome.permissions.request = async () => false; });
        await code.fill(pairingCode); await action("pair").click();
        await control.locator('[data-local-companion-notice="error"]').waitFor();
        assert.equal(await code.inputValue(), "", "Pairing code should not remain after a denied request");
        await page.evaluate(() => { chrome.permissions.request = window.__nativePermissionRequest; });
      }
      await code.fill(pairingCode);
      await action("pair").click();
      await control.locator('[data-companion-status="connected"]').waitFor();
      assert.equal(await code.inputValue(), "");
      await waitRows(page, 0);
      await action("refresh-source").click();
      await waitRows(page, 1);
      let state = await readState(page);
      assert.equal(state.customSourceStates.length, 1, "A managed source lost its captured state");
      assert.equal(state.customSourceStates[0].lastSuccessAt, modifiedAt.toISOString());
      assert.equal(state.customSourceStates[0].stale, true);
      assert.equal(state.customSourceStates[0].snapshot.windows.find((metric) => metric.label === "Total tokens").used, 160);
      assert.equal(state.customSourceStates[0].snapshot.balances[0].used, 0.25);
      assert(!JSON.stringify(state).includes("PRIVATE_"), "The converter leaked a discarded input field");
      const safeView = await page.evaluate(() => chrome.runtime.sendMessage({ type: "app:local-companion", action: "status" }));
      assert(!JSON.stringify(safeView).includes('"token"'), "A UI message exposed the token field");
      if (locale === locales[0] && width === 320) {
        const port = Number(new URL(address.baseUrl).port);
        await bridge.stop(); await startBridge(port);
        await action("refresh-index").click();
        await control.locator('[data-companion-status="expired"]').waitFor();
        assert.equal((await readState(page)).customSourceStates[0].lastSuccessAt, modifiedAt.toISOString());
        await code.fill(pairingCode); await action("pair").click();
        await control.locator('[data-companion-status="connected"]').waitFor();
      }
      const layout = await control.evaluate((element) => ({ width: element.clientWidth, scroll: element.scrollWidth, viewport: document.documentElement.scrollWidth,
        clippedButtons: [...element.querySelectorAll("button")].filter((button) => button.scrollWidth > button.clientWidth + 2).length,
        outside: [...element.querySelectorAll("input,button,h2")].filter((child) => { const box = child.getBoundingClientRect(), parent = element.getBoundingClientRect(); return box.left < parent.left - 2 || box.right > parent.right + 2; }).length,
        dir: document.documentElement.dir }));
      assert(layout.scroll <= layout.width + 2 && layout.clippedButtons === 0 && layout.outside === 0, JSON.stringify(layout));
      assert(layout.viewport <= width + 2, JSON.stringify(layout));
      assert.equal(layout.dir, locale === "ar" ? "rtl" : "ltr");
      if (width === 320) await page.setViewportSize({ width, height: 1600 });
      await control.evaluate((element) => element.scrollIntoView({ block: "start" }));
      const visibleHeader = await control.locator("h2").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return element === top || element.contains(top);
      });
      assert(visibleHeader, "Sticky navigation covers the local bridge title");
      const iconFill = await action("refresh-source").locator("svg").evaluate((element) => getComputedStyle(element).fill);
      if (theme === "dark") assert.notEqual(iconFill, "rgb(0, 0, 0)", "Dark icon has no inherited contrast color");
      await control.screenshot({ path: path.join(output, `${locale}-${width}.png`), animations: "disabled" });
      const selector = control.locator("[data-companion-source] [role=combobox]");
      await selector.focus(); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Escape");
      assert(await selector.evaluate((element) => element === document.activeElement));
      await action("remove-source").click(); await waitRows(page, 0);
      await action("refresh-source").click(); await waitRows(page, 1);
      if (locale === locales[0]) {
        await page.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html?app-locale=${locale}#dashboard`);
        const card = page.locator("[data-custom-source-id]").first();
        await card.waitFor();
        assert((await card.innerText()).includes("160"));
        await card.screenshot({ path: path.join(output, `dashboard-${width}.png`), animations: "disabled" });
        await page.goto(settingsUrl(locale)); await control.waitFor();
      }
      await action("disconnect").click();
      await control.locator('[data-companion-status="disconnected"]').waitFor(); await waitRows(page, 0);
      cases.push({ locale, width, height: width === 320 ? 1600 : 1000, theme, passed: true, layout });
      console.log(`local companion ${locale}/${width}/${theme}: passed`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, `${locale}-${width}-failure.png`), fullPage: true }).catch(() => undefined);
      throw error;
    } finally { await page.close(); }
  }
  assert.deepEqual(errors, []);
  report = { passed: true, inputExtension, loopbackPermissionPreGrantedOnlyInDisposableFixture: true, permissionDenialTested: true, realAuthenticatedHttpAndExtension: true, serviceRestartRePairTested: true, capturedAt: modifiedAt.toISOString(), cases, errors };
} catch (error) {
  report = { passed: false, inputExtension, error: error.message, cases, errors, reads, stateWrites: await worker?.evaluate(() => globalThis.__qaStateWrites).catch(() => []) }; throw error;
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  await context?.close(); await bridge?.stop();
  console.log(`Evidence: ${output}`);
}
