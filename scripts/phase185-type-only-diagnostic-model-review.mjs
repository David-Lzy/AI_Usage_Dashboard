import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase185-type-only-diagnostic-model-review",
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
assert(packageJson.scripts["phase185:review"], "package.json is missing phase185:review.");

const providerTypes = await readProjectFile("src", "providers", "types.ts");
for (const requiredMarker of [
  "ProviderDiagnosticSeverity",
  "ProviderDiagnosticCategory",
  "KnownProviderDiagnosticCode",
  "ProviderDiagnosticCode",
  "ProviderDiagnosticParams",
  "ProviderDiagnostic",
  "warningDiagnostic?: ProviderDiagnostic | null",
  "sourceSelectionDiagnostic?: ProviderDiagnostic | null",
  "sourceFallbackDiagnostic?: ProviderDiagnostic | null",
  "warningReason: string | null",
  "sourceSelectionReason: string",
  "sourceFallbackReason: string | null",
]) {
  assert(
    providerTypes.includes(requiredMarker),
    `provider types are missing additive diagnostic marker: ${requiredMarker}`,
  );
}

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "PROVIDER_DIAGNOSTIC_CODE_CATEGORIES",
  "isKnownProviderDiagnosticCode",
  "getProviderDiagnosticCategory",
  "createProviderDiagnostic",
  "getProviderDiagnosticRawMessage",
  "source.official_api_missing_credential",
  "adapter.parse_failed",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `diagnostics helper is missing marker: ${requiredMarker}`,
  );
}

const diagnosticsTest = await readProjectFile("src", "providers", "diagnostics.test.ts");
for (const requiredMarker of [
  "creates typed diagnostics while preserving raw source-truth messages",
  "keeps typed diagnostic fields additive on provider snapshots",
  "falls back to raw strings when typed diagnostics are absent",
  "preserves raw messages for unknown future codes",
]) {
  assert(
    diagnosticsTest.includes(requiredMarker),
    `diagnostics test is missing marker: ${requiredMarker}`,
  );
}

for (const relativePath of [
  "Doc/I18n/I18n_Adapter_Diagnostic_Reason_Code_Plan.md",
  "Doc/I18n/I18n_Raw_Provider_Source_Truth_Policy.md",
  "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
  "Doc/Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
  "Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
  "Doc/Roadmap/00_Strategic_Directions_Index.md",
  "Doc/AI_Usage_Dashboard_TODOs.md",
  "README.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  assert(
    fileContent.includes("Phase 185") ||
      fileContent.includes("type-only additive diagnostic model") ||
      fileContent.includes("Source Selection And Fallback Builders"),
    `${relativePath} is missing Phase 185 type-only diagnostic model reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "185_Phase_Type_Only_Additive_Diagnostic_Model.md",
  "Phase 185",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 185 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Archive/phase-reports/100-199/Phase_185_Type_Only_Additive_Diagnostic_Model.md",
  "Doc/TODOs/Archive/by-phase/100-199/185_Phase_Type_Only_Additive_Diagnostic_Model.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 185",
    "type-only additive diagnostic model",
    "raw diagnostic strings",
    "npm run phase185:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "type-only-diagnostic-model-review.json"),
  `${JSON.stringify(
    {
      types: "src/providers/types.ts",
      helpers: "src/providers/diagnostics.ts",
      focusedTests: "src/providers/diagnostics.test.ts",
      rawFieldsPreserved: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      nextExecutableSlice: "source selection and fallback builders",
      renderedUiBehaviorChanged: false,
    },
    null,
    2,
  )}\n`,
);

console.log("phase185: type-only diagnostic model verified");
