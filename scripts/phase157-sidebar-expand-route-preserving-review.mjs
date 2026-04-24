import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase157-sidebar-expand-route-preserving-review",
);

const scenarios = [
  {
    name: "dashboard",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard",
    expectedFullPageUrl:
      "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#dashboard",
    expectedHash: "#dashboard",
    readyText: "One panel for AI coding quotas",
    expectedAriaLabel: "Open dashboard tab",
  },
  {
    name: "settings",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html#settings",
    expectedFullPageUrl:
      "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#settings",
    expectedHash: "#settings",
    readyText: "Control surface summary",
    expectedAriaLabel: "Open settings tab",
  },
  {
    name: "provider-detail",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/cursor",
    expectedFullPageUrl:
      "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#provider-detail/cursor",
    expectedHash: "#provider-detail/cursor",
    readyText: "Current provider source snapshot",
    expectedAriaLabel: "Open Cursor detail tab",
  },
];

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

await mkdir(artifactDir, { recursive: true });

const topBarSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "components", "TopBar.tsx"),
  "utf8",
);
assert(
  topBarSource.includes('data-topbar-open-full-page="true"'),
  "TopBar does not expose the full-page expand review marker.",
);

const appSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "App.tsx"),
  "utf8",
);
assert(
  appSource.includes("buildFullPageExtensionPath"),
  "Sidepanel App does not import the full-page route helper.",
);
assert(
  appSource.includes("handleOpenCurrentRouteInFullPage"),
  "Sidepanel App does not define the current-route full-page opener.",
);
assert(
  appSource.includes("isFullPageSurfaceSearch"),
  "Sidepanel App does not gate the expand button by current surface.",
);

const browser = await chromium.launch({ headless: true });

try {
  const results = [];

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
    });

    try {
      const sidePanelPage = await context.newPage();
      sidePanelPage.setDefaultTimeout(20_000);
      await sidePanelPage.goto(scenario.url, { waitUntil: "domcontentloaded" });
      await waitForText(sidePanelPage, scenario.readyText);

      const sidePanelSnapshot = await sidePanelPage.evaluate(() => {
        const expandButton = document.querySelector("[data-topbar-open-full-page='true']");

        return {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          bodyText: document.body?.innerText ?? "",
          expandLabel: expandButton?.textContent?.trim() ?? null,
          expandAriaLabel: expandButton?.getAttribute("aria-label"),
        };
      });

      assert(
        sidePanelSnapshot.expandLabel === "Tab",
        `${scenario.name}: expand label was ${JSON.stringify(sidePanelSnapshot.expandLabel)} instead of "Tab"`,
      );
      assert(
        sidePanelSnapshot.expandAriaLabel === scenario.expectedAriaLabel,
        `${scenario.name}: expand aria-label was ${JSON.stringify(sidePanelSnapshot.expandAriaLabel)} instead of ${JSON.stringify(scenario.expectedAriaLabel)}`,
      );

      const openedPagePromise = context.waitForEvent("page");
      await sidePanelPage.locator("[data-topbar-open-full-page='true']").click();
      const fullPage = await openedPagePromise;
      fullPage.setDefaultTimeout(20_000);
      await fullPage.waitForLoadState("domcontentloaded");
      await waitForText(fullPage, scenario.readyText);

      const fullPageSnapshot = await fullPage.evaluate(() => {
        const root = document.getElementById("root");

        return {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          bodyText: document.body?.innerText ?? "",
          htmlClassList: Array.from(document.documentElement.classList),
          bodyClassList: Array.from(document.body.classList),
          rootClassList: root ? Array.from(root.classList) : [],
          hasExpandButton: Boolean(
            document.querySelector("[data-topbar-open-full-page='true']"),
          ),
        };
      });

      assert(
        fullPageSnapshot.url === scenario.expectedFullPageUrl,
        `${scenario.name}: opened ${fullPageSnapshot.url} instead of ${scenario.expectedFullPageUrl}`,
      );
      assert(
        fullPageSnapshot.search === "?surface=full-page",
        `${scenario.name}: full-page search was ${fullPageSnapshot.search} instead of ?surface=full-page`,
      );
      assert(
        fullPageSnapshot.hash === scenario.expectedHash,
        `${scenario.name}: full-page hash was ${fullPageSnapshot.hash} instead of ${scenario.expectedHash}`,
      );
      assert(
        fullPageSnapshot.htmlClassList.includes("full-page-shell"),
        `${scenario.name}: html was missing full-page-shell class`,
      );
      assert(
        fullPageSnapshot.bodyClassList.includes("full-page-shell"),
        `${scenario.name}: body was missing full-page-shell class`,
      );
      assert(
        fullPageSnapshot.rootClassList.includes("full-page-shell-root"),
        `${scenario.name}: root was missing full-page-shell-root class`,
      );
      assert(
        !fullPageSnapshot.hasExpandButton,
        `${scenario.name}: full-page shell should not keep the sidebar expand button visible`,
      );

      const sidePanelScreenshotPath = path.join(
        artifactDir,
        `${scenario.name}-sidepanel-before-expand.png`,
      );
      const fullPageScreenshotPath = path.join(
        artifactDir,
        `${scenario.name}-fullpage-after-expand.png`,
      );
      await sidePanelPage.screenshot({ path: sidePanelScreenshotPath, fullPage: true });
      await fullPage.screenshot({ path: fullPageScreenshotPath, fullPage: true });

      results.push({
        name: scenario.name,
        sidePanelScreenshotPath,
        fullPageScreenshotPath,
        sidePanelSnapshot,
        fullPageSnapshot,
      });
    } finally {
      await context.close();
    }
  }

  await writeFile(
    path.join(artifactDir, "phase157-results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        scenarios: results,
      },
      null,
      2,
    ),
  );

  console.log("phase157: sidebar expand route-preserving review verified");
} finally {
  await browser.close();
}
