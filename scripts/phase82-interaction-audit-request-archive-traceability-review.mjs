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
  "phase82-interaction-audit-request-archive-traceability-review",
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
const signoffExportPath = path.join(
  artifactDir,
  "exports",
  "operator-pass-signoff-export.json",
);
const requestId = "2026-04-24-traceable-operator-review-request";

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
  signoffExport.metadata.sessionLabel = "traceable compact pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T12:00:00.000Z";
  signoffExport.surfaces[0].signoffStatus = "pass";
  signoffExport.surfaces[0].operatorNotes = "Dashboard remained stable.";
  signoffExport.surfaces[0].manualChecks[0].completed = true;
  signoffExport.surfaces[0].manualChecks[1].completed = true;
  signoffExport.surfaces[1].signoffStatus = "follow_up";
  signoffExport.surfaces[1].operatorNotes =
    "Settings disclosure still needs one more human pass.";
  signoffExport.surfaces[1].manualChecks[0].completed = true;
  signoffExport.surfaces[1].manualChecks[1].completed = false;
  signoffExport.surfaces[1].manualChecks[2].completed = false;
  signoffExport.surfaces[4].signoffStatus = "pass";
  signoffExport.surfaces[4].operatorNotes = "Popup actions remained readable.";
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
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );

  const requestManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Fulfilled request manifest",
  );
  const archiveId = requestManifest.fulfillment.archiveId;
  const archiveManifest = await readJson(
    path.join(archiveRoot, archiveId, "review-archive.json"),
    "Traceable archive manifest",
  );
  const archiveReadme = await readFile(
    path.join(archiveRoot, archiveId, "README.md"),
    "utf8",
  );
  const archiveIndexMarkdown = await readFile(
    path.join(testingRoot, "Interaction_Audit_Review_Archive.md"),
    "utf8",
  );
  const archiveIndexJson = await readJson(
    path.join(archiveRoot, "index.json"),
    "Traceable archive index json",
  );

  assert(
    archiveManifest.sourceRequest?.requestId === requestId,
    "Archive manifest did not preserve the linked request id.",
  );
  assert(
    archiveManifest.sourceRequest?.requestReadmePath?.endsWith(`/operator_review_requests/${requestId}/README.md`),
    "Archive manifest did not preserve the linked request README path.",
  );
  assert(
    archiveReadme.includes("Source request:"),
    "Archive README did not expose the source request section.",
  );
  assert(
    archiveReadme.includes(`- Request ID: \`${requestId}\``),
    "Archive README did not preserve the linked request id.",
  );
  assert(
    archiveIndexMarkdown.includes(`source request: [${requestId}]`),
    "Archive index markdown did not link back to the source request.",
  );
  assert(
    Array.isArray(archiveIndexJson.records) &&
      archiveIndexJson.records[0]?.sourceRequest?.requestId === requestId,
    "Archive index JSON did not preserve the source request link.",
  );

  const report = {
    requestId,
    archiveId,
    archiveManifestPath: path.relative(
      projectRoot,
      path.join(archiveRoot, archiveId, "review-archive.json"),
    ),
    archiveReadmePath: path.relative(
      projectRoot,
      path.join(archiveRoot, archiveId, "README.md"),
    ),
    archiveIndexMarkdownPath: path.relative(
      projectRoot,
      path.join(testingRoot, "Interaction_Audit_Review_Archive.md"),
    ),
    archiveIndexJsonPath: path.relative(
      projectRoot,
      path.join(archiveRoot, "index.json"),
    ),
    readyForSignoff: archiveManifest.summary.readyForSignoff,
    followUpSurfaceCount: archiveManifest.summary.followUpSurfaceCount,
    notReviewedSurfaceCount: archiveManifest.summary.notReviewedSurfaceCount,
  };
  const reportPath = path.join(artifactDir, "phase82-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase82: archive ${archiveId} now links back to request ${requestId}`,
  );
  console.log(`phase82: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase82: ready=${archiveManifest.summary.readyForSignoff ? "yes" : "no"} follow_up=${archiveManifest.summary.followUpSurfaceCount} not_reviewed=${archiveManifest.summary.notReviewedSurfaceCount}`,
  );
}

void runReview().catch((error) => {
  console.error("phase82: interaction audit request archive traceability review failed");
  console.error(error);
  process.exitCode = 1;
});
