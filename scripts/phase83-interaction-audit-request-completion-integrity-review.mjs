import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase83-interaction-audit-request-completion-integrity-review",
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
const evidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);
const validExportPath = path.join(artifactDir, "exports", "matching-signoff-export.json");
const mismatchedExportPath = path.join(
  artifactDir,
  "exports",
  "mismatched-signoff-export.json",
);
const requestId = "2026-04-24-integrity-review-request";

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

function buildCompletedSignoffExport(template) {
  const signoffExport = structuredClone(template);

  signoffExport.metadata.reviewerName = "Operator Example";
  signoffExport.metadata.sessionLabel = "integrity compact pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T13:00:00.000Z";
  signoffExport.surfaces[0].signoffStatus = "pass";
  signoffExport.surfaces[0].manualChecks[0].completed = true;
  signoffExport.surfaces[0].manualChecks[1].completed = true;
  signoffExport.surfaces[1].signoffStatus = "follow_up";
  signoffExport.surfaces[1].manualChecks[0].completed = true;
  signoffExport.surfaces[4].signoffStatus = "pass";
  signoffExport.surfaces[4].manualChecks[0].completed = true;
  signoffExport.surfaces[4].manualChecks[1].completed = true;

  const summary = buildInteractionAuditHandoffSummaryFromExport(signoffExport);

  signoffExport.summary.reviewedSurfaceCount = summary.reviewedSurfaceCount;
  signoffExport.summary.passSurfaceCount = summary.passSurfaceCount;
  signoffExport.summary.followUpSurfaceCount = summary.followUpSurfaceCount;
  signoffExport.summary.completedManualCheckCount =
    summary.completedManualCheckCount;
  signoffExport.summary.totalManualCheckCount = summary.totalManualCheckCount;

  return signoffExport;
}

async function runReview() {
  await mkdir(path.dirname(validExportPath), { recursive: true });

  await execFileAsync(
    process.execPath,
    [
      "./scripts/create-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );

  const requestManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Pending request manifest",
  );
  const template = await readJson(templatePath, "Review request template");
  const validExport = buildCompletedSignoffExport(template);
  const mismatchedExport = structuredClone(validExport);

  validExport.requestContext = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    requestRevisionSha256: requestManifest.requestRevisionSha256,
  };
  mismatchedExport.requestContext = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    requestRevisionSha256: requestManifest.requestRevisionSha256,
  };
  mismatchedExport.surfaces[0].manualChecks = [
    mismatchedExport.surfaces[0].manualChecks[0],
  ];

  await writeFile(validExportPath, JSON.stringify(validExport, null, 2), "utf8");
  await writeFile(
    mismatchedExportPath,
    JSON.stringify(mismatchedExport, null, 2),
    "utf8",
  );

  assert(
    requestManifest.expectedShape?.surfaceCount === template.surfaces.length,
    "Request manifest did not preserve the expected shape surface count.",
  );
  assert(
    requestManifest.expectedShape?.totalManualCheckCount === 11,
    "Request manifest did not preserve the expected total manual-check count.",
  );

  let mismatchFailure = "";

  try {
    await execFileAsync(
      process.execPath,
      [
        "./scripts/complete-interaction-audit-review-request.mjs",
        "--request-id",
        requestId,
        "--input",
        path.relative(projectRoot, mismatchedExportPath),
        "--request-root",
        path.relative(projectRoot, requestRoot),
        "--archive-root",
        path.relative(projectRoot, archiveRoot),
        "--evidence",
        path.relative(projectRoot, evidencePath),
      ],
      { cwd: projectRoot },
    );
  } catch (error) {
    mismatchFailure = String(error?.stderr ?? error);
  }

  assert(
    mismatchFailure.includes("manual-check count"),
    "Completion command did not reject the mismatched export shape.",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/complete-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, validExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--archive-root",
      path.relative(projectRoot, archiveRoot),
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );

  const fulfilledManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Fulfilled request manifest",
  );

  assert(
    fulfilledManifest.status === "fulfilled_review_archived",
    "Request manifest did not reach fulfilled status after matching export.",
  );

  const report = {
    requestId,
    archiveId: fulfilledManifest.fulfillment.archiveId,
    mismatchRejected: true,
    expectedSurfaceCount: fulfilledManifest.expectedShape.surfaceCount,
    expectedTotalManualCheckCount:
      fulfilledManifest.expectedShape.totalManualCheckCount,
  };
  const reportPath = path.join(artifactDir, "phase83-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase83: mismatched export rejected and matching export fulfilled request ${requestId}`,
  );
  console.log(`phase83: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase83: expected_surfaces=${fulfilledManifest.expectedShape.surfaceCount} expected_checks=${fulfilledManifest.expectedShape.totalManualCheckCount}`,
  );
}

void runReview().catch((error) => {
  console.error("phase83: interaction audit request completion integrity review failed");
  console.error(error);
  process.exitCode = 1;
});
