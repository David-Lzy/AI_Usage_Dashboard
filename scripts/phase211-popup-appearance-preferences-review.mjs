import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase211-popup-appearance-preferences-review",
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
    packageJson.scripts["phase211:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase211-popup-appearance-preferences-review.mjs",
    "package.json is missing the expected phase211:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/providers/types.ts",
      markers: [
        "export type PopupSizePreset = \"compact\" | \"balanced\" | \"wide\"",
        "export type PopupCornerStyle = \"square\" | \"soft\" | \"rounded\"",
        "export type PopupShadowStyle = \"none\" | \"soft\" | \"elevated\"",
        "popupSizePreset: PopupSizePreset",
        "popupCornerStyle: PopupCornerStyle",
        "popupShadowStyle: PopupShadowStyle",
      ],
    },
    {
      relativePath: "src/shared/popup-appearance.ts",
      markers: [
        "DEFAULT_POPUP_SIZE_PRESET",
        "POPUP_SIZE_PRESET_OPTIONS",
        "normalizePopupSizePreset",
        "syncPopupAppearanceAttributes",
      ],
    },
    {
      relativePath: "src/shared/constants.ts",
      markers: [
        "popupSizePreset: DEFAULT_POPUP_SIZE_PRESET",
        "popupCornerStyle: DEFAULT_POPUP_CORNER_STYLE",
        "popupShadowStyle: DEFAULT_POPUP_SHADOW_STYLE",
      ],
    },
    {
      relativePath: "src/shared/storage.ts",
      markers: [
        "normalizePopupSizePreset",
        "normalizePopupCornerStyle",
        "normalizePopupShadowStyle",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "syncPopupAppearanceAttributes",
        "document.documentElement",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "POPUP_SIZE_PRESET_OPTIONS",
        "onPopupSizePresetChange",
        "onPopupCornerStyleChange",
        "onPopupShadowStyleChange",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        "data-popup-size-preset=\"compact\"",
        "data-popup-size-preset=\"wide\"",
        "data-popup-corner-style=\"square\"",
        "data-popup-shadow-style=\"elevated\"",
        "--app-popup-card-shadow",
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

async function verifyTestsAndDocs() {
  const expectations = [
    {
      relativePath: "src/shared/storage.test.ts",
      markers: [
        "normalizes invalid popup appearance preferences",
        "popupSizePreset",
        "popupCornerStyle",
        "popupShadowStyle",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_211_Popup_Appearance_Preferences.md",
      markers: [
        "Phase 211",
        "Popup Appearance Preferences",
        "npm run phase211:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/211_Phase_Popup_Appearance_Preferences.md",
      markers: [
        "Phase 211",
        "completed and archived on 2026-04-26",
        "popup size, corner, and shadow preferences",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "211_Phase_Popup_Appearance_Preferences.md",
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

async function runReview() {
  const results = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyTestsAndDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "popup-appearance-preferences-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase211: popup appearance preferences verified");
  console.log(`phase211: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase211: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase211: popup appearance preferences review failed");
  console.error(error);
  process.exitCode = 1;
});
