import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS } from "./theme-recovery-review-request.mjs";

function normalizeFulfillment(value) {
  return value && typeof value === "object"
    ? {
        fulfilledAt:
          typeof value.fulfilledAt === "string" ? value.fulfilledAt : "",
        archiveId: typeof value.archiveId === "string" ? value.archiveId : "",
        archiveReadmePath:
          typeof value.archiveReadmePath === "string"
            ? value.archiveReadmePath
            : "",
        archiveManifestPath:
          typeof value.archiveManifestPath === "string"
            ? value.archiveManifestPath
            : "",
        completedStageSummary:
          value.completedStageSummary &&
          typeof value.completedStageSummary === "object"
            ? value.completedStageSummary
            : {},
      }
    : null;
}

function normalizeRecord(record, manifestPath, projectRoot) {
  return {
    requestId: typeof record?.requestId === "string" ? record.requestId : "",
    createdAt: typeof record?.createdAt === "string" ? record.createdAt : "",
    status: typeof record?.status === "string" ? record.status : "",
    workspaceRoute:
      typeof record?.workspaceRoute === "string" ? record.workspaceRoute : "",
    sourceTemplate:
      typeof record?.sourceTemplate === "string" ? record.sourceTemplate : "",
    sourceSeedArchiveReadme:
      typeof record?.sourceSeedArchiveReadme === "string"
        ? record.sourceSeedArchiveReadme
        : "",
    sourceSeedReviewExport:
      typeof record?.sourceSeedReviewExport === "string"
        ? record.sourceSeedReviewExport
        : "",
    seedReferenceSummary:
      record?.seedReferenceSummary && typeof record.seedReferenceSummary === "object"
        ? record.seedReferenceSummary
        : {},
    fulfillment: normalizeFulfillment(record?.fulfillment),
    readmePath: path.relative(
      projectRoot,
      path.join(path.dirname(manifestPath), "README.md"),
    ),
    manifestPath: path.relative(projectRoot, manifestPath),
  };
}

function compareRecords(left, right) {
  if (left.createdAt !== right.createdAt) {
    return right.createdAt.localeCompare(left.createdAt);
  }

  return right.requestId.localeCompare(left.requestId);
}

function buildSectionLines(records, emptyMessage) {
  if (records.length === 0) {
    return [`- ${emptyMessage}`, ""];
  }

  const lines = [];

  for (const record of records) {
    lines.push(
      `- [${record.requestId}](./${record.readmePath.replace(/^Doc\/testing\//, "")})`,
    );
    lines.push(`  - status: \`${record.status}\``);
    lines.push(`  - created on ${record.createdAt.slice(0, 10)}`);
    lines.push(`  - workspace route: \`${record.workspaceRoute || "not set"}\``);
    lines.push(
      `  - seeded reference: stage \`${record.seedReferenceSummary.overallLabel ?? "unknown"}\` · popup \`${record.seedReferenceSummary.popupSnapshotLabel ?? "unknown"}\` · scope \`${record.seedReferenceSummary.scopeIsolationLabel ?? "unknown"}\``,
    );
    lines.push(
      `  - theme: \`${record.seedReferenceSummary.themeMode ?? "unknown"}\` / \`${record.seedReferenceSummary.themePreset ?? "unknown"}\`${record.seedReferenceSummary.themeCustomSeedHex ? ` · seed \`${record.seedReferenceSummary.themeCustomSeedHex}\`` : ""}`,
    );
    lines.push(
      `  - source seeded archive: \`${record.sourceSeedArchiveReadme || "not set"}\``,
    );
    if (record.fulfillment?.archiveId) {
      lines.push(
        `  - archive: \`${record.fulfillment.archiveId}\`${record.fulfillment.archiveReadmePath ? ` · \`${record.fulfillment.archiveReadmePath}\`` : ""}`,
      );
      lines.push(
        `  - fulfilled stage: \`${record.fulfillment.completedStageSummary?.overallLabel ?? "unknown"}\` · popup \`${record.fulfillment.completedStageSummary?.popupSnapshotLabel ?? "unknown"}\` · scope \`${record.fulfillment.completedStageSummary?.scopeIsolationLabel ?? "unknown"}\``,
      );
    }
  }

  lines.push("");
  return lines;
}

