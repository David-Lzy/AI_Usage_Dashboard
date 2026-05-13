import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase199-diagnostic-fixture-historical-evidence-review",
);

const typedDiagnosticFields = [
  "warningDiagnostic",
  "sourceSelectionDiagnostic",
  "sourceFallbackDiagnostic",
];

const rawDiagnosticFields = [
  "warningReason",
  "sourceSelectionReason",
  "sourceFallbackReason",
];

const mutableMaintainedFixturePaths = [
  "fixtures/claude/analytics-api-extracted.fixture.json",
  "fixtures/claude/analytics-api.fixture.json",
  "fixtures/claude/personal-upgrade-gate.fixture.json",
  "fixtures/codex/analytics-api.fixture.json",
  "fixtures/codex/personal-page-live.fixture.json",
  "fixtures/codex/personal-page-route-evidence.fixture.json",
  "fixtures/codex/rate-card-summary.fixture.json",
  "fixtures/codex/workspace-usage-surfaces.fixture.json",
  "fixtures/cursor/admin-api-daily-usage.fixture.json",
  "fixtures/cursor/admin-api-members.fixture.json",
  "fixtures/cursor/admin-api-spend.fixture.json",
  "fixtures/cursor/personal-page-live-evidence.fixture.json",
  "fixtures/gemini/project-metrics-route-evidence.fixture.json",
  "fixtures/interaction-audit/codex-seeded-review-archive-baseline.fixture.json",
  "fixtures/interaction-audit/operator-review-request-template.fixture.json",
  "fixtures/jetbrains/users-and-licensing-extracted.fixture.json",
  "fixtures/jetbrains/users-and-licensing.fixture.html",
  "fixtures/store-screenshot/operator-capture-request-template.fixture.json",
  "fixtures/theme-recovery/operator-review-request-template.fixture.json",
];

const runtimeSeedPaths = [
  "src/shared/constants.ts",
  "src/sidepanel/store-screenshot-seed.ts",
];

const generatedRequestDirs = [
  "Doc/testing/operator_review_requests",
  "Doc/testing/theme_recovery_review_requests",
  "Doc/testing/store_screenshot_capture_requests",
];

const frozenArchiveDirs = [
  "Doc/testing/operator_reviews",
  "Doc/testing/theme_recovery_reviews",
  "Doc/testing/store_screenshot_archives",
];

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

function assertIncludes(fileContent, marker, relativePath) {
  assert(fileContent.includes(marker), `${relativePath} is missing marker: ${marker}`);
}

async function assertPathExists(relativePath) {
  await stat(path.join(projectRoot, relativePath));
  return relativePath;
}

async function listTextFiles(relativeDir) {
  const dirPath = path.join(projectRoot, relativeDir);
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childRelativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTextFiles(childRelativePath)));
      continue;
    }

    if (entry.isFile() && !entry.name.endsWith(".png")) {
      files.push(childRelativePath);
    }
  }

  return files.sort();
}

async function countMarkers(relativePaths, markers) {
  const markerCounts = Object.fromEntries(markers.map((marker) => [marker, 0]));
  const matchingFiles = [];

  for (const relativePath of relativePaths) {
    const fileContent = await readProjectFile(relativePath);
    const fileMatches = [];

    for (const marker of markers) {
      if (fileContent.includes(marker)) {
        markerCounts[marker] += 1;
        fileMatches.push(marker);
      }
    }

    if (fileMatches.length > 0) {
      matchingFiles.push({
        path: relativePath,
        markers: fileMatches,
      });
    }
  }

  return {
    markerCounts,
    matchingFiles,
  };
}

async function assertNoTypedDiagnosticFields(relativePaths, scopeLabel) {
  const result = await countMarkers(relativePaths, typedDiagnosticFields);
  const typedFieldHits = result.matchingFiles.filter((entry) =>
    entry.markers.some((marker) => typedDiagnosticFields.includes(marker)),
  );

  assert(
    typedFieldHits.length === 0,
    `${scopeLabel} unexpectedly contains typed diagnostic fields. Review schema before adding typed metadata to this evidence scope.`,
  );

  return {
    scopeLabel,
    checkedFiles: relativePaths.length,
    typedDiagnosticFieldsPresent: false,
  };
}

async function reviewMutableFixtures() {
  for (const relativePath of mutableMaintainedFixturePaths) {
    await assertPathExists(relativePath);
  }

  for (const relativePath of runtimeSeedPaths) {
    await assertPathExists(relativePath);
  }

  const runtimeSeedReview = await countMarkers(runtimeSeedPaths, [
    ...rawDiagnosticFields,
    ...typedDiagnosticFields,
  ]);

  return {
    id: "mutable-maintained-fixtures",
    decision:
      "Provider fixtures and operator templates are maintained source inputs. They may be aligned later only when a stable code already matches raw evidence.",
    mutableMaintainedFixtureCount: mutableMaintainedFixturePaths.length,
    runtimeSeedPaths,
    runtimeSeedReview,
  };
}

