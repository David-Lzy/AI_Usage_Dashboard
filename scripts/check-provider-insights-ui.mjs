import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, firefox } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { providerInsightsQaOverrides, communityResetQaStore } from "./lib/provider-insights-qa-fixtures.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const { values } = parseArgs({ options: { locales: { type: "string" }, quick: { type: "boolean" }, browser: { type: "string", default: "chromium" } } });
assert(["chromium", "firefox"].includes(values.browser));
const locales = values.locales ? values.locales.split(",") : SUPPORTED_RDP_CAPTURE_LOCALES;
assert(locales.every((locale) => SUPPORTED_RDP_CAPTURE_LOCALES.includes(locale)));
const root = path.resolve(".local/qa/provider-insights/823"); await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "render-"));
const server = await startSourceQaServer(), results = [], errors = [], remote = [];
let browser, context;
try {
  browser = values.browser === "firefox" ? await firefox.launch({ headless: true })
    : await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chrome" }) });
  context = await browser.newContext({ reducedMotion: "reduce", timezoneId: "Australia/Adelaide" });
  for (const locale of locales) for (const theme of ["light", "dark"]) for (const width of values.quick ? [1440] : [1440, 900, 390, 320]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 900 }); await page.emulateMedia({ colorScheme: theme });
    page.on("pageerror", (error) => errors.push({ locale, theme, width, message: error.message }));
    await page.route("**/*", async (route) => {
      if (route.request().url().startsWith(server.baseUrl)) await route.continue();
      else { remote.push(route.request().url()); await route.abort(); }
    });
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?surface=full-page&app-locale=${locale}#settings`);
      await page.locator("#settings-quick-setup").waitFor();
      await page.evaluate(async ({ locale, theme, width, overrides, feed }) => {
        const { default: React } = await import("/__qa/react.js");
        const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
        const { createRuntimeI18n, syncRuntimeLocaleAttributes } = await import("/src/shared/i18n.ts");
        const { createDefaultAppState } = await import("/src/shared/production-state.ts");
        const { getProviderViewModel } = await import("/src/shared/provider-view-models.ts");
        const { createCommunityResetController } = await import("/src/background/community-reset-controller.ts");
        const { createResetNotificationController } = await import("/src/background/reset-notification-controller.ts");
        const { normalizeResetNotificationStore, RESET_NOTIFICATION_STORAGE_KEY } = await import("/src/shared/reset-notifications.ts");
        const { COMMUNITY_RESET_STORAGE_KEY } = await import("/src/shared/community-reset-feeds.ts");
        const { ResetInsightsSettings } = await import("/src/sidepanel/components/ResetInsightsSettings.tsx");
        const { CommunityResetPanel } = await import("/src/shared/components/CommunityResetPanel.tsx");
        const { ProviderCard } = await import("/src/sidepanel/components/ProviderCard.tsx");
        const { ProviderDetailPage } = await import("/src/sidepanel/routes/ProviderDetailPage.tsx");
        const { useFusionTheme } = await import("/src/sidepanel/components/material-ui/fusion-theme.ts");
        const i18n = createRuntimeI18n(locale), state = createDefaultAppState();
        syncRuntimeLocaleAttributes(i18n, document.documentElement, document.body);
        state.settings.locale = locale; state.settings.themeMode = theme;
        for (const provider of state.providers) if (overrides[provider.providerId]) Object.assign(provider, overrides[provider.providerId]);
        for (const setting of state.providerSettings) if (overrides[setting.id]) { setting.displayEnabled = true; setting.status = "granted"; }
        for (const surface of ["popup", "sidebar", "fullPage"]) for (const id of Object.keys(overrides)) state.settings.usageHistoryModulesBySurface[surface][id] = [
          { id: "quota_insights", visible: true }, { id: "usage_composition", visible: id === "codex-personal-page" }, { id: "community_resets", visible: false },
        ];
        let resetStore = normalizeResetNotificationStore(undefined), currentFeed = feed, now = Date.now(), permission = "denied";
        const listeners = new Set(), requests = [], delivered = [];
        const qa = window.__insightsQa = { deny: true, reject: false, slow: false, slowCount: 0, aborted: 0, conflictSource: false, failRead: false, feedReadFailure: false, requests, delivered, getFeed: () => currentFeed, getReset: () => resetStore,
          renderer: null, change: null, state };
        const broadcast = (key, oldValue, newValue) => { for (const listener of listeners) listener({ [key]: { oldValue, newValue } }, "local"); };
        const reset = createResetNotificationController({ readState: async () => state, readFeed: async () => currentFeed,
          readStore: async () => resetStore, writeStore: async (next) => { if (qa.reject) throw new Error("synthetic storage refusal"); const old = resetStore; resetStore = next; broadcast(RESET_NOTIFICATION_STORAGE_KEY, old, next); },
          readCapture: async () => ({ accountKey: '["codex-personal-page","default"]', identity: "a".repeat(64), pairingTag: "b".repeat(64), capturedAt: overrides["codex-personal-page"].lastSuccessAt }),
          permission: async () => permission, sourceAccess: async () => true, suppressed: async () => false,
          deliver: async (_id, event) => { delivered.push(event.kind); }, openTarget: async () => {}, now: () => now });
        const community = createCommunityResetController({ readStore: async () => currentFeed,
          writeStore: async (next) => { if (qa.reject) throw new Error("synthetic storage refusal"); const old = currentFeed; currentFeed = next; broadcast(COMMUNITY_RESET_STORAGE_KEY, old, next); },
          hostAccess: async () => !qa.deny, schedule: async () => {}, suppressed: async () => false, now: () => now,
          fetcher: async (_url, init) => {
            if (qa.slow) { qa.slowCount++; return new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => { qa.aborted++; reject(new DOMException("Synthetic cancelled request", "AbortError")); }, { once: true })); }
            throw new Error("Synthetic scenario has no remote transport");
          } });
        window.chrome = { runtime: { id: "insights-qa", getURL: (value) => `${location.origin}/${value}`, sendMessage: (message) => {
          if (qa.failRead && message.type === "reset-notifications:read" || qa.feedReadFailure && message.type === "community-resets:read") return Promise.reject(new Error("synthetic read failure"));
          if (qa.conflictSource && message.type === "community-resets:update") {
            qa.conflictSource = false;
            currentFeed = { ...currentFeed, revision: currentFeed.revision + 1, preferences: { ...currentFeed.preferences, sources: ["codex-reset"] } };
          }
          return message.type.startsWith("community-resets:") ? community.handle(message) : message.type.startsWith("reset-notifications:") ? reset.handle(message) : Promise.resolve({ ok: false });
        } },
          permissions: { request: async (request) => { requests.push({ request, active: navigator.userActivation.isActive }); if (qa.deny) return false; permission = "granted"; return true; }, contains: async () => !qa.deny },
          storage: { onChanged: { addListener: (listener) => listeners.add(listener), removeListener: (listener) => listeners.delete(listener) } } };
        document.querySelector("#root").hidden = true;
        document.documentElement.dataset.themeResolved = theme; document.documentElement.dataset.motionResolved = "reduced";
        const holder = document.createElement("main"); holder.id = "insights-qa"; holder.style.cssText = "padding:16px;min-width:0;max-width:1200px;margin:auto"; document.body.append(holder);
        const models = Object.keys(overrides).map((id) => getProviderViewModel(state, id));
        function Harness() {
          const ref = React.useRef(holder); useFusionTheme(ref);
          return React.createElement(React.Fragment, null,
            React.createElement(ResetInsightsSettings, { state, i18n }),
            ...models.map((provider) => React.createElement(ProviderCard, { key: provider.providerId, provider,
              localePreference: locale, progressDisplayStyle: "circle", progressColorBands: state.settings.progressColorBands,
              progressItemsBySurface: state.settings.progressItemsBySurface, progressThicknessPx: 8, progressSurface: "sidebar",
              usageHistoryModulesBySurface: state.settings.usageHistoryModulesBySurface, providerAccounts: state.providerAccounts,
              onOpen: () => {}, onRefresh: () => {} })),
            React.createElement(ProviderDetailPage, { provider: models[0], localePreference: locale, progressDisplayStyle: "circle",
              progressColorBands: state.settings.progressColorBands, progressItemsBySurface: state.settings.progressItemsBySurface,
              progressThicknessPx: 8, progressSurface: "fullPage", usageHistoryModulesBySurface: state.settings.usageHistoryModulesBySurface,
              providerAccounts: state.providerAccounts, onBack: () => {}, onRefresh: () => {} }),
            React.createElement(CommunityResetPanel, { i18n, store: { ...feed, preferences: { ...feed.preferences, mode: "in_app" } } }));
        }
        qa.renderer = ReactDOM.createRoot(holder); qa.renderer.render(React.createElement(Harness));
        let mount = 0;
        qa.remount = () => { qa.renderer.render(React.createElement(Harness, { key: ++mount })); };
        qa.stallNextPoll = () => { qa.slow = true; currentFeed = { ...currentFeed, caches: {} }; };
        qa.recheck = () => { broadcast(COMMUNITY_RESET_STORAGE_KEY, currentFeed, currentFeed); };
      }, { locale, theme, width, overrides: providerInsightsQaOverrides(), feed: communityResetQaStore() });
      const settings = page.locator("#insights-qa [data-reset-insights-settings]");
      const mode = settings.locator('[data-settings-material-select="community-reset-mode"] mdui-select');
      await mode.waitFor(); await page.waitForFunction(() => document.querySelector('#insights-qa [aria-busy="true"]') === null);
      assert.equal(await page.evaluate(() => window.__insightsQa.requests.length), 0);
      assert.equal(await page.locator('#insights-qa [data-community-resets="detail"] a[href="https://codex-reset.com/"]').count() > 0, true);
      assert.equal(await page.locator('#insights-qa [data-cursor-quota-pools]').count(), 1);
      const geometry = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, viewport: innerWidth,
        fields: [...document.querySelectorAll('#insights-qa [data-settings-material-select]')].map((node) => { const box = node.getBoundingClientRect(); return { left: box.left, right: box.right, width: box.width }; }) }));
      assert(geometry.doc <= geometry.viewport + 1, `overflow ${locale}/${theme}/${width}: ${JSON.stringify(geometry)}`);
      assert(geometry.fields.every((field) => field.left >= 0 && field.right <= width + 1));
      if (locale === locales[0] && theme === "light" && width === 1440) {
        async function select(field, value) {
          await settings.locator(':scope[aria-busy="false"]').waitFor();
          await field.locator('input:not(.hidden-input)').click();
          const option = field.locator(`mdui-menu-item[value="${value}"]`);
          await option.click();
          await settings.locator(':scope[aria-busy="false"]').waitFor();
          await field.locator("mdui-select").evaluate(async (element) => {
            const dropdown = element.shadowRoot.querySelector("mdui-dropdown");
            await dropdown.updateComplete;
            await Promise.all(dropdown.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined)));
          });
        }
        const communityField = settings.locator('[data-settings-material-select="community-reset-mode"]');
        await select(communityField, "desktop");
        await page.waitForFunction(() => window.__insightsQa.getFeed().preferences.mode === "in_app");
        assert.equal(await page.evaluate(() => window.__insightsQa.delivered.length), 0);
        assert.equal(await page.evaluate(() => window.__insightsQa.requests[0].active), true);
        assert.deepEqual(await page.evaluate(() => window.__insightsQa.requests[0].request.origins.sort()), ["https://codex-reset.com/*", "https://codex-resets.com/*"]);
        await select(communityField, "off");
        await page.evaluate(() => { window.__insightsQa.deny = false; });
        await select(communityField, "desktop");
        await page.waitForFunction(() => window.__insightsQa.getFeed().preferences.mode === "desktop");
        const pause = settings.locator(".reset-insights-settings__desktop mdui-checkbox");
        await pause.click();
        await page.waitForFunction(() => window.__insightsQa.getReset().preferences.communityPaused === true);
        assert.equal(await settings.locator(".reset-insights-settings__desktop mdui-button").evaluate((element) => element.disabled), true);
        await pause.click();
        await page.waitForFunction(() => window.__insightsQa.getReset().preferences.communityPaused === false);
        await settings.locator(".reset-insights-settings__desktop mdui-button").click();
        await page.waitForFunction(() => window.__insightsQa.delivered.length === 1);
        assert.deepEqual(await page.evaluate(() => window.__insightsQa.delivered), ["test"]);
        const grants = settings.locator('[data-settings-material-select="account-reset-card-mode"]');
        const requestCount = await page.evaluate(() => window.__insightsQa.requests.length);
        await select(grants, "on");
        await page.waitForFunction(() => window.__insightsQa.getReset().preferences.grantAccountKeys.length === 1);
        assert.equal(await page.evaluate(() => window.__insightsQa.requests.length), requestCount, "Already-granted permission is reused");
        await select(grants, "paused");
        await page.waitForFunction(() => window.__insightsQa.getReset().preferences.accountPaused === true);
        await page.evaluate(() => { window.__insightsQa.reject = true; });
        await select(communityField, "off");
        assert.equal(await page.evaluate(() => window.__insightsQa.getFeed().preferences.mode), "desktop");
        await settings.locator('[data-settings-save-status="error"]').waitFor();
        await page.evaluate(() => window.__insightsQa.recheck());
        await page.waitForTimeout(60);
        assert.equal(await settings.locator('[data-settings-save-status="error"]').count(), 1, "Background reads cannot erase a failed explicit write");
        await page.evaluate(() => { window.__insightsQa.reject = false; });
        await settings.locator('[data-settings-save-status="error"] button').click();
        await page.waitForFunction(() => window.__insightsQa.getFeed().preferences.mode === "off");
        await settings.locator('[data-settings-save-status="saved"]').waitFor();
        await page.evaluate(() => { window.__insightsQa.conflictSource = true; });
        await settings.locator(".reset-insights-settings__source mdui-checkbox").nth(1).click();
        await settings.locator('[data-settings-save-status="error"]').waitFor();
        await settings.locator('[data-settings-save-status="error"] button').click();
        await page.waitForFunction(() => window.__insightsQa.getFeed().preferences.sources.length === 0);
        for (const index of [0, 1]) {
          await settings.locator(".reset-insights-settings__source mdui-checkbox").nth(index).click();
          await page.waitForFunction((count) => window.__insightsQa.getFeed().preferences.sources.length === count, index + 1);
        }
        await page.evaluate(() => { window.__insightsQa.failRead = true; window.__insightsQa.feedReadFailure = true; window.__insightsQa.remount(); });
        await settings.locator('[data-settings-save-status="error"]').waitFor();
        await settings.locator(':scope[aria-busy="false"]').waitFor();
        await page.locator('#insights-qa [data-community-resets="unavailable"]').waitFor();
        await page.evaluate(() => { window.__insightsQa.failRead = false; window.__insightsQa.feedReadFailure = false; });
        await settings.locator('[data-settings-save-status="error"] button').click();
        await page.waitForFunction(() => !document.querySelector('#insights-qa [data-settings-save-status="error"]'));
        await select(communityField, "desktop");
        await page.waitForFunction(() => window.__insightsQa.getFeed().preferences.mode === "desktop");
        await page.evaluate(() => { window.__insightsQa.reject = true; });
        await settings.locator(".reset-insights-settings__desktop mdui-checkbox").click();
        await settings.locator('[data-settings-save-status="error"]').waitFor();
        assert.equal(await page.evaluate(() => window.__insightsQa.getReset().preferences.communityPaused), false);
        await page.evaluate(() => { window.__insightsQa.reject = false; });
        await settings.locator('[data-settings-save-status="error"] button').click();
        await page.waitForFunction(() => window.__insightsQa.getReset().preferences.communityPaused === true);
        await page.evaluate(() => { window.__insightsQa.state.providers.find((provider) => provider.providerId === "codex-personal-page").codexLocal.accountVerified = false; window.__insightsQa.remount(); });
        await settings.locator(':scope[aria-busy="false"]').waitFor();
        assert.equal(await settings.locator('[data-settings-material-select="account-reset-card-mode"] mdui-menu-item[value="on"]').count(), 0);
        await settings.locator('[data-account-reset-unavailable]').waitFor({ state: "visible" });
        await select(communityField, "off");
        await page.evaluate(() => window.__insightsQa.stallNextPoll());
        await communityField.locator('input:not(.hidden-input)').click();
        await communityField.locator('mdui-menu-item[value="in_app"]').click();
        await page.waitForFunction(() => window.__insightsQa.slowCount > 0);
        await settings.locator(':scope[aria-busy="false"]').waitFor();
        assert.equal(await mode.evaluate((element) => element.disabled), false, "Slow polling must not disable the Off command");
        await select(communityField, "off");
        await page.waitForFunction(() => window.__insightsQa.aborted > 0 && window.__insightsQa.getFeed().preferences.mode === "off");
        await page.waitForTimeout(60);
        assert.equal(await mode.evaluate((element) => element.value), "off", "The cancelled refresh cannot restore On");
      }
      if (["en", "zh-CN", "ar"].includes(locale) && [1440, 390].includes(width)) {
        await settings.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-settings.png`) });
        await page.locator('#insights-qa [data-community-resets="detail"]').last().screenshot({ path: path.join(output, `${locale}-${theme}-${width}-community.png`) });
        await page.locator('#insights-qa [data-cursor-quota-pools]').screenshot({ path: path.join(output, `${locale}-${theme}-${width}-cursor.png`) });
      }
      results.push({ locale, theme, width, overflow: false });
      console.log(`provider insights ${locale}/${theme}/${width}: passed`);
    } finally { await page.close(); }
  }
  assert.equal(errors.length, 0, JSON.stringify(errors)); assert.equal(remote.length, 0, JSON.stringify(remote));
  await writeFile(path.join(output, "result.json"), JSON.stringify({ status: "passed", browser: values.browser, synthetic: true, results, errors, externalRequests: remote }, null, 2));
  console.log(`Evidence: ${output}`);
} catch (error) {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ status: "failed", synthetic: true, results, errors, externalRequests: remote, error: String(error) }, null, 2));
  throw error;
} finally { await context?.close(); await browser?.close(); await server.close(); }
