import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";
import { updateInteractionAuditReviewRequest } from "./lib/interaction-audit-review-request.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase92-interaction-audit-request-revision-binding-review",
);
const testingRoot = path.join(artifactDir, "Doc", "testing");
const requestRoot = path.join(testingRoot, "operator_review_requests");
const archiveRoot = path.join(testingRoot, "operator_reviews");
const templatePath = path.join(
  projectRoot,
  "fixtures",
  "interaction-audit",
  "operator-review-request-template.fixture.json",
);
const initialEvidencePath = path.join(artifactDir, "evidence", "initial-evidence.json");
const refreshedEvidencePath = path.join(
  artifactDir,
  "evidence",
  "refreshed-evidence.json",
);
const requestId = "2026-04-24-request-revision-binding";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

function buildEvidenceReport(label, screenshot) {
  return {
    generatedAt: "2026-04-24T20:00:00.000Z",
    evidenceItems: [
      {
        surfaceTitle: "Dashboard",
        label,
        expectation: `${label} expectation`,
        screenshot,
        auditStatus: {
          message: `${label} prepared`,
        },
      },
    ],
  };
}

function buildCompletedSignoffExport(boundTemplate, sessionLabel, reviewedAt) {
  const signoffExport = structuredClone(boundTemplate);

  signoffExport.metadata.reviewerName = "Operator Example";
  signoffExport.metadata.sessionLabel = sessionLabel;
  signoffExport.metadata.reviewedAt = reviewedAt;

  for (const surface of signoffExport.surfaces) {
    surface.signoffStatus = "pass";
    surface.manualChecks = surface.manualChecks.map((check) => ({
      ...check,
      completed: true,
    }));
  }

  const summary = buildInteractionAuditHandoffSummaryFromExport(signoffExport);

  signoffExport.summary.reviewedSurfaceCount = summary.reviewedSurfaceCount;
  signoffExport.summary.passSurfaceCount = summary.passSurfaceCount;
  signoffExport.summary.followUpSurfaceCount = summary.followUpSurfaceCount;
  signoffExport.summary.completedManualCheckCount =
    summary.completedManualCheckCount;
  signoffExport.summary.totalManualCheckCount = summary.totalManualCheckCount;

  return signoffExport;
}

async function runExpectedFailure(args, label) {
  try {
    await execFileAsync(process.execPath, args, { cwd: projectRoot });
  } catch (error) {
    return {
      stdout: typeof error?.stdout === "string" ? error.stdout : "",
      stderr: typeof error?.stderr === "string" ? error.stderr : "",
    };
  }

  throw new Error(`${label} unexpectedly succeeded.`);
}