export function buildThemeRecoveryReviewRequestIndexMarkdown({
  generatedAt,
  requestRootRelative,
  records,
}) {
  const pendingRecords = records.filter(
    (record) => record.status === THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
  );
  const fulfilledRecords = records.filter(
    (record) => record.status !== THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
  );
  const lines = [
    "# Theme Recovery Review Requests",
    "",
    `Date: ${generatedAt.slice(0, 10)}`,
    "",
    "Process rule:",
    "",
    "- follow [Development_Guardrails.md](../Development_Guardrails.md)",
    "",
    "Purpose:",
    "",
    "- track repo-backed theme-recovery review requests before the first real operator archive exists",
    "- distinguish pending request packages from future fulfilled requests that point at durable theme-recovery archives",
    "",
    "Managed note:",
    "",
    `- this file is regenerated from \`review-request.json\` manifests inside \`${requestRootRelative}\``,
    "- rerun `npm run theme-recovery:refresh-review-request-index` after manual request edits",
    "",
    "## Request Commands",
    "",
    "Create a new pending theme-recovery review request:",
    "",
    "```bash",
    "npm run theme-recovery:create-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request",
    "```",
    "",
    "Complete one pending theme-recovery request and archive the exported review:",
    "",
    "```bash",
    "npm run theme-recovery:complete-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json",
    "```",
    "",
    "Preflight one pending theme-recovery request without mutating request or archive records:",
    "",
    "```bash",
    "npm run theme-recovery:preflight-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json",
    "```",
    "",
    "Refresh only the generated request index and machine-readable catalog:",
    "",
    "```bash",
    "npm run theme-recovery:refresh-review-request-index",
    "```",
    "",
    "## Truth Rules",
    "",
    "- a pending theme-recovery request package is not a completed human review",
    "- the seeded reference export copied into a request package is only a baseline reference, not a recovered operator pass",
    "- fulfilled theme-recovery requests should link to one durable archive instead of free-floating notes or screenshots",
    "",
    "## Pending Requests",
    "",
    ...buildSectionLines(
      pendingRecords,
      "no pending theme-recovery review requests are recorded yet",
    ),
    "## Fulfilled Requests",
    "",
    ...buildSectionLines(
      fulfilledRecords,
      "no fulfilled theme-recovery review requests are recorded yet",
    ),
  ];

  return `${lines.join("\n").trim()}\n`;
}

export async function writeThemeRecoveryReviewRequestIndex({
  projectRoot,
  requestRoot,
  generatedAt,
  indexMarkdownPath,
  indexJsonPath,
}) {
  await mkdir(requestRoot, { recursive: true });
  const requestEntries = await readdir(requestRoot, { withFileTypes: true });
  const records = [];

  for (const entry of requestEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifestPath = path.join(requestRoot, entry.name, "review-request.json");

    try {
      const raw = await readFile(manifestPath, "utf8");
      const parsed = JSON.parse(raw);

      records.push(normalizeRecord(parsed, manifestPath, projectRoot));
    } catch {
      // Ignore directories without a valid manifest.
    }
  }

  records.sort(compareRecords);

  const requestRootRelative = path.relative(projectRoot, requestRoot);
  const markdown = buildThemeRecoveryReviewRequestIndexMarkdown({
    generatedAt,
    requestRootRelative,
    records,
  });
  const json = {
    generatedAt,
    requestRoot: requestRootRelative,
    recordCount: records.length,
    pendingRequestCount: records.filter(
      (record) => record.status === THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
    ).length,
    fulfilledRequestCount: records.filter(
      (record) => record.status !== THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
    ).length,
    records,
  };

  await writeFile(indexMarkdownPath, markdown, "utf8");
  await writeFile(indexJsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  return json;
}
