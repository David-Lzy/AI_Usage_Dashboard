import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { resolveInteractionAuditReviewEvidence } from "./lib/interaction-audit-review-evidence.mjs";
import {
  buildInteractionAuditReviewRegeneratedRequestId,
  buildInteractionAuditReviewTemplateDriftError,
  INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS,
  updateInteractionAuditReviewRequest,
  writeInteractionAuditReviewRequest,
} from "./lib/interaction-audit-review-request.mjs";
import { writeInteractionAuditReviewRequestIndex } from "./lib/interaction-audit-review-request-index.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    replacementRequestId: "",
    requestRoot: defaultRequestRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--replacement-request-id") {
      options.replacementRequestId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
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

  assert(options.requestId.length > 0, "Pass `--request-id <pending-request-id>`.");

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
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

  assert(
    requestManifest.status === INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
    `Review request must be \`${INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS}\` before regeneration.`,
  );

  const sourceTemplateRelativePath =
    typeof requestManifest.sourceTemplate === "string"
      ? requestManifest.sourceTemplate.trim()
      : "";

  assert(
    sourceTemplateRelativePath.length > 0,
    "Review request manifest did not preserve a source template path.",
  );

  const sourceTemplatePath = path.resolve(projectRoot, sourceTemplateRelativePath);
  const currentSourceTemplate = await readJson(
    sourceTemplatePath,
    "Current source template",
  );

  assert(
    Array.isArray(currentSourceTemplate.surfaces),
    "Current source template did not contain a valid `surfaces` array.",
  );

  const templateDriftError = buildInteractionAuditReviewTemplateDriftError({
    expectedShape: requestManifest.expectedShape,
    currentTemplate: currentSourceTemplate,
  });
  const evidenceResolution = await resolveInteractionAuditReviewEvidence({
    projectRoot,
    requestManifest,
    requestDir,
  });

  assert(
    templateDriftError.length > 0,
    "Pending request is still aligned with the current source template; regeneration is not required.",
  );
  assert(
    evidenceResolution.ok,
    evidenceResolution.error ||
      "Request evidence could not be resolved for regeneration.",
  );

  const regeneratedAt = new Date().toISOString();
  const replacementRequestId = buildInteractionAuditReviewRegeneratedRequestId({
    previousRequestId: requestManifest.requestId,
    requestId: options.replacementRequestId,
    createdAt: regeneratedAt,
  });
  const replacementRequestDir = path.join(requestRoot, replacementRequestId);
  const replacementManifestExists = await readFile(
    path.join(replacementRequestDir, "review-request.json"),
    "utf8",
  )
    .then(() => true)
    .catch(() => false);

  assert(
    !replacementManifestExists,
    `Replacement request \`${replacementRequestId}\` already exists.`,
  );

  const replacementResult = await writeInteractionAuditReviewRequest({
    projectRoot,
    requestRoot,
    requestId: replacementRequestId,
    createdAt: regeneratedAt,
    signoffTemplate: currentSourceTemplate,
    sourceTemplate: requestManifest.sourceTemplate,
    sourceEvidencePack: requestManifest.sourceEvidencePack,
    evidenceReport: evidenceResolution.evidenceReport,
  });

  await updateInteractionAuditReviewRequest({
    projectRoot,
    requestDir,
    requestId: requestManifest.requestId,
    createdAt: requestManifest.createdAt,
    signoffTemplate: requestTemplate,
    sourceTemplate: requestManifest.sourceTemplate,
    sourceEvidencePack: requestManifest.sourceEvidencePack,
    status: INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS,
    supersededBy: {
      supersededAt: regeneratedAt,
      reason: "template_drift_regenerated_request",
      replacementRequestId,
      replacementRequestReadmePath: path.relative(
        projectRoot,
        path.join(replacementResult.requestDir, "README.md"),
      ),
      replacementRequestManifestPath: path.relative(
        projectRoot,
        path.join(replacementResult.requestDir, "review-request.json"),
      ),
    },
  });

  const shouldRefreshDefaultIndex = requestRoot === defaultRequestRoot;
  const indexResult = await writeInteractionAuditReviewRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: regeneratedAt,
    indexMarkdownPath: shouldRefreshDefaultIndex
      ? path.join(projectRoot, "Doc", "testing", "Interaction_Audit_Review_Requests.md")
      : path.join(path.dirname(requestRoot), "Interaction_Audit_Review_Requests.md"),
    indexJsonPath: shouldRefreshDefaultIndex
      ? path.join(projectRoot, "Doc", "testing", "operator_review_requests", "index.json")
      : path.join(requestRoot, "index.json"),
  });

  console.log(
    `interaction-audit: superseded ${requestManifest.requestId} with regenerated request ${replacementRequestId}`,
  );
  console.log(
    `interaction-audit: request index refreshed pending=${indexResult.pendingRequestCount} fulfilled=${indexResult.fulfilledRequestCount}`,
  );
  console.log(
    `interaction-audit: drift note=${templateDriftError}`,
  );
}

void run().catch((error) => {
  console.error("interaction-audit: failed to regenerate review request");
  console.error(error);
  process.exitCode = 1;
});
