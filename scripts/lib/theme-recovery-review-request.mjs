import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeThemeRecoveryReviewExport } from "./theme-recovery-review-archive.mjs";

export const THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS =
  "pending_operator_review";
export const THEME_RECOVERY_REVIEW_REQUEST_FULFILLED_STATUS =
  "fulfilled_review_archived";
export const THEME_RECOVERY_REQUEST_ID_QUERY_PARAM = "themeRecoveryRequestId";
export const THEME_RECOVERY_REQUEST_CREATED_AT_QUERY_PARAM =
  "themeRecoveryRequestCreatedAt";

function sanitizeRequestSegment(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
}

function normalizeHexColor(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(trimmed) ? trimmed : null;
}

function buildThemeRecoveryRequestBoundWorkspaceRoute(
  workspaceRoute,
  requestId,
  requestCreatedAt,
) {
  if (
    typeof workspaceRoute !== "string" ||
    workspaceRoute.trim().length === 0 ||
    typeof requestId !== "string" ||
    requestId.trim().length === 0 ||
    typeof requestCreatedAt !== "string" ||
    requestCreatedAt.trim().length === 0
  ) {
    return workspaceRoute;
  }

  try {
    const boundUrl = new URL(workspaceRoute);

    boundUrl.searchParams.set(
      THEME_RECOVERY_REQUEST_ID_QUERY_PARAM,
      requestId.trim(),
    );
    boundUrl.searchParams.set(
      THEME_RECOVERY_REQUEST_CREATED_AT_QUERY_PARAM,
      requestCreatedAt.trim(),
    );

    return boundUrl.toString();
  } catch {
    return workspaceRoute;
  }
}

function normalizeThemeRecoveryReviewTemplate(value) {
  return {
    workspaceRoute:
      typeof value?.workspaceRoute === "string" ? value.workspaceRoute : "",
    targetProviderIds: normalizeStringArray(value?.targetProviderIds),
    expectedThemePreset:
      typeof value?.expectedThemePreset === "string"
        ? value.expectedThemePreset
        : "",
    expectedCustomSeedHex: normalizeHexColor(value?.expectedCustomSeedHex),
    recommendedDownloads: normalizeStringArray(value?.recommendedDownloads),
    workflow: normalizeStringArray(value?.workflow),
    truthRules: normalizeStringArray(value?.truthRules),
  };
}

function normalizeThemeRecoveryReviewRequestContext(value) {
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

function normalizeThemeRecoveryReviewFulfillment(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    fulfilledAt: typeof value.fulfilledAt === "string" ? value.fulfilledAt : "",
    sourceCompletedReviewExport:
      typeof value.sourceCompletedReviewExport === "string"
        ? value.sourceCompletedReviewExport
        : "",
    archiveId: typeof value.archiveId === "string" ? value.archiveId : "",
    archiveReadmePath:
      typeof value.archiveReadmePath === "string" ? value.archiveReadmePath : "",
    archiveManifestPath:
      typeof value.archiveManifestPath === "string"
        ? value.archiveManifestPath
        : "",
    completedStageSummary:
      value.completedStageSummary && typeof value.completedStageSummary === "object"
        ? {
            overallLabel:
              typeof value.completedStageSummary.overallLabel === "string"
                ? value.completedStageSummary.overallLabel
                : "",
            popupSnapshotLabel:
              typeof value.completedStageSummary.popupSnapshotLabel === "string"
                ? value.completedStageSummary.popupSnapshotLabel
                : "",
            scopeIsolationLabel:
              typeof value.completedStageSummary.scopeIsolationLabel === "string"
                ? value.completedStageSummary.scopeIsolationLabel
                : "",
            themeMode:
              typeof value.completedStageSummary.themeMode === "string"
                ? value.completedStageSummary.themeMode
                : "",
            themePreset:
              typeof value.completedStageSummary.themePreset === "string"
                ? value.completedStageSummary.themePreset
                : "",
            themeCustomSeedHex: normalizeHexColor(
              value.completedStageSummary.themeCustomSeedHex,
            ),
            recoveredProviderCount:
              typeof value.completedStageSummary.recoveredProviderCount === "number"
                ? value.completedStageSummary.recoveredProviderCount
                : 0,
            targetProviderCount:
              typeof value.completedStageSummary.targetProviderCount === "number"
                ? value.completedStageSummary.targetProviderCount
                : 0,
          }
        : null,
    completedReviewExportDigest:
      value.completedReviewExportDigest &&
      typeof value.completedReviewExportDigest === "object"
        ? {
            sha256:
              typeof value.completedReviewExportDigest.sha256 === "string"
                ? value.completedReviewExportDigest.sha256
                : "",
            sizeBytes:
              typeof value.completedReviewExportDigest.sizeBytes === "number"
                ? value.completedReviewExportDigest.sizeBytes
                : 0,
          }
        : null,
  };
}

