import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const arg = (name) =>
  process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
assert(
  arg("--baseline") && arg("--extension"),
  "Pass isolated --baseline and --extension builds",
);
const baseline = path.resolve(arg("--baseline"));
const candidate = path.resolve(arg("--extension"));
const motionMode = arg("--motion-mode") ?? "reduced";
assert(["full", "system", "reduced"].includes(motionMode), "Test a legacy motion choice");
for (const source of [baseline, candidate])
  assert(
    !source.startsWith(path.resolve("dist") + path.sep),
    "Never replace a loaded build",
  );
const root = path.resolve("tmp/output/playwright/fusion-upgrade");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const installed = path.join(output, "owned-extension");
const profile = path.join(output, "owned-profile");
const stateKey = "ai-usage-dashboard.app-state";
const report = {
  passed: false,
  baseline,
  candidate,
  motionMode,
  errors: [],
  remoteRequests: [],
};
let context;
const launch = async () => {
  context = await chromium.launchPersistentContext(profile, {
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : { channel: "chromium" }),
    headless: true,
    offline: true,
    timezoneId: "UTC",
    reducedMotion: "reduce",
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 },
    args: [
      `--disable-extensions-except=${installed}`,
      `--load-extension=${installed}`,
    ],
  });
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url()))
      report.remoteRequests.push(request.url());
  });
  await page.goto(
    `${origin}/src/sidepanel/index.html?surface=full-page#dashboard`,
  );
  await page.locator(".dashboard-section").waitFor();
  return { worker, page, origin };
};
const read = (page) =>
  page.evaluate(async () => {
    const result = await chrome.runtime.sendMessage({ type: "app:read-state" });
    if (!result.ok) throw new Error("State read rejected");
    return result.state;
  });
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const permissions = (worker) =>
  worker.evaluate(() => chrome.permissions.getAll());
