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
  "phase117-theme-recovery-request-preflight-review",
);
const templatePath = path.join(
  projectRoot,
  "fixtures",
  "theme-recovery",
  "operator-review-request-template.fixture.json",
);
const seedReviewExportPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "2026-04-23-theme-recovery-seeded-archive-baseline",
  "theme-recovery-review-export.json",
);
const seedArchiveReadmePath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "2026-04-23-theme-recovery-seeded-archive-baseline",
  "README.md",
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

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const requestRoot = path.join(artifactDir, "theme_recovery_review_requests");
  const requestId = "2026-04-24-theme-recovery-request-preflight-review";
  const okReportPath = path.join(artifactDir, "preflight-ok-report.json");
  const failReportPath = path.join(artifactDir, "preflight-fail-report.json");

  await execFileAsync(
    process.execPath,
    [
      path.join(projectRoot, "scripts", "create-theme-recovery-review-request.mjs"),
      "--template",
      path.relative(projectRoot, templatePath),
      "--seed-review-export",
      path.relative(projectRoot, seedReviewExportPath),
      "--seed-archive-readme",
      path.relative(projectRoot, seedArchiveReadmePath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--request-id",
      requestId,
    ],
    { cwd: projectRoot },
  );

  const requestManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Theme recovery pending request manifest",
  );
  const matchingExport = await readJson(
    seedReviewExportPath,
    "Theme recovery seeded reference export",
  );

  matchingExport.generatedAt = "2026-04-24T10:15:00.000Z";
  matchingExport.requestContext = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    requestBoundWorkspaceRoute:
      requestManifest.requestContext.requestBoundWorkspaceRoute,
  };

  const matchingExportPath = path.join(
    artifactDir,
    "theme-recovery-review-export-bound.json",
  );

  await writeFile(
    matchingExportPath,
    `${JSON.stringify(matchingExport, null, 2)}\n`,
    "utf8",
  );

  const okResult = await execFileAsync(
    process.execPath,
    [
      path.join(
        projectRoot,
        "scripts",
        "preflight-theme-recovery-review-request.mjs",
      ),
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, matchingExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--output",
      path.relative(projectRoot, okReportPath),
    ],
    { cwd: projectRoot },
  );

  const mismatchedExport = structuredClone(matchingExport);
  mismatchedExport.requestContext.requestId = "2026-04-24-wrong-request-id";

  const mismatchedExportPath = path.join(
    artifactDir,
    "theme-recovery-review-export-mismatched.json",
  );

  await writeFile(
    mismatchedExportPath,
    `${JSON.stringify(mismatchedExport, null, 2)}\n`,
    "utf8",
  );

  let failStdout = "";
  let failStderr = "";

  try {
    await execFileAsync(
      process.execPath,
      [
        path.join(
          projectRoot,
          "scripts",
          "preflight-theme-recovery-review-request.mjs",
        ),
        "--request-id",
        requestId,
        "--input",
        path.relative(projectRoot, mismatchedExportPath),
        "--request-root",
        path.relative(projectRoot, requestRoot),
        "--output",
        path.relative(projectRoot, failReportPath),
      ],
      { cwd: projectRoot },
    );
    throw new Error(
      "Theme recovery preflight unexpectedly accepted a mismatched request binding.",
    );
  } catch (error) {
    failStdout =
      typeof error === "object" && error !== null && "stdout" in error
        ? String(error.stdout)
        : "";
    failStderr =
      typeof error === "object" && error !== null && "stderr" in error
        ? String(error.stderr)
        : "";
  }

  const okReport = await readJson(okReportPath, "Theme recovery preflight OK report");
  const failReport = await readJson(
    failReportPath,
    "Theme recovery preflight failure report",
  );
  const postPreflightManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Theme recovery pending request manifest after preflight",
  );

  assert(okReport.ok === true, "Theme recovery matching export preflight should pass.");
  assert(
    okReport.requestBinding.requestId === requestId,
    "Theme recovery preflight OK report lost the request binding.",
  );
  assert(
    okResult.stdout.includes("eligible=yes"),
    "Theme recovery preflight OK stdout did not report eligibility.",
  );
  assert(
    failReport.ok === false,
    "Theme recovery mismatched export preflight should fail.",
  );
  assert(
    failReport.failures.some((failure) =>
      failure.includes("request binding did not match"),
    ),
    "Theme recovery preflight failure report did not explain the request-binding mismatch.",
  );
  assert(
    failStdout.includes("eligible=no"),
    "Theme recovery preflight failure stdout did not report ineligible status.",
  );
  assert(
    postPreflightManifest.status === "pending_operator_review",
    "Theme recovery preflight should not mutate the pending request state.",
  );

  const report = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    okReportPath: path.relative(projectRoot, okReportPath),
    failReportPath: path.relative(projectRoot, failReportPath),
    requestStatusAfterPreflight: postPreflightManifest.status,
    okChecks: okReport.checks.length,
    failChecks: failReport.checks.length,
    failStdout,
    failStderr,
  };
  const reportPath = path.join(artifactDir, "phase117-results.json");

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `phase117: preflight pass/fail proven for ${requestId} with status=${postPreflightManifest.status}`,
  );
  console.log(`phase117: saved machine-readable results to ${reportPath}`);
}

void runReview().catch((error) => {
  console.error("phase117: theme recovery request preflight review failed");
  console.error(error);
  process.exitCode = 1;
});
