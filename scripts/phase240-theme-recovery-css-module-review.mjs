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
  "phase240-theme-recovery-css-module-review",
);
const devPort = 42640;

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
    packageJson.scripts["phase240:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase240-theme-recovery-css-module-review.mjs",
    "package.json is missing the expected phase240:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCssSplit() {
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const themeRecoveryTheme = await readProjectFile(
    "src/sidepanel/theme/theme-recovery.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("theme-recovery.css"),
    "popup entry should not import the sidepanel-only theme-recovery CSS module.",
  );
  assert(
    !materialTheme.includes("theme-recovery"),
    "material-theme.css still owns theme-recovery selectors.",
  );

  verifyMarkers(
    themeRecoveryTheme,
    "src/sidepanel/theme/theme-recovery.css",
    [
      ".theme-recovery-shell",
      ".theme-recovery-provider-list",
      ".theme-recovery-copy-actions",
      ".theme-recovery-export-grid",
      "@media (max-width: 720px)",
      "@media (max-width: 480px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 5,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/theme-recovery.css",
      markers: 6,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Phase_240_Theme_Recovery_CSS_Module_Split.md",
      markers: [
        "Phase 240",
        "Theme Recovery CSS Module Split",
        "npm run phase240:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/240_Phase_Theme_Recovery_CSS_Module_Split.md",
      markers: [
        "Phase 240",
        "completed and archived on 2026-05-03",
        "theme-recovery.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "240_Phase_Theme_Recovery_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 240",
        "theme-recovery CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "theme-recovery CSS now lives in `src/sidepanel/theme/theme-recovery.css`",
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

  return {
    server,
    getLogTail: () => logs.join("\n"),
  };
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

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: {
      width: 1366,
      height: 1200,
    },
  });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#debug-theme-recovery-review`, {
      waitUntil: "load",
    });
    await page.waitForSelector("[data-theme-recovery-page='true']", {
      timeout: 20_000,
    });
    await page.waitForSelector("[data-theme-recovery-summary-draft]", {
      timeout: 20_000,
    });

    const snapshot = await page.evaluate(() => {
      const root = document.documentElement;
      const pageRoot = document.querySelector(".theme-recovery-shell");
      const exportGrid = document.querySelector(".theme-recovery-export-grid");
      const exportPanels = Array.from(
        document.querySelectorAll(".theme-recovery-export-panel"),
      );
      const copyActions = document.querySelector(".theme-recovery-copy-actions");

      const styleSnapshot = (element) => {
        if (!(element instanceof HTMLElement)) {
          return null;
        }
        const styles = getComputedStyle(element);
        return {
          display: styles.display,
          flexWrap: styles.flexWrap,
          gap: styles.gap,
          gridTemplateColumns: styles.gridTemplateColumns,
        };
      };

      return {
        horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
        exportPanelCount: exportPanels.length,
        page: styleSnapshot(pageRoot),
        exportGrid: styleSnapshot(exportGrid),
        copyActions: styleSnapshot(copyActions),
      };
    });

    assert(
      snapshot.horizontalOverflow <= 1,
      `theme recovery page overflowed horizontally (${snapshot.horizontalOverflow}px).`,
    );
    assert(
      snapshot.exportPanelCount === 2,
      `expected 2 theme recovery export panels, found ${snapshot.exportPanelCount}.`,
    );
    assert(
      snapshot.page?.display === "grid",
      `theme recovery shell lost grid display: ${JSON.stringify(snapshot.page)}`,
    );
    assert(
      snapshot.exportGrid?.display === "grid",
      `theme recovery export grid lost grid display: ${JSON.stringify(snapshot.exportGrid)}`,
    );
    assert(
      snapshot.copyActions?.flexWrap === "wrap",
      `theme recovery copy actions no longer wrap: ${JSON.stringify(snapshot.copyActions)}`,
    );

    const screenshotPath = path.join(artifactDir, "theme-recovery-css-module.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    return {
      screenshotPath,
      snapshot,
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

  const report = {
    markers: markerResults,
    visual: visualResult,
  };
  const reportPath = path.join(
    artifactDir,
    "theme-recovery-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase240: theme-recovery CSS module split verified");
  console.log(`phase240: saved artifacts under ${artifactDir}`);
  console.log(`phase240: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase240: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase240: visual export_panels=${visualResult.snapshot.exportPanelCount} overflow=${visualResult.snapshot.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase240: theme-recovery CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
