import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS =
  "pending_operator_review";
export const INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS =
  "fulfilled_review_archived";
export const INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS =
  "superseded_by_regenerated_request";
export const INTERACTION_AUDIT_REVIEW_REQUEST_EVIDENCE_ARTIFACT =
  "interaction-audit-evidence-pack.json";

export function serializeInteractionAuditReviewEvidenceSnapshot(evidenceReport) {
  return `${JSON.stringify(evidenceReport, null, 2)}\n`;
}

function buildInteractionAuditReviewEvidenceSnapshotDigest(rawSnapshot) {
  return createHash("sha256").update(rawSnapshot).digest("hex");
}

export function buildInteractionAuditReviewEvidenceSnapshotDescriptor({
  evidenceReport,
  evidenceArtifact = INTERACTION_AUDIT_REVIEW_REQUEST_EVIDENCE_ARTIFACT,
}) {
  if (!evidenceReport || typeof evidenceReport !== "object") {
    return null;
  }

  const serializedSnapshot =
    serializeInteractionAuditReviewEvidenceSnapshot(evidenceReport);

  return {
    path: evidenceArtifact,
    sha256: buildInteractionAuditReviewEvidenceSnapshotDigest(serializedSnapshot),
    sizeBytes: Buffer.byteLength(serializedSnapshot, "utf8"),
  };
}

function buildInteractionAuditReviewRequestRevisionDigest(rawRevisionSeed) {
  return createHash("sha256").update(rawRevisionSeed).digest("hex");
}

export function buildInteractionAuditReviewRequestRevisionSha256({
  requestId,
  createdAt,
  signoffTemplate,
  sourceTemplate,
  sourceEvidencePack,
  evidenceSnapshot,
}) {
  const unboundTemplate = structuredClone(signoffTemplate);

  if (unboundTemplate && typeof unboundTemplate === "object") {
    unboundTemplate.requestContext = {
      requestId: "",
      requestCreatedAt: "",
      requestRevisionSha256: "",
    };
  }

  const normalizedEvidenceSnapshot =
    normalizeInteractionAuditReviewEvidenceSnapshotDescriptor(evidenceSnapshot);
  const revisionSeed = JSON.stringify(
    {
      requestId,
      createdAt,
      sourceTemplate,
      sourceEvidencePack,
      evidenceSnapshot: normalizedEvidenceSnapshot,
      signoffTemplate: unboundTemplate,
    },
    null,
    2,
  );

  return buildInteractionAuditReviewRequestRevisionDigest(revisionSeed);
}

function normalizeInteractionAuditReviewEvidenceSnapshotDescriptor(
  value,
  evidenceArtifact = INTERACTION_AUDIT_REVIEW_REQUEST_EVIDENCE_ARTIFACT,
) {
  return value &&
    typeof value === "object" &&
    typeof value.sha256 === "string" &&
    value.sha256.trim().length > 0 &&
    typeof value.sizeBytes === "number" &&
    Number.isFinite(value.sizeBytes)
    ? {
        path:
          typeof value.path === "string" && value.path.trim().length > 0
            ? value.path.trim()
            : evidenceArtifact,
        sha256: value.sha256.trim(),
        sizeBytes: value.sizeBytes,
      }
    : null;
}

function formatInteractionAuditReviewEvidenceSnapshotDescriptor(value) {
  const snapshot =
    normalizeInteractionAuditReviewEvidenceSnapshotDescriptor(value);

  return snapshot
    ? `sha256:${snapshot.sha256} (${snapshot.sizeBytes} bytes)`
    : "not recorded";
}

async function readInteractionAuditReviewEvidenceSnapshotDescriptor({
  requestDir,
  evidenceArtifact = INTERACTION_AUDIT_REVIEW_REQUEST_EVIDENCE_ARTIFACT,
}) {
  const snapshotPath = path.join(requestDir, evidenceArtifact);

  try {
    const rawSnapshot = await readFile(snapshotPath, "utf8");

    return {
      path: evidenceArtifact,
      sha256: buildInteractionAuditReviewEvidenceSnapshotDigest(rawSnapshot),
      sizeBytes: Buffer.byteLength(rawSnapshot, "utf8"),
    };
  } catch {
    return null;
  }
}

