import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildInteractionAuditReviewExpectedShape,
  INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
  INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS,
  buildInteractionAuditReviewTemplateDriftError,
  normalizeInteractionAuditReviewExpectedShape,
} from "./interaction-audit-review-request.mjs";

function normalizeSummary(value) {
  return {
    readyForSignoff: Boolean(value?.readyForSignoff),
    reviewedSurfaceCount:
      typeof value?.reviewedSurfaceCount === "number"
        ? value.reviewedSurfaceCount
        : 0,
    totalSurfaceCount:
      typeof value?.totalSurfaceCount === "number" ? value.totalSurfaceCount : 0,
    followUpSurfaceCount:
      typeof value?.followUpSurfaceCount === "number"
        ? value.followUpSurfaceCount
        : 0,
    notReviewedSurfaceCount:
      typeof value?.notReviewedSurfaceCount === "number"
        ? value.notReviewedSurfaceCount
        : 0,
    pendingManualCheckCount:
      typeof value?.pendingManualCheckCount === "number"
        ? value.pendingManualCheckCount
        : 0,
    totalManualCheckCount:
      typeof value?.totalManualCheckCount === "number"
        ? value.totalManualCheckCount
        : 0,
  };
}

function normalizeFulfillment(value) {
  return {
    fulfilledAt: typeof value?.fulfilledAt === "string" ? value.fulfilledAt : "",
    sourceCompletedSignoffExport:
      typeof value?.sourceCompletedSignoffExport === "string"
        ? value.sourceCompletedSignoffExport
        : "",
    archiveId: typeof value?.archiveId === "string" ? value.archiveId : "",
    archiveReadmePath:
      typeof value?.archiveReadmePath === "string" ? value.archiveReadmePath : "",
    archiveManifestPath:
      typeof value?.archiveManifestPath === "string"
        ? value.archiveManifestPath
        : "",
    completedReviewSession: {
      reviewerName:
        typeof value?.completedReviewSession?.reviewerName === "string"
          ? value.completedReviewSession.reviewerName
          : "",
      sessionLabel:
        typeof value?.completedReviewSession?.sessionLabel === "string"
          ? value.completedReviewSession.sessionLabel
          : "",
      reviewedAt:
        typeof value?.completedReviewSession?.reviewedAt === "string"
          ? value.completedReviewSession.reviewedAt
          : "",
    },
    completedRequestContext: {
      requestId:
        typeof value?.completedRequestContext?.requestId === "string"
          ? value.completedRequestContext.requestId
          : "",
      requestCreatedAt:
        typeof value?.completedRequestContext?.requestCreatedAt === "string"
          ? value.completedRequestContext.requestCreatedAt
          : "",
      requestRevisionSha256:
        typeof value?.completedRequestContext?.requestRevisionSha256 === "string"
          ? value.completedRequestContext.requestRevisionSha256
          : "",
    },
    completedEvidenceContext: {
      source:
        typeof value?.completedEvidenceContext?.source === "string"
          ? value.completedEvidenceContext.source
          : "",
      sourceLabel:
        typeof value?.completedEvidenceContext?.sourceLabel === "string"
          ? value.completedEvidenceContext.sourceLabel
          : "",
      selectedPath:
        typeof value?.completedEvidenceContext?.selectedPath === "string"
          ? value.completedEvidenceContext.selectedPath
          : "",
      integrityState:
        typeof value?.completedEvidenceContext?.integrityState === "string"
          ? value.completedEvidenceContext.integrityState
          : "",
      integrityOk:
        typeof value?.completedEvidenceContext?.integrityOk === "boolean"
          ? value.completedEvidenceContext.integrityOk
          : false,
      evidenceItemCount:
        typeof value?.completedEvidenceContext?.evidenceItemCount === "number"
          ? value.completedEvidenceContext.evidenceItemCount
          : 0,
    },
    completedSignoffExportDigest: {
      sha256:
        typeof value?.completedSignoffExportDigest?.sha256 === "string"
          ? value.completedSignoffExportDigest.sha256
          : "",
      sizeBytes:
        typeof value?.completedSignoffExportDigest?.sizeBytes === "number"
          ? value.completedSignoffExportDigest.sizeBytes
          : 0,
    },
    summary: normalizeSummary(value?.summary),
  };
}

function normalizeTemplateDrift(value) {
  return {
    state: typeof value?.state === "string" ? value.state : "not_applicable",
    mismatchError:
      typeof value?.mismatchError === "string" ? value.mismatchError : "",
    sourceTemplatePath:
      typeof value?.sourceTemplatePath === "string" ? value.sourceTemplatePath : "",
    currentShape: normalizeInteractionAuditReviewExpectedShape(value?.currentShape),
  };
}

