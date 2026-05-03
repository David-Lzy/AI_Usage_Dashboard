import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase275-settings-preference-options-split-review",
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
    packageJson.scripts["phase275:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase275-settings-preference-options-split-review.mjs",
    "package.json is missing the expected phase275:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/SettingsPreferencesSection.tsx",
      markers: [
        "buildSettingsPreferenceOptions",
        "customThemePreviewPalette",
        "EditableNumberCombobox",
        "MaterialSelect",
      ],
      forbiddenMarkers: [
        "buildActionBadgeSelectOptions",
        "normalizeActionBadgeSelection",
        "THEME_PRESET_OPTIONS.map",
        "PROGRESS_DISPLAY_STYLE_OPTIONS.map",
        "POPUP_SIZE_PRESET_OPTIONS.map",
        "SYNC_INTERVAL_PRESETS.map",
        "WARNING_THRESHOLD_PRESETS.map",
      ],
    },
    {
      relativePath: "src/sidepanel/settings-preference-options.ts",
      markers: [
        "export function buildSettingsPreferenceOptions",
        "buildActionBadgeSelectOptions",
        "normalizeActionBadgeSelection",
        "SYNC_INTERVAL_PRESETS.map",
        "WARNING_THRESHOLD_PRESETS.map",
      ],
    },
    {
      relativePath: "src/sidepanel/settings-preference-options.test.ts",
      markers: [
        "buildSettingsPreferenceOptions",
        "keeps numeric helper copy localized",
        "normalizedActionBadgeSelection",
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
        "Doc/testing/Phase_275_Settings_Preference_Options_Split.md",
      markers: [
        "Phase 275",
        "Settings Preference Options Split",
        "npm run phase275:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/275_Phase_Settings_Preference_Options_Split.md",
      markers: [
        "Phase 275",
        "completed and archived on 2026-05-03",
        "settings-preference-options.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "275_Phase_Settings_Preference_Options_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 275", "Settings preference options split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 275", "Settings preference options split"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings preference option assembly now lives in"],
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
    "settings-preference-options-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 275 Settings preference options split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
