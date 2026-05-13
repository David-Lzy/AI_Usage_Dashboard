import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase188-credential-host-access-diagnostics-review",
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
assert(packageJson.scripts["phase188:review"], "package.json is missing phase188:review.");

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "createCredentialDiagnostic",
  "createHostAccessDiagnostic",
  "credential.admin_api_key_missing",
  "credential.workspace_config_missing",
  "host_access.missing",
  "credentialKind",
  "hostLabel",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `diagnostics helper is missing credential/host marker: ${requiredMarker}`,
  );
}

for (const [providerName, relativePath] of [
  ["Cursor", "src/providers/cursor/adapter.ts"],
  ["Codex", "src/providers/codex/adapter.ts"],
]) {
  const adapter = await readProjectFile(relativePath);
  for (const requiredMarker of [
    "warningDiagnostic",
    "createCredentialDiagnostic",
    "createHostAccessDiagnostic",
    "credentialKind",
    "hostLabel: setting.hostsLabel",
  ]) {
    assert(
      adapter.includes(requiredMarker),
      `${providerName} adapter is missing credential/host marker: ${requiredMarker}`,
    );
  }
}

for (const [providerName, relativePath] of [
  ["Cursor", "src/providers/cursor/adapter.test.ts"],
  ["Codex", "src/providers/codex/adapter.test.ts"],
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of [
    "warningDiagnostic",
    "host_access.missing",
    "category: \"host_access\"",
    "category: \"credential\"",
    "rawMessage: snapshot.warningReason",
  ]) {
    assert(
      testFile.includes(requiredMarker),
      `${providerName} adapter test is missing credential/host marker: ${requiredMarker}`,
    );
  }
}

const diagnosticsTest = await readProjectFile("src", "providers", "diagnostics.test.ts");
for (const requiredMarker of [
  "builds credential diagnostics without rewriting raw warning messages",
  "builds host-access diagnostics without rewriting raw warning messages",
]) {
  assert(
    diagnosticsTest.includes(requiredMarker),
    `diagnostics test is missing credential/host helper marker: ${requiredMarker}`,
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
    fileContent.includes("Phase 188") ||
      fileContent.includes("credential and host-access diagnostics") ||
      fileContent.includes("credential/host-access"),
    `${relativePath} is missing Phase 188 credential/host diagnostic reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "188_Phase_Credential_And_Host_Access_Diagnostics.md",
  "Phase 188",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 188 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_188_Credential_And_Host_Access_Diagnostics.md",
  "Doc/TODOs/Archive/188_Phase_Credential_And_Host_Access_Diagnostics.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 188",
    "Credential And Host-Access Diagnostics",
    "raw diagnostic strings",
    "Cursor",
    "Codex",
    "npm run phase188:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "credential-host-access-diagnostics-review.json"),
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
      nextExecutableSlice: "page-session diagnostics",
    },
    null,
    2,
  )}\n`,
);

console.log("phase188: credential and host-access diagnostics verified");
