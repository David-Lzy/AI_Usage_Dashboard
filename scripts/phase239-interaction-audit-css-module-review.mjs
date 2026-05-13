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
  "phase239-interaction-audit-css-module-review",
);
const devPort = 42639;

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
    packageJson.scripts["phase239:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase239-interaction-audit-css-module-review.mjs",
    "package.json is missing the expected phase239:review script.",
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
  const interactionAuditTheme = await readProjectFile(
    "src/sidepanel/theme/interaction-audit.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("interaction-audit.css"),
    "popup entry should not import the sidepanel-only interaction-audit CSS module.",
  );
  assert(
    !materialTheme.includes("interaction-audit") &&
      !materialTheme.includes("capture-pre"),
    "material-theme.css still owns interaction-audit selectors.",
  );

  verifyMarkers(
    interactionAuditTheme,
    "src/sidepanel/theme/interaction-audit.css",
    [
      ".interaction-audit-shell",
      ".interaction-audit-grid",
      ".interaction-audit__preset",
      ".interaction-audit__review-queue",
      ".interaction-audit-frame-shell",
      ".capture-pre",
      "@media (max-width: 720px)",
      "@media (max-width: 1100px)",
      "@media (max-width: 480px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 4,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 2,
    },
    {
      scope: "src/sidepanel/theme/interaction-audit.css",
      markers: 9,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_239_Interaction_Audit_CSS_Module_Split.md",
      markers: [
        "Phase 239",
        "Interaction Audit CSS Module Split",
        "npm run phase239:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/239_Phase_Interaction_Audit_CSS_Module_Split.md",
      markers: [
        "Phase 239",
        "completed and archived on 2026-05-03",
        "interaction-audit.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "Phase 239",
        "interaction-audit",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 239",
        "interaction-audit CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "interaction-audit CSS now lives in `src/sidepanel/theme/interaction-audit.css`",
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
      width: 1600,
      height: 1800,
    },
  });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#debug-interaction-audit`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".interaction-audit-shell", {
      timeout: 20_000,
    });
    await page.waitForSelector("[data-audit-surface-id]", {
      timeout: 20_000,
    });
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll(".interaction-audit-frame")).every(
        (frame) =>
          frame instanceof HTMLIFrameElement &&
          frame.contentDocument?.readyState === "complete",
      ),
    );

    const snapshot = await page.evaluate(() => {
      const root = document.documentElement;
      const surfaces = Array.from(
        document.querySelectorAll("[data-audit-surface-id]"),
      );
      const grid = document.querySelector(".interaction-audit-grid");
      const frameViewport = document.querySelector(
        ".interaction-audit-frame-viewport",
      );
      const preset = document.querySelector(".interaction-audit__preset");
      const queueItem = document.querySelector(".interaction-audit__queue-item");

      const styleSnapshot = (element) => {
        if (!(element instanceof HTMLElement)) {
          return null;
        }
        const styles = getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          borderRadius: styles.borderRadius,
          display: styles.display,
          gridTemplateColumns: styles.gridTemplateColumns,
        };
      };

      return {
        horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
        surfaceCount: surfaces.length,
        grid: styleSnapshot(grid),
        frameViewport: styleSnapshot(frameViewport),
        preset: styleSnapshot(preset),
        queueItem: styleSnapshot(queueItem),
      };
    });

    assert(
      snapshot.horizontalOverflow <= 1,
      `interaction audit hub overflowed horizontally (${snapshot.horizontalOverflow}px).`,
    );
    assert(
      snapshot.surfaceCount === 5,
      `expected 5 audit surfaces, found ${snapshot.surfaceCount}.`,
    );
    assert(
      snapshot.grid?.display === "grid",
      `interaction audit grid lost grid display: ${JSON.stringify(snapshot.grid)}`,
    );
    assert(
      snapshot.frameViewport?.borderRadius !== "0px",
      "interaction audit frame viewport lost rounded Material framing.",
    );
    assert(
      snapshot.preset?.borderColor !== "rgba(0, 0, 0, 0)",
      "interaction audit preset lost its supporting-surface border.",
    );

    const screenshotPath = path.join(artifactDir, "interaction-audit-css-module.png");
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
    "interaction-audit-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase239: interaction-audit CSS module split verified");
  console.log(`phase239: saved artifacts under ${artifactDir}`);
  console.log(`phase239: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase239: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase239: visual surfaces=${visualResult.snapshot.surfaceCount} overflow=${visualResult.snapshot.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase239: interaction-audit CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
