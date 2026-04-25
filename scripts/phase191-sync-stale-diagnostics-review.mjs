import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase191-sync-stale-diagnostics-review",
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
assert(packageJson.scripts["phase191:review"], "package.json is missing phase191:review.");

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "createSyncStaleDiagnostic",
  "SyncStaleDiagnosticKind",
  "sync.automatic_sync_overdue",
  "sync.cached_state_stale",
  "syncStaleKind",
  "ageMinutes",
  "staleAfterMinutes",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `diagnostics helper is missing sync-stale marker: ${requiredMarker}`,
  );
}

const syncEngine = await readProjectFile("src", "background", "sync-engine.ts");
for (const requiredMarker of [
  "createSyncStaleDiagnostic",
  "warningDiagnostic",
  "automatic_sync_overdue",
  "cached_state_stale",
  "Automatic sync is overdue; cached state may be stale.",
  "Automatic refresh is overdue; showing cached data.",
]) {
  assert(
    syncEngine.includes(requiredMarker),
    `sync engine is missing sync-stale marker: ${requiredMarker}`,
  );
}

for (const [relativePath, markers] of [
  [
    "src/providers/diagnostics.test.ts",
    ["createSyncStaleDiagnostic", "sync.cached_state_stale", "category: \"sync_stale\""],
  ],
  [
    "src/background/sync-engine.test.ts",
    ["sync.", "category: \"sync_stale\"", "rawMessage: snapshot.warningReason"],
  ],
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of markers) {
    assert(
      testFile.includes(requiredMarker),
      `${relativePath} is missing sync-stale diagnostic test marker: ${requiredMarker}`,
    );
  }
}

const syncEngineTest = await readProjectFile("src/background/sync-engine.test.ts");
for (const requiredMarker of [
  "does not overwrite existing provider warning diagnostics",
  "sync.automatic_sync_overdue",
  "sync.cached_state_stale",
]) {
  assert(
    syncEngineTest.includes(requiredMarker),
    `sync-engine test is missing preservation marker: ${requiredMarker}`,
  );
}

for (const relativePath of [
  "Doc/I18n_Adapter_Diagnostic_Reason_Code_Plan.md",
  "Doc/I18n_Raw_Provider_Source_Truth_Policy.md",
  "Doc/I18n_String_Inventory_Baseline.md",
  "Doc/I18n_Message_ID_Contract.md",
  "Doc/I18n_Operator_Workspace_Boundary_And_Extraction.md",
  "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
  "Doc/Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
  "Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
  "Doc/Roadmap/00_Strategic_Directions_Index.md",
  "Doc/AI_Usage_Dashboard_TODOs.md",
  "README.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  assert(
    fileContent.includes("Phase 191") ||
      fileContent.includes("sync-stale diagnostics") ||
      fileContent.includes("source-state classification typed-diagnostic fallback"),
    `${relativePath} is missing Phase 191 sync-stale diagnostic reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "191_Phase_Sync_Stale_Diagnostics.md",
  "Phase 191",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 191 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_191_Sync_Stale_Diagnostics.md",
  "Doc/TODOs/Archive/191_Phase_Sync_Stale_Diagnostics.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 191",
    "Sync-Stale Diagnostics",
    "raw diagnostic strings",
    "sync engine",
    "npm run phase191:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "sync-stale-diagnostics-review.json"),
  `${JSON.stringify(
    {
      helpers: "src/providers/diagnostics.ts",
      syncEngine: "src/background/sync-engine.ts",
      focusedTests: [
        "src/providers/diagnostics.test.ts",
        "src/background/sync-engine.test.ts",
      ],
      typedCodes: [
        "sync.automatic_sync_overdue",
        "sync.cached_state_stale",
      ],
      rawFieldsPreserved: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      renderedUiBehaviorChanged: false,
      nextExecutableSlice: "source-state classification typed-diagnostic fallback",
    },
    null,
    2,
  )}\n`,
);

console.log("phase191: sync-stale diagnostics verified");
