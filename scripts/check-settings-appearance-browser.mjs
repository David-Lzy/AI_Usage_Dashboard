import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const arg = (name) =>
  process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
assert(arg("--extension"), "Pass an isolated --extension=<Chrome build>");
const extension = path.resolve(arg("--extension"));
assert(
  !extension.startsWith(path.resolve("dist") + path.sep),
  "Loaded builds are not QA fixtures",
);
const locales = arg("--locales")?.split(",") ?? SUPPORTED_RDP_CAPTURE_LOCALES;
const widths = arg("--widths")?.split(",").map(Number) ?? [390, 1440];
const root = path.resolve("tmp/output/playwright/settings-appearance");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const context = await chromium.launchPersistentContext(
  path.join(output, "profile"),
  {
    headless: true,
    offline: true,
    reducedMotion: "reduce",
    timezoneId: "UTC",
    acceptDownloads: true,
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
const report = { cases: [], errors: [], remoteRequests: [] };
try {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  const baseline = await worker.evaluate(async (key) => {
    await chrome.storage.local.set({
      "ai-usage-dashboard.store-screenshot-runtime-lock": true,
    });
    for (let i = 0; i < 100; i++) {
      const state = (await chrome.storage.local.get(key))[key];
      if (state) return state;
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }, stateKey);
  assert(baseline);
  for (const locale of locales)
    for (const theme of ["light", "dark"])
      for (const width of widths) {
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
        await worker.evaluate(
          async ({ baseline, stateKey, locale, theme }) => {
            baseline.settings = {
              ...baseline.settings,
              locale,
              themeMode: theme,
              motionMode: "reduced",
              userLevel: "advanced",
              popupProgressStyle: "circle",
              sidebarProgressStyle: "line",
              fullPageProgressStyle: "circle-gauge",
            };
            baseline.providerSettings = baseline.providerSettings.map(
              (provider) => ({
                ...provider,
                displayEnabled: [
                  "codex-personal-page",
                  "claude-code-team-page",
                  "cursor-personal-page",
                ].includes(provider.id),
              }),
            );
            baseline.providers = baseline.providers.map((provider) => ({
              ...provider,
              usageWindows: [
                {
                  label: "Weekly QA window",
                  kind: "weekly",
                  normalizedLabel: "weekly",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 23,
                  remaining: 77,
                  total: 100,
                  resetAt: null,
                  resetLabel: null,
                },
              ],
            }));
            const gateway = baseline.providers.find(
              (provider) => provider.providerId === "sub2api-api-key",
            );
            const gatewaySetting = baseline.providerSettings.find(
              (provider) => provider.id === "sub2api-api-key",
            );
            baseline.providerAccounts["sub2api-api-key"] = {
              activeAccountId: "default",
              accounts: ["default", "account_backup12"].map((id) => ({
                id,
                label: id === "default" ? "QA primary" : "QA secondary",
                createdAt: null,
                lastSuccessAt: null,
              })),
              inactiveAccounts: {
                account_backup12: {
                  snapshot: structuredClone(gateway),
                  setting: structuredClone(gatewaySetting),
                },
              },
            };
            await chrome.storage.local.set({ [stateKey]: baseline });
          },
          { baseline, stateKey, locale, theme },
        );
        await page.addInitScript(() => {
          const setItem = Storage.prototype.setItem;
          Storage.prototype.setItem = function (key, value) {
            if (
              window.__rejectCursorWrite &&
              key === "ai-usage-dashboard:cursor-usage:module-preferences"
            )
              throw new DOMException(
                "QA storage rejected",
                "QuotaExceededError",
              );
            return setItem.call(this, key, value);
          };
          const native = chrome.runtime.sendMessage.bind(chrome.runtime);
          chrome.runtime.sendMessage = (message, ...args) => {
            if (
              window.__rejectSync &&
              [
                "app:save-configuration-to-sync",
                "app:restore-configuration-from-sync",
              ].includes(message.type)
            )
              return Promise.resolve({
                ok: false,
                error: "QA Sync unavailable",
              });
            return native(message, ...args);
          };
        });
        const readSettings = () =>
          worker.evaluate(
            async (key) => (await chrome.storage.local.get(key))[key].settings,
            stateKey,
          );
        const select = async (field, value, persist = true) => {
          const control = page.locator(`[data-fusion-field="${field}"]`);
          await control.locator("input:not(.hidden-input)").click();
          await control.locator(`mdui-menu-item[value="${value}"]`).click();
          await page.waitForFunction(
            ({ field, value }) =>
              document.querySelector(
                `[data-fusion-field="${field}"] mdui-select`,
              )?.value === value,
            { field, value },
          );
          if (persist) {
            const key = {
              "popup-progress-style": "popupProgressStyle",
              "sidebar-progress-style": "sidebarProgressStyle",
              "full-page-progress-style": "fullPageProgressStyle",
              "popup-size-preset": "popupSizePreset",
              "theme-mode": "themeMode",
              "sub2api-popup-account-presentation":
                "popupProviderAccountPresentationByProvider",
            }[field];
            assert(key, `Missing storage assertion for ${field}`);
            await page.waitForFunction(
              async ({ stateKey, key, value, field }) => {
                const settings = (await chrome.storage.local.get(stateKey))[
                  stateKey
                ]?.settings;
                return (
                  (field === "sub2api-popup-account-presentation"
                    ? settings?.[key]?.["sub2api-api-key"]
                    : settings?.[key]) === value
                );
              },
              { stateKey, key, value, field },
            );
            await page.waitForFunction(
              () =>
                document.querySelector(
                  ".top-app-bar [data-settings-save-status]",
                )?.dataset.settingsSaveStatus === "saved",
            );
          }
        };
        const navigate = async (id) => {
          await page.evaluate((id) => {
            location.hash = `settings/section/${id}`;
          }, id);
          await page.locator(`#${id}`).waitFor({ state: "visible" });
        };
        const layout = async (label) => {
          const result = await page.evaluate(() => ({
            width: innerWidth,
            scroll: document.documentElement.scrollWidth,
            dir: document.documentElement.dir,
            outside: [
              ...document.querySelectorAll(
                ".settings-appearance-group input, .settings-appearance-group button, .settings-appearance-group h2",
              ),
            ]
              .filter(
                (element) =>
                  element.checkVisibility() &&
                  !element.closest(".toolbar-popup-preview"),
              )
              .filter((element) => {
                const r = element.getBoundingClientRect();
                return r.left < -1 || r.right > innerWidth + 1;
              })
              .map((element) => element.className),
          }));
          assert(
            result.scroll <= width + 1,
            `${name}/${label}: page overflow ${JSON.stringify(result)}`,
          );
          assert.deepEqual(
            result.outside,
            [],
            `${name}/${label}: control overflow`,
          );
          assert.equal(result.dir, locale === "ar" ? "rtl" : "ltr");
          return result;
        };
        try {
          await page.goto(
            `${origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-appearance`,
          );
          await page
            .locator("#settings-appearance")
            .waitFor({ state: "visible" });
          assert.equal(
            await page.locator("[data-settings-appearance-group]").count(),
            4,
          );
          await layout("global");
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({
            path: path.join(output, `${name}-global.png`),
          });
          for (const [surface, field, style, next] of [
            ["popup", "popup-progress-style", "circle", "circle-soft"],
            ["sidebar", "sidebar-progress-style", "line", "circle"],
            ["fullPage", "full-page-progress-style", "circle-gauge", "line"],
          ]) {
            await select("settings-editing-surface", surface, false);
            assert.equal(
              await page
                .locator(`[data-fusion-field="${field}"] mdui-select`)
                .evaluate((element) => element.value),
              style,
            );
            assert.equal(
              await page.locator("[data-provider-order-surface]").count(),
              1,
            );
            assert.equal(
              await page
                .locator("[data-provider-order-surface]")
                .getAttribute("data-provider-order-surface"),
              surface,
            );
            const before = await readSettings();
            await select(field, next);
            const after = await readSettings();
            const expected = {
              popup: "popupProgressStyle",
              sidebar: "sidebarProgressStyle",
              fullPage: "fullPageProgressStyle",
            };
            assert.equal(after[expected[surface]], next);
            for (const other of Object.keys(expected).filter(
              (item) => item !== surface,
            ))
              assert.equal(after[expected[other]], before[expected[other]]);
            const order = page.locator(
              `[data-provider-order-surface="${surface}"]`,
            );
            await order
              .locator("[data-provider-order-row]")
              .first()
              .locator("button")
              .last()
              .click();
            await page.waitForFunction(
              () =>
                document.querySelector(
                  ".top-app-bar [data-settings-save-status]",
                )?.dataset.settingsSaveStatus === "saved",
            );
            const changed = await readSettings();
            assert.notDeepEqual(
              changed.providerOrderBySurface[surface],
              before.providerOrderBySurface[surface],
            );
            for (const other of Object.keys(expected).filter(
              (item) => item !== surface,
            ))
              assert.deepEqual(
                changed.providerOrderBySurface[other],
                before.providerOrderBySurface[other],
              );
            await layout(surface);
          }
          await navigate("settings-overview");
          await navigate("settings-appearance");
          assert.equal(
            await page
              .locator(
                '[data-fusion-field="settings-editing-surface"] mdui-select',
              )
              .evaluate((element) => element.value),
            "fullPage",
          );
          await select("settings-editing-surface", "popup", false);
          await select("sub2api-popup-account-presentation", "cycle");
          assert.equal(
            (await readSettings()).popupProviderAccountPresentationByProvider[
              "sub2api-api-key"
            ],
            "cycle",
          );
          await page
            .locator('[data-settings-appearance-group="layout"]')
            .scrollIntoViewIfNeeded();
          await page.screenshot({
            path: path.join(output, `${name}-layout.png`),
          });
          await page
            .locator(".settings-preferences__test-popup-button")
            .click();
          const preview = page.locator("[data-toolbar-popup-preview]");
          await preview.waitFor();
          for (const size of ["compact", "wide", "balanced"]) {
            await select("popup-size-preset", size);
            assert.equal(
              await preview.getAttribute("data-popup-size-preset"),
              size,
            );
          }
          await layout("preview");
          await page
            .locator(".settings-preferences__test-popup-button")
            .click();
          await preview.waitFor({ state: "detached" });
          const colors = page.locator(".settings-progress-editor");
          await colors.locator("summary").click();
          await page
            .locator("[data-progress-appearance-preferences]")
            .waitFor({ state: "visible" });
          await layout("colors");
          if (locale === "en" && theme === "light" && width === 1440) {
            await page.locator("#progress-thickness-input").fill("7");
            await page
              .locator(".progress-appearance-mode-switch__button")
              .last()
              .click();
            await page.waitForFunction(
              ({ stateKey }) =>
                chrome.storage.local
                  .get(stateKey)
                  .then(
                    (value) =>
                      value[stateKey]?.settings.progressThicknessPx === 7 &&
                      value[stateKey]?.settings.progressColorAppearance.mode ===
                        "gradient",
                  ),
              { stateKey },
            );
            await page
              .locator(".progress-appearance-mode-switch__button")
              .first()
              .click();
          }
          await colors.locator("summary").click();
          await page
            .locator('[data-settings-appearance-group="content"]')
            .scrollIntoViewIfNeeded();
          await page.screenshot({
            path: path.join(output, `${name}-content.png`),
          });
          await page
            .locator('[data-settings-appearance-group="toolbar"]')
            .scrollIntoViewIfNeeded();
          await layout("toolbar");
          await page.screenshot({
            path: path.join(output, `${name}-toolbar.png`),
          });
          await navigate("settings-data");
          await layout("data");
          const backupHelp = page.locator(
            ".configuration-backup-controls__header .material-info-tooltip__trigger",
          );
          await backupHelp.focus();
          const tooltip = page.locator(
            '.material-info-tooltip__content[data-open="true"][data-positioned="true"]',
          );
          await tooltip.waitFor({ state: "visible" });
          for (const element of [backupHelp, tooltip]) {
            const bounds = await element.boundingBox();
            assert(
              bounds && bounds.x >= 0 && bounds.x + bounds.width <= width,
              `${name}: backup tooltip outside viewport`,
            );
          }
          await backupHelp.evaluate((element) => element.blur());
          await page.screenshot({
            path: path.join(output, `${name}-data.png`),
          });

          if (locale === "en" && theme === "light" && width === 1440) {
            await navigate("settings-appearance");
            const cursor = page.locator("[data-cursor-usage-preferences]");
            await page.evaluate(() => {
              window.__rejectCursorWrite = true;
            });
            const visibility = cursor.locator('input[type="checkbox"]').first();
            await visibility.uncheck();
            await cursor
              .locator('[data-settings-save-status="error"]')
              .waitFor();
            await navigate("settings-data");
            await navigate("settings-appearance");
            assert.equal(await visibility.isChecked(), false);
            await page.evaluate(() => {
              window.__rejectCursorWrite = false;
            });
            await cursor.locator("[data-settings-save-status] button").click();
            await cursor
              .locator('[data-settings-save-status="saved"]')
              .waitFor();
            assert.equal(
              await page.evaluate(
                () =>
                  JSON.parse(
                    localStorage.getItem(
                      "ai-usage-dashboard:cursor-usage:module-preferences",
                    ),
                  ).popup[0].visible,
              ),
              false,
            );
            await navigate("settings-data");
            const before = await readSettings();
            const downloadPromise = page.waitForEvent("download");
            await page.locator('[data-backup-action="export"]').click();
            const download = await downloadPromise;
            const backup = JSON.parse(
              await readFile(await download.path(), "utf8"),
            );
            assert.equal(
              backup.payload.settings.popupProgressStyle,
              before.popupProgressStyle,
            );
            assert(
              !("providers" in backup.payload) &&
                !("credentials" in backup.payload) &&
                !("providerAccounts" in backup.payload),
            );
            await page.locator('[data-backup-action="import"]').setInputFiles({
              name: "invalid.json",
              mimeType: "application/json",
              buffer: Buffer.from("{invalid"),
            });
            await page.locator(".toast--error").waitFor();
            assert.deepEqual(await readSettings(), before);
            await page.evaluate(() => {
              window.__rejectSync = true;
            });
            for (const action of ["sync-save", "sync-restore"]) {
              await page.locator(`[data-backup-action="${action}"]`).click();
              await page
                .getByText("QA Sync unavailable", { exact: true })
                .waitFor();
            }
            page.once("dialog", (dialog) => dialog.dismiss());
            await page.locator('[data-backup-action="reset"]').click();
            assert.deepEqual(await readSettings(), before);
            await navigate("settings-appearance");
            await select("theme-mode", "system");
            await page.emulateMedia({ colorScheme: "dark" });
            await page.waitForFunction(
              () => document.documentElement.dataset.themeResolved === "dark",
            );
            await page.emulateMedia({ colorScheme: "light" });
            await page.waitForFunction(
              () => document.documentElement.dataset.themeResolved === "light",
            );
            await navigate("settings-data");
            await page.locator('[data-backup-action="import"]').setInputFiles({
              name: "settings.json",
              mimeType: "application/json",
              buffer: Buffer.from(JSON.stringify(backup)),
            });
            await page.waitForFunction(
              ({ stateKey, expected }) =>
                chrome.storage.local
                  .get(stateKey)
                  .then(
                    (value) => value[stateKey]?.settings.themeMode === expected,
                  ),
              { stateKey, expected: before.themeMode },
            );
            const restored = await readSettings();
            for (const key of [
              "popupProgressStyle",
              "sidebarProgressStyle",
              "fullPageProgressStyle",
              "providerOrderBySurface",
              "themeMode",
            ])
              assert.deepEqual(restored[key], before[key]);
          }
          report.cases.push({
            name,
            surfacesIndependent: true,
            draftRetained: true,
            previewSizes: 3,
          });
          console.log(`Settings appearance ${name}: passed`);
        } catch (error) {
          await page.screenshot({
            path: path.join(output, `${name}-failure.png`),
          });
          throw error;
        } finally {
          await page.close();
        }
      }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.remoteRequests, []);
} catch (error) {
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(report, null, 2),
  );
  await context.close();
  console.log(`Appearance evidence: ${output}`);
}
