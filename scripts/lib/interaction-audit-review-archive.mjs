import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildInteractionAuditHandoffBundle,
  buildInteractionAuditHandoffBundleMarkdown,
} from "./interaction-audit-handoff-bundle.mjs";

function sanitizeArchiveSegment(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeArchiveDate(value, fallbackIsoString) {
  const candidate =
    typeof value === "string" && value.trim().length >= 10
      ? value.trim().slice(0, 10)
      : fallbackIsoString.slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(candidate)
    ? candidate
    : fallbackIsoString.slice(0, 10);
}

function buildArchiveSlug(signoffExport) {
  const sessionLabel = signoffExport?.metadata?.sessionLabel ?? "";
  const reviewerName = signoffExport?.metadata?.reviewerName ?? "";

  return (
    sanitizeArchiveSegment(sessionLabel) ||
    sanitizeArchiveSegment(reviewerName) ||
    "review-session"
  );
}

function normalizeArchiveRequestContext(value) {
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

function normalizeArchiveEvidenceContext(value) {
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

function formatArchiveRequestBinding(requestContext) {
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

function formatArchiveRequestRevision(requestContext) {
  const requestRevisionSha256 = requestContext.requestRevisionSha256.trim();

  return requestRevisionSha256.length > 0
    ? `sha256:${requestRevisionSha256}`
    : "not recorded";
}

function formatArchiveEvidenceSource(evidenceContext) {
  const sourceLabel = evidenceContext.sourceLabel.trim();

  if (sourceLabel.length > 0) {
    return sourceLabel;
  }

  const source = evidenceContext.source.trim();

  return source.length > 0 ? source : "not recorded";
}

function formatArchiveEvidenceIntegrity(evidenceContext) {
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

export function isInteractionAuditSeededReviewSession(signoffExport) {
  const reviewerName = String(signoffExport?.metadata?.reviewerName ?? "").toLowerCase();
  const sessionLabel = String(signoffExport?.metadata?.sessionLabel ?? "").toLowerCase();

  return reviewerName.includes("seeded") || sessionLabel.includes("seeded");
}

export function buildInteractionAuditReviewArchiveId({
  signoffExport,
  archiveId,
  archivedAt,
}) {
  if (typeof archiveId === "string" && archiveId.trim().length > 0) {
    return sanitizeArchiveSegment(archiveId);
  }

  const dateSegment = normalizeArchiveDate(
    signoffExport?.metadata?.reviewedAt,
    archivedAt,
  );
  const slug = buildArchiveSlug(signoffExport);

  return `${dateSegment}-${slug}`;
}

export function buildInteractionAuditReviewArchiveRecord({
  signoffExport,
  evidenceReport,
  sourceSignoffExport,
  sourceEvidencePack,
  evidenceContext = null,
  sourceRequest = null,
  archiveId,
  archivedAt,
}) {
  const bundle = buildInteractionAuditHandoffBundle({
    signoffExport,
    evidenceReport,
    sourceSignoffExport,
    sourceEvidencePack,
    evidenceContext,
    generatedAt: archivedAt,
  });
  const bundleMarkdown = buildInteractionAuditHandoffBundleMarkdown(bundle);
  const seeded = isInteractionAuditSeededReviewSession(signoffExport);

  const normalizedSourceRequest =
    sourceRequest &&
    typeof sourceRequest === "object" &&
    typeof sourceRequest.requestId === "string" &&
    sourceRequest.requestId.trim().length > 0
      ? {
          requestId: sourceRequest.requestId.trim(),
          requestReadmePath:
            typeof sourceRequest.requestReadmePath === "string"
              ? sourceRequest.requestReadmePath
              : "",
          requestManifestPath:
            typeof sourceRequest.requestManifestPath === "string"
              ? sourceRequest.requestManifestPath
              : "",
        }
      : null;

  const manifest = {
    archiveId,
    archivedAt,
    seeded,
    sourceSignoffExport,
    sourceEvidencePack,
    reviewSession: bundle.reviewSession,
    requestContext: normalizeArchiveRequestContext(bundle.requestContext),
    evidenceContext: normalizeArchiveEvidenceContext(bundle.evidenceContext),
    summary: bundle.summary,
    artifacts: {
      signoffExport: "interaction-audit-signoff-export.json",
      handoffBundleMarkdown: "interaction-audit-handoff-bundle.md",
      handoffBundleJson: "interaction-audit-handoff-bundle.json",
      archiveRecord: "review-archive.json",
      archiveReadme: "README.md",
    },
  };

  if (normalizedSourceRequest) {
    manifest.sourceRequest = normalizedSourceRequest;
  }

  const readmeLines = [
    "# Interaction Audit Review Archive",
    "",
    "Document class:",
    "",
    "- closed evidence",
    "",
    "Status note:",
    "",
    "- this package README is generated from one archived review record and should be regenerated from the archive record if rendering rules change, not hand-edited to alter the archived outcome",
    seeded
      ? "- this specific archive is a seeded internal baseline and does not claim a completed human operator signoff"
      : "- this specific archive mirrors one archived exported workspace state only and does not rewrite unresolved follow-up or not-reviewed work into a pass claim",
    "",
    `Archive ID: \`${archiveId}\``,
    `Archived at: ${archivedAt}`,
    `Source signoff export: \`${sourceSignoffExport}\``,
    `Source evidence pack: \`${sourceEvidencePack}\``,
    "",
  ];

  if (normalizedSourceRequest) {
    readmeLines.push("Source request:");
    readmeLines.push(
      `- Request ID: \`${normalizedSourceRequest.requestId}\``,
    );
    readmeLines.push(
      `- Request README: ${normalizedSourceRequest.requestReadmePath.trim().length > 0 ? `\`${normalizedSourceRequest.requestReadmePath}\`` : "not set"}`,
    );
    readmeLines.push(
      `- Request manifest: ${normalizedSourceRequest.requestManifestPath.trim().length > 0 ? `\`${normalizedSourceRequest.requestManifestPath}\`` : "not set"}`,
    );
    readmeLines.push("");
  }

  readmeLines.push(
    "Review session:",
    `- Reviewer: ${bundle.reviewSession.reviewerName.trim().length > 0 ? bundle.reviewSession.reviewerName.trim() : "not set"}`,
    `- Session: ${bundle.reviewSession.sessionLabel.trim().length > 0 ? bundle.reviewSession.sessionLabel.trim() : "not set"}`,
    `- Reviewed at: ${bundle.reviewSession.reviewedAt.trim().length > 0 ? bundle.reviewSession.reviewedAt.trim() : "not set"}`,
    `- Request binding: ${formatArchiveRequestBinding(manifest.requestContext)}`,
    `- Request revision: ${formatArchiveRequestRevision(manifest.requestContext)}`,
    `- Evidence source: ${formatArchiveEvidenceSource(manifest.evidenceContext)}`,
    `- Evidence items: ${manifest.evidenceContext.evidenceItemCount}`,
    `- Evidence integrity: ${formatArchiveEvidenceIntegrity(manifest.evidenceContext)}`,
    "",
    `Ready for signoff: ${bundle.summary.readyForSignoff ? "yes" : "no"}`,
    `Reviewed surfaces: ${bundle.summary.reviewedSurfaceCount} / ${bundle.summary.totalSurfaceCount}`,
    `Pass: ${bundle.summary.passSurfaceCount}`,
    `Follow-up required: ${bundle.summary.followUpSurfaceCount}`,
    `Not reviewed: ${bundle.summary.notReviewedSurfaceCount}`,
    `Pending checks: ${bundle.summary.pendingManualCheckCount} / ${bundle.summary.totalManualCheckCount}`,
    "",
    "Archive contents:",
    "- `interaction-audit-signoff-export.json`",
    "- `interaction-audit-handoff-bundle.md`",
    "- `interaction-audit-handoff-bundle.json`",
    "- `review-archive.json`",
    "",
    "Truth note:",
    seeded
      ? "- This archive is a seeded internal baseline. It demonstrates the archive workflow and does not claim a completed human operator signoff."
      : "- This archive mirrors the exported audit-hub workspace state only. It does not rewrite unresolved follow-up or not-reviewed work into a pass claim.",
    "",
  );

  return {
    bundle,
    bundleMarkdown,
    manifest,
    readme: `${readmeLines.join("\n").trim()}\n`,
  };
}

export async function writeInteractionAuditReviewArchive({
  projectRoot,
  signoffExport,
  evidenceReport,
  sourceSignoffExport,
  sourceEvidencePack,
  evidenceContext = null,
  sourceRequest = null,
  archiveRoot,
  archiveId,
  archivedAt,
}) {
  const record = buildInteractionAuditReviewArchiveRecord({
    signoffExport,
    evidenceReport,
    sourceSignoffExport,
    sourceEvidencePack,
    evidenceContext,
    sourceRequest,
    archiveId,
    archivedAt,
  });
  const archiveDir = path.join(archiveRoot, archiveId);

  await mkdir(archiveDir, { recursive: true });
  await writeFile(
    path.join(archiveDir, "interaction-audit-signoff-export.json"),
    JSON.stringify(signoffExport, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(archiveDir, "interaction-audit-handoff-bundle.md"),
    record.bundleMarkdown,
    "utf8",
  );
  await writeFile(
    path.join(archiveDir, "interaction-audit-handoff-bundle.json"),
    JSON.stringify(record.bundle, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(archiveDir, "review-archive.json"),
    JSON.stringify(record.manifest, null, 2),
    "utf8",
  );
  await writeFile(path.join(archiveDir, "README.md"), record.readme, "utf8");

  return {
    archiveDir,
    archiveDirRelative: path.relative(projectRoot, archiveDir),
    manifest: record.manifest,
  };
}