function normalizeSupersededBy(value) {
  return {
    supersededAt:
      typeof value?.supersededAt === "string" ? value.supersededAt : "",
    reason: typeof value?.reason === "string" ? value.reason : "",
    replacementRequestId:
      typeof value?.replacementRequestId === "string"
        ? value.replacementRequestId
        : "",
    replacementRequestReadmePath:
      typeof value?.replacementRequestReadmePath === "string"
        ? value.replacementRequestReadmePath
        : "",
    replacementRequestManifestPath:
      typeof value?.replacementRequestManifestPath === "string"
        ? value.replacementRequestManifestPath
        : "",
  };
}

function normalizeRequestRecord(record, manifestPath, projectRoot, templateDrift) {
  const evidenceSnapshotArtifact =
    typeof record?.artifacts?.evidencePack === "string"
      ? record.artifacts.evidencePack
      : "";
  const evidenceSnapshot =
    record?.evidenceSnapshot &&
    typeof record.evidenceSnapshot === "object" &&
    typeof record.evidenceSnapshot.sha256 === "string" &&
    typeof record.evidenceSnapshot.sizeBytes === "number"
      ? {
          path:
            typeof record.evidenceSnapshot.path === "string"
              ? record.evidenceSnapshot.path
              : evidenceSnapshotArtifact,
          sha256: record.evidenceSnapshot.sha256,
          sizeBytes: record.evidenceSnapshot.sizeBytes,
        }
      : null;

  return {
    requestId: typeof record?.requestId === "string" ? record.requestId : "",
    createdAt: typeof record?.createdAt === "string" ? record.createdAt : "",
    requestRevisionSha256:
      typeof record?.requestRevisionSha256 === "string"
        ? record.requestRevisionSha256
        : "",
    status:
      typeof record?.status === "string"
        ? record.status
        : INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
    sourceTemplate:
      typeof record?.sourceTemplate === "string" ? record.sourceTemplate : "",
    sourceEvidencePack:
      typeof record?.sourceEvidencePack === "string" ? record.sourceEvidencePack : "",
    evidenceSnapshotPath:
      evidenceSnapshotArtifact.trim().length > 0
        ? path.relative(
            projectRoot,
            path.join(path.dirname(manifestPath), evidenceSnapshotArtifact),
          )
        : "",
    evidenceSnapshotSha256: evidenceSnapshot?.sha256 ?? "",
    evidenceSnapshotSizeBytes: evidenceSnapshot?.sizeBytes ?? 0,
    expectedShape: normalizeInteractionAuditReviewExpectedShape(record?.expectedShape),
    templateDrift: normalizeTemplateDrift(templateDrift),
    supersededBy: normalizeSupersededBy(record?.supersededBy),
    fulfillment: normalizeFulfillment(record?.fulfillment),
    readmePath: path.relative(
      projectRoot,
      path.join(path.dirname(manifestPath), "README.md"),
    ),
    manifestPath: path.relative(projectRoot, manifestPath),
  };
}

function displayDate(value) {
  return typeof value === "string" && value.trim().length >= 10
    ? value.trim().slice(0, 10)
    : "unknown";
}

function inlineCodeOrFallback(value) {
  return typeof value === "string" && value.trim().length > 0
    ? `\`${value.trim()}\``
    : "not set";
}

function compareRequestRecords(left, right) {
  const leftDate = left.fulfillment.fulfilledAt || left.createdAt || "";
  const rightDate = right.fulfillment.fulfilledAt || right.createdAt || "";

  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  return right.requestId.localeCompare(left.requestId);
}

function buildTemplateDriftSummary(record) {
  switch (record.templateDrift.state) {
    case "aligned":
      return "`aligned with current source template`";
    case "shape_mismatch":
      return "`shape mismatch with current source template`";
    case "source_template_missing":
      return "`source template missing`";
    case "source_template_invalid":
      return "`source template invalid`";
    default:
      return "`not checked`";
  }
}

function buildSupersededReplacementLabel(record) {
  if (record.supersededBy.replacementRequestId.trim().length === 0) {
    return "not set";
  }

  if (record.supersededBy.replacementRequestReadmePath.trim().length === 0) {
    return `\`${record.supersededBy.replacementRequestId.trim()}\``;
  }

  return `[${record.supersededBy.replacementRequestId.trim()}](./${record.supersededBy.replacementRequestReadmePath.replace(/^Doc\/testing\//, "")})`;
}

