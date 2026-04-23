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
  "phase115-theme-recovery-review-request-completion-review",
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
  const requestIndexMarkdownPath = path.join(
    artifactDir,
    "Theme_Recovery_Review_Requests.md",
  );
  const requestIndexJsonPath = path.join(requestRoot, "index.json");
  const archiveIndexMarkdownPath = path.join(
    artifactDir,
    "Theme_Recovery_Review_Archive.md",
  );
  const archiveIndexJsonPath = path.join(archiveRoot, "index.json");
  const requestId = "2026-04-24-theme-recovery-request-completion-review";
  const archiveId = "2026-04-24-theme-recovery-request-completion-archive";

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
  const createdRequestManifest = await readJson(
    path.join(requestRoot, requestId, "review-request.json"),
    "Theme recovery pending request manifest",
  );

  const syntheticExport = await readJson(
    seedReviewExportPath,
    "Theme recovery seeded reference export",
  );
  syntheticExport.requestContext = {
    requestId,
    requestCreatedAt: createdRequestManifest.createdAt,
    requestBoundWorkspaceRoute:
      createdRequestManifest.requestContext.requestBoundWorkspaceRoute,
  };
  syntheticExport.generatedAt = "2026-04-24T08:30:00.000Z";
  const syntheticExportPath = path.join(
    artifactDir,
    "theme-recovery-review-export.json",
  );

  await writeFile(
    syntheticExportPath,
    `${JSON.stringify(syntheticExport, null, 2)}\n`,
    "utf8",
  );

  const completeResult = await execFileAsync(
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
      path.relative(projectRoot, syntheticExportPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--archive-root",
      path.relative(projectRoot, archiveRoot),
      "--archive-id",
      archiveId,
    ],
    { cwd: projectRoot },
  );

  const requestDir = path.join(requestRoot, requestId);
  const requestManifest = await readJson(
    path.join(requestDir, "review-request.json"),
    "Theme recovery fulfilled request manifest",
  );
  const requestReadme = await readFile(path.join(requestDir, "README.md"), "utf8");
  const archiveDir = path.join(archiveRoot, archiveId);
  const archiveManifest = await readJson(
    path.join(archiveDir, "review-archive.json"),
    "Theme recovery archive manifest",
  );
  const requestIndexMarkdown = await readFile(requestIndexMarkdownPath, "utf8");
  const requestIndexJson = await readJson(
    requestIndexJsonPath,
    "Theme recovery request index JSON",
  );
  const archiveIndexMarkdown = await readFile(archiveIndexMarkdownPath, "utf8");
  const archiveIndexJson = await readJson(
    archiveIndexJsonPath,
    "Theme recovery archive index JSON",
  );

  assert(
    requestManifest.status === "fulfilled_review_archived",
    "Theme recovery request completion did not mark the request fulfilled.",
  );
  assert(
    requestManifest.requestContext?.requestId === requestId,
    "Theme recovery request manifest lost the request binding.",
  );
  assert(
    requestManifest.fulfillment?.archiveId === archiveId,
    "Theme recovery request manifest lost the archive id.",
  );
  assert(
    requestManifest.fulfillment?.completedStageSummary?.overallLabel ===
      "Needs access",
    "Theme recovery request manifest rewrote the exported stage.",
  );
  assert(
    requestManifest.fulfillment?.completedReviewExportDigest?.sha256,
    "Theme recovery request manifest did not preserve the export digest.",
  );
  assert(
    requestReadme.includes("Fulfillment receipt:"),
    "Theme recovery fulfilled request README did not include the fulfillment receipt.",
  );
  assert(
    archiveManifest.seeded === false,
    "Theme recovery completion archive was incorrectly marked seeded.",
  );
  assert(
    archiveManifest.sourceRequest?.requestId === requestId,
    "Theme recovery archive manifest lost the source request link.",
  );
  assert(
    archiveManifest.summary.overallLabel === "Needs access",
    "Theme recovery archive manifest rewrote the exported stage.",
  );
  assert(
    requestIndexJson.pendingRequestCount === 0 &&
      requestIndexJson.fulfilledRequestCount === 1,
    "Theme recovery request index JSON counts were incorrect after completion.",
  );
  assert(
    requestIndexMarkdown.includes("fulfilled_review_archived"),
    "Theme recovery request index markdown did not show the fulfilled status.",
  );
  assert(
    requestIndexMarkdown.includes(archiveId),
    "Theme recovery request index markdown did not preserve the archive link.",
  );
  assert(
    archiveIndexJson.seededRecordCount === 0 &&
      archiveIndexJson.operatorRecordCount === 1,
    "Theme recovery archive index JSON counts were incorrect for completion review.",
  );
  assert(
    archiveIndexMarkdown.includes(`source request: \`${requestId}\``),
    "Theme recovery archive index markdown did not preserve the source request line.",
  );
  assert(
    completeResult.stdout.includes("pending=0 fulfilled=1"),
    "Theme recovery complete-review-request stdout was incorrect for request counts.",
  );
  assert(
    completeResult.stdout.includes("seeded=0 operator=1"),
    "Theme recovery complete-review-request stdout was incorrect for archive counts.",
  );

  const report = {
    requestId,
    archiveId,
    requestDir: path.relative(projectRoot, requestDir),
    archiveDir: path.relative(projectRoot, archiveDir),
    status: requestManifest.status,
    overallLabel: requestManifest.fulfillment.completedStageSummary.overallLabel,
    popupSnapshotLabel:
      requestManifest.fulfillment.completedStageSummary.popupSnapshotLabel,
    requestIndexMarkdownPath: path.relative(projectRoot, requestIndexMarkdownPath),
    requestIndexJsonPath: path.relative(projectRoot, requestIndexJsonPath),
    archiveIndexMarkdownPath: path.relative(projectRoot, archiveIndexMarkdownPath),
    archiveIndexJsonPath: path.relative(projectRoot, archiveIndexJsonPath),
  };
  const reportPath = path.join(artifactDir, "phase115-results.json");

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `phase115: fulfilled request written to ${path.relative(projectRoot, requestDir)}`,
  );
  console.log(
    `phase115: archive written to ${path.relative(projectRoot, archiveDir)}`,
  );
  console.log(`phase115: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase115: status=${requestManifest.status} pending=${requestIndexJson.pendingRequestCount} fulfilled=${requestIndexJson.fulfilledRequestCount} operator=${archiveIndexJson.operatorRecordCount}`,
  );
}

void runReview().catch((error) => {
  console.error("phase115: theme recovery request completion review failed");
  console.error(error);
  process.exitCode = 1;
});
