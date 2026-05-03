import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase269-operator-workspace-copy-split-review",
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
    packageJson.scripts["phase269:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase269-operator-workspace-copy-split-review.mjs",
    "package.json is missing the expected phase269:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/localized-copy.ts",
      markers: [
        'export { buildOperatorWorkspaceLocalizedCopy } from "./operator-workspace-localized-copy";',
        "export function buildPopupLocalizedCopy",
        "export function buildSettingsLocalizedCopy",
      ],
      forbiddenMarkers: [
        "export function buildOperatorWorkspaceLocalizedCopy",
        "Interaction Audit",
        "Theme Recovery Review",
      ],
    },
    {
      relativePath: "src/shared/operator-workspace-localized-copy.ts",
      markers: [
        "export function buildOperatorWorkspaceLocalizedCopy",
        "interactionAudit",
        "themeRecovery",
        "Interaction Audit",
        "Theme Recovery Review",
      ],
    },
    {
      relativePath: "src/shared/operator-workspace-localized-copy.test.ts",
      markers: [
        "builds English interaction audit and theme recovery copy",
        "builds Simplified Chinese operator workspace copy",
        "preserves the legacy localized-copy export path",
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
        "Doc/testing/Phase_269_Operator_Workspace_Copy_Split.md",
      markers: [
        "Phase 269",
        "Operator Workspace Copy Split",
        "npm run phase269:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/269_Phase_Operator_Workspace_Copy_Split.md",
      markers: [
        "Phase 269",
        "completed and archived on 2026-05-03",
        "operator-workspace-localized-copy.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "269_Phase_Operator_Workspace_Copy_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 269", "operator-workspace copy split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 269", "operator-workspace copy split"],
    },
    {
      relativePath: "README.md",
      markers: ["operator-workspace copy now lives in"],
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
    "operator-workspace-copy-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase269: Operator workspace copy split verified");
  console.log(`phase269: saved artifacts under ${artifactDir}`);
  console.log(`phase269: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase269: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error("phase269: Operator workspace copy split review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
