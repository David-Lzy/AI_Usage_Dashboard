import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase195-adapter-error-diagnostics-review",
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
assert(packageJson.scripts["phase195:review"], "package.json is missing phase195:review.");

const diagnostics = await readProjectFile("src", "providers", "diagnostics.ts");
for (const requiredMarker of [
  "AdapterErrorDiagnosticKind",
  "createAdapterErrorDiagnostic",
  "adapter.unexpected_error",
  "adapter.unsupported_response",
  "adapter.parse_failed",
  "parserStage",
]) {
  assert(
    diagnostics.includes(requiredMarker),
    `adapter diagnostic builder is missing marker: ${requiredMarker}`,
  );
}

const localizedCopy = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "formatAdapterErrorSummary",
  "adapter.unexpected_error",
  "adapter.unsupported_response",
  "adapter.parse_failed",
  "Adapter parse failed",
  "适配器解析失败",
  "raw diagnostic body",
]) {
  assert(
    localizedCopy.includes(requiredMarker),
    `localized adapter diagnostic copy is missing marker: ${requiredMarker}`,
  );
}

for (const [relativePath, markers] of [
  [
    "src/providers/cursor/adapter.ts",
    [
      "createAdapterErrorDiagnostic",
      'adapterErrorKind: "parse_failed"',
      'parserStage: "personal_usage_page"',
      'parserStage: "admin_api"',
    ],
  ],
  [
    "src/providers/codex/adapter.ts",
    [
      "createAdapterErrorDiagnostic",
      'adapterErrorKind: "parse_failed"',
      'parserStage: "personal_usage_page"',
      'parserStage: "analytics_api"',
    ],
  ],
  [
    "src/providers/claude-code/adapter.ts",
    [
      "createAdapterErrorDiagnostic",
      'adapterErrorKind: "unexpected_error"',
      'parserStage: "analytics_api"',
    ],
  ],
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredMarker of markers) {
    assert(
      fileContent.includes(requiredMarker),
      `${relativePath} is missing adapter diagnostic marker: ${requiredMarker}`,
    );
  }
}

for (const [relativePath, markers] of [
  [
    "src/providers/diagnostics.test.ts",
    [
      "builds adapter-error diagnostics without rewriting raw warning messages",
      "adapter.parse_failed",
    ],
  ],
  [
    "src/shared/i18n.test.ts",
    [
      "builds localized adapter-error diagnostic presentation without translating raw bodies",
      "Adapter parse failed",
      "适配器解析失败",
    ],
  ],
  [
    "src/providers/cursor/adapter.test.ts",
    [
      "maps Cursor parser route drift to a typed adapter parse diagnostic",
      "adapter.parse_failed",
    ],
  ],
  [
    "src/providers/codex/adapter.test.ts",
    [
      "maps Codex parser route drift to a typed adapter parse diagnostic",
      "adapter.parse_failed",
    ],
  ],
  [
    "src/providers/claude-code/adapter.test.ts",
    [
      "maps Claude analytics catch failures to a typed adapter diagnostic",
      "adapter.unexpected_error",
    ],
  ],
]) {
  const testFile = await readProjectFile(relativePath);
  for (const requiredMarker of markers) {
    assert(
      testFile.includes(requiredMarker),
      `${relativePath} is missing adapter diagnostic test marker: ${requiredMarker}`,
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
    fileContent.includes("Phase 195") ||
      fileContent.includes("adapter-error diagnostics") ||
      fileContent.includes("adapter-error diagnostic presentation"),
    `${relativePath} is missing Phase 195 adapter diagnostic reference.`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
for (const requiredPhrase of [
  "195_Phase_Adapter_Error_Diagnostics.md",
  "Phase 195",
]) {
  assert(
    phaseIndex.includes(requiredPhrase),
    `Phase index is missing Phase 195 phrase: ${requiredPhrase}`,
  );
}

for (const relativePath of [
  "Doc/testing/Phase_195_Adapter_Error_Diagnostics.md",
  "Doc/TODOs/Archive/195_Phase_Adapter_Error_Diagnostics.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredPhrase of [
    "Phase 195",
    "Adapter Error Diagnostics",
    "raw adapter",
    "adapter.parse_failed",
    "npm run phase195:review",
  ]) {
    assert(
      fileContent.includes(requiredPhrase),
      `${relativePath} is missing closeout phrase: ${requiredPhrase}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "adapter-error-diagnostics-review.json"),
  `${JSON.stringify(
    {
      builder: "src/providers/diagnostics.ts",
      adapters: [
        "src/providers/cursor/adapter.ts",
        "src/providers/codex/adapter.ts",
        "src/providers/claude-code/adapter.ts",
      ],
      focusedTests: [
        "src/providers/diagnostics.test.ts",
        "src/shared/i18n.test.ts",
        "src/providers/cursor/adapter.test.ts",
        "src/providers/codex/adapter.test.ts",
        "src/providers/claude-code/adapter.test.ts",
      ],
      rawFieldsPreserved: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
      ],
      typedAdapterDiagnostics: [
        "adapter.unexpected_error",
        "adapter.unsupported_response",
        "adapter.parse_failed",
      ],
      nextExecutableSlice:
        "diagnostic presentation compact-width and evidence QA",
    },
    null,
    2,
  )}\n`,
);

console.log("phase195: adapter-error diagnostics verified");
