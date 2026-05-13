import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase217-page-session-capture-unavailable-review",
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
    packageJson.scripts["phase217:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase217-page-session-capture-unavailable-review.mjs",
    "package.json is missing the expected phase217:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/providers/page-session.ts",
      markers: [
        'status: "logged_out" | "not_found" | "capture_unavailable"',
        "sawCaptureFailure",
        'status: "capture_failed"',
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-parser.ts",
      markers: [
        '"capture_unavailable"',
        "The open Codex usage page could not be read by the extension.",
      ],
    },
    {
      relativePath: "src/providers/cursor/personal-page-parser.ts",
      markers: [
        '"capture_unavailable"',
        "The open Cursor dashboard usage page could not be read by the extension.",
      ],
    },
    {
      relativePath: "src/providers/codex/adapter.ts",
      markers: [
        "Codex usage page unavailable",
        "Reload the Codex usage page and refresh again",
      ],
    },
    {
      relativePath: "src/providers/cursor/adapter.ts",
      markers: [
        "Cursor usage page unavailable",
        "Reload the Cursor dashboard usage page and refresh again",
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

async function verifyTestsAndDocs() {
  const expectations = [
    {
      relativePath: "src/providers/page-session.test.ts",
      markers: [
        "reports capture_unavailable when a candidate tab cannot be read",
      ],
    },
    {
      relativePath: "src/providers/codex/adapter.test.ts",
      markers: [
        "keeps capture-unavailable page-session diagnostics visible when a bound Codex tab cannot be read",
      ],
    },
    {
      relativePath: "src/providers/cursor/adapter.test.ts",
      markers: [
        "keeps capture-unavailable page-session diagnostics visible when a bound Cursor tab cannot be read",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_217_Page_Session_Capture_Unavailable.md",
      markers: [
        "Phase 217",
        "Page Session Capture Unavailable",
        "npm run phase217:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/217_Phase_Page_Session_Capture_Unavailable.md",
      markers: [
        "Phase 217",
        "completed and archived on 2026-04-29",
        "capture_unavailable",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "217_Phase_Page_Session_Capture_Unavailable.md",
        "latest completed slice",
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

async function runReview() {
  const results = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyTestsAndDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "page-session-capture-unavailable-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase217: page-session capture-unavailable verified");
  console.log(`phase217: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase217: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase217: page-session capture-unavailable review failed");
  console.error(error);
  process.exitCode = 1;
});
