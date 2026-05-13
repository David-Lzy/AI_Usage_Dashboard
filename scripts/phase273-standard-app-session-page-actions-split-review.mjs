import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase273-standard-app-session-page-actions-split-review",
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
    packageJson.scripts["phase273:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase273-standard-app-session-page-actions-split-review.mjs",
    "package.json is missing the expected phase273:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/standard-app-actions.ts",
      markers: [
        "createStandardAppActions",
        "createStandardAppSessionPageActions",
        "sessionPageActions.handleOpenSessionPage",
        "hasDirectPermissionControl",
      ],
      forbiddenMarkers: [
        "function handleOpenSessionPage",
        "function handleAttachActiveSessionPage",
        "createPageBindingFromTab",
        "getSessionPagePlan",
        "shouldRefreshAfterSourcePageRecovery",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-session-page-actions.ts",
      markers: [
        "export function createStandardAppSessionPageActions",
        "function handleOpenSessionPage",
        "function handleAttachActiveSessionPage",
        "createPageBindingFromTab",
        "shouldRefreshAfterSourcePageRecovery",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-session-page-actions.test.ts",
      markers: [
        "reports session-page controls unavailable outside extension mode",
        "surfaces open-page helper unavailability without dispatching messages",
        "keeps active-page attach disabled on full-page surfaces",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_273_Standard_App_Session_Page_Actions_Split.md",
      markers: [
        "Phase 273",
        "Standard App Session Page Actions Split",
        "npm run phase273:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/273_Phase_Standard_App_Session_Page_Actions_Split.md",
      markers: [
        "Phase 273",
        "completed and archived on 2026-05-03",
        "standard-app-session-page-actions.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "273_Phase_Standard_App_Session_Page_Actions_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 273", "standard-app session-page actions split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 273", "standard-app session-page actions split"],
    },
    {
      relativePath: "README.md",
      markers: ["standard session-page actions now live in"],
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
    "standard-app-session-page-actions-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 273 standard app session-page actions split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
