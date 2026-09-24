import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";

const screenshotPath = path.resolve(
  process.argv[2] ?? "tmp/output/playwright/settings-split-readme-preview.png",
);
const server = await startSourceQaServer();
let browser;

try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }),
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1200 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(
    `${server.baseUrl}/src/sidepanel/index.html?surface=full-page&app-locale=en#settings`,
  );
  await page.locator("#settings-usage-notifications").waitFor();

  await page.evaluate(async () => {
    const [{ SAMPLE_APP_STATE }, { APP_STATE_STORAGE_KEY }] = await Promise.all([
      import("/src/shared/demo-state.ts"),
      import("/src/shared/constants.ts"),
    ]);
    const state = structuredClone(SAMPLE_APP_STATE);
    const visible = new Set(["claude-code-team-page", "codex-personal-page"]);
    state.providerSettings = state.providerSettings.map((provider) => ({
      ...provider,
      displayEnabled: visible.has(provider.id),
    }));
    const claude = state.providers.find(
      (provider) => provider.providerId === "claude-code-team-page",
    );
    claude.usageWindows = [
      {
        kind: "rolling_5h",
        label: "5-hour limit",
        normalizedLabel: "5-hour limit",
        modelLabel: null,
        quotaUnit: "percent",
        used: 35,
        remaining: 65,
        total: 100,
        resetAt: null,
        resetLabel: null,
      },
      {
        kind: "weekly",
        label: "Weekly limit",
        normalizedLabel: "Weekly limit",
        modelLabel: null,
        quotaUnit: "percent",
        used: 42,
        remaining: 58,
        total: 100,
        resetAt: null,
        resetLabel: null,
      },
    ];
    const notificationPreferences = {
      enabled: true,
      paused: false,
      thresholdPercent: 70,
      disabledAccountKeys: [],
      disabledWindowKeys: [],
    };
    const chromeApi = window.chrome ?? {};
    chromeApi.runtime = {
      id: "settings-split-visual-qa",
      sendMessage: async (message) => {
        if (message.type === "quota-notifications:read") {
          return {
            ok: true,
            view: { preferences: notificationPreferences, permission: "granted" },
          };
        }
        if (message.type === "quota-notifications:update") {
          if (message.change.type === "threshold") {
            notificationPreferences.thresholdPercent = message.change.value;
          }
          return {
            ok: true,
            view: { preferences: notificationPreferences, permission: "granted" },
          };
        }
        if (message.type === "app:update-settings") {
          state.settings = { ...state.settings, ...message.settings };
          return { ok: true, state };
        }
        return { ok: true, state };
      },
    };
    chromeApi.storage = {
      onChanged: { addListener: () => {}, removeListener: () => {} },
    };
    chromeApi.permissions = {
      contains: async () => true,
      onAdded: { addListener: () => {}, removeListener: () => {} },
      onRemoved: { addListener: () => {}, removeListener: () => {} },
    };
    window.chrome = chromeApi;
    window.__settingsSplitQa = { state, notificationPreferences };
    const serializedState = JSON.stringify(state);
    localStorage.setItem(APP_STATE_STORAGE_KEY, serializedState);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: APP_STATE_STORAGE_KEY,
        newValue: serializedState,
      }),
    );
  });

  await page.evaluate(() => { window.location.hash = "#dashboard"; });
  await page.locator("#settings-usage-notifications").waitFor({ state: "detached" });
  await page.evaluate(() => { window.location.hash = "#settings"; });
  const usage = page.locator("#settings-usage-notifications");
  await usage.locator('[data-notification-action="threshold"]').waitFor();
  await page.waitForFunction(
    () => document.querySelectorAll(".quota-notification-settings__account").length === 2,
  );
  assert.equal(await page.locator("#settings-appearance").count(), 1);
  const inAppThreshold = usage.locator(
    '[data-settings-custom-number-field="warning-threshold"] input',
  );
  const notificationThreshold = usage.locator(
    '[data-notification-action="threshold"]',
  );
  assert.equal(await inAppThreshold.inputValue(), "80");
  assert.equal(await notificationThreshold.inputValue(), "70");

  await inAppThreshold.fill("60");
  await inAppThreshold.press("Enter");
  await page.waitForFunction(
    () => window.__settingsSplitQa.state.settings.warningThresholdPercent === 60,
  );
  await notificationThreshold.fill("90");
  await notificationThreshold.press("Enter");
  await page.waitForFunction(
    () => window.__settingsSplitQa.notificationPreferences.thresholdPercent === 90,
  );
  assert.equal(await inAppThreshold.inputValue(), "60");
  assert.equal(await notificationThreshold.inputValue(), "90");

  for (const sectionId of ["settings-appearance", "settings-usage-notifications"]) {
    const label = sectionId === "settings-appearance"
      ? "Appearance"
      : "Usage & Notifications";
    const button = page.locator(".settings-section-nav").getByRole("button", {
      name: label,
      exact: true,
    });
    if (sectionId === "settings-appearance") {
      await button.click();
    } else {
      await button.focus();
      await page.keyboard.press("Enter");
    }
    await page.waitForFunction((target) => {
      const section = document.getElementById(target);
      const bar = document.querySelector(".top-app-bar");
      return Boolean(section && bar &&
        section.getBoundingClientRect().top >= bar.getBoundingClientRect().bottom - 4);
    }, sectionId);
  }

  await page.evaluate(() => { window.location.hash = "#settings/section/settings-appearance"; });
  await page.waitForFunction(() =>
    document.getElementById("settings-appearance")?.getBoundingClientRect().top >=
    document.querySelector(".top-app-bar")?.getBoundingClientRect().bottom - 4,
  );
  await page.evaluate(() => { window.location.hash = "#dashboard"; });
  await usage.waitFor({ state: "detached" });
  await page.evaluate(() => { window.location.hash = "#settings"; });
  await usage.waitFor();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  });
  await page.waitForTimeout(200);
  const overviewClearance = await page.evaluate(() => {
    const overview = document.querySelector("#settings-overview");
    const bar = document.querySelector(".top-app-bar");
    return overview.getBoundingClientRect().top - bar.getBoundingClientRect().bottom;
  });
  assert(overviewClearance >= 8, `Overview is obscured by the sticky bar: ${overviewClearance}px`);
  assert.deepEqual(pageErrors, []);
  await page.mouse.move(1270, 1190);
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath });

  const rtlPage = await browser.newPage({
    viewport: { width: 320, height: 1000 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  rtlPage.on("pageerror", (error) => pageErrors.push(error.message));
  await rtlPage.goto(
    `${server.baseUrl}/src/sidepanel/index.html?app-locale=ar&app-dir=rtl#settings`,
  );
  await rtlPage.locator("#settings-usage-notifications").waitFor();
  const rtlNavButtons = rtlPage.locator(".settings-section-nav .settings-nav-chip");
  await rtlNavButtons.last().focus();
  await rtlPage.keyboard.press("Enter");
  await rtlPage.waitForFunction(() => {
    const nav = document.querySelector(".settings-section-nav");
    const active = nav?.querySelector('[aria-current="true"]');
    const section = document.getElementById("settings-provider-display");
    const bar = document.querySelector(".top-app-bar");
    if (!nav || !active || !section || !bar) return false;
    const navRect = nav.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    return activeRect.left >= navRect.left - 1 &&
      activeRect.right <= navRect.right + 1 &&
      section.getBoundingClientRect().top >= bar.getBoundingClientRect().bottom - 4;
  });
  assert.deepEqual(pageErrors, []);
  console.log(`Settings split browser check passed. Screenshot: ${screenshotPath}`);
} finally {
  await browser?.close();
  await server.close();
}