function buildEvidenceSnapshotIntegrityLabel(record) {
  return record.evidenceSnapshotSha256.trim().length > 0
    ? `\`sha256:${record.evidenceSnapshotSha256} (${record.evidenceSnapshotSizeBytes} bytes)\``
    : "`not recorded`";
}

function buildRequestRevisionLabel(record) {
  return record.requestRevisionSha256.trim().length > 0
    ? `\`sha256:${record.requestRevisionSha256}\``
    : "`not recorded`";
}

function buildCompletedRequestRevisionLabel(record) {
  return record.fulfillment.completedRequestContext.requestRevisionSha256.trim().length >
    0
    ? `\`sha256:${record.fulfillment.completedRequestContext.requestRevisionSha256}\``
    : "`not recorded`";
}

function buildCompletedEvidenceSourceLabel(record) {
  const sourceLabel = record.fulfillment.completedEvidenceContext.sourceLabel.trim();
  const source = record.fulfillment.completedEvidenceContext.source.trim();

  return sourceLabel.length > 0
    ? `\`${sourceLabel}\``
    : source.length > 0
      ? `\`${source}\``
      : "`not recorded`";
}

function buildCompletedEvidenceIntegrityLabel(record) {
  const integrityState = record.fulfillment.completedEvidenceContext.integrityState.trim();

  return integrityState.length > 0
    ? `\`${integrityState}\``
    : "`not recorded`";
}

function buildCompletedExportDigestLabel(record) {
  return record.fulfillment.completedSignoffExportDigest.sha256.trim().length > 0
    ? `\`sha256:${record.fulfillment.completedSignoffExportDigest.sha256} (${record.fulfillment.completedSignoffExportDigest.sizeBytes} bytes)\``
    : "`not recorded`";
}

function buildCompletedRequestBindingLabel(record) {
  const requestId = record.fulfillment.completedRequestContext.requestId.trim();
  const requestCreatedAt =
    record.fulfillment.completedRequestContext.requestCreatedAt.trim();

  if (requestId.length === 0) {
    return "`not recorded`";
  }

  if (requestCreatedAt.length === 0) {
    return `\`${requestId}\``;
  }

  return `\`${requestId} @ ${requestCreatedAt}\``;
}

function buildSectionLines(records, emptyMessage) {
  if (records.length === 0) {
    return [`- ${emptyMessage}`, ""];
  }

  const lines = [];

  for (const record of records) {
    lines.push(`- [${record.requestId}](./${record.readmePath.replace(/^Doc\/testing\//, "")})`);
    lines.push(`  - status: \`${record.status}\``);
    lines.push(`  - created on ${displayDate(record.createdAt)}`);

    if (
      record.status === INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS &&
      record.fulfillment.archiveId.trim().length > 0
    ) {
      lines.push(
        `  - fulfilled on ${displayDate(record.fulfillment.fulfilledAt)}`,
      );
      lines.push(
        `  - archive: [${record.fulfillment.archiveId}](./${record.fulfillment.archiveReadmePath.replace(/^Doc\/testing\//, "")})`,
      );
      lines.push(
        `  - current truth: \`Ready for signoff: ${record.fulfillment.summary.readyForSignoff ? "yes" : "no"}\`, \`Follow-up required: ${record.fulfillment.summary.followUpSurfaceCount}\`, \`Not reviewed: ${record.fulfillment.summary.notReviewedSurfaceCount}\`, \`Pending checks: ${record.fulfillment.summary.pendingManualCheckCount} / ${record.fulfillment.summary.totalManualCheckCount}\``,
      );
      lines.push(
        `  - completed signoff export: ${inlineCodeOrFallback(record.fulfillment.sourceCompletedSignoffExport)}`,
      );
      lines.push(
        `  - completion request binding: ${buildCompletedRequestBindingLabel(record)}`,
      );
      lines.push(
        `  - completion request revision: ${buildCompletedRequestRevisionLabel(record)}`,
      );
      lines.push(
        `  - completion evidence source: ${buildCompletedEvidenceSourceLabel(record)}`,
      );
      lines.push(
        `  - completion evidence integrity: ${buildCompletedEvidenceIntegrityLabel(record)}`,
      );
      lines.push(
        `  - completed export digest: ${buildCompletedExportDigestLabel(record)}`,
      );
    } else if (
      record.status === INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS &&
      record.supersededBy.replacementRequestId.trim().length > 0
    ) {
      lines.push(
        `  - superseded on ${displayDate(record.supersededBy.supersededAt)}`,
      );
      lines.push(
        `  - replacement request: ${buildSupersededReplacementLabel(record)}`,
      );
      lines.push(
        `  - reason: ${inlineCodeOrFallback(record.supersededBy.reason)}`,
      );
    } else {
      lines.push(
        `  - source evidence seed: ${inlineCodeOrFallback(record.sourceEvidencePack)}`,
      );
      lines.push(
        `  - request evidence snapshot: ${inlineCodeOrFallback(record.evidenceSnapshotPath)}`,
      );
      lines.push(
        `  - request evidence snapshot integrity: ${buildEvidenceSnapshotIntegrityLabel(record)}`,
      );
      lines.push(`  - request revision: ${buildRequestRevisionLabel(record)}`);
      lines.push(
        `  - template drift: ${buildTemplateDriftSummary(record)}`,
      );
      if (record.templateDrift.state !== "aligned") {
        lines.push(
          `  - drift note: ${inlineCodeOrFallback(record.templateDrift.mismatchError)}`,
        );
      }
    }
  }

  lines.push("");
  return lines;
}

