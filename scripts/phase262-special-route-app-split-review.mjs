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
  "phase262-special-route-app-split-review",
);
const devPort = 42662;

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
    packageJson.scripts["phase262:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase262-special-route-app-split-review.mjs",
    "package.json is missing the expected phase262:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: [
        "getSpecialSidePanelRoute",
        "SpecialRouteApp",
        "return <StandardApp locationHash={locationHash} />",
      ],
      forbiddenMarkers: [
        "CodexFixtureCapturePage",
        "CursorFixtureCapturePage",
        "JetBrainsFixtureCapturePage",
        "InteractionAuditPage",
        "StoreScreenshotSeedPage",
        "ThemeRecoveryReviewPage",
        "APP_STATE_STORAGE_KEY",
        "readThemeSettingsFromStoredAppState",
      ],
    },
    {
      relativePath: "src/sidepanel/special-route-app.tsx",
      markers: [
        "export type SpecialSidePanelRoute",
        "export function getSpecialSidePanelRoute",
        "export function SpecialRouteApp",
        "APP_STATE_STORAGE_KEY",
        "startThemeSettingsSync",
        "syncRuntimeLocaleAttributes",
        "StoreScreenshotSeedPage",
      ],
    },
    {
      relativePath: "src/sidepanel/special-route-app.test.tsx",
      markers: [
        "maps supported debug hashes and ignores standard routes",
        "renders a special route without the standard app shell state",
        "debug-native-popup-probe",
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
        "Doc/testing/Phase_262_Special_Route_App_Split.md",
      markers: [
        "Phase 262",
        "Special Route App Split",
        "npm run phase262:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/262_Phase_Special_Route_App_Split.md",
      markers: [
        "Phase 262",
        "completed and archived on 2026-05-03",
        "special-route-app.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "262_Phase_Special_Route_App_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 262", "special-route app split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 262", "special-route app split"],
    },
    {
      relativePath: "README.md",
      markers: ["special-route app now lives in"],
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

async function collectSpecialRouteState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;

    return {
      auditShells: document.querySelectorAll(".interaction-audit-shell").length,
      heroCards: document.querySelectorAll(".hero-card").length,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      standardDashboardSections:
        document.querySelectorAll("[data-provider-id]").length,
      title:
        document.querySelector(".display-headline")?.textContent?.trim() ??
        null,
    };
  });
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#debug-interaction-audit`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".interaction-audit-shell", {
      timeout: 20_000,
    });

    const result = await collectSpecialRouteState(page);

    await page.screenshot({
      path: path.join(artifactDir, "special-route-interaction-audit.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `special route overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.auditShells === 1, "special interaction audit route missing.");
    assert(result.heroCards >= 1, "special route hero card missing.");
    assert(result.title !== null, "special route title missing.");

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
    "special-route-app-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase262: Special route app split verified");
  console.log(`phase262: saved artifacts under ${artifactDir}`);
  console.log(`phase262: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase262: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase262: visual auditShells=${visualResult.auditShells} heroCards=${visualResult.heroCards} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase262: Special route app split review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
