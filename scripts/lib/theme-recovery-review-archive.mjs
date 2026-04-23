import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function sanitizeSegment(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeDate(value, fallbackIsoString) {
  const candidate =
    typeof value === "string" && value.trim().length >= 10
      ? value.trim().slice(0, 10)
      : fallbackIsoString.slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(candidate)
    ? candidate
    : fallbackIsoString.slice(0, 10);
}

function normalizeTime(value, fallbackIsoString) {
  const candidate =
    typeof value === "string" && value.trim().length >= 19
      ? value.trim().slice(11, 19)
      : fallbackIsoString.slice(11, 19);

  return candidate.replace(/[^0-9]/g, "").slice(0, 6) || "000000";
}

function normalizeTargetProvider(value) {
  return {
    providerId: typeof value?.providerId === "string" ? value.providerId : "",
    providerLabel:
      typeof value?.providerLabel === "string" ? value.providerLabel : "",
    visible: Boolean(value?.visible),
    displaySyncStatus:
      typeof value?.displaySyncStatus === "string"
        ? value.displaySyncStatus
        : "warning",
    permissionStatus:
      typeof value?.permissionStatus === "string"
        ? value.permissionStatus
        : "missing",
    currentSourceLabel:
      typeof value?.currentSourceLabel === "string"
        ? value.currentSourceLabel
        : "",
    currentSourceStateKind:
      typeof value?.currentSourceStateKind === "string"
        ? value.currentSourceStateKind
        : "sync_error",
    currentSourceStateLabel:
      typeof value?.currentSourceStateLabel === "string"
        ? value.currentSourceStateLabel
        : "",
    currentSourceStateDetail:
      typeof value?.currentSourceStateDetail === "string"
        ? value.currentSourceStateDetail
        : "",
    currentSourceStateTone:
      typeof value?.currentSourceStateTone === "string"
        ? value.currentSourceStateTone
        : "warning",
    lastSyncLabel:
      typeof value?.lastSyncLabel === "string" ? value.lastSyncLabel : "",
    recoveryLabel:
      typeof value?.recoveryLabel === "string" ? value.recoveryLabel : "",
    recoveryTone:
      typeof value?.recoveryTone === "string" ? value.recoveryTone : "warning",
    recoveryDetail:
      typeof value?.recoveryDetail === "string" ? value.recoveryDetail : "",
    hostAccessLabel:
      typeof value?.hostAccessLabel === "string" ? value.hostAccessLabel : "",
    isRecovered: Boolean(value?.isRecovered),
  };
}

function normalizeActionBadge(value) {
  return {
    text: typeof value?.text === "string" ? value.text : "",
    title: typeof value?.title === "string" ? value.title : "",
  };
}

function normalizeLiveActionBadge(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    available: Boolean(value.available),
    text: typeof value.text === "string" ? value.text : "",
    title: typeof value.title === "string" ? value.title : "",
    sourceLabel: typeof value.sourceLabel === "string" ? value.sourceLabel : "",
  };
}

function normalizeRequestContext(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const requestId =
    typeof value.requestId === "string" ? value.requestId.trim() : "";
  const requestCreatedAt =
    typeof value.requestCreatedAt === "string"
      ? value.requestCreatedAt.trim()
      : "";

  if (requestId.length === 0 || requestCreatedAt.length === 0) {
    return null;
  }

  return {
    requestId,
    requestCreatedAt,
    requestBoundWorkspaceRoute:
      typeof value.requestBoundWorkspaceRoute === "string"
        ? value.requestBoundWorkspaceRoute
        : "",
  };
}

