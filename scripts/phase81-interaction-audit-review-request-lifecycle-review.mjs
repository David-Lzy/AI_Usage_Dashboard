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
  "phase81-interaction-audit-review-request-lifecycle-review",
);
const testingRoot = path.join(artifactDir, "Doc", "testing");
const requestRoot = path.join(testingRoot, "operator_review_requests");
const archiveRoot = path.join(testingRoot, "operator_reviews");
const requestIndexMarkdownPath = path.join(
  testingRoot,
  "Interaction_Audit_Review_Requests.md",
);
const requestIndexJsonPath = path.join(requestRoot, "index.json");
const archiveIndexMarkdownPath = path.join(
  testingRoot,
  "Interaction_Audit_Review_Archive.md",
);
const archiveIndexJsonPath = path.join(archiveRoot, "index.json");
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
const seededSignoffExportPath = path.join(
  artifactDir,
  "exports",
  "seeded-pass-signoff-export.json",
);
const requestId = "2026-04-24-synthetic-operator-review-request";

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
  signoffExport.metadata.sessionLabel = "real compact pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T10:30:00.000Z";
  signoffExport.surfaces[0].signoffStatus = "pass";
  signoffExport.surfaces[0].operatorNotes = "Dashboard focus and density looked stable.";
  signoffExport.surfaces[0].manualChecks[0].completed = true;
  signoffExport.surfaces[0].manualChecks[1].completed = true;
  signoffExport.surfaces[1].signoffStatus = "follow_up";
  signoffExport.surfaces[1].operatorNotes =
    "Expanded diagnostics still need one more human pass.";
  signoffExport.surfaces[1].manualChecks[0].completed = true;
  signoffExport.surfaces[1].manualChecks[1].completed = false;
  signoffExport.surfaces[1].manualChecks[2].completed = false;
  signoffExport.surfaces[3].signoffStatus = "pass";
  signoffExport.surfaces[3].operatorNotes = "Hybrid-source detail remained readable.";
  signoffExport.surfaces[3].manualChecks[0].completed = true;
  signoffExport.surfaces[3].manualChecks[1].completed = true;
  signoffExport.surfaces[4].signoffStatus = "pass";
  signoffExport.surfaces[4].operatorNotes = "Popup spacing stayed readable.";
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
  const seededSignoffExport = structuredClone(completedSignoffExport);

  completedSignoffExport.requestContext = {
    requestId,
    requestCreatedAt: createdRequestManifest.createdAt,
    requestRevisionSha256: createdRequestManifest.requestRevisionSha256,
  };
  seededSignoffExport.requestContext = {
    requestId,
    requestCreatedAt: createdRequestManifest.createdAt,
    requestRevisionSha256: createdRequestManifest.requestRevisionSha256,
  };
  seededSignoffExport.metadata.reviewerName = "Seeded Reviewer";
  seededSignoffExport.metadata.sessionLabel = "seeded review request fixture";

  await writeFile(
    signoffExportPath,
    JSON.stringify(completedSignoffExport, null, 2),
    "utf8",
  );
  await writeFile(
    seededSignoffExportPath,
    JSON.stringify(seededSignoffExport, null, 2),
    "utf8",
  );

  const pendingIndexJson = await readJson(
    requestIndexJsonPath,
    "Pending request index json",
  );

  assert(
    pendingIndexJson.pendingRequestCount === 1,
    "Pending request index count was incorrect after create.",
  );
  assert(
    pendingIndexJson.fulfilledRequestCount === 0,
    "Fulfilled request index count should stay zero after create.",
  );

  let seededFailure = "";

  try {
    await execFileAsync(
      process.execPath,
      [
        "./scripts/complete-interaction-audit-review-request.mjs",
        "--request-id",
        requestId,
        "--input",
        path.relative(projectRoot, seededSignoffExportPath),
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
    seededFailure = String(error?.stderr ?? error);
  }

  assert(
    seededFailure.includes("seeded signoff export"),
    "Completion command did not reject seeded review input.",
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
  const requestReadme = await readFile(
    path.join(requestRoot, requestId, "README.md"),
    "utf8",
  );
  const requestIndexMarkdown = await readFile(requestIndexMarkdownPath, "utf8");
  const requestIndexJson = await readJson(
    requestIndexJsonPath,
    "Fulfilled request index json",
  );
  const archiveIndexMarkdown = await readFile(archiveIndexMarkdownPath, "utf8");
  const archiveIndexJson = await readJson(
    archiveIndexJsonPath,
    "Archive index json",
  );

  assert(
    requestManifest.status === "fulfilled_review_archived",
    "Request manifest did not move to fulfilled status.",
  );
  assert(
    requestManifest.fulfillment?.archiveId?.length > 0,
    "Request manifest did not preserve the linked archive id.",
  );
  assert(
    requestManifest.fulfillment?.summary?.readyForSignoff === false,
    "Request fulfillment summary rewrote the unresolved review state.",
  );
  assert(
    requestReadme.includes("Fulfillment:"),
    "Request README did not expose fulfillment details.",
  );
  assert(
    requestReadme.includes("linked review archive remains the source of truth"),
    "Request README did not preserve the fulfillment truth note.",
  );
  assert(
    requestIndexMarkdown.includes("## Pending Requests"),
    "Request index markdown was missing the pending section.",
  );
  assert(
    requestIndexMarkdown.includes("## Fulfilled Requests"),
    "Request index markdown was missing the fulfilled section.",
  );
  assert(
    requestIndexMarkdown.includes(requestId),
    "Request index markdown was missing the fulfilled request entry.",
  );
  assert(
    requestIndexJson.pendingRequestCount === 0,
    "Request index JSON pending count was incorrect after completion.",
  );
  assert(
    requestIndexJson.fulfilledRequestCount === 1,
    "Request index JSON fulfilled count was incorrect after completion.",
  );
  assert(
    Array.isArray(archiveIndexJson.records) && archiveIndexJson.records.length === 1,
    "Archive index JSON did not preserve the completed review record.",
  );
  assert(
    archiveIndexMarkdown.includes("## Operator Review Sessions"),
    "Archive index markdown was missing the operator section after completion.",
  );
  assert(
    archiveIndexMarkdown.includes(requestManifest.fulfillment.archiveId),
    "Archive index markdown was missing the linked archive id.",
  );

  const report = {
    requestId,
    requestStatus: requestManifest.status,
    archiveId: requestManifest.fulfillment.archiveId,
    requestIndexMarkdownPath: path.relative(projectRoot, requestIndexMarkdownPath),
    requestIndexJsonPath: path.relative(projectRoot, requestIndexJsonPath),
    archiveIndexMarkdownPath: path.relative(projectRoot, archiveIndexMarkdownPath),
    archiveIndexJsonPath: path.relative(projectRoot, archiveIndexJsonPath),
    pendingRequestCount: requestIndexJson.pendingRequestCount,
    fulfilledRequestCount: requestIndexJson.fulfilledRequestCount,
    readyForSignoff: requestManifest.fulfillment.summary.readyForSignoff,
    followUpSurfaceCount: requestManifest.fulfillment.summary.followUpSurfaceCount,
    notReviewedSurfaceCount: requestManifest.fulfillment.summary.notReviewedSurfaceCount,
    pendingManualCheckCount:
      requestManifest.fulfillment.summary.pendingManualCheckCount,
  };
  const reportPath = path.join(artifactDir, "phase81-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase81: request ${requestId} fulfilled by archive ${requestManifest.fulfillment.archiveId}`,
  );
  console.log(`phase81: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase81: pending=${requestIndexJson.pendingRequestCount} fulfilled=${requestIndexJson.fulfilledRequestCount} ready=${requestManifest.fulfillment.summary.readyForSignoff ? "yes" : "no"}`,
  );
}

void runReview().catch((error) => {
  console.error("phase81: interaction audit review request lifecycle review failed");
  console.error(error);
  process.exitCode = 1;
});
