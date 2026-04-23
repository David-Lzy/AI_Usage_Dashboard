import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function normalizeReviewSession(value) {
  return {
    reviewerName: typeof value?.reviewerName === "string" ? value.reviewerName : "",
    sessionLabel: typeof value?.sessionLabel === "string" ? value.sessionLabel : "",
    reviewedAt: typeof value?.reviewedAt === "string" ? value.reviewedAt : "",
  };
}

function normalizeSummary(value) {
  return {
    readyForSignoff: Boolean(value?.readyForSignoff),
    totalSurfaceCount:
      typeof value?.totalSurfaceCount === "number" ? value.totalSurfaceCount : 0,
    reviewedSurfaceCount:
      typeof value?.reviewedSurfaceCount === "number"
        ? value.reviewedSurfaceCount
        : 0,
    passSurfaceCount:
      typeof value?.passSurfaceCount === "number" ? value.passSurfaceCount : 0,
    followUpSurfaceCount:
      typeof value?.followUpSurfaceCount === "number"
        ? value.followUpSurfaceCount
        : 0,
    notReviewedSurfaceCount:
      typeof value?.notReviewedSurfaceCount === "number"
        ? value.notReviewedSurfaceCount
        : 0,
    completedManualCheckCount:
      typeof value?.completedManualCheckCount === "number"
        ? value.completedManualCheckCount
        : 0,
    totalManualCheckCount:
      typeof value?.totalManualCheckCount === "number"
        ? value.totalManualCheckCount
        : 0,
    pendingManualCheckCount:
      typeof value?.pendingManualCheckCount === "number"
        ? value.pendingManualCheckCount
        : 0,
  };
}

