import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase254-layout-primitives-css-module-review",
);
const devPort = 42654;
const appStateStorageKey = "ai-usage-dashboard.app-state";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readProjectFile(relativePath));
}

function verifyMarkers(fileContent, relativePath, markers) {
  for (const marker of markers) {
    assert(
      fileContent.includes(marker),
      `${relativePath} is missing marker: ${marker}`,
    );
  }
}

function verifyOrder(fileContent, relativePath, orderedMarkers) {
  let previousIndex = -1;

  for (const marker of orderedMarkers) {
    const index = fileContent.indexOf(marker);

    assert(index >= 0, `${relativePath} is missing ordered marker: ${marker}`);
    assert(
      index > previousIndex,
      `${relativePath} has the wrong order for marker: ${marker}`,
    );
    previousIndex = index;
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase254:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase254-layout-primitives-css-module-review.mjs",
    "package.json is missing the expected phase254:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyCssSplit() {
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const layoutTheme = await readProjectFile(
    "src/sidepanel/theme/layout-primitives.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/app-shell.css";',
    'import "./theme/buttons.css";',
    'import "./theme/chips.css";',
    'import "./theme/typography.css";',
    'import "./theme/surfaces.css";',
    'import "./theme/layout-primitives.css";',
    'import "./theme/access-feedback.css";',
    'import "./theme/top-app-bar.css";',
    'import "./theme/detail-surfaces.css";',
    'import "./theme/form-controls.css";',
    'import "./theme/settings-navigation.css";',
    'import "./theme/settings-source-cards.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/settings-appearance.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  verifyOrder(popupEntry, "src/popup/main.tsx", [
    'import "../sidepanel/theme/material-theme.css";',
    'import "../sidepanel/theme/app-shell.css";',
    'import "../sidepanel/theme/buttons.css";',
    'import "../sidepanel/theme/chips.css";',
    'import "../sidepanel/theme/typography.css";',
    'import "../sidepanel/theme/surfaces.css";',
    'import "../sidepanel/theme/layout-primitives.css";',
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);

  assert(
    !materialTheme.includes("\n.token-panel") &&
      !materialTheme.includes("\n.summary-strip") &&
      !materialTheme.includes("\n.summary-pill") &&
      !materialTheme.includes("\n.dashboard-section") &&
      !materialTheme.includes("\n.provider-shell-card__header") &&
      !materialTheme.includes("\n.provider-card__header"),
    "material-theme.css still owns shared layout primitive selectors.",
  );

  verifyMarkers(layoutTheme, "src/sidepanel/theme/layout-primitives.css", [
    ".token-panel",
    ".summary-strip",
    ".summary-pill",
    ".summary-pill--warning",
    ".summary-pill--error",
    ".dashboard-section",
    ".dashboard-section__header",
    ".provider-shell-card__header",
    "@media (max-width: 720px)",
    "@media (max-width: 480px)",
  ]);

  return [
    { scope: "src/sidepanel/main.tsx", markers: 18 },
    { scope: "src/popup/main.tsx", markers: 9 },
    { scope: "src/sidepanel/theme/material-theme.css", markers: 6 },
    { scope: "src/sidepanel/theme/layout-primitives.css", markers: 10 },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_254_Layout_Primitives_CSS_Module_Split.md",
      markers: [
        "Phase 254",
        "Layout Primitives CSS Module Split",
        "npm run phase254:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/254_Phase_Layout_Primitives_CSS_Module_Split.md",
      markers: [
        "Phase 254",
        "completed and archived on 2026-05-03",
        "layout-primitives.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "254_Phase_Layout_Primitives_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 254", "Layout Primitives CSS module split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 254", "layout primitives CSS module"],
    },
    {
      relativePath: "README.md",
      markers: [
        "Layout primitives CSS now lives in `src/sidepanel/theme/layout-primitives.css`",
      ],
    },
  ];
  const results = [];

  for (const expectation of expectations) {
    const fileContent = await readProjectFile(expectation.relativePath);

    verifyMarkers(
      fileContent,
      expectation.relativePath,
      expectation.markers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length,
    });
  }

  return results;
}

function startDevServer() {
  const logs = [];
  const server = spawn(
    "npm",
    [
      "run",
      "dev",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(devPort),
      "--strictPort",
    ],
    {
      cwd: projectRoot,
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const pushLogs = (chunk) => {
    logs.push(
      ...chunk
        .toString()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );
    if (logs.length > 80) {
      logs.splice(0, logs.length - 80);
    }
  };

  server.stdout?.on("data", pushLogs);
  server.stderr?.on("data", pushLogs);

  return { server, getLogTail: () => logs.join("\n") };
}

async function waitForServer(baseUrl, server, getLogTail) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `Vite dev server exited before becoming ready.\n${getLogTail()}`,
      );
    }

    try {
      const response = await fetch(`${baseUrl}/src/sidepanel/index.html`);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry while Vite starts.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for Vite dev server.\n${getLogTail()}`);
}

async function stopDevServer(server) {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (server.exitCode !== null) {
      return;
    }
    await delay(100);
  }

  server.kill("SIGKILL");
}

async function collectLayoutStyles(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(element);

    return {
      alignItems: styles.alignItems,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      display: styles.display,
      flexDirection: styles.flexDirection,
      gap: styles.gap,
      gridTemplateColumns: styles.gridTemplateColumns,
      padding: styles.padding,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

function countGridColumns(styles) {
  return styles.gridTemplateColumns.split(" ").filter(Boolean).length;
}

function assertSummaryPillStyles(styles, label) {
  assert(styles !== null, `${label} did not resolve to an HTML element.`);
  assert(styles.display === "grid", `${label} lost grid layout.`);
  assert(styles.borderRadius !== "0px", `${label} lost rounded shape.`);
  assert(styles.boxShadow !== "none", `${label} lost elevation.`);
}

async function reviewDashboardLayout(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#dashboard`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".summary-strip .summary-pill", {
      timeout: 20_000,
    });
    await page.waitForSelector(".provider-card__header", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      summaryStrip: await collectLayoutStyles(
        page.locator(".summary-strip").first(),
      ),
      summaryPill: await collectLayoutStyles(
        page.locator(".summary-pill").first(),
      ),
      dashboardSection: await collectLayoutStyles(
        page.locator(".dashboard-section").first(),
      ),
      providerCardHeader: await collectLayoutStyles(
        page.locator(".provider-card__header").first(),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "dashboard-layout-primitives.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `dashboard layout primitives overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.summaryStrip.display === "grid",
      "dashboard summary-strip lost grid layout.",
    );
    assert(
      countGridColumns(result.summaryStrip) === 1,
      "dashboard summary-strip did not preserve the max-width 480px single-column rule.",
    );
    assertSummaryPillStyles(result.summaryPill, "dashboard summary-pill");
    assert(
      result.dashboardSection.display === "grid",
      "dashboard-section lost grid layout.",
    );
    assert(
      result.providerCardHeader.flexDirection === "row",
      "provider-card header lost its provider-card.css post-layout override.",
    );

    return result;
  } finally {
    await page.close();
  }
}