function buildSeedReferenceSummary(seedReferenceExport) {
  return {
    overallStage: seedReferenceExport.overallStage,
    overallLabel: seedReferenceExport.overallLabel,
    popupSnapshotLabel: seedReferenceExport.popupSnapshotLabel,
    scopeIsolationLabel: seedReferenceExport.scopeIsolationLabel,
    themeMode: seedReferenceExport.themeMode,
    themePreset: seedReferenceExport.themePreset,
    themeResolved: seedReferenceExport.themeResolved,
    themeCustomSeedHex: seedReferenceExport.themeCustomSeedHex,
    targetProviderIds: seedReferenceExport.targetProviders.map(
      (provider) => provider.providerId,
    ),
    targetProviderLabels: seedReferenceExport.targetProviders.map(
      (provider) => provider.providerLabel,
    ),
  };
}

function buildThemeRecoveryReviewExportDigest(rawExport) {
  return {
    sha256: createHash("sha256").update(rawExport).digest("hex"),
    sizeBytes: Buffer.byteLength(rawExport, "utf8"),
  };
}

export function buildThemeRecoveryReviewRequestCompletionIssues({
  requestManifest = null,
  reviewTemplate,
  reviewExport,
}) {
  const issues = [];
  const normalizedTemplate = normalizeThemeRecoveryReviewTemplate(reviewTemplate);
  const normalizedReviewExport = normalizeThemeRecoveryReviewExport(reviewExport);
  const normalizedRequestContext = normalizeThemeRecoveryReviewRequestContext(
    normalizedReviewExport.requestContext,
  );
  const expectedProviderIds = normalizedTemplate.targetProviderIds.map((providerId) =>
    providerId.toLowerCase(),
  );
  const actualProviderIds = normalizedReviewExport.targetProviders.map((provider) =>
    String(provider.providerId ?? "").trim().toLowerCase(),
  );

  if (actualProviderIds.length !== expectedProviderIds.length) {
    issues.push(
      `Completed theme-recovery export target-provider count ${actualProviderIds.length} did not match the request template target-provider count ${expectedProviderIds.length}.`,
    );
  } else {
    for (let index = 0; index < expectedProviderIds.length; index += 1) {
      if (actualProviderIds[index] !== expectedProviderIds[index]) {
        issues.push(
          `Completed theme-recovery export target provider at position ${index + 1} did not match the request template provider \`${normalizedTemplate.targetProviderIds[index]}\`.`,
        );
        break;
      }
    }
  }

  if (
    normalizedTemplate.expectedThemePreset.length > 0 &&
    normalizedReviewExport.themePreset !== normalizedTemplate.expectedThemePreset
  ) {
    issues.push(
      `Completed theme-recovery export preset \`${normalizedReviewExport.themePreset || "not set"}\` did not match the request template preset \`${normalizedTemplate.expectedThemePreset}\`.`,
    );
  }

  if (
    normalizedTemplate.expectedCustomSeedHex &&
    normalizeHexColor(normalizedReviewExport.themeCustomSeedHex) !==
      normalizedTemplate.expectedCustomSeedHex
  ) {
    issues.push(
      `Completed theme-recovery export seed \`${normalizeHexColor(normalizedReviewExport.themeCustomSeedHex) ?? "not set"}\` did not match the request template seed \`${normalizedTemplate.expectedCustomSeedHex}\`.`,
    );
  }

  if (requestManifest && typeof requestManifest === "object") {
    const expectedRequestId =
      typeof requestManifest.requestId === "string"
        ? requestManifest.requestId.trim()
        : "";
    const expectedRequestCreatedAt =
      typeof requestManifest.createdAt === "string"
        ? requestManifest.createdAt.trim()
        : "";

    if (expectedRequestId.length > 0 && expectedRequestCreatedAt.length > 0) {
      if (!normalizedRequestContext) {
        issues.push(
          "Completed theme-recovery export did not preserve the bound request context required by the pending request.",
        );
      } else {
        if (normalizedRequestContext.requestId !== expectedRequestId) {
          issues.push(
            `Completed theme-recovery export request id \`${normalizedRequestContext.requestId}\` did not match the pending request id \`${expectedRequestId}\`.`,
          );
        }

        if (
          normalizedRequestContext.requestCreatedAt !== expectedRequestCreatedAt
        ) {
          issues.push(
            `Completed theme-recovery export request timestamp \`${normalizedRequestContext.requestCreatedAt}\` did not match the pending request timestamp \`${expectedRequestCreatedAt}\`.`,
          );
        }
      }
    }
  }

  return issues;
}

