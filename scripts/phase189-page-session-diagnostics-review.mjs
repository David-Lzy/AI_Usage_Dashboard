import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase189-page-session-diagnostics-review",
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
assert(packageJson.scripts["phase189:review"], "package.json is missing phase189:review.");

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "createPageSessionDiagnostic",
  "page_session.open_page_required",
  "page_session.logged_out",
  "page_session.capture_unavailable",
  "pageSessionKind",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `diagnostics helper is missing page-session marker: ${requiredMarker}`,
  );
}

for (const [providerName, relativePath] of [
  ["Cursor", "src/providers/cursor/adapter.ts"],
  ["Codex", "src/providers/codex/adapter.ts"],
]) {
  const adapter = await readProjectFile(relativePath);
  for (const requiredMarker of [
    "createPageSessionDiagnostic",
    "warningDiagnostic",
    "open_page_required",
    "logged_out",
    "capture_unavailable",
    "rawMessage: result.reason",
  ]) {
    assert(
      adapter.includes(requiredMarker),
      `${providerName} adapter is missing page-session marker: ${requiredMarker}`,
    );
  }
}

for (const [providerName, relativePath] of [
  ["Cursor", "src/providers/cursor/adapter.test.ts"],
  ["Codex", "src/providers/codex/adapter.test.ts"],
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of [
    "page_session.",
    "category: \"page_session\"",
    "rawMessage: snapshot.warningReason",
    "pageSessionKind",
    "Session page preference could not find an available live source.",
  ]) {
    assert(
      testFile.includes(requiredMarker),
      `${providerName} adapter test is missing page-session marker: ${requiredMarker}`,
    );
  }
}

const diagnosticsTest = await readProjectFile("src", "providers", "diagnostics.test.ts");
for (const requiredMarker of [
  "builds page-session diagnostics without rewriting raw warning messages",
  "marks capture-unavailable page-session diagnostics as errors",
]) {
  assert(
    diagnosticsTest.includes(requiredMarker),
    `diagnostics test is missing page-session helper marker: ${requiredMarker}`,
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
    fileContent.includes("Phase 189") ||
      fileContent.includes("page-session diagnostics") ||
      fileContent.includes("Page-Session Diagnostics"),
    `${relativePath} is missing Phase 189 page-session diagnostic reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "189_Phase_Page_Session_Diagnostics.md",
  "Phase 189",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 189 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_189_Page_Session_Diagnostics.md",
  "Doc/TODOs/Archive/189_Phase_Page_Session_Diagnostics.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 189",
    "Page-Session Diagnostics",
    "raw diagnostic strings",
    "Cursor",
    "Codex",
    "npm run phase189:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "page-session-diagnostics-review.json"),
  `${JSON.stringify(
    {
      providerPaths: ["Cursor", "Codex"],
      helpers: "src/providers/diagnostics.ts",
      adapters: [
        "src/providers/cursor/adapter.ts",
        "src/providers/codex/adapter.ts",
      ],
      focusedTests: [
        "src/providers/diagnostics.test.ts",
        "src/providers/cursor/adapter.test.ts",
        "src/providers/codex/adapter.test.ts",
      ],
      rawFieldsPreserved: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      renderedUiBehaviorChanged: false,
      nextExecutableSlice: "usage-threshold and policy-only diagnostics",
    },
    null,
    2,
  )}\n`,
);

console.log("phase189: page-session diagnostics verified");