async function reviewSettingsLayout(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".settings-section-anchor.dashboard-section", {
      timeout: 20_000,
    });

    const result = {
      overflow: await collectOverflowState(page),
      dashboardSection: await collectLayoutStyles(
        page.locator(".settings-section-anchor.dashboard-section").first(),
      ),
      dashboardSectionHeader: await collectLayoutStyles(
        page.locator(".settings-overview .dashboard-section__header").first(),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "settings-layout-primitives.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `settings layout primitives overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.dashboardSection.display === "grid",
      "settings dashboard-section lost grid layout.",
    );
    assert(
      result.dashboardSectionHeader.display === "grid",
      "settings dashboard-section header lost grid layout.",
    );

    return result;
  } finally {
    await page.close();
  }
}

async function seedPopupNoVisible(page, popupUrl) {
  await page.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".popup-header", { timeout: 20_000 });

  await page.evaluate((storageKey) => {
    const rawState = globalThis.localStorage.getItem(storageKey);

    if (!rawState) {
      throw new Error("Popup preview state was not seeded before setup.");
    }

    const state = JSON.parse(rawState);
    state.providerSettings = state.providerSettings.map((provider) => ({
      ...provider,
      enabled: false,
    }));
    globalThis.localStorage.setItem(storageKey, JSON.stringify(state));
  }, appStateStorageKey);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".summary-strip .summary-pill", {
    timeout: 20_000,
  });
}

async function reviewPopupLayout(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  const popupUrl = `${baseUrl}/src/popup/index.html`;

  try {
    await seedPopupNoVisible(page, popupUrl);

    const result = {
      overflow: await collectOverflowState(page),
      topSummaryStrip: await collectLayoutStyles(
        page.locator(".summary-strip").first(),
      ),
      topSummaryPill: await collectLayoutStyles(
        page.locator(".summary-strip .summary-pill").first(),
      ),
      setupSummaryStrip: await collectLayoutStyles(
        page
          .locator('[data-popup-setup-coverage-grid] .summary-strip')
          .first(),
      ),
      dashboardSection: await collectLayoutStyles(
        page.locator(".dashboard-section").first(),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "popup-layout-primitives.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `popup layout primitives overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.topSummaryStrip.display === "grid",
      "popup top summary-strip lost grid layout.",
    );
    assertSummaryPillStyles(result.topSummaryPill, "popup summary-pill");
    assert(
      countGridColumns(result.setupSummaryStrip) === 2,
      "popup setup coverage summary did not preserve popup-theme two-column override.",
    );
    assert(
      result.dashboardSection.display === "grid",
      "popup dashboard-section lost grid layout.",
    );

    return result;
  } finally {
    await page.close();
  }
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({ channel: "chromium", headless: true });

  try {
    return {
      dashboard: await reviewDashboardLayout(baseUrl, browser),
      settings: await reviewSettingsLayout(baseUrl, browser),
      popup: await reviewPopupLayout(baseUrl, browser),
    };
  } finally {
    await browser.close();
  }
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyCssSplit()),
    ...(await verifyDocsMarkers()),
  ];

  const baseUrl = `http://127.0.0.1:${devPort}`;
  const { server, getLogTail } = startDevServer();
  let visualResult;

  try {
    await waitForServer(baseUrl, server, getLogTail);
    visualResult = await runVisualReview(baseUrl);
  } finally {
    await stopDevServer(server);
  }

  const report = { markers: markerResults, visual: visualResult };
  const reportPath = path.join(
    artifactDir,
    "layout-primitives-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase254: Layout primitives CSS module split verified");
  console.log(`phase254: saved artifacts under ${artifactDir}`);
  console.log(`phase254: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase254: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase254: visual dashboard_overflow=${visualResult.dashboard.overflow.overflowX} settings_overflow=${visualResult.settings.overflow.overflowX} popup_overflow=${visualResult.popup.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase254: Layout primitives CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