export function buildInteractionAuditReviewExpectedShape(signoffValue) {
  const surfaces = Array.isArray(signoffValue?.surfaces)
    ? signoffValue.surfaces.map((surface) => ({
        id: typeof surface?.id === "string" ? surface.id : "",
        manualCheckLabels: Array.isArray(surface?.manualChecks)
          ? surface.manualChecks.map((check) =>
              typeof check?.label === "string" ? check.label : "",
            )
          : [],
      }))
    : [];

  return {
    surfaceCount: surfaces.length,
    totalManualCheckCount: surfaces.reduce(
      (count, surface) => count + surface.manualCheckLabels.length,
      0,
    ),
    surfaces,
  };
}

export function buildInteractionAuditReviewRequestBoundTemplate({
  signoffTemplate,
  requestId,
  createdAt,
  requestRevisionSha256 = "",
}) {
  const boundTemplate = structuredClone(signoffTemplate);

  boundTemplate.requestContext = {
    requestId,
    requestCreatedAt: createdAt,
    requestRevisionSha256,
  };

  return boundTemplate;
}

export function buildInteractionAuditReviewShapeMismatchError({
  expectedShape,
  signoffExport,
}) {
  const actualShape = buildInteractionAuditReviewExpectedShape(signoffExport);
  return buildInteractionAuditReviewShapeComparisonError({
    expectedShape,
    actualShape,
    actualLabel: "Completed signoff export",
    expectedLabel: "request template",
  });
}

function buildInteractionAuditReviewShapeComparisonError({
  expectedShape,
  actualShape,
  actualLabel,
  expectedLabel,
}) {
  const normalizedExpectedShape =
    normalizeInteractionAuditReviewExpectedShape(expectedShape);
  const normalizedActualShape =
    normalizeInteractionAuditReviewExpectedShape(actualShape);

  if (normalizedActualShape.surfaceCount !== normalizedExpectedShape.surfaceCount) {
    return `${actualLabel} surface count ${normalizedActualShape.surfaceCount} did not match ${expectedLabel} surface count ${normalizedExpectedShape.surfaceCount}.`;
  }

  for (
    let index = 0;
    index < normalizedExpectedShape.surfaces.length;
    index += 1
  ) {
    const expectedSurface = normalizedExpectedShape.surfaces[index];
    const actualSurface = normalizedActualShape.surfaces[index];

    if (!actualSurface || actualSurface.id !== expectedSurface.id) {
      return `${actualLabel} surface at position ${index + 1} did not match ${expectedLabel} surface id \`${expectedSurface.id}\`.`;
    }

    if (
      actualSurface.manualCheckLabels.length !==
      expectedSurface.manualCheckLabels.length
    ) {
      return `${actualLabel} manual-check count for surface \`${expectedSurface.id}\` did not match the ${expectedLabel}.`;
    }

    for (
      let checkIndex = 0;
      checkIndex < expectedSurface.manualCheckLabels.length;
      checkIndex += 1
    ) {
      if (
        actualSurface.manualCheckLabels[checkIndex] !==
        expectedSurface.manualCheckLabels[checkIndex]
      ) {
        return `${actualLabel} manual-check label for surface \`${expectedSurface.id}\` at position ${checkIndex + 1} did not match the ${expectedLabel}.`;
      }
    }
  }

  if (
    normalizedActualShape.totalManualCheckCount !==
    normalizedExpectedShape.totalManualCheckCount
  ) {
    return `${actualLabel} total manual-check count ${normalizedActualShape.totalManualCheckCount} did not match ${expectedLabel} total ${normalizedExpectedShape.totalManualCheckCount}.`;
  }

  return "";
}

export function buildInteractionAuditReviewTemplateDriftError({
  expectedShape,
  currentTemplate,
}) {
  const currentTemplateShape = buildInteractionAuditReviewExpectedShape(
    currentTemplate,
  );

  return buildInteractionAuditReviewShapeComparisonError({
    expectedShape,
    actualShape: currentTemplateShape,
    actualLabel: "Current source template",
    expectedLabel: "pending request template",
  });
}

