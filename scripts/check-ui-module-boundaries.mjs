import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";

const outputRoot = path.resolve("tmp/output/playwright/ui-module-boundaries");
await mkdir(outputRoot, { recursive: true });
const output = await mkdtemp(path.join(outputRoot, "run-"));
const comparison = process.argv.find((arg) => arg.startsWith("--compare="))?.slice("--compare=".length);
const server = await startSourceQaServer();
let browser;
let status = "failed";
const results = [], errors = [], screenshots = [];
try {
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }),
  });
  for (const locale of ["en", "de", "ar"]) for (const [width, theme] of [[320, "dark"], [1280, "light"]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce", colorScheme: theme });
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`);
      await page.locator("#settings-appearance").waitFor();
      await page.evaluate(async ({ locale, theme }) => {
        const { default: React } = await import("/node_modules/.vite/deps/react.js");
        const { default: ReactDOM } = await import("/node_modules/.vite/deps/react-dom_client.js");
        const { ApiGatewayMeteringSummary } = await import("/src/shared/components/ApiGatewayMeteringSummary.tsx");
        const { ProgressAppearancePreferenceControls } = await import("/src/sidepanel/components/ProgressAppearancePreferenceControls.tsx");
        const { buildApiGatewayMeteringLocalizedCopy } = await import("/src/shared/api-gateway-metering-localized-copy.ts");
        const { createDefaultProgressColorAppearance, createDefaultProgressColorBands } = await import("/src/shared/progress-appearance.ts");
        const { buildSettingsLocalizedCopy } = await import("/src/shared/settings-localized-copy.ts");
        const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
        document.querySelector("#root").hidden = true;
        document.documentElement.dataset.themeResolved = theme;
        document.documentElement.dataset.motionResolved = "reduced";
        const holder = document.createElement("main");
        holder.id = "module-boundaries-qa";
        holder.style.cssText = "margin:12px;display:grid;gap:20px;min-width:0";
        document.body.append(holder);
        const h = React.createElement;
        const money = (amount) => ({ amount, unit: "USD" });
        const metric = { requests: 10, inputTokens: 800, outputTokens: 200, cacheCreationTokens: 0, cacheReadTokens: 0, totalTokens: 1000, actualCost: money(1), referenceCost: money(2) };
        const copy = buildSettingsLocalizedCopy(createRuntimeI18n(locale));
        function Controls() {
          const [account, setAccount] = React.useState("account_qaone001");
          const [appearance, setAppearance] = React.useState(createDefaultProgressColorAppearance);
          const [bands, setBands] = React.useState(createDefaultProgressColorBands);
          const [thickness, setThickness] = React.useState(10);
          const [popover, setPopover] = React.useState(null);
          window.__moduleQa = { account, appearance, thickness, bands };
          const metering = {
            schemaVersion: 1, accountId: account, productKind: "metered_api_gateway", displayLabel: "Synthetic gateway", origin: "https://example.test", transport: "https", scope: "api_key", billingMode: "wallet",
            capturedAt: "2026-09-22T12:00:00.000Z", stale: false, isValid: true, status: "active", planName: null, remaining: money(80), balance: money(80), quota: null, subscription: null, rateLimits: [],
            usage: { today: metric, total: metric, averageDurationMs: 100, requestsPerMinute: null, tokensPerMinute: null },
            dailyUsage: [{ date: "2026-09-21", totals: metric }, { date: "2026-09-22", totals: metric }], modelUsage: [{ id: "qa", label: "Synthetic model", totals: metric }], modelSeriesTruncated: false,
          };
          return h(React.Fragment, null,
            h("div", { id: "gateway-qa", style: { maxWidth: 420, minWidth: 0 } }, h(ApiGatewayMeteringSummary, {
              copy: buildApiGatewayMeteringLocalizedCopy(locale), locale, metering, providerId: "sub2api-api-key", surface: "popup", activeDeploymentId: account,
              deploymentOptions: [{ id: "account_qaone001", label: "Primary gateway" }, { id: "account_qatwo002", label: "A deliberately long second deployment label" }], onSelectDeployment: setAccount,
            })),
            h(ProgressAppearancePreferenceControls, { colorAppearance: appearance, colorBands: bands, colorChoiceCopy: copy.colorChoices, copy: copy.progressAppearance,
              thicknessPx: thickness, activePopover: popover, onActivePopoverChange: setPopover, onColorAppearanceChange: setAppearance, onColorBandsChange: setBands, onThicknessPxChange: setThickness }),
          );
        }
        ReactDOM.createRoot(holder).render(h(Controls));
      }, { locale, theme });
      const holder = page.locator("#module-boundaries-qa");
      await holder.locator(".progress-appearance-band-list").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await holder.screenshot({ path: path.join(output, `${locale}-${width}-traditional.png`), animations: "disabled" });
      const selector = holder.getByRole("combobox");
      await selector.focus();
      await page.keyboard.press("Enter");
      const menu = page.locator(".api-gateway-metering-deployment__menu");
      await menu.waitFor();
      await page.keyboard.press("End");
      assert.equal(await page.getByRole("option").nth(1).getAttribute("data-active"), "true");
      const bounds = await menu.boundingBox();
      assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
      await page.screenshot({ path: path.join(output, `${locale}-${width}-deployment-menu.png`) });
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => window.__moduleQa.account === "account_qatwo002");
      assert(await selector.evaluate((element) => element === document.activeElement));
      await page.keyboard.press("Enter");
      await page.keyboard.press("Home");
      await page.keyboard.press("Escape");
      assert.equal(await selector.getAttribute("aria-expanded"), "false");
      await page.keyboard.press("Enter");
      await page.getByRole("option").first().click();
      await page.waitForFunction(() => window.__moduleQa.account === "account_qaone001");
      const range = holder.locator("[data-api-gateway-metering-range-days]");
      await range.click();
      assert.equal(await range.getAttribute("data-api-gateway-metering-range-days"), "30");
      const moduleToggle = holder.locator('[data-api-gateway-metering-module="summary"] .api-gateway-metering-module__collapse-toggle');
      await moduleToggle.click();
      assert.equal(await moduleToggle.getAttribute("aria-expanded"), "false");
      await moduleToggle.click();
      await holder.locator("#progress-thickness-input").fill("12.5");
      await page.waitForFunction(() => window.__moduleQa.thickness === 12.5);
      await holder.locator(".progress-appearance-mode-switch__button").nth(1).click();
      const rail = holder.locator("[data-progress-gradient-rail]");
      await rail.waitFor();
      await rail.scrollIntoViewIfNeeded();
      const box = await rail.boundingBox();
      await page.mouse.click(box.x + box.width * 0.35, box.y + box.height / 2);
      const stopCount = await holder.locator('[data-progress-gradient-editor] [role="slider"]').count();
      assert(stopCount >= 4, "Gradient rail did not add a stop");
      const stop = holder.locator('[data-progress-gradient-editor] [role="slider"][data-selected="true"]');
      await stop.focus();
      const initial = Number(await stop.getAttribute("aria-valuenow"));
      await page.keyboard.press("ArrowRight");
      assert.notEqual(Number(await stop.getAttribute("aria-valuenow")), initial);
      await holder.screenshot({ path: path.join(output, `${locale}-${width}-gradient.png`), animations: "disabled" });
      const otherHandle = holder.locator('[data-progress-gradient-editor] [role="slider"][aria-valuenow="49"]');
      await otherHandle.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(() => document.querySelector('[data-progress-gradient-editor] [role="slider"][data-selected="true"]')?.getAttribute("aria-valuenow") === "50");
      await holder.locator(".progress-appearance-bands__header-actions button").click();
      assert.equal(await holder.locator('[data-progress-gradient-editor] [role="slider"]').first().getAttribute("data-selected"), "true");
      const modes = holder.locator(".progress-appearance-mode-switch__button");
      await modes.nth(0).click();
      const firstBandInput = holder.locator(".progress-appearance-band__fields input").first();
      await firstBandInput.fill("");
      await holder.locator(".progress-appearance-bands__error").waitFor();
      await modes.nth(1).click();
      await modes.nth(0).click();
      assert.equal(await firstBandInput.inputValue(), "", "Mode switch discarded an unfinished color-band draft");
      const layout = await holder.evaluate((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth, direction: document.documentElement.dir }));
      assert(layout.scrollWidth <= layout.width + 2, JSON.stringify(layout));
      assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
      await holder.screenshot({ path: path.join(output, `${locale}-${width}-invalid-draft.png`), animations: "disabled" });
      results.push({ locale, width, theme, layout, stopCount });
      for (const state of ["traditional", "gradient", "deployment-menu"]) screenshots.push(`${locale}-${width}-${state}.png`);
      console.log(`module boundaries ${locale}/${width}/${theme}: passed`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, `${locale}-${width}-failure.png`), fullPage: true });
      throw error;
    } finally { await page.close(); }
  }
  assert.deepEqual(errors, []);
  if (comparison) {
    const page = await browser.newPage();
    try {
      for (const filename of screenshots) {
        const before = await readFile(path.join(path.resolve(comparison), filename));
        const after = await readFile(path.join(output, filename));
        const pixels = await page.evaluate(async ({ before, after }) => {
          async function read(base64) {
            const image = new Image();
            image.src = `data:image/png;base64,${base64}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            return { width: image.width, height: image.height, data: context.getImageData(0, 0, image.width, image.height).data };
          }
          const a = await read(before), b = await read(after);
          if (a.width !== b.width || a.height !== b.height) return { dimensionsMatch: false };
          let changed = 0;
          for (let index = 0; index < a.data.length; index += 4) {
            if ([0, 1, 2, 3].some((channel) => a.data[index + channel] !== b.data[index + channel])) changed++;
          }
          return { dimensionsMatch: true, changed, total: a.width * a.height };
        }, { before: before.toString("base64"), after: after.toString("base64") });
        results.push({ filename, comparison: pixels });
        assert(pixels.dimensionsMatch && pixels.changed === 0, `Visual difference: ${filename} ${JSON.stringify(pixels)}`);
      }
    } finally { await page.close(); }
  }
  status = "passed";
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ status, results, errors }, null, 2));
  await browser?.close();
  await server.close();
  console.log(`Evidence: ${output}`);
}