try {
  await cp(baseline, installed, { recursive: true });
  let runtime = await launch();
  report.extensionId = new URL(runtime.origin).host;
  await runtime.page.goto(
    `${runtime.origin}/src/sidepanel/index.html?preset=toolbar-first-quick-glance#debug-store-screenshot-seed`,
  );
  await runtime.page.waitForFunction(
    () => document.title === "AI Usage Dashboard Screenshot Seed Applied",
  );
  const update = await runtime.page.evaluate((motionMode) =>
    chrome.runtime.sendMessage({
      type: "app:update-settings",
      settings: {
        locale: "en",
        userLevel: "advanced",
        syncIntervalMinutes: 7,
        warningThresholdPercent: 73,
        themeMode: "dark",
        themePreset: "custom",
        themeCustomSeedHex: "#327c72",
        uiFontFamily: "serif",
        motionMode,
        popupProgressStyle: "circle-gauge",
        sidebarProgressStyle: "circle",
        fullPageProgressStyle: "line",
        popupProviderBrowsingMode: "switch",
        popupSizePreset: "wide",
        actionBadgeRotationIntervalSeconds: 180,
        progressThicknessPx: 7,
      },
    }), motionMode,
  );
  assert.equal(update.ok, true);
  const before = await read(runtime.page);
  const beforePermissions = await permissions(runtime.worker);
  assert.equal(
    Object.keys(before.settings).length,
    34,
    "Update the parity inventory for new settings",
  );
  assert.equal(before.settings.warningThresholdPercent, 73);
  await runtime.page.goto(
    `${runtime.origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-data`,
  );
  const downloadPromise = runtime.page.waitForEvent("download");
  await runtime.page
    .getByRole("button", { name: "Export JSON", exact: true })
    .click();
  const download = await downloadPromise;
  const backupPath = path.join(output, "synthetic-021-backup.json");
  await download.saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  assert.deepEqual(backup.payload.settings, before.settings);
  for (const key of [
    "providers",
    "providerAccounts",
    "providerSecrets",
    "customSourceStates",
  ])
    assert(!(key in backup.payload));
  await context.close();
  context = undefined;

  // Only this harness-created extension directory is replaced. The profile and
  // extension path remain identical, as with an unpacked code upgrade.
  await cp(candidate, installed, { recursive: true, force: true });
  runtime = await launch();
  assert.equal(new URL(runtime.origin).host, report.extensionId);
  const after = await read(runtime.page);
  assert.deepEqual(
    after.settings,
    before.settings,
    "Saved settings changed across code upgrade",
  );
  assert.deepEqual(
    after.providerAccounts,
    before.providerAccounts,
    "Account selection/metadata changed",
  );
  assert.deepEqual(
    after.providers,
    before.providers,
    "Cached usage changed without a requested refresh",
  );
  assert.deepEqual(await permissions(runtime.worker), beforePermissions);
  report.settings = {
    count: Object.keys(before.settings).length,
    sha256: hash(before.settings),
    preserved: true,
  };
  report.accountStatePreserved = true;
  report.usagePreserved = true;
  report.permissionsUnchanged = true;
  report.versions = await Promise.all(
    [baseline, candidate].map(
      async (dir) =>
        JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"))
          .version,
    ),
  );

  await runtime.page.goto(
    `${runtime.origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-data`,
  );
  await runtime.page.locator('[data-backup-action="export"]').waitFor();
  await runtime.page.evaluate(() =>
    chrome.runtime.sendMessage({
      type: "app:update-settings",
      settings: { warningThresholdPercent: 91 },
    }),
  );
  await runtime.page
    .locator('[data-backup-action="import"]')
    .setInputFiles(backupPath);
  await runtime.page.waitForFunction(
    (key) =>
      chrome.storage.local
        .get(key)
        .then((value) => value[key]?.settings.warningThresholdPercent === 73),
    stateKey,
  );
  const imported = await read(runtime.page);
  assert.deepEqual(
    imported.settings,
    before.settings,
    "0.2.1 backup did not retain all settings",
  );
  assert.deepEqual(imported.providerAccounts, before.providerAccounts);
  assert.deepEqual(await permissions(runtime.worker), beforePermissions);
  report.backupRoundTrip = true;

  for (const [section, category] of [
    ["settings-quick-setup", "connections"],
    ["settings-usage-notifications", "usage"],
    ["settings-appearance", "appearance"],
    ["settings-overview", "general"],
    ["settings-data", "data"],
    ["settings-provider-display", "appearance"],
  ]) {
    await runtime.page.evaluate((section) => {
      location.hash = `#settings/section/${section}`;
    }, section);
    await runtime.page.waitForFunction(
      (category) =>
        document
          .querySelector(`[data-settings-category-link="${category}"]`)
          ?.getAttribute("aria-current") === "page",
      category,
    );
    await runtime.page.locator(`#${section}`).waitFor({ state: "visible" });
  }
  await runtime.page.screenshot({
    path: path.join(output, "upgraded-appearance.png"),
  });

  const sessionKey =
    "ai-usage-dashboard:surface-session-state:standard:settings";
  await runtime.worker.evaluate(async (sessionKey) => {
    const existing = (await chrome.storage.session.get(sessionKey))[sessionKey];
    if (!existing?.state?.settings)
      throw new Error("Settings session was not captured");
    existing.state.settings.activeSectionId = "settings-appearance";
    existing.state.scrollY = 0;
    existing.state.scrollProgress = 0;
    await chrome.storage.session.set({ [sessionKey]: existing });
  }, sessionKey);
  const restored = await context.newPage();
  await restored.addInitScript(() => {
    const original = chrome.storage.session.get.bind(chrome.storage.session);
    chrome.storage.session.get = async (...args) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return original(...args);
    };
    window.__categoryFrames = [];
    const sample = () => {
      const heading = document.querySelector(".settings-category-heading");
      if (heading?.checkVisibility({ visibilityProperty: true }))
        window.__categoryFrames.push(heading.textContent);
      window.__categoryFrameHandle = requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await restored.goto(
    `${runtime.origin}/src/sidepanel/index.html?surface=full-page#settings`,
  );
  await restored.waitForFunction(
    () =>
      document
        .querySelector('[data-settings-category-link="appearance"]')
        ?.getAttribute("aria-current") === "page",
  );
  await restored
    .locator('.settings-category-layout[data-category-restoring="false"]')
    .waitFor({ state: "visible" });
  await restored.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  report.restorationVisibleHeadings = await restored.evaluate(() => {
    cancelAnimationFrame(window.__categoryFrameHandle);
    return [...new Set(window.__categoryFrames)];
  });
  assert.deepEqual(
    report.restorationVisibleHeadings,
    ["Appearance & display"],
    "Restoration flashed the default category before the saved category",
  );
  const cdp = await context.newCDPSession(restored);
  const tree = await cdp.send("Accessibility.getFullAXTree");
  report.accessibility = {
    headings: tree.nodes
      .filter((node) => !node.ignored && node.role?.value === "heading")
      .map((node) => node.name?.value),
    namedControls: tree.nodes
      .filter(
        (node) =>
          !node.ignored &&
          ["button", "combobox", "textbox"].includes(node.role?.value),
      )
      .map((node) => ({ role: node.role.value, name: node.name?.value })),
    headingLive: await restored
      .locator(".settings-category-heading")
      .getAttribute("aria-live"),
  };
  assert.equal(report.accessibility.headingLive, "polite");
  assert(
    report.accessibility.namedControls
      .every((control) => control.name),
  );
  const selectNames = await restored.locator('mdui-select:visible input:not(.hidden-input)').evaluateAll((inputs) => inputs.map((input) => input.getAttribute('aria-label')));
  assert(selectNames.length > 0);
  assert(selectNames.every((name) => report.accessibility.namedControls.some((control) => control.role === 'button' && control.name === name)), 'Every visible MDUI select must expose a named menu button in the AX tree');
  await restored.screenshot({
    path: path.join(output, "restored-category.png"),
  });
  const failedRestore = await context.newPage();
  await failedRestore.addInitScript(() => {
    chrome.storage.session.get = async () => {
      throw new Error("Synthetic session read rejection");
    };
  });
  await failedRestore.goto(
    `${runtime.origin}/src/sidepanel/index.html?surface=full-page#settings`,
  );
  await failedRestore
    .locator('.settings-category-layout[data-category-restoring="false"]')
    .waitFor({ state: "visible" });
  assert.equal(
    await failedRestore
      .locator('[data-settings-category-link="connections"]')
      .getAttribute("aria-current"),
    "page",
  );
  assert.equal(
    await failedRestore
      .locator(".settings-category-layout")
      .evaluate((element) => element.inert),
    false,
  );
  report.failedSessionReadFallsBack = true;
  await failedRestore.close();
  const interruptedRestore = await context.newPage();
  await interruptedRestore.addInitScript(() => {
    const original = chrome.storage.session.get.bind(chrome.storage.session);
    chrome.storage.session.get = async (...args) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return original(...args);
    };
  });
  await interruptedRestore.goto(
    `${runtime.origin}/src/sidepanel/index.html?surface=full-page#settings`,
  );
  await interruptedRestore
    .locator('[data-category-restoring="true"]')
    .waitFor({ state: "attached" });
  await interruptedRestore.evaluate(() => {
    location.hash = "#settings/section/settings-usage-notifications";
  });
  await interruptedRestore
    .locator("#settings-usage-notifications")
    .waitFor({ state: "visible" });
  await interruptedRestore.waitForTimeout(650);
  assert.equal(
    await interruptedRestore
      .locator('[data-settings-category-link="usage"]')
      .getAttribute("aria-current"),
    "page",
  );
  assert.equal(
    await interruptedRestore
      .locator(".settings-category-layout")
      .evaluate((element) => element.inert),
    false,
  );
  report.newDeepLinkWinsRestoration = true;
  const themed = await context.newPage();
  await themed.clock.install({ time: new Date("2026-10-02T06:59:00Z") });
  await runtime.page.evaluate(() =>
    chrome.runtime.sendMessage({
      type: "app:update-settings",
      settings: { themeMode: "time" },
    }),
  );
  await themed.goto(
    `${runtime.origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-appearance`,
  );
  await themed.waitForFunction(
    () => document.documentElement.dataset.themeResolved === "dark",
  );
  await themed.clock.fastForward(120_000);
  await themed.waitForFunction(
    () => document.documentElement.dataset.themeResolved === "light",
  );
  await themed.clock.fastForward(12 * 60 * 60 * 1000);
  await themed.waitForFunction(
    () => document.documentElement.dataset.themeResolved === "dark",
  );
  report.timeThemeTransitions = ["06:59 dark", "07:01 light", "19:01 dark"];
  await themed.clock.resume();
  await themed.evaluate(() =>
    chrome.runtime.sendMessage({
      type: "app:update-settings",
      settings: { themeMode: "system" },
    }),
  );
  await themed.emulateMedia({ colorScheme: "light" });
  await themed.waitForFunction(
    () => document.documentElement.dataset.themeResolved === "light",
  );
  await themed.emulateMedia({ colorScheme: "dark" });
  await themed.waitForFunction(
    () => document.documentElement.dataset.themeResolved === "dark",
  );
  report.systemThemeTransitions = true;
  assert(
    (
      await themed.evaluate(() => getComputedStyle(document.body).fontFamily)
    ).includes("serif"),
  );
  assert.equal(
    await themed.evaluate(
      () => document.documentElement.dataset.motionResolved,
    ),
    motionMode === "full" ? "full" : "reduced",
  );
  const field = themed
    .locator(".fusion-field")
    .filter({ visible: true })
    .first();
  const originalAccent = await field.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--mdui-color-primary"),
  );
  await themed.evaluate(() =>
    chrome.runtime.sendMessage({
      type: "app:update-settings",
      settings: { themeCustomSeedHex: "#d42542" },
    }),
  );
  await themed.waitForFunction((previous) => {
    const element = [...document.querySelectorAll(".fusion-field")].find(
      (entry) => entry.checkVisibility({ visibilityProperty: true }),
    );
    return (
      getComputedStyle(element).getPropertyValue("--mdui-color-primary") !==
      previous
    );
  }, originalAccent);
  report.customFontAndThemeRetained = true;
  await themed.evaluate(async () => {
    const tab = await chrome.tabs.getCurrent();
    await chrome.tabs.setZoom(tab.id, 2);
  });
  await themed.waitForFunction(() => innerWidth <= 800);
  await themed
    .locator(".settings-category-mobile")
    .waitFor({ state: "visible" });
  await themed.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  report.zoom = await themed.evaluate(() => ({
    cssWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    outside: [...document.querySelectorAll("body *")]
      .filter(
        (element) =>
          element.checkVisibility({ visibilityProperty: true }) &&
          element.getBoundingClientRect().right > innerWidth + 1,
      )
      .map((element) => ({
        tag: element.tagName,
        class: element.className,
        width: element.getBoundingClientRect().width,
        right: element.getBoundingClientRect().right,
      }))
      .slice(0, 30),
  }));
  await themed.screenshot({
    path: path.join(output, "settings-200-percent-zoom.png"),
  });
  assert(
    report.zoom.documentWidth <= report.zoom.cssWidth + 1,
    "Settings overflow at 200% browser zoom",
  );
  await themed.evaluate(async () => {
    const tab = await chrome.tabs.getCurrent();
    await chrome.tabs.setZoom(tab.id, 1);
  });
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.remoteRequests, []);
  report.passed = true;
} finally {
  if (context) await context.close();
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(`Evidence: ${output}`);
}
