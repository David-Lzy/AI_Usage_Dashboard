import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase209-popup-circular-usage-progress-review",
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
    packageJson.scripts["phase209:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase209-popup-circular-usage-progress-review.mjs",
    "package.json is missing the expected phase209:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyPopupCircularProgress() {
  const expectations = [
    {
      relativePath: "src/popup/view-models.ts",
      markers: [
        "PopupUsageProgressCircle",
        "usageProgressCircles: PopupUsageProgressCircle[]",
        "function buildPopupUsageProgressCircles",
        "getPopupUsageProgressTone",
        "ariaLabel: `${window.normalizedLabel}: ${valueLabel} ${remainingLabel}`",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "PopupProgressRingStyle",
        "hasUsageProgressCircles",
        "popup-progress-ring-list",
        "role=\"progressbar\"",
        "aria-valuenow={circle.remainingPercent}",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        ".popup-progress-ring-list",
        ".popup-progress-ring__meter",
        "conic-gradient(",
        ".popup-progress-ring--warning",
        ".popup-progress-ring--error",
      ],
    },
    {
      relativePath: "src/popup/view-models.test.ts",
      markers: [
        "builds circular usage progress for structured popup provider cards",
        "usageProgressCircles",
        "Weekly usage window: 32% remaining",
        "Weekly usage window: 32% 剩余",
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

async function verifyDocs() {
  const docExpectations = [
    {
      relativePath: "Doc/testing/Phase_209_Popup_Circular_Usage_Progress.md",
      markers: [
        "Phase 209",
        "Popup Circular Usage Progress",
        "npm run phase209:review",
        "popup",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/209_Phase_Popup_Circular_Usage_Progress.md",
      markers: [
        "Phase 209",
        "completed and archived on 2026-04-26",
        "circular usage progress",
        "dashboard and provider-detail bars remain unchanged",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "209_Phase_Popup_Circular_Usage_Progress.md",
        "latest completed slice",
      ],
    },
  ];
  const results = [];

  for (const expectation of docExpectations) {
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
    ...(await verifyPopupCircularProgress()),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "popup-circular-usage-progress-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase209: popup circular usage progress verified");
  console.log(`phase209: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase209: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase209: popup circular usage progress review failed");
  console.error(error);
  process.exitCode = 1;
});
