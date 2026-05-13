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
  "phase252-surfaces-css-module-review",
);
const devPort = 42652;

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
    packageJson.scripts["phase252:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase252-surfaces-css-module-review.mjs",
    "package.json is missing the expected phase252:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyCssSplit() {
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const surfacesTheme = await readProjectFile("src/sidepanel/theme/surfaces.css");

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/app-shell.css";',
    'import "./theme/buttons.css";',
    'import "./theme/chips.css";',
    'import "./theme/surfaces.css";',
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
    'import "../sidepanel/theme/surfaces.css";',
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);
  assert(
    !materialTheme.includes("\n.hero-card") &&
      !materialTheme.includes("\n.status-card") &&
      !materialTheme.includes("status-card__header"),
    "material-theme.css still owns shared surface selectors.",
  );

  verifyMarkers(surfacesTheme, "src/sidepanel/theme/surfaces.css", [
    ".hero-card",
    ".status-card",
    ".status-card--warning",
    ".status-card--error",
    ".status-card__header",
    "@media (max-width: 720px)",
    "@media (max-width: 480px)",
  ]);

  return [
    { scope: "src/sidepanel/main.tsx", markers: 16 },
    { scope: "src/popup/main.tsx", markers: 7 },
    { scope: "src/sidepanel/theme/material-theme.css", markers: 3 },
    { scope: "src/sidepanel/theme/surfaces.css", markers: 7 },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_252_Surfaces_CSS_Module_Split.md",
      markers: [
        "Phase 252",
        "Surfaces CSS Module Split",
        "npm run phase252:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/200-299/252_Phase_Surfaces_CSS_Module_Split.md",
      markers: [
        "Phase 252",
        "completed and archived on 2026-05-03",
        "surfaces.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "252_Phase_Surfaces_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 252", "Surfaces CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: ["Surface CSS now lives in `src/sidepanel/theme/surfaces.css`"],
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

async function collectStyles(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(element);

    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      display: styles.display,
      gridTemplateColumns: styles.gridTemplateColumns,
      padding: styles.padding,
    };
  });
}

async function collectOptionalStyles(locator) {
  if ((await locator.count()) === 0) {
    return null;
  }

  return collectStyles(locator.first());
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

function assertSurfaceStyles(styles, label) {
  assert(styles?.display === "grid", `${label} lost grid layout.`);
  assert(
    styles.gridTemplateColumns !== "none",
    `${label} lost grid template columns.`,
  );
  assert(styles.borderRadius !== "0px", `${label} lost rounded shape.`);
  assert(styles.boxShadow !== "none", `${label} lost elevation.`);
}

async function reviewDashboardSurfaces(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#dashboard`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".hero-card", { timeout: 20_000 });
    await page.waitForSelector(".provider-card", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      heroStyles: await collectStyles(page.locator(".hero-card").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, "dashboard-surfaces.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `dashboard surfaces overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertSurfaceStyles(result.heroStyles, "dashboard hero card");

    return result;
  } finally {
    await page.close();
  }
}

async function reviewSettingsSurfaces(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".status-card", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      statusStyles: await collectStyles(page.locator(".status-card").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, "settings-surfaces.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `settings surfaces overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertSurfaceStyles(result.statusStyles, "settings status card");

    return result;
  } finally {
    await page.close();
  }
}

async function reviewPopupSurfaces(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/popup/index.html`, { waitUntil: "load" });
    await page.waitForSelector(".status-card", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      statusStyles: await collectStyles(page.locator(".status-card").first()),
      headerStyles: await collectOptionalStyles(
        page.locator(".status-card__header"),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "popup-surfaces.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `popup surfaces overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertSurfaceStyles(result.statusStyles, "popup status card");
    if (result.headerStyles) {
      assert(
        result.headerStyles.display === "flex",
        "popup status-card header lost flex layout.",
      );
    }

    return result;
  } finally {
    await page.close();
  }
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({ channel: "chromium", headless: true });

  try {
    return {
      dashboard: await reviewDashboardSurfaces(baseUrl, browser),
      settings: await reviewSettingsSurfaces(baseUrl, browser),
      popup: await reviewPopupSurfaces(baseUrl, browser),
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
  const reportPath = path.join(artifactDir, "surfaces-css-module-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase252: Surfaces CSS module split verified");
  console.log(`phase252: saved artifacts under ${artifactDir}`);
  console.log(`phase252: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase252: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase252: visual dashboard_overflow=${visualResult.dashboard.overflow.overflowX} settings_overflow=${visualResult.settings.overflow.overflowX} popup_overflow=${visualResult.popup.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase252: Surfaces CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
