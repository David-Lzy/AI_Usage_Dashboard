import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase282-standard-route-app-split-review",
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
    packageJson.scripts["phase282:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase282-standard-route-app-split-review.mjs",
    "package.json is missing the expected phase282:review script.",
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
        "StandardRouteApp",
        "hashchange",
      ],
      forbiddenMarkers: [
        "DashboardPage",
        "SettingsPage",
        "ProviderDetailPage",
        "createStandardAppActions",
        "useStandardAppRuntime",
        "buildSummaryItems",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-route-app.tsx",
      markers: [
        "export function StandardRouteApp",
        "DashboardPage",
        "SettingsPage",
        "ProviderDetailPage",
        "createStandardAppActions",
        "useStandardAppRuntime",
        "parseSidePanelHash",
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
      relativePath: "Doc/testing/Phase_282_Standard_Route_App_Split.md",
      markers: [
        "Phase 282",
        "Standard Route App Split",
        "npm run phase282:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/282_Phase_Standard_Route_App_Split.md",
      markers: [
        "Phase 282",
        "completed and archived on 2026-05-03",
        "standard-route-app.tsx",
        "App.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "282_Phase_Standard_Route_App_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 282", "standard route app split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 282", "standard route app split"],
    },
    {
      relativePath: "README.md",
      markers: ["standard route app now lives in"],
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
    "standard-route-app-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 282 standard route app split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
