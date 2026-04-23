import { buildInteractionAuditHandoffSummaryFromExport } from "./interaction-audit-handoff-bundle.mjs";
import { isInteractionAuditSeededReviewSession } from "./interaction-audit-review-archive.mjs";
import {
  buildInteractionAuditReviewExpectedShape,
  buildInteractionAuditReviewShapeMismatchError,
  buildInteractionAuditReviewTemplateDriftError,
  INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  normalizeInteractionAuditReviewExpectedShape,
} from "./interaction-audit-review-request.mjs";

function buildCheckResult(id, label, ok, detail) {
  return {
    id,
    label,
    ok,
    detail,
  };
}

function normalizeRequestBinding(value) {
  return {
    requestId: typeof value?.requestId === "string" ? value.requestId.trim() : "",
    requestCreatedAt:
      typeof value?.requestCreatedAt === "string"
        ? value.requestCreatedAt.trim()
        : "",
    requestRevisionSha256:
      typeof value?.requestRevisionSha256 === "string"
        ? value.requestRevisionSha256.trim()
        : "",
  };
}

function buildRequestBindingCheck(requestManifest, signoffExport) {
  const binding = normalizeRequestBinding(signoffExport?.requestContext);
  const requestId = String(requestManifest?.requestId ?? "").trim();
  const requestCreatedAt = String(requestManifest?.createdAt ?? "").trim();
  const ok =
    binding.requestId === requestId &&
    binding.requestCreatedAt === requestCreatedAt;

  return buildCheckResult(
    "request-binding",
    "Request binding matches the target pending request",
    ok,
    ok
      ? `Export is bound to ${requestId} @ ${requestCreatedAt}.`
      : "Completed signoff export request binding did not match the target pending request.",
  );
}

function buildRequestRevisionCheck(requestManifest, signoffExport) {
  const binding = normalizeRequestBinding(signoffExport?.requestContext);
  const expectedRevision =
    typeof requestManifest?.requestRevisionSha256 === "string"
      ? requestManifest.requestRevisionSha256.trim()
      : "";

  if (expectedRevision.length === 0) {
    return buildCheckResult(
      "request-revision",
      "Export is bound to the current request package revision",
      true,
      "Request revision check not required because the pending request manifest did not preserve one.",
    );
  }

  const ok = binding.requestRevisionSha256 === expectedRevision;

  return buildCheckResult(
    "request-revision",
    "Export is bound to the current request package revision",
    ok,
    ok
      ? `Export is bound to request revision sha256:${expectedRevision}.`
      : "Completed signoff export request revision did not match the current pending request package.",
  );
}

function normalizeSourceEvidencePack(value) {
  return {
    ok: Boolean(value?.ok),
    source: typeof value?.source === "string" ? value.source : "request_manifest",
    sourceLabel:
      typeof value?.sourceLabel === "string"
        ? value.sourceLabel
        : "Request source evidence pack",
    requestPath:
      typeof value?.requestPath === "string" ? value.requestPath.trim() : "",
    selectedPath:
      typeof value?.selectedPath === "string" ? value.selectedPath.trim() : "",
    evidenceItemCount:
      typeof value?.evidenceItemCount === "number" ? value.evidenceItemCount : 0,
    integrityOk:
      typeof value?.integrityOk === "boolean"
        ? value.integrityOk
        : value?.source === "request_snapshot"
          ? false
          : true,
    integrityState:
      typeof value?.integrityState === "string"
        ? value.integrityState
        : "not_applicable",
    expectedSha256:
      typeof value?.expectedSha256 === "string" ? value.expectedSha256 : "",
    actualSha256:
      typeof value?.actualSha256 === "string" ? value.actualSha256 : "",
    expectedSizeBytes:
      typeof value?.expectedSizeBytes === "number" ? value.expectedSizeBytes : 0,
    actualSizeBytes:
      typeof value?.actualSizeBytes === "number" ? value.actualSizeBytes : 0,
    integrityError:
      typeof value?.integrityError === "string" ? value.integrityError : "",
    error: typeof value?.error === "string" ? value.error : "",
  };
}

