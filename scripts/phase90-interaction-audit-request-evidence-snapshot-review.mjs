import { execFile } from "node:child_process";
import { mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase90-interaction-audit-request-evidence-snapshot-review",
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
const externalEvidencePath = path.join(
  artifactDir,
  "external",
  "external-evidence.json",
);
const requestId = "2026-04-24-request-evidence-snapshot";

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

function buildEvidenceReport() {
  return {
    generatedAt: "2026-04-24T18:00:00.000Z",
    evidenceItems: [
      {
        surfaceTitle: "Dashboard",
        label: "Snapshot evidence",
        expectation: "Snapshot evidence expectation",
        screenshot: "snapshot-dashboard.png",
        auditStatus: {
          message: "Snapshot evidence prepared",
        },
      },
    ],
  };
}

function buildCompletedSignoffExport(
  template,
  requestCreatedAt,
  requestRevisionSha256,
) {
  const signoffExport = structuredClone(template);

  signoffExport.metadata.reviewerName = "Operator Example";
  signoffExport.metadata.sessionLabel = "snapshot proof";
  signoffExport.metadata.reviewedAt = "2026-04-24T18:15:00.000Z";
  signoffExport.requestContext = {
    requestId,
    requestCreatedAt,
    requestRevisionSha256,
  };

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

async function runReview() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(path.dirname(externalEvidencePath), { recursive: true });

  await writeFile(
    externalEvidencePath,
    JSON.stringify(buildEvidenceReport(), null, 2),
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
      path.relative(projectRoot, externalEvidencePath),
    ],
    { cwd: projectRoot },
  );

  const requestDir = path.join(requestRoot, requestId);
  const requestManifestPath = path.join(requestDir, "review-request.json");
  const requestManifest = await readJson(
    requestManifestPath,
    "Request manifest",
  );
  const requestSnapshotPath = path.join(
    requestDir,
    requestManifest.artifacts.evidencePack,
  );
  const requestSnapshot = await readJson(
    requestSnapshotPath,
    "Request evidence snapshot",
  );
  const externalEvidence = await readJson(
    externalEvidencePath,
    "External evidence report",
  );

  assert(
    JSON.stringify(requestSnapshot) === JSON.stringify(externalEvidence),
    "Request package did not snapshot the original evidence report.",
  );
  assert(
    typeof requestManifest.evidenceSnapshot?.sha256 === "string" &&
      requestManifest.evidenceSnapshot.sha256.length > 0,
    "Request manifest did not preserve evidence snapshot digest metadata.",
  );

  await unlink(externalEvidencePath);

  const template = await readJson(templatePath, "Review request template");
  const signoffExportPath = path.join(
    artifactDir,
    "exports",
    "snapshot-signoff-export.json",
  );
  const preflightPath = path.join(artifactDir, "snapshot-preflight.json");

  await mkdir(path.dirname(signoffExportPath), { recursive: true });
  await writeFile(
    signoffExportPath,
    JSON.stringify(
      buildCompletedSignoffExport(
        template,
        requestManifest.createdAt,
        requestManifest.requestRevisionSha256,
      ),
      null,
      2,
    ),
    "utf8",
  );

  const preflightResult = await execFileAsync(
    process.execPath,
    [
      "./scripts/preflight-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, signoffExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--output",
      path.relative(projectRoot, preflightPath),
    ],
    { cwd: projectRoot },
  );
  const preflightReport = await readJson(preflightPath, "Preflight report");

  assert(
    preflightResult.stdout.includes("evidence=request_snapshot"),
    "Preflight did not resolve the request evidence snapshot.",
  );
  assert(
    preflightReport.ok === true,
    "Preflight did not keep the snapshot-backed request eligible after the external evidence path was removed.",
  );
  assert(
    preflightReport.sourceEvidencePack?.selectedPath ===
      path.relative(projectRoot, requestSnapshotPath),
    "Preflight did not preserve the request snapshot path.",
  );
  assert(
    preflightReport.sourceEvidencePack?.integrityOk === true &&
      preflightReport.sourceEvidencePack?.integrityState === "verified",
    "Preflight did not verify request snapshot integrity after the external evidence path was removed.",
  );

  const completionResult = await execFileAsync(
    process.execPath,
    [
      "./scripts/complete-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, signoffExportPath),
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
  const archiveManifest = await readJson(
    path.join(projectRoot, fulfilledRequestManifest.fulfillment.archiveManifestPath),
    "Archive manifest",
  );

  assert(
    completionResult.stdout.includes("evidence=request_snapshot"),
    "Completion did not resolve the request evidence snapshot.",
  );
  assert(
    archiveManifest.sourceEvidencePack === path.relative(projectRoot, requestSnapshotPath),
    "Archive did not preserve the request snapshot path after completion.",
  );

  const report = {
    requestId,
    sourceEvidenceSeed: requestManifest.sourceEvidencePack,
    requestEvidenceSnapshot: path.relative(projectRoot, requestSnapshotPath),
    requestEvidenceSnapshotSha256: requestManifest.evidenceSnapshot.sha256,
    archiveSourceEvidencePack: archiveManifest.sourceEvidencePack,
  };

  await writeFile(
    path.join(artifactDir, "phase90-results.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log(
    `interaction-audit: phase90 review proved self-contained request evidence snapshot ${report.requestEvidenceSnapshot}`,
  );
}

void runReview().catch((error) => {
  console.error("interaction-audit: phase90 review failed");
  console.error(error);
  process.exitCode = 1;
});
