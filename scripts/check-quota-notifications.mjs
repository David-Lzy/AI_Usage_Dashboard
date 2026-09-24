import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const root = path.resolve("tmp/output/playwright/quota-notifications");
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
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`);
      await page.locator("#settings-appearance").waitFor();
      await page.evaluate(async ({ locale, theme }) => {
        const { default: React } = await import("/__qa/react.js");
        const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
        const { QuotaNotificationSettings } = await import("/src/sidepanel/components/QuotaNotificationSettings.tsx");
        const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
        const { createDefaultAppState } = await import("/src/shared/production-state.ts");
        const { createQuotaNotificationController } = await import("/src/background/quota-notification-controller.ts");
        const { QUOTA_NOTIFICATION_STORAGE_KEY } = await import("/src/shared/quota-notifications.ts");
        const state = createDefaultAppState();
        state.settings.warningThresholdPercent = 75;
        const selectedProviders = new Set(["claude-code-team-page", "codex-personal-page"]);
        state.providers = state.providers.filter((provider) => selectedProviders.has(provider.providerId));
        state.providerSettings = state.providerSettings.filter((provider) => selectedProviders.has(provider.id));
        state.providerSettings.find((provider) => provider.id === "codex-personal-page").status = "granted";
        const codex = state.providers.find((provider) => provider.providerId === "codex-personal-page");
        const claude = state.providers.find((provider) => provider.providerId === "claude-code-team-page");
        let now = Date.parse("2026-09-22T12:00:00Z"), stored, permission = "denied";
        const requests = [], events = [], listeners = new Set();
        Object.assign(codex, { syncStatus: "ok", lastAttemptAt: new Date(now).toISOString(), lastSuccessAt: new Date(now).toISOString(),
          usageWindows: [{ kind: "weekly", label: "Weekly limit", normalizedLabel: "weekly", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: "2026-09-23T12:00:00Z", resetLabel: null }] });
        Object.assign(claude, { usageWindows: [
          { kind: "rolling_5h", label: "5-hour limit", normalizedLabel: "5-hour", modelLabel: null, quotaUnit: "percent", used: 10, remaining: 90, total: 100, resetAt: null, resetLabel: null },
          { kind: "weekly", label: "Weekly limit", normalizedLabel: "weekly", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: null, resetLabel: null },
        ] });
        const dependencies = { readState: async () => state, readStore: async () => stored,
          writeStore: async (value) => { const previous = stored; stored = structuredClone(value); for (const listener of listeners) listener({ [QUOTA_NOTIFICATION_STORAGE_KEY]: { oldValue: previous, newValue: stored } }, "local"); },
          permission: async () => permission, deliver: async (event) => { events.push(event); }, now: () => now };
        let controller = createQuotaNotificationController(dependencies);
        window.__quotaQa = { requests, events, deny: true, getStore: () => stored,
          advance: async (used) => { now += 60_000; Object.assign(codex, { lastAttemptAt: new Date(now).toISOString(), lastSuccessAt: new Date(now).toISOString() }); Object.assign(codex.usageWindows[0], { used, remaining: 100 - used }); await controller.evaluate(); },
          restart: async () => { controller = createQuotaNotificationController(dependencies); await controller.evaluate(); } };
        // Only the browser/OS transport is mocked; UI, client, controller and persistence transitions are real.
        window.chrome = { runtime: { id: "notification-qa", sendMessage: (message) => controller.handle(message) }, permissions: {
          request: async (request) => { requests.push({ request, active: navigator.userActivation.isActive }); if (window.__quotaQa.deny) return false; permission = "granted"; return true; },
        }, storage: { onChanged: { addListener: (listener) => listeners.add(listener), removeListener: (listener) => listeners.delete(listener) } } };
        document.querySelector("#root").hidden = true;
        document.documentElement.dataset.themeResolved = theme;
        document.documentElement.dataset.motionResolved = "reduced";
        const holder = document.createElement("main");
        holder.id = "quota-qa";
        holder.style.cssText = "margin:12px;min-width:0";
        document.body.append(holder);
        ReactDOM.createRoot(holder).render(React.createElement(QuotaNotificationSettings, { state, i18n: createRuntimeI18n(locale), warningThresholdPercent: 75 }));
      }, { locale, theme });
      const control = page.locator("#quota-qa [data-quota-notifications]");
      const enable = control.locator('[data-notification-action="enable"]');
      await enable.waitFor();
      assert.equal(await control.locator(".quota-notification-settings__account").count(), 2);
      assert.equal(await enable.isChecked(), false);
      assert.equal(await page.evaluate(() => window.__quotaQa.requests.length), 0);
      assert.equal(await enable.isEnabled(), true, "Missing permission must not disable the explicit enable gesture");
      await enable.focus();
      await page.keyboard.press("Space");
      await page.waitForFunction(() => window.__quotaQa.requests.length === 1);
      assert.equal(await enable.isChecked(), false);
      await page.evaluate(() => { window.__quotaQa.deny = false; });
      await enable.click();
      await page.waitForFunction(() => window.__quotaQa.getStore()?.preferences.enabled === true);
      const threshold = control.locator('[data-notification-action="threshold"]');
      assert.equal(await threshold.inputValue(), "75");
      await threshold.fill("80");
      await threshold.press("Enter");
      await page.waitForFunction(() => window.__quotaQa.getStore().preferences.thresholdPercent === 80);
      const account = control.locator('input[data-notification-account]').first();
      const windowToggle = control.locator('input[data-notification-window]').first();
      await account.uncheck();
      await page.waitForFunction(() => window.__quotaQa.getStore().preferences.disabledAccountKeys.length === 1);
      assert.equal(await windowToggle.isEnabled(), false);
      await account.check();
      await windowToggle.uncheck();
      await page.waitForFunction(() => window.__quotaQa.getStore().preferences.disabledWindowKeys.length === 1);
      await windowToggle.check();
      await page.waitForFunction(() => window.__quotaQa.getStore().preferences.disabledWindowKeys.length === 0);
      const pause = control.locator('[data-notification-action="pause"]');
      const test = control.locator('[data-notification-action="test"]');
      await pause.check();
      await page.waitForFunction(() => window.__quotaQa.getStore().preferences.paused === true);
      assert.equal(await test.isEnabled(), false);
      if (locale === "zh-CN" && width === 1280) {
        await page.emulateMedia({ colorScheme: "dark" });
        await page.evaluate(() => { document.documentElement.dataset.themeResolved = "dark"; });
        await control.screenshot({ path: path.join(output, "zh-CN-1280-paused-dark.png") });
        await page.emulateMedia({ colorScheme: "light" });
        await page.evaluate(() => { document.documentElement.dataset.themeResolved = "light"; });
      }
      await pause.uncheck();
      await test.click();
      await page.waitForFunction(() => window.__quotaQa.events.some((event) => event.kind === "test"));
      await page.evaluate(async () => { await window.__quotaQa.advance(85); await window.__quotaQa.restart(); });
      const trace = await page.evaluate(() => ({ requests: window.__quotaQa.requests, events: window.__quotaQa.events }));
      assert.equal(trace.events.filter((event) => event.kind === "low").length, 1);
      assert(trace.requests.every((request) => request.active));
      assert(trace.requests.every((request) => JSON.stringify(request.request) === '{"permissions":["notifications"]}'));
      const layout = await control.evaluate((element) => {
        const switchTitle = element.querySelector(".quota-notification-settings__switch .switch-row__title").getBoundingClientRect();
        const switchInput = element.querySelector(".quota-notification-settings__switch .switch-row__control").getBoundingClientRect();
        const body = element.querySelector(".quota-notification-settings__body");
        const accountCheckbox = element.querySelector(".quota-notification-settings__checkbox:checked");
        const checkboxMark = getComputedStyle(accountCheckbox, "::after");
        return { width: element.clientWidth, scroll: element.scrollWidth,
          clipped: [...element.querySelectorAll("button")].filter((button) => button.scrollWidth > button.clientWidth + 2).length,
          outside: [...element.querySelectorAll("input,button,h2,label")].filter((child) => {
            const box = child.getBoundingClientRect(), parent = element.getBoundingClientRect();
            return box.left < parent.left - 1 || box.right > parent.right + 1;
          }).length,
          columns: getComputedStyle(body).gridTemplateColumns.split(" ").length,
          switchRowAligned: Math.abs((switchTitle.top + switchTitle.bottom) / 2 - (switchInput.top + switchInput.bottom) / 2) <= Math.max(switchTitle.height, switchInput.height) / 2,
          checkboxMark: { left: checkboxMark.borderLeftWidth, right: checkboxMark.borderRightWidth },
          unitWidth: element.querySelector(".quota-notification-settings__unit").getBoundingClientRect().width,
          direction: document.documentElement.dir };
      });
      assert(layout.scroll <= layout.width + 2 && layout.clipped === 0, JSON.stringify(layout));
      assert.equal(layout.outside, 0, JSON.stringify(layout));
      assert(layout.switchRowAligned, `Notification switch label and checkbox split across rows: ${JSON.stringify(layout)}`);
      assert.equal(layout.columns, width === 320 ? 1 : 2, JSON.stringify(layout));
      assert.deepEqual(layout.checkboxMark, { left: "2px", right: "0px" }, JSON.stringify(layout));
      assert(layout.unitWidth < 50, "Percent unit must not stretch into a page-wide chip");
      assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
      await control.screenshot({ path: path.join(output, `${locale}-${width}.png`) });
      results.push({ locale, width, theme, trace, layout });
      console.log(`quota notifications ${locale}/${width}/${theme}: passed`);
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
