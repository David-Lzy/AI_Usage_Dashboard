import type {
  InteractionAuditSignoffMetadata,
  InteractionAuditSignoffRequestContext,
} from "./interaction-audit-signoff";

export type InteractionAuditExportKind =
  | "signoff-draft"
  | "signoff-json"
  | "handoff-summary";

function sanitizeSlug(value: string, fallback: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (sanitized.length === 0) {
    return fallback;
  }

  return sanitized.slice(0, 48);
}

function normalizeReviewedAtDate(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  return "undated";
}

function normalizeRequestRevisionSegment(value: string): string {
  const trimmed = value.trim().toLowerCase();

  if (trimmed.length === 0) {
    return "";
  }

  const normalized = trimmed.replace(/^sha256:/, "").replace(/[^a-z0-9]+/g, "");

  if (normalized.length === 0) {
    return "";
  }

  return normalized.slice(0, 12);
}

export function buildInteractionAuditExportFilename(
  kind: InteractionAuditExportKind,
  metadata: InteractionAuditSignoffMetadata,
  requestContext?: InteractionAuditSignoffRequestContext,
): string {
  const sessionSlug = sanitizeSlug(metadata.sessionLabel, "review-session");
  const reviewedDate = normalizeReviewedAtDate(metadata.reviewedAt);
  const requestSlug = sanitizeSlug(requestContext?.requestId ?? "", "");
  const requestRevisionSlug = normalizeRequestRevisionSegment(
    requestContext?.requestRevisionSha256 ?? "",
  );
  const scopeSegment = requestSlug.length > 0 ? `-${requestSlug}` : "";
  const revisionSegment =
    requestSlug.length > 0 && requestRevisionSlug.length > 0
      ? `-rev-${requestRevisionSlug}`
      : "";

  switch (kind) {
    case "signoff-draft":
      return `interaction-audit-signoff-draft-${reviewedDate}${scopeSegment}${revisionSegment}-${sessionSlug}.md`;
    case "signoff-json":
      return `interaction-audit-signoff-export-${reviewedDate}${scopeSegment}${revisionSegment}-${sessionSlug}.json`;
    case "handoff-summary":
      return `interaction-audit-handoff-summary-${reviewedDate}${scopeSegment}${revisionSegment}-${sessionSlug}.md`;
    default:
      return `interaction-audit-export-${reviewedDate}${scopeSegment}${revisionSegment}-${sessionSlug}.txt`;
  }
}
