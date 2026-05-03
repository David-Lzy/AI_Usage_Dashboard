import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase276-popup-appearance-preview-component-review",
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
    packageJson.scripts["phase276:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase276-popup-appearance-preview-component-review.mjs",
    "package.json is missing the expected phase276:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/SettingsPreferencesSection.tsx",
      markers: [
        "PopupAppearancePreview",
        "<PopupAppearancePreview i18n={i18n} settings={settings} />",
        "theme-customization-card",
      ],
      forbiddenMarkers: [
        "popup-appearance-preview-card",
        "settings.popup_appearance_preview.sample_provider",
        "settings.popup_appearance_preview.sample_quota",
      ],
    },
    {
      relativePath: "src/sidepanel/components/PopupAppearancePreview.tsx",
      markers: [
        "export function PopupAppearancePreview",
        "popup-appearance-preview-card",
        "data-popup-size-preset",
        "settings.popup_appearance_preview.sample_provider",
        "settings.popup_appearance_preview.sample_quota",
      ],
    },
    {
      relativePath: "src/sidepanel/components/PopupAppearancePreview.test.tsx",
      markers: [
        "PopupAppearancePreview",
        "data-popup-size-preset=\"wide\"",
        "工具栏弹窗形态",
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
        "Doc/testing/Phase_276_Popup_Appearance_Preview_Component.md",
      markers: [
        "Phase 276",
        "Popup Appearance Preview Component",
        "npm run phase276:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/276_Phase_Popup_Appearance_Preview_Component.md",
      markers: [
        "Phase 276",
        "completed and archived on 2026-05-03",
        "PopupAppearancePreview.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "276_Phase_Popup_Appearance_Preview_Component.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 276", "Popup appearance preview component"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 276", "Popup appearance preview component"],
    },
    {
      relativePath: "README.md",
      markers: ["Popup appearance preview rendering now lives in"],
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
    "popup-appearance-preview-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 276 Popup appearance preview component review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
