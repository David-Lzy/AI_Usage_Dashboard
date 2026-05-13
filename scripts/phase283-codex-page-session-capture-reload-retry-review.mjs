import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase283-codex-page-session-capture-reload-retry-review",
);

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
    packageJson.scripts["phase283:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase283-codex-page-session-capture-reload-retry-review.mjs",
    "package.json is missing the expected phase283:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/providers/page-session.ts",
      markers: [
        "PageSessionReloadOnCaptureFailure",
        "reloadOnCaptureFailure",
        "reloadPageSessionTabAfterCaptureFailure",
        "tabsApi.reload(tabId",
        "bypassCache",
        "After reload:",
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-capture.ts",
      markers: [
        "reloadOnCaptureFailure",
        "bypassCache: true",
        "waitForLoadTimeoutMs: 10_000",
      ],
    },
    {
      relativePath: "src/providers/page-session.test.ts",
      markers: [
        "reloads and retries a candidate tab when capture recovery is enabled",
        "expect(reload).toHaveBeenCalledWith(17, { bypassCache: true })",
        "expect(executeScript).toHaveBeenCalledTimes(2)",
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-capture.test.ts",
      markers: [
        "capturedDefinitions[0].reloadOnCaptureFailure",
        "bypassCache: true",
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

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_283_Codex_Page_Session_Capture_Reload_Retry.md",
      markers: [
        "Phase 283",
        "Codex Page Session Capture Reload Retry",
        "npm run phase283:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/283_Phase_Codex_Page_Session_Capture_Reload_Retry.md",
      markers: [
        "Phase 283",
        "completed and archived on 2026-05-03",
        "reloadOnCaptureFailure",
        "chrome.tabs.reload",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "283_Phase_Codex_Page_Session_Capture_Reload_Retry.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 283", "Codex page-session capture reload retry"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 283", "Codex page-session capture reload retry"],
    },
    {
      relativePath: "README.md",
      markers: ["Codex personal page-session capture now reloads"],
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

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyDocsMarkers()),
  ];
  const report = { markers: markerResults };
  const reportPath = path.join(
    artifactDir,
    "codex-page-session-capture-reload-retry-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 283 Codex page-session capture reload retry review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