function buildThemeRecoveryReviewRequestReadme({
  requestId,
  createdAt,
  status,
  sourceTemplate,
  sourceSeedArchiveReadme,
  sourceSeedReviewExport,
  reviewTemplate,
  seedReferenceExport,
  fulfillment,
}) {
  const downloadsLine =
    reviewTemplate.recommendedDownloads.length > 0
      ? reviewTemplate.recommendedDownloads.join(", ")
      : "summary, json";
  const workflowLines = reviewTemplate.workflow
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");
  const truthRuleLines = reviewTemplate.truthRules
    .map((rule) => `- ${rule}`)
    .join("\n");
  const targetProvidersLine =
    reviewTemplate.targetProviderIds.length > 0
      ? reviewTemplate.targetProviderIds.join(", ")
      : "cursor, codex";
  const fulfillmentLines = fulfillment
    ? [
        "",
        "Fulfillment receipt:",
        "",
        `- fulfilled at: \`${fulfillment.fulfilledAt}\``,
        `- source completed export: \`${fulfillment.sourceCompletedReviewExport}\``,
        `- archive: \`${fulfillment.archiveReadmePath}\``,
        `- archive manifest: \`${fulfillment.archiveManifestPath}\``,
        `- completed stage: \`${fulfillment.completedStageSummary?.overallLabel ?? "unknown"}\` · popup \`${fulfillment.completedStageSummary?.popupSnapshotLabel ?? "unknown"}\` · scope \`${fulfillment.completedStageSummary?.scopeIsolationLabel ?? "unknown"}\``,
        `- completed theme: \`${fulfillment.completedStageSummary?.themeMode ?? "unknown"}\` / \`${fulfillment.completedStageSummary?.themePreset ?? "unknown"}\`${fulfillment.completedStageSummary?.themeCustomSeedHex ? ` · seed \`${fulfillment.completedStageSummary.themeCustomSeedHex}\`` : ""}`,
        `- completed providers: recovered \`${fulfillment.completedStageSummary?.recoveredProviderCount ?? 0}\` / total \`${fulfillment.completedStageSummary?.targetProviderCount ?? 0}\``,
        `- completed export digest: \`${fulfillment.completedReviewExportDigest?.sha256 ? `sha256:${fulfillment.completedReviewExportDigest.sha256} (${fulfillment.completedReviewExportDigest.sizeBytes} bytes)` : "not recorded"}\``,
      ]
    : [];
  const completionCommand =
    status === THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS
      ? `npm run theme-recovery:complete-review-request -- --request-id ${requestId} --input tmp/theme-recovery-review-export.json`
      : `# already fulfilled via archive ${fulfillment?.archiveId ?? "not-set"}`;
  const requestBoundWorkspaceRoute = buildThemeRecoveryRequestBoundWorkspaceRoute(
    reviewTemplate.workspaceRoute,
    requestId,
    createdAt,
  );

  return `# Theme Recovery Review Request

Document class:

- generated operational ledger

Status note:

- this package README is generated from one repo-backed theme-recovery request manifest and should be refreshed through the request generator or refresh workflow, not hand-edited
- it preserves current request-package truth only and does not claim that a human review has already happened

Request ID: \`${requestId}\`
Created at: ${createdAt}
Status: \`${status}\`

Workspace route:

- \`${reviewTemplate.workspaceRoute}\`

Request-bound workspace route:

- \`${requestBoundWorkspaceRoute}\`

Source template:

- \`${sourceTemplate}\`

Seeded reference archive:

- \`${sourceSeedArchiveReadme}\`

Seeded reference export:

- \`${sourceSeedReviewExport}\`

Current seeded reference truth:

- review stage: \`${seedReferenceExport.overallLabel}\`
- popup snapshot: \`${seedReferenceExport.popupSnapshotLabel}\`
- scope isolation: \`${seedReferenceExport.scopeIsolationLabel}\`
- theme: \`${seedReferenceExport.themeMode}\` / \`${seedReferenceExport.themePreset}\`${seedReferenceExport.themeCustomSeedHex ? ` · seed \`${seedReferenceExport.themeCustomSeedHex}\`` : ""}
- target providers: \`${seedReferenceExport.targetProviders.map((provider) => provider.providerLabel).join(", ")}\`

Expected operator focus:

- preserve the current review scope for: \`${targetProvidersLine}\`
- expected preset: \`${reviewTemplate.expectedThemePreset || "custom"}\`
- expected seed: \`${reviewTemplate.expectedCustomSeedHex || "not set"}\`
- recommended downloads: \`${downloadsLine}\`
${fulfillmentLines.join("\n")}

Workflow:

${workflowLines}

Lifecycle commands:

\`\`\`bash
npm run theme-recovery:preflight-review-request -- --request-id ${requestId} --input tmp/theme-recovery-review-export.json
${completionCommand}
npm run theme-recovery:refresh-review-request-index
npm run theme-recovery:refresh-archive-index
\`\`\`

Truth rules:

${truthRuleLines}
- this request package does not claim that a human review has already happened
- the first real operator theme-recovery pass should preserve its actual exported stage instead of rewriting degraded outcomes into a pass claim
- the current repo archive index lives in [Theme_Recovery_Review_Archive.md](../../Theme_Recovery_Review_Archive.md)
`;
}

