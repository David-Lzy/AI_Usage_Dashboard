import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase229-settings-editable-number-combobox-review",
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
    packageJson.scripts["phase229:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase229-settings-editable-number-combobox-review.mjs",
    "package.json is missing the expected phase229:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCodeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/EditableNumberCombobox.tsx",
      markers: [
        "export function EditableNumberCombobox",
        "export function parseEditableNumberDraft",
        "role=\"combobox\"",
        "role=\"listbox\"",
        "aria-autocomplete=\"none\"",
        "aria-activedescendant={activeOptionId}",
        "data-settings-custom-number-field={fieldIdPrefix}",
        "getNextOptionIndex",
      ],
      removedMarkers: [],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "EditableNumberCombobox",
        "SYNC_INTERVAL_PRESETS",
        "WARNING_THRESHOLD_PRESETS",
        "fieldIdPrefix=\"sync-interval\"",
        "fieldIdPrefix=\"warning-threshold\"",
        "onChange={onSyncIntervalChange}",
        "onChange={onWarningThresholdChange}",
      ],
      removedMarkers: [
        "value={String(settings.syncIntervalMinutes)}",
        "value={String(settings.warningThresholdPercent)}",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        ".editable-number-combobox__anchor",
        ".editable-number-combobox__menu",
        ".editable-number-combobox__option[data-selected=\"true\"]",
        ".editable-number-combobox__error",
        "box-shadow: var(--app-elevation-2);",
      ],
      removedMarkers: [],
    },
    {
      relativePath: "src/shared/settings-preferences.ts",
      markers: [
        "SYNC_INTERVAL_MIN_MINUTES = 15",
        "SYNC_INTERVAL_MAX_MINUTES = 240",
        "WARNING_THRESHOLD_MIN_PERCENT = 50",
        "WARNING_THRESHOLD_MAX_PERCENT = 99",
        "normalizeSyncIntervalMinutes",
        "normalizeWarningThresholdPercent",
      ],
      removedMarkers: [],
    },
    {
      relativePath: "src/shared/storage.ts",
      markers: [
        "normalizeSyncIntervalMinutes(",
        "normalizeWarningThresholdPercent(",
      ],
      removedMarkers: [],
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

async function verifyTestMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/EditableNumberCombobox.test.tsx",
      markers: [
        "renders an editable combobox instead of a native select",
        "parseEditableNumberDraft(\"80%\")",
        "isEditableNumberInRange(30.5, 15, 240)",
      ],
    },
    {
      relativePath: "src/shared/settings-preferences.test.ts",
      markers: [
        "accepts integer sync intervals inside the supported range",
        "falls back for unsupported warning thresholds",
      ],
    },
    {
      relativePath: "src/shared/storage.test.ts",
      markers: [
        "normalizes invalid numeric preference values",
        "syncIntervalMinutes: 5",
        "warningThresholdPercent: 100",
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
      relativePath: "Doc/testing/Phase_229_Settings_Editable_Number_Combobox.md",
      markers: [
        "Phase 229",
        "Settings Editable Number Combobox",
        "editable exposed dropdown",
        "npm run phase229:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/229_Phase_Settings_Editable_Number_Combobox.md",
      markers: [
        "Phase 229",
        "completed and archived on 2026-04-30",
        "editable numeric combobox",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "229_Phase_Settings_Editable_Number_Combobox.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 229",
        "editable numeric combobox",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 229",
        "editable numeric combobox",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "editable numeric combobox",
        "sync interval and warning threshold",
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
    ...(await verifyCodeMarkers()),
    ...(await verifyTestMarkers()),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "settings-editable-number-combobox-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase229: settings editable number combobox verified");
  console.log(`phase229: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase229: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase229: settings editable number combobox review failed");
  console.error(error);
  process.exitCode = 1;
});
