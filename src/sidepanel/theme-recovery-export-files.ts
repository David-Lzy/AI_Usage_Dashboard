import type { ThemeRecoveryReviewExport } from "./theme-recovery-review";

export type ThemeRecoveryExportKind = "summary-draft" | "export-json";

function sanitizeSlug(value: string, fallback: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (sanitized.length === 0) {
    return fallback;
  }

  return sanitized.slice(0, 40);
}

function normalizeGeneratedDate(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  return "undated";
}

export function buildThemeRecoveryExportFilename(
  kind: ThemeRecoveryExportKind,
  exportValue: ThemeRecoveryReviewExport,
): string {
  const reviewedDate = normalizeGeneratedDate(exportValue.generatedAt);
  const modeSlug = sanitizeSlug(exportValue.themeMode, "mode");
  const stageSlug = sanitizeSlug(exportValue.overallStage, "review");
  const presetSlug = sanitizeSlug(exportValue.themePreset, "preset");
  const requestSlug = exportValue.requestContext?.requestId
    ? `-request-${sanitizeSlug(exportValue.requestContext.requestId, "request")}`
    : "";

  switch (kind) {
    case "summary-draft":
      return `theme-recovery-summary-${reviewedDate}-${modeSlug}-${stageSlug}-${presetSlug}${requestSlug}.md`;
    case "export-json":
      return `theme-recovery-export-${reviewedDate}-${modeSlug}-${stageSlug}-${presetSlug}${requestSlug}.json`;
    default:
      return `theme-recovery-export-${reviewedDate}-${modeSlug}-${stageSlug}${requestSlug}.txt`;
  }
}
