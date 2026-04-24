import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase156-popup-expand-fullpage-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const expectedFullPageUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#dashboard";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForPopup(page) {
  await page.waitForFunction(() => {
    const bodyText = document.body?.innerText ?? "";
    return bodyText.includes("Quick glance") || bodyText.includes("Popup load failed");
  });
}

await mkdir(artifactDir, { recursive: true });

const popupSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupApp.tsx"),
  "utf8",
);
assert(
  popupSource.includes("buildFullPageExtensionPath"),
  "PopupApp does not import the full-page extension-path helper.",
);
assert(
  popupSource.includes('data-popup-open-dashboard-tab="true"'),
  "PopupApp does not expose the popup expand control marker.",
);
assert(
  popupSource.includes("openFullDashboardTab"),
  "PopupApp does not define the full-page dashboard opener.",
);

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 640, height: 900 },
  });
  const popupPage = await context.newPage();
  popupPage.setDefaultTimeout(20_000);

  await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await waitForPopup(popupPage);

  const headerSnapshot = await popupPage.evaluate(() => {
    const expandButton = document.querySelector("[data-popup-open-dashboard-tab='true']");

    return {
      bodyText: document.body?.innerText ?? "",
      expandLabel: expandButton?.textContent?.trim() ?? null,
      expandAriaLabel: expandButton?.getAttribute("aria-label"),
    };
  });

  assert(
    headerSnapshot.bodyText.includes("Quick glance"),
    "Popup did not reach the ready quick-glance state.",
  );
  assert(
    headerSnapshot.expandLabel === "Tab",
    `Popup expand label was ${JSON.stringify(headerSnapshot.expandLabel)} instead of "Tab"`,
  );
  assert(
    headerSnapshot.expandAriaLabel === "Open dashboard tab",
    `Popup expand aria-label was ${JSON.stringify(headerSnapshot.expandAriaLabel)} instead of "Open dashboard tab"`,
  );

  const openedPagePromise = context.waitForEvent("page");
  await popupPage.locator("[data-popup-open-dashboard-tab='true']").click();
  const fullPage = await openedPagePromise;
  fullPage.setDefaultTimeout(20_000);
  await fullPage.waitForLoadState("domcontentloaded");
  await fullPage.waitForFunction(() => {
    const bodyText = document.body?.innerText ?? "";
    return bodyText.toLowerCase().includes("one panel for ai coding quotas");
  });

  const fullPageSnapshot = await fullPage.evaluate(() => {
    const root = document.getElementById("root");

    return {
      url: window.location.href,
      hash: window.location.hash,
      search: window.location.search,
      htmlClassList: Array.from(document.documentElement.classList),
      bodyClassList: Array.from(document.body.classList),
      rootClassList: root ? Array.from(root.classList) : [],
      bodyText: document.body?.innerText ?? "",
    };
  });

  assert(
    fullPageSnapshot.url === expectedFullPageUrl,
    `Popup expand opened ${fullPageSnapshot.url} instead of ${expectedFullPageUrl}`,
  );
  assert(
    fullPageSnapshot.search === "?surface=full-page",
    `Full-page dashboard search was ${fullPageSnapshot.search} instead of ?surface=full-page`,
  );
  assert(
    fullPageSnapshot.hash === "#dashboard",
    `Full-page dashboard hash was ${fullPageSnapshot.hash} instead of #dashboard`,
  );
  assert(
    fullPageSnapshot.htmlClassList.includes("full-page-shell"),
    "Expanded dashboard page did not include the full-page-shell html class.",
  );
  assert(
    fullPageSnapshot.bodyText.toLowerCase().includes("one panel for ai coding quotas"),
    "Expanded dashboard tab did not render the dashboard hero copy.",
  );

  const popupScreenshotPath = path.join(artifactDir, "popup-before-expand.png");
  const fullPageScreenshotPath = path.join(
    artifactDir,
    "popup-expand-dashboard-fullpage.png",
  );
  await popupPage.screenshot({ path: popupScreenshotPath, fullPage: true });
  await fullPage.screenshot({ path: fullPageScreenshotPath, fullPage: true });

  await writeFile(
    path.join(artifactDir, "phase156-results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        popupUrl,
        expectedFullPageUrl,
        popupScreenshotPath,
        fullPageScreenshotPath,
        headerSnapshot,
        fullPageSnapshot,
      },
      null,
      2,
    ),
  );

  console.log("phase156: popup expand full-page review verified");
} finally {
  await browser.close();
}
