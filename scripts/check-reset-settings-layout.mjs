import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const arg = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
assert(arg("--extension"), "Pass an isolated Chrome build");
const extension = path.resolve(arg("--extension"));
assert(!extension.startsWith(path.resolve("dist") + path.sep), "Do not test or overwrite the loaded extension");
const locales = arg("--locales")?.split(",") ?? SUPPORTED_RDP_CAPTURE_LOCALES;
assert(locales.every((locale) => SUPPORTED_RDP_CAPTURE_LOCALES.includes(locale)));
const root = path.resolve(".local/qa/provider-insights/825"); await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "embedded-"));
const report = { passed: false, synthetic: true, extension, cases: [], errors: [], remoteRequests: [] };
let context;
try {
  context = await chromium.launchPersistentContext(path.join(output, "owned-profile"), { headless: true, offline: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  await worker.evaluate(() => chrome.storage.local.set({ "ai-usage-dashboard.store-screenshot-runtime-lock": true }));
  for (const locale of locales) for (const theme of ["light", "dark"]) for (const width of [1440, 1100, 900, 390, 320]) {
    const name = `${locale}-${theme}-${width}`, page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push({ name, error: error.message }));
    page.on("request", (request) => { if (/^https?:/.test(request.url())) report.remoteRequests.push(request.url()); });
    try {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/src/sidepanel/index.html?surface=full-page&app-locale=${locale}#settings/section/settings-usage-notifications`);
      await page.locator('[data-reset-insights-settings][aria-busy="false"]').waitFor();
      const saved = await page.evaluate(({ locale, theme }) => chrome.runtime.sendMessage({ type: "app:update-settings", settings: { locale, themeMode: theme, motionMode: "reduced" } }), { locale, theme });
      assert.equal(saved.ok, true);
      await page.waitForFunction(({ locale, theme }) => document.documentElement.lang === locale && document.documentElement.dataset.themeResolved === theme, { locale, theme });
      const geometry = await page.evaluate(() => {
        const rect = (node) => { const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }; };
        const section = document.querySelector(".settings-usage-notifications"), panel = section.querySelector("[data-reset-insights-settings]");
        return { section: rect(section), panel: rect(panel), fields: [...panel.querySelectorAll("[data-fusion-field]")].map(rect),
          grid: getComputedStyle(panel.querySelector(".reset-insights-settings__fields")).gridTemplateColumns,
          dir: document.documentElement.dir, overflow: document.documentElement.scrollWidth - innerWidth,
          disabled: panel.querySelector('[data-fusion-field="account-reset-card-mode"] mdui-select').disabled,
          notice: panel.querySelector("[data-account-reset-unavailable]")?.textContent };
      });
      assert(geometry.panel.width >= geometry.section.width - 4, `Panel confined to one outer column: ${JSON.stringify(geometry)}`);
      assert.equal(geometry.fields.length, 2);
      const [a, b] = geometry.fields;
      const wide = geometry.panel.width >= 536;
      assert(wide ? Math.abs(a.top - b.top) <= 1 && Math.abs(a.width - b.width) <= 1 : b.top >= a.bottom,
        `Wrong responsive row: ${JSON.stringify(geometry)}`);
      assert(geometry.fields.every((field) => field.left >= geometry.panel.left - 1 && field.right <= geometry.panel.right + 1));
      assert(geometry.overflow <= 1); assert.equal(geometry.dir, locale === "ar" ? "rtl" : "ltr");
      assert.equal(geometry.disabled, true); assert(geometry.notice?.trim());
      assert.equal(await page.locator('[data-fusion-field="community-reset-mode"] mdui-select').evaluate((node) => node.value), "off");
      if (locale === locales[0] && theme === "light" && width === 1440) {
        const field = page.locator('[data-fusion-field="community-reset-mode"]');
        await field.locator('input:not(.hidden-input)').click();
        await field.locator('mdui-menu-item[value="desktop"]').waitFor({ state: "visible" });
        await page.keyboard.press("Escape");
        assert.equal(await field.locator("mdui-select").evaluate((node) => node.value), "off");
      }
      if (["en", "zh-CN", "ar"].includes(locale) && [1440, 390].includes(width))
        await page.locator(".settings-usage-notifications").screenshot({ path: path.join(output, `${name}.png`) });
      report.cases.push({ name, ...geometry }); console.log(`embedded reset settings ${name}: passed`);
    } finally { await page.close(); }
  }
  assert.equal(report.errors.length, 0); assert.equal(report.remoteRequests.length, 0); report.passed = true;
} catch (error) { report.errors.push({ error: String(error) }); throw error; }
finally { await context?.close(); await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2)); console.log(`Evidence: ${output}`); }