export function buildThemeRecoveryReviewRequestId({ requestId, createdAt }) {
  if (typeof requestId === "string" && requestId.trim().length > 0) {
    return sanitizeRequestSegment(requestId);
  }

  return `${createdAt.slice(0, 10)}-theme-recovery-review-request`;
}

export function buildThemeRecoveryReviewRequestRecord({
  requestId,
  createdAt,
  status = THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
  reviewTemplate,
  sourceTemplate,
  seedReferenceExport,
  sourceSeedArchiveReadme,
  sourceSeedReviewExport,
  fulfillment = null,
}) {
  const normalizedTemplate = normalizeThemeRecoveryReviewTemplate(reviewTemplate);
  const normalizedSeedReferenceExport =
    normalizeThemeRecoveryReviewExport(seedReferenceExport);
  const normalizedFulfillment =
    status === THEME_RECOVERY_REVIEW_REQUEST_FULFILLED_STATUS
      ? normalizeThemeRecoveryReviewFulfillment(fulfillment)
      : null;
  const manifest = {
    requestId,
    createdAt,
    status,
    workspaceRoute: normalizedTemplate.workspaceRoute,
    requestContext: {
      requestId,
      requestCreatedAt: createdAt,
      requestBoundWorkspaceRoute: buildThemeRecoveryRequestBoundWorkspaceRoute(
        normalizedTemplate.workspaceRoute,
        requestId,
        createdAt,
      ),
    },
    sourceTemplate,
    sourceSeedArchiveReadme,
    sourceSeedReviewExport,
    reviewTemplate: normalizedTemplate,
    seedReferenceSummary: buildSeedReferenceSummary(normalizedSeedReferenceExport),
    fulfillment: normalizedFulfillment,
    artifacts: {
      reviewTemplate: "theme-recovery-review-template.json",
      seedReference: "theme-recovery-seeded-reference.json",
      requestReadme: "README.md",
    },
  };

  return {
    manifest,
    readme: `${buildThemeRecoveryReviewRequestReadme({
      requestId,
      createdAt,
      status: manifest.status,
      sourceTemplate,
      sourceSeedArchiveReadme,
      sourceSeedReviewExport,
      reviewTemplate: normalizedTemplate,
      seedReferenceExport: normalizedSeedReferenceExport,
      fulfillment: normalizedFulfillment,
    }).trim()}\n`,
    reviewTemplate: `${JSON.stringify(normalizedTemplate, null, 2)}\n`,
    seedReference: `${JSON.stringify(normalizedSeedReferenceExport, null, 2)}\n`,
  };
}

