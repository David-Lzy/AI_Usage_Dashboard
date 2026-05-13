import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase198-sample-store-seed-diagnostic-metadata-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readProjectFile(...segments) {
  return readFile(path.join(projectRoot, ...segments), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
}

function assertIncludes(fileContent, marker, relativePath) {
  assert(fileContent.includes(marker), `${relativePath} is missing marker: ${marker}`);
}

function assertOrdered(fileContent, before, after, relativePath) {
  const beforeIndex = fileContent.indexOf(before);
  const afterIndex = fileContent.indexOf(after);

  assert(beforeIndex >= 0, `${relativePath} is missing marker: ${before}`);
  assert(afterIndex >= 0, `${relativePath} is missing marker: ${after}`);
  assert(
    beforeIndex < afterIndex,
    `${relativePath} expected marker "${before}" before "${after}".`,
  );
}

function assertSnippetMarkers(fileContent, relativePath, snippetName, markers) {
  for (const marker of markers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  return {
    snippetName,
    markers,
  };
}

async function reviewPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase198:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase198-sample-store-seed-diagnostic-metadata-review.mjs",
    "package.json is missing the expected phase198:review command.",
  );

  return {
    id: "package-script",
    path: "package.json",
    command: packageJson.scripts["phase198:review"],
  };
}

