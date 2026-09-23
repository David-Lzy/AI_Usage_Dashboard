import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const argument = (name) => process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
assert(argument("--extension"), "Pass --extension=<isolated Chrome build>");
const extensionPath = path.resolve(argument("--extension"));
assert(!extensionPath.startsWith(path.resolve("dist") + path.sep), "Use an isolated test build.");
const locales = argument("--locales")?.split(",") ?? SUPPORTED_RDP_CAPTURE_LOCALES;
const root = path.resolve("tmp/output/playwright/popup-modes");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const manifest = JSON.parse(await readFile(path.join(extensionPath, "manifest.json"), "utf8"));
const loader = await createServer({ configFile: false, cacheDir: path.join(output, "vite-cache"),
  optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null }, appType: "custom" });
let fixture;
try {
  const seed = await loader.ssrLoadModule("/src/sidepanel/store-screenshot-seed.ts");
  fixture = JSON.parse(JSON.stringify(seed.getStoreScreenshotSeedPresetDefinition("toolbar-first-quick-glance").appState));
} finally { await loader.close(); }
const cases = [], errors = [];
let context, passed = false;
const frames = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const settledEntrance = (page) => page.evaluate(() => Promise.all(document.getAnimations()
  .filter((animation) => !animation.effect?.target?.matches?.(".popup-provider-list") && Number.isFinite(animation.effect?.getComputedTiming().endTime))
  .map((animation) => animation.finished.catch(() => undefined))));
