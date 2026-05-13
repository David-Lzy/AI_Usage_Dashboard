import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase192-source-state-typed-diagnostic-fallback-review",
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
assert(packageJson.scripts["phase192:review"], "package.json is missing phase192:review.");

const providerSources = await readProjectFile("src", "shared", "provider-sources.ts");
for (const requiredMarker of [
  "classifySourceStateFromWarningDiagnostic",
  "warningDiagnostic.category",
  "policy_only",
  "host_access",
  "credential",
  "page_session.logged_out",
  "page_session.open_page_required",
  "page_session.capture_unavailable",
  "sync.automatic_sync_overdue",
  "sync.cached_state_stale",
  "usage_threshold",
  "adapter_error",
]) {
  assert(
    providerSources.includes(requiredMarker),
    `provider source classification is missing typed diagnostic marker: ${requiredMarker}`,
  );
}

const providerSourcesTest = await readProjectFile("src", "shared", "provider-sources.test.ts");
for (const requiredMarker of [
  "prefers typed host-access diagnostics",
  "prefers typed credential diagnostics",
  "prefers typed page-session diagnostics",
  "keeps usage-threshold and cached-state stale diagnostics source-ready",
  "maps automatic-sync overdue diagnostics",
  "keeps raw warning pattern fallback for unknown typed diagnostics",
  "future.host_access_hint",
]) {
  assert(
    providerSourcesTest.includes(requiredMarker),
    `provider source test is missing typed diagnostic fallback marker: ${requiredMarker}`,
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
    fileContent.includes("Phase 192") ||
      fileContent.includes("source-state classification typed-diagnostic fallback") ||
      fileContent.includes("localized diagnostic presentation"),
    `${relativePath} is missing Phase 192 source-state typed diagnostic fallback reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "192_Phase_Source_State_Typed_Diagnostic_Fallback.md",
  "Phase 192",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 192 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Archive/phase-reports/100-199/Phase_192_Source_State_Typed_Diagnostic_Fallback.md",
  "Doc/TODOs/Archive/by-phase/100-199/192_Phase_Source_State_Typed_Diagnostic_Fallback.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 192",
    "Source-State Typed Diagnostic Fallback",
    "raw diagnostic strings",
    "source-state classification",
    "npm run phase192:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "source-state-typed-diagnostic-fallback-review.json"),
  `${JSON.stringify(
    {
      classifiedSurface: "src/shared/provider-sources.ts",
      focusedTests: ["src/shared/provider-sources.test.ts"],
      typedDiagnosticFamilies: [
        "policy_only",
        "host_access",
        "credential",
        "page_session",
        "usage_threshold",
        "sync_stale",
        "adapter_error",
      ],
      rawFallbackPreserved: true,
      renderedUiBehaviorChanged: false,
      nextExecutableSlice: "localized diagnostic presentation follow-up",
    },
    null,
    2,
  )}\n`,
);

console.log("phase192: source-state typed diagnostic fallback verified");
