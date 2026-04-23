function normalizeSignoffStatus(value) {
  if (value === "pass" || value === "follow_up") {
    return value;
  }

  return "not_reviewed";
}

function normalizeManualChecks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((check) => ({
    label: typeof check?.label === "string" ? check.label : "",
    completed: Boolean(check?.completed),
  }));
}

function normalizeMetadata(value) {
  return {
    reviewerName: typeof value?.reviewerName === "string" ? value.reviewerName : "",
    sessionLabel: typeof value?.sessionLabel === "string" ? value.sessionLabel : "",
    reviewedAt: typeof value?.reviewedAt === "string" ? value.reviewedAt : "",
  };
}

function normalizeRequestContext(value) {
  return {
    requestId: typeof value?.requestId === "string" ? value.requestId : "",
    requestCreatedAt:
      typeof value?.requestCreatedAt === "string"
        ? value.requestCreatedAt
        : "",
    requestRevisionSha256:
      typeof value?.requestRevisionSha256 === "string"
        ? value.requestRevisionSha256
        : "",
  };
}

function normalizeEvidenceContext(value) {
  return {
    source: typeof value?.source === "string" ? value.source : "",
    sourceLabel: typeof value?.sourceLabel === "string" ? value.sourceLabel : "",
    selectedPath:
      typeof value?.selectedPath === "string" ? value.selectedPath : "",
    requestPath: typeof value?.requestPath === "string" ? value.requestPath : "",
    snapshotPath:
      typeof value?.snapshotPath === "string" ? value.snapshotPath : "",
    evidenceItemCount:
      typeof value?.evidenceItemCount === "number" ? value.evidenceItemCount : 0,
    integrityOk:
      typeof value?.integrityOk === "boolean" ? value.integrityOk : false,
    integrityState:
      typeof value?.integrityState === "string" ? value.integrityState : "",
    expectedSha256:
      typeof value?.expectedSha256 === "string" ? value.expectedSha256 : "",
    actualSha256:
      typeof value?.actualSha256 === "string" ? value.actualSha256 : "",
    expectedSizeBytes:
      typeof value?.expectedSizeBytes === "number" ? value.expectedSizeBytes : 0,
    actualSizeBytes:
      typeof value?.actualSizeBytes === "number" ? value.actualSizeBytes : 0,
  };
}

function formatRequestBinding(requestContext) {
  const requestId = requestContext.requestId.trim();
  const requestCreatedAt = requestContext.requestCreatedAt.trim();

  if (requestId.length === 0) {
    return "none";
  }

  if (requestCreatedAt.length === 0) {
    return requestId;
  }

  return `${requestId} @ ${requestCreatedAt}`;
}

function formatRequestRevision(requestContext) {
  const requestRevisionSha256 = requestContext.requestRevisionSha256.trim();

  return requestRevisionSha256.length > 0
    ? `sha256:${requestRevisionSha256}`
    : "not recorded";
}

function formatEvidenceSource(evidenceContext) {
  const sourceLabel = evidenceContext.sourceLabel.trim();

  if (sourceLabel.length > 0) {
    return sourceLabel;
  }

  const source = evidenceContext.source.trim();

  return source.length > 0 ? source : "not recorded";
}

