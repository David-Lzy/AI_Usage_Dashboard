import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase281-standard-app-settings-actions-split-review",
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
    packageJson.scripts["phase281:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase281-standard-app-settings-actions-split-review.mjs",
    "package.json is missing the expected phase281:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/standard-app-actions.ts",
      markers: [
        "createStandardAppActions",
        "createStandardAppSettingsActions",
        "settingsActions.handleUpdateSettings",
        "settingsActions.handleSetSourcePreference",
        "createStandardAppSessionPageActions",
      ],
      forbiddenMarkers: [
        "app:update-settings",
        "app:set-provider-source-preference",
        "app:set-provider-admin-api-key",
        "app:set-codex-workspace-config",
        "settings.toast.preferences_saved_title",
        "function handleSaveProviderAdminApiKey",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-settings-actions.ts",
      markers: [
        "export function createStandardAppSettingsActions",
        "function handleUpdateSettings",
        "function handleSetSourcePreference",
        "function handleClearPageBinding",
        "function handleSaveProviderAdminApiKey",
        "function handleSaveCodexWorkspaceConfig",
        "settings.toast.preferences_saved_title",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-settings-actions.test.ts",
      markers: [
        "createStandardAppSettingsActions",
        "dispatches source preference changes only when the value differs from current state",
        "dispatches credential and Codex workspace updates",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-actions.test.ts",
      markers: [
        "createStandardAppActions",
        "dispatches settings updates without changing settings locally",
        "saves preference feedback through a localized toast",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_281_Standard_App_Settings_Actions_Split.md",
      markers: [
        "Phase 281",
        "Standard App Settings Actions Split",
        "npm run phase281:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/281_Phase_Standard_App_Settings_Actions_Split.md",
      markers: [
        "Phase 281",
        "completed and archived on 2026-05-03",
        "standard-app-settings-actions.ts",
        "standard-app-actions.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "281_Phase_Standard_App_Settings_Actions_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 281", "standard-app settings actions split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 281", "standard-app settings actions split"],
    },
    {
      relativePath: "README.md",
      markers: ["standard app Settings actions now live in"],
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
    "standard-app-settings-actions-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 281 standard app Settings actions split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