async function runReview() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(path.dirname(initialEvidencePath), { recursive: true });

  await writeFile(
    initialEvidencePath,
    JSON.stringify(
      buildEvidenceReport("Initial request evidence", "initial-dashboard.png"),
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    refreshedEvidencePath,
    JSON.stringify(
      buildEvidenceReport("Refreshed request evidence", "refreshed-dashboard.png"),
      null,
      2,
    ),
    "utf8",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/create-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--evidence",
      path.relative(projectRoot, initialEvidencePath),
    ],
    { cwd: projectRoot },
  );

  const requestDir = path.join(requestRoot, requestId);
  const requestManifestPath = path.join(requestDir, "review-request.json");
  const requestTemplatePath = path.join(
    requestDir,
    "interaction-audit-signoff-template.json",
  );
  const sourceTemplate = await readJson(templatePath, "Source review request template");
  const initialRequestManifest = await readJson(
    requestManifestPath,
    "Initial request manifest",
  );
  const initialRequestTemplate = await readJson(
    requestTemplatePath,
    "Initial request template",
  );
  const outdatedExportPath = path.join(
    artifactDir,
    "exports",
    "outdated-signoff-export.json",
  );
  const refreshedExportPath = path.join(
    artifactDir,
    "exports",
    "refreshed-signoff-export.json",
  );
  const outdatedPreflightPath = path.join(
    artifactDir,
    "outdated-preflight.json",
  );
  const refreshedPreflightPath = path.join(
    artifactDir,
    "refreshed-preflight.json",
  );

  await mkdir(path.dirname(outdatedExportPath), { recursive: true });
  await writeFile(
    outdatedExportPath,
    JSON.stringify(
      buildCompletedSignoffExport(
        initialRequestTemplate,
        "outdated request revision export",
        "2026-04-24T20:15:00.000Z",
      ),
      null,
      2,
    ),
    "utf8",
  );

  const refreshedEvidenceReport = await readJson(
    refreshedEvidencePath,
    "Refreshed evidence report",
  );
  await updateInteractionAuditReviewRequest({
    projectRoot,
    requestDir,
    requestId: initialRequestManifest.requestId,
    createdAt: initialRequestManifest.createdAt,
    signoffTemplate: sourceTemplate,
    sourceTemplate: initialRequestManifest.sourceTemplate,
    sourceEvidencePack: initialRequestManifest.sourceEvidencePack,
    evidenceReport: refreshedEvidenceReport,
    status: initialRequestManifest.status,
  });

  const refreshedRequestManifest = await readJson(
    requestManifestPath,
    "Refreshed request manifest",
  );
  const refreshedRequestTemplate = await readJson(
    requestTemplatePath,
    "Refreshed request template",
  );

  assert(
    refreshedRequestManifest.requestRevisionSha256 !==
      initialRequestManifest.requestRevisionSha256,
    "Refreshing the request package did not change the request revision digest.",
  );

  const outdatedPreflightFailure = await runExpectedFailure(
    [
      "./scripts/preflight-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, outdatedExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--output",
      path.relative(projectRoot, outdatedPreflightPath),
    ],
    "Outdated export preflight",
  );
  const outdatedPreflight = await readJson(
    outdatedPreflightPath,
    "Outdated export preflight",
  );

  assert(
    outdatedPreflightFailure.stdout.includes("fail request-revision"),
    "Outdated export preflight did not report the request-revision failure.",
  );
  assert(outdatedPreflight.ok === false, "Outdated export preflight unexpectedly passed.");
  assert(
    outdatedPreflight.checks.find((check) => check.id === "request-binding")?.ok ===
      true,
    "Outdated export should still match the pending request id and creation time.",
  );
  assert(
    outdatedPreflight.checks.find((check) => check.id === "request-revision")?.ok ===
      false,
    "Outdated export did not fail the request revision gate.",
  );

  const outdatedCompletionFailure = await runExpectedFailure(
    [
      "./scripts/complete-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, outdatedExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--archive-root",
      path.relative(projectRoot, archiveRoot),
    ],
    "Outdated export completion",
  );

  assert(
    outdatedCompletionFailure.stderr.includes("request revision"),
    "Outdated export completion did not fail on the request revision gate.",
  );

  await writeFile(
    refreshedExportPath,
    JSON.stringify(
      buildCompletedSignoffExport(
        refreshedRequestTemplate,
        "refreshed request revision export",
        "2026-04-24T20:20:00.000Z",
      ),
      null,
      2,
    ),
    "utf8",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/preflight-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, refreshedExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--output",
      path.relative(projectRoot, refreshedPreflightPath),
    ],
    { cwd: projectRoot },
  );
  const refreshedPreflight = await readJson(
    refreshedPreflightPath,
    "Refreshed export preflight",
  );

  assert(refreshedPreflight.ok === true, "Refreshed export preflight did not pass.");
  assert(
    refreshedPreflight.checks.find((check) => check.id === "request-revision")?.ok ===
      true,
    "Refreshed export did not pass the request revision gate.",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/complete-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, refreshedExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--archive-root",
      path.relative(projectRoot, archiveRoot),
    ],
    { cwd: projectRoot },
  );

  const fulfilledRequestManifest = await readJson(
    requestManifestPath,
    "Fulfilled request manifest",
  );

  assert(
    fulfilledRequestManifest.status === "fulfilled_review_archived",
    "Refreshed export did not fulfill the request after revision alignment.",
  );

  const report = {
    requestId,
    initialRequestRevisionSha256: initialRequestManifest.requestRevisionSha256,
    refreshedRequestRevisionSha256: refreshedRequestManifest.requestRevisionSha256,
    outdatedPreflightFailed: true,
    refreshedPreflightPassed: true,
    archiveId: fulfilledRequestManifest.fulfillment.archiveId,
  };

  await writeFile(
    path.join(artifactDir, "phase92-results.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log(
    `interaction-audit: phase92 review rejected outdated request revision export for ${requestId} and fulfilled the refreshed export`,
  );
}

void runReview().catch((error) => {
  console.error("interaction-audit: phase92 review failed");
  console.error(error);
  process.exitCode = 1;
});
