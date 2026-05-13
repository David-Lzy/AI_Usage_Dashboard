import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase204-diagnostic-raw-fallback-regression-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readProjectFile(relativePath));
}

function verifyMarkers(fileContent, relativePath, markers) {
  for (const marker of markers) {
    assert(
      fileContent.includes(marker),
      `${relativePath} is missing marker: ${marker}`,
    );
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase204:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase204-diagnostic-raw-fallback-regression-review.mjs",
    "package.json is missing the expected phase204:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRegressionTests() {
  const testExpectations = [
    {
      relativePath: "src/shared/i18n.test.ts",
      markers: [
        "keeps unknown source and adapter diagnostics presentation-only",
        "future.source_selection",
        "future.source_fallback",
        "future.adapter_error",
        "toBeNull()",
      ],
    },
    {
      relativePath: "src/shared/provider-sources.test.ts",
      markers: [
        "keeps raw warning pattern fallback for unknown typed diagnostics",
        "keeps raw warning fallback when typed diagnostics are absent",
        "credential_missing",
        "stateDetail",
      ],
    },
    {
      relativePath: "src/sidepanel/settings-view-models.test.ts",
      markers: [
        "keeps raw settings evidence visible when typed diagnostic presentation is absent",
        "summaryNoteLines",
        "选择原因",
        "回退原因",
        "选择诊断",
      ],
    },
    {
      relativePath: "src/sidepanel/view-models.test.ts",
      markers: [
        "keeps provider-detail input raw evidence when typed diagnostics are unknown",
        "currentSourceStateKind",
        "currentSourceStateDetail",
        "sourceFallbackReason",
      ],
    },
  ];

  const results = [];

  for (const expectation of testExpectations) {
    const fileContent = await readProjectFile(expectation.relativePath);

    verifyMarkers(
      fileContent,
      expectation.relativePath,
      expectation.markers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length,
    });
  }

  return results;
}

async function verifyRuntimeEvidenceSurfaces() {
  const providerDetailPage = await readProjectFile(
    "src/sidepanel/routes/ProviderDetailPage.tsx",
  );
  const settingsViewModels = await readProjectFile(
    "src/sidepanel/settings-view-models.ts",
  );

  verifyMarkers(providerDetailPage, "src/sidepanel/routes/ProviderDetailPage.tsx", [
    "warningDiagnosticPresentation ?",
    "sourceSelectionDiagnosticPresentation ?",
    "sourceFallbackDiagnosticPresentation ?",
    "provider.sourceFallbackReason ?",
    "provider.warningReason ?",
  ]);
  verifyMarkers(settingsViewModels, "src/sidepanel/settings-view-models.ts", [
    "sourceDisplay.sourceFallbackReason",
    "sourceDisplay.stateDetail",
    "sourceSelectionDiagnosticPresentation?.label",
    "sourceFallbackDiagnosticPresentation?.label",
    "warningDiagnosticPresentation?.label",
  ]);

  return [
    {
      scope: "provider-detail-raw-evidence-rendering",
      markers: 5,
    },
    {
      scope: "settings-raw-evidence-rendering",
      markers: 5,
    },
  ];
}

async function verifyDocs() {
  const docExpectations = [
    {
      relativePath: "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
      markers: [
        "Phase 204",
        "Adapter Diagnostic Raw Fallback Regression Review",
        "unknown or absent typed diagnostics",
        "raw diagnostic string fields remain the compatibility source of truth",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_204_Diagnostic_Raw_Fallback_Regression.md",
      markers: [
        "Phase 204",
        "Diagnostic Raw Fallback Regression",
        "npm run phase204:review",
        "No runtime product behavior changed",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/204_Phase_Diagnostic_Raw_Fallback_Regression.md",
      markers: [
        "Phase 204",
        "completed and archived on 2026-04-25",
        "unknown typed diagnostics",
        "absent typed diagnostics",
      ],
    },
  ];

  const results = [];

  for (const expectation of docExpectations) {
    const fileContent = await readProjectFile(expectation.relativePath);

    verifyMarkers(
      fileContent,
      expectation.relativePath,
      expectation.markers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length,
    });
  }

  return results;
}

async function runReview() {
  const results = [
    await verifyPackageScript(),
    ...(await verifyRegressionTests()),
    ...(await verifyRuntimeEvidenceSurfaces()),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "diagnostic-raw-fallback-regression-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase204: diagnostic raw fallback regression verified");
  console.log(`phase204: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase204: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase204: diagnostic raw fallback regression review failed");
  console.error(error);
  process.exitCode = 1;
});
