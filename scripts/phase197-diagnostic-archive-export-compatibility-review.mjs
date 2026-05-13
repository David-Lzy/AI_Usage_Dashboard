import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase197-diagnostic-archive-export-compatibility-review",
);

const rawEvidenceFields = [
  "warningReason",
  "sourceSelectionReason",
  "sourceFallbackReason",
];
const typedDiagnosticFields = [
  "warningDiagnostic",
  "sourceSelectionDiagnostic",
  "sourceFallbackDiagnostic",
];

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

function assertIncludes(fileContent, marker, relativePath) {
  assert(fileContent.includes(marker), `${relativePath} is missing marker: ${marker}`);
}

async function assertFileMarkers(relativePath, markers) {
  const fileContent = await readProjectFile(relativePath);

  for (const marker of markers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  return {
    path: relativePath,
    markers,
  };
}

async function reviewProviderSnapshotSchema() {
  const relativePath = "src/providers/types.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "export type ProviderDiagnostic =",
    "rawMessage: string;",
    "export type ProviderSnapshot =",
    "warningReason: string | null;",
    "sourceSelectionReason: string;",
    "sourceFallbackReason: string | null;",
    "warningDiagnostic?: ProviderDiagnostic | null;",
    "sourceSelectionDiagnostic?: ProviderDiagnostic | null;",
    "sourceFallbackDiagnostic?: ProviderDiagnostic | null;",
  ];

  for (const marker of markers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  return {
    id: "provider-snapshot-schema",
    path: relativePath,
    compatibilityRole: "structured evidence schema",
    rawEvidenceFields,
    typedDiagnosticFields,
    decision:
      "Raw ProviderSnapshot diagnostic strings remain the stable evidence fields; typed diagnostics remain optional additive metadata.",
  };
}

async function reviewStoragePreservation() {
  const relativePath = "src/shared/storage.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "function cloneAppState(state: AppState): AppState",
    "structuredClone(state)",
    "const providers = SAMPLE_APP_STATE.providers.map((sampleProvider) => ({",
    "...sampleProvider,",
    "...storedProviders.get(sampleProvider.providerId),",
    "return writeAppState(cloneAppState(SAMPLE_APP_STATE));",
  ];

  for (const marker of markers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  return {
    id: "app-state-storage",
    path: relativePath,
    compatibilityRole: "runtime storage migration",
    decision:
      "Storage normalization merges stored ProviderSnapshot objects instead of enumerating diagnostic fields, so optional typed diagnostics and raw fields survive app-state reads.",
  };
}

async function reviewStoreScreenshotSeedCompatibility() {
  const relativePath = "src/sidepanel/store-screenshot-seed.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "import type { AppState, ProviderId, ProviderSetting, ProviderSnapshot }",
    "patch: Partial<ProviderSnapshot>",
    "Object.assign(getProviderSnapshot(state, providerId), patch);",
    "warningReason:",
    "sourceSelectionReason:",
    "sourceFallbackReason:",
  ];

  for (const marker of markers) {
    assertIncludes(fileContent, marker, relativePath);
  }

  return {
    id: "store-screenshot-seed",
    path: relativePath,
    compatibilityRole: "screenshot runtime seed state",
    decision:
      "Store screenshot seeds patch ProviderSnapshot with Partial<ProviderSnapshot>, preserving the same raw-field contract and allowing future typed diagnostics without a seed schema rewrite.",
  };
}

async function reviewStoreScreenshotArchiveCompatibility() {
  const requestPath = "scripts/lib/store-screenshot-capture-request.mjs";
  const archivePath = "scripts/lib/store-screenshot-capture-archive.mjs";

  await assertFileMarkers(requestPath, [
    "stateSummary:",
    "operatorNote:",
    "captureTruth:",
    "normalizeStoreScreenshotCaptureNotesDocument",
    "buildStoreScreenshotCaptureNotesDocument",
  ]);
  await assertFileMarkers(archivePath, [
    "captureNotes: notesDocument.notes",
    "await copyFile(sourcePath, archivePath);",
    "archiveNotesPath",
    "capture-archive.json",
    "it also preserves the operator truth notes",
  ]);

  return {
    id: "store-screenshot-archive",
    paths: [requestPath, archivePath],
    compatibilityRole: "image evidence plus operator truth notes",
    decision:
      "Store screenshot archives preserve rendered screenshots and capture notes, not structured ProviderSnapshot diagnostic payloads; any visible diagnostic text remains screenshot evidence plus operator notes.",
  };
}

