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
assert(
  widths.every(
    (width) => Number.isInteger(width) && width >= 320 && width <= 2400,
  ),
);
const root = path.resolve("tmp/output/playwright/settings-categories");
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
const report = { cases: [], errors: [], remoteRequests: [] };
const categories = ["connections", "usage", "appearance", "general", "data"];
const titles = {
  connections: "settings-quick-setup",
  usage: "settings-usage-notifications",
  appearance: "settings-appearance",
  general: "settings-overview",
  data: "settings-data",
};
let failure;
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
          async ({ stateKey, locale, theme }) => {
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
              userLevel: "advanced",
              motionMode: "reduced",
            };
            state.providerSettings = state.providerSettings.map((provider) => ({
              ...provider,
              displayEnabled: [
                "codex-personal-page",
                "claude-code-team-page",
              ].includes(provider.id),
            }));
            await chrome.storage.local.set({ [stateKey]: state });
          },
          { stateKey, locale, theme },
        );
        const base = `${origin}/src/sidepanel/index.html?surface=full-page`;
        const navigate = async (category) => {
          if (width >= 1100) {
            await page
              .locator(`[data-settings-category-link="${category}"]`)
              .click();
          } else {
            const field = page.locator(
              '[data-fusion-field="settings-category"]',
            );
            await field.locator("input:not(.hidden-input)").click();
            await field.locator(`mdui-menu-item[value="${category}"]`).click();
          }
          await page
            .locator(`#${titles[category]}`)
            .waitFor({ state: "visible" });
          await page.waitForFunction(
            (id) => location.hash === `#settings/section/${id}`,
            titles[category],
          );
        };
        const checkLayout = async (label) => {
          const layout = await page.evaluate(() => ({
            width: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            direction: document.documentElement.dir,
            overlaps: [
              ...document.querySelectorAll(".settings-connection__row"),
            ]
              .filter((row) => row.checkVisibility())
              .flatMap((row) => {
                const children = [...row.children]
                  .map((element) => ({
                    element,
                    rect: element.getBoundingClientRect(),
                  }))
                  .filter(({ rect }) => rect.width && rect.height);
                return children.flatMap((a, i) =>
                  children
                    .slice(i + 1)
                    .filter(
                      (b) =>
                        Math.min(a.rect.right, b.rect.right) -
                          Math.max(a.rect.left, b.rect.left) >
                          2 &&
                        Math.min(a.rect.bottom, b.rect.bottom) -
                          Math.max(a.rect.top, b.rect.top) >
                          2,
                    )
                    .map((b) => [a.element.className, b.element.className]),
                );
              }),
          }));
          assert(
            layout.documentWidth <= width + 1,
            `${name}/${label}: page overflow ${layout.documentWidth}`,
          );
          assert.equal(layout.direction, locale === "ar" ? "rtl" : "ltr");
          assert.deepEqual(
            layout.overlaps,
            [],
            `${name}/${label}: row overlaps`,
          );
          return layout;
        };
        try {
          await page.goto(`${base}#settings/quick-setup/codex-personal-page`);
          const local = page.locator("[data-codex-local-settings]");
          await local.waitFor({ state: "visible" });
          assert(
            await page
              .locator(
                width >= 1100
                  ? ".settings-category-rail"
                  : ".settings-category-mobile",
              )
              .isVisible(),
          );
          assert.equal(
            await page
              .locator(".settings-connections [data-provider-carousel]")
              .count(),
            0,
          );
          const pairing = local.locator('input[autocomplete="one-time-code"]');
          await pairing.fill("QA-SAMPLE");
          await checkLayout("connections");
          await page.screenshot({
            path: path.join(output, `${name}-connections.png`),
          });
          for (const category of categories.slice(1)) {
            await navigate(category);
            await checkLayout(category);
            if (category === "usage" || category === "appearance")
              await page.screenshot({
                path: path.join(output, `${name}-${category}.png`),
              });
          }
          await navigate("connections");
          assert.equal(
            await pairing.inputValue(),
            "QA-SAMPLE",
            "Category switch discarded pairing draft",
          );
          await page
            .locator(
              '[data-quick-setup-provider-id="codex-personal-page"] .settings-connection__configure',
            )
            .click();
          await page
            .locator(
              '[data-quick-setup-provider-id="claude-code-team-page"] .settings-connection__configure',
            )
            .click();
          await page
            .locator(
              '[data-quick-setup-provider-id="codex-personal-page"] .settings-connection__configure',
            )
            .click();
          assert.equal(
            await pairing.inputValue(),
            "QA-SAMPLE",
            "Disclosure switch discarded pairing draft",
          );
          await page.evaluate(() => {
            location.hash = "#settings/credentials/cursor-team-api";
          });
          const key = page.locator(
            '[data-credential-provider-id="cursor-team-api"] input[type="password"]',
          );
          await key.waitFor({ state: "visible" });
          await key.fill("UNSAVED_SECRET_SENTINEL");
          const previousScroll = await page.evaluate(() => scrollY);
          await navigate("usage");
          await navigate("connections");
          assert.equal(await key.inputValue(), "UNSAVED_SECRET_SENTINEL");
          await page.waitForFunction(
            (y) => Math.abs(scrollY - y) < 3,
            previousScroll,
          );
          const stored = await worker.evaluate(async () =>
            JSON.stringify({
              local: await chrome.storage.local.get(null),
              session: await chrome.storage.session.get(null),
            }),
          );
          assert(
            !stored.includes("UNSAVED_SECRET_SENTINEL") &&
              !stored.includes("QA-SAMPLE"),
            "Navigation persisted a secret draft",
          );
          await navigate("appearance");
          await page.goBack();
          await page
            .locator("#settings-quick-setup")
            .waitFor({ state: "visible" });
          await page.goForward();
          await page
            .locator("#settings-appearance")
            .waitFor({ state: "visible" });
          const motionMenu = page.locator(
            '[data-settings-material-select="motion-mode"] button[role="combobox"]',
          );
          await motionMenu.click();
          await page
            .locator('.material-select__menu[role="listbox"]')
            .waitFor({ state: "visible" });
          await page.evaluate(() => {
            location.hash = "#settings/section/settings-usage-notifications";
          });
          await page
            .locator("#settings-usage-notifications")
            .waitFor({ state: "visible" });
          assert.equal(
            await page
              .locator('.material-select__menu[role="listbox"]:visible')
              .count(),
            0,
            "A hidden category left a portal menu visible",
          );
          await page.waitForFunction(
            () => document.activeElement?.id === "settings-usage-notifications",
          );
          const routes = [
            ["section/settings-overview", "#settings-overview"],
            ["section/settings-provider-display", "#settings-provider-display"],
            [
              "credentials/sub2api-api-key",
              "[data-sub2api-deployment-settings]",
            ],
            [
              "sources/gemini-policy",
              '.source-card[data-provider-id="gemini-policy"]',
            ],
          ];
          for (const [route, selector] of routes) {
            await page.evaluate((hash) => {
              location.hash = hash;
            }, `#settings/${route}`);
            await page.locator(selector).waitFor({ state: "visible" });
            await page.waitForTimeout(100);
            const bounds = await page.locator(selector).boundingBox();
            const bar = await page.locator(".top-app-bar").boundingBox();
            assert(
              bounds.y >= bar.y + bar.height - 2,
              `${name}/${route}: anchor hidden under header`,
            );
            await checkLayout(route);
          }
          report.cases.push({
            name,
            categories: categories.length,
            legacyRoutes: routes.length + 2,
            draftRetention: true,
            noSecretPersistence: true,
          });
          console.log(`Settings categories ${name}: passed`);
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
  failure = error;
  report.failure = String(error.stack ?? error);
} finally {
  await context.close();
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(`Settings category evidence: ${output}`);
}
if (failure) throw failure;
