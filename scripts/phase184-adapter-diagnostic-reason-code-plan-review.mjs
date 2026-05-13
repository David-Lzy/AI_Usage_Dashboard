import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase184-adapter-diagnostic-reason-code-plan-review",
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
assert(packageJson.scripts["phase184:review"], "package.json is missing phase184:review.");

const planDoc = await readProjectFile("Doc", "I18n_Adapter_Diagnostic_Reason_Code_Plan.md");
for (const requiredPhrase of [
  "Phase 184",
  "maintained reference",
  "ProviderSnapshot.warningReason",
  "ProviderSnapshot.sourceSelectionReason",
  "ProviderSnapshot.sourceFallbackReason",
  "ProviderDiagnostic",
  "rawMessage",
  "source_selection",
  "source_fallback",
  "type-only",
]) {
  assert(
    planDoc.includes(requiredPhrase),
    `adapter diagnostic reason-code plan is missing phrase: ${requiredPhrase}`,
  );
}

const childTodo = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
);
for (const requiredPhrase of [
  "Direction 09.3",
  "Phase 184",
  "Type-Only Additive Model",
  "raw diagnostic string fields remain present and unchanged",
  "provider coverage truth remains unchanged",
]) {
  assert(
    childTodo.includes(requiredPhrase),
    `Direction 09.3 TODO is missing phrase: ${requiredPhrase}`,
  );
}

const rawPolicy = await readProjectFile("Doc", "I18n_Raw_Provider_Source_Truth_Policy.md");
for (const requiredPhrase of [
  "I18n_Adapter_Diagnostic_Reason_Code_Plan.md",
  "Phase 184",
  "type-only additive",
]) {
  assert(
    rawPolicy.includes(requiredPhrase),
    `raw provider source-truth policy is missing Phase 184 phrase: ${requiredPhrase}`,
  );
}

const directionDoc = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
);
for (const requiredPhrase of [
  "Phase 184",
  "adapter diagnostic typed reason-code plan - shipped",
  "type-only additive diagnostic model - next",
  "09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
]) {
  assert(
    directionDoc.includes(requiredPhrase),
    `Direction 09 doc is missing Phase 184 phrase: ${requiredPhrase}`,
  );
}

const runtimeTodo = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
);
for (const requiredPhrase of [
  "fifteenth executable phase landed",
  "Phase 184",
  "adapter diagnostic typed reason-code plan - completed",
  "type-only additive diagnostic model - next",
]) {
  assert(
    runtimeTodo.includes(requiredPhrase),
    `Direction 09.2 TODO is missing Phase 184 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/Roadmap/00_Strategic_Directions_Index.md",
  "Doc/AI_Usage_Dashboard_TODOs.md",
  "Doc/I18n/I18n_String_Inventory_Baseline.md",
  "Doc/I18n/I18n_Message_ID_Contract.md",
  "README.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  assert(
    fileContent.includes("Phase 184") ||
      fileContent.includes("adapter diagnostic typed reason-code plan") ||
      fileContent.includes("type-only additive diagnostic model"),
    `${relativePath} is missing adapter diagnostic reason-code plan reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "184_Phase_Adapter_Diagnostic_Reason_Code_Plan.md",
  "Phase 184",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 184 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_184_Adapter_Diagnostic_Reason_Code_Plan.md",
  "Doc/TODOs/Archive/184_Phase_Adapter_Diagnostic_Reason_Code_Plan.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 184",
    "Adapter Diagnostic Reason-Code Plan",
    "No runtime product behavior changed",
    "npm run phase184:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "adapter-diagnostic-reason-code-plan-review.json"),
  `${JSON.stringify(
    {
      maintainedReference: "Doc/I18n/I18n_Adapter_Diagnostic_Reason_Code_Plan.md",
      childTodo: "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
      protectedRawFields: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      nextExecutableSlice: "type-only additive diagnostic model",
      runtimeBehaviorChanged: false,
    },
    null,
    2,
  )}\n`,
);

console.log("phase184: adapter diagnostic reason-code plan verified");
