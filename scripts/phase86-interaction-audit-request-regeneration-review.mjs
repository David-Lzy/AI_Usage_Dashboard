import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase86-interaction-audit-request-regeneration-review",
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
  artifactDir,
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
const staleRequestId = "2026-04-24-stale-operator-review-request";
const refreshedRequestId = "2026-04-24-refreshed-operator-review-request";
const signoffExportPath = path.join(
  artifactDir,
  "exports",
  "refreshed-operator-signoff-export.json",
);

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

function buildOriginalTemplate() {
  return {
    metadata: {
      reviewerName: "",
      sessionLabel: "",
      reviewedAt: "",
    },
    requestContext: {
      requestId: "",
      requestCreatedAt: "",
      requestRevisionSha256: "",
    },
    summary: {
      reviewedSurfaceCount: 0,
      passSurfaceCount: 0,
      followUpSurfaceCount: 0,
      completedManualCheckCount: 0,
      totalManualCheckCount: 1,
    },
    surfaces: [
      {
        id: "dashboard-360",
        title: "Dashboard",
        description: "Compact dashboard audit surface.",
        signoffStatus: "not_reviewed",
        operatorNotes: "",
        manualChecks: [
          {
            label: "Confirm focus visibility.",
            completed: false,
          },
        ],
      },
    ],
  };
}

function buildDriftedTemplate() {
  return {
    metadata: {
      reviewerName: "",
      sessionLabel: "",
      reviewedAt: "",
    },
    requestContext: {
      requestId: "",
      requestCreatedAt: "",
      requestRevisionSha256: "",
    },
    summary: {
      reviewedSurfaceCount: 0,
      passSurfaceCount: 0,
      followUpSurfaceCount: 0,
      completedManualCheckCount: 0,
      totalManualCheckCount: 2,
    },
    surfaces: [
      {
        id: "dashboard-360",
        title: "Dashboard",
        description: "Compact dashboard audit surface.",
        signoffStatus: "not_reviewed",
        operatorNotes: "",
        manualChecks: [
          {
            label: "Confirm refreshed focus visibility.",
            completed: false,
          },
          {
            label: "Confirm refreshed density remains readable.",
            completed: false,
          },
        ],
      },
    ],
  };
}

function buildCompletedSignoffExport(requestTemplate) {
  const signoffExport = structuredClone(requestTemplate);

  signoffExport.metadata.reviewerName = "Operator Example";
  signoffExport.metadata.sessionLabel = "regenerated request pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T16:00:00.000Z";
  signoffExport.summary.reviewedSurfaceCount = 1;
  signoffExport.summary.passSurfaceCount = 1;
  signoffExport.summary.followUpSurfaceCount = 0;
  signoffExport.summary.completedManualCheckCount = 2;
  signoffExport.summary.totalManualCheckCount = 2;
  signoffExport.surfaces[0].signoffStatus = "pass";
  signoffExport.surfaces[0].operatorNotes = "Regenerated request review passed.";
  signoffExport.surfaces[0].manualChecks[0].completed = true;
  signoffExport.surfaces[0].manualChecks[1].completed = true;

  return signoffExport;
}

async function runReview() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(path.dirname(templatePath), { recursive: true });
  await mkdir(path.dirname(signoffExportPath), { recursive: true });

  await writeFile(
    templatePath,
    JSON.stringify(buildOriginalTemplate(), null, 2),
    "utf8",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/create-interaction-audit-review-request.mjs",
      "--request-id",
      staleRequestId,
      "--template",
      path.relative(projectRoot, templatePath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );

  await writeFile(
    templatePath,
    JSON.stringify(buildDriftedTemplate(), null, 2),
    "utf8",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/regenerate-interaction-audit-review-request.mjs",
      "--request-id",
      staleRequestId,
      "--replacement-request-id",
      refreshedRequestId,
      "--request-root",
      path.relative(projectRoot, requestRoot),
    ],
    { cwd: projectRoot },
  );

  const staleManifest = await readJson(
    path.join(requestRoot, staleRequestId, "review-request.json"),
    "Superseded request manifest",
  );
  const refreshedManifest = await readJson(
    path.join(requestRoot, refreshedRequestId, "review-request.json"),
    "Replacement request manifest",
  );
  const refreshedTemplate = await readJson(
    path.join(requestRoot, refreshedRequestId, "interaction-audit-signoff-template.json"),
    "Replacement request template",
  );
  const requestIndexMarkdown = await readFile(requestIndexMarkdownPath, "utf8");
  const requestIndexJson = await readJson(requestIndexJsonPath, "Request index json");

  assert(
    staleManifest.status === "superseded_by_regenerated_request",
    "Stale request manifest did not move to superseded status.",
  );
  assert(
    staleManifest.supersededBy?.replacementRequestId === refreshedRequestId,
    "Stale request manifest did not preserve the replacement request link.",
  );
  assert(
    refreshedManifest.status === "pending_operator_review",
    "Replacement request manifest did not stay pending.",
  );
  assert(
    requestIndexMarkdown.includes("## Other Request States"),
    "Request index markdown did not expose other request states.",
  );
  assert(
    requestIndexMarkdown.includes(staleRequestId),
    "Request index markdown did not list the superseded request.",
  );
  assert(
    requestIndexMarkdown.includes(refreshedRequestId),
    "Request index markdown did not list the regenerated pending request.",
  );
  assert(
    requestIndexJson.records.find((record) => record.requestId === staleRequestId)
      ?.status === "superseded_by_regenerated_request",
    "Request index json did not preserve superseded status.",
  );

  const refreshedSignoffExport = buildCompletedSignoffExport(refreshedTemplate);

  await writeFile(
    signoffExportPath,
    JSON.stringify(refreshedSignoffExport, null, 2),
    "utf8",
  );

  let supersededFailure = "";

  try {
    await execFileAsync(
      process.execPath,
      [
        "./scripts/complete-interaction-audit-review-request.mjs",
        "--request-id",
        staleRequestId,
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
  } catch (error) {
    supersededFailure = String(error?.stderr ?? error);
  }

  assert(
    supersededFailure.includes("Review request must be"),
    "Superseded request did not reject completion.",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/complete-interaction-audit-review-request.mjs",
      "--request-id",
      refreshedRequestId,
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

  const fulfilledReplacementManifest = await readJson(
    path.join(requestRoot, refreshedRequestId, "review-request.json"),
    "Fulfilled replacement request manifest",
  );

  assert(
    fulfilledReplacementManifest.status === "fulfilled_review_archived",
    "Replacement request did not complete after regeneration.",
  );

  const report = {
    staleRequestId,
    refreshedRequestId,
    staleStatus: staleManifest.status,
    replacementStatus: fulfilledReplacementManifest.status,
    replacementArchiveId: fulfilledReplacementManifest.fulfillment.archiveId,
  };
  const reportPath = path.join(artifactDir, "phase86-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase86: regenerated stale request ${staleRequestId} into ${refreshedRequestId} and fulfilled the replacement request`,
  );
  console.log(`phase86: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase86: superseded=${staleManifest.status} replacement=${fulfilledReplacementManifest.status}`,
  );
}

void runReview().catch((error) => {
  console.error("phase86: interaction audit request regeneration review failed");
  console.error(error);
  process.exitCode = 1;
});
