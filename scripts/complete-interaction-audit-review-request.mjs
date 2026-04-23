import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditReviewArchiveId,
  writeInteractionAuditReviewArchive,
} from "./lib/interaction-audit-review-archive.mjs";
import { writeInteractionAuditReviewArchiveIndex } from "./lib/interaction-audit-review-archive-index.mjs";
import { resolveInteractionAuditReviewEvidence } from "./lib/interaction-audit-review-evidence.mjs";
import {
  buildInteractionAuditReviewExpectedShape,
  INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
  normalizeInteractionAuditReviewExpectedShape,
  updateInteractionAuditReviewRequest,
} from "./lib/interaction-audit-review-request.mjs";
import { buildInteractionAuditReviewRequestPreflight } from "./lib/interaction-audit-review-request-preflight.mjs";
import { writeInteractionAuditReviewRequestIndex } from "./lib/interaction-audit-review-request-index.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
);
const defaultArchiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_reviews",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    input: "",
    evidence: "",
    requestRoot: defaultRequestRoot,
    archiveRoot: defaultArchiveRoot,
    archiveId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

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

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
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

async function readJsonWithRaw(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return {
    raw,
    parsed,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.requestId.length > 0, "Pass `--request-id <pending-request-id>`.");
  assert(options.input.length > 0, "Pass `--input <path-to-signoff-export.json>`.");

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const archiveRoot = path.resolve(projectRoot, options.archiveRoot);
  const inputPath = path.resolve(projectRoot, options.input);
  const requestDir = path.join(requestRoot, options.requestId);
  const requestManifestPath = path.join(requestDir, "review-request.json");
  const requestTemplatePath = path.join(
    requestDir,
    "interaction-audit-signoff-template.json",
  );

  const requestManifest = await readJson(
    requestManifestPath,
    "Review request manifest",
  );
  const requestTemplate = await readJson(
    requestTemplatePath,
    "Review request template",
  );
  const signoffExportResult = await readJsonWithRaw(
    inputPath,
    "Completed signoff export",
  );
  const signoffExport = signoffExportResult.parsed;
  const evidenceResolution = await resolveInteractionAuditReviewEvidence({
    projectRoot,
    requestManifest,
    requestDir,
    evidence: options.evidence,
  });

  assert(
    Array.isArray(requestTemplate.surfaces),
    "Review request template did not contain a `surfaces` array.",
  );
  assert(
    Array.isArray(signoffExport.surfaces),
    "Completed signoff export did not contain a `surfaces` array.",
  );
  assert(evidenceResolution.ok, evidenceResolution.error);
  const expectedShape =
    requestManifest.expectedShape &&
    typeof requestManifest.expectedShape === "object"
      ? normalizeInteractionAuditReviewExpectedShape(requestManifest.expectedShape)
      : buildInteractionAuditReviewExpectedShape(requestTemplate);
  const sourceTemplateRelativePath =
    typeof requestManifest.sourceTemplate === "string"
      ? requestManifest.sourceTemplate.trim()
      : "";

  assert(
    sourceTemplateRelativePath.length > 0,
    "Review request manifest did not preserve a source template path.",
  );

  const sourceTemplatePath = path.resolve(projectRoot, sourceTemplateRelativePath);
  let currentSourceTemplate = null;
  let sourceTemplateReadError = "";

  try {
    const rawSourceTemplate = await readFile(sourceTemplatePath, "utf8");
    currentSourceTemplate = JSON.parse(rawSourceTemplate);
  } catch (error) {
    if (error instanceof SyntaxError) {
      sourceTemplateReadError =
        `Current source template \`${sourceTemplateRelativePath}\` was not valid JSON. Regenerate the pending request before completion.`;
    } else {
      sourceTemplateReadError =
        `Current source template \`${sourceTemplateRelativePath}\` could not be read. Regenerate the pending request before completion.`;
    }
  }

  if (
    currentSourceTemplate &&
    !Array.isArray(currentSourceTemplate?.surfaces)
  ) {
    sourceTemplateReadError =
      `Current source template \`${sourceTemplateRelativePath}\` did not contain a valid \`surfaces\` array. Regenerate the pending request before completion.`;
    currentSourceTemplate = null;
  }

  const preflight = buildInteractionAuditReviewRequestPreflight({
    requestManifest,
    requestTemplate,
    signoffExport,
    currentSourceTemplate,
    sourceTemplatePath: sourceTemplateRelativePath,
    sourceTemplateReadError,
    sourceEvidencePack: evidenceResolution,
  });

  assert(preflight.ok, preflight.failures[0] ?? "Review request preflight failed.");

  const fulfilledAt = new Date().toISOString();
  const archiveId = buildInteractionAuditReviewArchiveId({
    signoffExport,
    archiveId: options.archiveId,
    archivedAt: fulfilledAt,
  });
  const archiveResult = await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport,
    evidenceReport: evidenceResolution.evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, inputPath),
    sourceEvidencePack: evidenceResolution.selectedPath,
    evidenceContext: evidenceResolution,
    sourceRequest: {
      requestId: requestManifest.requestId,
      requestReadmePath: path.relative(projectRoot, path.join(requestDir, "README.md")),
      requestManifestPath: path.relative(projectRoot, requestManifestPath),
    },
    archiveRoot,
    archiveId,
    archivedAt: fulfilledAt,
  });
  const archiveReadmePath = path.join(archiveResult.archiveDir, "README.md");
  const archiveManifestPath = path.join(
    archiveResult.archiveDir,
    "review-archive.json",
  );

  await updateInteractionAuditReviewRequest({
    projectRoot,
    requestDir,
    requestId: requestManifest.requestId,
    createdAt: requestManifest.createdAt,
    signoffTemplate: requestTemplate,
    sourceTemplate: requestManifest.sourceTemplate,
    sourceEvidencePack: requestManifest.sourceEvidencePack,
    status: INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
    fulfillment: {
      fulfilledAt,
      sourceCompletedSignoffExport: path.relative(projectRoot, inputPath),
      archiveId,
      archiveReadmePath: path.relative(projectRoot, archiveReadmePath),
      archiveManifestPath: path.relative(projectRoot, archiveManifestPath),
      completedReviewSession: archiveResult.manifest.reviewSession,
      completedRequestContext: archiveResult.manifest.requestContext,
      completedEvidenceContext: archiveResult.manifest.evidenceContext,
      completedSignoffExportDigest: {
        sha256: createHash("sha256")
          .update(signoffExportResult.raw)
          .digest("hex"),
        sizeBytes: Buffer.byteLength(signoffExportResult.raw, "utf8"),
      },
      summary: archiveResult.manifest.summary,
    },
  });

  await writeInteractionAuditReviewArchiveIndex({
    projectRoot,
    archiveRoot,
    generatedAt: fulfilledAt,
    indexMarkdownPath: path.join(
      path.dirname(archiveRoot),
      "Interaction_Audit_Review_Archive.md",
    ),
    indexJsonPath: path.join(archiveRoot, "index.json"),
  });
  const requestIndexResult = await writeInteractionAuditReviewRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: fulfilledAt,
    indexMarkdownPath: path.join(
      path.dirname(requestRoot),
      "Interaction_Audit_Review_Requests.md",
    ),
    indexJsonPath: path.join(requestRoot, "index.json"),
  });

  console.log(
    `interaction-audit: request ${requestManifest.requestId} fulfilled by ${path.relative(projectRoot, archiveReadmePath)}`,
  );
  console.log(
    `interaction-audit: evidence=${evidenceResolution.source} path=${evidenceResolution.selectedPath}`,
  );
  console.log(
    `interaction-audit: ready=${archiveResult.manifest.summary.readyForSignoff ? "yes" : "no"} follow_up=${archiveResult.manifest.summary.followUpSurfaceCount} not_reviewed=${archiveResult.manifest.summary.notReviewedSurfaceCount} pending=${archiveResult.manifest.summary.pendingManualCheckCount} / ${archiveResult.manifest.summary.totalManualCheckCount}`,
  );
  console.log(
    `interaction-audit: request index refreshed pending=${requestIndexResult.pendingRequestCount} fulfilled=${requestIndexResult.fulfilledRequestCount}`,
  );
}

void run().catch((error) => {
  console.error("interaction-audit: failed to fulfill review request");
  console.error(error);
  process.exitCode = 1;
});
