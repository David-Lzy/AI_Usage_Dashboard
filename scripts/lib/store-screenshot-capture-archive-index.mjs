import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function normalizeRecord(record, manifestPath, projectRoot) {
  return {
    archiveId: typeof record?.archiveId === "string" ? record.archiveId : "",
    archivedAt: typeof record?.archivedAt === "string" ? record.archivedAt : "",
    runtimeSource:
      typeof record?.runtimeSource === "string" ? record.runtimeSource : "",
    preferredSize:
      typeof record?.preferredSize === "string" ? record.preferredSize : "",
    fallbackSize:
      typeof record?.fallbackSize === "string" ? record.fallbackSize : "",
    screenshotCount:
      typeof record?.screenshotCount === "number" ? record.screenshotCount : 0,
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
          }
        : null,
    readmePath: path.relative(
      projectRoot,
      path.join(path.dirname(manifestPath), "README.md"),
    ),
    manifestPath: path.relative(projectRoot, manifestPath),
  };
}

function compareRecords(left, right) {
  if (left.archivedAt !== right.archivedAt) {
    return right.archivedAt.localeCompare(left.archivedAt);
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
    lines.push(`  - archived on ${record.archivedAt.slice(0, 10)}`);
    lines.push(`  - runtime source: \`${record.runtimeSource || "not set"}\``);
    lines.push(
      `  - sizes: preferred \`${record.preferredSize || "not set"}\` · fallback \`${record.fallbackSize || "not set"}\``,
    );
    lines.push(`  - screenshot count: \`${record.screenshotCount}\``);
    if (record.sourceRequest?.requestId) {
      lines.push(
        `  - source request: \`${record.sourceRequest.requestId}\`${record.sourceRequest.requestReadmePath ? ` · \`${record.sourceRequest.requestReadmePath}\`` : ""}`,
      );
    }
  }

  lines.push("");
  return lines;
}

export function buildStoreScreenshotCaptureArchiveIndexMarkdown({
  generatedAt,
  archiveRootRelative,
  records,
}) {
  const lines = [
    "# Store Screenshot Capture Archive",
    "",
    `Date: ${generatedAt.slice(0, 10)}`,
    "",
    "Process rule:",
    "",
    "- follow [Development_Guardrails.md](../Development_Guardrails.md)",
    "",
    "Document class:",
    "",
    "- generated operational ledger",
    "- completion model: truthful when regenerated from current archive manifests, not when frozen as a one-time closeout file",
    "- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)",
    "",
    "Purpose:",
    "",
    "- index durable store screenshot capture archives stored under the repo archive root",
    "- distinguish pending screenshot requests from completed archived screenshot sets",
    "",
    "Managed note:",
    "",
    `- this file is regenerated from \`capture-archive.json\` manifests inside \`${archiveRootRelative}\``,
    "- rerun `npm run store:refresh-screenshot-capture-archive-index` after manual archive edits",
    "",
    "## Archive Commands",
    "",
    "Refresh only the generated archive index and machine-readable catalog:",
    "",
    "```bash",
    "npm run store:refresh-screenshot-capture-archive-index",
    "```",
    "",
    "## Truth Rules",
    "",
    "- archived screenshot sets should remain truthful extension-mode captures",
    "- the archive should preserve the exact filenames and request linkage used to produce the set",
    "- do not treat an empty archive ledger as a failure; it can truthfully mean the first operator pass has not happened yet",
    "",
    "## Archived Screenshot Sets",
    "",
    ...buildSectionLines(
      records,
      "no archived store screenshot capture sets are recorded yet",
    ),
  ];

  return `${lines.join("\n").trim()}\n`;
}

export async function writeStoreScreenshotCaptureArchiveIndex({
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

    const manifestPath = path.join(archiveRoot, entry.name, "capture-archive.json");

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
  const markdown = buildStoreScreenshotCaptureArchiveIndexMarkdown({
    generatedAt,
    archiveRootRelative,
    records,
  });
  const json = {
    generatedAt,
    archiveRoot: archiveRootRelative,
    recordCount: records.length,
    records,
  };

  await writeFile(indexMarkdownPath, markdown, "utf8");
  await writeFile(indexJsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  return json;
}