async function reviewSampleAppStateMetadata() {
  const relativePath = "src/shared/constants.ts";
  const fileContent = await readProjectFile(relativePath);

  const importMarkers = [
    "createPolicyOnlyDiagnostic",
    "createSourceFallbackDiagnostic",
    "createSourceSelectionDiagnostic",
    "createUsageThresholdDiagnostic",
  ];
  const sampleMarkers = [
    "warningReason: \"On-demand usage is off.\"",
    "warningDiagnostic: createUsageThresholdDiagnostic({",
    "usageThresholdKind: \"on_demand_off\"",
    "rawMessage: \"On-demand usage is off.\"",
    "sourceSelectionReason: \"Auto selected Session page.\"",
    "sourceSelectionDiagnostic: createSourceSelectionDiagnostic({",
    "selectedKind: \"session_page\"",
    "hadFallback: true",
    "sourceFallbackReason: \"Official API unavailable: no Cursor Admin API key is stored.\"",
    "sourceFallbackDiagnostic: createSourceFallbackDiagnostic({",
    "kind: \"official_api\"",
    "code: \"credential_missing\"",
    "detail: \"no Cursor Admin API key is stored\"",
    "warningReason: \"80% of included credits consumed\"",
    "usageThresholdKind: \"threshold_warning\"",
    "usagePercent: 80",
    "thresholdPercent: 80",
    "warningReason:",
    "120/min and 2000/day per user for Gemini CLI and agent mode. No stable official per-user live usage source is documented.",
    "warningDiagnostic: createPolicyOnlyDiagnostic({",
    "policyOnlyKind: \"documented_limit_only\"",
    "sourceSelectionReason: \"Auto selected Official API.\"",
    "selectedKind: \"official_api\"",
    "hadFallback: false",
    "rawMessage: \"Auto selected Official API.\"",
  ];

  for (const marker of importMarkers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  for (const marker of sampleMarkers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  assertOrdered(
    fileContent,
    "warningReason: \"On-demand usage is off.\"",
    "warningDiagnostic: createUsageThresholdDiagnostic({",
    relativePath,
  );
  assertOrdered(
    fileContent,
    "sourceSelectionReason: \"Auto selected Session page.\"",
    "sourceSelectionDiagnostic: createSourceSelectionDiagnostic({",
    relativePath,
  );
  assertOrdered(
    fileContent,
    "sourceFallbackReason: \"Official API unavailable: no Cursor Admin API key is stored.\"",
    "sourceFallbackDiagnostic: createSourceFallbackDiagnostic({",
    relativePath,
  );

  return {
    id: "sample-app-state-metadata",
    path: relativePath,
    additiveDiagnostics: [
      "cursor usage.on_demand_off",
      "cursor source.auto_selected_session_page",
      "cursor source.official_api_missing_credential",
      "jetbrains usage.threshold_warning",
      "gemini policy.documented_limit_only",
      "codex source.auto_selected_official_api",
    ],
    rawStringsPreserved: true,
    checkedMarkers: importMarkers.length + sampleMarkers.length,
  };
}

async function reviewStoreScreenshotSeedMetadata() {
  const relativePath = "src/sidepanel/store-screenshot-seed.ts";
  const fileContent = await readProjectFile(relativePath);

  const snippets = [
    assertSnippetMarkers(fileContent, relativePath, "imports", [
      "createCredentialDiagnostic",
      "createHostAccessDiagnostic",
      "createSourceSelectionDiagnostic",
    ]),
    assertSnippetMarkers(fileContent, relativePath, "toolbar-healthy-clear-warning", [
      "warningReason: null",
      "warningDiagnostic: null",
      "sourceFallbackDiagnostic: null",
    ]),
    assertSnippetMarkers(fileContent, relativePath, "codex-personal-story-source", [
      "sourceSelectionReason: \"Auto selected Session page.\"",
      "sourceSelectionDiagnostic: createSourceSelectionDiagnostic({",
      "providerId: \"codex\"",
      "selectedKind: \"session_page\"",
      "rawMessage: \"Auto selected Session page.\"",
      "sourceFallbackReason: \"Official API is available but this store capture keeps the personal usage-page story in frame.\"",
      "sourceFallbackDiagnostic: null",
    ]),
    assertSnippetMarkers(fileContent, relativePath, "cursor-host-access-blocker", [
      "warningReason: \"Grant access to cursor.com before live sync can run.\"",
      "warningDiagnostic: createHostAccessDiagnostic({",
      "sourceKind: \"session_page\"",
      "hostLabel: \"cursor.com\"",
      "rawMessage: \"Grant access to cursor.com before live sync can run.\"",
      "sourceFallbackDiagnostic: null",
    ]),
    assertSnippetMarkers(fileContent, relativePath, "codex-workspace-credential-blocker", [
      "warningReason: \"Workspace id config required before live sync can run.\"",
      "warningDiagnostic: createCredentialDiagnostic({",
      "credentialKind: \"workspace_config\"",
      "rawMessage: \"Workspace id config required before live sync can run.\"",
    ]),
    assertSnippetMarkers(fileContent, relativePath, "codex-raw-only-analytics-warning", [
      "warningReason:\n      \"Enterprise analytics API selected. Exact remaining workspace credits are not exposed by the analytics endpoint.\"",
      "warningDiagnostic: null",
    ]),
  ];

  return {
    id: "store-screenshot-seed-metadata",
    path: relativePath,
    snippets,
    seedRule:
      "Seed-specific typed diagnostics are added only when the seed warning/source story has a stable code; raw-only story copy explicitly clears typed metadata.",
  };
}

async function reviewCloseoutDocs() {
  const docChecks = [
    [
      "Doc/testing/Archive/phase-reports/100-199/Phase_198_Sample_Store_Seed_Diagnostic_Metadata_Alignment.md",
      [
        "Phase 198",
        "Sample Store Seed Diagnostic Metadata Alignment",
        "raw diagnostic strings stayed unchanged",
        "npm run phase198:review",
      ],
    ],
    [
      "Doc/TODOs/Archive/by-phase/100-199/198_Phase_Sample_Store_Seed_Diagnostic_Metadata_Alignment.md",
      [
        "Phase 198",
        "Sample Store Seed Diagnostic Metadata Alignment",
        "completed and archived on 2026-04-25",
        "raw diagnostic strings stayed unchanged",
      ],
    ],
    [
      "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
      [
        "sample and store seed diagnostic metadata alignment completed in `Phase 198`",
        "As of `Phase 198`",
        "### M. Sample And Store Seed Diagnostic Metadata Alignment",
        "completed in `Phase 198`",
        "### N. Diagnostic Fixture And Historical Evidence Alignment Review",
      ],
    ],
    [
      "Doc/TODOs/00_Phase_Index.md",
      [
        "latest completed slice: [198_Phase_Sample_Store_Seed_Diagnostic_Metadata_Alignment.md]",
        "198_Phase_Sample_Store_Seed_Diagnostic_Metadata_Alignment.md",
      ],
    ],
  ];

  const results = [];

  for (const [relativePath, markers] of docChecks) {
    const fileContent = await readProjectFile(relativePath);
    for (const marker of markers) {
      assertIncludes(fileContent, marker, relativePath);
    }
    results.push({ path: relativePath, markers });
  }

  return {
    id: "closeout-docs",
    results,
  };
}

async function main() {
  const checks = [
    await reviewPackageScript(),
    await reviewSampleAppStateMetadata(),
    await reviewStoreScreenshotSeedMetadata(),
    await reviewCloseoutDocs(),
  ];

  const report = {
    phase: 198,
    title: "Sample Store Seed Diagnostic Metadata Alignment",
    generatedAt: new Date().toISOString(),
    truthBoundary: [
      "Raw diagnostic strings remain the evidence fields.",
      "Typed diagnostics are optional additive metadata.",
      "Seed metadata does not imply new provider coverage or source-selection behavior.",
      "JetBrains remains deferred, Gemini remains policy-only, and Codex/Cursor personal support remains partial.",
    ],
    checks,
  };

  await mkdir(artifactDir, { recursive: true });
  const reportPath = path.join(
    artifactDir,
    "sample-store-seed-diagnostic-metadata-review.json",
  );
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `Phase 198 sample/store seed diagnostic metadata review passed: ${path.relative(
      projectRoot,
      reportPath,
    )}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
