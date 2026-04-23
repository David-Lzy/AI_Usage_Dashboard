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
  "phase114-theme-recovery-review-request-review",
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
  const indexMarkdownPath = path.join(
    artifactDir,
    "Theme_Recovery_Review_Requests.md",
  );
  const indexJsonPath = path.join(requestRoot, "index.json");
  const requestId = "2026-04-24-first-real-theme-recovery-review-request";

  const createResult = await execFileAsync(
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
  const indexResult = await execFileAsync(
    process.execPath,
    [
      path.join(
        projectRoot,
        "scripts",
        "build-theme-recovery-review-request-index.mjs",
      ),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--index-markdown",
      path.relative(projectRoot, indexMarkdownPath),
      "--index-json",
      path.relative(projectRoot, indexJsonPath),
    ],
    { cwd: projectRoot },
  );

  const requestDir = path.join(requestRoot, requestId);
  const manifest = await readJson(
    path.join(requestDir, "review-request.json"),
    "Theme recovery review request manifest",
  );
  const requestReadme = await readFile(path.join(requestDir, "README.md"), "utf8");
  const copiedTemplate = await readJson(
    path.join(requestDir, "theme-recovery-review-template.json"),
    "Theme recovery request template copy",
  );
  const copiedSeedReference = await readJson(
    path.join(requestDir, "theme-recovery-seeded-reference.json"),
    "Theme recovery request seed reference copy",
  );
  const indexMarkdown = await readFile(indexMarkdownPath, "utf8");
  const indexJson = await readJson(
    indexJsonPath,
    "Theme recovery review request index JSON",
  );

  assert(
    manifest.status === "pending_operator_review",
    "Theme recovery request manifest did not preserve pending status.",
  );
  assert(
    manifest.workspaceRoute ===
      "http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review",
    "Theme recovery request manifest lost the workspace route.",
  );
  assert(
    manifest.requestContext?.requestId === requestId,
    "Theme recovery request manifest lost the request binding.",
  );
  assert(
    String(manifest.requestContext?.requestBoundWorkspaceRoute ?? "").includes(
      `themeRecoveryRequestId=${requestId}`,
    ),
    "Theme recovery request manifest lost the request-bound workspace route.",
  );
  assert(
    manifest.sourceSeedArchiveReadme ===
      "Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md",
    "Theme recovery request manifest lost the seeded archive readme path.",
  );
  assert(
    manifest.sourceSeedReviewExport ===
      "Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/theme-recovery-review-export.json",
    "Theme recovery request manifest lost the seeded export path.",
  );
  assert(
    manifest.seedReferenceSummary.overallLabel === "Needs access",
    "Theme recovery request manifest lost the seeded stage summary.",
  );
  assert(
    copiedTemplate.expectedCustomSeedHex === "#4F46E5",
    "Theme recovery request template copy lost the expected seed.",
  );
  assert(
    copiedSeedReference.overallLabel === "Needs access" &&
      copiedSeedReference.popupSnapshotLabel === "Mixed state",
    "Theme recovery request seed reference copy lost the seeded degraded state.",
  );
  assert(
    requestReadme.includes("does not claim that a human review has already happened"),
    "Theme recovery request README did not preserve the honesty note.",
  );
  assert(
    requestReadme.includes(
      `npm run theme-recovery:complete-review-request -- --request-id ${requestId} --input tmp/theme-recovery-review-export.json`,
    ),
    "Theme recovery request README did not include the completion command.",
  );
  assert(
    requestReadme.includes("Current seeded reference truth:"),
    "Theme recovery request README did not preserve the seeded reference section.",
  );
  assert(
    requestReadme.includes("Request-bound workspace route:"),
    "Theme recovery request README did not preserve the request-bound workspace route section.",
  );
  assert(
    indexMarkdown.includes("## Pending Requests"),
    "Theme recovery request index markdown was missing the pending section.",
  );
  assert(
    indexMarkdown.includes(requestId),
    "Theme recovery request index markdown was missing the request entry.",
  );
  assert(
    indexMarkdown.includes("## Fulfilled Requests"),
    "Theme recovery request index markdown was missing the fulfilled section.",
  );
  assert(
    indexMarkdown.includes("no fulfilled theme-recovery review requests are recorded yet"),
    "Theme recovery request index markdown lost the honest fulfilled placeholder.",
  );
  assert(
    indexJson.pendingRequestCount === 1,
    "Theme recovery request index JSON had the wrong pending count.",
  );
  assert(
    indexJson.fulfilledRequestCount === 0,
    "Theme recovery request index JSON unexpectedly claimed a fulfilled request.",
  );
  assert(
    Array.isArray(indexJson.records) &&
      indexJson.records[0]?.requestId === requestId,
    "Theme recovery request index JSON did not preserve the created request.",
  );
  assert(
    createResult.stdout.includes("pending=1 fulfilled=0"),
    "Theme recovery create-request command stdout was incorrect.",
  );
  assert(
    indexResult.stdout.includes("pending=1 fulfilled=0 total=1"),
    "Theme recovery refresh-request-index command stdout was incorrect.",
  );

  const report = {
    requestId,
    requestDir: path.relative(projectRoot, requestDir),
    status: manifest.status,
    workspaceRoute: manifest.workspaceRoute,
    seedReferenceStage: manifest.seedReferenceSummary.overallLabel,
    seedReferencePopup: manifest.seedReferenceSummary.popupSnapshotLabel,
    indexMarkdownPath: path.relative(projectRoot, indexMarkdownPath),
    indexJsonPath: path.relative(projectRoot, indexJsonPath),
  };
  const reportPath = path.join(artifactDir, "phase114-results.json");

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`phase114: request written to ${path.relative(projectRoot, requestDir)}`);
  console.log(`phase114: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase114: status=${manifest.status} pending=${indexJson.pendingRequestCount} fulfilled=${indexJson.fulfilledRequestCount}`,
  );
}

void runReview().catch((error) => {
  console.error("phase114: theme recovery review request review failed");
  console.error(error);
  process.exitCode = 1;
});
