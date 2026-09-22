import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const root = path.resolve("tmp/output/playwright/diagnostics-export");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await startSourceQaServer();
const results = [], errors = [];
let browser, status = "failed";
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }) });
  for (const locale of SUPPORTED_RDP_CAPTURE_LOCALES) for (const [width, theme] of [[320, "dark"], [1280, "light"]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "reduce", acceptDownloads: true });
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`);
      await page.locator("#settings-appearance").waitFor();
      await page.evaluate(async ({ locale, theme }) => {
        const { default: React } = await import("/node_modules/.vite/deps/react.js");
        const { default: ReactDOM } = await import("/node_modules/.vite/deps/react-dom_client.js");
        const { DiagnosticsExportControl } = await import("/src/sidepanel/components/DiagnosticsExportControl.tsx");
        const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
        const { createDefaultAppState } = await import("/src/shared/production-state.ts");
        const state = createDefaultAppState();
        const secret = "DO_NOT_EXPORT_SECRET_SENTINEL";
        for (const snapshot of state.providers) {
          snapshot.providerLabel = secret;
          snapshot.warningReason = secret;
          snapshot.warningDiagnostic = { code: "host_access.missing", category: "host_access", severity: "warning", rawMessage: secret, params: { token: secret } };
        }
        document.querySelector("#root").hidden = true;
        document.documentElement.dataset.themeResolved = theme;
        document.documentElement.dataset.motionResolved = "reduced";
        const holder = document.createElement("main");
        holder.id = "diagnostics-qa";
        holder.style.cssText = "margin:12px;min-width:0";
        document.body.append(holder);
        ReactDOM.createRoot(holder).render(React.createElement(DiagnosticsExportControl, { state, i18n: createRuntimeI18n(locale) }));
        window.__diagnosticsSource = state;
      }, { locale, theme });
      const control = page.locator("[data-diagnostics-export]");
      const open = control.locator('[data-diagnostics-action="preview"]');
      await open.focus();
      await page.keyboard.press("Enter");
      const preview = control.locator("[data-diagnostics-preview]");
      await preview.waitFor();
      const json = await preview.textContent();
      assert(!json.includes("DO_NOT_EXPORT_SECRET_SENTINEL"));
      const report = JSON.parse(json);
      assert.equal(report.schemaVersion, 1);
      assert.equal(report.providers.length, 9);
      assert.equal(await preview.evaluate((element) => getComputedStyle(element).direction), "ltr");
      await page.evaluate(() => { window.__diagnosticsSource.providers[0].syncStatus = "error"; });
      const downloadEvent = page.waitForEvent("download");
      await control.locator('[data-diagnostics-action="download"]').click();
      const download = await downloadEvent;
      const file = path.join(output, `${locale}-${width}.json`);
      await download.saveAs(file);
      assert.equal(await readFile(file, "utf8"), json);
      const layout = await control.evaluate((element) => ({
        width: element.clientWidth, scroll: element.scrollWidth,
        clippedButtons: Array.from(element.querySelectorAll("button")).filter((button) => button.scrollWidth > button.clientWidth + 2).length,
        direction: document.documentElement.dir,
      }));
      assert(layout.scroll <= layout.width + 2 && layout.clippedButtons === 0, JSON.stringify(layout));
      assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
      assert(await control.locator("svg").first().evaluate((icon) => getComputedStyle(icon).fill === getComputedStyle(icon.closest("button")).color), "Action icon must inherit the themed button color");
      await page.screenshot({ path: path.join(output, `${locale}-${width}.png`), fullPage: true });
      await page.evaluate(() => {
        window.__createObjectURL = URL.createObjectURL;
        URL.createObjectURL = () => { throw new Error("synthetic blocked download"); };
      });
      await control.locator('[data-diagnostics-action="download"]').click();
      await control.getByRole("alert").waitFor();
      assert((await control.getByRole("alert").textContent()).length > 0);
      await page.evaluate(() => { URL.createObjectURL = window.__createObjectURL; });
      await control.locator('[data-diagnostics-action="close"]').focus();
      await page.keyboard.press("Enter");
      await preview.waitFor({ state: "hidden" });
      assert(await open.evaluate((element) => element === document.activeElement));
      results.push({ locale, width, theme, layout, downloadedBytes: Buffer.byteLength(json) });
      console.log(`diagnostics ${locale}/${width}/${theme}: passed`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, `${locale}-${width}-failure.png`), fullPage: true });
      throw error;
    } finally { await page.close(); }
  }
  assert.deepEqual(errors, []);
  status = "passed";
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ status, results, errors }, null, 2));
  await browser?.close();
  await server.close();
  console.log(`Evidence: ${output}`);
}
