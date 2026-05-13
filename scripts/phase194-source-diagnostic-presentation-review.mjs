import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase194-source-diagnostic-presentation-review",
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
assert(packageJson.scripts["phase194:review"], "package.json is missing phase194:review.");

const localizedCopy = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "formatSourceSelectionSummary",
  "formatNoLivePathSummary",
  "source.auto_selected_session_page",
  "source.official_api_missing_credential",
  "source.no_live_path",
  "自动回退到会话页面",
  "Selection summary",
]) {
  assert(
    localizedCopy.includes(requiredMarker),
    `localized source diagnostic copy is missing marker: ${requiredMarker}`,
  );
}

const settingsViewModels = await readProjectFile("src", "sidepanel", "settings-view-models.ts");
for (const requiredMarker of [
  "sourceSelectionDiagnosticPresentation",
  "sourceFallbackDiagnosticPresentation",
  "selectionDiagnosticSummary",
  "fallbackDiagnosticSummary",
]) {
  assert(
    settingsViewModels.includes(requiredMarker),
    `settings source-card model is missing source diagnostic marker: ${requiredMarker}`,
  );
}

const settingsPage = await readProjectFile("src", "sidepanel", "routes", "SettingsPage.tsx");
for (const requiredMarker of [
  "snapshot.sourceSelectionDiagnostic",
  "snapshot.sourceFallbackDiagnostic",
  "getProviderDiagnosticPresentation",
]) {
  assert(
    settingsPage.includes(requiredMarker),
    `settings page is missing source diagnostic marker: ${requiredMarker}`,
  );
}

const providerDetail = await readProjectFile("src", "sidepanel", "routes", "ProviderDetailPage.tsx");
for (const requiredMarker of [
  "sourceSelectionDiagnosticPresentation",
  "sourceFallbackDiagnosticPresentation",
  "copy.fieldLabels.selectionDiagnosticSummary",
  "copy.fieldLabels.fallbackDiagnosticSummary",
  "provider.sourceSelectionReason",
  "provider.sourceFallbackReason",
]) {
  assert(
    providerDetail.includes(requiredMarker),
    `provider detail is missing source diagnostic marker: ${requiredMarker}`,
  );
}

for (const [relativePath, markers] of [
  [
    "src/shared/i18n.test.ts",
    [
      "builds localized source diagnostic presentation from typed codes and params",
      "自动回退到会话页面",
      "Official API credential missing",
    ],
  ],
  [
    "src/sidepanel/settings-view-models.test.ts",
    [
      "adds localized source diagnostic presentation without hiding raw source reasons",
      "选择摘要",
      "回退摘要",
    ],
  ],
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of markers) {
    assert(
      testFile.includes(requiredMarker),
      `${relativePath} is missing source diagnostic test marker: ${requiredMarker}`,
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
    fileContent.includes("Phase 194") ||
      fileContent.includes("source diagnostic presentation") ||
      fileContent.includes("adapter-error diagnostic"),
    `${relativePath} is missing Phase 194 source diagnostic presentation reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "194_Phase_Source_Diagnostic_Presentation.md",
  "Phase 194",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 194 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Archive/phase-reports/100-199/Phase_194_Source_Diagnostic_Presentation.md",
  "Doc/TODOs/Archive/by-phase/100-199/194_Phase_Source_Diagnostic_Presentation.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 194",
    "Source Diagnostic Presentation",
    "raw source-selection",
    "raw fallback",
    "npm run phase194:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "source-diagnostic-presentation-review.json"),
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
      localizedSourceDiagnosticPresentation: true,
      nextExecutableSlice:
        "adapter-error diagnostic builders and presentation boundary",
    },
    null,
    2,
  )}\n`,
);

console.log("phase194: source diagnostic presentation verified");