export function buildInteractionAuditReviewRequestIndexMarkdown({
  generatedAt,
  requestRootRelative,
  records,
}) {
  const pendingRecords = records.filter(
    (record) => record.status === INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  );
  const fulfilledRecords = records.filter(
    (record) =>
      record.status === INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
  );
  const otherRecords = records.filter(
    (record) =>
      record.status !== INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS &&
      record.status !== INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
  );
  const lines = [
    "# Interaction Audit Review Requests",
    "",
    `Date: ${displayDate(records[0]?.fulfillment.fulfilledAt || records[0]?.createdAt || generatedAt)}`,
    "",
    "Process rule:",
    "",
    "- follow [Development_Guardrails.md](../Development_Guardrails.md)",
    "",
    "Purpose:",
    "",
    "- track repo-backed interaction-audit review requests before and after fulfillment",
    "- distinguish pending request packages from fulfilled requests that now point at a durable archived review",
    "",
    "Managed note:",
    "",
    `- this file is regenerated from \`review-request.json\` manifests inside \`${requestRootRelative}\``,
    "- rerun `npm run interaction-audit:refresh-review-request-index` after adding, removing, or editing a request manifest outside the main request commands",
    "",
    "## Request Commands",
    "",
    "Create a new pending operator review request:",
    "",
    "```bash",
    "npm run interaction-audit:create-review-request -- --request-id 2026-04-23-first-real-operator-review-request",
    "```",
    "",
    "Fulfill an existing pending request with an exported signoff JSON:",
    "",
    "```bash",
    "npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json",
    "```",
    "",
    "By default, completion uses the pending request package's evidence snapshot. Pass `--evidence ...` only when you intentionally need the archive to preserve a different evidence report path.",
    "",
    "Preflight one pending request without writing archive output:",
    "",
    "```bash",
    "npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json",
    "```",
    "",
    "Regenerate one drifted pending request into one aligned replacement request:",
    "",
    "```bash",
    "npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-23-first-real-operator-review-request",
    "```",
    "",
    "Refresh only the generated request index and machine-readable catalog:",
    "",
    "```bash",
    "npm run interaction-audit:refresh-review-request-index",
    "```",
    "",
    "## Truth Rules",
    "",
    "- a pending request package is not a completed human review",
    "- a stale pending request whose current source template has drifted should be regenerated before completion instead of being treated as current review scope",
    "- a pending request whose evidence snapshot is unreadable or structurally invalid should be fixed before completion instead of being archived with an unrelated fallback report",
    "- a pending request whose evidence snapshot no longer matches the digest recorded in its manifest should be refreshed before completion instead of being archived as if the package were unchanged",
    "- an exported workspace bound to an older request revision should be re-exported from the current request package instead of being fulfilled against one refreshed request with the same request id",
    "- a superseded request preserves stale request history and should point at its aligned replacement request instead of being reused",
    "- fulfilling a request links it to one archived exported review state; it does not rewrite unresolved follow-up or not-reviewed work into a pass claim",
    "- fulfilled requests should preserve their completion receipt metadata, including request revision, evidence provenance, and exported-file digest, instead of requiring raw archive inspection for every receipt detail",
    "- fulfilled requests should keep pointing at the durable archive record instead of duplicating that archive as a second source of truth",
    "",
    "## Pending Requests",
    "",
    ...buildSectionLines(
      pendingRecords,
      "no pending operator review requests are recorded yet",
    ),
    "## Fulfilled Requests",
    "",
    ...buildSectionLines(
      fulfilledRecords,
      "no fulfilled request records are recorded yet",
    ),
  ];

  if (otherRecords.length > 0) {
    lines.push("## Other Request States");
    lines.push("");
    lines.push(...buildSectionLines(otherRecords, "no other request states are recorded"));
  }

  return `${lines.join("\n").trim()}\n`;
}

