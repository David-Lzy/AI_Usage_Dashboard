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
  "phase263-app-browser-controls-split-review",
);
const devPort = 42663;

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

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase263:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase263-app-browser-controls-split-review.mjs",
    "package.json is missing the expected phase263:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: [
        "hasDirectPermissionControl",
        "hasTabNavigationControl",
        "openFullPageRoute",
        "sortTabsByPriority",
      ],
      forbiddenMarkers: [
        "storePendingFullPageEntry",
        "buildFullPageExtensionPath",
        "buildFullPagePreviewUrl",
        "function hasDirectPermissionControl",
        "function hasTabNavigationControl",
        "function scoreTab",
        "function sortTabsByPriority",
        "async function openFullPageRoute",
      ],
    },
    {
      relativePath: "src/sidepanel/app-browser-controls.ts",
      markers: [
        "export function hasDirectPermissionControl",
        "export function hasTabNavigationControl",
        "function scoreTab",
        "export function sortTabsByPriority",
        "export async function openFullPageRoute",
        "storePendingFullPageEntry",
        "buildFullPageExtensionPath",
        "buildFullPagePreviewUrl",
      ],
    },
    {
      relativePath: "src/sidepanel/app-browser-controls.test.ts",
      markers: [
        "reports browser controls as unavailable outside extension mode",
        "prioritizes active tabs before recency without mutating input",
        "opens full-page routes through chrome tabs in extension mode",
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
    for (const forbiddenMarker of expectation.forbiddenMarkers ?? []) {
      assert(
        !fileContent.includes(forbiddenMarker),
        `${expectation.relativePath} still contains forbidden inline marker: ${forbiddenMarker}`,
      );
    }
    results.push({
      scope: expectation.relativePath,
      markers:
        expectation.markers.length + (expectation.forbiddenMarkers?.length ?? 0),
    });
  }

  return results;
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_263_App_Browser_Controls_Split.md",
      markers: [
        "Phase 263",
        "App Browser Controls Split",
        "npm run phase263:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/263_Phase_App_Browser_Controls_Split.md",
      markers: [
        "Phase 263",
        "completed and archived on 2026-05-03",
        "app-browser-controls.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "263_Phase_App_Browser_Controls_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 263", "browser-controls split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 263", "browser-controls split"],
    },
    {
      relativePath: "README.md",
      markers: ["browser-control helpers now live in"],
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

async function collectDashboardState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;

    return {
      providerCards: document.querySelectorAll("[data-provider-id]").length,
      providerHeaders:
        document.querySelectorAll(".provider-card__header").length,
      summaryPills: document.querySelectorAll(".summary-strip .summary-pill")
        .length,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
    };
  });
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#dashboard`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".summary-strip .summary-pill", {
      timeout: 20_000,
    });
    await page.waitForSelector(".provider-card__header", {
      timeout: 20_000,
    });

    const result = await collectDashboardState(page);

    await page.screenshot({
      path: path.join(artifactDir, "dashboard-after-browser-controls-split.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `dashboard overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.summaryPills > 0, "dashboard summary pills missing.");
    assert(result.providerCards > 0, "dashboard provider cards missing.");
    assert(
      result.providerHeaders === result.providerCards,
      "dashboard provider headers no longer match provider cards.",
    );

    return result;
  } finally {
    await page.close();
    await browser.close();
  }
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
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
    "app-browser-controls-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase263: App browser controls split verified");
  console.log(`phase263: saved artifacts under ${artifactDir}`);
  console.log(`phase263: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase263: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase263: visual cards=${visualResult.providerCards} headers=${visualResult.providerHeaders} summaryPills=${visualResult.summaryPills} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase263: App browser controls split review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
