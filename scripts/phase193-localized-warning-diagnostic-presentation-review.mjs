import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase193-localized-warning-diagnostic-presentation-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
}

async function readProjectFile(...segments) {
  return readFile(path.join(projectRoot, ...segments), "utf8");
}

const packageJson = await readJson("package.json");
assert(packageJson.scripts["phase193:review"], "package.json is missing phase193:review.");

const localizedCopy = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "getProviderDiagnosticPresentation",
  "ProviderDiagnosticPresentation",
  "usage.threshold_warning",
  "sync.cached_state_stale",
  "用量阈值",
  "Diagnostic summary",
  "return null",
]) {
  assert(
    localizedCopy.includes(requiredMarker),
    `localized diagnostic copy is missing marker: ${requiredMarker}`,
  );
}

const settingsViewModels = await readProjectFile("src", "sidepanel", "settings-view-models.ts");
for (const requiredMarker of [
  "ProviderDiagnosticPresentation",
  "diagnosticSummary",
  "warningDiagnosticPresentation",
]) {
  assert(
    settingsViewModels.includes(requiredMarker),
    `settings source-card model is missing diagnostic presentation marker: ${requiredMarker}`,
  );
}

const settingsPage = await readProjectFile("src", "sidepanel", "routes", "SettingsPage.tsx");
for (const requiredMarker of [
  "getProviderDiagnosticPresentation",
  "snapshot.warningDiagnostic",
  "buildSettingsSourceCardModel",
]) {
  assert(
    settingsPage.includes(requiredMarker),
    `settings page is missing localized diagnostic marker: ${requiredMarker}`,
  );
}

const providerDetail = await readProjectFile("src", "sidepanel", "routes", "ProviderDetailPage.tsx");
for (const requiredMarker of [
  "getProviderDiagnosticPresentation",
  "warningDiagnosticPresentation",
  "copy.notes.diagnosticSummary",
  "provider.warningReason",
]) {
  assert(
    providerDetail.includes(requiredMarker),
    `provider detail is missing localized diagnostic marker: ${requiredMarker}`,
  );
}

for (const [relativePath, markers] of [
  [
    "src/shared/i18n.test.ts",
    [
      "builds localized diagnostic presentation from typed codes and params",
      "returns no localized presentation for unknown diagnostic codes",
      "用量阈值",
    ],
  ],
  [
    "src/sidepanel/settings-view-models.test.ts",
    [
      "adds localized typed diagnostic presentation without hiding raw diagnostics",
      "诊断摘要",
      "5-hour usage window: 7% remaining",
    ],
  ],
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of markers) {
    assert(
      testFile.includes(requiredMarker),
      `${relativePath} is missing localized diagnostic test marker: ${requiredMarker}`,
    );
  }
}

for (const relativePath of [
  "Doc/I18n/I18n_Adapter_Diagnostic_Reason_Code_Plan.md",
  "Doc/I18n/I18n_Raw_Provider_Source_Truth_Policy.md",
  "Doc/I18n/I18n_String_Inventory_Baseline.md",
  "Doc/I18n/I18n_Message_ID_Contract.md",
  "Doc/I18n/I18n_Operator_Workspace_Boundary_And_Extraction.md",
  "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
  "Doc/Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
  "Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
  "Doc/Roadmap/00_Strategic_Directions_Index.md",
  "Doc/AI_Usage_Dashboard_TODOs.md",
  "README.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  assert(
    fileContent.includes("Phase 193") ||
      fileContent.includes("localized warning diagnostic presentation") ||
      fileContent.includes("source-selection and fallback diagnostic presentation"),
    `${relativePath} is missing Phase 193 localized diagnostic presentation reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "193_Phase_Localized_Warning_Diagnostic_Presentation.md",
  "Phase 193",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 193 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_193_Localized_Warning_Diagnostic_Presentation.md",
  "Doc/TODOs/Archive/193_Phase_Localized_Warning_Diagnostic_Presentation.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 193",
    "Localized Warning Diagnostic Presentation",
    "raw diagnostic strings",
    "diagnostic summary",
    "npm run phase193:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "localized-warning-diagnostic-presentation-review.json"),
  `${JSON.stringify(
    {
      copyHelper: "src/shared/localized-copy.ts",
      surfaces: [
        "src/sidepanel/routes/SettingsPage.tsx",
        "src/sidepanel/routes/ProviderDetailPage.tsx",
      ],
      focusedTests: [
        "src/shared/i18n.test.ts",
        "src/sidepanel/settings-view-models.test.ts",
      ],
      rawFieldsPreserved: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      renderedRawDiagnosticBodyRemoved: false,
      nextExecutableSlice:
        "source-selection and fallback diagnostic presentation expansion",
    },
    null,
    2,
  )}\n`,
);

console.log("phase193: localized warning diagnostic presentation verified");
