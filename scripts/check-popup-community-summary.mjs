import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, firefox } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { communityResetQaStore } from "./lib/provider-insights-qa-fixtures.mjs";

const { values } = parseArgs({ options: { quick: { type: "boolean" }, browser: { type: "string", default: "chromium" } } });
assert(["chromium", "firefox"].includes(values.browser));
const root = path.resolve(".local/qa/provider-insights/826"); await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, `${values.browser}-render-`));
const server = await startSourceQaServer(), cases = [], errors = [], remote = [];
let browser, context, passed = false;
try {
  browser = values.browser === "firefox" ? await firefox.launch({ headless: true })
    : await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chrome" }) });
  context = await browser.newContext({ timezoneId: "Australia/Adelaide", reducedMotion: "reduce" });
  for (const locale of values.quick ? ["zh-CN"] : ["zh-CN", "en", "ar"])
    for (const theme of values.quick ? ["light"] : ["light", "dark"])
      for (const width of values.quick ? [344] : [344, 392, 520]) {
        const page = await context.newPage(); await page.setViewportSize({ width, height: 900 }); await page.emulateMedia({ colorScheme: theme });
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/*", (route) => {
          if (route.request().url().startsWith(server.baseUrl)) return route.continue();
          remote.push(route.request().url()); return route.abort();
        });
        try {
          await page.goto(`${server.baseUrl}/src/popup/index.html?app-locale=${locale}`);
          await page.evaluate(async ({ locale, theme, width, feed }) => {
            const { default: React } = await import("/__qa/react.js");
            const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
            const { createRuntimeI18n, syncRuntimeLocaleAttributes } = await import("/src/shared/i18n.ts");
            const { createDefaultAppState } = await import("/src/shared/production-state.ts");
            const { getProviderViewModel } = await import("/src/shared/provider-view-models.ts");
            const { CommunityResetPanel } = await import("/src/shared/components/CommunityResetPanel.tsx");
            const { CommunityResetPopupSummary } = await import("/src/shared/components/CommunityResetPopupSummary.tsx");
            const { ProviderUsageComposition } = await import("/src/shared/components/ProviderUsageComposition.tsx");
            const i18n = createRuntimeI18n(locale), state = createDefaultAppState();
            syncRuntimeLocaleAttributes(i18n, document.documentElement, document.body);
            document.documentElement.dataset.themeResolved = theme; document.documentElement.dataset.motionResolved = "reduced";
            document.documentElement.dataset.popupSizePreset = width === 344 ? "compact" : width === 392 ? "balanced" : "wide";
            document.getElementById("root").style.display = "none";
            const holder = document.createElement("main"); holder.id = "popup-summary-qa"; holder.className = "popup-shell"; holder.style.padding = "16px"; document.body.append(holder);
            const card = document.createElement("div"); card.className = "popup-provider-card"; card.style.padding = "16px"; holder.append(card);
            const renderer = ReactDOM.createRoot(card), now = Date.now();
            const baseline = structuredClone(feed); baseline.preferences.mode = "in_app";
            baseline.caches.status.fragment.events = []; baseline.caches.resets = structuredClone(baseline.caches.status);
            baseline.caches.timeline.fragment.events[0].state = "unknown";
            for (const cache of Object.values(baseline.caches)) cache.expiresAt = new Date(now - 1).toISOString();
            let mount = 0;
            window.__popupSummaryQa = { render(scenario = "stale", legacy = false) {
              const store = structuredClone(baseline);
              for (const cache of Object.values(store.caches)) { cache.failure = null; if (scenario !== "stale") cache.expiresAt = new Date(Date.now() + 600_000).toISOString(); }
              const entry = store.caches.timeline.fragment.events[0];
              if (scenario === "reported") entry.state = "reported";
              if (scenario === "scheduled") { entry.state = "scheduled"; entry.scheduledFor = new Date(now - 3600_000).toISOString(); }
              if (scenario === "grant" || scenario === "credits") entry.kind = scenario;
              if (scenario === "conflict") store.caches.status.fragment.events = [{ ...entry, source: "codex-resets", state: "reported" }];
              if (scenario === "partial") store.caches.status.failure = "offline";
              if (scenario === "denied") for (const cache of Object.values(store.caches)) cache.failure = "permission";
              if (scenario === "empty" || scenario === "forecast") for (const cache of Object.values(store.caches)) cache.fragment.events = [];
              const props = { i18n, store, now, detailUrl: "#provider-detail/codex-personal-page", external: false, failed: scenario === "failed" };
              renderer.render(React.createElement(React.Fragment, { key: ++mount },
                ...(legacy ? [React.createElement(ProviderUsageComposition, { provider: getProviderViewModel(state, "codex-personal-page"), i18n, compact: true }),
                  React.createElement(CommunityResetPanel, { i18n, store, compact: true })] : [React.createElement(CommunityResetPopupSummary, props)])));
            } };
            window.__popupSummaryQa.render("stale", true);
          }, { locale, theme, width, feed: communityResetQaStore() });
          await page.locator('[data-community-resets="compact"]').waitFor();
          const before = await page.locator('#popup-summary-qa > .popup-provider-card').evaluate((node) => node.getBoundingClientRect().height);
          await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-before.png`), fullPage: true });
          const scenarios = values.quick ? ["stale"] : ["stale", "fresh", "reported", "scheduled", "grant", "credits", "conflict", "partial", "denied", "empty", "forecast", "failed"];
          for (const scenario of scenarios) {
            await page.evaluate((scenario) => window.__popupSummaryQa.render(scenario), scenario);
            const summary = page.locator('[data-community-resets="popup"]'); await summary.waitFor();
            await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const layout = await summary.evaluate((node) => ({ height: node.parentElement.getBoundingClientRect().height, overflow: document.documentElement.scrollWidth - innerWidth,
              clipped: node.scrollWidth > node.clientWidth + 1, health: node.dataset.communityHealth, sources: [...node.querySelectorAll('.community-popup__sources a')].map((a) => a.href),
              empty: !!node.querySelector('.community-popup__empty'), hasEvent: !!node.querySelector('.community-popup__event'), dir: document.documentElement.dir }));
            assert(layout.overflow <= 1 && !layout.clipped, JSON.stringify({ locale, theme, width, scenario, layout }));
            assert.equal(new Set(layout.sources).size, layout.sources.length);
            assert.equal(layout.dir, locale === "ar" ? "rtl" : "ltr");
            assert.equal(layout.health, ({ stale: "stale", partial: "partial", denied: "permission", failed: "unavailable" })[scenario] ?? "fresh");
            assert.equal(layout.empty, ["empty", "forecast", "failed"].includes(scenario));
            if (scenario === "stale" && locale === "zh-CN") assert(layout.height <= before * 0.7, `Height target failed: ${before} -> ${layout.height}`);
            const info = summary.locator('.community-popup__info button');
            if (await info.count()) {
              assert.equal(await page.locator('.community-popup__tooltip').isVisible(), false, "Closed timestamp tooltip leaked into the Popup");
              await info.focus();
              const tooltip = page.locator('[role="tooltip"][data-open="true"][data-positioned="true"]'); await tooltip.waitFor();
              const box = await tooltip.boundingBox();
              assert(box.x >= 0 && box.x + box.width <= width + 1 && box.y >= 0 && box.y + box.height <= 900);
              assert((await tooltip.textContent()).includes("UTC"));
              await page.keyboard.press("Tab");
              await tooltip.waitFor({ state: "hidden" });
              await info.hover(); await tooltip.waitFor(); await page.mouse.move(0, 0); await tooltip.waitFor({ state: "hidden" });
              await page.evaluate(() => document.activeElement?.blur());
            }
            await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-${scenario}.png`), fullPage: true });
            cases.push({ locale, theme, width, scenario, baselineHeight: before, layout });
          }
        } finally { await page.close(); }
      }
  assert.deepEqual(errors, []); assert.deepEqual(remote, []); passed = true;
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ passed, browser: values.browser, cases, errors, remote, synthetic: true }, null, 2));
  await context?.close(); await browser?.close(); await server.close();
  console.log(`Popup summary evidence: ${output}`);
}