async function reviewThemeRecoveryExportCompatibility() {
  const runtimePath = "src/sidepanel/theme-recovery-review.ts";
  const archivePath = "scripts/lib/theme-recovery-review-archive.mjs";

  await assertFileMarkers(runtimePath, [
    "recoveryDetail:",
    "provider.warningReason ??",
    "currentSourceStateDetail",
    "export type ThemeRecoveryReviewExport",
  ]);
  await assertFileMarkers(archivePath, [
    "normalizeThemeRecoveryReviewExport",
    "recoveryDetail:",
    "currentSourceStateDetail:",
    "theme-recovery-review-export.json",
    "review-archive.json",
  ]);

  return {
    id: "theme-recovery-export",
    paths: [runtimePath, archivePath],
    compatibilityRole: "operator evidence export",
    decision:
      "Theme recovery exports carry derived source-state and recovery-detail strings for operator evidence; they do not rename or translate structured diagnostic payload keys.",
  };
}

async function reviewInteractionAuditExportCompatibility() {
  const runtimePath = "src/sidepanel/interaction-audit-signoff.ts";
  const archivePath = "scripts/lib/interaction-audit-review-archive.mjs";

  await assertFileMarkers(runtimePath, [
    "export type InteractionAuditSignoffExport",
    "operatorNotes",
    "manualChecks",
    "buildInteractionAuditSignoffExport",
  ]);
  await assertFileMarkers(archivePath, [
    "sourceSignoffExport",
    "sourceEvidencePack",
    "interaction-audit-signoff-export.json",
    "review-archive.json",
  ]);

  const runtimeFile = await readProjectFile(runtimePath);
  for (const typedField of typedDiagnosticFields) {
    assert(
      !runtimeFile.includes(typedField),
      `Interaction audit signoff export unexpectedly gained structured diagnostic field ${typedField}. Add an explicit schema review before exporting it.`,
    );
  }

  return {
    id: "interaction-audit-export",
    paths: [runtimePath, archivePath],
    compatibilityRole: "manual signoff evidence export",
    decision:
      "Interaction audit exports carry manual checks and operator notes; they currently do not export structured ProviderSnapshot diagnostic fields.",
  };
}

async function verifyDocsAndCloseoutMarkers() {
  const packageJson = await readJson("package.json");
  assert(
    packageJson.scripts["phase197:review"],
    "package.json is missing phase197:review.",
  );

  const docChecks = [
    [
      "Doc/I18n/I18n_Diagnostic_Archive_Export_Compatibility.md",
      [
        "Diagnostic Archive Export Compatibility",
        "ProviderSnapshot.warningReason",
        "ProviderDiagnostic.rawMessage",
        "Phase 197",
      ],
    ],
    [
      "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
      [
        "Diagnostic Archive And Export Compatibility Review",
        "Phase 197",
        "Sample And Store Seed Diagnostic Metadata Alignment",
      ],
    ],
    [
      "Doc/testing/Phase_197_Diagnostic_Archive_Export_Compatibility_Review.md",
      [
        "Phase 197",
        "Diagnostic Archive Export Compatibility Review",
        "npm run phase197:review",
      ],
    ],
    [
      "Doc/TODOs/Archive/197_Phase_Diagnostic_Archive_Export_Compatibility_Review.md",
      [
        "Phase 197",
        "Diagnostic Archive Export Compatibility Review",
        "raw diagnostic",
      ],
    ],
  ];

  for (const [relativePath, markers] of docChecks) {
    await assertFileMarkers(relativePath, markers);
  }
}

async function runReview() {
  await verifyDocsAndCloseoutMarkers();

  const surfaces = [
    await reviewProviderSnapshotSchema(),
    await reviewStoragePreservation(),
    await reviewStoreScreenshotSeedCompatibility(),
    await reviewStoreScreenshotArchiveCompatibility(),
    await reviewThemeRecoveryExportCompatibility(),
    await reviewInteractionAuditExportCompatibility(),
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    rawEvidenceFields: rawEvidenceFields.map(
      (field) => `ProviderSnapshot.${field}`,
    ),
    typedDiagnosticFields: typedDiagnosticFields.map(
      (field) => `ProviderSnapshot.${field}`,
    ),
    requiredTypedRawField: "ProviderDiagnostic.rawMessage",
    compatibilityVerdict:
      "No archive or export schema migration is needed before keeping localized diagnostic presentation separate from raw evidence bodies.",
    surfaces,
    nextExecutableSlice:
      "sample and store seed diagnostic metadata alignment",
  };
  const reportPath = path.join(
    artifactDir,
    "diagnostic-archive-export-compatibility-review.json",
  );

  await mkdir(artifactDir, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`phase197: reviewed ${surfaces.length} compatibility surface(s)`);
  console.log(`phase197: saved machine-readable report to ${reportPath}`);
}

void runReview().catch((error) => {
  console.error("phase197: diagnostic archive/export compatibility review failed");
  console.error(error);
  process.exitCode = 1;
});