const order = (page) => page.locator(".popup-provider-card__provider").allTextContents();
const movement = (page) => page.locator(".popup-provider-list").evaluate((track) => ({
  transform: getComputedStyle(track).transform,
  animations: track.getAnimations().map((animation) => ({ state: animation.playState, time: animation.currentTime })),
}));
async function visibleContent(page) {
  const result = await page.locator(".popup-provider-stage").evaluate((stage) => {
    const box = stage.getBoundingClientRect();
    const target = document.elementFromPoint(box.left + box.width / 2, box.top + Math.min(box.height / 2, 120));
    return { height: box.height, cardVisible: Boolean(target?.closest(".popup-provider-card")), mask: getComputedStyle(stage).maskImage };
  });
  assert(result.height >= 96 && result.cardVisible, `Blank glide: ${JSON.stringify(result)}`);
  assert.notEqual(result.mask, "none", "Glide edges are not faded");
}
try {
  context = await chromium.launchPersistentContext(path.join(output, "profile"), {
    headless: true, offline: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
  const extensionId = new URL(worker.url()).host;
  await worker.evaluate(async () => {
    await chrome.storage.local.set({ "ai-usage-dashboard.store-screenshot-runtime-lock": true });
    await chrome.runtime.sendMessage({ type: "baseline:ping" }).catch(() => undefined);
  });
  for (const locale of locales) for (const [width, theme] of [[320, "dark"], [430, "light"]]) for (const mode of ["collapsible", "single", "switch", "scroll"]) {
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    try {
      const state = structuredClone(fixture);
      state.settings = { ...state.settings, locale, themeMode: theme, popupProviderBrowsingMode: mode,
        popupSizePreset: width === 320 ? "compact" : "balanced", motionMode: "full" };
      const enabled = ["claude-code-team-page", "codex-personal-page", "cursor-personal-page"];
      state.settings.providerOrderBySurface.popup = enabled;
      state.providerSettings = state.providerSettings.map((setting) => ({ ...setting, displayEnabled: enabled.includes(setting.id) }));
      await worker.evaluate((state) => chrome.storage.local.set({ "ai-usage-dashboard.app-state": state }), state);
      await page.goto(`chrome-extension://${extensionId}/${manifest.action.default_popup}`);
      await page.locator(`[data-popup-provider-browsing-mode="${mode}"]`).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await settledEntrance(page);
      await frames(page);
      assert.equal(await page.locator(".popup-provider-card").count(), ["single", "switch"].includes(mode) ? 1 : 3);
      assert.equal(await page.locator("html").getAttribute("lang"), locale);
      assert.equal(await page.locator("html").getAttribute("dir"), locale === "ar" ? "rtl" : "ltr");
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        clippedHeaders: [...document.querySelectorAll(".popup-provider-card__header")].filter((element) => element.scrollWidth > element.clientWidth + 2).length,
        images: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
      }));
      assert(layout.overflow <= 1 && layout.clippedHeaders === 0 && layout.images === 0, JSON.stringify(layout));
      if (mode === "collapsible") {
        const card = page.locator(".popup-provider-card").first();
        const toggle = card.locator("[data-popup-provider-card-toggle]");
        const cardBox = await card.boundingBox(), toggleBox = await toggle.boundingBox();
        assert(toggleBox.y < cardBox.y + toggleBox.height && toggleBox.y + toggleBox.height > cardBox.y);
        const gap = async () => page.locator(".popup-provider-list").evaluate((track) => {
          const [a, b] = [...track.children].map((child) => child.getBoundingClientRect());
          return b.top - a.bottom;
        });
        const before = await gap();
        await toggle.focus(); await page.keyboard.press("Enter"); await frames(page);
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        assert(Math.abs(await gap() - before) < 1, "Collapse changed inter-card spacing");
        await page.keyboard.press("Enter"); await frames(page);
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      } else if (mode === "single" || mode === "switch") {
        const next = page.locator(mode === "single" ? ".popup-provider-switcher__button--next" : "[data-popup-provider-center-switch]");
        const original = await order(page);
        await next.focus();
        await frames(page);
        const position = await next.boundingBox();
        for (let index = 0; index < 3; index++) {
          await page.keyboard.press("Enter"); await frames(page);
          const after = await next.boundingBox();
          assert(Math.abs(after.y - position.y) < 1, `Repeated navigation moved the top control: ${JSON.stringify({ position, after })}`);
          assert(await next.evaluate((element) => element === document.activeElement));
          if (index === 0) assert.notDeepEqual(await order(page), original);
        }
        assert.deepEqual(await order(page), original, "Navigation did not wrap to the first card");
      } else {
        await page.mouse.move(1, 1);
        await page.waitForFunction(() => document.querySelector(".popup-provider-stage")?.dataset.popupProviderAutoGlideActive === "true");
        const first = await movement(page);
        await page.waitForTimeout(180);
        assert.notEqual((await movement(page)).transform, first.transform, "Glide did not move");
        await visibleContent(page);
        const stage = page.locator(".popup-provider-stage");
        await stage.hover(); await frames(page);
        const paused = await movement(page);
        await page.waitForTimeout(120);
        assert.deepEqual(await movement(page), paused, "Hover did not pause");
        await page.mouse.wheel(0, 80); await frames(page);
        assert.notEqual((await movement(page)).transform, paused.transform, "Wheel did not move the paused track");
        const forwards = await movement(page);
        await page.mouse.wheel(0, -60); await frames(page);
        assert.notEqual((await movement(page)).transform, forwards.transform, "Reverse wheel did not work");
        const start = await order(page);
        for (let index = 0; index < 3; index++) {
          const before = await order(page);
          await page.locator(".popup-provider-list").evaluate((track) => track.getAnimations()[0].finish());
          await page.waitForFunction((label) => document.querySelector(".popup-provider-card__provider")?.textContent !== label, before[0]);
          await frames(page);
          assert.deepEqual(await order(page), [...before.slice(1), before[0]], "Glide reversed instead of joining end to start");
          await visibleContent(page);
        }
        assert.deepEqual(await order(page), start);
        const focusTarget = page.locator(".popup-provider-list a, .popup-provider-list button").first();
        await focusTarget.focus(); await page.mouse.move(1, 1); await frames(page);
        assert((await movement(page)).animations.every((animation) => animation.state === "paused"), "Keyboard focus did not pause");
        await focusTarget.evaluate((element) => element.blur()); await frames(page);
        assert((await movement(page)).animations.some((animation) => animation.state === "running"), "Glide did not resume");
        await stage.hover();
      }
      await page.screenshot({ path: path.join(output, `${locale}-${width}-${mode}.png`), fullPage: true });
      cases.push({ locale, width, theme, mode, layout, passed: true });
      console.log(`popup ${locale}/${width}/${mode}: passed`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, `${locale}-${width}-${mode}-failure.png`), fullPage: true });
      throw error;
    } finally { await page.close(); }
  }
  assert.deepEqual(errors, []);
  passed = true;
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ passed, extensionPath, cases, errors }, null, 2));
  await context?.close();
  console.log(`Evidence: ${output}`);
}
