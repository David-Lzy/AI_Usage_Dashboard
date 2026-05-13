import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase271-settings-copy-split-review",
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
    packageJson.scripts["phase271:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase271-settings-copy-split-review.mjs",
    "package.json is missing the expected phase271:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/localized-copy.ts",
      markers: [
        'from "./settings-localized-copy";',
        "export function getProviderDiagnosticPresentation",
      ],
      forbiddenMarkers: [
        "export function buildSettingsLocalizedCopy",
        "export function getSettingsSourcePreferenceLabel",
        "export function getSettingsSourceKindLabel",
        "Provider credential",
        "Provider 凭据",
      ],
    },
    {
      relativePath: "src/shared/settings-localized-copy.ts",
      markers: [
        "export function buildSettingsLocalizedCopy",
        "export function getSettingsSourcePreferenceLabel",
        "export function getSettingsSourceKindLabel",
        "Provider credential",
        "Provider 凭据",
      ],
    },
    {
      relativePath: "src/shared/settings-localized-copy.test.ts",
      markers: [
        "builds English settings credential and source copy",
        "builds Simplified Chinese settings helper copy",
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
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_271_Settings_Copy_Split.md",
      markers: [
        "Phase 271",
        "Settings Copy Split",
        "npm run phase271:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/200-299/271_Phase_Settings_Copy_Split.md",
      markers: [
        "Phase 271",
        "completed and archived on 2026-05-03",
        "settings-localized-copy.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "271_Phase_Settings_Copy_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 271", "settings copy split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 271", "settings copy split"],
    },
    {
      relativePath: "README.md",
      markers: ["settings copy now lives in"],
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
  const reportPath = path.join(artifactDir, "settings-copy-split-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 271 settings copy split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
