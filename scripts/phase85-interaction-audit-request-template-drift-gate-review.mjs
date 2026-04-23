import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase85-interaction-audit-request-template-drift-gate-review",
);
const testingRoot = path.join(artifactDir, "Doc", "testing");
const requestRoot = path.join(testingRoot, "operator_review_requests");
const archiveRoot = path.join(testingRoot, "operator_reviews");
const requestIndexMarkdownPath = path.join(
  testingRoot,
  "Interaction_Audit_Review_Requests.md",
);
const requestIndexJsonPath = path.join(requestRoot, "index.json");
const evidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);
const templatePath = path.join(
  artifactDir,
  "fixtures",
  "interaction-audit",
  "operator-review-request-template.fixture.json",
);
const requestId = "2026-04-24-template-drift-review-request";
const signoffExportPath = path.join(
  artifactDir,
  "exports",
  "template-drift-signoff-export.json",
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
            label: "Confirm focus visibility.",
            completed: false,
          },
          {
            label: "Confirm density remains readable.",
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
            label: "Confirm density remains readable.",
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
  signoffExport.metadata.sessionLabel = "template drift guard pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T15:00:00.000Z";
  signoffExport.summary.reviewedSurfaceCount = 1;
  signoffExport.summary.passSurfaceCount = 1;
  signoffExport.summary.followUpSurfaceCount = 0;
  signoffExport.summary.completedManualCheckCount = 2;
  signoffExport.summary.totalManualCheckCount = 2;
  signoffExport.surfaces[0].signoffStatus = "pass";
  signoffExport.surfaces[0].operatorNotes = "Looks good.";
  signoffExport.surfaces[0].manualChecks[0].completed = true;
  signoffExport.surfaces[0].manualChecks[1].completed = true;

  return signoffExport;
}

async function runReview() {
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
      requestId,
      "--template",
      path.relative(projectRoot, templatePath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );

  const requestTemplate = await readJson(
    path.join(requestRoot, requestId, "interaction-audit-signoff-template.json"),
    "Pending request template",
  );
  const completedSignoffExport = buildCompletedSignoffExport(requestTemplate);

  await writeFile(
    signoffExportPath,
    JSON.stringify(completedSignoffExport, null, 2),
    "utf8",
  );

  await writeFile(
    templatePath,
    JSON.stringify(buildDriftedTemplate(), null, 2),
    "utf8",
  );

  await execFileAsync(
    process.execPath,
    [
      "./scripts/build-interaction-audit-review-request-index.mjs",
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--index-markdown",
      path.relative(projectRoot, requestIndexMarkdownPath),
      "--index-json",
      path.relative(projectRoot, requestIndexJsonPath),
    ],
    { cwd: projectRoot },
  );

  const requestIndexMarkdown = await readFile(requestIndexMarkdownPath, "utf8");
  const requestIndexJson = await readJson(requestIndexJsonPath, "Request index json");
  const driftedRecord = requestIndexJson.records.find(
    (record) => record.requestId === requestId,
  );

  assert(
    requestIndexMarkdown.includes("shape mismatch with current source template"),
    "Request index markdown did not expose template drift.",
  );
  assert(
    driftedRecord?.templateDrift?.state === "shape_mismatch",
    "Request index json did not preserve the template drift state.",
  );

  let completionFailure = "";

  try {
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
  } catch (error) {
    completionFailure = String(error?.stderr ?? error);
  }

  assert(
    completionFailure.includes("Current source template"),
    "Completion command did not reject a drifted request package.",
  );
  assert(
    completionFailure.includes("Regenerate the pending request before completion"),
    "Completion command did not explain how to recover from template drift.",
  );

  const report = {
    requestId,
    templateDriftState: driftedRecord.templateDrift.state,
    driftMismatchError: driftedRecord.templateDrift.mismatchError,
    completionRejected: true,
  };
  const reportPath = path.join(artifactDir, "phase85-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `phase85: drifted request ${requestId} was flagged in the request index and rejected during completion`,
  );
  console.log(`phase85: saved machine-readable results to ${reportPath}`);
  console.log(`phase85: drift_state=${driftedRecord.templateDrift.state}`);
}

void runReview().catch((error) => {
  console.error("phase85: interaction audit request template drift gate review failed");
  console.error(error);
  process.exitCode = 1;
});