function normalizeSourceRequest(value) {
  return {
    requestId: typeof value?.requestId === "string" ? value.requestId : "",
    requestReadmePath:
      typeof value?.requestReadmePath === "string" ? value.requestReadmePath : "",
    requestManifestPath:
      typeof value?.requestManifestPath === "string"
        ? value.requestManifestPath
        : "",
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

function normalizeArchiveRecord(record, manifestPath, projectRoot) {
  return {
    archiveId: typeof record?.archiveId === "string" ? record.archiveId : "",
    archivedAt: typeof record?.archivedAt === "string" ? record.archivedAt : "",
    seeded: Boolean(record?.seeded),
    sourceSignoffExport:
      typeof record?.sourceSignoffExport === "string"
        ? record.sourceSignoffExport
        : "",
    sourceEvidencePack:
      typeof record?.sourceEvidencePack === "string" ? record.sourceEvidencePack : "",
    sourceRequest: normalizeSourceRequest(record?.sourceRequest),
    requestContext: normalizeRequestContext(record?.requestContext),
    evidenceContext: normalizeEvidenceContext(record?.evidenceContext),
    reviewSession: normalizeReviewSession(record?.reviewSession),
    summary: normalizeSummary(record?.summary),
    readmePath: path.relative(
      projectRoot,
      path.join(path.dirname(manifestPath), "README.md"),
    ),
    manifestPath: path.relative(projectRoot, manifestPath),
  };
}

function archiveDisplayDate(record) {
  const reviewedAt = record.reviewSession.reviewedAt.trim();

  if (reviewedAt.length >= 10) {
    return reviewedAt.slice(0, 10);
  }

  if (record.archivedAt.length >= 10) {
    return record.archivedAt.slice(0, 10);
  }

  return "unknown";
}

function inlineCodeOrFallback(value) {
  return value.trim().length > 0 ? `\`${value.trim()}\`` : "not set";
}

function compareArchiveRecords(left, right) {
  const leftDate = left.reviewSession.reviewedAt || left.archivedAt || "";
  const rightDate = right.reviewSession.reviewedAt || right.archivedAt || "";

  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  return right.archiveId.localeCompare(left.archiveId);
}

function buildArchiveSectionLines(records, emptyMessage) {
  if (records.length === 0) {
    return [`- ${emptyMessage}`, ""];
  }

  const lines = [];

  for (const record of records) {
    lines.push(`- [${record.archiveId}](./${record.readmePath.replace(/^Doc\/testing\//, "")})`);
    lines.push(`  - archived on ${archiveDisplayDate(record)}`);
    lines.push(`  - reviewer: ${inlineCodeOrFallback(record.reviewSession.reviewerName)}`);
    lines.push(`  - session: ${inlineCodeOrFallback(record.reviewSession.sessionLabel)}`);
    if (record.sourceRequest.requestId.trim().length > 0) {
      const requestLabel = record.sourceRequest.requestReadmePath.trim().length > 0
        ? `[${record.sourceRequest.requestId}](./${record.sourceRequest.requestReadmePath.replace(/^Doc\/testing\//, "")})`
        : `\`${record.sourceRequest.requestId}\``;
      lines.push(`  - source request: ${requestLabel}`);
    }
    if (record.requestContext.requestId.trim().length > 0) {
      const requestBinding = record.requestContext.requestCreatedAt.trim().length > 0
        ? `${record.requestContext.requestId.trim()} @ ${record.requestContext.requestCreatedAt.trim()}`
        : record.requestContext.requestId.trim();
      lines.push(`  - request binding: \`${requestBinding}\``);
    }
    if (record.requestContext.requestRevisionSha256.trim().length > 0) {
      lines.push(
        `  - request revision: \`sha256:${record.requestContext.requestRevisionSha256.trim()}\``,
      );
    }
    if (record.evidenceContext.sourceLabel.trim().length > 0) {
      lines.push(`  - evidence source: \`${record.evidenceContext.sourceLabel.trim()}\``);
    }
    if (record.evidenceContext.integrityState.trim().length > 0) {
      lines.push(
        `  - evidence integrity: \`${record.evidenceContext.integrityState.trim()}\``,
      );
    }
    lines.push(
      `  - current truth: \`Ready for signoff: ${record.summary.readyForSignoff ? "yes" : "no"}\`, \`Follow-up required: ${record.summary.followUpSurfaceCount}\`, \`Not reviewed: ${record.summary.notReviewedSurfaceCount}\``,
    );
  }

  lines.push("");
  return lines;
}

export function buildInteractionAuditReviewArchiveIndexMarkdown({
  generatedAt,
  archiveRootRelative,
  records,
}) {
  const seededRecords = records.filter((record) => record.seeded);
  const operatorRecords = records.filter((record) => !record.seeded);
  const displayDate =
    records.length > 0 ? archiveDisplayDate(records[0]) : generatedAt.slice(0, 10);
  const lines = [
    "# Interaction Audit Review Archive",
    "",
    `Date: ${displayDate}`,
    "",
    "Process rule:",
    "",
    "- follow [Development_Guardrails.md](../Development_Guardrails.md)",
    "",
    "Purpose:",
    "",
    "- index durable interaction-audit review records stored under the repo archive root",
    "- distinguish seeded internal baselines from real operator review sessions",
    "",
    "Managed note:",
    "",
    `- this file is regenerated from \`review-archive.json\` manifests inside \`${archiveRootRelative}\``,
    "- rerun `npm run interaction-audit:refresh-archive-index` after adding, removing, or editing a durable archive record outside the main archive command",
    "",
    "## Archive Commands",
    "",
    "Archive a new exported review session into the repo:",
    "",
    "```bash",
    "npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json",
    "```",
    "",
    "Refresh only the generated index and machine-readable catalog:",
    "",
    "```bash",
    "npm run interaction-audit:refresh-archive-index",
    "```",
    "",
    "## Truth Rules",
    "",
    "- archived review records mirror the exported audit workspace state only",
    "- `Ready for signoff: no` is a valid archived outcome and must not be rewritten into a pass claim",
    "- seeded internal baselines are useful workflow fixtures, but they are not real human operator signoff records",
    "- real operator review sessions should preserve their own reviewer, session label, and reviewed-at values exactly as exported",
    "- when an archive comes from a repo-backed request, the archive should preserve that source request link instead of relying on outside notes",
    "- when an archive comes from a request-bound export, the archive should also preserve that export's request binding and request revision instead of dropping them after handoff",
    "- when an archive comes from request-backed completion, the archive should also preserve the actual evidence source plus integrity summary used at completion time instead of reducing provenance to one path string alone",
    "",
    "## Seeded Baselines",
    "",
    ...buildArchiveSectionLines(
      seededRecords,
      "no seeded archive baselines are recorded yet",
    ),
    "## Operator Review Sessions",
    "",
    ...buildArchiveSectionLines(
      operatorRecords,
      "no real operator review sessions are archived yet",
    ),
  ];

  return `${lines.join("\n").trim()}\n`;
}

export async function collectInteractionAuditReviewArchiveRecords({
  archiveRoot,
  projectRoot,
}) {
  const entries = await readdir(archiveRoot, { withFileTypes: true }).catch(() => []);
  const records = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifestPath = path.join(archiveRoot, entry.name, "review-archive.json");
    const raw = await readFile(manifestPath, "utf8").catch(() => null);

    if (!raw) {
      continue;
    }

    const parsed = JSON.parse(raw);

    records.push(normalizeArchiveRecord(parsed, manifestPath, projectRoot));
  }

  return records.sort(compareArchiveRecords);
}

export async function writeInteractionAuditReviewArchiveIndex({
  projectRoot,
  archiveRoot,
  generatedAt,
  indexMarkdownPath,
  indexJsonPath,
}) {
  const records = await collectInteractionAuditReviewArchiveRecords({
    archiveRoot,
    projectRoot,
  });
  const archiveRootRelative = path.relative(projectRoot, archiveRoot);
  const markdown = buildInteractionAuditReviewArchiveIndexMarkdown({
    generatedAt,
    archiveRootRelative,
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
        archiveRoot: archiveRootRelative,
        records,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    generatedAt,
    archiveRootRelative,
    recordCount: records.length,
    seededRecordCount: records.filter((record) => record.seeded).length,
    operatorRecordCount: records.filter((record) => !record.seeded).length,
    records,
  };
}
