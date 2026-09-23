import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const root = path.resolve("tmp/output/playwright/deployment-comparison");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await startSourceQaServer();
let browser, status = "failed";
const results = [], errors = [];
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }) });
  const localeArg = process.argv.find((arg) => arg.startsWith("--locales="))?.slice(10).split(",");
  const locales = localeArg ?? (process.argv.includes("--smoke") ? ["en", "de", "ar"] : SUPPORTED_RDP_CAPTURE_LOCALES);
  assert(locales.every((locale) => SUPPORTED_RDP_CAPTURE_LOCALES.includes(locale)));
  for (const locale of locales) for (const [width, theme] of [[320, "dark"], [1280, "light"]]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`);
      await page.locator("#settings-appearance").waitFor();
      await page.evaluate(async ({ locale, theme }) => {
        const { default: React } = await import("/__qa/react.js");
        const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
        const { DeploymentComparison } = await import("/src/sidepanel/components/DeploymentComparison.tsx");
        const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
        const { createDefaultAppState } = await import("/src/shared/production-state.ts");
        const { updateActiveProviderAccountConnection, addInactiveProviderAccount, getProviderAccountRuntime } = await import("/src/shared/provider-accounts.ts");
        const { parseSub2ApiUsageResponse } = await import("/src/providers/sub2api/client.ts");
        const { setSub2ApiKey } = await import("/src/shared/provider-secrets.ts");
        const { writeAppState, readAppState } = await import("/src/shared/storage.ts");
        const { handleAppMessage } = await import("/src/background/message-bus.ts");
        const { getUsagePeriodRange } = await import("/src/shared/usage-periods.ts");
        const id = "sub2api-api-key", other = "account_comparison-qa";
        const now = Date.now();
        const dates = [2, 1].map((days) => new Date(now - days * 86400000).toISOString().slice(0, 10));
        const capture = new Date(now - 10000).toISOString();
        const connection = { schemaVersion: 1, displayLabel: "Primary gateway", baseUrl: "https://gateway-a.example.test", insecureTransportAcknowledged: false };
        const secondConnection = { ...connection, displayLabel: "Second deployment with a deliberately long local label", baseUrl: "https://gateway-b.example.test" };
        const payload = (requests) => ({ mode: "unrestricted", isValid: true, status: "active", unit: "USD", balance: 100,
          daily_usage: dates.map((date) => ({ date, requests, total_tokens: requests * 100, actual_cost: requests / 10, cost: requests / 5 })) });
        let state = updateActiveProviderAccountConnection(createDefaultAppState(), id, connection);
        const first = getProviderAccountRuntime(state, id, "default");
        Object.assign(first.setting, { status: "granted", credentialStatus: "configured" });
        Object.assign(first.snapshot, { syncStatus: "ok", lastSuccessAt: capture, lastAttemptAt: capture,
          apiGatewayMetering: parseSub2ApiUsageResponse(payload(10), { accountId: "default", connection, capturedAt: capture, requestedTimezone: "UTC" }) });
        // Synthetic known-zone fixture exercises eligible presentation; production parser does not infer this.
        first.snapshot.apiGatewayMetering.dailyUsageContext = { capturedAt: capture, requestedTimezone: "UTC", bucketTimezone: "UTC" };
        const secondMetering = parseSub2ApiUsageResponse(payload(20), { accountId: other, connection: secondConnection, capturedAt: capture, requestedTimezone: "UTC" });
        secondMetering.dailyUsageContext = { capturedAt: capture, requestedTimezone: "UTC", bucketTimezone: "UTC" };
        state = addInactiveProviderAccount(state, { providerId: id, accountId: other, label: secondConnection.displayLabel,
          snapshot: { ...first.snapshot, apiGatewayMetering: secondMetering }, setting: { ...first.setting, hostOrigins: ["https://gateway-b.example.test/*"] }, apiGatewayConnection: secondConnection });
        await writeAppState(state);
        await setSub2ApiKey("synthetic-qa-key-primary", "default");
        await setSub2ApiKey("synthetic-qa-key-secondary", other);
        window.browser = { runtime: { id: "deployment-comparison-qa" }, permissions: { contains: async () => true } };
        const originalFetch = window.fetch.bind(window);
        window.__comparisonQa = { other, attempts: [], fail: false, release: null, snapshot: state, read: readAppState };
        window.__comparisonQa.periodRange = (preset) => getUsagePeriodRange(preset);
        window.fetch = async (input, init) => {
          const url = new URL(String(input));
          if (!url.hostname.endsWith(".example.test")) return originalFetch(input, init);
          window.__comparisonQa.attempts.push({ host: url.hostname, method: init?.method });
          if (window.__comparisonQa.fail) return new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } });
          await new Promise((resolve) => { window.__comparisonQa.release = resolve; });
          return new Response(JSON.stringify(payload(30)), { headers: { "Content-Type": "application/json" } });
        };
        document.querySelector("#root").hidden = true;
        document.documentElement.dataset.themeResolved = theme;
        const holder = document.createElement("main");
        holder.id = "comparison-qa";
        holder.style.cssText = "margin:12px;min-width:0";
        document.body.append(holder);
        function Harness() {
          const [current, setCurrent] = React.useState(state);
          window.__comparisonQa.snapshot = current;
          return React.createElement(DeploymentComparison, { state: current, i18n: createRuntimeI18n(locale), onRefreshAccount: async (accountId) => {
            const response = await handleAppMessage({ type: "app:request-refresh", providerId: id, accountId });
            if (!response.ok) throw new Error("Refresh failed");
            setCurrent(response.state);
            const refreshed = getProviderAccountRuntime(response.state, id, accountId);
            if (!refreshed || refreshed.snapshot.syncStatus === "error" || refreshed.snapshot.apiGatewayMetering?.stale) throw new Error("Refresh failed");
          } });
        }
        ReactDOM.createRoot(holder).render(React.createElement(Harness));
      }, { locale, theme });
      const control = page.locator("[data-deployment-comparison]");
      await control.locator("tbody tr").nth(1).waitFor();
      const second = control.locator('[data-deployment-comparison-row="account_comparison-qa"]');
      const refresh = second.locator("button");
      await refresh.focus(); await page.keyboard.press("Enter");
      await page.waitForFunction(() => window.__comparisonQa.release !== null);
      assert.equal(await refresh.isDisabled(), true);
      assert.equal(await page.evaluate(async () => (await window.__comparisonQa.read()).providerAccounts["sub2api-api-key"].activeAccountId), "default");
      await page.evaluate(() => window.__comparisonQa.release());
      await page.waitForFunction(() => window.__comparisonQa.snapshot.providerAccounts["sub2api-api-key"].inactiveAccounts["account_comparison-qa"].snapshot.apiGatewayMetering.dailyUsage[0].totals.requests === 30);
      assert.equal(await page.evaluate(() => window.__comparisonQa.snapshot.providerAccounts["sub2api-api-key"].activeAccountId), "default");
      assert.equal(await page.evaluate(() => window.__comparisonQa.snapshot.providers.find((provider) => provider.providerId === "sub2api-api-key").apiGatewayMetering.dailyUsage[0].totals.requests), 10);
      assert.equal(await page.evaluate(() => window.__comparisonQa.snapshot.providerAccounts["sub2api-api-key"].inactiveAccounts["account_comparison-qa"].snapshot.apiGatewayMetering.dailyUsageContext.bucketTimezone), null);
      await page.evaluate(() => { window.__comparisonQa.fail = true; });
      await refresh.click();
      await second.locator(".deployment-comparison__failure").waitFor();
      assert.equal(await page.evaluate(() => window.__comparisonQa.snapshot.providerAccounts["sub2api-api-key"].inactiveAccounts["account_comparison-qa"].snapshot.apiGatewayMetering.dailyUsage[0].totals.requests), 30);
      const dates = control.locator('input[type="date"]');
      const originalStart = await dates.first().inputValue();
      const originalEnd = await dates.last().inputValue();
      await dates.first().fill("2099-12-31");
      await control.getByRole("alert").waitFor();
      await dates.first().fill(originalStart);
      const periodSelector = control.locator("[data-usage-period-preset]").getByRole("combobox");
      for (const preset of ["this_week", "this_month", "last_7_days", "last_30_days"]) {
        await periodSelector.click();
        await page.locator(`[role="option"][id$="-option-${preset}"]`).click();
        const expected = await page.evaluate((preset) => window.__comparisonQa.periodRange(preset), preset);
        assert.equal(await dates.first().inputValue(), expected.start);
        assert.equal(await dates.last().inputValue(), expected.end);
      }
      await dates.first().fill(originalStart); await dates.last().fill(originalEnd);
      assert.equal(await page.evaluate(() => window.__comparisonQa.attempts.length), 2);
      const region = control.getByRole("region");
      await region.focus();
      assert(await region.evaluate((element) => element === document.activeElement));
      const layout = await control.evaluate((element) => {
        const region = element.querySelector('[role="region"]');
        return { width: element.clientWidth, scroll: element.scrollWidth, viewportScroll: document.documentElement.scrollWidth,
          controlsHeight: element.querySelector('.usage-period-controls').getBoundingClientRect().height,
          tableWidth: region.scrollWidth, tableViewport: region.clientWidth,
          dateClipping: [...element.querySelectorAll('input[type="date"]')].some((input) => input.getBoundingClientRect().right > innerWidth || input.getBoundingClientRect().left < 0), direction: document.documentElement.dir };
      });
      assert(layout.scroll <= layout.width + 2 && !layout.dateClipping, JSON.stringify(layout));
      assert(layout.viewportScroll <= width + 2, JSON.stringify(layout));
      if (width <= 680) assert(layout.controlsHeight < 430, `Unexpected narrow-screen vertical spacer: ${JSON.stringify(layout)}`);
      assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
      await region.evaluate((element) => { element.scrollLeft = 0; });
      const screenshot = await control.screenshot({ path: path.join(output, `${locale}-${width}.png`) });
      const paintedColors = await page.evaluate(async (base64) => {
        const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
        const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext("2d"); context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, image.width, image.height).data;
        const colors = new Set();
        for (let offset = 0; offset < pixels.length; offset += 4) colors.add(`${pixels[offset] >> 4},${pixels[offset + 1] >> 4},${pixels[offset + 2] >> 4}`);
        return colors.size;
      }, screenshot.toString("base64"));
      assert(paintedColors > 12, `Blank or missing comparison screenshot: ${paintedColors} color bins`);
      if (width === 320) {
        assert.equal(await region.evaluate((element) => getComputedStyle(element).scrollbarWidth), "thin");
        await page.keyboard.press(locale === "ar" ? "ArrowLeft" : "ArrowRight");
        await page.waitForFunction(() => Math.abs(document.querySelector(".deployment-comparison__table-region")?.scrollLeft ?? 0) > 2);
      }
      results.push({ locale, width, theme, layout, attempts: await page.evaluate(() => window.__comparisonQa.attempts) });
      console.log(`deployment comparison ${locale}/${width}/${theme}: passed`);
    } catch (error) {
      console.log(await page.evaluate(() => ({ attempts: window.__comparisonQa?.attempts, runtime: window.__comparisonQa?.snapshot?.providerAccounts?.["sub2api-api-key"]?.inactiveAccounts?.["account_comparison-qa"]?.snapshot?.warningReason,
        overflow: [...document.querySelectorAll("body *")].filter((element) => getComputedStyle(element).position === "absolute" && element.getBoundingClientRect().left < 0).map((element) => ({ tag: element.tagName, class: element.className, left: element.getBoundingClientRect().left })),
        html: document.querySelector("[data-deployment-comparison]")?.innerText })).catch(() => null));
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
