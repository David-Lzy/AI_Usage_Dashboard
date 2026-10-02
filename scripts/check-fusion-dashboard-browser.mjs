import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const arg = (name) =>
  process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
assert(arg("--extension"), "Pass --extension=<isolated Chrome build>");
const extension = path.resolve(arg("--extension"));
assert(
  !extension.startsWith(path.resolve("dist") + path.sep),
  "Do not use a loaded build",
);
const locales = arg("--locales")?.split(",") ?? SUPPORTED_RDP_CAPTURE_LOCALES;
const root = path.resolve("tmp/output/playwright/fusion-dashboard");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const loader = await createServer({
  configFile: false,
  cacheDir: path.join(output, "vite-cache"),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: "custom",
});
let fixture;
try {
  const seed = await loader.ssrLoadModule(
    "/src/sidepanel/store-screenshot-seed.ts",
  );
  fixture = JSON.parse(
    JSON.stringify(
      seed.getStoreScreenshotSeedPresetDefinition("toolbar-first-quick-glance")
        .appState,
    ),
  );
} finally {
  await loader.close();
}
const report = { cases: [], errors: [], remoteRequests: [] };
const context = await chromium.launchPersistentContext(
  path.join(output, "profile"),
  {
    headless: true,
    offline: true,
    reducedMotion: "reduce",
    timezoneId: "UTC",
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : { channel: "chromium" }),
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
  },
);
const stateKey = "ai-usage-dashboard.app-state";
async function assertLayout(page) {
  const result = await page.evaluate(() => {
    const visible = (element) =>
      element.getBoundingClientRect().width > 0 &&
      getComputedStyle(element).visibility !== "hidden";
    const list = document.querySelector(".provider-shell-list");
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      clipped: [
        ...document.querySelectorAll(
          ".provider-card__header, .provider-card__footer, .top-app-bar, .summary-pill",
        ),
      ]
        .filter(
          (element) =>
            visible(element) && element.scrollWidth > element.clientWidth + 2,
        )
        .map((element) => element.className),
      images: [...document.images].filter(
        (image) => !image.complete || image.naturalWidth === 0,
      ).length,
      columns: list
        ? getComputedStyle(list).gridTemplateColumns.split(" ").length
        : 0,
    };
  });
  assert(
    result.overflow <= 1 && !result.clipped.length && !result.images,
    JSON.stringify(result),
  );
  return result;
}
try {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  await worker.evaluate(() =>
    chrome.storage.local.set({
      "ai-usage-dashboard.store-screenshot-runtime-lock": true,
    }),
  );
  for (const locale of locales)
    for (const theme of ["light", "dark"])
      for (const [width, surface] of [
        [390, "sidebar"],
        [900, "fullPage"],
        [1440, "fullPage"],
      ]) {
        const name = `${locale}-${theme}-${width}`;
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        await page.setViewportSize({ width, height: 900 });
        page.on("pageerror", (error) =>
          report.errors.push({ name, error: error.message }),
        );
        page.on("request", (request) => {
          if (/^https?:/.test(request.url()))
            report.remoteRequests.push(request.url());
        });
        const state = structuredClone(fixture);
        const expectedOrder = [
          "codex-personal-page",
          "claude-code-team-page",
          "cursor-personal-page",
        ];
        state.settings = {
          ...state.settings,
          locale,
          themeMode: theme,
          motionMode: "reduced",
          sidebarProgressStyle: "line",
          fullPageProgressStyle: "circle-soft",
        };
        state.settings.providerOrderBySurface[surface] = expectedOrder;
        const codex = state.providers.find(
          (provider) => provider.providerId === "codex-personal-page",
        );
        codex.usageWindows = [
          {
            label: "Weekly synthetic window",
            kind: "weekly",
            normalizedLabel: "weekly",
            modelLabel: null,
            quotaUnit: "percent",
            used: 38,
            remaining: 62,
            total: 100,
            resetAt: "2026-10-06T00:00:00Z",
            resetLabel: null,
          },
        ];
        codex.lastSuccessAt = "2026-10-02T12:00:00Z";
        const url = `${origin}/src/sidepanel/index.html${surface === "fullPage" ? "?surface=full-page" : ""}#dashboard`;
        try {
          await worker.evaluate(
            ({ stateKey, state }) =>
              chrome.storage.local.set({ [stateKey]: state }),
            { stateKey, state },
          );
          await page.goto(url);
          await page
            .locator(".dashboard-fusion .provider-card")
            .first()
            .waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.waitForFunction(() =>
            document
              .getAnimations()
              .every((animation) => animation.playState !== "running"),
          );
          assert.equal(
            await page.locator("html").getAttribute("dir"),
            locale === "ar" ? "rtl" : "ltr",
          );
          assert.deepEqual(
            await page
              .locator(".provider-card")
              .evaluateAll((cards) =>
                cards.map((card) => card.dataset.providerId),
              ),
            expectedOrder,
          );
          assert.equal(await page.locator(".hero-card").count(), 0);
          assert.equal(await page.locator(".summary-pill").count(), 4);
          const layout = await assertLayout(page);
          assert.equal(layout.columns, width >= 1100 ? 2 : 1);
          assert(
            (
              await page
                .locator('[data-provider-id="codex-personal-page"]')
                .innerText()
            ).includes("62"),
            "Remaining quota disappeared",
          );
          const snapshot = await worker.evaluate(
            async (key) => (await chrome.storage.local.get(key))[key].providers,
            stateKey,
          );
          assert.deepEqual(
            snapshot,
            state.providers,
            "Rendering changed snapshot data",
          );
          const detail = page
            .locator(
              '[data-provider-id="codex-personal-page"] .provider-card__footer button',
            )
            .first();
          await detail.focus();
          await page.keyboard.press("Enter");
          await page.waitForURL(/#provider-detail\/codex-personal-page$/);
          await page
            .locator(
              '[data-theme-stability-surface="provider-detail-usage-card"]',
            )
            .waitFor();
          await page.goBack();
          await page.locator(".dashboard-fusion").waitFor();
          assert.deepEqual(
            await page
              .locator(".provider-card")
              .evaluateAll((cards) =>
                cards.map((card) => card.dataset.providerId),
              ),
            expectedOrder,
          );
          await page
            .locator(
              '.top-app-bar button:has([data-material-action-icon="settings"])',
            )
            .click();
          await page.locator(".settings-fusion").waitFor();
          await page.goBack();
          await page.locator(".dashboard-fusion").waitFor();
          await page.screenshot({
            path: path.join(output, `${name}.png`),
            fullPage: true,
          });
          if (locale === "en" && theme === "light") {
            await page.evaluate(() => {
              document.documentElement.style.zoom = "2";
            });
            await assertLayout(page);
            await page.screenshot({
              path: path.join(output, `${name}-zoom200.png`),
              fullPage: true,
            });
            await page.evaluate(() => {
              document.documentElement.style.zoom = "";
            });
          }
          if (locale === "en" && theme === "light" && width === 390) {
            const empty = structuredClone(state);
            empty.providerSettings.forEach((setting) => {
              setting.displayEnabled = false;
            });
            await worker.evaluate(
              ({ stateKey, state }) =>
                chrome.storage.local.set({ [stateKey]: state }),
              { stateKey, state: empty },
            );
            await page.locator(".dashboard-empty-state").waitFor();
            await assertLayout(page);
            await page.locator(".dashboard-empty-state button").click();
            await page.locator(".settings-fusion").waitFor();
            assert.equal(
              await page
                .locator('[data-settings-category-panel="connections"]')
                .getAttribute("hidden"),
              null,
            );
          }
          report.cases.push({
            name,
            surface,
            layout,
            snapshotUnchanged: true,
            navigation: true,
          });
          console.log(`Fusion dashboard ${name}: passed`);
        } catch (error) {
          await page.screenshot({
            path: path.join(output, `${name}-failure.png`),
            fullPage: true,
          });
          throw error;
        } finally {
          await page.close();
        }
      }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.remoteRequests, []);
} finally {
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(report, null, 2),
  );
  await context.close();
  console.log(`Dashboard evidence: ${output}`);
}