export function buildInteractionAuditReviewRequestPreflight({
  requestManifest,
  requestTemplate,
  signoffExport,
  currentSourceTemplate,
  sourceTemplatePath,
  sourceTemplateReadError = "",
  sourceEvidencePack = null,
}) {
  const expectedShape =
    requestManifest?.expectedShape &&
    typeof requestManifest.expectedShape === "object"
      ? normalizeInteractionAuditReviewExpectedShape(requestManifest.expectedShape)
      : buildInteractionAuditReviewExpectedShape(requestTemplate);
  const normalizedSourceEvidencePack =
    normalizeSourceEvidencePack(sourceEvidencePack);
  const handoffSummary = buildInteractionAuditHandoffSummaryFromExport(
    signoffExport,
  );

  const statusCheck = buildCheckResult(
    "request-status",
    "Pending request is still open for completion",
    requestManifest?.status === INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
    requestManifest?.status === INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS
      ? `Request status is \`${INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS}\`.`
      : `Review request must be \`${INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS}\` before completion.`,
  );
  const seededCheck = buildCheckResult(
    "seeded-review",
    "Export does not claim a seeded review session",
    !isInteractionAuditSeededReviewSession(signoffExport),
    !isInteractionAuditSeededReviewSession(signoffExport)
      ? "Export metadata does not look seeded."
      : "Refused to fulfill a real operator review request from a seeded signoff export.",
  );
  const requestBindingCheck = buildRequestBindingCheck(
    requestManifest,
    signoffExport,
  );
  const requestRevisionCheck = buildRequestRevisionCheck(
    requestManifest,
    signoffExport,
  );
  const sourceTemplateCheck = buildCheckResult(
    "source-template",
    "Current source template is readable and structurally valid",
    Array.isArray(currentSourceTemplate?.surfaces),
    Array.isArray(currentSourceTemplate?.surfaces)
      ? `Current source template \`${sourceTemplatePath}\` was read successfully.`
      : sourceTemplateReadError.trim().length > 0
        ? sourceTemplateReadError
        : `Current source template \`${sourceTemplatePath}\` did not contain a valid \`surfaces\` array. Regenerate the pending request before completion.`,
  );
  const sourceEvidencePackCheck = buildCheckResult(
    "source-evidence-pack",
    "Source evidence pack is readable and structurally valid",
    normalizedSourceEvidencePack.ok,
    normalizedSourceEvidencePack.ok
      ? `${normalizedSourceEvidencePack.sourceLabel} \`${normalizedSourceEvidencePack.selectedPath}\` was read successfully with ${normalizedSourceEvidencePack.evidenceItemCount} evidence items.`
      : normalizedSourceEvidencePack.error.trim().length > 0
        ? normalizedSourceEvidencePack.error
        : "Source evidence pack was not resolved.",
  );
  const sourceEvidenceSnapshotIntegrityCheck = buildCheckResult(
    "source-evidence-snapshot-integrity",
    "Request evidence snapshot still matches the digest recorded in the manifest",
    normalizedSourceEvidencePack.source !== "request_snapshot" ||
      normalizedSourceEvidencePack.integrityOk,
    normalizedSourceEvidencePack.source !== "request_snapshot"
      ? `Integrity check not applicable because evidence resolved from ${normalizedSourceEvidencePack.sourceLabel.toLowerCase()}.`
      : normalizedSourceEvidencePack.integrityOk
        ? `Request evidence snapshot \`${normalizedSourceEvidencePack.selectedPath}\` matched recorded sha256 ${normalizedSourceEvidencePack.expectedSha256} (${normalizedSourceEvidencePack.expectedSizeBytes} bytes).`
        : normalizedSourceEvidencePack.integrityError.trim().length > 0
          ? normalizedSourceEvidencePack.integrityError
          : "Request evidence snapshot integrity could not be verified.",
  );
  const templateDriftError = Array.isArray(currentSourceTemplate?.surfaces)
    ? buildInteractionAuditReviewTemplateDriftError({
        expectedShape,
        currentTemplate: currentSourceTemplate,
      })
    : "";
  const templateDriftCheck = buildCheckResult(
    "template-drift",
    "Pending request is still aligned with the current source template",
    sourceTemplateCheck.ok && templateDriftError.length === 0,
    sourceTemplateCheck.ok
      ? templateDriftError.length === 0
        ? "Current source template still matches the pending request package."
        : `${templateDriftError} Regenerate the pending request before completion.`
      : "Template-drift check was skipped because the current source template was unavailable.",
  );
  const shapeMismatchError = buildInteractionAuditReviewShapeMismatchError({
    expectedShape,
    signoffExport,
  });
  const shapeCheck = buildCheckResult(
    "workspace-shape",
    "Exported workspace shape matches the pending request package",
    shapeMismatchError.length === 0,
    shapeMismatchError.length === 0
      ? "Exported workspace shape matches the pending request package."
      : shapeMismatchError,
  );

  const checks = [
    statusCheck,
    seededCheck,
    requestBindingCheck,
    requestRevisionCheck,
    sourceTemplateCheck,
    sourceEvidencePackCheck,
    sourceEvidenceSnapshotIntegrityCheck,
    templateDriftCheck,
    shapeCheck,
  ];
  const failures = checks.filter((check) => !check.ok).map((check) => check.detail);

  return {
    ok: failures.length === 0,
    requestId: String(requestManifest?.requestId ?? "").trim(),
    requestStatus: String(requestManifest?.status ?? "").trim(),
    sourceTemplatePath,
    expectedShape,
    requestBinding: normalizeRequestBinding(signoffExport?.requestContext),
    sourceEvidencePack: {
      ok: normalizedSourceEvidencePack.ok,
      source: normalizedSourceEvidencePack.source,
      sourceLabel: normalizedSourceEvidencePack.sourceLabel,
      requestPath: normalizedSourceEvidencePack.requestPath,
      selectedPath: normalizedSourceEvidencePack.selectedPath,
      evidenceItemCount: normalizedSourceEvidencePack.evidenceItemCount,
      integrityOk: normalizedSourceEvidencePack.integrityOk,
      integrityState: normalizedSourceEvidencePack.integrityState,
      expectedSha256: normalizedSourceEvidencePack.expectedSha256,
      actualSha256: normalizedSourceEvidencePack.actualSha256,
      expectedSizeBytes: normalizedSourceEvidencePack.expectedSizeBytes,
      actualSizeBytes: normalizedSourceEvidencePack.actualSizeBytes,
    },
    signoffSummary: {
      readyForSignoff: handoffSummary.readyForSignoff,
      reviewedSurfaceCount: handoffSummary.reviewedSurfaceCount,
      totalSurfaceCount: handoffSummary.totalSurfaceCount,
      passSurfaceCount: handoffSummary.passSurfaceCount,
      followUpSurfaceCount: handoffSummary.followUpSurfaceCount,
      notReviewedSurfaceCount: handoffSummary.notReviewedSurfaceCount,
      completedManualCheckCount: handoffSummary.completedManualCheckCount,
      totalManualCheckCount: handoffSummary.totalManualCheckCount,
      pendingManualCheckCount: handoffSummary.pendingManualCheckCount,
    },
    checks,
    failures,
  };
}
