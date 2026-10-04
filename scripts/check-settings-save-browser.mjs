import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const arg = (name) =>
  process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
assert(arg("--extension"), "Pass --extension=<isolated Chrome build>");
const extension = path.resolve(arg("--extension"));
assert(
  !extension.startsWith(path.resolve("dist") + path.sep),
  "Never use the loaded extension directory",
);
const locales = arg("--locales")?.split(",") ?? SUPPORTED_RDP_CAPTURE_LOCALES;
const widths = arg("--widths")?.split(",").map(Number) ?? [390, 1440];
const root = path.resolve("tmp/output/playwright/settings-save");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const context = await chromium.launchPersistentContext(
  path.join(output, "profile"),
  {
    headless: true,
    offline: true,
    reducedMotion: "reduce",
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
const notificationKey = "ai-usage-dashboard.quota-notifications";
const report = { cases: [], errors: [], remoteRequests: [] };
try {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      "ai-usage-dashboard.store-screenshot-runtime-lock": true,
    });
  });
  for (const locale of locales)
    for (const theme of ["light", "dark"])
      for (const width of widths) {
        const name = `${locale}-${theme}-${width}`;
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        page.on("pageerror", (error) =>
          report.errors.push({ name, error: error.message }),
        );
        page.on("request", (request) => {
          if (/^https?:/.test(request.url()))
            report.remoteRequests.push(request.url());
        });
        await page.setViewportSize({ width, height: 900 });
        await worker.evaluate(
          async ({ stateKey, notificationKey, locale, theme }) => {
            let state;
            for (let i = 0; i < 100; i++) {
              state = (await chrome.storage.local.get(stateKey))[stateKey];
              if (state) break;
              await new Promise((resolve) => setTimeout(resolve, 30));
            }
            state.settings = {
              ...state.settings,
              locale,
              themeMode: theme,
              motionMode: "reduced",
              warningThresholdPercent: 80,
              syncIntervalMinutes: 3,
            };
            state.providerSettings = state.providerSettings.map((provider) => ({
              ...provider,
              displayEnabled: false,
            }));
            state.providers = state.providers.map((provider) => ({
              ...provider,
              usageWindows: [],
            }));
            await chrome.storage.local.set({
              [stateKey]: state,
              [notificationKey]: {
                schemaVersion: 1,
                ledger: {},
                preferences: {
                  enabled: true,
                  paused: true,
                  thresholdPercent: 92,
                  disabledAccountKeys: [],
                  disabledWindowKeys: [],
                },
              },
            });
          },
          { stateKey, notificationKey, locale, theme },
        );
        await page.addInitScript(() => {
          const native = chrome.runtime.sendMessage.bind(chrome.runtime);
          const queue = [];
          window.__saveQa = { queue, reject: false };
          chrome.runtime.sendMessage = (message, ...args) => {
            if (message.type === "quota-notifications:test")
              throw new Error("OS notifications are forbidden in this fixture");
            if (message.type.startsWith("quota-notifications:")) {
              // Exercise real controller/storage, but not browser permission or OS delivery.
              return native(message, ...args).then((response) =>
                response.ok
                  ? {
                      ...response,
                      view: { ...response.view, permission: "granted" },
                    }
                  : response,
              );
            }
            if (message.type !== "app:update-settings")
              return native(message, ...args);
            return new Promise((resolve) => {
              const entry = {
                settings: message.settings,
                resolve,
                ready: false,
                response: undefined,
              };
              queue.push(entry);
              if (window.__saveQa.reject) {
                entry.ready = true;
                entry.response = { ok: false, error: "QA rejected request" };
                return;
              }
              native(message, ...args).then((response) => {
                entry.response = response;
                entry.ready = true;
              });
            });
          };
        });
        const url = `${origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-usage-notifications`;
        const warning = page.locator(
          '[data-settings-custom-number-field="warning-threshold"] input',
        );
        const interval = page.locator(
          '[data-settings-custom-number-field="sync-interval"] input',
        );
        const status = page.locator("[data-settings-save-status]");
        const expectStatus = async (value) =>
          page.waitForFunction(
            (value) =>
              document
                .querySelector("[data-settings-save-status]")
                ?.getAttribute("data-settings-save-status") === value,
            value,
          );
        const edit = async (input, value) => {
          await input.fill(String(value));
          await input.press("Enter");
        };
        const queued = async (index) =>
          page.waitForFunction(
            (index) => window.__saveQa.queue[index]?.ready,
            index,
          );
        const release = async (index, fail = false) => {
          await queued(index);
          await page.evaluate(
            ({ index, fail }) => {
              const entry = window.__saveQa.queue[index];
              entry.resolve(
                fail
                  ? { ok: false, error: "QA delayed rejection" }
                  : entry.response,
              );
            },
            { index, fail },
          );
        };
        const setReject = async (value) =>
          page.evaluate((value) => {
            window.__saveQa.reject = value;
          }, value);
        try {
          await page.goto(url);
          await warning.waitFor();
          await expectStatus("idle");
          assert.equal(
            await page
              .locator(".top-app-bar__actions [data-material-action-icon=save]")
              .count(),
            0,
          );
          await edit(warning, 67);
          await queued(0);
          await expectStatus("pending");
          await page.evaluate(() => {
            location.hash = "#settings/section/settings-data";
          });
          await page.locator("#settings-data").waitFor({ state: "visible" });
          await expectStatus("pending");
          await page.evaluate(() => {
            location.hash = "#settings/section/settings-usage-notifications";
          });
          await warning.waitFor();
          assert.equal(await warning.inputValue(), "67");
          await release(0);
          await expectStatus("saved");

          await setReject(true);
          await edit(warning, 68);
          await release(1);
          await expectStatus("error");
          assert.equal(await warning.inputValue(), "68");
          assert.equal(
            await worker.evaluate(
              async (key) =>
                (await chrome.storage.local.get(key))[key].settings
                  .warningThresholdPercent,
              stateKey,
            ),
            67,
          );
          await page.screenshot({
            path: path.join(output, `${name}-error.png`),
          });
          await setReject(false);
          await status.locator("button").click();
          await expectStatus("pending");
          await release(2);
          await expectStatus("saved");

          await edit(warning, 69);
          await queued(3);
          await edit(warning, 71);
          await queued(4);
          await release(4);
          await expectStatus("saved");
          await release(3, true);
          await expectStatus("saved");
          assert.equal(await warning.inputValue(), "71");

          await edit(warning, 72);
          await queued(5);
          await setReject(true);
          await edit(warning, 73);
          await release(6);
          await expectStatus("error");
          await release(5);
          await expectStatus("error");
          assert.equal(await warning.inputValue(), "73");
          await setReject(false);
          await status.locator("button").click();
          await release(7);
          await expectStatus("saved");

          await setReject(true);
          await edit(warning, 74);
          await queued(8);
          await setReject(false);
          await edit(interval, 11);
          await queued(9);
          await release(8);
          await expectStatus("pending");
          await release(9);
          await expectStatus("error");
          assert.equal(await interval.inputValue(), "11");
          assert.equal(await warning.inputValue(), "74");
          await status.locator("button").click();
          await release(10);
          await expectStatus("saved");

          const notification = page.locator(
            '[data-notification-action="threshold"]',
          );
          assert.equal(await notification.inputValue(), "92");
          await edit(notification, 88);
          await page.waitForFunction(
            (key) =>
              chrome.storage.local
                .get(key)
                .then(
                  (state) => state[key]?.preferences.thresholdPercent === 88,
                ),
            notificationKey,
          );
          assert.equal(await warning.inputValue(), "74");
          await edit(notification, "");
          assert.equal(await notification.inputValue(), "88");
          assert.equal(
            await page.locator(".quota-notification-settings__account").count(),
            0,
          );
          assert.equal(
            await page.locator('[data-notification-action="test"]').isEnabled(),
            false,
          );
          const saved = await worker.evaluate(
            async ({ stateKey, notificationKey }) => {
              const storage = await chrome.storage.local.get([
                stateKey,
                notificationKey,
              ]);
              return {
                warning: storage[stateKey].settings.warningThresholdPercent,
                sync: storage[stateKey].settings.syncIntervalMinutes,
                notification:
                  storage[notificationKey].preferences.thresholdPercent,
              };
            },
            { stateKey, notificationKey },
          );
          assert.deepEqual(saved, { warning: 74, sync: 11, notification: 88 });
          const layout = await page.evaluate(() => ({
            width: innerWidth,
            scroll: document.documentElement.scrollWidth,
            dir: document.documentElement.dir,
          }));
          assert(
            layout.scroll <= layout.width + 1,
            `${name}: overflow ${JSON.stringify(layout)}`,
          );
          assert.equal(layout.dir, locale === "ar" ? "rtl" : "ltr");
          await page.screenshot({
            path: path.join(output, `${name}-saved.png`),
          });
          await setReject(true);
          await edit(warning, 75);
          await queued(11);
          await page.evaluate(() => { window.location.hash = "dashboard"; });
          await page.locator(".settings-fusion").waitFor({ state: "detached" });
          await release(11);
          await page.getByText("QA rejected request", { exact: true }).waitFor();
          await page.evaluate(() => { window.location.hash = "settings/section/settings-usage-notifications"; });
          await warning.waitFor();
          await expectStatus("error");
          assert.equal(await warning.inputValue(), "75");
          await page.reload();
          await warning.waitFor();
          await expectStatus("idle");
          assert.equal(await warning.inputValue(), "74");
          assert.equal(await notification.inputValue(), "88");
          report.cases.push({ name, saved, layout, acknowledged: 12, routeExitFailure: true });
          console.log(`Settings save ${name}: passed`);
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
  console.log(`Settings save evidence: ${output}`);
}
