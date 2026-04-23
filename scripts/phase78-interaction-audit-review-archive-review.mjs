import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditReviewArchiveId,
  writeInteractionAuditReviewArchive,
} from "./lib/interaction-audit-review-archive.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase78-interaction-audit-review-archive-review",
);
const fixturePath = path.join(
  projectRoot,
  "fixtures",
  "interaction-audit",
  "codex-seeded-review-archive-baseline.fixture.json",
);
const evidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
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

  const signoffExport = await readJson(fixturePath, "Seeded signoff fixture");
  const evidenceReport = await readJson(evidencePath, "Phase 69 evidence report");
  const archivedAt = new Date().toISOString();
  const archiveId = buildInteractionAuditReviewArchiveId({
    signoffExport,
    archivedAt,
  });
  const archiveRoot = path.join(artifactDir, "archives");

  const result = await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport,
    evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, fixturePath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    archiveRoot,
    archiveId,
    archivedAt,
  });

  const archiveReadmePath = path.join(result.archiveDir, "README.md");
  const archiveManifestPath = path.join(result.archiveDir, "review-archive.json");
  const signoffCopyPath = path.join(
    result.archiveDir,
    "interaction-audit-signoff-export.json",
  );
  const bundleJsonPath = path.join(
    result.archiveDir,
    "interaction-audit-handoff-bundle.json",
  );
  const readme = await readFile(archiveReadmePath, "utf8");
  const manifest = await readJson(archiveManifestPath, "Archive manifest");
  const signoffCopy = await readJson(signoffCopyPath, "Archived signoff export");
  const bundleJson = await readJson(bundleJsonPath, "Archived handoff bundle");

  assert(
    manifest.archiveId === archiveId,
    "Archive manifest did not preserve the expected archive id.",
  );
  assert(
    manifest.seeded === true,
    "Archive manifest did not mark the seeded review session.",
  );
  assert(
    manifest.reviewSession.sessionLabel ===
      "codex seeded review archive baseline",
    "Archive manifest lost the review-session label.",
  );
  assert(
    signoffCopy.metadata.reviewerName === "Codex seeded review",
    "Archived signoff export lost reviewer metadata.",
  );
  assert(
    bundleJson.summary.readyForSignoff === false,
    "Seeded archive unexpectedly claimed ready-for-signoff.",
  );
  assert(
    bundleJson.summary.followUpSurfaceCount === 1,
    "Seeded archive follow-up count was incorrect.",
  );
  assert(
    readme.includes("seeded internal baseline"),
    "Archive README did not explain that the archive is seeded.",
  );

  const report = {
    archiveId,
    archiveDir: path.relative(projectRoot, result.archiveDir),
    sourceFixture: path.relative(projectRoot, fixturePath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    seeded: manifest.seeded,
    readyForSignoff: bundleJson.summary.readyForSignoff,
    followUpSurfaceCount: bundleJson.summary.followUpSurfaceCount,
    notReviewedSurfaceCount: bundleJson.summary.notReviewedSurfaceCount,
    pendingManualCheckCount: bundleJson.summary.pendingManualCheckCount,
  };
  const reportPath = path.join(artifactDir, "phase78-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`phase78: archive written to ${result.archiveDirRelative}`);
  console.log(`phase78: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase78: seeded=${manifest.seeded ? "yes" : "no"} ready=${bundleJson.summary.readyForSignoff ? "yes" : "no"} follow_up=${bundleJson.summary.followUpSurfaceCount}`,
  );
}

void runReview().catch((error) => {
  console.error("phase78: interaction audit review archive review failed");
  console.error(error);
  process.exitCode = 1;
});
