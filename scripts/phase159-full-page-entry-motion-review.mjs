import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase159-full-page-entry-motion-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const sidepanelUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForText(page, text) {
  await page.waitForFunction(
    (expectedText) =>
      (document.body?.innerText ?? "")
        .toLowerCase()
        .includes(expectedText.toLowerCase()),
    text,
  );
}

async function collectFullPageMotionSnapshot(page) {
  return page.evaluate(() => {
    const appShell = document.querySelector(".app-shell");
    const styles = appShell ? window.getComputedStyle(appShell) : null;

    return {
      url: window.location.href,
      hash: window.location.hash,
      search: window.location.search,
      fullPageEntry: document.documentElement.dataset.fullPageEntry ?? null,
      appShellAnimationName: styles?.animationName ?? null,
      appShellTransformOrigin: styles?.transformOrigin ?? null,
      bodyText: document.body?.innerText ?? "",
    };
  });
}

await mkdir(artifactDir, { recursive: true });

const entryHelperSource = await readFile(
  path.join(projectRoot, "src", "shared", "extension-surface-entry.ts"),
  "utf8",
);
assert(
  entryHelperSource.includes("storePendingFullPageEntry"),
  "Full-page entry helper does not expose the pending-entry writer.",
);
assert(
  entryHelperSource.includes("consumePendingFullPageEntry"),
  "Full-page entry helper does not expose the pending-entry reader.",
);

const mainSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "main.tsx"),
  "utf8",
);
assert(
  mainSource.includes("consumePendingFullPageEntry"),
  "Sidepanel main entry does not consume pending full-page motion hints.",
);
assert(
  mainSource.includes("dataset.fullPageEntry"),
  "Sidepanel main entry does not expose the full-page motion entry marker.",
);

const cssSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "theme", "material-theme.css"),
  "utf8",
);
assert(
  cssSource.includes("app-full-page-enter-from-popup"),
  "Theme CSS does not define the popup-driven full-page entry animation.",
);
assert(
  cssSource.includes("app-full-page-enter-from-sidebar"),
  "Theme CSS does not define the sidebar-driven full-page entry animation.",
);

const browser = await chromium.launch({ headless: true });

try {
  const popupContext = await browser.newContext({
    viewport: { width: 640, height: 900 },
    reducedMotion: "no-preference",
  });
  const popupPage = await popupContext.newPage();
  popupPage.setDefaultTimeout(20_000);
  await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await waitForText(popupPage, "Quick glance");
  const popupOpenedPagePromise = popupContext.waitForEvent("page");
  await popupPage.locator("[data-popup-open-dashboard-tab='true']").click();
  const popupFullPage = await popupOpenedPagePromise;
  popupFullPage.setDefaultTimeout(20_000);
  await popupFullPage.waitForLoadState("domcontentloaded");
  await waitForText(popupFullPage, "One panel for AI coding quotas");
  const popupSnapshot = await collectFullPageMotionSnapshot(popupFullPage);
  assert(
    popupSnapshot.fullPageEntry === "popup-expand",
    `Popup full-page entry marker was ${JSON.stringify(popupSnapshot.fullPageEntry)} instead of popup-expand`,
  );
  assert(
    popupSnapshot.appShellAnimationName?.includes("app-full-page-enter-from-popup"),
    `Popup full-page animation name was ${JSON.stringify(popupSnapshot.appShellAnimationName)} instead of app-full-page-enter-from-popup`,
  );

  const sidebarContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "no-preference",
  });
  const sidepanelPage = await sidebarContext.newPage();
  sidepanelPage.setDefaultTimeout(20_000);
  await sidepanelPage.goto(sidepanelUrl, { waitUntil: "domcontentloaded" });
  await waitForText(sidepanelPage, "One panel for AI coding quotas");
  const sidebarOpenedPagePromise = sidebarContext.waitForEvent("page");
  await sidepanelPage.locator("[data-topbar-open-full-page='true']").click();
  const sidebarFullPage = await sidebarOpenedPagePromise;
  sidebarFullPage.setDefaultTimeout(20_000);
  await sidebarFullPage.waitForLoadState("domcontentloaded");
  await waitForText(sidebarFullPage, "One panel for AI coding quotas");
  const sidebarSnapshot = await collectFullPageMotionSnapshot(sidebarFullPage);
  assert(
    sidebarSnapshot.fullPageEntry === "sidebar-expand",
    `Sidebar full-page entry marker was ${JSON.stringify(sidebarSnapshot.fullPageEntry)} instead of sidebar-expand`,
  );
  assert(
    sidebarSnapshot.appShellAnimationName?.includes("app-full-page-enter-from-sidebar"),
    `Sidebar full-page animation name was ${JSON.stringify(sidebarSnapshot.appShellAnimationName)} instead of app-full-page-enter-from-sidebar`,
  );

  const reducedMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  const reducedMotionPage = await reducedMotionContext.newPage();
  reducedMotionPage.setDefaultTimeout(20_000);
  await reducedMotionPage.goto(sidepanelUrl, { waitUntil: "domcontentloaded" });
  await waitForText(reducedMotionPage, "One panel for AI coding quotas");
  const reducedMotionOpenedPagePromise = reducedMotionContext.waitForEvent("page");
  await reducedMotionPage.locator("[data-topbar-open-full-page='true']").click();
  const reducedMotionFullPage = await reducedMotionOpenedPagePromise;
  reducedMotionFullPage.setDefaultTimeout(20_000);
  await reducedMotionFullPage.waitForLoadState("domcontentloaded");
  await waitForText(reducedMotionFullPage, "One panel for AI coding quotas");
  const reducedMotionSnapshot = await collectFullPageMotionSnapshot(reducedMotionFullPage);
  assert(
    reducedMotionSnapshot.fullPageEntry === "sidebar-expand",
    `Reduced-motion full-page entry marker was ${JSON.stringify(reducedMotionSnapshot.fullPageEntry)} instead of sidebar-expand`,
  );
  assert(
    reducedMotionSnapshot.appShellAnimationName === "none",
    `Reduced-motion full-page animation name was ${JSON.stringify(reducedMotionSnapshot.appShellAnimationName)} instead of none`,
  );

  const popupScreenshotPath = path.join(artifactDir, "popup-fullpage-entry-motion.png");
  const sidebarScreenshotPath = path.join(artifactDir, "sidebar-fullpage-entry-motion.png");
  const reducedMotionScreenshotPath = path.join(artifactDir, "sidebar-fullpage-entry-reduced-motion.png");
  await popupFullPage.screenshot({ path: popupScreenshotPath, fullPage: true });
  await sidebarFullPage.screenshot({ path: sidebarScreenshotPath, fullPage: true });
  await reducedMotionFullPage.screenshot({ path: reducedMotionScreenshotPath, fullPage: true });

  await writeFile(
    path.join(artifactDir, "phase159-results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        popupSnapshot,
        sidebarSnapshot,
        reducedMotionSnapshot,
        popupScreenshotPath,
        sidebarScreenshotPath,
        reducedMotionScreenshotPath,
      },
      null,
      2,
    ),
  );

  console.log("phase159: full-page entry motion review verified");
} finally {
  await browser.close();
}
