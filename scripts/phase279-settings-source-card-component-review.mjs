import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase279-settings-source-card-component-review",
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
    packageJson.scripts["phase279:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase279-settings-source-card-component-review.mjs",
    "package.json is missing the expected phase279:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/SettingsSourceSection.tsx",
      markers: ["SettingsSourceCard", "provider-shell-list"],
      forbiddenMarkers: [
        "buildProviderSourceDisplay",
        "buildSettingsSourceCardModel",
        "source-card__details-toggle",
        "MaterialSelect",
        "getProviderDiagnosticPresentation",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSourceCard.tsx",
      markers: [
        "export function SettingsSourceCard",
        "buildProviderSourceDisplay",
        "buildSettingsSourceCardModel",
        "source-card__details-toggle",
        "MaterialSelect",
        "onAttachActiveSessionPage",
        "onClearPageBinding",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSourceCard.test.tsx",
      markers: [
        "SettingsSourceCard",
        "Detailed diagnostics",
        "source-preference-cursor",
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
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_279_Settings_Source_Card_Component.md",
      markers: [
        "Phase 279",
        "Settings Source Card Component",
        "npm run phase279:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/279_Phase_Settings_Source_Card_Component.md",
      markers: [
        "Phase 279",
        "completed and archived on 2026-05-03",
        "SettingsSourceCard.tsx",
        "SettingsSourceSection.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "279_Phase_Settings_Source_Card_Component.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 279", "Settings source card component"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 279", "Settings source card component"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings source card rendering now lives in"],
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
    "settings-source-card-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 279 Settings source card component review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