async function writeThemeRecoveryReviewRequestFiles({
  projectRoot,
  requestDir,
  record,
}) {
  await mkdir(requestDir, { recursive: true });
  await writeFile(
    path.join(requestDir, "review-request.json"),
    `${JSON.stringify(record.manifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "theme-recovery-review-template.json"),
    record.reviewTemplate,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "theme-recovery-seeded-reference.json"),
    record.seedReference,
    "utf8",
  );
  await writeFile(path.join(requestDir, "README.md"), record.readme, "utf8");

  return {
    requestDir,
    requestDirRelative: path.relative(projectRoot, requestDir),
    manifest: record.manifest,
  };
}

export async function writeThemeRecoveryReviewRequest({
  projectRoot,
  requestRoot,
  requestId,
  createdAt,
  reviewTemplate,
  sourceTemplate,
  seedReferenceExport,
  sourceSeedArchiveReadme,
  sourceSeedReviewExport,
  fulfillment = null,
  status = THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
}) {
  const record = buildThemeRecoveryReviewRequestRecord({
    requestId,
    createdAt,
    status,
    reviewTemplate,
    sourceTemplate,
    seedReferenceExport,
    sourceSeedArchiveReadme,
    sourceSeedReviewExport,
    fulfillment,
  });
  const requestDir = path.join(requestRoot, requestId);

  return writeThemeRecoveryReviewRequestFiles({
    projectRoot,
    requestDir,
    record,
  });
}

export async function updateThemeRecoveryReviewRequest({
  projectRoot,
  requestDir,
  requestId,
  createdAt,
  reviewTemplate,
  sourceTemplate,
  seedReferenceExport,
  sourceSeedArchiveReadme,
  sourceSeedReviewExport,
  fulfillment = null,
  status = THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
}) {
  const record = buildThemeRecoveryReviewRequestRecord({
    requestId,
    createdAt,
    status,
    reviewTemplate,
    sourceTemplate,
    seedReferenceExport,
    sourceSeedArchiveReadme,
    sourceSeedReviewExport,
    fulfillment,
  });

  return writeThemeRecoveryReviewRequestFiles({
    projectRoot,
    requestDir,
    record,
  });
}

export function buildThemeRecoveryReviewRequestFulfillment({
  fulfilledAt,
  sourceCompletedReviewExport,
  archiveId,
  archiveReadmePath,
  archiveManifestPath,
  reviewExport,
  rawReviewExport,
}) {
  const normalizedReviewExport = normalizeThemeRecoveryReviewExport(reviewExport);
  return {
    fulfilledAt,
    sourceCompletedReviewExport,
    archiveId,
    archiveReadmePath,
    archiveManifestPath,
    completedStageSummary: {
      overallLabel: normalizedReviewExport.overallLabel,
      popupSnapshotLabel: normalizedReviewExport.popupSnapshotLabel,
      scopeIsolationLabel: normalizedReviewExport.scopeIsolationLabel,
      themeMode: normalizedReviewExport.themeMode,
      themePreset: normalizedReviewExport.themePreset,
      themeCustomSeedHex: normalizeHexColor(
        normalizedReviewExport.themeCustomSeedHex,
      ),
      recoveredProviderCount: normalizedReviewExport.targetProviders.filter(
        (provider) => provider.isRecovered,
      ).length,
      targetProviderCount: normalizedReviewExport.targetProviders.length,
    },
    completedReviewExportDigest: buildThemeRecoveryReviewExportDigest(
      rawReviewExport,
    ),
  };
}
