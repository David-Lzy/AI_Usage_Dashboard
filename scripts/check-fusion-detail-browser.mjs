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
const root = path.resolve("tmp/output/playwright/fusion-detail");
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
const capture = "2026-10-02T12:00:00Z";
const dates = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01"];
try {
  const seed = await loader.ssrLoadModule(
    "/src/sidepanel/store-screenshot-seed.ts",
  );
  const accounts = await loader.ssrLoadModule(
    "/src/shared/provider-accounts.ts",
  );
  const sub2 = await loader.ssrLoadModule("/src/providers/sub2api/client.ts");
  fixture = JSON.parse(
    JSON.stringify(
      seed.getStoreScreenshotSeedPresetDefinition("toolbar-first-quick-glance")
        .appState,
    ),
  );
  const codex = fixture.providers.find(
    (entry) => entry.providerId === "codex-personal-page",
  );
  codex.lastSuccessAt = capture;
  codex.lastAttemptAt = "2026-10-02T14:00:00Z";
  codex.resetAt = "2026-10-06T00:00:00Z";
  codex.resetLabel = "Weekly synthetic window resets Oct 6";
  codex.usageWindows = [
    {
      label: "Weekly synthetic window",
      kind: "weekly",
      normalizedLabel: "weekly",
      used: 38,
      remaining: 62,
      resetAt: "2026-10-06T00:00:00Z",
    },
    {
      label: "Session synthetic window",
      kind: "session",
      normalizedLabel: "session",
      used: 10,
      remaining: 90,
      resetAt: "2026-10-02T19:00:00Z",
    },
  ].map((window) => ({
    modelLabel: null,
    quotaUnit: "percent",
    total: 100,
    resetLabel: null,
    ...window,
  }));
  codex.usageHistory = {
    capturedAt: capture,
    rangeStart: dates[0],
    rangeEnd: dates.at(-1),
    granularity: "day",
    personalUsageBySurface: {
      capturedAt: capture,
      unit: "percent",
      points: dates.map((date, index) => ({
        date,
        values: [{ id: "desktop", label: "Desktop", value: 10 + index }],
      })),
    },
    turns: {
      capturedAt: capture,
      total: 100,
      byModel: dates.map((date) => ({
        date,
        values: [
          {
            id: "model",
            label: "QA deliberately long model label for narrow layout",
            value: 25,
          },
        ],
      })),
      bySurface: [],
    },
  };
  const id = "sub2api-api-key";
  const connection = {
    schemaVersion: 1,
    displayLabel: "QA primary",
    baseUrl: "https://gateway-a.example.test",
    insecureTransportAcknowledged: false,
  };
  fixture = accounts.updateActiveProviderAccountConnection(
    fixture,
    id,
    connection,
  );
  const active = accounts.getProviderAccountRuntime(fixture, id, "default");
  const payload = {
    mode: "unrestricted",
    isValid: true,
    status: "active",
    unit: "USD",
    balance: 100,
    daily_usage: dates.map((date) => ({
      date,
      requests: 10,
      total_tokens: 1000,
      actual_cost: 1,
      cost: 2,
    })),
  };
  Object.assign(active.setting, {
    displayEnabled: true,
    status: "granted",
    credentialStatus: "configured",
  });
  Object.assign(active.snapshot, {
    syncStatus: "ok",
    lastSuccessAt: capture,
    lastAttemptAt: capture,
    apiGatewayMetering: sub2.parseSub2ApiUsageResponse(payload, {
      accountId: "default",
      connection,
      capturedAt: capture,
      requestedTimezone: "UTC",
    }),
  });
  active.snapshot.apiGatewayMetering.dailyUsageContext = {
    capturedAt: capture,
    requestedTimezone: "UTC",
    bucketTimezone: "UTC",
  };
  const secondConnection = {
    ...connection,
    displayLabel: "QA secondary with a long deployment label",
    baseUrl: "https://gateway-b.example.test",
  };
  const second = sub2.parseSub2ApiUsageResponse(payload, {
    accountId: "account_fusiondetail",
    connection: secondConnection,
    capturedAt: capture,
    requestedTimezone: "UTC",
  });
  second.dailyUsageContext = {
    capturedAt: capture,
    requestedTimezone: "UTC",
    bucketTimezone: "UTC",
  };
  fixture = accounts.addInactiveProviderAccount(fixture, {
    providerId: id,
    accountId: "account_fusiondetail",
    label: secondConnection.displayLabel,
    snapshot: { ...active.snapshot, apiGatewayMetering: second },
    setting: {
      ...active.setting,
      hostOrigins: ["https://gateway-b.example.test/*"],
    },
    apiGatewayConnection: secondConnection,
  });
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
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    clipped: [
      ...document.querySelectorAll(
        ".detail-section > h2, .top-app-bar, .detail-context, .detail-field",
      ),
    ]
      .filter(
        (element) =>
          element.getBoundingClientRect().width > 0 &&
          element.scrollWidth > element.clientWidth + 2,
      )
      .map((element) => element.className),
    charts: [...document.querySelectorAll(".usage-history-chart")].map(
      (chart) => ({
        width: chart.getBoundingClientRect().width,
        paths: chart.querySelectorAll("path, rect").length,
      }),
    ),
  }));
  assert(
    result.overflow <= 1 && !result.clipped.length,
    JSON.stringify(result),
  );
  assert(
    result.charts.every((chart) => chart.width > 0 && chart.paths > 0),
    "Blank chart",
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
      for (const width of [390, 1440]) {
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
        state.settings = {
          ...state.settings,
          locale,
          themeMode: theme,
          motionMode: "reduced",
          sidebarProgressStyle: "line",
          fullPageProgressStyle: "circle-soft",
        };
        const surface = width === 390 ? "sidebar" : "fullPage";
        try {
          await worker.evaluate(
            ({ stateKey, state }) =>
              chrome.storage.local.set({ [stateKey]: state }),
            { stateKey, state },
          );
          for (const providerId of ["codex-personal-page", "sub2api-api-key"]) {
            await page.goto(
              `${origin}/src/sidepanel/index.html${surface === "fullPage" ? "?surface=full-page" : ""}#provider-detail/${providerId}`,
            );
            const main = page.locator(".provider-detail-fusion");
            await main.waitFor();
            await page.evaluate(() => document.fonts.ready);
            assert.equal(
              await page.locator("html").getAttribute("dir"),
              locale === "ar" ? "rtl" : "ltr",
            );
            const source = page.locator("[data-provider-source-info]");
            assert.equal(await source.getAttribute("open"), null);
            assert(
              await page.locator("[data-provider-success-time]").isVisible(),
            );
            assert.equal(
              await page.locator("[data-usage-export]").count(),
              surface === "fullPage" ? 1 : 0,
            );
            assert.equal(
              await page.locator("[data-deployment-comparison]").count(),
              surface === "fullPage" && providerId === "sub2api-api-key"
                ? 1
                : 0,
            );
            await assertLayout(page);
            const datesBefore = await page
              .locator('input[type="date"]')
              .evaluateAll((fields) => fields.map((field) => field.value));
            const summary = source.locator("summary");
            await summary.focus();
            await page.keyboard.press("Enter");
            assert.notEqual(await source.getAttribute("open"), null);
            await assertLayout(page);
            await page.screenshot({
              path: path.join(output, `${name}-${providerId}-source.png`),
              fullPage: true,
            });
            await page.keyboard.press("Enter");
            assert.equal(await source.getAttribute("open"), null);
            assert.deepEqual(
              await page
                .locator('input[type="date"]')
                .evaluateAll((fields) => fields.map((field) => field.value)),
              datesBefore,
            );
            assert(
              await summary.evaluate(
                (element) => element === document.activeElement,
              ),
            );
            await summary.evaluate((element) => element.blur());
            await page.evaluate(() => scrollTo(0, 0));
            await page.screenshot({
              path: path.join(output, `${name}-${providerId}.png`),
              fullPage: true,
            });
          }
          const current = await worker.evaluate(
            async (key) => (await chrome.storage.local.get(key))[key].providers,
            stateKey,
          );
          assert.deepEqual(
            current,
            state.providers,
            "Navigation/disclosure changed usage data",
          );
          if (locale === "en" && theme === "light" && width === 1440) {
            const account = page
              .locator(".provider-account-selector")
              .getByRole("combobox");
            await account.click();
            await page
              .locator('[role="option"][id$="-option-account_fusiondetail"]')
              .click();
            await page.waitForFunction(
              async (key) =>
                (await chrome.storage.local.get(key))[key].providerAccounts[
                  "sub2api-api-key"
                ].activeAccountId === "account_fusiondetail",
              stateKey,
            );
            await page.locator("[data-provider-source-info] summary").click();
          assert(
            (
              await page
                .locator(".provider-account-selector")
                .getByRole("combobox")
                .innerText()
            ).includes("QA secondary"),
          );
          await page.locator("[data-provider-source-info] summary").click();
            const failed = structuredClone(state);
            Object.assign(
              failed.providers.find(
                (entry) => entry.providerId === "codex-personal-page",
              ),
              {
                syncStatus: "error",
                warningReason:
                  "QA failed refresh with a deliberately long actionable diagnostic",
                lastSuccessAt: null,
                used: null,
                remaining: null,
                total: null,
                usageWindows: [],
                usageHistory: undefined,
              },
            );
            await worker.evaluate(
              ({ stateKey, state }) =>
                chrome.storage.local.set({ [stateKey]: state }),
              { stateKey, state: failed },
            );
            await page.goto(
              `${origin}/src/sidepanel/index.html?surface=full-page#provider-detail/codex-personal-page`,
            );
            await page.locator(".provider-detail-fusion").waitFor();
            assert(
              await page
                .locator(".detail-recovery")
                .getByText(
                  "QA failed refresh with a deliberately long actionable diagnostic",
                  { exact: true },
                )
                .isVisible(),
            );
            assert(
              (
                await page.locator("[data-provider-success-time]").innerText()
              ).includes("Unknown"),
            );
            assert.equal(
              await page
                .locator("[data-provider-source-info]")
                .getAttribute("open"),
              null,
            );
            assert(
              await page
                .locator("[data-provider-detail-open-source-page] button")
                .isVisible(),
            );
            await assertLayout(page);
            await page.screenshot({
              path: path.join(output, "failed-unknown-visible.png"),
              fullPage: true,
            });
          }
          report.cases.push({
            name,
            surface,
            providers: 2,
            sourceDisclosure: true,
            rangesRetained: true,
          });
          console.log(`Fusion detail ${name}: passed`);
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
  console.log(`Detail evidence: ${output}`);
}
