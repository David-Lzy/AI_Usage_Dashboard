import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase223-popup-empty-percent-progress-suppression-review",
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
    packageJson.scripts["phase223:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase223-popup-empty-percent-progress-suppression-review.mjs",
    "package.json is missing the expected phase223:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/popup/progress-visibility.ts",
      markers: [
        "shouldShowPopupProviderProgress",
        "usageWindows",
        "shouldShowSingleUsageProgress",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "shouldShowPopupProviderProgress(provider)",
        "renderPopupProviderProgress",
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
      relativePath: "src/popup/progress-visibility.test.ts",
      markers: [
        "hides empty percent progress",
        "keeps structured usage-window progress visible",
        "keeps documented non-percent totals visible",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_223_Popup_Empty_Percent_Progress_Suppression.md",
      markers: [
        "Phase 223",
        "Popup Empty Percent Progress Suppression",
        "npm run phase223:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/223_Phase_Popup_Empty_Percent_Progress_Suppression.md",
      markers: [
        "Phase 223",
        "completed and archived on 2026-04-29",
        "popup empty percent progress",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "223_Phase_Popup_Empty_Percent_Progress_Suppression.md",
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
    "popup-empty-percent-progress-suppression-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase223: popup empty percent progress suppression verified");
  console.log(`phase223: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase223: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase223: popup empty percent progress suppression review failed");
  console.error(error);
  process.exitCode = 1;
});
