import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase272-provider-diagnostic-presentation-split-review",
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
    packageJson.scripts["phase272:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase272-provider-diagnostic-presentation-split-review.mjs",
    "package.json is missing the expected phase272:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/localized-copy.ts",
      markers: [
        'from "./provider-diagnostic-presentation";',
        'from "./settings-localized-copy";',
        'from "./popup-localized-copy";',
      ],
      forbiddenMarkers: [
        "function getNumberParam",
        "export function getProviderDiagnosticPresentation",
        "ProviderDiagnosticParams",
        "Usage threshold",
        "用量阈值",
      ],
    },
    {
      relativePath: "src/shared/provider-diagnostic-presentation.ts",
      markers: [
        "export type ProviderDiagnosticPresentation",
        "export function getProviderDiagnosticPresentation",
        "function getNumberParam",
        "Usage threshold",
        "用量阈值",
      ],
    },
    {
      relativePath: "src/shared/provider-diagnostic-presentation.test.ts",
      markers: [
        "builds localized source-selection presentation",
        "builds localized usage-threshold presentation",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_272_Provider_Diagnostic_Presentation_Split.md",
      markers: [
        "Phase 272",
        "Provider Diagnostic Presentation Split",
        "npm run phase272:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/272_Phase_Provider_Diagnostic_Presentation_Split.md",
      markers: [
        "Phase 272",
        "completed and archived on 2026-05-03",
        "provider-diagnostic-presentation.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "272_Phase_Provider_Diagnostic_Presentation_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 272", "diagnostic presentation split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 272", "diagnostic presentation split"],
    },
    {
      relativePath: "README.md",
      markers: ["diagnostic presentation now lives in"],
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
    "provider-diagnostic-presentation-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 272 provider diagnostic presentation split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