export function normalizeThemeRecoveryReviewExport(value) {
  return {
    generatedAt: typeof value?.generatedAt === "string" ? value.generatedAt : "",
    requestContext: normalizeRequestContext(value?.requestContext),
    themeMode: typeof value?.themeMode === "string" ? value.themeMode : "",
    themePreset: typeof value?.themePreset === "string" ? value.themePreset : "",
    themeResolved:
      typeof value?.themeResolved === "string" ? value.themeResolved : "",
    themeCustomSeedHex:
      typeof value?.themeCustomSeedHex === "string"
        ? value.themeCustomSeedHex
        : null,
    popupSnapshotLabel:
      typeof value?.popupSnapshotLabel === "string"
        ? value.popupSnapshotLabel
        : "",
    popupSnapshotTone:
      typeof value?.popupSnapshotTone === "string"
        ? value.popupSnapshotTone
        : "warning",
    popupSnapshotHeadline:
      typeof value?.popupSnapshotHeadline === "string"
        ? value.popupSnapshotHeadline
        : "",
    popupSnapshotDetail:
      typeof value?.popupSnapshotDetail === "string"
        ? value.popupSnapshotDetail
        : "",
    computedActionBadge: normalizeActionBadge(value?.computedActionBadge),
    scopeIsolationLabel:
      typeof value?.scopeIsolationLabel === "string"
        ? value.scopeIsolationLabel
        : "",
    scopeIsolationDetail:
      typeof value?.scopeIsolationDetail === "string"
        ? value.scopeIsolationDetail
        : "",
    missingTargetProviderIds: Array.isArray(value?.missingTargetProviderIds)
      ? value.missingTargetProviderIds.filter((item) => typeof item === "string")
      : [],
    extraVisibleProviderLabels: Array.isArray(value?.extraVisibleProviderLabels)
      ? value.extraVisibleProviderLabels.filter((item) => typeof item === "string")
      : [],
    overallStage:
      typeof value?.overallStage === "string" ? value.overallStage : "",
    overallLabel:
      typeof value?.overallLabel === "string" ? value.overallLabel : "",
    overallTone:
      typeof value?.overallTone === "string" ? value.overallTone : "warning",
    overallDetail:
      typeof value?.overallDetail === "string" ? value.overallDetail : "",
    targetProviders: Array.isArray(value?.targetProviders)
      ? value.targetProviders.map(normalizeTargetProvider)
      : [],
    liveActionBadge: normalizeLiveActionBadge(value?.liveActionBadge),
  };
}

function buildArchiveSummary(reviewExport) {
  return {
    recoveredProviderCount: reviewExport.targetProviders.filter(
      (provider) => provider.isRecovered,
    ).length,
    needsAccessProviderCount: reviewExport.targetProviders.filter(
      (provider) =>
        provider.recoveryLabel.toLowerCase() === "needs access" ||
        provider.permissionStatus === "missing",
    ).length,
    syncIssueProviderCount: reviewExport.targetProviders.filter(
      (provider) => provider.displaySyncStatus === "error",
    ).length,
    targetProviderCount: reviewExport.targetProviders.length,
    overallStage: reviewExport.overallStage,
    overallLabel: reviewExport.overallLabel,
    scopeIsolationLabel: reviewExport.scopeIsolationLabel,
    popupSnapshotLabel: reviewExport.popupSnapshotLabel,
  };
}

function normalizeSourceRequest(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const requestId =
    typeof value.requestId === "string" ? value.requestId.trim() : "";

  if (requestId.length === 0) {
    return null;
  }

  return {
    requestId,
    requestReadmePath:
      typeof value.requestReadmePath === "string" ? value.requestReadmePath : "",
    requestManifestPath:
      typeof value.requestManifestPath === "string"
        ? value.requestManifestPath
        : "",
  };
}

function buildArchiveMarkdown(
  reviewExport,
  sourceReviewExport,
  archiveId,
  archivedAt,
  seeded,
  sourceRequest,
) {
  const badge = reviewExport.liveActionBadge?.available
    ? reviewExport.liveActionBadge
    : {
        text: reviewExport.computedActionBadge.text,
        title: reviewExport.computedActionBadge.title,
        sourceLabel: "Computed from current app state",
      };
  const providerLines = reviewExport.targetProviders
    .map(
      (provider) =>
        `- ${provider.providerLabel}: ${provider.recoveryLabel} · Host access ${String(provider.hostAccessLabel).toLowerCase()} · ${provider.currentSourceStateLabel} · ${provider.lastSyncLabel}`,
    )
    .join("\n");

  return `# Theme Recovery Review Archive

Archive ID: \`${archiveId}\`
Archived at: ${archivedAt}
Source export: \`${sourceReviewExport}\`
Generated at: ${reviewExport.generatedAt}
Theme: ${reviewExport.themeMode} (resolved ${reviewExport.themeResolved}) · Preset: ${reviewExport.themePreset}${reviewExport.themeCustomSeedHex ? ` · Seed: ${reviewExport.themeCustomSeedHex}` : ""}
${reviewExport.requestContext ? `Request binding: ${reviewExport.requestContext.requestId} @ ${reviewExport.requestContext.requestCreatedAt}` : ""}
Review stage: ${reviewExport.overallLabel}
Scope: ${reviewExport.scopeIsolationLabel}
Popup snapshot: ${reviewExport.popupSnapshotLabel} · ${reviewExport.popupSnapshotHeadline}
Action badge: ${badge.text.trim().length > 0 ? badge.text.trim() : "cleared"} · ${badge.title}
Action badge source: ${badge.sourceLabel}
${sourceRequest ? `Source request: ${sourceRequest.requestId}${sourceRequest.requestReadmePath ? ` · ${sourceRequest.requestReadmePath}` : ""}` : ""}

Target providers:
${providerLines}

Review detail:
- ${reviewExport.overallDetail}
- ${reviewExport.scopeIsolationDetail}
- ${reviewExport.popupSnapshotDetail}

Truth note:
${seeded ? "- This archive is a seeded internal baseline. It demonstrates the theme-recovery archive workflow and does not claim a completed human operator pass." : "- This archive mirrors the exported theme-recovery workspace state only. It does not rewrite unresolved access or scope issues into a pass claim."}
`;
}

