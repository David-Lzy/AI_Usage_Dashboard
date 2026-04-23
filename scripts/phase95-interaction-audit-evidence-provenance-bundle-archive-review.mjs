import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { writeInteractionAuditReviewArchive } from "./lib/interaction-audit-review-archive.mjs";
import { writeInteractionAuditReviewArchiveIndex } from "./lib/interaction-audit-review-archive-index.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase95-interaction-audit-evidence-provenance-bundle-archive-review",
);
const inputPath = path.join(artifactDir, "evidence-provenance-signoff-export.json");
const evidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);
const bundleDir = path.join(artifactDir, "generated-bundle");

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

  const signoffExport = {
    metadata: {
      reviewerName: "Operator Example",
      sessionLabel: "Evidence Provenance Pass",
      reviewedAt: "2026-04-24T13:10:00.000Z",
    },
    requestContext: {
      requestId: "2026-04-24-evidence-provenance-review-request",
      requestCreatedAt: "2026-04-24T12:50:00.000Z",
      requestRevisionSha256:
        "7f95b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    },
    surfaces: [
      {
        id: "dashboard-360",
        title: "Dashboard",
        description: "Compact dashboard frame.",
        signoffStatus: "pass",
        operatorNotes: "Looks stable.",
        manualChecks: [
          { label: "Confirm focus visibility.", completed: true },
          { label: "Confirm density.", completed: true },
        ],
      },
      {
        id: "settings-420",
        title: "Settings",
        description: "Compact settings frame.",
        signoffStatus: "follow_up",
        operatorNotes: "Need one more readability pass.",
        manualChecks: [
          { label: "Confirm diagnostics readability.", completed: true },
          { label: "Confirm no overflow.", completed: false },
        ],
      },
    ],
  };

  await writeFile(inputPath, JSON.stringify(signoffExport, null, 2), "utf8");

  await execFileAsync(
    process.execPath,
    [
      "./scripts/build-interaction-audit-handoff-bundle.mjs",
      "--input",
      path.relative(projectRoot, inputPath),
      "--output-dir",
      path.relative(projectRoot, bundleDir),
    ],
    { cwd: projectRoot },
  );

  const evidenceReport = await readJson(evidencePath, "Evidence report");
  const bundleJsonPath = path.join(bundleDir, "interaction-audit-handoff-bundle.json");
  const bundleMarkdownPath = path.join(bundleDir, "interaction-audit-handoff-bundle.md");
  const bundleJson = await readJson(bundleJsonPath, "Bundle JSON");
  const bundleMarkdown = await readFile(bundleMarkdownPath, "utf8");

  assert(
    bundleJson.evidenceContext?.source === "bundle_input",
    "Bundle JSON did not record the bundle evidence source.",
  );
  assert(
    bundleJson.evidenceContext?.sourceLabel === "Bundle evidence input",
    "Bundle JSON did not record the bundle evidence source label.",
  );
  assert(
    bundleJson.evidenceContext?.selectedPath === path.relative(projectRoot, evidencePath),
    "Bundle JSON did not preserve the evidence input path.",
  );
  assert(
    bundleJson.evidenceContext?.evidenceItemCount === evidenceReport.evidenceItems.length,
    "Bundle JSON did not preserve the evidence item count.",
  );
  assert(
    bundleMarkdown.includes("Evidence source: Bundle evidence input"),
    "Bundle markdown did not preserve the evidence source label.",
  );
  assert(
    bundleMarkdown.includes("Evidence integrity: not applicable"),
    "Bundle markdown did not preserve the evidence integrity state.",
  );

  const rawEvidence = await readFile(evidencePath, "utf8");
  const evidenceSha256 = createHash("sha256").update(rawEvidence).digest("hex");
  const evidenceSizeBytes = Buffer.byteLength(rawEvidence, "utf8");
  const archiveRoot = path.join(artifactDir, "archives");
  const archiveId = "2026-04-24-evidence-provenance-archive-pass";
  const archivedAt = "2026-04-24T13:20:00.000Z";
  const archiveResult = await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport,
    evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, inputPath),
    sourceEvidencePack:
      "Doc/testing/operator_review_requests/2026-04-24-evidence-provenance-review-request/interaction-audit-evidence-pack.json",
    evidenceContext: {
      source: "request_snapshot",
      sourceLabel: "Request evidence snapshot",
      selectedPath:
        "Doc/testing/operator_review_requests/2026-04-24-evidence-provenance-review-request/interaction-audit-evidence-pack.json",
      requestPath: path.relative(projectRoot, evidencePath),
      snapshotPath:
        "Doc/testing/operator_review_requests/2026-04-24-evidence-provenance-review-request/interaction-audit-evidence-pack.json",
      evidenceItemCount: evidenceReport.evidenceItems.length,
      integrityOk: true,
      integrityState: "verified",
      expectedSha256: evidenceSha256,
      actualSha256: evidenceSha256,
      expectedSizeBytes: evidenceSizeBytes,
      actualSizeBytes: evidenceSizeBytes,
    },
    sourceRequest: {
      requestId: "2026-04-24-evidence-provenance-review-request",
      requestReadmePath:
        "Doc/testing/operator_review_requests/2026-04-24-evidence-provenance-review-request/README.md",
      requestManifestPath:
        "Doc/testing/operator_review_requests/2026-04-24-evidence-provenance-review-request/review-request.json",
    },
    archiveRoot,
    archiveId,
    archivedAt,
  });

  const archiveManifestPath = path.join(archiveResult.archiveDir, "review-archive.json");
  const archiveReadmePath = path.join(archiveResult.archiveDir, "README.md");
  const archiveManifest = await readJson(archiveManifestPath, "Archive manifest");
  const archiveReadme = await readFile(archiveReadmePath, "utf8");

  assert(
    archiveManifest.evidenceContext?.source === "request_snapshot",
    "Archive manifest did not preserve the evidence source.",
  );
  assert(
    archiveManifest.evidenceContext?.integrityState === "verified",
    "Archive manifest did not preserve the evidence integrity state.",
  );
  assert(
    archiveReadme.includes("- Evidence source: Request evidence snapshot"),
    "Archive README did not preserve the evidence source label.",
  );
  assert(
    archiveReadme.includes(`- Evidence integrity: verified sha256:${evidenceSha256} (${evidenceSizeBytes} bytes)`),
    "Archive README did not preserve the evidence integrity summary.",
  );

  const archiveIndexMarkdownPath = path.join(
    artifactDir,
    "Interaction_Audit_Review_Archive.md",
  );
  const archiveIndexJsonPath = path.join(archiveRoot, "index.json");

  await writeInteractionAuditReviewArchiveIndex({
    projectRoot,
    archiveRoot,
    generatedAt: archivedAt,
    indexMarkdownPath: archiveIndexMarkdownPath,
    indexJsonPath: archiveIndexJsonPath,
  });

  const archiveIndexMarkdown = await readFile(archiveIndexMarkdownPath, "utf8");
  const archiveIndexJson = await readJson(archiveIndexJsonPath, "Archive index JSON");

  assert(
    archiveIndexMarkdown.includes("evidence source: `Request evidence snapshot`"),
    "Archive index markdown did not preserve the evidence source label.",
  );
  assert(
    archiveIndexMarkdown.includes("evidence integrity: `verified`"),
    "Archive index markdown did not preserve the evidence integrity state.",
  );
  assert(
    archiveIndexJson.records[0]?.evidenceContext?.expectedSha256 === evidenceSha256,
    "Archive index JSON did not preserve the evidence digest.",
  );

  const report = {
    bundleJson: path.relative(projectRoot, bundleJsonPath),
    bundleMarkdown: path.relative(projectRoot, bundleMarkdownPath),
    archiveManifest: path.relative(projectRoot, archiveManifestPath),
    archiveReadme: path.relative(projectRoot, archiveReadmePath),
    archiveIndexMarkdown: path.relative(projectRoot, archiveIndexMarkdownPath),
    archiveIndexJson: path.relative(projectRoot, archiveIndexJsonPath),
    evidenceSha256,
    evidenceSizeBytes,
  };
  const reportPath = path.join(artifactDir, "phase95-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`phase95: saved artifacts under ${artifactDir}`);
  console.log(`phase95: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase95: evidence source preserved through bundle and archive with sha256=${evidenceSha256}`,
  );
}

void runReview().catch((error) => {
  console.error(
    "phase95: interaction audit evidence-provenance bundle/archive review failed",
  );
  console.error(error);
  process.exitCode = 1;
});
