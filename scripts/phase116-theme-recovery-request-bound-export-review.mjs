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
  "phase116-theme-recovery-request-bound-export-review",
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
  const archiveRoot = path.join(artifactDir, "theme_recovery_reviews");
  const requestId = "2026-04-24-theme-recovery-request-bound-export-review";

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
  const mismatchedExport = await readJson(
    seedReviewExportPath,
    "Theme recovery seeded reference export",
  );

  mismatchedExport.generatedAt = "2026-04-24T09:45:00.000Z";
  mismatchedExport.requestContext = {
    requestId: "2026-04-24-wrong-request-id",
    requestCreatedAt: requestManifest.createdAt,
    requestBoundWorkspaceRoute:
      "http://127.0.0.1:4173/src/sidepanel/index.html?themeRecoveryRequestId=2026-04-24-wrong-request-id#debug-theme-recovery-review",
  };

  const mismatchedExportPath = path.join(
    artifactDir,
    "theme-recovery-review-export-mismatched.json",
  );

  await writeFile(
    mismatchedExportPath,
    `${JSON.stringify(mismatchedExport, null, 2)}\n`,
    "utf8",
  );

  let mismatchError = "";

  try {
    await execFileAsync(
      process.execPath,
      [
        path.join(
          projectRoot,
          "scripts",
          "complete-theme-recovery-review-request.mjs",
        ),
        "--request-id",
        requestId,
        "--input",
        path.relative(projectRoot, mismatchedExportPath),
        "--request-root",
        path.relative(projectRoot, requestRoot),
        "--archive-root",
        path.relative(projectRoot, archiveRoot),
      ],
      { cwd: projectRoot },
    );
    throw new Error(
      "Theme recovery complete-review-request unexpectedly accepted a mismatched request binding.",
    );
  } catch (error) {
    const stderr =
      typeof error === "object" &&
      error !== null &&
      "stderr" in error &&
      typeof error.stderr === "string"
        ? error.stderr
        : String(error);

    mismatchError = stderr;
  }

  const postFailureManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Theme recovery pending request manifest after mismatch",
  );

  assert(
    mismatchError.includes(
      "request binding did not match the target pending request",
    ) ||
      mismatchError.includes("did not match the pending request id"),
    "Theme recovery mismatch rejection did not explain the request-id binding failure.",
  );
  assert(
    postFailureManifest.status === "pending_operator_review",
    "Theme recovery mismatched export should not mutate the pending request state.",
  );

  const report = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    mismatchedRequestId: mismatchedExport.requestContext.requestId,
    requestStatusAfterFailure: postFailureManifest.status,
    mismatchError,
  };
  const reportPath = path.join(artifactDir, "phase116-results.json");

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `phase116: mismatch rejected for ${requestId} with status=${postFailureManifest.status}`,
  );
  console.log(`phase116: saved machine-readable results to ${reportPath}`);
}

void runReview().catch((error) => {
  console.error("phase116: theme recovery request-bound export review failed");
  console.error(error);
  process.exitCode = 1;
});
