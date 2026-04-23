import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditReviewArchiveId,
  writeInteractionAuditReviewArchive,
} from "./lib/interaction-audit-review-archive.mjs";
import { writeInteractionAuditReviewArchiveIndex } from "./lib/interaction-audit-review-archive-index.mjs";

const projectRoot = process.cwd();
const defaultEvidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);
const defaultArchiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_reviews",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Interaction_Audit_Review_Archive.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_reviews",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    input: "",
    evidence: defaultEvidencePath,
    archiveRoot: defaultArchiveRoot,
    archiveId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--input") {
      options.input = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--evidence") {
      options.evidence = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--archive-root") {
      options.archiveRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--archive-id") {
      options.archiveId = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return options;
}

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

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.input.length > 0, "Pass `--input <path-to-signoff-export.json>`.");

  const inputPath = path.resolve(projectRoot, options.input);
  const evidencePath = path.resolve(projectRoot, options.evidence);
  const archiveRoot = path.resolve(projectRoot, options.archiveRoot);
  const signoffExport = await readJson(inputPath, "Signoff export");
  const evidenceReport = await readJson(evidencePath, "Evidence report");

  assert(
    Array.isArray(signoffExport.surfaces),
    "Signoff export did not contain a `surfaces` array.",
  );
  assert(
    Array.isArray(evidenceReport.evidenceItems),
    "Evidence report did not contain an `evidenceItems` array.",
  );

  const archivedAt = new Date().toISOString();
  const archiveId = buildInteractionAuditReviewArchiveId({
    signoffExport,
    archiveId: options.archiveId,
    archivedAt,
  });

  const result = await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport,
    evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, inputPath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    archiveRoot,
    archiveId,
    archivedAt,
  });
  const shouldRefreshDefaultIndex = archiveRoot === defaultArchiveRoot;

  if (shouldRefreshDefaultIndex) {
    await writeInteractionAuditReviewArchiveIndex({
      projectRoot,
      archiveRoot,
      generatedAt: archivedAt,
      indexMarkdownPath: defaultIndexMarkdownPath,
      indexJsonPath: defaultIndexJsonPath,
    });
  }

  console.log(
    `interaction-audit: archive written to ${result.archiveDirRelative}`,
  );
  console.log(
    `interaction-audit: ready=${result.manifest.summary.readyForSignoff ? "yes" : "no"} follow_up=${result.manifest.summary.followUpSurfaceCount} not_reviewed=${result.manifest.summary.notReviewedSurfaceCount} pending=${result.manifest.summary.pendingManualCheckCount} / ${result.manifest.summary.totalManualCheckCount}`,
  );
  if (shouldRefreshDefaultIndex) {
    console.log("interaction-audit: default archive index refreshed");
  }
}

void run().catch((error) => {
  console.error("interaction-audit: failed to archive review session");
  console.error(error);
  process.exitCode = 1;
});
