import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase278-settings-page-view-model-and-seed-hook-review",
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
    packageJson.scripts["phase278:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase278-settings-page-view-model-and-seed-hook-review.mjs",
    "package.json is missing the expected phase278:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "buildSettingsPageViewModels",
        "useSettingsThemeCustomSeedDraft",
        "SettingsPreferencesSection",
        "SettingsCredentialsSection",
      ],
      forbiddenMarkers: [
        "type FormEvent",
        "useEffect",
        "useState",
        "normalizeThemeCustomSeedHex",
        "buildSettingsSummaryLabels",
        "buildSettingsSummaryItems",
        "function findCredentialProvider",
        "function handleApplyThemeCustomSeed",
      ],
    },
    {
      relativePath: "src/sidepanel/settings-page-view-models.ts",
      markers: [
        "export function buildSettingsPageViewModels",
        "function findCredentialProvider",
        "buildSettingsSummaryItems",
        "buildSettingsSummaryLabels",
        "settingsSectionNavItems",
      ],
    },
    {
      relativePath: "src/sidepanel/use-settings-theme-custom-seed-draft.ts",
      markers: [
        "export function useSettingsThemeCustomSeedDraft",
        "normalizeThemeCustomSeedHex",
        "function handleApplyThemeCustomSeed",
        "function handleResetThemeCustomSeed",
      ],
    },
    {
      relativePath: "src/sidepanel/settings-page-view-models.test.ts",
      markers: [
        "buildSettingsPageViewModels",
        "Settings nav",
        "zh-CN pilot",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_278_Settings_Page_View_Model_And_Seed_Hook.md",
      markers: [
        "Phase 278",
        "Settings Page View Model And Seed Hook",
        "npm run phase278:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/278_Phase_Settings_Page_View_Model_And_Seed_Hook.md",
      markers: [
        "Phase 278",
        "completed and archived on 2026-05-03",
        "settings-page-view-models.ts",
        "use-settings-theme-custom-seed-draft.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "278_Phase_Settings_Page_View_Model_And_Seed_Hook.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 278", "Settings page view model and seed hook"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 278", "Settings page view model and seed hook"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings page derived view models now live in"],
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
    "settings-page-view-model-and-seed-hook-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 278 Settings page view model and seed hook review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
