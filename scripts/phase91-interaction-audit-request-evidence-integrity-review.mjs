import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase91-interaction-audit-request-evidence-integrity-review",
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
const requestId = "2026-04-24-request-evidence-integrity";

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
    generatedAt: "2026-04-24T19:00:00.000Z",
    evidenceItems: [
      {
        surfaceTitle: "Dashboard",
        label: "Original integrity evidence",
        expectation: "Original integrity expectation",
        screenshot: "original-dashboard.png",
        auditStatus: {
          message: "Original evidence prepared",
        },
      },
    ],
  };
}

function buildTamperedEvidenceReport() {
  return {
    generatedAt: "2026-04-24T19:05:00.000Z",
    evidenceItems: [
      {
        surfaceTitle: "Dashboard",
        label: "Tampered integrity evidence",
        expectation: "Tampered integrity expectation",
        screenshot: "tampered-dashboard.png",
        auditStatus: {
          message: "Tampered evidence prepared",
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
  signoffExport.metadata.sessionLabel = "integrity proof";
  signoffExport.metadata.reviewedAt = "2026-04-24T19:15:00.000Z";
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
  const requestSnapshotPath = path.join(
    requestDir,
    "interaction-audit-evidence-pack.json",
  );
  const requestManifest = await readJson(
    requestManifestPath,
    "Request manifest",
  );
  const template = await readJson(templatePath, "Review request template");
  const signoffExportPath = path.join(
    artifactDir,
    "exports",
    "integrity-signoff-export.json",
  );
  const preflightPath = path.join(artifactDir, "integrity-preflight.json");

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
  await writeFile(
    requestSnapshotPath,
    JSON.stringify(buildTamperedEvidenceReport(), null, 2),
    "utf8",
  );

  const preflightFailure = await runExpectedFailure(
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
    "Preflight review",
  );
  const preflightReport = await readJson(preflightPath, "Preflight report");

  assert(
    preflightFailure.stdout.includes("fail source-evidence-snapshot-integrity"),
    "Preflight output did not report the snapshot-integrity failure.",
  );
  assert(preflightReport.ok === false, "Preflight unexpectedly remained eligible.");
  assert(
    preflightReport.sourceEvidencePack?.integrityOk === false &&
      preflightReport.sourceEvidencePack?.integrityState === "digest_mismatch",
    "Preflight did not report the expected snapshot-integrity mismatch.",
  );
  assert(
    preflightReport.checks.some(
      (check) =>
        check.id === "source-evidence-snapshot-integrity" && check.ok === false,
    ),
    "Preflight did not include a failing snapshot-integrity check.",
  );

  const completeFailure = await runExpectedFailure(
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
    "Completion review",
  );
  const pendingRequestManifest = await readJson(
    requestManifestPath,
    "Pending request manifest after failed completion",
  );
  const archiveEntries = await readdir(archiveRoot).catch(() => []);

  assert(
    completeFailure.stderr.includes("digest recorded in the review request manifest"),
    "Completion did not fail on snapshot-integrity mismatch.",
  );
  assert(
    pendingRequestManifest.status === "pending_operator_review",
    "Failed completion should not have mutated the request status.",
  );
  assert(
    archiveEntries.length === 0,
    "Failed completion should not have written an archive directory.",
  );

  const report = {
    requestId,
    integrityState: preflightReport.sourceEvidencePack.integrityState,
    expectedSha256: preflightReport.sourceEvidencePack.expectedSha256,
    actualSha256: preflightReport.sourceEvidencePack.actualSha256,
    requestStatusAfterFailure: pendingRequestManifest.status,
  };

  await writeFile(
    path.join(artifactDir, "phase91-results.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log(
    `interaction-audit: phase91 review rejected tampered request snapshot for ${requestId}`,
  );
}

void runReview().catch((error) => {
  console.error("interaction-audit: phase91 review failed");
  console.error(error);
  process.exitCode = 1;
});
