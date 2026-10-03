import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";

const root = path.resolve("tmp/output/playwright/cross-surface-motion");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await startSourceQaServer();
const browserName = process.argv.includes("--browser=firefox") ? "firefox" : "chromium";
const browser = await (browserName === "firefox" ? firefox : chromium).launch({ headless: true,
  ...(browserName === "firefox" ? {} : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
});
const results = [], errors = [], remoteRequests = [];
const frames = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const settle = (page) => page.waitForFunction(() => document.querySelectorAll("[data-motion-active]").length === 0);
try {
  for (const system of ["no-preference", "reduce"])
    for (const mode of ["full", "system", "expressive", "reduced"]) {
      const page = await browser.newPage({ viewport: { width: 900, height: 900 }, reducedMotion: system });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) => {
        const url = route.request().url();
        if (url.startsWith(server.baseUrl) || url.startsWith("data:")) return route.continue();
        remoteRequests.push(url);
        return route.abort();
      });
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?surface=full-page#settings`);
      await page.locator(".settings-category-layout").waitFor();
      await page.evaluate(async ({ mode }) => {
        const { default: React } = await import("/__qa/react.js");
        const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
        const { ProviderProgressItemList } = await import("/src/shared/components/ProviderProgressItemList.tsx");
        const { MotionDetails } = await import("/src/shared/components/MotionDetails.tsx");
        const { ApiGatewayDeploymentSelector } = await import("/src/shared/components/ApiGatewayDeploymentSelector.tsx");
        const { UsageHistorySvg } = await import("/src/shared/components/UsageHistoryCharts.tsx");
        const { createDefaultProgressItemsBySurface } = await import("/src/shared/display-preferences.ts");
        const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
        const { DEFAULT_THEME_SETTINGS, startThemeSettingsSync } = await import("/src/shared/theme.ts");
        const { useMotionLayout, useSurfaceMotion } = await import("/src/shared/use-motion-effects.ts");
        const h = React.createElement;
        document.querySelector("#root").hidden = true;
        window.__stopMotionTheme = startThemeSettingsSync({ ...DEFAULT_THEME_SETTINGS, motionMode: mode, themeMode: "light" }, document.documentElement, window);
        const host = document.createElement("div");
        document.body.append(host);
        const now = Date.now();
        const resetAt = new Date(now + 86400000).toISOString();
        const baseline = {
          providerId: "codex-personal-page", providerLabel: "Codex", quotaUnit: "percent", quotaWindow: "rolling",
          remaining: 80, used: 20, total: 100, resetAt, resetLabel: "Weekly", syncSource: "page_parse",
          syncStatus: "ok", displayTone: "neutral", lastSuccessAt: new Date(now).toISOString(),
          usageWindows: [], usageBalances: [],
        };
        function Fixture() {
          const [provider, setProvider] = React.useState(baseline);
          const [account, setAccount] = React.useState("A");
          const [style, setStyle] = React.useState("line");
          const [items, setItems] = React.useState(["A", "B", "C"]);
          const [open, setOpen] = React.useState(false);
          const [chartValue, setChartValue] = React.useState(5);
          const ref = React.useRef(null), list = React.useRef(null);
          useSurfaceMotion(ref, "fixture");
          useMotionLayout(list, items.join(","));
          Object.assign(window, {
            __progressPatch: (patch) => setProvider((value) => ({ ...value, lastSuccessAt: new Date(Date.now()).toISOString(), ...patch })),
            __progressReset: () => setProvider({ ...baseline, lastSuccessAt: new Date(Date.now()).toISOString() }),
            __account: setAccount, __style: setStyle, __order: setItems, __details: setOpen, __chart: setChartValue,
          });
          const data = { dates: ["2026-10-01"], series: [{ id: "gpt", label: "GPT", values: [chartValue], total: chartValue }], dailyTotals: [chartValue], maximumDailyTotal: chartValue, total: chartValue };
          return h("main", { ref, className: "app-shell", "data-motion-owned": "", style: { maxWidth: 800, margin: "auto" } },
            h("h1", null, "Synthetic motion regression"),
            h("div", { id: "quota-fixture", "data-motion-group": "" }, h(ProviderProgressItemList, {
              provider, accountId: account, displayStyle: style, i18n: createRuntimeI18n("en"), progressColorBands: [],
              progressItemsBySurface: createDefaultProgressItemsBySurface(), progressThicknessPx: 10, surface: "fullPage",
            })),
            h("div", { ref: list, id: "reorder-fixture", style: { display: "grid", gap: 8 } },
              ...items.map((id) => h("button", { key: id, id: `row-${id}`, "data-motion-key": id }, id))),
            h(MotionDetails, { id: "details-fixture", summary: "Deployments", open, onOpenChange: setOpen },
              h(ApiGatewayDeploymentSelector, { activeDeploymentId: account, displayLabel: account,
                summaryLabel: "Deployment", options: [{ id: "A", label: "Deployment A" }, { id: "B", label: "Deployment B" }], onSelectDeployment: setAccount }),
              h("input", { id: "retained-draft", defaultValue: "retained" })),
            h(UsageHistorySvg, { compact: true, data, kind: "area", label: "Synthetic usage", locale: "en", unit: "turns" }));
        }
        window.__motionRoot = ReactDOM.createRoot(host);
        window.__progressStyleReads = 0;
        window.__progressStyleCaptures = [];
        window.__progressLayoutReads = [];
        window.__progressKeyframes = [];
        const computedStyle = window.getComputedStyle;
        window.getComputedStyle = (...args) => {
          const style = computedStyle(...args);
          if (new Error().stack.includes("/src/shared/use-progress-motion.ts")) {
            window.__progressStyleReads++;
            window.__progressStyleCaptures.push({ width: style.width, dash: style.strokeDasharray,
              percent: style.getPropertyValue(args[0].matches(".usage-progress__ring")
                ? "--usage-progress-percent" : "--usage-progress-ring-percent").trim() });
          }
          return style;
        };
        const bounds = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = function (...args) {
          const rect = bounds.apply(this, args);
          if (new Error().stack.includes("/src/shared/use-progress-motion.ts")) window.__progressLayoutReads.push(rect.width);
          return rect;
        };
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (keyframes, options) {
          if (this.closest("#quota-fixture")) window.__progressKeyframes.push(structuredClone(keyframes));
          return animate.call(this, keyframes, options);
        };
        window.__motionRoot.render(h(Fixture));
        window.scrollTo(0, 0);
      }, { mode });
      const reduced = mode === "reduced" || mode === "system" && system === "reduce";
      await settle(page);
      const initialProgressStyleReads = await page.evaluate(() => window.__progressStyleReads);
      assert.equal(initialProgressStyleReads, 0, "Initial/static progress must not force computed-style reads");
      assert.equal(await page.evaluate(() => window.__progressLayoutReads.length), 0, "Initial/static progress must not force bounds reads");
      const progress = [];
      for (const style of ["line", "circle", "circle-soft", "circle-gauge"]) {
        await page.evaluate((style) => { window.__style(style); window.__progressReset(); window.__account("A"); }, style);
        await frames(page);
        const readsBefore = await page.evaluate(() => ({ styles: window.__progressStyleReads, bounds: window.__progressLayoutReads.length }));
        await page.evaluate(() => window.__progressPatch({ remaining: 65, used: 35 }));
        await frames(page);
        assert.deepEqual(await page.evaluate(() => ({ styles: window.__progressStyleReads, bounds: window.__progressLayoutReads.length })), readsBefore,
          `${style}: a non-interrupted update must not force style or bounds reads`);
        const mid = await page.locator("#quota-fixture").evaluate((element) => ({
          value: element.querySelector('[role="progressbar"]').getAttribute("aria-valuenow"),
          text: element.textContent,
          animations: element.querySelectorAll('[data-motion-active="progress"]').length,
          frames: [...element.querySelectorAll('[data-motion-active="progress"]')].flatMap((node) => node.getAnimations().map((animation) => ({ time: animation.currentTime, duration: animation.effect.getTiming().duration, keyframes: animation.effect.getKeyframes() }))),
        }));
        assert.equal(mid.value, "65");
        assert(mid.text.includes("65"), "Numeric label is current during interpolation");
        assert.equal(mid.animations > 0, !reduced, JSON.stringify({ mode, system, style, mid }));
        let retarget = null;
        if (!reduced) {
          await page.evaluate(() => window.__progressPatch({ remaining: 55, used: 45 }));
          await frames(page);
          assert.equal(await page.locator('#quota-fixture [role="progressbar"]').getAttribute("aria-valuenow"), "55");
          retarget = await page.evaluate(() => ({ reads: window.__progressStyleReads, bounds: window.__progressLayoutReads.length,
            capture: window.__progressStyleCaptures.at(-1), parentWidth: window.__progressLayoutReads.at(-1),
            frames: window.__progressKeyframes.at(-1) }));
          assert.equal(retarget.reads - readsBefore.styles, 1, `${style}: capture the interrupted fill exactly once`);
          assert.equal(retarget.bounds - readsBefore.bounds, style === "line" ? 1 : 0, `${style}: bounds are needed only for an interrupted line`);
          if (style === "line") {
            assert.equal(retarget.frames[0].width, `${parseFloat(retarget.capture.width) / retarget.parentWidth * 100}%`);
          } else if (style === "circle-gauge") {
            assert.equal(retarget.frames[0].strokeDasharray, retarget.capture.dash);
          } else {
            assert.equal(retarget.frames[0][style === "circle" ? "--usage-progress-percent" : "--usage-progress-ring-percent"], retarget.capture.percent);
          }
        }
        await settle(page);
        for (const [name, patch] of [
          ["unknown", { remaining: null, used: null }],
          ["failure", { remaining: 40, used: 60, syncStatus: "error" }],
          ["stale", { remaining: 40, used: 60, lastSuccessAt: new Date(Date.now() - 2 * 3600000).toISOString() }],
          ["reset", { remaining: 100, used: 0, resetAt: new Date(Date.now() + 2 * 86400000).toISOString() }],
        ]) {
          await page.evaluate(() => window.__progressReset()); await frames(page);
          await page.evaluate((patch) => window.__progressPatch(patch), patch); await frames(page);
          assert.equal(await page.locator('#quota-fixture [data-motion-active="progress"]').count(), 0, name);
        }
        await page.evaluate(() => { window.__progressReset(); window.__account("A"); }); await frames(page);
        await page.evaluate(() => { window.__account("B"); window.__progressPatch({ remaining: 35, used: 65 }); }); await frames(page);
        assert.equal(await page.locator('#quota-fixture [data-motion-active="progress"]').count(), 0, "Account switch is immediate");
        progress.push({ style, mid, retarget, invalidTransitions: "immediate" });
      }
      const interruptedProgressStyleReads = await page.evaluate(() => window.__progressStyleReads);
      assert.equal(interruptedProgressStyleReads, reduced ? 0 : 4, "Each animated style captures exactly one interrupted visual position");
      await page.locator("#row-A").focus();
      await page.evaluate(() => window.__order(["C", "B", "A"])); await frames(page);
      assert.equal(await page.evaluate(() => document.activeElement.id), "row-A");
      const reordered = await page.locator("#reorder-fixture").evaluate((element) => element.querySelectorAll('[data-motion-active="reorder"]').length);
      assert.equal(reordered > 0, !reduced);
      await page.evaluate(() => window.__order(["A", "C", "B"])); await frames(page);
      await page.evaluate(() => window.__order(["B", "A", "C"])); await frames(page);
      assert.equal(await page.evaluate(() => document.activeElement.id), "row-A");
      await settle(page);
      await page.locator("#details-fixture > summary").click(); await settle(page);
      await page.locator("#retained-draft").fill("still retained");
      await page.locator('#details-fixture [role="combobox"]').click();
      await page.locator('.api-gateway-metering-deployment__menu').waitFor();
      const menu = await page.locator('.api-gateway-metering-deployment__menu').boundingBox();
      assert(menu.x >= 0 && menu.x + menu.width <= 901);
      await page.evaluate(() => window.__details(false)); await frames(page);
      assert.equal(await page.locator('.api-gateway-metering-deployment__menu').count(), 0, "Portals close with logical disclosure");
      await page.evaluate(() => window.__details(true)); await settle(page);
      assert.equal(await page.locator("#retained-draft").inputValue(), "still retained");
      await page.evaluate(() => window.__chart(12)); await frames(page);
      const chart = await page.locator(".usage-history-chart").evaluate((node) => ({
        label: node.querySelector(".usage-history-chart__focus-target").getAttribute("aria-label"),
        active: node.getAnimations().length,
      }));
      assert(chart.label.includes("12"));
      assert.equal(chart.active > 0, !reduced);
      await settle(page);
      await page.evaluate(() => { window.__progressReset(); window.__account("A"); }); await frames(page);
      await page.evaluate(() => window.__progressPatch({ remaining: 60, used: 40 })); await frames(page);
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await settle(page);
      assert.equal(await page.locator("html").getAttribute("data-motion-suspended"), "true");
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForTimeout(50);
      assert.equal(await page.locator("[data-motion-active]").count(), 0, "Background return does not replay old animations");
      await page.screenshot({ path: path.join(output, `${system}-${mode}.png`), fullPage: true });
      await page.evaluate(() => { window.__motionRoot.unmount(); window.__stopMotionTheme(); });
      results.push({ mode, system, progress, initialProgressStyleReads, interruptedProgressStyleReads,
        reordered, chart, background: "settled", drafts: "retained", portals: "closed" });
      await page.close();
      console.log(`PASS ${system}/${mode}`);
    }
  assert.deepEqual(errors, []);
  assert.deepEqual(remoteRequests, []);
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ browserName, results, errors, remoteRequests }, null, 2));
  await browser.close();
  await server.close();
  console.log(`Cross-surface evidence: ${output}`);
}