async function resolveInteractionAuditReviewRequestTemplateDrift({
  projectRoot,
  record,
}) {
  if (record.status !== INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS) {
    return {
      state: "not_applicable",
      mismatchError: "",
      sourceTemplatePath: "",
      currentShape: normalizeInteractionAuditReviewExpectedShape(undefined),
    };
  }

  const sourceTemplateRelativePath =
    typeof record.sourceTemplate === "string" ? record.sourceTemplate.trim() : "";

  if (sourceTemplateRelativePath.length === 0) {
    return {
      state: "source_template_missing",
      mismatchError: "Pending request source template path was not set.",
      sourceTemplatePath: "",
      currentShape: normalizeInteractionAuditReviewExpectedShape(undefined),
    };
  }

  const sourceTemplatePath = path.resolve(projectRoot, sourceTemplateRelativePath);
  const rawTemplate = await readFile(sourceTemplatePath, "utf8").catch(() => null);

  if (!rawTemplate) {
    return {
      state: "source_template_missing",
      mismatchError: `Pending request source template \`${sourceTemplateRelativePath}\` could not be read.`,
      sourceTemplatePath: sourceTemplateRelativePath,
      currentShape: normalizeInteractionAuditReviewExpectedShape(undefined),
    };
  }

  let parsedTemplate;

  try {
    parsedTemplate = JSON.parse(rawTemplate);
  } catch {
    return {
      state: "source_template_invalid",
      mismatchError: `Pending request source template \`${sourceTemplateRelativePath}\` was not valid JSON.`,
      sourceTemplatePath: sourceTemplateRelativePath,
      currentShape: normalizeInteractionAuditReviewExpectedShape(undefined),
    };
  }

  if (!Array.isArray(parsedTemplate?.surfaces)) {
    return {
      state: "source_template_invalid",
      mismatchError: `Pending request source template \`${sourceTemplateRelativePath}\` did not contain a valid \`surfaces\` array.`,
      sourceTemplatePath: sourceTemplateRelativePath,
      currentShape: normalizeInteractionAuditReviewExpectedShape(undefined),
    };
  }

  const currentShape = buildInteractionAuditReviewExpectedShape(parsedTemplate);
  const mismatchError = buildInteractionAuditReviewTemplateDriftError({
    expectedShape: record.expectedShape,
    currentTemplate: parsedTemplate,
  });

  return {
    state: mismatchError.length === 0 ? "aligned" : "shape_mismatch",
    mismatchError,
    sourceTemplatePath: sourceTemplateRelativePath,
    currentShape,
  };
}

export async function collectInteractionAuditReviewRequestRecords({
  requestRoot,
  projectRoot,
}) {
  const entries = await readdir(requestRoot, { withFileTypes: true }).catch(() => []);
  const records = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifestPath = path.join(requestRoot, entry.name, "review-request.json");
    const raw = await readFile(manifestPath, "utf8").catch(() => null);

    if (!raw) {
      continue;
    }

    const parsed = JSON.parse(raw);
    const templateDrift = await resolveInteractionAuditReviewRequestTemplateDrift({
      projectRoot,
      record: parsed,
    });
    records.push(
      normalizeRequestRecord(parsed, manifestPath, projectRoot, templateDrift),
    );
  }

  return records.sort(compareRequestRecords);
}

export async function writeInteractionAuditReviewRequestIndex({
  projectRoot,
  requestRoot,
  generatedAt,
  indexMarkdownPath,
  indexJsonPath,
}) {
  const records = await collectInteractionAuditReviewRequestRecords({
    requestRoot,
    projectRoot,
  });
  const requestRootRelative = path.relative(projectRoot, requestRoot);
  const markdown = buildInteractionAuditReviewRequestIndexMarkdown({
    generatedAt,
    requestRootRelative,
    records,
  });

  await mkdir(path.dirname(indexMarkdownPath), { recursive: true });
  await mkdir(path.dirname(indexJsonPath), { recursive: true });
  await writeFile(indexMarkdownPath, markdown, "utf8");
  await writeFile(
    indexJsonPath,
    JSON.stringify(
      {
        generatedAt,
        requestRoot: requestRootRelative,
        pendingRequestCount: records.filter(
          (record) =>
            record.status === INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
        ).length,
        fulfilledRequestCount: records.filter(
          (record) =>
            record.status === INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
        ).length,
        records,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    generatedAt,
    requestRootRelative,
    recordCount: records.length,
    pendingRequestCount: records.filter(
      (record) =>
        record.status === INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
    ).length,
    fulfilledRequestCount: records.filter(
      (record) =>
        record.status === INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
    ).length,
    records,
  };
}
