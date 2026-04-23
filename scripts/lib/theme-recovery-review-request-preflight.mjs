import {
  buildThemeRecoveryReviewRequestCompletionIssues,
  THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
} from "./theme-recovery-review-request.mjs";

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
    requestBoundWorkspaceRoute:
      typeof value?.requestBoundWorkspaceRoute === "string"
        ? value.requestBoundWorkspaceRoute.trim()
        : "",
  };
}

export function buildThemeRecoveryReviewRequestPreflight({
  requestManifest,
  reviewTemplate,
  reviewExport,
}) {
  const requestId = String(requestManifest?.requestId ?? "").trim();
  const requestCreatedAt = String(requestManifest?.createdAt ?? "").trim();
  const requestStatus = String(requestManifest?.status ?? "").trim();
  const requestBinding = normalizeRequestBinding(reviewExport?.requestContext);
  const completionIssues = buildThemeRecoveryReviewRequestCompletionIssues({
    requestManifest,
    reviewTemplate,
    reviewExport,
  });

  const statusCheck = buildCheckResult(
    "request-status",
    "Pending request is still open for completion",
    requestStatus === THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
    requestStatus === THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS
      ? `Request status is \`${THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS}\`.`
      : `Theme-recovery request must remain \`${THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS}\` before completion.`,
  );
  const requestBindingCheck = buildCheckResult(
    "request-binding",
    "Export preserves the pending request binding",
    requestBinding.requestId === requestId &&
      requestBinding.requestCreatedAt === requestCreatedAt,
    requestBinding.requestId === requestId &&
      requestBinding.requestCreatedAt === requestCreatedAt
      ? `Export is bound to ${requestId} @ ${requestCreatedAt}.`
      : "Theme-recovery export request binding did not match the target pending request.",
  );
  const workspaceRouteCheck = buildCheckResult(
    "request-bound-route",
    "Export preserves the bound workspace route",
    requestBinding.requestBoundWorkspaceRoute.trim().length > 0,
    requestBinding.requestBoundWorkspaceRoute.trim().length > 0
      ? `Bound workspace route is ${requestBinding.requestBoundWorkspaceRoute}.`
      : "Theme-recovery export did not preserve a request-bound workspace route.",
  );
  const contractCheck = buildCheckResult(
    "theme-recovery-contract",
    "Export still satisfies the pending request contract",
    completionIssues.length === 0,
    completionIssues.length === 0
      ? "Export target providers, preset, seed, and request binding all match the pending request."
      : completionIssues[0],
  );

  const checks = [
    statusCheck,
    requestBindingCheck,
    workspaceRouteCheck,
    contractCheck,
  ];
  const failures = checks.filter((check) => !check.ok).map((check) => check.detail);

  return {
    ok: failures.length === 0,
    requestId,
    requestStatus,
    requestBinding,
    reviewSummary: {
      overallLabel:
        typeof reviewExport?.overallLabel === "string" ? reviewExport.overallLabel : "",
      popupSnapshotLabel:
        typeof reviewExport?.popupSnapshotLabel === "string"
          ? reviewExport.popupSnapshotLabel
          : "",
      scopeIsolationLabel:
        typeof reviewExport?.scopeIsolationLabel === "string"
          ? reviewExport.scopeIsolationLabel
          : "",
      themeMode:
        typeof reviewExport?.themeMode === "string" ? reviewExport.themeMode : "",
      themePreset:
        typeof reviewExport?.themePreset === "string"
          ? reviewExport.themePreset
          : "",
      themeCustomSeedHex:
        typeof reviewExport?.themeCustomSeedHex === "string"
          ? reviewExport.themeCustomSeedHex
          : null,
      targetProviderCount: Array.isArray(reviewExport?.targetProviders)
        ? reviewExport.targetProviders.length
        : 0,
    },
    checks,
    failures,
  };
}
