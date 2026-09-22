import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const output = path.resolve("tmp/output/playwright/shared-ui/keyboard");
const server = await startSourceQaServer();
let browser;
const results = [];
const pageErrors = [];
try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" });
  for (const locale of SUPPORTED_RDP_CAPTURE_LOCALES) {
    for (const [width, theme] of [[320, "dark"], [430, "light"]]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
      page.on("pageerror", (error) => pageErrors.push({ locale, width, message: error.message }));
      try {
        await page.goto(`${server.baseUrl}/src/popup/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}`);
        await page.locator(".popup-shell").waitFor();
        await page.evaluate(async ({ width, theme }) => {
          const { updateAppState } = await import("/src/shared/storage.ts");
          await updateAppState((state) => ({ ...state, settings: { ...state.settings,
            popupSizePreset: width === 320 ? "compact" : "balanced", motionMode: "reduced", themeMode: theme,
          } }));
        }, { width, theme });
        await page.reload();
        const trigger = page.locator('[data-popup-toggle-theme-mode="true"]');
        const menu = page.locator('.popup-header__theme-mode-menu');
        const options = menu.getByRole("menuitemradio");
        await trigger.waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.dataset.popupSizePreset), width === 320 ? "compact" : "balanced");
        assert(await page.evaluate(() => document.documentElement.getBoundingClientRect().width <= window.innerWidth + 1));
        await trigger.focus();
        await page.keyboard.press("Enter");
        await options.first().waitFor({ state: "visible" });
        const focusIs = async (locator) => assert(await locator.evaluate((element) => element === document.activeElement), `Focus mismatch ${locale}/${width}`);
        await focusIs(options.nth(0));
        await page.keyboard.press("ArrowDown");
        await focusIs(options.nth(1));
        await page.keyboard.press("End");
        await focusIs(options.nth(3));
        await page.keyboard.press("Home");
        await focusIs(options.nth(0));
        await page.keyboard.press("ArrowUp");
        await focusIs(options.nth(3));
        await page.keyboard.press("Escape");
        await focusIs(trigger);
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await page.keyboard.press("ArrowDown");
        await focusIs(options.nth(0));
        await page.keyboard.press("Tab");
        await focusIs(page.locator('[data-popup-open-dashboard-tab="true"]'));
        await trigger.focus();
        await page.keyboard.press("ArrowUp");
        await focusIs(options.nth(3));
        await page.keyboard.press("Shift+Tab");
        await focusIs(page.locator('[data-popup-refresh="true"]'));
        await trigger.focus();
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => document.querySelector('[data-popup-toggle-theme-mode]')?.getAttribute("data-theme-mode") === "dark");
        await focusIs(trigger);
        if (theme === "light") {
          await page.keyboard.press("Enter");
          await page.keyboard.press("Home");
          await page.keyboard.press("Enter");
          await page.waitForFunction(() => document.querySelector('[data-popup-toggle-theme-mode]')?.getAttribute("data-theme-mode") === "light");
          await focusIs(trigger);
        }
        await page.keyboard.press("Enter");
        const layout = await menu.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
            width: window.innerWidth, height: window.innerHeight,
            clipped: Array.from(element.querySelectorAll("button")).filter((item) => item.scrollWidth > item.clientWidth + 2).length,
            direction: document.documentElement.dir,
            resolvedTheme: document.documentElement.dataset.themeResolved,
          };
        });
        assert(layout.left >= -1 && layout.right <= width + 1 && layout.top >= 0 && layout.bottom <= layout.height, JSON.stringify(layout));
        assert.equal(layout.clipped, 0);
        assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
        assert.equal(layout.resolvedTheme, theme);
        await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-menu.png`) });
        await page.mouse.click(2, 2);
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await page.goto(`${server.baseUrl}/src/sidepanel/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#dashboard`);
        await page.locator(".dashboard-section").waitFor();
        const expectedCopy = await page.evaluate(async ({ locale, theme }) => {
          const { default: React } = await import("/node_modules/.vite/deps/react.js");
          const { default: ReactDOM } = await import("/node_modules/.vite/deps/react-dom_client.js");
          const { createRuntimeI18n } = await import("/src/shared/i18n.ts");
          const { UsageProgress } = await import("/src/shared/components/UsageProgress.tsx");
          const { CustomSourceProgressItemList } = await import("/src/shared/components/CustomSourceProgressItemList.tsx");
          const { ProviderProgressItemList } = await import("/src/shared/components/ProviderProgressItemList.tsx");
          const { createDefaultProgressItemsBySurface } = await import("/src/shared/display-preferences.ts");
          const { buildUsageProgressLocalizedCopy } = await import("/src/shared/usage-progress-localized-copy.ts");
          const { buildNavigationLocalizedCopy } = await import("/src/shared/navigation-localized-copy.ts");
          const { Toast } = await import("/src/sidepanel/components/Toast.tsx");
          const { ProviderCarousel } = await import("/src/sidepanel/components/ProviderCarousel.tsx");
          document.querySelector("#root").hidden = true;
          document.documentElement.dataset.themeResolved = theme;
          document.documentElement.dataset.motionResolved = "reduced";
          const holder = document.createElement("main");
          holder.id = "shared-controls-qa";
          holder.style.cssText = "margin:8px;display:grid;gap:16px;min-width:0";
          document.body.append(holder);
          const h = React.createElement;
          const i18n = createRuntimeI18n(locale);
          const copy = buildUsageProgressLocalizedCopy(locale);
          const navigation = buildNavigationLocalizedCopy(i18n);
          const listProps = { displayStyle: "line", i18n, progressColorBands: [], progressItemsBySurface: createDefaultProgressItemsBySurface(), progressThicknessPx: 10, surface: "popup" };
          const provider = { providerId: "codex-personal-page", providerLabel: "Synthetic QA", quotaWindow: "Monthly", quotaUnit: "requests", used: 12, remaining: null, total: null,
            resetAt: null, resetLabel: null, usageSummary: null, usageWindows: [], usageBalances: [], tone: "neutral", syncStatus: "ok", permissionStatus: "granted", currentSourceStateKind: "ready", displayTone: "neutral" };
          const source = { sourceId: "custom:qa", label: "Synthetic QA", progressItems: [{ id: "primary", kind: "primary_quota", sourceId: "custom:qa", sourceLabel: "Synthetic QA", label: "Synthetic QA", quotaUnit: "jobs", used: null, remaining: null, total: 3000, resetAt: null, resetLabel: null, detail: null, tone: "neutral", availability: "value_only" }] };
          ReactDOM.createRoot(holder).render(h(React.Fragment, null,
            h(UsageProgress, { used: null, total: null, tone: "neutral", label: "Synthetic QA", i18n }),
            ...["circle", "circle-soft", "circle-gauge"].map((displayStyle) => h(UsageProgress, { key: displayStyle, used: null, total: null, tone: "neutral", label: "Synthetic QA", displayStyle, i18n })),
            h(ProviderProgressItemList, { ...listProps, provider }),
            h(CustomSourceProgressItemList, { ...listProps, source }),
            h(Toast, { i18n, tone: "success", title: "Synthetic QA", message: "Synthetic QA", onDismiss: () => { window.__dismissedQaToast = true; } }),
            h(ProviderCarousel, { i18n, textDirection: locale === "ar" ? "rtl" : "ltr", ariaLabel: "Synthetic QA", items: [
              { id: "a", label: "Long synthetic provider title for layout coverage", content: h("p", null, "Synthetic QA A") },
              { id: "b", label: "Synthetic QA B", content: h("p", null, "Synthetic QA B") },
            ] }),
          ));
          return { unknown: copy.unknown, percentageUnavailable: copy.percentageUnavailable, dismiss: navigation.dismiss, next: navigation.carousel.nextProvider };
        }, { locale, theme });
        await page.locator("#shared-controls-qa .toast").waitFor();
        assert.equal(await page.locator("#shared-controls-qa .usage-progress__value").textContent(), expectedCopy.unknown);
        assert.equal(await page.locator("#shared-controls-qa [role=progressbar]").first().getAttribute("aria-valuetext"), expectedCopy.percentageUnavailable);
        await page.getByRole("button", { name: expectedCopy.dismiss, exact: true }).click();
        assert(await page.evaluate(() => window.__dismissedQaToast === true));
        await page.getByRole("button", { name: expectedCopy.next, exact: true }).click();
        assert.equal(await page.locator("#shared-controls-qa [data-provider-carousel]").getAttribute("data-provider-carousel-active-id"), "b");
        await page.evaluate(async () => {
          await Promise.all(document.getAnimations().filter((animation) =>
            Number.isFinite(animation.effect?.getComputedTiming().endTime),
          ).map((animation) => animation.finished.catch(() => undefined)));
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const controlLayout = await page.locator("#shared-controls-qa").evaluate((element) => ({
          overflow: element.scrollWidth - element.clientWidth,
          clipped: Array.from(element.querySelectorAll("button,.usage-progress__ring-value,.usage-progress-ring__value")).filter((item) => item.getBoundingClientRect().width > 0 && item.scrollWidth > item.clientWidth + 2).map((item) => item.className),
          ringOverlaps: Array.from(element.querySelectorAll(".usage-progress__ring-value,.usage-progress-ring__value")).filter((item) => {
            const text = item.getBoundingClientRect();
            const ring = item.parentElement.getBoundingClientRect();
            const inset = item.classList.contains("usage-progress-ring__value") ? 17 : 9;
            return text.left < ring.left + inset || text.right > ring.right - inset;
          }).length,
        }));
        assert(controlLayout.overflow <= 2, JSON.stringify(controlLayout));
        assert.deepEqual(controlLayout.clipped, []);
        assert.equal(controlLayout.ringOverlaps, 0, JSON.stringify(controlLayout));
        await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-controls.png`), fullPage: true });
        results.push({ locale, width, theme, focusChecks: 12, layout, controlLayout });
        console.log(`shared-ui keyboard ${locale}/${theme}/${width}: passed`);
      } catch (error) {
        await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-failure.png`) });
        throw error;
      } finally {
        await page.close();
      }
    }
  }
  assert.deepEqual(pageErrors, []);
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ results, pageErrors }, null, 2));
  await browser?.close();
  await server.close();
}
