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
  "phase84-interaction-audit-request-bound-export-context-review",
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
const blankBindingExportPath = path.join(
  artifactDir,
  "exports",
  "blank-binding-signoff-export.json",
);
const mismatchedBindingExportPath = path.join(
  artifactDir,
  "exports",
  "mismatched-binding-signoff-export.json",
);
const requestId = "2026-04-24-request-bound-export-context-review";

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
  signoffExport.metadata.sessionLabel = "request-bound context pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T14:00:00.000Z";
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

async function runCompletion({ inputPath }) {
  return execFileAsync(
    process.execPath,
    [
      "./scripts/complete-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, inputPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--archive-root",
      path.relative(projectRoot, archiveRoot),
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );
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
  const requestTemplate = await readJson(
    path.join(requestRoot, requestId, "interaction-audit-signoff-template.json"),
    "Pending request template",
  );
  const sourceTemplate = await readJson(templatePath, "Source review request template");

  assert(
    requestTemplate.requestContext?.requestId === requestId,
    "Pending request template did not preserve the bound request id.",
  );
  assert(
    requestTemplate.requestContext?.requestCreatedAt === requestManifest.createdAt,
    "Pending request template did not preserve the bound request creation time.",
  );
  assert(
    requestTemplate.requestContext?.requestRevisionSha256 ===
      requestManifest.requestRevisionSha256,
    "Pending request template did not preserve the bound request revision.",
  );

  const validExport = buildCompletedSignoffExport(sourceTemplate);
  const blankBindingExport = structuredClone(validExport);
  const mismatchedBindingExport = structuredClone(validExport);

  validExport.requestContext = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    requestRevisionSha256: requestManifest.requestRevisionSha256,
  };
  blankBindingExport.requestContext = {
    requestId: "",
    requestCreatedAt: "",
    requestRevisionSha256: "",
  };
  mismatchedBindingExport.requestContext = {
    requestId: "2026-04-24-other-pending-request",
    requestCreatedAt: requestManifest.createdAt,
    requestRevisionSha256: requestManifest.requestRevisionSha256,
  };

  await writeFile(validExportPath, JSON.stringify(validExport, null, 2), "utf8");
  await writeFile(
    blankBindingExportPath,
    JSON.stringify(blankBindingExport, null, 2),
    "utf8",
  );
  await writeFile(
    mismatchedBindingExportPath,
    JSON.stringify(mismatchedBindingExport, null, 2),
    "utf8",
  );

  let blankBindingFailure = "";
  let mismatchedBindingFailure = "";

  try {
    await runCompletion({ inputPath: blankBindingExportPath });
  } catch (error) {
    blankBindingFailure = String(error?.stderr ?? error);
  }

  try {
    await runCompletion({ inputPath: mismatchedBindingExportPath });
  } catch (error) {
    mismatchedBindingFailure = String(error?.stderr ?? error);
  }

  assert(
    blankBindingFailure.includes("request binding"),
    "Completion command did not reject an export whose request binding was blank.",
  );
  assert(
    mismatchedBindingFailure.includes("request binding"),
    "Completion command did not reject an export whose request binding targeted another request.",
  );

  await runCompletion({ inputPath: validExportPath });

  const fulfilledManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Fulfilled request manifest",
  );

  assert(
    fulfilledManifest.status === "fulfilled_review_archived",
    "Request manifest did not reach fulfilled status after a correctly bound export.",
  );

  const report = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    templateRequestBinding: requestTemplate.requestContext,
    blankBindingRejected: true,
    mismatchedBindingRejected: true,
    archiveId: fulfilledManifest.fulfillment.archiveId,
  };
  const reportPath = path.join(artifactDir, "phase84-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase84: request-bound exports enforced for ${requestId} and saved results to ${reportPath}`,
  );
  console.log(
    `phase84: template_binding=${requestTemplate.requestContext.requestId} fulfilled_archive=${fulfilledManifest.fulfillment.archiveId}`,
  );
}

void runReview().catch((error) => {
  console.error("phase84: interaction audit request-bound export context review failed");
  console.error(error);
  process.exitCode = 1;
});
