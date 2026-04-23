import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS =
  "pending_operator_capture";

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
}) {
  return `# Store Screenshot Capture Request - ${requestId}

Date: ${createdAt.slice(0, 10)}

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this request package is a pending operator capture workflow, not a completed screenshot set
- refresh or regenerate it through the request command instead of treating it as one free-standing authored plan

## Request Scope

- request id:
  - \`${requestId}\`
- created at:
  - \`${createdAt}\`
- status:
  - \`${STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS}\`
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
`;
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
  };

  await mkdir(requestDir, { recursive: true });
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

  return {
    requestDirRelative,
    manifest,
  };
}
