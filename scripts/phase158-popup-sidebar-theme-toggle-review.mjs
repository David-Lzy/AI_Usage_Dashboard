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

async function collectThemeSnapshot(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const popupToggle = document.querySelector("[data-popup-toggle-theme-mode='true']");
    const topBarToggle = document.querySelector("[data-topbar-toggle-theme-mode='true']");
    const toggle = popupToggle ?? topBarToggle;

    return {
      themeMode: html.dataset.themeMode ?? null,
      themeResolved: html.dataset.themeResolved ?? null,
      popupThemeMode: popupToggle?.getAttribute("data-theme-mode") ?? null,
      toggleLabel: toggle?.textContent?.trim() ?? null,
      toggleAriaLabel: toggle?.getAttribute("aria-label") ?? null,
      themeMenuExpanded: popupToggle?.getAttribute("aria-expanded") ?? null,
      providerCardClassName:
        document.querySelector(".popup-provider-card")?.className ?? null,
      providerStatusText:
        document
          .querySelector(".popup-provider-card__status")
          ?.textContent?.trim() ?? null,
      hasPopupToggle: Boolean(popupToggle),
      hasTopBarToggle: Boolean(topBarToggle),
    };
  });
}

await mkdir(artifactDir, { recursive: true });

const popupSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupHeaderSection.tsx"),
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
  await popupPage.waitForSelector("[data-popup-toggle-theme-mode='true']");

  const popupBefore = await collectThemeSnapshot(popupPage);
  assert(popupBefore.hasPopupToggle, "Popup did not render the quick theme toggle.");
  assert(
    popupBefore.toggleAriaLabel?.startsWith("Theme mode:"),
    `Popup toggle aria-label did not describe the current mode: ${JSON.stringify(popupBefore.toggleAriaLabel)}.`,
  );

  await popupPage.locator("[data-popup-toggle-theme-mode='true']").click();
  const popupMenuOptions = popupPage.locator('[role="menuitemradio"]');
  assert(
    (await popupMenuOptions.count()) === 4,
    "Popup theme menu did not expose four explicit modes.",
  );
  const popupThemeMenuScreenshotPath = path.join(
    artifactDir,
    "popup-theme-menu.png",
  );
  await popupPage.screenshot({
    path: popupThemeMenuScreenshotPath,
    fullPage: true,
  });
  await popupPage.getByRole("menuitemradio", { name: "Dark" }).click();
  await popupPage.waitForFunction(() => document.documentElement.dataset.themeMode === "dark");
  const popupAfter = await collectThemeSnapshot(popupPage);
  assert(popupAfter.themeMode === "dark", `Popup theme mode was ${popupAfter.themeMode} instead of dark.`);
  assert(popupAfter.themeResolved === "dark", `Popup resolved theme was ${popupAfter.themeResolved} instead of dark.`);
  assert(
    popupAfter.popupThemeMode === "dark",
    `Popup trigger showed ${popupAfter.popupThemeMode} instead of the active dark mode.`,
  );
  assert(
    popupAfter.providerCardClassName === popupBefore.providerCardClassName,
    "Popup theme selection changed the Provider card status surface.",
  );
  assert(
    popupAfter.providerStatusText === popupBefore.providerStatusText,
    "Popup theme selection changed the Provider status indicator.",
  );

  const sidepanelContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    colorScheme: "light",
  });
  const sidepanelPage = await sidepanelContext.newPage();
  sidepanelPage.setDefaultTimeout(20_000);
  await sidepanelPage.goto(sidepanelDashboardUrl, { waitUntil: "domcontentloaded" });
  await sidepanelPage.waitForSelector("[data-topbar-toggle-theme-mode='true']");

  const sidepanelBefore = await collectThemeSnapshot(sidepanelPage);
  assert(sidepanelBefore.hasTopBarToggle, "Sidepanel dashboard did not render the top-bar theme toggle.");

  await sidepanelPage.locator("[data-topbar-toggle-theme-mode='true']").click();
  await sidepanelPage.waitForFunction(
    (previousMode) =>
      document.documentElement.dataset.themeMode !== previousMode,
    sidepanelBefore.themeMode,
  );
  const sidepanelAfter = await collectThemeSnapshot(sidepanelPage);
  assert(
    sidepanelAfter.themeMode !== sidepanelBefore.themeMode,
    "Sidepanel quick theme action did not advance the theme mode.",
  );

  const fullPageContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    colorScheme: "light",
  });
  const fullPage = await fullPageContext.newPage();
  fullPage.setDefaultTimeout(20_000);
  await fullPage.goto(fullPageSettingsUrl, { waitUntil: "domcontentloaded" });
  await fullPage.waitForSelector("[data-topbar-toggle-theme-mode='true']");

  const fullPageBefore = await collectThemeSnapshot(fullPage);
  assert(fullPageBefore.hasTopBarToggle, "Full-page settings did not inherit the top-bar theme toggle.");

  await fullPage.locator("[data-topbar-toggle-theme-mode='true']").click();
  await fullPage.waitForFunction(
    (previousMode) =>
      document.documentElement.dataset.themeMode !== previousMode,
    fullPageBefore.themeMode,
  );
  const fullPageAfter = await collectThemeSnapshot(fullPage);
  assert(
    fullPageAfter.themeMode !== fullPageBefore.themeMode,
    "Full-page quick theme action did not advance the theme mode.",
  );

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
        popupThemeMenuScreenshotPath,
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
