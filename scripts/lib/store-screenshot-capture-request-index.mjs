import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS } from "./store-screenshot-capture-request.mjs";

function normalizeRecord(record, manifestPath, projectRoot) {
  return {
    requestId: typeof record?.requestId === "string" ? record.requestId : "",
    createdAt: typeof record?.createdAt === "string" ? record.createdAt : "",
    status: typeof record?.status === "string" ? record.status : "",
    runtimeSource:
      typeof record?.runtimeSource === "string" ? record.runtimeSource : "",
    preferredSize:
      typeof record?.preferredSize === "string" ? record.preferredSize : "",
    fallbackSize:
      typeof record?.fallbackSize === "string" ? record.fallbackSize : "",
    storyboardPath:
      typeof record?.storyboardPath === "string" ? record.storyboardPath : "",
    baselinePackReadme:
      typeof record?.baselinePackReadme === "string"
        ? record.baselinePackReadme
        : "",
    requiredScreenshotFilenames: Array.isArray(record?.requiredScreenshotFilenames)
      ? record.requiredScreenshotFilenames
      : [],
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
    lines.push(`  - runtime source: \`${record.runtimeSource || "not set"}\``);
    lines.push(
      `  - sizes: preferred \`${record.preferredSize || "not set"}\` · fallback \`${record.fallbackSize || "not set"}\``,
    );
    lines.push(
      `  - required screenshots: \`${record.requiredScreenshotFilenames.length}\``,
    );
    lines.push(
      `  - baseline pack: \`${record.baselinePackReadme || "not set"}\``,
    );
  }

  lines.push("");
  return lines;
}

export function buildStoreScreenshotCaptureRequestIndexMarkdown({
  generatedAt,
  requestRootRelative,
  records,
}) {
  const pendingRecords = records.filter(
    (record) => record.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
  );
  const fulfilledRecords = records.filter(
    (record) => record.status !== STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
  );
  const lines = [
    "# Store Screenshot Capture Requests",
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
    "- completion model: truthful when regenerated from current capture-request manifests, not when frozen as a one-time closeout file",
    "- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)",
    "",
    "Purpose:",
    "",
    "- track repo-backed store screenshot capture requests before the first real operator screenshot set exists",
    "- distinguish pending screenshot capture packages from any future fulfilled store-asset records",
    "",
    "Managed note:",
    "",
    `- this file is regenerated from \`capture-request.json\` manifests inside \`${requestRootRelative}\``,
    "- rerun `npm run store:refresh-screenshot-capture-request-index` after manual request edits",
    "",
    "## Request Commands",
    "",
    "Create a new pending store screenshot capture request:",
    "",
    "```bash",
    "npm run store:create-screenshot-capture-request -- --request-id 2026-04-24-first-real-store-screenshot-capture-request",
    "```",
    "",
    "Refresh only the generated request index and machine-readable catalog:",
    "",
    "```bash",
    "npm run store:refresh-screenshot-capture-request-index",
    "```",
    "",
    "## Truth Rules",
    "",
    "- a pending screenshot-capture request package is not a completed screenshot set",
    "- the baseline storyboard pack copied into a request package is only a baseline reference, not a finished store pack",
    "- future real screenshot archives should remain truthful extension-mode captures, not preview-only mocks",
    "",
    "## Pending Requests",
    "",
    ...buildSectionLines(
      pendingRecords,
      "no pending store screenshot capture requests are recorded yet",
    ),
    "## Fulfilled Requests",
    "",
    ...buildSectionLines(
      fulfilledRecords,
      "no fulfilled store screenshot capture requests are recorded yet",
    ),
  ];

  return `${lines.join("\n").trim()}\n`;
}

export async function writeStoreScreenshotCaptureRequestIndex({
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

    const manifestPath = path.join(requestRoot, entry.name, "capture-request.json");

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
  const markdown = buildStoreScreenshotCaptureRequestIndexMarkdown({
    generatedAt,
    requestRootRelative,
    records,
  });
  const json = {
    generatedAt,
    requestRoot: requestRootRelative,
    recordCount: records.length,
    pendingRequestCount: records.filter(
      (record) => record.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    ).length,
    fulfilledRequestCount: records.filter(
      (record) => record.status !== STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    ).length,
    records,
  };

  await writeFile(indexMarkdownPath, markdown, "utf8");
  await writeFile(indexJsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  return json;
}
