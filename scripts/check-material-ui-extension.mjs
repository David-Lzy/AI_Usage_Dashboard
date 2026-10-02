import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const arg = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
assert(arg("--chrome") && arg("--firefox"), "Pass isolated --chrome and --firefox build directories");
const chromePath = path.resolve(arg("--chrome"));
const firefoxPath = path.resolve(arg("--firefox"));
const root = path.resolve("tmp/output/playwright/material-ui-extension");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const results = { chrome: [], firefox: [], errors: [] };
const stateKey = "ai-usage-dashboard.app-state";
const lockKey = "ai-usage-dashboard.store-screenshot-runtime-lock";
const configurations = [
  { locale: "en", theme: "light", width: 1440 },
  { locale: "zh-CN", theme: "dark", width: 390 },
  { locale: "ar", theme: "dark", width: 1440 },
];

function readControl() {
  const select = document.querySelector('[data-fusion-field="settings-user-level"] mdui-select');
  const input = select?.shadowRoot?.querySelector("mdui-text-field")?.shadowRoot?.querySelector("input");
  if (!input?.getAttribute("aria-label")) return null;
  const rect = input.getBoundingClientRect();
  return {
    value: (select.wrappedJSObject ?? select).value, label: input.getAttribute("aria-label"), fieldWidth: rect.width,
    primary: getComputedStyle(select).getPropertyValue("--mdui-color-primary"),
    theme: document.documentElement.dataset.themeResolved, direction: document.documentElement.dir,
    fonts: [...document.fonts].map((font) => font.family),
    viewportWidth: innerWidth, required: input.required,
    resources: performance.getEntriesByType("resource").map((entry) => entry.name),
  };
}

