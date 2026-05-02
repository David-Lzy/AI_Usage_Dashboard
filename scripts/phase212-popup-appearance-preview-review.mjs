import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase212-popup-appearance-preview-review",
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
    packageJson.scripts["phase212:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase212-popup-appearance-preview-review.mjs",
    "package.json is missing the expected phase212:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "popup-appearance-preview-card",
        "data-popup-size-preset={settings.popupSizePreset}",
        "data-popup-corner-style={settings.popupCornerStyle}",
        "data-popup-shadow-style={settings.popupShadowStyle}",
        "settings.popup_appearance_preview.title",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/settings-appearance.css",
      markers: [
        ".popup-appearance-preview-card",
        ".popup-appearance-preview-frame",
        ".popup-appearance-preview-surface",
        "data-popup-size-preset=\"compact\"",
        "data-popup-shadow-style=\"elevated\"",
      ],
    },
    {
      relativePath: "src/shared/i18n.ts",
      markers: [
        "settings.popup_appearance_preview.eyebrow",
        "settings.popup_appearance_preview.title",
        "settings.popup_appearance_preview.sample_quota",
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
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_212_Popup_Appearance_Settings_Preview.md",
      markers: [
        "Phase 212",
        "Popup Appearance Settings Preview",
        "npm run phase212:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/212_Phase_Popup_Appearance_Settings_Preview.md",
      markers: [
        "Phase 212",
        "completed and archived on 2026-04-27",
        "popup appearance preview",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "Phase 212",
        "popup appearance",
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

async function runReview() {
  const results = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "popup-appearance-preview-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase212: popup appearance settings preview verified");
  console.log(`phase212: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase212: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase212: popup appearance settings preview review failed");
  console.error(error);
  process.exitCode = 1;
});
