import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase231-settings-material-select-unification-review",
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

function verifyMissing(fileContent, relativePath, markers) {
  for (const marker of markers) {
    assert(
      !fileContent.includes(marker),
      `${relativePath} still contains removed marker: ${marker}`,
    );
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase231:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase231-settings-material-select-unification-review.mjs",
    "package.json is missing the expected phase231:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/MaterialSelect.tsx",
      markers: [
        "export function MaterialSelect",
        "role=\"combobox\"",
        "role=\"listbox\"",
        "aria-haspopup=\"listbox\"",
        "data-settings-material-select={fieldIdPrefix}",
        "getNextMaterialSelectOptionIndex",
      ],
      removedMarkers: [],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "MaterialSelect",
        "fieldIdPrefix=\"locale-preference\"",
        "fieldIdPrefix=\"theme-mode\"",
        "fieldIdPrefix=\"theme-preset\"",
        "fieldIdPrefix=\"popup-progress-style\"",
        "fieldIdPrefix=\"sidebar-progress-style\"",
        "fieldIdPrefix=\"full-page-progress-style\"",
        "fieldIdPrefix=\"popup-size-preset\"",
        "fieldIdPrefix=\"popup-corner-style\"",
        "fieldIdPrefix=\"popup-shadow-style\"",
        "fieldIdPrefix={`source-preference-${provider.id}`}",
      ],
      removedMarkers: ["<select", "</select>"],
    },
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        ".material-select__button",
        ".material-select__menu",
        ".material-select__option[data-selected=\"true\"]",
        ".material-select__option-check",
      ],
      removedMarkers: [],
    },
    {
      relativePath: "src/sidepanel/routes/InteractionAuditPage.tsx",
      markers: [
        "source-preference material select",
        "[data-settings-material-select^=\"source-preference\"] .material-select__button",
      ],
      removedMarkers: ["source-card select.form-field__control"],
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
    verifyMissing(
      fileContent,
      expectation.relativePath,
      expectation.removedMarkers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length + expectation.removedMarkers.length,
    });
  }

  return results;
}

async function verifyTestsAndDocs() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/MaterialSelect.test.tsx",
      markers: [
        "renders a custom select-only combobox instead of a native select",
        "can hide the label when an enclosing Settings field already labels it",
        "getNextMaterialSelectOptionIndex",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_231_Settings_Material_Select_Unification.md",
      markers: [
        "Phase 231",
        "Settings Material Select Unification",
        "npm run phase231:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/231_Phase_Settings_Material_Select_Unification.md",
      markers: [
        "Phase 231",
        "completed and archived on 2026-04-30",
        "Source Connections",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "231_Phase_Settings_Material_Select_Unification.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 231",
        "Material select unification",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 231",
        "Material-style select-only combobox",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "Material-style select-only combobox",
        "provider source preference controls",
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
    "settings-material-select-unification-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase231: settings material select unification verified");
  console.log(`phase231: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase231: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase231: settings material select unification review failed");
  console.error(error);
  process.exitCode = 1;
});