function formatEvidenceIntegrity(evidenceContext) {
  const integrityState = evidenceContext.integrityState.trim();

  if (integrityState.length === 0) {
    return "not recorded";
  }

  if (integrityState === "verified") {
    const sha256 = evidenceContext.expectedSha256.trim() || evidenceContext.actualSha256.trim();
    const sizeBytes =
      evidenceContext.expectedSizeBytes > 0
        ? evidenceContext.expectedSizeBytes
        : evidenceContext.actualSizeBytes;

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

export function buildInteractionAuditHandoffSummaryFromExport(signoffExport) {
  const surfaces = Array.isArray(signoffExport?.surfaces)
    ? signoffExport.surfaces.map((surface) => {
        const manualChecks = normalizeManualChecks(surface?.manualChecks);
        const pendingManualChecks = manualChecks
          .filter((check) => !check.completed)
          .map((check) => check.label)
          .filter((label) => label.length > 0);
        const signoffStatus = normalizeSignoffStatus(surface?.signoffStatus);

        return {
          id: typeof surface?.id === "string" ? surface.id : "",
          title: typeof surface?.title === "string" ? surface.title : "",
          description:
            typeof surface?.description === "string" ? surface.description : "",
          signoffStatus,
          operatorNotes:
            typeof surface?.operatorNotes === "string"
              ? surface.operatorNotes.trim()
              : "",
          completedManualCheckCount:
            manualChecks.length - pendingManualChecks.length,
          totalManualCheckCount: manualChecks.length,
          pendingManualChecks,
          manualChecks,
        };
      })
    : [];
  const reviewedSurfaceCount = surfaces.filter(
    (surface) => surface.signoffStatus !== "not_reviewed",
  ).length;
  const passSurfaceCount = surfaces.filter(
    (surface) => surface.signoffStatus === "pass",
  ).length;
  const followUpSurfaceCount = surfaces.filter(
    (surface) => surface.signoffStatus === "follow_up",
  ).length;
  const notReviewedSurfaces = surfaces.filter(
    (surface) => surface.signoffStatus === "not_reviewed",
  );
  const followUpSurfaces = surfaces.filter(
    (surface) => surface.signoffStatus === "follow_up",
  );
  const surfacesWithPendingChecks = surfaces.filter(
    (surface) => surface.pendingManualChecks.length > 0,
  );
  const totalManualCheckCount = surfaces.reduce(
    (count, surface) => count + surface.totalManualCheckCount,
    0,
  );
  const completedManualCheckCount = surfaces.reduce(
    (count, surface) => count + surface.completedManualCheckCount,
    0,
  );
  const pendingManualCheckCount = surfaces.reduce(
    (count, surface) => count + surface.pendingManualChecks.length,
    0,
  );

  return {
    totalSurfaceCount: surfaces.length,
    reviewedSurfaceCount,
    passSurfaceCount,
    followUpSurfaceCount,
    notReviewedSurfaceCount: notReviewedSurfaces.length,
    totalManualCheckCount,
    completedManualCheckCount,
    pendingManualCheckCount,
    readyForSignoff:
      surfaces.length > 0 &&
      reviewedSurfaceCount === surfaces.length &&
      followUpSurfaceCount === 0 &&
      pendingManualCheckCount === 0,
    surfaces,
    followUpSurfaces,
    notReviewedSurfaces,
    surfacesWithPendingChecks,
  };
}

export function buildInteractionAuditHandoffSummaryMarkdown(summary, requestContext) {
  return buildInteractionAuditHandoffSummaryMarkdownWithMetadata(summary, {
    reviewerName: "",
    sessionLabel: "",
    reviewedAt: "",
  }, requestContext);
}

export function buildInteractionAuditHandoffSummaryMarkdownWithMetadata(
  summary,
  metadata,
  requestContext,
) {
  const normalizedMetadata = normalizeMetadata(metadata);
  const normalizedRequestContext = normalizeRequestContext(requestContext);
  const lines = [
    "# Interaction Audit Handoff Summary",
    "",
    "This summary reflects the exported audit-hub workspace state and highlights what still blocks final operator signoff.",
    "",
    "Review session:",
    `- Reviewer: ${normalizedMetadata.reviewerName.trim().length > 0 ? normalizedMetadata.reviewerName.trim() : "not set"}`,
    `- Session: ${normalizedMetadata.sessionLabel.trim().length > 0 ? normalizedMetadata.sessionLabel.trim() : "not set"}`,
    `- Reviewed at: ${normalizedMetadata.reviewedAt.trim().length > 0 ? normalizedMetadata.reviewedAt.trim() : "not set"}`,
    `- Request binding: ${formatRequestBinding(normalizedRequestContext)}`,
    `- Request revision: ${formatRequestRevision(normalizedRequestContext)}`,
    "",
    `Ready for signoff: ${summary.readyForSignoff ? "yes" : "no"}`,
    `Reviewed surfaces: ${summary.reviewedSurfaceCount} / ${summary.totalSurfaceCount}`,
    `Pass: ${summary.passSurfaceCount}`,
    `Follow-up required: ${summary.followUpSurfaceCount}`,
    `Not reviewed: ${summary.notReviewedSurfaceCount}`,
    `Pending checks: ${summary.pendingManualCheckCount} / ${summary.totalManualCheckCount}`,
    "",
    "## Follow-up required",
    "",
  ];

  if (summary.followUpSurfaces.length === 0) {
    lines.push("- none");
    lines.push("");
  } else {
    for (const surface of summary.followUpSurfaces) {
      lines.push(`### ${surface.title}`);
      lines.push("");
      lines.push(
        `- Pending checks: ${surface.pendingManualChecks.length} / ${surface.totalManualCheckCount}`,
      );
      lines.push(
        `- Notes: ${surface.operatorNotes.length > 0 ? surface.operatorNotes : "none yet"}`,
      );
      lines.push("");
    }
  }

  lines.push("## Not reviewed");
  lines.push("");

  if (summary.notReviewedSurfaces.length === 0) {
    lines.push("- none");
    lines.push("");
  } else {
    for (const surface of summary.notReviewedSurfaces) {
      lines.push(
        `- ${surface.title} (${surface.pendingManualChecks.length} pending checks)`,
      );
    }
    lines.push("");
  }

  lines.push("## Pending manual checks");
  lines.push("");

  if (summary.surfacesWithPendingChecks.length === 0) {
    lines.push("- none");
    lines.push("");
  } else {
    for (const surface of summary.surfacesWithPendingChecks) {
      lines.push(`### ${surface.title}`);
      lines.push("");

      for (const check of surface.pendingManualChecks) {
        lines.push(`- ${check}`);
      }

      lines.push("");
      lines.push(
        `- Notes: ${surface.operatorNotes.length > 0 ? surface.operatorNotes : "none yet"}`,
      );
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

export function buildInteractionAuditHandoffBundle({
  signoffExport,
  evidenceReport,
  sourceSignoffExport,
  sourceEvidencePack,
  evidenceContext,
  generatedAt,
}) {
  const summary = buildInteractionAuditHandoffSummaryFromExport(signoffExport);
  const reviewSession = normalizeMetadata(signoffExport?.metadata);
  const requestContext = normalizeRequestContext(signoffExport?.requestContext);
  const normalizedEvidenceContext = normalizeEvidenceContext(evidenceContext);
  const evidenceBySurfaceTitle = new Map();
  const evidenceItems = Array.isArray(evidenceReport?.evidenceItems)
    ? evidenceReport.evidenceItems
    : [];

  for (const item of evidenceItems) {
    const surfaceTitle =
      typeof item?.surfaceTitle === "string" ? item.surfaceTitle : "";

    if (surfaceTitle.length === 0) {
      continue;
    }

    const currentItems = evidenceBySurfaceTitle.get(surfaceTitle) ?? [];
    currentItems.push({
      label: typeof item?.label === "string" ? item.label : "",
      expectation: typeof item?.expectation === "string" ? item.expectation : "",
      screenshot: typeof item?.screenshot === "string" ? item.screenshot : "",
      auditStatus:
        typeof item?.auditStatus?.message === "string"
          ? item.auditStatus.message
          : "",
    });
    evidenceBySurfaceTitle.set(surfaceTitle, currentItems);
  }

  const surfaces = summary.surfaces.map((surface) => ({
    ...surface,
    linkedEvidence: evidenceBySurfaceTitle.get(surface.title) ?? [],
  }));

  return {
    generatedAt,
    sourceSignoffExport,
    sourceEvidencePack,
    reviewSession,
    requestContext,
    evidenceContext: normalizedEvidenceContext,
    summary: {
      readyForSignoff: summary.readyForSignoff,
      totalSurfaceCount: summary.totalSurfaceCount,
      reviewedSurfaceCount: summary.reviewedSurfaceCount,
      passSurfaceCount: summary.passSurfaceCount,
      followUpSurfaceCount: summary.followUpSurfaceCount,
      notReviewedSurfaceCount: summary.notReviewedSurfaceCount,
      completedManualCheckCount: summary.completedManualCheckCount,
      totalManualCheckCount: summary.totalManualCheckCount,
      pendingManualCheckCount: summary.pendingManualCheckCount,
    },
    handoffSummaryMarkdown: buildInteractionAuditHandoffSummaryMarkdownWithMetadata(
      summary,
      reviewSession,
      requestContext,
    ),
    surfaces,
  };
}

export function buildInteractionAuditHandoffBundleMarkdown(bundle) {
  const lines = [
    "# Interaction Audit Handoff Bundle",
    "",
    `Generated: ${bundle.generatedAt}`,
    `Source signoff export: \`${bundle.sourceSignoffExport}\``,
    `Source evidence pack: \`${bundle.sourceEvidencePack}\``,
    `Evidence source: ${formatEvidenceSource(bundle.evidenceContext)}`,
    `Evidence items: ${bundle.evidenceContext.evidenceItemCount}`,
    `Evidence integrity: ${formatEvidenceIntegrity(bundle.evidenceContext)}`,
    "",
    "## Current workspace handoff summary",
    "",
    bundle.handoffSummaryMarkdown.trim(),
    "",
    "## Linked preset evidence",
    "",
  ];

  for (const surface of bundle.surfaces) {
    lines.push(`### ${surface.title}`);
    lines.push("");

    if (surface.linkedEvidence.length === 0) {
      lines.push("- No linked preset evidence was found for this surface.");
      lines.push("");
      continue;
    }

    for (const item of surface.linkedEvidence) {
      lines.push(
        `- ${item.label}: ${item.expectation} Evidence: \`${item.screenshot}\`. Latest audit state: ${item.auditStatus}`,
      );
    }

    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}
