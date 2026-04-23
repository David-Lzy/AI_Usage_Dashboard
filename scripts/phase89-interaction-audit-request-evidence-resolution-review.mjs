import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase89-interaction-audit-request-evidence-resolution-review",
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
const requestEvidencePath = path.join(
  artifactDir,
  "evidence",
  "request-evidence.json",
);
const overrideEvidencePath = path.join(
  artifactDir,
  "evidence",
  "override-evidence.json",
);
const defaultRequestId = "2026-04-24-request-evidence-default";
const overrideRequestId = "2026-04-24-request-evidence-override";

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
    generatedAt: "2026-04-24T16:00:00.000Z",
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

function buildCompletedSignoffExport(
  template,
  requestId,
  requestCreatedAt,
  requestRevisionSha256,
  sessionLabel,
) {
  const signoffExport = structuredClone(template);

  signoffExport.metadata.reviewerName = "Operator Example";
  signoffExport.metadata.sessionLabel = sessionLabel;
  signoffExport.metadata.reviewedAt = "2026-04-24T16:15:00.000Z";
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

async function runCreateRequest(requestId) {
  await execFileAsync(
    process.execPath,
    [
      "./scripts/create-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--evidence",
      path.relative(projectRoot, requestEvidencePath),
    ],
    { cwd: projectRoot },
  );
}

async function runCompleteRequest({ requestId, exportPath, evidencePath = "" }) {
  const args = [
    "./scripts/complete-interaction-audit-review-request.mjs",
    "--request-id",
    requestId,
    "--input",
    path.relative(projectRoot, exportPath),
    "--request-root",
    path.relative(projectRoot, requestRoot),
    "--archive-root",
    path.relative(projectRoot, archiveRoot),
  ];

  if (evidencePath.trim().length > 0) {
    args.push("--evidence", path.relative(projectRoot, evidencePath));
  }

  return execFileAsync(process.execPath, args, { cwd: projectRoot });
}

async function runReview() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(path.dirname(requestEvidencePath), { recursive: true });

  await writeFile(
    requestEvidencePath,
    JSON.stringify(
      buildEvidenceReport("Request evidence", "request-evidence-dashboard.png"),
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    overrideEvidencePath,
    JSON.stringify(
      buildEvidenceReport("Override evidence", "override-evidence-dashboard.png"),
      null,
      2,
    ),
    "utf8",
  );

  await runCreateRequest(defaultRequestId);
  const template = await readJson(templatePath, "Review request template");
  const defaultRequestManifestPath = path.join(
    requestRoot,
    defaultRequestId,
    "review-request.json",
  );
  const defaultRequestManifest = await readJson(
    defaultRequestManifestPath,
    "Default request manifest",
  );
  const defaultExportPath = path.join(
    artifactDir,
    "exports",
    "default-request-signoff-export.json",
  );
  const defaultPreflightPath = path.join(
    artifactDir,
    "default-request-preflight.json",
  );

  await mkdir(path.dirname(defaultExportPath), { recursive: true });
  await writeFile(
    defaultExportPath,
    JSON.stringify(
      buildCompletedSignoffExport(
        template,
        defaultRequestId,
        defaultRequestManifest.createdAt,
        defaultRequestManifest.requestRevisionSha256,
        "request evidence default",
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
      defaultRequestId,
      "--input",
      path.relative(projectRoot, defaultExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--output",
      path.relative(projectRoot, defaultPreflightPath),
    ],
    { cwd: projectRoot },
  );
  const preflightReport = await readJson(
    defaultPreflightPath,
    "Default request preflight report",
  );

  assert(
    preflightResult.stdout.includes("evidence=request_snapshot"),
    "Preflight output did not report request-snapshot evidence resolution.",
  );
  assert(
    preflightReport.ok === true,
    "Preflight report did not keep the valid request export eligible.",
  );
  assert(
    preflightReport.sourceEvidencePack?.ok === true &&
      preflightReport.sourceEvidencePack?.selectedPath ===
        path.relative(
          projectRoot,
          path.join(
            requestRoot,
            defaultRequestId,
            "interaction-audit-evidence-pack.json",
          ),
        ),
    "Preflight report did not preserve the request evidence-snapshot resolution.",
  );
  assert(
    preflightReport.checks.some(
      (check) => check.id === "source-evidence-pack" && check.ok === true,
    ),
    "Preflight report did not include a passing source-evidence-pack check.",
  );
  assert(
    preflightReport.sourceEvidencePack?.integrityOk === true &&
      preflightReport.sourceEvidencePack?.integrityState === "verified",
    "Preflight report did not keep request snapshot integrity verified.",
  );

  const defaultCompleteResult = await runCompleteRequest({
    requestId: defaultRequestId,
    exportPath: defaultExportPath,
  });
  const defaultFulfilledManifest = await readJson(
    defaultRequestManifestPath,
    "Fulfilled default request manifest",
  );
  const defaultArchiveManifest = await readJson(
    path.join(projectRoot, defaultFulfilledManifest.fulfillment.archiveManifestPath),
    "Default archive manifest",
  );

  assert(
    defaultCompleteResult.stdout.includes("evidence=request_snapshot"),
    "Completion output did not report request-snapshot evidence resolution.",
  );
  assert(
    defaultArchiveManifest.sourceEvidencePack ===
      path.relative(
        projectRoot,
        path.join(
          requestRoot,
          defaultRequestId,
          "interaction-audit-evidence-pack.json",
        ),
      ),
    "Default completion did not archive the request-bound evidence snapshot path.",
  );

  await runCreateRequest(overrideRequestId);
  const overrideRequestManifestPath = path.join(
    requestRoot,
    overrideRequestId,
    "review-request.json",
  );
  const overrideRequestManifest = await readJson(
    overrideRequestManifestPath,
    "Override request manifest",
  );
  const overrideExportPath = path.join(
    artifactDir,
    "exports",
    "override-request-signoff-export.json",
  );

  await writeFile(
    overrideExportPath,
    JSON.stringify(
      buildCompletedSignoffExport(
        template,
        overrideRequestId,
        overrideRequestManifest.createdAt,
        overrideRequestManifest.requestRevisionSha256,
        "request evidence override",
      ),
      null,
      2,
    ),
    "utf8",
  );

  const overrideCompleteResult = await runCompleteRequest({
    requestId: overrideRequestId,
    exportPath: overrideExportPath,
    evidencePath: overrideEvidencePath,
  });
  const overrideFulfilledManifest = await readJson(
    overrideRequestManifestPath,
    "Fulfilled override request manifest",
  );
  const overrideArchiveManifest = await readJson(
    path.join(projectRoot, overrideFulfilledManifest.fulfillment.archiveManifestPath),
    "Override archive manifest",
  );

  assert(
    overrideCompleteResult.stdout.includes("evidence=cli_override"),
    "Completion output did not report the CLI evidence override.",
  );
  assert(
    overrideArchiveManifest.sourceEvidencePack ===
      path.relative(projectRoot, overrideEvidencePath),
    "Override completion did not archive the actual override evidence pack path.",
  );

  const report = {
    defaultRequestId,
    overrideRequestId,
    preflightEvidencePath: preflightReport.sourceEvidencePack.selectedPath,
    preflightEvidenceIntegrityState:
      preflightReport.sourceEvidencePack.integrityState,
    defaultArchiveSourceEvidencePack: defaultArchiveManifest.sourceEvidencePack,
    overrideArchiveSourceEvidencePack: overrideArchiveManifest.sourceEvidencePack,
  };

  await writeFile(
    path.join(artifactDir, "phase89-results.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log(
    `interaction-audit: phase89 review preserved request evidence ${report.defaultArchiveSourceEvidencePack} and override evidence ${report.overrideArchiveSourceEvidencePack}`,
  );
}

void runReview().catch((error) => {
  console.error("interaction-audit: phase89 review failed");
  console.error(error);
  process.exitCode = 1;
});
