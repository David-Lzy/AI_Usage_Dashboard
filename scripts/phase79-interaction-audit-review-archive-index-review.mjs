import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { writeInteractionAuditReviewArchive } from "./lib/interaction-audit-review-archive.mjs";
import { writeInteractionAuditReviewArchiveIndex } from "./lib/interaction-audit-review-archive-index.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase79-interaction-audit-review-archive-index-review",
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

  const seededSignoffExport = await readJson(fixturePath, "Seeded signoff fixture");
  const evidenceReport = await readJson(evidencePath, "Phase 69 evidence report");
  const operatorSignoffExport = structuredClone(seededSignoffExport);

  operatorSignoffExport.metadata.reviewerName = "Operator Example";
  operatorSignoffExport.metadata.sessionLabel = "operator compact interaction pass";
  operatorSignoffExport.metadata.reviewedAt = "2026-04-24T09:30:00.000Z";
  operatorSignoffExport.surfaces[0].signoffStatus = "pass";
  operatorSignoffExport.surfaces[1].signoffStatus = "pass";
  operatorSignoffExport.surfaces[1].manualChecks[2].completed = true;
  operatorSignoffExport.surfaces[3].signoffStatus = "follow_up";
  operatorSignoffExport.summary.reviewedSurfaceCount = 4;
  operatorSignoffExport.summary.passSurfaceCount = 3;
  operatorSignoffExport.summary.followUpSurfaceCount = 1;
  operatorSignoffExport.summary.completedManualCheckCount = 7;

  const archiveRoot = path.join(artifactDir, "archives");
  const indexMarkdownPath = path.join(artifactDir, "Interaction_Audit_Review_Archive.md");
  const indexJsonPath = path.join(artifactDir, "operator_reviews.index.json");

  await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport: seededSignoffExport,
    evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, fixturePath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    archiveRoot,
    archiveId: "2026-04-23-codex-seeded-review-archive-baseline",
    archivedAt: "2026-04-23T10:00:00.000Z",
  });

  await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport: operatorSignoffExport,
    evidenceReport,
    sourceSignoffExport: "tmp/operator-signoff-export.json",
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    archiveRoot,
    archiveId: "2026-04-24-operator-compact-interaction-pass",
    archivedAt: "2026-04-24T09:35:00.000Z",
  });

  const indexResult = await writeInteractionAuditReviewArchiveIndex({
    projectRoot,
    archiveRoot,
    generatedAt: "2026-04-24T09:40:00.000Z",
    indexMarkdownPath,
    indexJsonPath,
  });
  const indexMarkdown = await readFile(indexMarkdownPath, "utf8");
  const indexJson = await readJson(indexJsonPath, "Archive index json");

  assert(indexResult.recordCount === 2, "Archive index record count was incorrect.");
  assert(indexResult.seededRecordCount === 1, "Seeded archive count was incorrect.");
  assert(indexResult.operatorRecordCount === 1, "Operator archive count was incorrect.");
  assert(
    indexMarkdown.includes("## Seeded Baselines"),
    "Archive index markdown was missing the seeded section.",
  );
  assert(
    indexMarkdown.includes("## Operator Review Sessions"),
    "Archive index markdown was missing the operator section.",
  );
  assert(
    indexMarkdown.includes("2026-04-23-codex-seeded-review-archive-baseline"),
    "Archive index markdown was missing the seeded archive entry.",
  );
  assert(
    indexMarkdown.includes("2026-04-24-operator-compact-interaction-pass"),
    "Archive index markdown was missing the operator archive entry.",
  );
  assert(
    indexMarkdown.includes("seeded internal baselines"),
    "Archive index markdown was missing the seeded truth rule.",
  );
  assert(
    Array.isArray(indexJson.records) && indexJson.records.length === 2,
    "Archive index JSON did not preserve both records.",
  );
  assert(
    indexJson.records[0].archiveId === "2026-04-24-operator-compact-interaction-pass",
    "Archive index JSON did not sort the newer operator record first.",
  );

  const report = {
    generatedAt: indexResult.generatedAt,
    recordCount: indexResult.recordCount,
    seededRecordCount: indexResult.seededRecordCount,
    operatorRecordCount: indexResult.operatorRecordCount,
    firstRecordArchiveId: indexJson.records[0].archiveId,
    seededArchiveId: indexJson.records.find((record) => record.seeded)?.archiveId ?? "",
    operatorArchiveId:
      indexJson.records.find((record) => !record.seeded)?.archiveId ?? "",
    indexMarkdownPath: path.relative(projectRoot, indexMarkdownPath),
    indexJsonPath: path.relative(projectRoot, indexJsonPath),
  };
  const reportPath = path.join(artifactDir, "phase79-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`phase79: archive index written to ${path.relative(projectRoot, indexMarkdownPath)}`);
  console.log(`phase79: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase79: seeded=${indexResult.seededRecordCount} operator=${indexResult.operatorRecordCount} total=${indexResult.recordCount}`,
  );
}

void runReview().catch((error) => {
  console.error("phase79: interaction audit review archive index review failed");
  console.error(error);
  process.exitCode = 1;
});