export function normalizeInteractionAuditReviewExpectedShape(value) {
  const normalized = buildInteractionAuditReviewExpectedShape({
    surfaces: Array.isArray(value?.surfaces)
      ? value.surfaces.map((surface) => ({
          id: typeof surface?.id === "string" ? surface.id : "",
          manualChecks: Array.isArray(surface?.manualCheckLabels)
            ? surface.manualCheckLabels.map((label) => ({ label }))
            : [],
        }))
      : [],
  });

  return {
    surfaceCount:
      typeof value?.surfaceCount === "number"
        ? value.surfaceCount
        : normalized.surfaceCount,
    totalManualCheckCount:
      typeof value?.totalManualCheckCount === "number"
        ? value.totalManualCheckCount
        : normalized.totalManualCheckCount,
    surfaces: normalized.surfaces,
  };
}

function sanitizeRequestSegment(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatInteractionAuditReviewRequestBinding(requestContext) {
  const requestId =
    typeof requestContext?.requestId === "string"
      ? requestContext.requestId.trim()
      : "";
  const requestCreatedAt =
    typeof requestContext?.requestCreatedAt === "string"
      ? requestContext.requestCreatedAt.trim()
      : "";

  if (requestId.length === 0) {
    return "not set yet";
  }

  if (requestCreatedAt.length === 0) {
    return requestId;
  }

  return `${requestId} @ ${requestCreatedAt}`;
}

export function buildInteractionAuditReviewRequestId({ requestId, createdAt }) {
  if (typeof requestId === "string" && requestId.trim().length > 0) {
    return sanitizeRequestSegment(requestId);
  }

  return `${createdAt.slice(0, 10)}-operator-review-request`;
}

export function buildInteractionAuditReviewRegeneratedRequestId({
  previousRequestId,
  requestId,
  createdAt,
}) {
  if (typeof requestId === "string" && requestId.trim().length > 0) {
    return sanitizeRequestSegment(requestId);
  }

  const compactTimestamp = String(createdAt ?? "")
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  return sanitizeRequestSegment(
    `${previousRequestId}-regen-${compactTimestamp.length > 0 ? compactTimestamp : "now"}`,
  );
}

function normalizeSupersededBy(value) {
  return value &&
    typeof value === "object" &&
    typeof value.replacementRequestId === "string" &&
    value.replacementRequestId.trim().length > 0
    ? {
        supersededAt:
          typeof value.supersededAt === "string" ? value.supersededAt : "",
        reason:
          typeof value.reason === "string"
            ? value.reason
            : "template_drift_regenerated_request",
        replacementRequestId: value.replacementRequestId.trim(),
        replacementRequestReadmePath:
          typeof value.replacementRequestReadmePath === "string"
            ? value.replacementRequestReadmePath
            : "",
        replacementRequestManifestPath:
          typeof value.replacementRequestManifestPath === "string"
            ? value.replacementRequestManifestPath
            : "",
      }
    : null;
}

function normalizeCompletionReviewSession(value) {
  return value &&
    typeof value === "object" &&
    (typeof value.reviewerName === "string" ||
      typeof value.sessionLabel === "string" ||
      typeof value.reviewedAt === "string")
    ? {
        reviewerName:
          typeof value.reviewerName === "string" ? value.reviewerName : "",
        sessionLabel:
          typeof value.sessionLabel === "string" ? value.sessionLabel : "",
        reviewedAt: typeof value.reviewedAt === "string" ? value.reviewedAt : "",
      }
    : null;
}

function normalizeCompletionRequestContext(value) {
  return value &&
    typeof value === "object" &&
    typeof value.requestId === "string" &&
    value.requestId.trim().length > 0
    ? {
        requestId: value.requestId.trim(),
        requestCreatedAt:
          typeof value.requestCreatedAt === "string"
            ? value.requestCreatedAt
            : "",
        requestRevisionSha256:
          typeof value.requestRevisionSha256 === "string"
            ? value.requestRevisionSha256
            : "",
      }
    : null;
}

function normalizeCompletionEvidenceContext(value) {
  return value &&
    typeof value === "object" &&
    (typeof value.source === "string" || typeof value.sourceLabel === "string")
    ? {
        source: typeof value.source === "string" ? value.source : "",
        sourceLabel:
          typeof value.sourceLabel === "string" ? value.sourceLabel : "",
        selectedPath:
          typeof value.selectedPath === "string" ? value.selectedPath : "",
        evidenceItemCount:
          typeof value.evidenceItemCount === "number" ? value.evidenceItemCount : 0,
        integrityOk:
          typeof value.integrityOk === "boolean" ? value.integrityOk : false,
        integrityState:
          typeof value.integrityState === "string" ? value.integrityState : "",
        expectedSha256:
          typeof value.expectedSha256 === "string" ? value.expectedSha256 : "",
        actualSha256:
          typeof value.actualSha256 === "string" ? value.actualSha256 : "",
        expectedSizeBytes:
          typeof value.expectedSizeBytes === "number" ? value.expectedSizeBytes : 0,
        actualSizeBytes:
          typeof value.actualSizeBytes === "number" ? value.actualSizeBytes : 0,
      }
    : null;
}

function normalizeCompletionSignoffExportDigest(value) {
  return value &&
    typeof value === "object" &&
    typeof value.sha256 === "string" &&
    value.sha256.trim().length > 0 &&
    typeof value.sizeBytes === "number" &&
    Number.isFinite(value.sizeBytes)
    ? {
        sha256: value.sha256.trim(),
        sizeBytes: value.sizeBytes,
      }
    : null;
}

function formatCompletionReviewSession(value) {
  return {
    reviewerName:
      value?.reviewerName?.trim().length > 0 ? value.reviewerName.trim() : "not set",
    sessionLabel:
      value?.sessionLabel?.trim().length > 0 ? value.sessionLabel.trim() : "not set",
    reviewedAt:
      value?.reviewedAt?.trim().length > 0 ? value.reviewedAt.trim() : "not set",
  };
}

function formatCompletionEvidenceSource(value) {
  const sourceLabel = typeof value?.sourceLabel === "string" ? value.sourceLabel.trim() : "";
  const source = typeof value?.source === "string" ? value.source.trim() : "";

  return sourceLabel.length > 0
    ? sourceLabel
    : source.length > 0
      ? source
      : "not set";
}

function formatCompletionEvidenceIntegrity(value) {
  const integrityState =
    typeof value?.integrityState === "string" ? value.integrityState.trim() : "";

  if (integrityState.length === 0) {
    return "not set";
  }

  if (integrityState === "verified") {
    const sha256 =
      typeof value?.expectedSha256 === "string" && value.expectedSha256.trim().length > 0
        ? value.expectedSha256.trim()
        : typeof value?.actualSha256 === "string"
          ? value.actualSha256.trim()
          : "";
    const sizeBytes =
      typeof value?.expectedSizeBytes === "number" && value.expectedSizeBytes > 0
        ? value.expectedSizeBytes
        : typeof value?.actualSizeBytes === "number"
          ? value.actualSizeBytes
          : 0;

    if (sha256.length > 0 && sizeBytes > 0) {
      return `verified sha256:${sha256} (${sizeBytes} bytes)`;
    }

    return "verified";
  }

  if (integrityState === "not_applicable") {
    return "not applicable";
  }

  return integrityState.replace(/_/g, " ");
}

function formatCompletionSignoffExportDigest(value) {
  return value?.sha256?.trim().length > 0 && typeof value?.sizeBytes === "number"
    ? `sha256:${value.sha256.trim()} (${value.sizeBytes} bytes)`
    : "not recorded";
}

export function buildInteractionAuditReviewRequestRecord({
  requestId,
  createdAt,
  signoffTemplate,
  sourceTemplate,
  sourceEvidencePack,
  evidenceSnapshot = null,
  evidenceArtifact = INTERACTION_AUDIT_REVIEW_REQUEST_EVIDENCE_ARTIFACT,
  status = INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  fulfillment = null,
  supersededBy = null,
}) {
  const normalizedEvidenceSnapshot =
    normalizeInteractionAuditReviewEvidenceSnapshotDescriptor(
      evidenceSnapshot,
      evidenceArtifact,
    );
  const requestRevisionSha256 = buildInteractionAuditReviewRequestRevisionSha256({
    requestId,
    createdAt,
    signoffTemplate,
    sourceTemplate,
    sourceEvidencePack,
    evidenceSnapshot: normalizedEvidenceSnapshot,
  });
  const boundTemplate = buildInteractionAuditReviewRequestBoundTemplate({
    signoffTemplate,
    requestId,
    createdAt,
    requestRevisionSha256,
  });
  const manifest = {
    requestId,
    createdAt,
    requestRevisionSha256,
    status,
    sourceTemplate,
    sourceEvidencePack,
    expectedShape: buildInteractionAuditReviewExpectedShape(boundTemplate),
    artifacts: {
      signoffTemplate: "interaction-audit-signoff-template.json",
      evidencePack: evidenceArtifact,
      requestManifest: "review-request.json",
      requestReadme: "README.md",
    },
  };
  if (normalizedEvidenceSnapshot) {
    manifest.evidenceSnapshot = normalizedEvidenceSnapshot;
  }
  const normalizedFulfillment =
    fulfillment &&
    typeof fulfillment === "object" &&
    typeof fulfillment.archiveId === "string" &&
    fulfillment.archiveId.trim().length > 0
      ? {
          fulfilledAt:
            typeof fulfillment.fulfilledAt === "string"
              ? fulfillment.fulfilledAt
              : "",
          sourceCompletedSignoffExport:
            typeof fulfillment.sourceCompletedSignoffExport === "string"
              ? fulfillment.sourceCompletedSignoffExport
              : "",
          archiveId: fulfillment.archiveId.trim(),
          archiveReadmePath:
            typeof fulfillment.archiveReadmePath === "string"
              ? fulfillment.archiveReadmePath
              : "",
          archiveManifestPath:
            typeof fulfillment.archiveManifestPath === "string"
              ? fulfillment.archiveManifestPath
              : "",
          completedReviewSession: normalizeCompletionReviewSession(
            fulfillment.completedReviewSession,
          ),
          completedRequestContext: normalizeCompletionRequestContext(
            fulfillment.completedRequestContext,
          ),
          completedEvidenceContext: normalizeCompletionEvidenceContext(
            fulfillment.completedEvidenceContext,
          ),
          completedSignoffExportDigest: normalizeCompletionSignoffExportDigest(
            fulfillment.completedSignoffExportDigest,
          ),
          summary:
            fulfillment.summary &&
            typeof fulfillment.summary === "object"
              ? {
                  readyForSignoff: Boolean(fulfillment.summary.readyForSignoff),
                  reviewedSurfaceCount:
                    typeof fulfillment.summary.reviewedSurfaceCount === "number"
                      ? fulfillment.summary.reviewedSurfaceCount
                      : 0,
                  totalSurfaceCount:
                    typeof fulfillment.summary.totalSurfaceCount === "number"
                      ? fulfillment.summary.totalSurfaceCount
                      : 0,
                  followUpSurfaceCount:
                    typeof fulfillment.summary.followUpSurfaceCount === "number"
                      ? fulfillment.summary.followUpSurfaceCount
                      : 0,
                  notReviewedSurfaceCount:
                    typeof fulfillment.summary.notReviewedSurfaceCount === "number"
                      ? fulfillment.summary.notReviewedSurfaceCount
                      : 0,
                  pendingManualCheckCount:
                    typeof fulfillment.summary.pendingManualCheckCount === "number"
                      ? fulfillment.summary.pendingManualCheckCount
                      : 0,
                  totalManualCheckCount:
                    typeof fulfillment.summary.totalManualCheckCount === "number"
                      ? fulfillment.summary.totalManualCheckCount
                      : 0,
                }
              : {
                  readyForSignoff: false,
                  reviewedSurfaceCount: 0,
                  totalSurfaceCount: 0,
                  followUpSurfaceCount: 0,
                  notReviewedSurfaceCount: 0,
                  pendingManualCheckCount: 0,
                  totalManualCheckCount: 0,
                },
        }
      : null;

  if (normalizedFulfillment) {
    manifest.fulfillment = normalizedFulfillment;
  }
  const normalizedSupersededBy = normalizeSupersededBy(supersededBy);

  if (normalizedSupersededBy) {
    manifest.supersededBy = normalizedSupersededBy;
  }

  const reviewSessionLabel =
    boundTemplate?.metadata?.sessionLabel?.trim().length > 0
      ? boundTemplate.metadata.sessionLabel.trim()
      : "not set yet";
  const expectedShape = buildInteractionAuditReviewExpectedShape(boundTemplate);
  const readmeLines = [
    "# Interaction Audit Review Request",
    "",
    "Document class:",
    "",
    "- generated operational ledger",
    "",
    "Status note:",
    "",
    "- this package README is generated from one repo-backed request manifest and should be refreshed through the request generator or refresh workflow, not hand-edited",
    "- it preserves current request-package truth only and does not claim that a human review has already happened",
    "",
    `Request ID: \`${requestId}\``,
    `Created at: ${createdAt}`,
    `Status: ${manifest.status}`,
    `Source template: \`${sourceTemplate}\``,
    `Source evidence seed: \`${sourceEvidencePack}\``,
    `Request evidence snapshot: \`${manifest.artifacts.evidencePack}\``,
    `Request evidence snapshot integrity: \`${formatInteractionAuditReviewEvidenceSnapshotDescriptor(normalizedEvidenceSnapshot)}\``,
    `Request revision: \`sha256:${requestRevisionSha256}\``,
    "",
    "Current review template truth:",
    `- Reviewer: ${boundTemplate?.metadata?.reviewerName?.trim().length > 0 ? boundTemplate.metadata.reviewerName.trim() : "not set yet"}`,
    `- Session: ${reviewSessionLabel}`,
    `- Reviewed at: ${boundTemplate?.metadata?.reviewedAt?.trim().length > 0 ? boundTemplate.metadata.reviewedAt.trim() : "not set yet"}`,
    `- Reviewed surfaces: ${boundTemplate?.summary?.reviewedSurfaceCount ?? 0} / ${Array.isArray(boundTemplate?.surfaces) ? boundTemplate.surfaces.length : 0}`,
    `- Expected audit shape: ${expectedShape.surfaceCount} surfaces, ${expectedShape.totalManualCheckCount} manual checks`,
    `- Request binding: ${formatInteractionAuditReviewRequestBinding(boundTemplate?.requestContext)}`,
    "",
  ];

  if (normalizedFulfillment) {
    readmeLines.push("Fulfillment:");
    readmeLines.push(
      `- Fulfilled at: ${normalizedFulfillment.fulfilledAt.trim().length > 0 ? normalizedFulfillment.fulfilledAt : "not set"}`,
    );
    readmeLines.push(
      `- Archived review: \`${normalizedFulfillment.archiveReadmePath.trim().length > 0 ? normalizedFulfillment.archiveReadmePath : normalizedFulfillment.archiveId}\``,
    );
    readmeLines.push(
      `- Archived manifest: \`${normalizedFulfillment.archiveManifestPath.trim().length > 0 ? normalizedFulfillment.archiveManifestPath : "not set" }\``,
    );
    readmeLines.push(
      `- Completed signoff export: \`${normalizedFulfillment.sourceCompletedSignoffExport.trim().length > 0 ? normalizedFulfillment.sourceCompletedSignoffExport : "not set" }\``,
    );
    const formattedCompletionReviewSession = formatCompletionReviewSession(
      normalizedFulfillment.completedReviewSession,
    );
    const completionRequestContext = normalizedFulfillment.completedRequestContext;
    readmeLines.push(
      `- Completed reviewer: ${formattedCompletionReviewSession.reviewerName}`,
    );
    readmeLines.push(
      `- Completed session: ${formattedCompletionReviewSession.sessionLabel}`,
    );
    readmeLines.push(
      `- Completed reviewed at: ${formattedCompletionReviewSession.reviewedAt}`,
    );
    readmeLines.push(
      `- Completion request binding: ${formatInteractionAuditReviewRequestBinding(completionRequestContext)}`,
    );
    readmeLines.push(
      `- Completion request revision: \`${completionRequestContext?.requestRevisionSha256?.trim().length > 0 ? `sha256:${completionRequestContext.requestRevisionSha256.trim()}` : "not recorded"}\``,
    );
    readmeLines.push(
      `- Completion evidence source: ${formatCompletionEvidenceSource(normalizedFulfillment.completedEvidenceContext)}`,
    );
    readmeLines.push(
      `- Completion evidence integrity: \`${formatCompletionEvidenceIntegrity(normalizedFulfillment.completedEvidenceContext)}\``,
    );
    readmeLines.push(
      `- Completed signoff export digest: \`${formatCompletionSignoffExportDigest(normalizedFulfillment.completedSignoffExportDigest)}\``,
    );
    readmeLines.push(
      `- Ready for signoff: ${normalizedFulfillment.summary.readyForSignoff ? "yes" : "no"}`,
    );
    readmeLines.push(
      `- Reviewed surfaces: ${normalizedFulfillment.summary.reviewedSurfaceCount} / ${normalizedFulfillment.summary.totalSurfaceCount}`,
    );
    readmeLines.push(
      `- Follow-up required: ${normalizedFulfillment.summary.followUpSurfaceCount}`,
    );
    readmeLines.push(
      `- Not reviewed: ${normalizedFulfillment.summary.notReviewedSurfaceCount}`,
    );
    readmeLines.push(
      `- Pending checks: ${normalizedFulfillment.summary.pendingManualCheckCount} / ${normalizedFulfillment.summary.totalManualCheckCount}`,
    );
    readmeLines.push("");
    readmeLines.push("Truth note:");
    readmeLines.push(
      "- this request record is fulfilled because one exported audit workspace was archived; the linked review archive remains the source of truth for the review outcome",
    );
    readmeLines.push(
      "- fulfilling a request does not rewrite unresolved follow-up or not-reviewed work into a pass claim",
    );
    readmeLines.push("");
  } else if (normalizedSupersededBy) {
    readmeLines.push("Superseded by regenerated request:");
    readmeLines.push(
      `- Superseded at: ${normalizedSupersededBy.supersededAt.trim().length > 0 ? normalizedSupersededBy.supersededAt : "not set"}`,
    );
    readmeLines.push(
      `- Reason: ${normalizedSupersededBy.reason.trim().length > 0 ? normalizedSupersededBy.reason : "not set"}`,
    );
    readmeLines.push(
      `- Replacement request: \`${normalizedSupersededBy.replacementRequestReadmePath.trim().length > 0 ? normalizedSupersededBy.replacementRequestReadmePath : normalizedSupersededBy.replacementRequestId}\``,
    );
    readmeLines.push(
      `- Replacement manifest: \`${normalizedSupersededBy.replacementRequestManifestPath.trim().length > 0 ? normalizedSupersededBy.replacementRequestManifestPath : "not set" }\``,
    );
    readmeLines.push("");
    readmeLines.push("Truth note:");
    readmeLines.push(
      "- this request record is superseded because the current source template drifted away from the original request package and a replacement pending request was generated",
    );
    readmeLines.push(
      "- superseding a request does not claim that a human review happened; it only preserves the stale request history and points at the replacement request",
    );
    readmeLines.push("");
  } else {
    readmeLines.push("Workflow:");
    readmeLines.push(
      "1. Open `http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit`.",
    );
    readmeLines.push(
      "2. Use `Import signoff JSON` and load `interaction-audit-signoff-template.json` from this request directory.",
    );
    readmeLines.push(
      "3. Fill `Reviewer name`, `Session label`, and `Reviewed at` in the audit hub.",
    );
    readmeLines.push(
      "4. Work through the audit surfaces and update manual checks, signoff states, and operator notes.",
    );
    readmeLines.push(
      "5. Export the completed workspace as signoff JSON from the audit hub.",
    );
    readmeLines.push(
      "6. Optionally preflight the export without writing repo state:",
    );
    readmeLines.push("");
    readmeLines.push("```bash");
    readmeLines.push(
      `npm run interaction-audit:preflight-review-request -- --request-id ${requestId} --input tmp/operator-signoff-export.json`,
    );
    readmeLines.push("```");
    readmeLines.push("");
    readmeLines.push(
      "7. Fulfill the finished export with:",
    );
    readmeLines.push("");
    readmeLines.push("```bash");
    readmeLines.push(
      `npm run interaction-audit:complete-review-request -- --request-id ${requestId} --input tmp/operator-signoff-export.json`,
    );
    readmeLines.push("```");
    readmeLines.push("");
    readmeLines.push(
      "That completion command now uses this request package's `Request evidence snapshot` by default. Only pass `--evidence ...` when you intentionally want the archived review to preserve a different evidence report path.",
    );
    readmeLines.push("");
    readmeLines.push("If this request later drifts away from the current source template, regenerate it with:");
    readmeLines.push("");
    readmeLines.push("```bash");
    readmeLines.push(
      `npm run interaction-audit:regenerate-review-request -- --request-id ${requestId}`,
    );
    readmeLines.push("```");
    readmeLines.push("");
    readmeLines.push("Truth note:");
    readmeLines.push(
      "- this request package does not claim that a human review has already happened",
    );
    readmeLines.push(
      "- the template JSON is intentionally blank and should be replaced by the real exported review state after the operator pass",
    );
    readmeLines.push(
      "- the completion command will reject exported workspace state whose request binding or workspace shape does not match this request package",
    );
    readmeLines.push(
      "- the completion command will also reject this request if the current source template has drifted away from the request package and the request needs regeneration first",
    );
    readmeLines.push(
      "- the preflight and completion commands will also reject one exported workspace whose bound request revision no longer matches the current request package",
    );
    readmeLines.push(
      "- if the pending request is refreshed in place, re-import the latest request template or re-export from the current audit workspace before completion; older exports stay bound to the previous request revision and are rejected",
    );
    readmeLines.push(
      "- the preflight command now also checks whether this request package's evidence snapshot is still readable and structurally valid before completion writes archive state",
    );
    readmeLines.push(
      "- the preflight and completion commands will also reject this request if the request evidence snapshot no longer matches the digest recorded in the request manifest",
    );
    readmeLines.push(
      "- regenerating a stale request supersedes this request and creates one aligned replacement request; it does not claim that a human review has already happened",
    );
    readmeLines.push("");
  }

  return {
    manifest,
    boundTemplate,
    readme: `${readmeLines.join("\n").trim()}\n`,
  };
}

export async function writeInteractionAuditReviewRequest({
  projectRoot,
  requestRoot,
  requestId,
  createdAt,
  signoffTemplate,
  sourceTemplate,
  sourceEvidencePack,
  evidenceReport = null,
}) {
  const evidenceSnapshot = buildInteractionAuditReviewEvidenceSnapshotDescriptor({
    evidenceReport,
  });
  const requestDir = path.join(requestRoot, requestId);
  const record = buildInteractionAuditReviewRequestRecord({
    requestId,
    createdAt,
    signoffTemplate,
    sourceTemplate,
    sourceEvidencePack,
    evidenceSnapshot,
  });

  await mkdir(requestDir, { recursive: true });
  await writeFile(
    path.join(requestDir, "interaction-audit-signoff-template.json"),
    JSON.stringify(record.boundTemplate, null, 2),
    "utf8",
  );
  if (evidenceReport) {
    await writeFile(
      path.join(requestDir, record.manifest.artifacts.evidencePack),
      serializeInteractionAuditReviewEvidenceSnapshot(evidenceReport),
      "utf8",
    );
  }
  await writeFile(
    path.join(requestDir, "review-request.json"),
    JSON.stringify(record.manifest, null, 2),
    "utf8",
  );
  await writeFile(path.join(requestDir, "README.md"), record.readme, "utf8");

  return {
    requestDir,
    requestDirRelative: path.relative(projectRoot, requestDir),
    manifest: record.manifest,
  };
}

export async function updateInteractionAuditReviewRequest({
  projectRoot,
  requestDir,
  requestId,
  createdAt,
  signoffTemplate,
  sourceTemplate,
  sourceEvidencePack,
  evidenceReport = null,
  status = INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  fulfillment = null,
  supersededBy = null,
}) {
  const evidenceSnapshot =
    buildInteractionAuditReviewEvidenceSnapshotDescriptor({
      evidenceReport,
    }) ??
    (await readInteractionAuditReviewEvidenceSnapshotDescriptor({
      requestDir,
    }));
  const record = buildInteractionAuditReviewRequestRecord({
    requestId,
    createdAt,
    signoffTemplate,
    sourceTemplate,
    sourceEvidencePack,
    evidenceSnapshot,
    status,
    fulfillment,
    supersededBy,
  });

  await mkdir(requestDir, { recursive: true });
  await writeFile(
    path.join(requestDir, "interaction-audit-signoff-template.json"),
    JSON.stringify(record.boundTemplate, null, 2),
    "utf8",
  );
  if (evidenceReport) {
    await writeFile(
      path.join(requestDir, record.manifest.artifacts.evidencePack),
      serializeInteractionAuditReviewEvidenceSnapshot(evidenceReport),
      "utf8",
    );
  }
  await writeFile(
    path.join(requestDir, "review-request.json"),
    JSON.stringify(record.manifest, null, 2),
    "utf8",
  );
  await writeFile(path.join(requestDir, "README.md"), record.readme, "utf8");

  return {
    requestDir,
    requestDirRelative: path.relative(projectRoot, requestDir),
    manifest: record.manifest,
  };
}