async function chromeGate() {
  const context = await chromium.launchPersistentContext(path.join(output, "chrome-profile"), {
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
    headless: true, offline: true, viewport: { width: 1440, height: 900 },
    args: [`--disable-extensions-except=${chromePath}`, `--load-extension=${chromePath}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    const origin = new URL(worker.url()).origin;
    const extensionOrigin = `chrome-extension://${new URL(worker.url()).host}`;
    assert(origin === "null" || origin === extensionOrigin);
    await worker.evaluate(async ({ lockKey }) => { await chrome.storage.local.set({ [lockKey]: true }); }, { lockKey });
    for (const config of configurations) {
      await worker.evaluate(async ({ stateKey, config }) => {
        for (let i = 0; i < 100 && !(await chrome.storage.local.get(stateKey))[stateKey]; i++) await new Promise((resolve) => setTimeout(resolve, 30));
        const state = (await chrome.storage.local.get(stateKey))[stateKey];
        state.settings = { ...state.settings, locale: config.locale, themeMode: config.theme, userLevel: "basic", motionMode: "reduced" };
        await chrome.storage.local.set({ [stateKey]: state });
      }, { stateKey, config });
      const page = await context.newPage();
      await page.setViewportSize({ width: config.width, height: 900 });
      page.on("pageerror", (error) => results.errors.push({ browser: "chrome", message: error.message }));
      const debuggerSession = await context.newCDPSession(page);
      const scripts = new Set();
      debuggerSession.on("Debugger.scriptParsed", ({ url }) => { if (url) scripts.add(url); });
      await debuggerSession.send("Debugger.enable");
      await page.goto(`${extensionOrigin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-overview`);
      await page.waitForFunction(readControl);
      const control = await page.evaluate(readControl);
      assert(control.fieldWidth > 50 && control.primary && control.theme === config.theme);
      assert.equal(control.value, "basic");
      assert.equal(control.required, true);
      assert.equal(control.viewportWidth, config.width);
      assert.equal(control.direction, config.locale === "ar" ? "rtl" : "ltr");
      const extensionScripts = [...scripts].filter((url) => url.startsWith(extensionOrigin));
      assert(extensionScripts.some((url) => url.includes("material-controls.js")), "Missing observed Settings vendor script");
      assert(![...scripts].some((url) => /^https?:/.test(url)), "Remote extension script");
      const field = page.locator('[data-fusion-field="settings-user-level"]');
      await field.locator("input:not(.hidden-input)").click();
      await field.locator('mdui-menu-item[value="advanced"]').click();
      await page.waitForFunction(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select')?.value === "advanced");
      assert.equal(await worker.evaluate(async (key) => (await chrome.storage.local.get(key))[key].settings.userLevel, stateKey), "advanced");
      await page.screenshot({ path: path.join(output, `chrome-${config.locale}.png`) });
      results.chrome.push({ ...config, ...control, scripts: extensionScripts, saved: true });
      await page.close();
    }
    const popup = await context.newPage();
    const debuggerSession = await context.newCDPSession(popup);
    const popupScripts = new Set();
    debuggerSession.on("Debugger.scriptParsed", ({ url }) => { if (url) popupScripts.add(url); });
    await debuggerSession.send("Debugger.enable");
    await popup.goto(`${extensionOrigin}/src/popup/index.html`);
    await popup.locator(".popup-shell").waitFor();
    assert([...popupScripts].some((url) => url.endsWith("/assets/popup.js")), "Missing observed Popup script");
    assert(![...popupScripts].some((url) => url.includes("material-controls")), "Popup eagerly loads Settings library");
    assert.equal(await popup.evaluate(() => customElements.get("mdui-select") === undefined), true);
    results.popupScripts = [...popupScripts].filter((url) => url.startsWith(extensionOrigin));
  } finally { await context.close(); }
}

async function firefoxGate() {
  const archive = path.join(output, "firefox-qa.zip");
  execFileSync("zip", ["-qr", archive, "."], { cwd: firefoxPath });
  const driver = spawn(process.env.GECKODRIVER ?? "/snap/bin/geckodriver", ["--port", "0", "--host", "127.0.0.1", "--allow-system-access"], { env: { ...process.env, MOZ_HEADLESS: "1" } });
  let driverLog = "";
  let session;
  let endpoint;
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Geckodriver startup timed out")), 30000);
    const append = (data) => {
      driverLog += data.toString();
      const match = driverLog.match(/Listening on (127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); resolve(`http://${match[1]}`); }
    };
    driver.stdout.on("data", append);
    driver.stderr.on("data", append);
    driver.once("error", (error) => { clearTimeout(timer); reject(error); });
    driver.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Geckodriver exited ${code}`)); });
  });
  const request = async (method, route, body) => {
    const response = await fetch(`${endpoint}${route}`, { method,
      headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(90000) });
    const json = await response.json();
    if (!response.ok || json.value?.error) throw new Error(`${route}: ${json.value?.message ?? response.status}`);
    return json.value;
  };
  const command = (route, body, method = "POST") => request(method, `/session/${session}${route}`, body);
  const evaluate = (fn, ...args) => command("/execute/sync", { script: `return (${fn.toString()})(...arguments)`, args });
  const until = async (fn, ...args) => {
    for (let i = 0; i < 100; i++) {
      const value = await evaluate(fn, ...args);
      if (value) return value;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Firefox control did not become ready");
  };
  try {
    endpoint = await ready;
    const started = await request("POST", "/session", { capabilities: { alwaysMatch: {
      browserName: "firefox", "moz:firefoxOptions": { args: ["-headless"], prefs: {
        "app.update.auto": false, "datareporting.healthreport.uploadEnabled": false,
        "toolkit.telemetry.enabled": false, "browser.startup.page": 0,
      } },
    } } });
    session = started.sessionId;
    results.firefoxVersion = started.capabilities.browserVersion;
    await command("/moz/context", { context: "chrome" });
    await evaluate(() => { Services.io.offline = true; });
    await command("/moz/context", { context: "content" });
    const addonId = await command("/moz/addon/install", { addon: (await readFile(archive)).toString("base64"), temporary: true });
    await command("/moz/context", { context: "chrome" });
    const uuid = await evaluate((id) => JSON.parse(Services.prefs.getStringPref("extensions.webextensions.uuids"))[id], addonId);
    await command("/moz/context", { context: "content" });
    const origin = `moz-extension://${uuid}`;
    for (const config of configurations) {
      await command("/moz/context", { context: "chrome" });
      await evaluate(() => { Services.wm.getMostRecentWindow("navigator:browser").document.documentElement.style.minWidth = "0px"; });
      await command("/moz/context", { context: "content" });
      await command("/window/rect", { width: config.width, height: 1000 });
      await command("/url", { url: "about:blank" });
      await until(() => document.URL === "about:blank");
      const url = `${origin}/src/sidepanel/index.html?surface=full-page&app-locale=${config.locale}&app-dir=${config.locale === "ar" ? "rtl" : "ltr"}#settings/section/settings-overview`;
      await command("/url", { url });
      await until((target) => document.URL === target && document.readyState === "complete", url);
      await until(readControl);
      await command("/execute/async", { script: `const done=arguments[arguments.length-1];
        browser.storage.local.get(${JSON.stringify(stateKey)}).then(async (stored)=>{
          const state=stored[${JSON.stringify(stateKey)}];
          state.settings={...state.settings,themeMode:arguments[0],userLevel:'basic',motionMode:'reduced'};
          await browser.storage.local.set({[${JSON.stringify(stateKey)}]:state,[${JSON.stringify(lockKey)}]:true});done(true);
        }).catch(error=>done({error:String(error)}));`, args: [config.theme] });
      await command("/refresh", {});
      await until(() => {
        const select = document.querySelector('[data-fusion-field="settings-user-level"] mdui-select');
        return select && (select.wrappedJSObject ?? select).value === "basic";
      });
      const control = await until(readControl);
      assert(control.fieldWidth > 50 && control.primary && control.theme === config.theme, JSON.stringify(control));
      assert.equal(control.value, "basic");
      assert.equal(control.required, true);
      assert.equal(control.viewportWidth, config.width, "Firefox actual viewport differs from requested test width");
      assert.equal(control.direction, config.locale === "ar" ? "rtl" : "ltr");
      const input = await evaluate(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select').shadowRoot.querySelector("mdui-text-field").shadowRoot.querySelector("input"));
      await command(`/element/${input["element-6066-11e4-a52e-4f735466cecf"]}/click`, {});
      await until(() => {
        const dropdown = document.querySelector('[data-fusion-field="settings-user-level"] mdui-select').shadowRoot.querySelector("mdui-dropdown");
        return (dropdown.wrappedJSObject ?? dropdown).open;
      });
      const item = await evaluate(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-menu-item[value="advanced"]'));
      await command(`/element/${item["element-6066-11e4-a52e-4f735466cecf"]}/click`, {});
      await until(() => {
        const select = document.querySelector('[data-fusion-field="settings-user-level"] mdui-select');
        return (select.wrappedJSObject ?? select).value === "advanced";
      });
      const saved = await command("/execute/async", { script: `const done=arguments[arguments.length-1];browser.storage.local.get(${JSON.stringify(stateKey)}).then(x=>done(x[${JSON.stringify(stateKey)}].settings.userLevel));`, args: [] });
      assert.equal(saved, "advanced");
      const screenshot = await command("/screenshot", undefined, "GET");
      await writeFile(path.join(output, `firefox-${config.locale}.png`), Buffer.from(screenshot, "base64"));
      results.firefox.push({ ...config, ...control, saved: true });
    }
  } catch (error) {
    if (session) {
      const screenshot = await command("/screenshot", undefined, "GET").catch(() => null);
      if (screenshot) await writeFile(path.join(output, "firefox-failure.png"), Buffer.from(screenshot, "base64"));
    }
    throw error;
  } finally {
    if (session) await request("DELETE", `/session/${session}`).catch((error) => { results.errors.push(String(error)); });
    driver.kill("SIGTERM");
    await writeFile(path.join(output, "geckodriver.log"), driverLog);
  }
}

try {
  if (!process.argv.includes("--firefox-only")) {
    await chromeGate();
    console.log("Chrome extension MDUI/CSP/storage gate passed");
  }
  await firefoxGate();
  console.log("Firefox extension MDUI/CSP/storage gate passed");
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify(results, null, 2));
  console.log(`Evidence: ${output}`);
}
