import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase213-native-toolbar-popup-review",
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

async function fileExists(relativePath) {
  try {
    await stat(path.join(projectRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase213:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase213-native-toolbar-popup-density-review.mjs",
    "package.json is missing the expected phase213:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const css = await readProjectFile("src/sidepanel/theme/material-theme.css");
  const markers = [
    ".popup-provider-card__progress--circle .usage-progress__ring",
    "width: 68px;",
    ".popup-provider-card__progress--circle .usage-progress__detail",
    "display: none;",
    "-webkit-line-clamp: 2;",
  ];

  verifyMarkers(css, "src/sidepanel/theme/material-theme.css", markers);

  return {
    scope: "popup-circle-density-css",
    markers: markers.length,
  };
}

async function verifyDocs() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_213_Native_Toolbar_Popup_Density_Review.md",
      markers: [
        "Phase 213",
        "Native Toolbar Popup Density Review",
        "native toolbar popup",
        "npm run phase213:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/213_Phase_Native_Toolbar_Popup_Density_Review.md",
      markers: [
        "Phase 213",
        "completed and archived on 2026-04-29",
        "popup circle density",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "213_Phase_Native_Toolbar_Popup_Density_Review.md",
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

async function verifyEvidenceArtifacts() {
  const evidenceFiles = [
    "tmp/phase213-native-toolbar-popup-review/native-popup-balanced-desktop.png",
    "tmp/phase213-native-toolbar-popup-review/native-popup-balanced-after-density-fix.png",
  ];
  const results = [];

  for (const evidenceFile of evidenceFiles) {
    results.push({
      scope: evidenceFile,
      present: await fileExists(evidenceFile),
    });
  }

  assert(
    results.some((result) => result.present),
    "Expected at least one Phase 213 native toolbar popup evidence screenshot in tmp/phase213-native-toolbar-popup-review/.",
  );

  return {
    scope: "native-toolbar-popup-evidence",
    markers: results.filter((result) => result.present).length,
    evidence: results,
  };
}

async function runReview() {
  const results = [
    await verifyPackageScript(),
    await verifyRuntimeMarkers(),
    ...(await verifyDocs()),
    await verifyEvidenceArtifacts(),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "native-toolbar-popup-density-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase213: native toolbar popup density verified");
  console.log(`phase213: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase213: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase213: native toolbar popup density review failed");
  console.error(error);
  process.exitCode = 1;
});
