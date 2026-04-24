import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase155-full-page-shell-entry-review",
);

const scenarios = [
  {
    name: "sidepanel-dashboard",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard",
    expectedText: "One panel for AI coding quotas",
    expectedHash: "#dashboard",
    expectedSearch: "",
    fullPageSurface: false,
  },
  {
    name: "fullpage-dashboard",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#dashboard",
    expectedText: "One panel for AI coding quotas",
    expectedHash: "#dashboard",
    expectedSearch: "?surface=full-page",
    fullPageSurface: true,
  },
  {
    name: "fullpage-settings",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#settings",
    expectedText: "Settings Overview",
    expectedHash: "#settings",
    expectedSearch: "?surface=full-page",
    fullPageSurface: true,
  },
  {
    name: "fullpage-provider-detail",
    url: "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#provider-detail/cursor",
    expectedText: "Provider Detail",
    expectedHash: "#provider-detail/cursor",
    expectedSearch: "?surface=full-page",
    fullPageSurface: true,
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForStableText(page, expectedText) {
  await page.waitForFunction(
    (needle) =>
      (document.body?.innerText ?? "").toLowerCase().includes(needle),
    expectedText.toLowerCase(),
  );
}

async function collectSnapshot(page) {
  return page.evaluate(() => {
    const root = document.getElementById("root");
    const shell = document.querySelector(".app-shell");

    return {
      search: window.location.search,
      hash: window.location.hash,
      htmlClassList: Array.from(document.documentElement.classList),
      bodyClassList: Array.from(document.body.classList),
      rootClassList: root ? Array.from(root.classList) : [],
      shellWidth: Math.round(shell?.getBoundingClientRect().width ?? 0),
      horizontalOverflow: Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth,
      ),
    };
  });
}

async function reviewScenario(browser, scenario) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(20_000);

  await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
  await waitForStableText(page, scenario.expectedText);

  const snapshot = await collectSnapshot(page);

  assert(
    snapshot.hash === scenario.expectedHash,
    `${scenario.name}: hash was ${snapshot.hash} instead of ${scenario.expectedHash}`,
  );
  assert(
    snapshot.search === scenario.expectedSearch,
    `${scenario.name}: search was ${snapshot.search} instead of ${scenario.expectedSearch}`,
  );
  assert(
    snapshot.horizontalOverflow === 0,
    `${scenario.name}: horizontal overflow was ${snapshot.horizontalOverflow}px`,
  );

  if (scenario.fullPageSurface) {
    assert(
      snapshot.htmlClassList.includes("full-page-shell"),
      `${scenario.name}: html was missing full-page-shell class`,
    );
    assert(
      snapshot.bodyClassList.includes("full-page-shell"),
      `${scenario.name}: body was missing full-page-shell class`,
    );
    assert(
      snapshot.rootClassList.includes("full-page-shell-root"),
      `${scenario.name}: root was missing full-page-shell-root class`,
    );
    assert(
      snapshot.shellWidth > 0 && snapshot.shellWidth <= 1440,
      `${scenario.name}: full-page shell width ${snapshot.shellWidth}px was outside the expected range`,
    );
  } else {
    assert(
      !snapshot.htmlClassList.includes("full-page-shell"),
      `${scenario.name}: sidepanel preview should not include full-page-shell class`,
    );
  }

  const screenshotPath = path.join(artifactDir, `${scenario.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.close();

  return {
    ...scenario,
    screenshotPath,
    snapshot,
  };
}

await mkdir(artifactDir, { recursive: true });

const sharedHelper = await readFile(
  path.join(projectRoot, "src", "shared", "extension-surface-paths.ts"),
  "utf8",
);
assert(
  sharedHelper.includes('export const FULL_PAGE_SURFACE_SEARCH = "?surface=full-page";'),
  "Shared extension-surface helper did not expose the full-page surface search contract.",
);
assert(
  sharedHelper.includes("buildFullPageExtensionPath"),
  "Shared extension-surface helper did not expose a full-page extension-path builder.",
);

const sidepanelMain = await readFile(
  path.join(projectRoot, "src", "sidepanel", "main.tsx"),
  "utf8",
);
assert(
  sidepanelMain.includes("full-page-shell-root"),
  "sidepanel main entry did not label the root for the full-page shell.",
);

const sidepanelCss = await readFile(
  path.join(projectRoot, "src", "sidepanel", "theme", "material-theme.css"),
  "utf8",
);
assert(
  sidepanelCss.includes(".full-page-shell .app-shell"),
  "Sidepanel theme CSS did not include the full-page shell layout contract.",
);

const browser = await chromium.launch({ headless: true });

try {
  const results = [];

  for (const scenario of scenarios) {
    results.push(await reviewScenario(browser, scenario));
  }

  await writeFile(
    path.join(artifactDir, "phase155-results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );

  console.log("phase155: full-page shell route entry verified");
} finally {
  await browser.close();
}
