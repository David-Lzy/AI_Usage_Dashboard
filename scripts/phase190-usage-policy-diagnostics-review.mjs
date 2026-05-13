import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase190-usage-policy-diagnostics-review",
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
assert(packageJson.scripts["phase190:review"], "package.json is missing phase190:review.");

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "createUsageThresholdDiagnostic",
  "createPolicyOnlyDiagnostic",
  "usage.threshold_warning",
  "usage.overage_detected",
  "usage.on_demand_off",
  "policy.documented_limit_only",
  "usageThresholdKind",
  "policyOnlyKind",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `diagnostics helper is missing usage/policy marker: ${requiredMarker}`,
  );
}

const normalize = await readProjectFile("src", "providers", "normalize.ts");
for (const requiredMarker of [
  "createUsageThresholdDiagnostic",
  "warningDiagnostic",
  "overage_detected",
  "threshold_warning",
  "providerId",
]) {
  assert(
    normalize.includes(requiredMarker),
    `shared usage normalization is missing marker: ${requiredMarker}`,
  );
}

for (const [providerName, relativePath] of [
  ["Cursor", "src/providers/cursor/adapter.ts"],
  ["Codex", "src/providers/codex/adapter.ts"],
  ["Gemini", "src/providers/gemini/adapter.ts"],
]) {
  const adapter = await readProjectFile(relativePath);
  const requiredMarkers =
    providerName === "Gemini"
      ? [
          "createPolicyOnlyDiagnostic",
          "policyOnlyKind",
          "documented_limit_only",
          "rawMessage: warningReason",
        ]
      : [
          "createUsageThresholdDiagnostic",
          "warningDiagnostic",
          "usageThresholdKind",
          "rawMessage: warningReason",
        ];

  for (const requiredMarker of requiredMarkers) {
    assert(
      adapter.includes(requiredMarker),
      `${providerName} adapter is missing usage/policy marker: ${requiredMarker}`,
    );
  }
}

for (const [providerName, relativePath] of [
  ["Cursor", "src/providers/cursor/adapter.test.ts"],
  ["Codex", "src/providers/codex/adapter.test.ts"],
  ["Gemini", "src/providers/gemini/adapter.test.ts"],
]) {
  const testFile = await readProjectFile(relativePath);
  const requiredMarkers =
    providerName === "Gemini"
      ? [
          "policy.documented_limit_only",
          "category: \"policy_only\"",
          "rawMessage: snapshot.warningReason",
        ]
      : [
          "usage.",
          "category: \"usage_threshold\"",
          "rawMessage: snapshot.warningReason",
        ];

  for (const requiredMarker of requiredMarkers) {
    assert(
      testFile.includes(requiredMarker),
      `${providerName} adapter test is missing usage/policy marker: ${requiredMarker}`,
    );
  }
}

for (const relativePath of [
  "src/providers/diagnostics.test.ts",
  "src/providers/normalize.test.ts",
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of [
    "usage",
    "diagnostic",
    "raw warning messages",
  ]) {
    assert(
      testFile.includes(requiredMarker),
      `${relativePath} is missing usage diagnostic test marker: ${requiredMarker}`,
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
    fileContent.includes("Phase 190") ||
      fileContent.includes("usage-threshold") ||
      fileContent.includes("policy-only diagnostics"),
    `${relativePath} is missing Phase 190 usage/policy diagnostic reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "190_Phase_Usage_Threshold_And_Policy_Only_Diagnostics.md",
  "Phase 190",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 190 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_190_Usage_Threshold_And_Policy_Only_Diagnostics.md",
  "Doc/TODOs/Archive/190_Phase_Usage_Threshold_And_Policy_Only_Diagnostics.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 190",
    "Usage Threshold And Policy-Only Diagnostics",
    "raw diagnostic strings",
    "Cursor",
    "Codex",
    "Gemini",
    "npm run phase190:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "usage-policy-diagnostics-review.json"),
  `${JSON.stringify(
    {
      providerPaths: ["Cursor", "Codex", "Gemini"],
      helpers: "src/providers/diagnostics.ts",
      sharedNormalization: "src/providers/normalize.ts",
      adapters: [
        "src/providers/cursor/adapter.ts",
        "src/providers/codex/adapter.ts",
        "src/providers/gemini/adapter.ts",
      ],
      focusedTests: [
        "src/providers/diagnostics.test.ts",
        "src/providers/normalize.test.ts",
        "src/providers/cursor/adapter.test.ts",
        "src/providers/codex/adapter.test.ts",
        "src/providers/gemini/adapter.test.ts",
      ],
      rawFieldsPreserved: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      renderedUiBehaviorChanged: false,
      nextExecutableSlice: "sync-stale diagnostics",
    },
    null,
    2,
  )}\n`,
);

console.log("phase190: usage-threshold and policy-only diagnostics verified");
