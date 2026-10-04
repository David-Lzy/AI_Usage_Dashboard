import assert from "node:assert/strict";
import { mkdir, mkdtemp, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const arg = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
assert(arg("--extension"), "Pass an isolated --extension=<Chrome build>");
const extension = path.resolve(arg("--extension"));
assert(!extension.startsWith(path.resolve("dist") + path.sep), "Do not replace or test a loaded build");
const locales = arg("--locales")?.split(",") ?? ["en", "zh-CN", "ar"];
const widths = arg("--widths")?.split(",").map(Number) ?? [390, 1440];
const modes = arg("--modes")?.split(",") ?? ["full", "expressive"];
assert(locales.every((locale) => SUPPORTED_RDP_CAPTURE_LOCALES.includes(locale)), "Use supported extension locales");
assert(modes.every((mode) => ["full", "system", "expressive", "reduced"].includes(mode)), "Use supported motion modes");
const record = process.argv.includes("--record");
const root = path.resolve("tmp/output/playwright/settings-motion");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const loader = await createServer({ configFile: false, cacheDir: path.join(output, "vite-cache"), optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null }, appType: "custom" });
let fixture;
try {
  const seed = await loader.ssrLoadModule("/src/sidepanel/store-screenshot-seed.ts");
  fixture = JSON.parse(JSON.stringify(seed.getStoreScreenshotSeedPresetDefinition("toolbar-first-quick-glance").appState));
} finally { await loader.close(); }
const report = { cases: [], errors: [], remoteRequests: [] };
const context = await chromium.launchPersistentContext(path.join(output, "profile"), {
  headless: true, offline: true, reducedMotion: "reduce", timezoneId: "UTC",
  ...(record ? { recordVideo: { dir: output, size: { width: 1440, height: 900 } } } : {}),
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
});
const stateKey = "ai-usage-dashboard.app-state";
const notificationKey = "ai-usage-dashboard.quota-notifications";
try {
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  await worker.evaluate(async () => {
    await chrome.storage.local.set({ "ai-usage-dashboard.store-screenshot-runtime-lock": true });
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
  for (const locale of locales) for (const theme of ["light", "dark"]) for (const width of widths) for (const mode of modes) {
    const name = `${locale}-${theme}-${width}-${mode}`;
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 900 });
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) => report.errors.push({ name, error: error.message }));
    page.on("request", (request) => { if (/^https?:/.test(request.url())) report.remoteRequests.push(request.url()); });
    const state = structuredClone(fixture);
    state.settings = { ...state.settings, locale, themeMode: theme, motionMode: mode, userLevel: "advanced" };
    state.providerSettings.forEach((setting) => { setting.displayEnabled = ["codex-personal-page", "claude-code-team-page"].includes(setting.id); });
    await worker.evaluate(async ({ stateKey, notificationKey, state }) => chrome.storage.local.set({
      [stateKey]: state,
      [notificationKey]: { schemaVersion: 1, ledger: {}, preferences: { enabled: true, paused: false, thresholdPercent: 92, disabledAccountKeys: [], disabledWindowKeys: [] } },
    }), { stateKey, notificationKey, state });
    await page.addInitScript(() => {
      const native = chrome.runtime.sendMessage.bind(chrome.runtime);
      window.__motionQa = { reject: false, permit: false, tests: 0, writes: [] };
      chrome.permissions.request = async () => window.__motionQa.permit;
      chrome.runtime.sendMessage = (message, ...args) => {
        if (message.type === "quota-notifications:test") { window.__motionQa.tests++; return native({ type: "quota-notifications:read" }).then((result) => ({ ...result, tested: true })); }
        // The runtime QA lock intentionally denies background notification
        // permission. Simulate only this approved enable, never OS permission or delivery.
        if (message.type === "quota-notifications:update" && message.change.type === "enabled" && message.change.value && window.__motionQa.permit) {
          return chrome.storage.local.get("ai-usage-dashboard.quota-notifications").then(async (data) => {
            const store = data["ai-usage-dashboard.quota-notifications"];
            await chrome.storage.local.set({ "ai-usage-dashboard.quota-notifications": { ...store, preferences: { ...store.preferences, enabled: true } } });
            const result = await native({ type: "quota-notifications:read" });
            return { ...result, view: { ...result.view, permission: "granted" } };
          });
        }
        if (message.type.startsWith("quota-notifications:")) return native(message, ...args).then((result) => result.ok ? { ...result, view: { ...result.view, permission: "granted" } } : result);
        if (message.type === "app:update-settings") { window.__motionQa.writes.push({ patch: message.settings, time: performance.now(), rejected: window.__motionQa.reject }); return new Promise((resolve) => setTimeout(() => {
          if (window.__motionQa.reject) resolve({ ok: false, error: "Synthetic rejected save" }); else resolve(native(message, ...args));
        }, 350)); }
        return native(message, ...args);
      };
    });
    const base = `${origin}/src/sidepanel/index.html?surface=full-page`;
    await page.goto(`${base}#settings/section/settings-quick-setup`);
    await page.locator(".settings-category-heading").waitFor();
    await page.evaluate(() => {
      window.__motionQa.menus = [];
      window.__motionQa.animations = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function(frames, timing) {
        const animation = animate.call(this, frames, timing);
        const entry = { target: this.className, duration: timing.duration, time: performance.now() };
        window.__motionQa.animations.push(entry);
        setTimeout(() => { entry.intermediate = { state: animation.playState, opacity: getComputedStyle(this).opacity, height: this.getBoundingClientRect().height }; }, 45);
        return animation;
      };
      document.addEventListener("pointerdown", (event) => window.__motionQa.menus.push({ type: "pointer", target: event.composedPath().slice(0, 5).map((node) => node.tagName), x: event.clientX, y: event.clientY, time: performance.now() }), true);
      document.querySelectorAll("[data-fusion-field] mdui-select").forEach((select) => {
        const dropdown = select.shadowRoot?.querySelector("mdui-dropdown");
        if (!dropdown) return;
        for (const type of ["open", "opened", "close", "closed"]) dropdown.addEventListener(type, () => {
          window.__motionQa.menus.push({ field: select.closest("[data-fusion-field]").dataset.fusionField, type, open: dropdown.open, time: performance.now() });
          if (window.__motionQa.menus.length > 80) window.__motionQa.menus.shift();
        });
      });
    });
    await page.waitForFunction((mode) => document.documentElement.dataset.motionProfile === (mode === "expressive" ? "expressive" : mode === "reduced" || mode === "system" ? "reduced" : "standard"), mode);
    const navigate = async (category) => {
      if (width >= 1100) await page.locator(`[data-settings-category-link="${category}"]`).click();
      else {
        const field = page.locator('[data-fusion-field="settings-category"]');
        await field.locator("input:not(.hidden-input)").click();
        await field.locator(`mdui-menu-item[value="${category}"]`).click();
      }
      await page.waitForTimeout(50);
    };
    const choose = async (id, value) => {
      const field = page.locator(`[data-fusion-field="${id}"]`);
      await field.locator("input:not(.hidden-input)").click();
      await field.locator(`mdui-menu-item[value="${value}"]`).click();
    };
    const configure = page.locator('[data-quick-setup-provider-id="codex-personal-page"] .settings-connection__configure');
    await configure.click();
    const connection = page.locator("#settings-connection-codex-personal-page");
    await page.waitForTimeout(50);
    const intermediate = await connection.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      active: element.getAnimations().length,
      inert: element.inert,
      inPageSample: window.__motionQa.animations.filter((entry) => entry.target === element.className).at(-1)?.intermediate,
    }));
    // A delayed host round trip can arrive after the recorded mid-animation frame.
    if (!["reduced", "system"].includes(mode)) assert(intermediate.active > 0 || intermediate.inPageSample?.state === "running", `${name}: no disclosure animation`);
    await page.waitForTimeout(400);
    const help = connection.locator("[data-codex-local-setup-toggle]");
    await help.click();
    await page.waitForTimeout(40);
    await help.click();
    await page.waitForTimeout(40);
    await help.click();
    await page.waitForTimeout(400);
    assert.equal(await connection.locator("[data-codex-local-setup]").getAttribute("hidden"), null);
    const pairing = connection.locator('input[autocomplete="one-time-code"]');
    await pairing.fill("ABCD-1234");
    const categoryStart = await page.evaluate(() => performance.now());
    await navigate("usage");
    if (!["reduced", "system"].includes(mode)) await page.waitForFunction((start) => window.__motionQa.animations.some((entry) => entry.target === "settings-category-content" && entry.time > start), categoryStart);
    const entry = await page.locator(".settings-category-content").evaluate((element) => element.getAnimations().length);
    await page.waitForTimeout(400);
    const categoryMotion = await page.evaluate((start) => window.__motionQa.animations.filter((entry) => entry.target === "settings-category-content" && entry.time > start), categoryStart);
    if (!["reduced", "system"].includes(mode)) assert(categoryMotion.some((item) => item.intermediate?.state === "running"), `${name}: no category intermediate frame`);
    const threshold = page.locator('[data-notification-action="threshold"]');
    await threshold.fill("89");
    await threshold.press("Tab");
    await page.waitForTimeout(250);
    assert.equal(await page.locator('[data-settings-custom-number-field="warning-threshold"] input').inputValue(), String(state.settings.warningThresholdPercent));
    await choose("quota-notification-mode", "paused");
    await page.waitForTimeout(300);
    assert.equal(await page.locator('[data-notification-action="test"]').isDisabled(), true);
    await choose("quota-notification-mode", "off");
    await page.waitForTimeout(50);
    assert.equal(await page.locator(".quota-notification-settings__body").getAttribute("inert"), "");
    await choose("quota-notification-mode", "on");
    await page.waitForTimeout(350);
    assert.equal(await page.locator('[data-fusion-field="quota-notification-mode"] mdui-select').evaluate((element) => element.value), "off", "Denied permission does not falsely enable notifications");
    await page.evaluate(() => { window.__motionQa.permit = true; });
    await choose("quota-notification-mode", "on");
    await page.waitForTimeout(450);
    await page.locator('[data-notification-action="test"]').click();
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.__motionQa.tests), 1);
    await navigate("appearance");
    await page.waitForTimeout(400);
    const motionSelections = [];
    for (const choice of [mode === "expressive" ? "full" : "expressive", "system", "reduced", "full", "expressive", mode]) {
      const current = await page.locator('[data-fusion-field="motion-mode"] mdui-select').evaluate((element) => element.value);
      const writesBefore = await page.evaluate(() => window.__motionQa.writes.length);
      await choose("motion-mode", choice);
      await page.waitForFunction((expected) => document.querySelector('[data-fusion-field="motion-mode"] mdui-select')?.value === expected, choice);
      if (current !== choice) {
        await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "pending");
        assert.equal(await page.locator('[data-fusion-field="motion-mode"] mdui-select').evaluate((element) => element.value), choice, `${name}: pending save must not reset the selected motion mode`);
      } else assert.equal(await page.evaluate(() => window.__motionQa.writes.length), writesBefore, `${name}: reselecting the current motion mode must not write`);
      await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "saved");
      assert.equal(await worker.evaluate(async (key) => (await chrome.storage.local.get(key))[key].settings.motionMode, stateKey), choice, `${name}: selected motion mode must be persisted`);
      motionSelections.push(choice);
    }
    const motionKeyboardSelections = [];
    const motionField = page.locator('[data-fusion-field="motion-mode"]');
    for (const [choice, key] of [["system", "Space"], ["expressive", "Space"], ["full", "Enter"], [mode, "Enter"]]) {
      const current = await motionField.locator("mdui-select").evaluate((element) => element.value);
      const writesBefore = await page.evaluate(() => window.__motionQa.writes.length);
      await motionField.locator("input:not(.hidden-input)").focus();
      await page.keyboard.press(key);
      await motionField.getByRole("menu").waitFor({ state: "visible" });
      const focusValue = (expected) => page.waitForFunction((expected) => document.activeElement?.matches(`[data-fusion-field="motion-mode"] mdui-menu-item[value="${expected}"]`), expected);
      await page.waitForFunction(() => document.activeElement?.matches('[data-fusion-field="motion-mode"] mdui-menu-item'));
      await page.keyboard.press("Home");
      const choices = ["full", "system", "expressive", "reduced"];
      await focusValue(choices[0]);
      const index = choices.indexOf(choice);
      for (let step = 0; step < index; step++) {
        await page.keyboard.press("ArrowDown");
        await focusValue(choices[step + 1]);
      }
      await page.keyboard.press(key);
      if (current !== choice) {
        await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "pending");
        assert.equal(await motionField.locator("mdui-select").evaluate((element) => element.value), choice,
          `${name}: keyboard motion draft must survive the pending save`);
      } else assert.equal(await page.evaluate(() => window.__motionQa.writes.length), writesBefore,
        `${name}: reselecting the current keyboard choice must not write`);
      await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "saved");
      assert.equal(await worker.evaluate(async (key) => (await chrome.storage.local.get(key))[key].settings.motionMode, stateKey), choice,
        `${name}: keyboard motion mode must be persisted`);
      assert.equal(await motionField.locator("input:not(.hidden-input)").inputValue(),
        (await motionField.locator(`mdui-menu-item[value="${choice}"]`).textContent()).trim());
      await motionField.getByRole("menu").waitFor({ state: "hidden" });
      motionKeyboardSelections.push({ choice, key });
    }
    await page.evaluate(() => { window.__motionQa.reject = true; });
    const failedMotion = mode === "expressive" ? "full" : "expressive";
    await choose("motion-mode", failedMotion);
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "error");
    assert.equal(await page.locator('[data-fusion-field="motion-mode"] mdui-select').evaluate((element) => element.value), failedMotion, `${name}: a failed save must retain the motion draft for retry`);
    assert.equal(await worker.evaluate(async (key) => (await chrome.storage.local.get(key))[key].settings.motionMode, stateKey), mode, `${name}: a failed save must not change persisted motion`);
    await page.evaluate(() => { window.__motionQa.reject = false; });
    await page.locator('[data-settings-save-status] button').click();
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "saved");
    await choose("motion-mode", mode);
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "saved");
    const details = page.locator(".settings-progress-editor");
    await details.locator(":scope > summary").click();
    await page.waitForTimeout(45);
    await details.locator(":scope > summary").click();
    await page.waitForTimeout(45);
    await details.locator(":scope > summary").click();
    await page.waitForTimeout(400);
    assert.equal(await details.locator(":scope > summary").getAttribute("aria-expanded"), "true");
    assert.equal(await details.locator(":scope > div").getAttribute("hidden"), null);
    const menu = page.locator('[data-fusion-field="motion-mode"]');
    await menu.locator("input:not(.hidden-input)").click();
    await navigate("general");
    assert.equal(await menu.locator("mdui-menu").getAttribute("inert"), "", "Old menu immediately leaves keyboard interaction");
    await page.waitForTimeout(400);
    assert.equal(await menu.getByRole("menu").isVisible(), false, "Old category menu is closed immediately");
    const level = page.locator('[data-fusion-field="settings-user-level"]');
    await level.locator("input:not(.hidden-input)").click();
    await level.locator('mdui-menu-item[value="developer"]').click();
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "pending");
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "saved");
    await page.evaluate(() => { window.__motionQa.reject = true; });
    await choose("settings-user-level", "advanced");
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "error");
    await page.evaluate(() => { window.__motionQa.reject = false; });
    await page.locator('[data-settings-save-status] button').click();
    await page.waitForFunction(() => document.querySelector('[data-settings-save-status]')?.dataset.settingsSaveStatus === "saved");
    await navigate("connections");
    await page.waitForTimeout(400);
    await page.waitForFunction(() => !document.querySelector(".app-motion-ripple"), undefined, { timeout: 2000 });
    assert.equal(await pairing.inputValue(), "ABCD-1234");
    await page.reload();
    await page.locator(".settings-category-heading").waitFor();
    await navigate("appearance");
    await page.waitForFunction((expected) => document.querySelector('[data-fusion-field="motion-mode"] mdui-select')?.value === expected && document.documentElement.dataset.motionMode === expected, mode);
    await navigate("connections");
    await page.waitForTimeout(400);
    await page.waitForFunction(() => !document.querySelector(".app-motion-ripple"), undefined, { timeout: 2000 });
    const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, direction: document.documentElement.dir, leftover: document.querySelectorAll(".app-motion-ripple").length }));
    assert(layout.overflow <= 1, `${name}: ${JSON.stringify(layout)}`);
    assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
    assert.equal(layout.leftover, 0);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    report.cases.push({ name, intermediate, entry, categoryMotion, layout, permissionDenied: "pass", independentThresholds: "pass", paused: "pass", drafts: "retained", saveRetry: "pass", rapidDetails: "pass", motionSelections, motionKeyboardSelections, motionFailedDraftRetry: "pass", motionReload: "pass" });
    console.log(`PASS ${name}`);
    const video = page.video();
    await page.close();
    if (video) await rename(await video.path(), path.join(output, `${name}.webm`));
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.remoteRequests, []);
} catch (error) {
  report.failure = error.message;
  report.menuState = await context.pages().at(-1)?.evaluate(() => ({
    events: window.__motionQa?.menus,
    animations: window.__motionQa?.animations,
    writes: window.__motionQa?.writes,
    document: { visibility: document.visibilityState, profile: document.documentElement.dataset.motionProfile, category: document.querySelector(".settings-category-layout")?.dataset, contentVisible: document.querySelector(".settings-category-content")?.checkVisibility(), time: performance.now() },
    fields: [...document.querySelectorAll("[data-fusion-field] mdui-select")].map((select) => {
      const dropdown = select.shadowRoot?.querySelector("mdui-dropdown");
      const panel = dropdown?.shadowRoot?.querySelector('[part="panel"]');
      return { field: select.closest("[data-fusion-field]").dataset.fusionField, open: dropdown?.open, hidden: panel?.hidden, popover: panel?.matches(":popover-open"), aria: select.shadowRoot?.querySelector("mdui-text-field")?.shadowRoot?.querySelector("input")?.getAttribute("aria-expanded") };
    }),
  })).catch(() => null);
  await context.pages().at(-1)?.screenshot({ path: path.join(output, "failure.png") }).catch(() => {});
  throw error;
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  await context.close();
  console.log(`Evidence: ${output}`);
}