async function reviewGeneratedRequests() {
  const requestIndexes = [];
  const requestFiles = [];

  for (const relativeDir of generatedRequestDirs) {
    await assertPathExists(relativeDir);
    const indexPath = path.join(relativeDir, "index.json");
    const index = await readJson(indexPath);
    assert(Array.isArray(index.records), `${indexPath} must expose generated ledger records.`);
    requestIndexes.push({
      path: indexPath,
      recordCount: index.records.length,
      entryKeys: Object.keys(index),
    });
    requestFiles.push(...(await listTextFiles(relativeDir)));
  }

  const rawMarkerReview = await countMarkers(requestFiles, rawDiagnosticFields);
  const typedFieldBoundary = await assertNoTypedDiagnosticFields(
    requestFiles,
    "generated request and handoff packages",
  );

  return {
    id: "generated-request-handoff-packages",
    decision:
      "Request and handoff packages are generated operational ledgers. Regenerate through their commands; do not hand-localize diagnostic evidence fields.",
    requestIndexes,
    rawMarkerReview,
    typedFieldBoundary,
  };
}

async function reviewFrozenArchives() {
  const archiveIndexes = [];
  const archiveFiles = [];

  for (const relativeDir of frozenArchiveDirs) {
    await assertPathExists(relativeDir);
    const indexPath = path.join(relativeDir, "index.json");
    const index = await readJson(indexPath);
    assert(Array.isArray(index.records), `${indexPath} must expose archive records.`);
    archiveIndexes.push({
      path: indexPath,
      archiveCount: index.records.length,
    });
    archiveFiles.push(...(await listTextFiles(relativeDir)));
  }

  const rawMarkerReview = await countMarkers(archiveFiles, rawDiagnosticFields);
  const typedFieldBoundary = await assertNoTypedDiagnosticFields(
    archiveFiles,
    "frozen historical archives",
  );

  return {
    id: "frozen-historical-archives",
    decision:
      "Frozen archives are historical evidence. Do not rewrite them to add typed diagnostics, translated diagnostics, or new source-truth claims.",
    archiveIndexes,
    rawMarkerReview,
    typedFieldBoundary,
  };
}

async function reviewDocsAndCloseoutMarkers() {
  const packageJson = await readJson("package.json");
  assert(
    packageJson.scripts["phase199:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase199-diagnostic-fixture-historical-evidence-review.mjs",
    "package.json is missing the expected phase199:review command.",
  );

  const docChecks = [
    [
      "Doc/I18n/I18n_Diagnostic_Fixture_And_Historical_Evidence_Alignment.md",
      [
        "Diagnostic Fixture And Historical Evidence Alignment",
        "Mutable maintained fixtures",
        "Generated request and handoff packages",
        "Frozen historical archives",
        "No Archive Rewrite Rule",
        "Phase 199",
      ],
    ],
    [
      "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
      [
        "diagnostic fixture and historical evidence alignment review completed in `Phase 199`",
        "As of `Phase 199`",
        "### N. Diagnostic Fixture And Historical Evidence Alignment Review",
        "completed in `Phase 199`",
        "### O. Adapter Diagnostic Raw Fallback Regression Review",
      ],
    ],
    [
      "Doc/Roadmap/00_Strategic_Directions_Index.md",
      [
        "the numbered phase queue is now completed through `Phase 199`",
        "diagnostic fixture and historical evidence alignment review",
        "adapter diagnostic raw fallback regression review",
      ],
    ],
    [
      "Doc/testing/Archive/phase-reports/100-199/Phase_199_Diagnostic_Fixture_And_Historical_Evidence_Alignment_Review.md",
      [
        "Phase 199",
        "Diagnostic Fixture And Historical Evidence Alignment Review",
        "no runtime product behavior changed",
        "npm run phase199:review",
      ],
    ],
    [
      "Doc/TODOs/Archive/by-phase/100-199/199_Phase_Diagnostic_Fixture_And_Historical_Evidence_Alignment_Review.md",
      [
        "Phase 199",
        "Diagnostic Fixture And Historical Evidence Alignment Review",
        "completed and archived on 2026-04-25",
        "no runtime product behavior changed",
      ],
    ],
    [
      "Doc/TODOs/00_Phase_Index.md",
      [
        "latest completed slice: [199_Phase_Diagnostic_Fixture_And_Historical_Evidence_Alignment_Review.md]",
        "199_Phase_Diagnostic_Fixture_And_Historical_Evidence_Alignment_Review.md",
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
    id: "docs-and-closeout-markers",
    results,
  };
}

async function main() {
  const checks = [
    await reviewMutableFixtures(),
    await reviewGeneratedRequests(),
    await reviewFrozenArchives(),
    await reviewDocsAndCloseoutMarkers(),
  ];

  const report = {
    phase: 199,
    title: "Diagnostic Fixture And Historical Evidence Alignment Review",
    generatedAt: new Date().toISOString(),
    truthBoundary: [
      "Mutable maintained fixtures may be aligned later only when stable codes already match raw evidence.",
      "Generated requests and handoff packages should be regenerated, not hand-localized.",
      "Frozen archives must not be rewritten to add typed diagnostics or translated diagnostic bodies.",
      "Provider coverage, source selection, fallback order, and archive schemas remain unchanged.",
    ],
    checks,
  };

  await mkdir(artifactDir, { recursive: true });
  const reportPath = path.join(
    artifactDir,
    "diagnostic-fixture-historical-evidence-review.json",
  );
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `Phase 199 diagnostic fixture and historical evidence review passed: ${path.relative(
      projectRoot,
      reportPath,
    )}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
