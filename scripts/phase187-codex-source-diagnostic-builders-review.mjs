import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase187-codex-source-diagnostic-builders-review",
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
assert(packageJson.scripts["phase187:review"], "package.json is missing phase187:review.");

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "createSourceSelectionDiagnostic",
  "createSourceFallbackDiagnostic",
  "createNoLiveSourceFallbackDiagnostic",
  "source.auto_selected_official_api",
  "source.auto_selected_session_page",
  "source.official_api_missing_credential",
  "source.session_page_unavailable",
  "source.no_live_path",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `diagnostics helper is missing source/fallback marker: ${requiredMarker}`,
  );
}

const codexAdapter = await readProjectFile("src", "providers", "codex", "adapter.ts");
for (const requiredMarker of [
  "sourceSelectionDiagnostic",
  "sourceFallbackDiagnostic",
  "createSourceSelectionDiagnostic",
  "createSourceFallbackDiagnostic",
  "createNoLiveSourceFallbackDiagnostic",
  "buildSourceSelectionReason",
  "buildSourceFallbackReason",
]) {
  assert(
    codexAdapter.includes(requiredMarker),
    `Codex adapter is missing typed diagnostic marker: ${requiredMarker}`,
  );
}

const codexTest = await readProjectFile("src", "providers", "codex", "adapter.test.ts");
for (const requiredMarker of [
  "Auto fell back to Session page.",
  "Codex analytics API key and workspace ID are not both configured.",
  "sourceSelectionDiagnostic",
  "sourceFallbackDiagnostic",
  "source.auto_selected_session_page",
  "source.official_api_missing_credential",
  "source.session_page_unavailable",
  "source.no_live_path",
]) {
  assert(
    codexTest.includes(requiredMarker),
    `Codex adapter test is missing raw/typed diagnostic marker: ${requiredMarker}`,
  );
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
    fileContent.includes("Phase 187") ||
      fileContent.includes("Codex source-selection") ||
      fileContent.includes("Codex source selection"),
    `${relativePath} is missing Phase 187 Codex diagnostic builder reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "187_Phase_Codex_Source_Selection_And_Fallback_Diagnostic_Builders.md",
  "Phase 187",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 187 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Archive/phase-reports/100-199/Phase_187_Codex_Source_Selection_And_Fallback_Diagnostic_Builders.md",
  "Doc/TODOs/Archive/by-phase/100-199/187_Phase_Codex_Source_Selection_And_Fallback_Diagnostic_Builders.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 187",
    "Codex Source Selection And Fallback Diagnostic Builders",
    "raw diagnostic strings",
    "Codex",
    "npm run phase187:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "codex-source-diagnostic-builders-review.json"),
  `${JSON.stringify(
    {
      providerPath: "Codex",
      helpers: "src/providers/diagnostics.ts",
      adapter: "src/providers/codex/adapter.ts",
      focusedTests: ["src/providers/codex/adapter.test.ts"],
      rawFieldsPreserved: [
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      renderedUiBehaviorChanged: false,
      nextExecutableSlice: "credential and host-access diagnostics",
    },
    null,
    2,
  )}\n`,
);

console.log("phase187: Codex source diagnostic builders verified");
