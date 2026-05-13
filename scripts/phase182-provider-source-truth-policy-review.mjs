import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase182-provider-source-truth-policy-review",
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
assert(packageJson.scripts["phase182:review"], "package.json is missing phase182:review.");

const policyDoc = await readProjectFile("Doc", "I18n_Raw_Provider_Source_Truth_Policy.md");
for (const requiredPhrase of [
  "maintained reference",
  "Phase 182",
  "ProviderSnapshot.warningReason",
  "ProviderSnapshot.sourceSelectionReason",
  "ProviderSnapshot.sourceFallbackReason",
  "Presentation-Only Candidates",
  "typed reason codes",
  "provider-source display wrappers",
]) {
  assert(
    policyDoc.includes(requiredPhrase),
    `raw provider source-truth policy is missing phrase: ${requiredPhrase}`,
  );
}

const providerTypes = await readProjectFile("src", "providers", "types.ts");
for (const requiredField of [
  "warningReason: string | null",
  "sourceSelectionReason: string",
  "sourceFallbackReason: string | null",
  "contractDetail: string",
  "graduationGateDetail: string | null",
]) {
  assert(
    providerTypes.includes(requiredField),
    `provider types no longer expose reviewed source-truth field: ${requiredField}`,
  );
}

const providerSources = await readProjectFile("src", "shared", "provider-sources.ts");
for (const requiredMarker of [
  "SOURCE_KIND_LABELS",
  "SOURCE_PREFERENCE_LABELS",
  "FIELD_AVAILABILITY_LABELS",
  "SOURCE_FIDELITY_LABELS",
  "SOURCE_CONTRACT_LABELS",
  "warningReason ||",
]) {
  assert(
    providerSources.includes(requiredMarker),
    `provider-sources.ts is missing reviewed presentation/raw marker: ${requiredMarker}`,
  );
}

const directionDoc = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
);
assert(directionDoc.includes("Phase 182"), "Direction 09 doc is missing Phase 182.");

const childTodo = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
);
for (const requiredPhrase of [
  "Phase 182",
  "I18n_Raw_Provider_Source_Truth_Policy.md",
  "provider-source display wrappers",
]) {
  assert(
    childTodo.includes(requiredPhrase),
    `Direction 09.2 TODO is missing Phase 182 phrase: ${requiredPhrase}`,
  );
}

const inventoryDoc = await readProjectFile("Doc", "I18n_String_Inventory_Baseline.md");
assert(
  inventoryDoc.includes("I18n_Raw_Provider_Source_Truth_Policy.md"),
  "string inventory is missing the raw provider source-truth policy reference.",
);

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
assert(phaseIndex.includes("Phase 182"), "Phase index is missing Phase 182.");

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "provider-source-truth-policy-review.json"),
  `${JSON.stringify(
    {
      policyReference: "Doc/I18n/I18n_Raw_Provider_Source_Truth_Policy.md",
      protectedRawFields: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
        "ProviderSourcePlan.contractDetail",
        "ProviderSourcePlan.note",
        "ProviderSourcePlan.graduationGateLabel",
        "ProviderSourcePlan.graduationGateDetail",
      ],
      nextLocalizableCandidates: [
        "source kind labels",
        "source preference labels",
        "field availability labels",
        "source fidelity labels",
        "source contract labels",
        "generated provider-source helper descriptions",
      ],
    },
    null,
    2,
  )}\n`,
);

console.log("phase182: provider source-truth localization policy verified");
