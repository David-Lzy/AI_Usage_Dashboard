import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase96-interaction-audit-request-fulfillment-receipt-review",
);
const testingRoot = path.join(artifactDir, "Doc", "testing");
const requestRoot = path.join(testingRoot, "operator_review_requests");
const archiveRoot = path.join(testingRoot, "operator_reviews");
const requestIndexMarkdownPath = path.join(
  testingRoot,
  "Interaction_Audit_Review_Requests.md",
);
const requestIndexJsonPath = path.join(requestRoot, "index.json");
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
const signoffExportPath = path.join(
  artifactDir,
  "exports",
  "operator-pass-signoff-export.json",
);
const requestId = "2026-04-24-fulfillment-receipt-review-request";

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
  signoffExport.metadata.sessionLabel = "receipt compact pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T14:20:00.000Z";
  signoffExport.surfaces[0].signoffStatus = "pass";
  signoffExport.surfaces[0].manualChecks[0].completed = true;
  signoffExport.surfaces[0].manualChecks[1].completed = true;
  signoffExport.surfaces[1].signoffStatus = "follow_up";
  signoffExport.surfaces[1].operatorNotes =
    "Need one more human readability pass.";
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
  await mkdir(path.dirname(signoffExportPath), { recursive: true });

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

  const createdRequestManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Created request manifest",
  );
  const template = await readJson(templatePath, "Review request template");
  const completedSignoffExport = buildCompletedSignoffExport(template);

  completedSignoffExport.requestContext = {
    requestId,
    requestCreatedAt: createdRequestManifest.createdAt,
    requestRevisionSha256: createdRequestManifest.requestRevisionSha256,
  };

  await writeFile(
    signoffExportPath,
    JSON.stringify(completedSignoffExport, null, 2),
    "utf8",
  );

  await execFileAsync(
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

  const requestManifestPath = path.join(requestRoot, requestId, "review-request.json");
  const requestReadmePath = path.join(requestRoot, requestId, "README.md");
  const requestManifest = await readJson(
    requestManifestPath,
    "Fulfilled request manifest",
  );
  const requestReadme = await readFile(requestReadmePath, "utf8");
  const requestIndexMarkdown = await readFile(requestIndexMarkdownPath, "utf8");
  const requestIndexJson = await readJson(
    requestIndexJsonPath,
    "Request index JSON",
  );

  assert(
    requestManifest.fulfillment?.completedReviewSession?.reviewerName ===
      "Operator Example",
    "Fulfilled request manifest did not preserve completed reviewer metadata.",
  );
  assert(
    requestManifest.fulfillment?.completedRequestContext?.requestRevisionSha256 ===
      createdRequestManifest.requestRevisionSha256,
    "Fulfilled request manifest did not preserve completed request revision.",
  );
  assert(
    requestManifest.fulfillment?.completedEvidenceContext?.source ===
      "request_snapshot",
    "Fulfilled request manifest did not preserve completed evidence source.",
  );
  assert(
    requestManifest.fulfillment?.completedSignoffExportDigest?.sha256?.length === 64,
    "Fulfilled request manifest did not preserve completed signoff export digest.",
  );
  assert(
    requestReadme.includes("- Completed reviewer: Operator Example"),
    "Fulfilled request README did not preserve completed reviewer metadata.",
  );
  assert(
    requestReadme.includes("- Completion evidence source: Request evidence snapshot"),
    "Fulfilled request README did not preserve completed evidence source.",
  );
  assert(
    requestReadme.includes("- Completed signoff export digest: `sha256:"),
    "Fulfilled request README did not preserve export digest receipt.",
  );
  assert(
    requestIndexMarkdown.includes("completion request revision: `sha256:"),
    "Request index markdown did not preserve completion request revision.",
  );
  assert(
    requestIndexMarkdown.includes(
      "completion evidence source: `Request evidence snapshot`",
    ),
    "Request index markdown did not preserve completion evidence source.",
  );
  assert(
    requestIndexMarkdown.includes("completed export digest: `sha256:"),
    "Request index markdown did not preserve completed export digest.",
  );

  const fulfilledRecord = requestIndexJson.records.find(
    (record) => record.requestId === requestId,
  );

  assert(fulfilledRecord, "Request index JSON did not contain the fulfilled request.");
  assert(
    fulfilledRecord.fulfillment.completedReviewSession.reviewerName ===
      "Operator Example",
    "Request index JSON did not preserve completion review-session metadata.",
  );
  assert(
    fulfilledRecord.fulfillment.completedEvidenceContext.source === "request_snapshot",
    "Request index JSON did not preserve completion evidence source.",
  );
  assert(
    fulfilledRecord.fulfillment.completedSignoffExportDigest.sha256.length === 64,
    "Request index JSON did not preserve completed export digest.",
  );

  const report = {
    requestId,
    archiveId: requestManifest.fulfillment.archiveId,
    completedReviewer: requestManifest.fulfillment.completedReviewSession.reviewerName,
    completedRequestRevision:
      requestManifest.fulfillment.completedRequestContext.requestRevisionSha256,
    completedEvidenceSource:
      requestManifest.fulfillment.completedEvidenceContext.source,
    completedExportDigest:
      requestManifest.fulfillment.completedSignoffExportDigest.sha256,
  };
  const reportPath = path.join(artifactDir, "phase96-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase96: request ${requestId} preserved fulfillment receipt metadata in request records`,
  );
  console.log(`phase96: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase96: archive=${requestManifest.fulfillment.archiveId} evidence=${requestManifest.fulfillment.completedEvidenceContext.source}`,
  );
}

void runReview().catch((error) => {
  console.error(
    "phase96: interaction audit request fulfillment receipt review failed",
  );
  console.error(error);
  process.exitCode = 1;
});