function buildArchiveSummaryMarkdown(reviewExport) {
  return `# Theme Recovery Review Snapshot

Generated at: ${reviewExport.generatedAt}
Theme: ${reviewExport.themeMode} (resolved ${reviewExport.themeResolved}) · Preset: ${reviewExport.themePreset}${reviewExport.themeCustomSeedHex ? `\nSeed: ${reviewExport.themeCustomSeedHex}` : ""}
Review stage: ${reviewExport.overallLabel}
Scope: ${reviewExport.scopeIsolationLabel}
Popup snapshot: ${reviewExport.popupSnapshotLabel} · ${reviewExport.popupSnapshotHeadline}
Action badge: ${(reviewExport.liveActionBadge?.available ? reviewExport.liveActionBadge.text : reviewExport.computedActionBadge.text).trim().length > 0 ? (reviewExport.liveActionBadge?.available ? reviewExport.liveActionBadge.text : reviewExport.computedActionBadge.text).trim() : "cleared"}

Target providers:
${reviewExport.targetProviders
  .map(
    (provider) =>
      `- ${provider.providerLabel}: ${provider.recoveryLabel} · Host access ${String(provider.hostAccessLabel).toLowerCase()} · ${provider.currentSourceStateLabel} · ${provider.lastSyncLabel}`,
  )
  .join("\n")}
`;
}

export function buildThemeRecoveryReviewArchiveId({
  reviewExport,
  archiveId,
  archivedAt,
  seeded = false,
}) {
  if (typeof archiveId === "string" && archiveId.trim().length > 0) {
    return sanitizeSegment(archiveId);
  }

  const dateSegment = normalizeDate(reviewExport.generatedAt, archivedAt);
  const timeSegment = normalizeTime(reviewExport.generatedAt, archivedAt);
  const modeSegment = sanitizeSegment(reviewExport.themeMode || "mode");
  const stageSegment = sanitizeSegment(reviewExport.overallStage || "review");
  const seededSegment = seeded ? "-seeded" : "";

  return `${dateSegment}-${modeSegment}-${stageSegment}${seededSegment}-${timeSegment}`;
}

export function buildThemeRecoveryReviewArchiveRecord({
  reviewExport,
  sourceReviewExport,
  archiveId,
  archivedAt,
  seeded = false,
  sourceRequest = null,
}) {
  const normalizedReviewExport = normalizeThemeRecoveryReviewExport(reviewExport);
  const normalizedSourceRequest = normalizeSourceRequest(sourceRequest);
  const manifest = {
    archiveId,
    archivedAt,
    seeded,
    sourceReviewExport,
    sourceRequest: normalizedSourceRequest,
    review: normalizedReviewExport,
    summary: buildArchiveSummary(normalizedReviewExport),
    artifacts: {
      reviewExport: "theme-recovery-review-export.json",
      summaryDraft: "theme-recovery-summary.md",
      archiveRecord: "review-archive.json",
      archiveReadme: "README.md",
    },
  };

  return {
    manifest,
    readme: `${buildArchiveMarkdown(
      normalizedReviewExport,
      sourceReviewExport,
      archiveId,
      archivedAt,
      seeded,
      normalizedSourceRequest,
    ).trim()}\n`,
    summaryDraft: `${buildArchiveSummaryMarkdown(normalizedReviewExport).trim()}\n`,
  };
}

export async function writeThemeRecoveryReviewArchive({
  projectRoot,
  reviewExport,
  sourceReviewExport,
  archiveRoot,
  archiveId,
  archivedAt,
  seeded = false,
  sourceRequest = null,
}) {
  const record = buildThemeRecoveryReviewArchiveRecord({
    reviewExport,
    sourceReviewExport,
    archiveId,
    archivedAt,
    seeded,
    sourceRequest,
  });
  const archiveDir = path.join(archiveRoot, archiveId);

  await mkdir(archiveDir, { recursive: true });
  await writeFile(
    path.join(archiveDir, "theme-recovery-review-export.json"),
    `${JSON.stringify(record.manifest.review, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(archiveDir, "theme-recovery-summary.md"),
    record.summaryDraft,
    "utf8",
  );
  await writeFile(
    path.join(archiveDir, "review-archive.json"),
    `${JSON.stringify(record.manifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(path.join(archiveDir, "README.md"), record.readme, "utf8");

  return {
    archiveDir,
    archiveDirRelative: path.relative(projectRoot, archiveDir),
    manifest: record.manifest,
  };
}
