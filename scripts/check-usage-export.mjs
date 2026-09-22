import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const root = path.resolve("tmp/output/playwright/usage-export");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await startSourceQaServer();
let browser, status = "failed";
const results = [], errors = [];
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }) });
  const locales = process.argv.includes("--smoke") ? ["en", "de", "ar"] : SUPPORTED_RDP_CAPTURE_LOCALES;
  for (const locale of locales) for (const [width, theme] of [[320, "dark"], [1280, "light"]]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: "reduce", acceptDownloads: true });
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`);
      await page.locator("#settings-appearance").waitFor();
      await page.evaluate(async ({ locale, theme }) => {
        const { default: React } = await import("/node_modules/.vite/deps/react.js");
        const { default: ReactDOM } = await import("/node_modules/.vite/deps/react-dom_client.js");
        const { UsageExport } = await import("/src/sidepanel/components/UsageExport.tsx");
        const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
        const { createDefaultAppState } = await import("/src/shared/production-state.ts");
        const { addInactiveProviderAccount } = await import("/src/shared/provider-accounts.ts");
        const { parseSub2ApiUsageResponse } = await import("/src/providers/sub2api/client.ts");
        const { buildUsageExport, getUsageExportRange } = await import("/src/shared/usage-export.ts");
        const id = "sub2api-api-key", other = "account_export-browser";
        const capture = new Date().toISOString();
        const dates = Array.from({ length: 9 }, (_, index) => new Date(Date.now() - (10 - index) * 86400000).toISOString().slice(0, 10));
        let state = createDefaultAppState();
        const snapshot = state.providers.find((entry) => entry.providerId === id);
        const setting = state.providerSettings.find((entry) => entry.id === id);
        Object.assign(snapshot, { syncStatus: "ok", warningReason: "ERROR_SECRET_SENTINEL", apiGatewayMetering: parseSub2ApiUsageResponse({ mode: "unrestricted", isValid: true, status: "active", unit: "USD", balance: 100,
          daily_usage: dates.map((date, index) => ({ date, requests: index, total_tokens: index * 100, actual_cost: index / 10, cost: index / 5 })) },
        { accountId: "default", capturedAt: capture, requestedTimezone: "UTC", connection: { schemaVersion: 1, displayLabel: "Synthetic", baseUrl: "https://DO-NOT-EXPORT.example.test", insecureTransportAcknowledged: false } }) });
        setting.status = "granted";
        state = addInactiveProviderAccount(state, { providerId: id, accountId: other, label: '=SUM(1,2) "部署" العربية', snapshot: { ...snapshot, apiGatewayMetering: { ...snapshot.apiGatewayMetering, accountId: other } }, setting });
        const codex = state.providers.find((entry) => entry.providerId === "codex-personal-page");
        state.providerSettings.find((entry) => entry.id === codex.providerId).status = "granted";
        codex.syncStatus = "ok";
        codex.usageHistory = { capturedAt: capture, rangeStart: dates[0], rangeEnd: dates.at(-1), granularity: "day",
          personalUsageBySurface: { capturedAt: capture, unit: "percent", points: dates.map((date) => ({ date, values: [{ id: "PRIVATE_SERIES_ID", label: "Extension", value: 25 }] })) },
          turns: { capturedAt: capture, total: 50000, byModel: dates.map((date) => ({ date, values: [{ id: "PRIVATE_MODEL_ID", label: "Example model", value: 12 }] })), bySurface: dates.map((date) => ({ date, values: [{ id: "PRIVATE_SURFACE_ID", label: "Desktop", value: 12 }] })) } };
        document.querySelector("#root").hidden = true;
        document.documentElement.dataset.themeResolved = theme;
        const holder = document.createElement("main"); holder.style.cssText = "margin:12px;min-width:0"; document.body.append(holder);
        window.__exportQa = { state, other, id, attempts: 0, permissions: 0, expected: (accountId = "default", providerId = id, family = "gateway_daily") => buildUsageExport(state, { providerId, accountId, family, range: getUsageExportRange(state, providerId, accountId, family) }).csv };
        const originalFetch = window.fetch.bind(window);
        window.fetch = (input, init) => {
          const url = new URL(String(input), location.href);
          if (url.hostname.endsWith(".example.test")) { window.__exportQa.attempts++; throw new Error("Exporter must not fetch"); }
          return originalFetch(input, init);
        };
        window.browser = { runtime: { id: "usage-export-qa" }, permissions: { request: async () => { window.__exportQa.permissions++; return false; } } };
        function Harness() {
          const [current, setCurrent] = React.useState(state), [providerId, setProviderId] = React.useState(id);
          window.__exportQa.replace = (next) => { state = next; window.__exportQa.state = next; setCurrent(next); };
          window.__exportQa.provider = setProviderId;
          return React.createElement(UsageExport, { key: providerId, state: current, providerId, i18n: createRuntimeI18n(locale) });
        }
        ReactDOM.createRoot(holder).render(React.createElement(Harness));
      }, { locale, theme });
      const control = page.locator("[data-usage-export]");
      const previewButton = control.locator('[data-usage-export-action="preview"]');
      const downloadButton = control.locator('[data-usage-export-action="download"]');
      const preview = control.locator("[data-usage-export-preview]");
      await previewButton.focus(); await page.keyboard.press("Enter");
      await preview.waitFor();
      assert.equal(await preview.locator("tbody tr").count(), 50);
      async function downloadCsv(suffix) {
        const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
        const file = path.join(output, `${locale}-${width}-${suffix}.csv`);
        await download.saveAs(file);
        return readFile(file, "utf8");
      }
      const first = await downloadCsv("gateway");
      assert.equal(first, await page.evaluate(() => window.__exportQa.expected()));
      const parsed = Papa.parse(first, { header: true, skipEmptyLines: true });
      assert.deepEqual(parsed.errors, []); assert.equal(parsed.data.length, 72);
      assert(!first.includes("SECRET_SENTINEL") && !first.includes("DO-NOT-EXPORT"));
      const expectedCapture = await page.evaluate(({ capture, locale }) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(capture)), { capture: parsed.data[0].captured_at, locale });
      assert.equal(await preview.locator(".usage-export__metadata > div").nth(2).locator("dd").textContent(), expectedCapture);
      const tableRegion = preview.getByRole("region");
      await tableRegion.focus();
      assert(await tableRegion.evaluate((element) => element === document.activeElement && element.clientHeight <= 400));
      assert((await downloadButton.boundingBox()).y < (await tableRegion.boundingBox()).y);
      const rangeStart = control.locator('input[type="date"]').first();
      const originalStart = await rangeStart.inputValue();
      const selectedStart = new Date(Date.parse(`${originalStart}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
      await rangeStart.fill(selectedStart); await previewButton.click();
      await page.evaluate(() => { const next = structuredClone(window.__exportQa.state); next.providers[0].warningReason = "Unrelated state update"; window.__exportQa.replace(next); });
      assert.equal(await rangeStart.inputValue(), selectedStart);
      await preview.waitFor();
      await page.evaluate(() => { const next = structuredClone(window.__exportQa.state); next.providers.find((entry) => entry.providerId === window.__exportQa.id).apiGatewayMetering.dailyUsage[1].totals.requests += 1; window.__exportQa.replace(next); });
      await page.waitForFunction(() => !document.querySelector('[data-usage-export-preview]'));
      assert.equal(await rangeStart.inputValue(), selectedStart);
      await rangeStart.fill(originalStart);
      const account = control.locator('[data-usage-export-field="account"]').getByRole("combobox");
      await account.click(); await page.getByRole("option").nth(1).click();
      assert(await preview.count() === 0 || !await preview.isVisible());
      assert.equal(await page.evaluate(() => window.__exportQa.state.providerAccounts[window.__exportQa.id].activeAccountId), "default");
      await previewButton.click();
      const second = await downloadCsv("second");
      assert.equal(second, await page.evaluate(() => window.__exportQa.expected(window.__exportQa.other)));
      assert.equal(Papa.parse(second, { header: true, skipEmptyLines: true }).data[0].account_label[0], "'");
      const layout = await control.evaluate((element) => ({ width: element.clientWidth, scroll: element.scrollWidth, viewport: document.documentElement.scrollWidth,
        clippedButtons: [...element.querySelectorAll("button")].filter((button) => button.scrollWidth > button.clientWidth + 2).length, direction: document.documentElement.dir }));
      assert(layout.scroll <= layout.width + 2 && layout.viewport <= width + 2 && layout.clippedButtons === 0, JSON.stringify(layout));
      assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
      await control.screenshot({ path: path.join(output, `${locale}-${width}.png`) });
      await page.evaluate(() => { window.__exportQa.objectURL = URL.createObjectURL; URL.createObjectURL = () => { throw new Error("synthetic blocked download"); }; });
      await downloadButton.click(); await control.getByRole("alert").waitFor();
      await page.evaluate(() => { URL.createObjectURL = window.__exportQa.objectURL; });
      await page.evaluate(() => {
        const OriginalDate = Date; window.__exportQa.Date = OriginalDate;
        window.Date = class extends OriginalDate {
          constructor(...args) { super(...(args.length ? args : [OriginalDate.now() + 90 * 60000])); }
          static now() { return OriginalDate.now() + 90 * 60000; }
        };
      });
      await downloadButton.click();
      await page.waitForFunction(() => !document.querySelector('[data-usage-export-preview]'));
      await page.evaluate(() => { window.Date = window.__exportQa.Date; });
      const date = control.locator('input[type="date"]').first(); const original = await date.inputValue();
      await date.fill("2099-12-31");
      assert(await preview.count() === 0 || !await preview.isVisible());
      assert(await previewButton.isDisabled());
      await date.fill(original); await previewButton.click();
      await page.evaluate(() => { const next = structuredClone(window.__exportQa.state); const group = next.providerAccounts[window.__exportQa.id]; group.accounts = group.accounts.filter((entry) => entry.id !== window.__exportQa.other); window.__exportQa.replace(next); });
      await page.waitForFunction(() => !document.querySelector('[data-usage-export-preview]'));
      await page.evaluate(() => window.__exportQa.provider("codex-personal-page"));
      await previewButton.click();
      const turns = await downloadCsv("turns");
      assert.equal(turns, await page.evaluate(() => window.__exportQa.expected("default", "codex-personal-page", "turns_by_model")));
      assert(!turns.includes("PRIVATE_MODEL_ID") && !turns.includes("50000"));
      const family = control.locator('[data-usage-export-field="family"]').getByRole("combobox");
      await family.focus(); await page.keyboard.press("ArrowDown"); await page.keyboard.press("End"); await page.keyboard.press("Enter");
      await previewButton.click();
      const percent = await downloadCsv("percent");
      assert.equal(percent, await page.evaluate(() => window.__exportQa.expected("default", "codex-personal-page", "personal_usage_by_surface")));
      const percentRows = Papa.parse(percent, { header: true, skipEmptyLines: true }).data;
      assert.equal(percentRows.length, 9); assert(percentRows.every((row) => row.unit === "percent" && row.value === "25"));
      assert.equal(await page.evaluate(() => window.__exportQa.attempts + window.__exportQa.permissions), 0);
      results.push({ locale, width, theme, layout, gatewayRows: parsed.data.length, percentRows: percentRows.length });
      console.log(`usage export ${locale}/${width}/${theme}: passed`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, `${locale}-${width}-failure.png`), fullPage: true });
      throw error;
    } finally { await page.close(); }
  }
  assert.deepEqual(errors, []); status = "passed";
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ status, results, errors }, null, 2));
  await browser?.close(); await server.close(); console.log(`Evidence: ${output}`);
}
