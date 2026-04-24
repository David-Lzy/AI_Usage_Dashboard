import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase158-popup-sidebar-theme-toggle-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const sidepanelDashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const fullPageSettingsUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#settings";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForCaseInsensitiveText(page, text) {
  await page.waitForFunction(
    (expectedText) =>
      (document.body?.innerText ?? "")
        .toLowerCase()
        .includes(expectedText.toLowerCase()),
    text,
  );
}

async function collectThemeSnapshot(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const popupToggle = document.querySelector("[data-popup-toggle-theme-mode='true']");
    const topBarToggle = document.querySelector("[data-topbar-toggle-theme-mode='true']");
    const toggle = popupToggle ?? topBarToggle;

    return {
      themeMode: html.dataset.themeMode ?? null,
      themeResolved: html.dataset.themeResolved ?? null,
      toggleLabel: toggle?.textContent?.trim() ?? null,
      toggleAriaLabel: toggle?.getAttribute("aria-label") ?? null,
      hasPopupToggle: Boolean(popupToggle),
      hasTopBarToggle: Boolean(topBarToggle),
    };
  });
}

await mkdir(artifactDir, { recursive: true });

const popupSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupApp.tsx"),
  "utf8",
);
assert(
  popupSource.includes('data-popup-toggle-theme-mode="true"'),
  "PopupApp does not expose the popup theme toggle review marker.",
);

const topBarSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "components", "TopBar.tsx"),
  "utf8",
);
assert(
  topBarSource.includes('data-topbar-toggle-theme-mode="true"'),
  "TopBar does not expose the sidepanel theme toggle review marker.",
);

const browser = await chromium.launch({ headless: true });

try {
  const popupContext = await browser.newContext({
    viewport: { width: 640, height: 900 },
    colorScheme: "light",
  });
  const popupPage = await popupContext.newPage();
  popupPage.setDefaultTimeout(20_000);
  await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await waitForCaseInsensitiveText(popupPage, "Quick glance");

  const popupBefore = await collectThemeSnapshot(popupPage);
  assert(popupBefore.hasPopupToggle, "Popup did not render the quick theme toggle.");
  assert(popupBefore.toggleLabel === "Dark", `Popup toggle label was ${JSON.stringify(popupBefore.toggleLabel)} instead of "Dark".`);
  assert(popupBefore.toggleAriaLabel === "Switch to dark mode", `Popup toggle aria-label was ${JSON.stringify(popupBefore.toggleAriaLabel)} instead of "Switch to dark mode".`);

  await popupPage.locator("[data-popup-toggle-theme-mode='true']").click();
  await popupPage.waitForFunction(() => document.documentElement.dataset.themeMode === "dark");
  const popupAfter = await collectThemeSnapshot(popupPage);
  assert(popupAfter.themeMode === "dark", `Popup theme mode was ${popupAfter.themeMode} instead of dark.`);
  assert(popupAfter.themeResolved === "dark", `Popup resolved theme was ${popupAfter.themeResolved} instead of dark.`);
  assert(popupAfter.toggleLabel === "Light", `Popup toggle label after click was ${JSON.stringify(popupAfter.toggleLabel)} instead of "Light".`);

  const sidepanelContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    colorScheme: "light",
  });
  const sidepanelPage = await sidepanelContext.newPage();
  sidepanelPage.setDefaultTimeout(20_000);
  await sidepanelPage.goto(sidepanelDashboardUrl, { waitUntil: "domcontentloaded" });
  await waitForCaseInsensitiveText(sidepanelPage, "One panel for AI coding quotas");

  const sidepanelBefore = await collectThemeSnapshot(sidepanelPage);
  assert(sidepanelBefore.hasTopBarToggle, "Sidepanel dashboard did not render the top-bar theme toggle.");
  assert(sidepanelBefore.toggleLabel === "Dark", `Sidepanel toggle label was ${JSON.stringify(sidepanelBefore.toggleLabel)} instead of "Dark".`);
  assert(sidepanelBefore.toggleAriaLabel === "Switch to dark mode", `Sidepanel toggle aria-label was ${JSON.stringify(sidepanelBefore.toggleAriaLabel)} instead of "Switch to dark mode".`);

  await sidepanelPage.locator("[data-topbar-toggle-theme-mode='true']").click();
  await sidepanelPage.waitForFunction(() => document.documentElement.dataset.themeMode === "dark");
  const sidepanelAfter = await collectThemeSnapshot(sidepanelPage);
  assert(sidepanelAfter.themeMode === "dark", `Sidepanel theme mode was ${sidepanelAfter.themeMode} instead of dark.`);
  assert(sidepanelAfter.themeResolved === "dark", `Sidepanel resolved theme was ${sidepanelAfter.themeResolved} instead of dark.`);
  assert(sidepanelAfter.toggleLabel === "Light", `Sidepanel toggle label after click was ${JSON.stringify(sidepanelAfter.toggleLabel)} instead of "Light".`);

  const fullPageContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    colorScheme: "light",
  });
  const fullPage = await fullPageContext.newPage();
  fullPage.setDefaultTimeout(20_000);
  await fullPage.goto(fullPageSettingsUrl, { waitUntil: "domcontentloaded" });
  await waitForCaseInsensitiveText(fullPage, "Control surface summary");

  const fullPageBefore = await collectThemeSnapshot(fullPage);
  assert(fullPageBefore.hasTopBarToggle, "Full-page settings did not inherit the top-bar theme toggle.");
  assert(fullPageBefore.toggleLabel === "Dark", `Full-page toggle label was ${JSON.stringify(fullPageBefore.toggleLabel)} instead of "Dark".`);

  await fullPage.locator("[data-topbar-toggle-theme-mode='true']").click();
  await fullPage.waitForFunction(() => document.documentElement.dataset.themeMode === "dark");
  const fullPageAfter = await collectThemeSnapshot(fullPage);
  assert(fullPageAfter.themeMode === "dark", `Full-page theme mode was ${fullPageAfter.themeMode} instead of dark.`);
  assert(fullPageAfter.themeResolved === "dark", `Full-page resolved theme was ${fullPageAfter.themeResolved} instead of dark.`);
  assert(fullPageAfter.toggleLabel === "Light", `Full-page toggle label after click was ${JSON.stringify(fullPageAfter.toggleLabel)} instead of "Light".`);

  const popupScreenshotPath = path.join(artifactDir, "popup-theme-toggle.png");
  const sidepanelScreenshotPath = path.join(artifactDir, "sidepanel-theme-toggle.png");
  const fullPageScreenshotPath = path.join(artifactDir, "fullpage-settings-theme-toggle.png");
  await popupPage.screenshot({ path: popupScreenshotPath, fullPage: true });
  await sidepanelPage.screenshot({ path: sidepanelScreenshotPath, fullPage: true });
  await fullPage.screenshot({ path: fullPageScreenshotPath, fullPage: true });

  await writeFile(
    path.join(artifactDir, "phase158-results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        popupUrl,
        sidepanelDashboardUrl,
        fullPageSettingsUrl,
        popupBefore,
        popupAfter,
        sidepanelBefore,
        sidepanelAfter,
        fullPageBefore,
        fullPageAfter,
        popupScreenshotPath,
        sidepanelScreenshotPath,
        fullPageScreenshotPath,
      },
      null,
      2,
    ),
  );

  console.log("phase158: popup and sidepanel theme toggle review verified");
} finally {
  await browser.close();
}
