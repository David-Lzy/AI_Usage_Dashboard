import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function normalizeRecord(record, manifestPath, projectRoot) {
  return {
    archiveId: typeof record?.archiveId === "string" ? record.archiveId : "",
    archivedAt: typeof record?.archivedAt === "string" ? record.archivedAt : "",
    seeded: Boolean(record?.seeded),
    sourceReviewExport:
      typeof record?.sourceReviewExport === "string"
        ? record.sourceReviewExport
        : "",
    sourceRequest:
      record?.sourceRequest && typeof record.sourceRequest === "object"
        ? {
            requestId:
              typeof record.sourceRequest.requestId === "string"
                ? record.sourceRequest.requestId
                : "",
            requestReadmePath:
              typeof record.sourceRequest.requestReadmePath === "string"
                ? record.sourceRequest.requestReadmePath
                : "",
            requestManifestPath:
              typeof record.sourceRequest.requestManifestPath === "string"
                ? record.sourceRequest.requestManifestPath
                : "",
          }
        : null,
    review:
      record?.review && typeof record.review === "object" ? record.review : {},
    summary:
      record?.summary && typeof record.summary === "object" ? record.summary : {},
    readmePath: path.relative(
      projectRoot,
      path.join(path.dirname(manifestPath), "README.md"),
    ),
    manifestPath: path.relative(projectRoot, manifestPath),
  };
}

function compareRecords(left, right) {
  const leftDate = left.review.generatedAt || left.archivedAt || "";
  const rightDate = right.review.generatedAt || right.archivedAt || "";

  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  return right.archiveId.localeCompare(left.archiveId);
}

function buildSectionLines(records, emptyMessage) {
  if (records.length === 0) {
    return [`- ${emptyMessage}`, ""];
  }

  const lines = [];

  for (const record of records) {
    lines.push(
      `- [${record.archiveId}](./${record.readmePath.replace(/^Doc\/testing\//, "")})`,
    );
    lines.push(
      `  - stage: \`${record.summary.overallLabel ?? "unknown"}\` · scope: \`${record.summary.scopeIsolationLabel ?? "unknown"}\` · popup: \`${record.summary.popupSnapshotLabel ?? "unknown"}\``,
    );
    lines.push(
      `  - theme: \`${record.review.themeMode ?? "unknown"}\` / \`${record.review.themePreset ?? "unknown"}\`${record.review.themeCustomSeedHex ? ` · seed \`${record.review.themeCustomSeedHex}\`` : ""}`,
    );
    lines.push(
      `  - providers: recovered \`${record.summary.recoveredProviderCount ?? 0}\` / total \`${record.summary.targetProviderCount ?? 0}\``,
    );
    lines.push(
      `  - source export: \`${record.sourceReviewExport || "not set"}\``,
    );
    if (record.sourceRequest?.requestId) {
      lines.push(
        `  - source request: \`${record.sourceRequest.requestId}\`${record.sourceRequest.requestReadmePath ? ` · \`${record.sourceRequest.requestReadmePath}\`` : ""}`,
      );
    }
  }

  lines.push("");
  return lines;
}

export function buildThemeRecoveryReviewArchiveIndexMarkdown({
  generatedAt,
  archiveRootRelative,
  records,
}) {
  const seededRecords = records.filter((record) => record.seeded);
  const operatorRecords = records.filter((record) => !record.seeded);
  const lines = [
    "# Theme Recovery Review Archive",
    "",
    `Date: ${generatedAt.slice(0, 10)}`,
    "",
    "Process rule:",
    "",
    "- follow [Development_Guardrails.md](../Development_Guardrails.md)",
    "",
    "Purpose:",
    "",
    "- index durable theme-recovery review records stored under the repo archive root",
    "- distinguish seeded internal baselines from future real operator recovery sessions",
    "",
    "Managed note:",
    "",
    `- this file is regenerated from \`review-archive.json\` manifests inside \`${archiveRootRelative}\``,
    "- rerun `npm run theme-recovery:refresh-archive-index` after manual archive edits",
    "",
    "## Archive Commands",
    "",
    "Archive a new exported theme-recovery review:",
    "",
    "```bash",
    "npm run theme-recovery:archive -- --input tmp/theme-recovery-export.json",
    "```",
    "",
    "Refresh only the generated index and machine-readable catalog:",
    "",
    "```bash",
    "npm run theme-recovery:refresh-archive-index",
    "```",
    "",
    "## Truth Rules",
    "",
    "- archived review records mirror the exported theme-recovery workspace state only",
    "- seeded baselines are useful workflow fixtures, but they are not real human operator passes",
    "- real operator recovery sessions should preserve the exported recovery stage instead of rewriting warning states into a pass claim",
    "",
    "## Seeded Baselines",
    "",
    ...buildSectionLines(seededRecords, "no seeded theme-recovery baselines are recorded yet"),
    "## Operator Review Sessions",
    "",
    ...buildSectionLines(
      operatorRecords,
      "no real operator theme-recovery sessions are archived yet",
    ),
  ];

  return `${lines.join("\n").trim()}\n`;
}

export async function writeThemeRecoveryReviewArchiveIndex({
  projectRoot,
  archiveRoot,
  generatedAt,
  indexMarkdownPath,
  indexJsonPath,
}) {
  await mkdir(archiveRoot, { recursive: true });
  const archiveEntries = await readdir(archiveRoot, { withFileTypes: true });
  const records = [];

  for (const entry of archiveEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifestPath = path.join(archiveRoot, entry.name, "review-archive.json");

    try {
      const raw = await readFile(manifestPath, "utf8");
      const parsed = JSON.parse(raw);

      records.push(normalizeRecord(parsed, manifestPath, projectRoot));
    } catch {
      // Skip directories without a valid manifest.
    }
  }

  records.sort(compareRecords);

  const archiveRootRelative = path.relative(projectRoot, archiveRoot);
  const markdown = buildThemeRecoveryReviewArchiveIndexMarkdown({
    generatedAt,
    archiveRootRelative,
    records,
  });
  const json = {
    generatedAt,
    archiveRoot: archiveRootRelative,
    recordCount: records.length,
    seededRecordCount: records.filter((record) => record.seeded).length,
    operatorRecordCount: records.filter((record) => !record.seeded).length,
    records,
  };

  await writeFile(indexMarkdownPath, markdown, "utf8");
  await writeFile(indexJsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  return json;
}
