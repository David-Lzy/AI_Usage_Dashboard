import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS =
  "pending_operator_capture";
export const STORE_SCREENSHOT_CAPTURE_REQUEST_FULFILLED_STATUS =
  "fulfilled_operator_capture";

function sanitizeSegment(value) {
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

function normalizeFulfillment(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const fulfilledAt =
    typeof value.fulfilledAt === "string" ? value.fulfilledAt : "";
  const archiveId = typeof value.archiveId === "string" ? value.archiveId : "";

  if (fulfilledAt.length === 0 || archiveId.length === 0) {
    return null;
  }

  return {
    fulfilledAt,
    sourceCaptureDir:
      typeof value.sourceCaptureDir === "string" ? value.sourceCaptureDir : "",
    archiveId,
    archiveReadmePath:
      typeof value.archiveReadmePath === "string" ? value.archiveReadmePath : "",
    archiveManifestPath:
      typeof value.archiveManifestPath === "string"
        ? value.archiveManifestPath
        : "",
    screenshotFilenames: normalizeStringArray(value.screenshotFilenames),
  };
}

function normalizeTemplate(template) {
  return {
    storyboardPath:
      typeof template?.storyboardPath === "string" ? template.storyboardPath : "",
    baselinePackReadme:
      typeof template?.baselinePackReadme === "string"
        ? template.baselinePackReadme
        : "",
    baselinePackPlan:
      typeof template?.baselinePackPlan === "string"
        ? template.baselinePackPlan
        : "",
    preferredSize:
      typeof template?.preferredSize === "string" ? template.preferredSize : "",
    fallbackSize:
      typeof template?.fallbackSize === "string" ? template.fallbackSize : "",
    runtimeSource:
      typeof template?.runtimeSource === "string" ? template.runtimeSource : "",
    requiredScreenshotFilenames: normalizeStringArray(
      template?.requiredScreenshotFilenames,
    ),
    workflow: normalizeStringArray(template?.workflow),
    truthRules: normalizeStringArray(template?.truthRules),
  };
}

function buildCapturesReadme({
  requestId,
  status,
  fulfillment,
  requiredScreenshotFilenames,
}) {
  const pendingNote =
    status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS
      ? [
          "- place truthful extension-mode screenshots here using the exact filenames listed below, or pass another capture directory to the completion command",
          "- this folder is a staging area, not a completed archive",
        ]
      : [
          "- this request has already been fulfilled",
          `- durable archived evidence now lives in \`${fulfillment?.archiveReadmePath || "archive not recorded"}\``,
        ];

  return `# Store Screenshot Capture Files - ${requestId}

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

${pendingNote.join("\n")}

## Expected Filenames

${requiredScreenshotFilenames.map((item) => `- \`${item}\``).join("\n")}
`;
}

function buildReadme({
  requestId,
  createdAt,
  storyboardPath,
  baselinePackReadme,
  baselinePackPlan,
  runtimeSource,
  preferredSize,
  fallbackSize,
  requiredScreenshotFilenames,
  workflow,
  truthRules,
  status,
  fulfillment,
}) {
  const statusNote =
    status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS
      ? [
          "- this request package is a pending operator capture workflow, not a completed screenshot set",
          "- refresh or regenerate it through the request command instead of treating it as one free-standing authored plan",
        ]
      : [
          "- this request package has been fulfilled by one archived screenshot set",
          "- keep using the archive package as the durable evidence source rather than reinterpreting this request README as the final record",
        ];
  const fulfillmentSection =
    fulfillment === null
      ? ""
      : `
## Fulfillment

- fulfilled at:
  - \`${fulfillment.fulfilledAt}\`
- archive id:
  - \`${fulfillment.archiveId}\`
- archive README:
  - \`${fulfillment.archiveReadmePath}\`
- archive manifest:
  - \`${fulfillment.archiveManifestPath}\`
- source capture dir:
  - \`${fulfillment.sourceCaptureDir}\`
- archived screenshots:
${fulfillment.screenshotFilenames.map((item) => `  - \`${item}\``).join("\n")}
`;

  return `# Store Screenshot Capture Request - ${requestId}

Date: ${createdAt.slice(0, 10)}

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

${statusNote.join("\n")}

## Request Scope

