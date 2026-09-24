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
          } else if (message.change.type === "enabled") {
            notificationPreferences.enabled = message.change.value;
          } else if (message.change.type === "paused") {
            notificationPreferences.paused = message.change.value;
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
  assert.equal(
    await page.locator("main.settings-shell > .settings-section-anchor").first().getAttribute("id"),
    "settings-quick-setup",
  );
  assert.equal(
    await page.locator(".settings-section-nav .settings-nav-chip").first().innerText(),
    "Quick Setup",
  );
  assert.equal(
    await page.locator(".settings-section-nav .settings-nav-chip").first().getAttribute("aria-current"),
    "true",
  );
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
  const expandedLayout = await usage.evaluate((section) => {
    const sync = section.querySelector('[data-settings-custom-number-field="sync-interval"]')?.getBoundingClientRect();
    const warning = section.querySelector('[data-settings-custom-number-field="warning-threshold"]')?.getBoundingClientRect();
    const mode = section.querySelector('[data-settings-material-select="quota-notification-mode"]')?.getBoundingClientRect();
    const details = section.querySelector(".quota-notification-settings__body")?.getBoundingClientRect();
    return sync && warning && mode && details
      ? { tops: [sync.top, warning.top, mode.top], bottoms: [sync.bottom, warning.bottom, mode.bottom],
          detailTop: details.top, detailLeft: details.left, detailWidth: details.width, syncLeft: sync.left, modeWidth: mode.width }
      : null;
  });
  assert(expandedLayout, "Notification controls or expanded details are missing");
  assert(Math.max(...expandedLayout.tops) - Math.min(...expandedLayout.tops) < 4, JSON.stringify(expandedLayout));
  assert(expandedLayout.detailTop >= Math.max(...expandedLayout.bottoms), JSON.stringify(expandedLayout));
  assert(Math.abs(expandedLayout.detailLeft - expandedLayout.syncLeft) < 4, JSON.stringify(expandedLayout));
  assert(expandedLayout.detailWidth > expandedLayout.modeWidth * 2, JSON.stringify(expandedLayout));
  await page.setViewportSize({ width: 980, height: 1200 });
  await page.waitForFunction(() => {
    const section = document.querySelector("#settings-usage-notifications");
    const sync = section?.querySelector('[data-settings-custom-number-field="sync-interval"]')?.getBoundingClientRect();
    const mode = section?.querySelector('[data-settings-material-select="quota-notification-mode"]')?.getBoundingClientRect();
    const details = section?.querySelector(".quota-notification-settings__body")?.getBoundingClientRect();
    return Boolean(sync && mode && details && Math.abs(sync.top - mode.top) < 4 && details.top >= mode.bottom);
  });
  await page.setViewportSize({ width: 900, height: 1200 });
  await page.waitForFunction(() => {
    const section = document.querySelector("#settings-usage-notifications");
    const warning = section?.querySelector('[data-settings-custom-number-field="warning-threshold"]')?.getBoundingClientRect();
    const mode = section?.querySelector('[data-settings-material-select="quota-notification-mode"]')?.getBoundingClientRect();
    return Boolean(warning && mode && mode.top > warning.top + 4);
  });
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.waitForFunction(() => {
    const section = document.querySelector("#settings-usage-notifications");
    const sync = section?.querySelector('[data-settings-custom-number-field="sync-interval"]')?.getBoundingClientRect();
    const mode = section?.querySelector('[data-settings-material-select="quota-notification-mode"]')?.getBoundingClientRect();
    return Boolean(sync && mode && Math.abs(sync.top - mode.top) < 4);
  });

  for (const [sectionId, label] of [
    ["settings-quick-setup", "Quick Setup"],
    ["settings-overview", "Overview"],
    ["settings-appearance", "Appearance"],
    ["settings-usage-notifications", "Usage & Notifications"],
  ]) {
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
  const notificationMode = usage.locator(
    '[data-settings-material-select="quota-notification-mode"] button',
  );
  await notificationMode.click();
  await page.locator('.material-select__menu [id$="-option-off"]').click();
  await page.waitForFunction(
    () => window.__settingsSplitQa.notificationPreferences.enabled === false,
  );
  assert.equal(await usage.locator(".quota-notification-settings__account").count(), 0);
  const collapsedLayout = await usage.evaluate((section) => {
    const sync = section.querySelector('[data-settings-custom-number-field="sync-interval"]')?.getBoundingClientRect();
    const warning = section.querySelector('[data-settings-custom-number-field="warning-threshold"]')?.getBoundingClientRect();
    const mode = section.querySelector('[data-settings-material-select="quota-notification-mode"]')?.getBoundingClientRect();
    return sync && warning && mode
      ? { tops: [sync.top, warning.top, mode.top], widths: [sync.width, warning.width, mode.width] }
      : null;
  });
  assert(collapsedLayout, "Notification mode dropdown is missing");
  assert(Math.max(...collapsedLayout.tops) - Math.min(...collapsedLayout.tops) < 4, JSON.stringify(collapsedLayout));
  assert(Math.max(...collapsedLayout.widths) - Math.min(...collapsedLayout.widths) < 4, JSON.stringify(collapsedLayout));
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  });
  await page.waitForTimeout(200);
  const quickSetupClearance = await page.evaluate(() => {
    const quickSetup = document.querySelector("#settings-quick-setup");
    const bar = document.querySelector(".top-app-bar");
    return quickSetup.getBoundingClientRect().top - bar.getBoundingClientRect().bottom;
  });
  assert(quickSetupClearance >= 8, `Quick Setup is obscured by the sticky bar: ${quickSetupClearance}px`);
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
  assert.equal(
    await rtlPage.locator("main.settings-shell > .settings-section-anchor").first().getAttribute("id"),
    "settings-quick-setup",
  );
  assert.equal(
    await rtlPage.locator(".settings-section-nav .settings-nav-chip").first().getAttribute("aria-current"),
    "true",
  );
  const narrowLayout = await rtlPage.locator("#settings-usage-notifications").evaluate((section) => {
    const sync = section.querySelector('[data-settings-custom-number-field="sync-interval"]')?.getBoundingClientRect();
    const warning = section.querySelector('[data-settings-custom-number-field="warning-threshold"]')?.getBoundingClientRect();
    const mode = section.querySelector('[data-settings-material-select="quota-notification-mode"]')?.getBoundingClientRect();
    return sync && warning && mode ? [sync.top, warning.top, mode.top] : null;
  });
  assert(narrowLayout && narrowLayout[0] < narrowLayout[1] && narrowLayout[1] < narrowLayout[2], JSON.stringify(narrowLayout));
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
