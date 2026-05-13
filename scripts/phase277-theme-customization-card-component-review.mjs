import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase277-theme-customization-card-component-review",
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
    packageJson.scripts["phase277:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase277-theme-customization-card-component-review.mjs",
    "package.json is missing the expected phase277:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/SettingsPreferencesSection.tsx",
      markers: [
        "ThemeCustomizationCard",
        "PopupAppearancePreview",
        "buildSettingsPreferenceOptions",
      ],
      forbiddenMarkers: [
        "theme-customization-card",
        "theme-preview-grid",
        "normalizeThemeCustomSeedHex",
        "buildCustomThemePalette",
        "settings.theme_customization.preview.primary",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ThemeCustomizationCard.tsx",
      markers: [
        "export function ThemeCustomizationCard",
        "theme-customization-card",
        "normalizeThemeCustomSeedHex",
        "buildCustomThemePalette",
        "settings.theme_customization.preview.primary",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ThemeCustomizationCard.test.tsx",
      markers: [
        "ThemeCustomizationCard",
        "Previewing #2F6FED",
        "Enter a valid #RRGGBB value",
        "已校验的强调色种子",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_277_Theme_Customization_Card_Component.md",
      markers: [
        "Phase 277",
        "Theme Customization Card Component",
        "npm run phase277:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/277_Phase_Theme_Customization_Card_Component.md",
      markers: [
        "Phase 277",
        "completed and archived on 2026-05-03",
        "ThemeCustomizationCard.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "277_Phase_Theme_Customization_Card_Component.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 277", "Theme customization card component"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 277", "Theme customization card component"],
    },
    {
      relativePath: "README.md",
      markers: ["Theme customization card rendering now lives in"],
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
    "theme-customization-card-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 277 Theme customization card component review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