- request id:
  - \`${requestId}\`
- created at:
  - \`${createdAt}\`
- status:
  - \`${status}\`
- runtime source:
  - \`${runtimeSource}\`
- preferred size:
  - \`${preferredSize}\`
- fallback size:
  - \`${fallbackSize}\`

## Source References

- storyboard:
  - \`${storyboardPath}\`
- baseline pack README:
  - \`${baselinePackReadme}\`
- baseline pack plan:
  - \`${baselinePackPlan}\`

## Required Screenshot Filenames

${requiredScreenshotFilenames.map((item) => `- \`${item}\``).join("\n")}

## Workflow

${workflow.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Truth Rules

${truthRules.map((item) => `- ${item}`).join("\n")}
${fulfillmentSection}
`;
}

export function buildStoreScreenshotCaptureRequestId({ requestId, createdAt }) {
  const explicit = sanitizeSegment(requestId);

  if (explicit.length > 0) {
    return explicit;
  }

  const datePrefix =
    typeof createdAt === "string" && createdAt.length >= 10
      ? createdAt.slice(0, 10)
      : "request";

  return sanitizeSegment(`${datePrefix}-store-screenshot-capture-request`);
}

export function buildStoreScreenshotCaptureRequestFulfillment({
  fulfilledAt,
  sourceCaptureDir,
  archiveId,
  archiveReadmePath,
  archiveManifestPath,
  screenshotFilenames,
}) {
  return normalizeFulfillment({
    fulfilledAt,
    sourceCaptureDir,
    archiveId,
    archiveReadmePath,
    archiveManifestPath,
    screenshotFilenames,
  });
}

async function writeRequestFiles({
  requestDir,
  manifest,
}) {
  const capturesDir = path.join(requestDir, "captures");

  await mkdir(requestDir, { recursive: true });
  await mkdir(capturesDir, { recursive: true });
  await writeFile(
    path.join(requestDir, "capture-request.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "README.md"),
    `${buildReadme(manifest)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(capturesDir, "README.md"),
    `${buildCapturesReadme({
      requestId: manifest.requestId,
      status: manifest.status,
      fulfillment: manifest.fulfillment,
      requiredScreenshotFilenames: manifest.requiredScreenshotFilenames,
    })}\n`,
    "utf8",
  );
}

export async function writeStoreScreenshotCaptureRequest({
  projectRoot,
  requestRoot,
  requestId,
  createdAt,
  requestTemplate,
  sourceTemplate,
}) {
  const normalizedTemplate = normalizeTemplate(requestTemplate);
  const requestDir = path.join(requestRoot, requestId);
  const requestDirRelative = path.relative(projectRoot, requestDir);
  const manifest = {
    requestId,
    createdAt,
    status: STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    sourceTemplate,
    storyboardPath: normalizedTemplate.storyboardPath,
    baselinePackReadme: normalizedTemplate.baselinePackReadme,
    baselinePackPlan: normalizedTemplate.baselinePackPlan,
    runtimeSource: normalizedTemplate.runtimeSource,
    preferredSize: normalizedTemplate.preferredSize,
    fallbackSize: normalizedTemplate.fallbackSize,
    requiredScreenshotFilenames: normalizedTemplate.requiredScreenshotFilenames,
    workflow: normalizedTemplate.workflow,
    truthRules: normalizedTemplate.truthRules,
    fulfillment: null,
  };

  await writeRequestFiles({
    requestDir,
    manifest,
  });

  return {
    requestDir,
    requestDirRelative,
    manifest,
  };
}

export async function updateStoreScreenshotCaptureRequest({
  projectRoot,
  requestDir,
  requestId,
  createdAt,
  requestTemplate,
  sourceTemplate,
  status,
  fulfillment,
}) {
  const normalizedTemplate = normalizeTemplate(requestTemplate);
  const manifest = {
    requestId,
    createdAt,
    status,
    sourceTemplate,
    storyboardPath: normalizedTemplate.storyboardPath,
    baselinePackReadme: normalizedTemplate.baselinePackReadme,
    baselinePackPlan: normalizedTemplate.baselinePackPlan,
    runtimeSource: normalizedTemplate.runtimeSource,
    preferredSize: normalizedTemplate.preferredSize,
    fallbackSize: normalizedTemplate.fallbackSize,
    requiredScreenshotFilenames: normalizedTemplate.requiredScreenshotFilenames,
    workflow: normalizedTemplate.workflow,
    truthRules: normalizedTemplate.truthRules,
    fulfillment: normalizeFulfillment(fulfillment),
  };

  await writeRequestFiles({
    requestDir,
    manifest,
  });

  return manifest;
}
