import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildStoreScreenshotCapturePlanDocument,
} from "./store-screenshot-capture-plan.mjs";
import {
  buildStoreScreenshotManualCaptureHandoffDocument,
  buildStoreScreenshotManualCaptureHandoffMarkdown,
} from "./store-screenshot-manual-handoff.mjs";

export const STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS =
  "pending_operator_capture";
export const STORE_SCREENSHOT_CAPTURE_REQUEST_FULFILLED_STATUS =
  "fulfilled_operator_capture";
export const STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_REQUEST_BOUND_RDP_RUNNER =
  "request_bound_rdp_runner";
export const STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED =
  "manual_capture_required";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED =
  "not_reviewed";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE =
  "exact_runtime_capture";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE =
  "approximated_runtime_state";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_POLICY_ONLY_FALLBACK =
  "policy_only_fallback";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_PROVIDER_OMITTED =
  "provider_omitted";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_OTHER_TRUTH_BOUNDARY =
  "other_truth_boundary";
export const STORE_SCREENSHOT_CAPTURE_NOTE_STATUSES = [
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_POLICY_ONLY_FALLBACK,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_PROVIDER_OMITTED,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_OTHER_TRUTH_BOUNDARY,
];

const STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_DESCRIPTIONS = {
  [STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED]:
    "placeholder state; replace it before completing the request",
  [STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE]:
    "the screenshot is an exact extension-mode runtime capture with no special truth boundary to record",
  [STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE]:
    "the screenshot used an approximated runtime state that still needs an explicit operator note",
  [STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_POLICY_ONLY_FALLBACK]:
    "the screenshot truthfully relies on a policy-only or contract-only fallback and must say so explicitly",
  [STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_PROVIDER_OMITTED]:
    "the screenshot intentionally omits one or more providers and must explain that omission",
  [STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_OTHER_TRUTH_BOUNDARY]:
    "the screenshot has another truthful boundary that needs an explicit operator note",
};

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

function normalizeCaptureTruth(value) {
  return STORE_SCREENSHOT_CAPTURE_NOTE_STATUSES.includes(value)
    ? value
    : STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED;
}

function normalizeCaptureNoteEntry(entry) {
  return {
    filename: typeof entry?.filename === "string" ? entry.filename : "",
    captureTruth: normalizeCaptureTruth(entry?.captureTruth),
    stateSummary:
      typeof entry?.stateSummary === "string" ? entry.stateSummary : "",
    operatorNote:
      typeof entry?.operatorNote === "string" ? entry.operatorNote : "",
  };
}

export function normalizeStoreScreenshotCaptureNotesDocument(value) {
  return {
    requestId: typeof value?.requestId === "string" ? value.requestId : "",
    requestCreatedAt:
      typeof value?.requestCreatedAt === "string" ? value.requestCreatedAt : "",
    notesSchemaVersion: value?.notesSchemaVersion === 1 ? 1 : 1,
    captureTruthLegend:
      value?.captureTruthLegend && typeof value.captureTruthLegend === "object"
        ? value.captureTruthLegend
        : STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_DESCRIPTIONS,
    notes: Array.isArray(value?.notes)
      ? value.notes.map((item) => normalizeCaptureNoteEntry(item))
      : [],
  };
}

export function buildStoreScreenshotCaptureNotesSummary(notesDocument) {
  const normalized = normalizeStoreScreenshotCaptureNotesDocument(notesDocument);
  const reviewedScreenshotCount = normalized.notes.filter(
    (note) =>
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
  ).length;
  const truthBoundaryCount = normalized.notes.filter(
    (note) =>
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED &&
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
  ).length;

  return {
    noteCount: normalized.notes.length,
    reviewedScreenshotCount,
    pendingReviewCount: normalized.notes.length - reviewedScreenshotCount,
    truthBoundaryCount,
  };
}

export function buildStoreScreenshotCaptureNotesDocument({
  requestId,
  requestCreatedAt,
  requiredScreenshotFilenames,
}) {
  return {
    requestId,
    requestCreatedAt,
    notesSchemaVersion: 1,
    captureTruthLegend: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_DESCRIPTIONS,
    notes: normalizeStringArray(requiredScreenshotFilenames).map((filename) => ({
      filename,
      captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
      stateSummary: "",
      operatorNote: "",
    })),
  };
}

export function validateStoreScreenshotCaptureNotesDocument({
  notesDocument,
  requestId,
  requestCreatedAt,
  requiredScreenshotFilenames,
}) {
  const issues = [];
  const normalized = normalizeStoreScreenshotCaptureNotesDocument(notesDocument);
  const requiredFilenames = normalizeStringArray(requiredScreenshotFilenames);
  const notesByFilename = new Map(
    normalized.notes.map((note) => [note.filename, note]),
  );
  const extraFilenames = normalized.notes
    .map((note) => note.filename)
    .filter((filename) => !requiredFilenames.includes(filename));

  if (normalized.requestId !== requestId) {
    issues.push(
      `Capture notes request id \`${normalized.requestId || "missing"}\` did not match request \`${requestId}\`.`,
    );
  }

  if (normalized.requestCreatedAt !== requestCreatedAt) {
    issues.push(
      `Capture notes requestCreatedAt \`${normalized.requestCreatedAt || "missing"}\` did not match request \`${requestCreatedAt}\`.`,
    );
  }

  if (extraFilenames.length > 0) {
    issues.push(
      `Capture notes included unexpected screenshot entries: ${extraFilenames.map((item) => `\`${item}\``).join(", ")}.`,
    );
  }

  for (const filename of requiredFilenames) {
    const note = notesByFilename.get(filename);

    if (!note) {
      issues.push(`Capture notes were missing an entry for \`${filename}\`.`);
      continue;
    }

    if (
      note.captureTruth === STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED
    ) {
      issues.push(
        `Capture notes for \`${filename}\` were still \`not_reviewed\`.`,
      );
    }

    if (note.stateSummary.trim().length === 0) {
      issues.push(
        `Capture notes for \`${filename}\` were missing \`stateSummary\`.`,
      );
    }

    if (
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED &&
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE &&
      note.operatorNote.trim().length === 0
    ) {
      issues.push(
        `Capture notes for \`${filename}\` need \`operatorNote\` when \`captureTruth\` is \`${note.captureTruth}\`.`,
      );
    }
  }

  return {
    issues,
    normalized,
    summary: buildStoreScreenshotCaptureNotesSummary(normalized),
  };
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
    sourceNotesPath:
      typeof value.sourceNotesPath === "string" ? value.sourceNotesPath : "",
    archiveId,
    archiveReadmePath:
      typeof value.archiveReadmePath === "string" ? value.archiveReadmePath : "",
    archiveManifestPath:
      typeof value.archiveManifestPath === "string"
        ? value.archiveManifestPath
        : "",
    archiveNotesPath:
      typeof value.archiveNotesPath === "string" ? value.archiveNotesPath : "",
    screenshotFilenames: normalizeStringArray(value.screenshotFilenames),
    reviewedScreenshotCount:
      typeof value.reviewedScreenshotCount === "number"
        ? value.reviewedScreenshotCount
        : 0,
    truthBoundaryCount:
      typeof value.truthBoundaryCount === "number" ? value.truthBoundaryCount : 0,
  };
}

function normalizeTemplate(template) {
  return {
    storyboardPath:
      typeof template?.storyboardPath === "string" ? template.storyboardPath : "",
    selectionPackPath:
      typeof template?.selectionPackPath === "string"
        ? template.selectionPackPath
        : "",
    baselinePackReadme:
      typeof template?.baselinePackReadme === "string"
        ? template.baselinePackReadme
        : "",
    baselinePackPlan:
      typeof template?.baselinePackPlan === "string"
        ? template.baselinePackPlan
        : "",
    baselineArchiveReadme:
      typeof template?.baselineArchiveReadme === "string"
        ? template.baselineArchiveReadme
        : "",
    preferredSize:
      typeof template?.preferredSize === "string" ? template.preferredSize : "",
    fallbackSize:
      typeof template?.fallbackSize === "string" ? template.fallbackSize : "",
    runtimeSource:
      typeof template?.runtimeSource === "string" ? template.runtimeSource : "",
    captureAutomationMode:
      template?.captureAutomationMode ===
        STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED
        ? STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED
        : STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_REQUEST_BOUND_RDP_RUNNER,
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
  capturePlanDocument,
  manualHandoffDocument,
}) {
  const pendingNote =
    status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS
      ? [
          "- place truthful extension-mode screenshots here using the exact filenames listed below, or pass another capture directory to the completion command",
          "- this folder is a staging area, not a completed archive",
          "- keep `../capture-notes.json` in sync with the runtime state of every screenshot before completion",
        ]
      : [
          "- this request has already been fulfilled",
          `- durable archived evidence now lives in \`${fulfillment?.archiveReadmePath || "archive not recorded"}\``,
        ];
  const capturePlanEntries = Array.isArray(capturePlanDocument?.entries)
    ? capturePlanDocument.entries
    : [];

  return `# Store Screenshot Capture Files - ${requestId}

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

${pendingNote.join("\n")}

## Expected Filenames

${requiredScreenshotFilenames.map((item) => `- \`${item}\``).join("\n")}

## Capture Plan

- plan file:
  - \`../capture-plan.json\`

${capturePlanEntries
  .map((item) => {
    const lines = [
      `- \`${item.filename}\``,
      `  - mode: \`${item.captureMode}\``,
      `  - surface: \`${item.requestedSurface}\``,
    ];

    if (typeof item.routePath === "string" && item.routePath.length > 0) {
      lines.push(`  - route path: \`${item.routePath}\``);
    }

    if (typeof item.manualReason === "string" && item.manualReason.length > 0) {
      lines.push(`  - manual note: ${item.manualReason}`);
    }

    return lines.join("\n");
  })
  .join("\n")}

## Notes File

- update \`../capture-notes.json\` for every required screenshot before running the completion command
`;
}

function buildReadme({
  requestId,
  createdAt,
  storyboardPath,
  selectionPackPath,
  baselinePackReadme,
  baselinePackPlan,
  baselineArchiveReadme,
  runtimeSource,
  captureAutomationMode,
  preferredSize,
  fallbackSize,
  requiredScreenshotFilenames,
  workflow,
  truthRules,
  status,
  fulfillment,
  capturePlanDocument,
  manualHandoffDocument,
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
- source notes:
  - \`${fulfillment.sourceNotesPath}\`
- archive notes:
  - \`${fulfillment.archiveNotesPath}\`
- reviewed screenshots:
  - \`${fulfillment.reviewedScreenshotCount}\`
- truth-boundary screenshots:
  - \`${fulfillment.truthBoundaryCount}\`
- archived screenshots:
${fulfillment.screenshotFilenames.map((item) => `  - \`${item}\``).join("\n")}
`;
  const capturePlanEntries = Array.isArray(capturePlanDocument?.entries)
    ? capturePlanDocument.entries
    : [];

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
- capture automation mode:
  - \`${captureAutomationMode}\`
- preferred size:
  - \`${preferredSize}\`
- fallback size:
  - \`${fallbackSize}\`
- capture notes:
  - \`capture-notes.json\`
- capture plan:
  - \`capture-plan.json\`

## Source References

- storyboard:
  - \`${storyboardPath}\`
${selectionPackPath ? `- selection pack:
  - \`${selectionPackPath}\`
` : ""}${baselineArchiveReadme ? `- baseline archive README:
  - \`${baselineArchiveReadme}\`
` : ""}- baseline pack README:
  - \`${baselinePackReadme}\`
- baseline pack plan:
  - \`${baselinePackPlan}\`

## Required Screenshot Filenames

${requiredScreenshotFilenames.map((item) => `- \`${item}\``).join("\n")}

## Capture Plan Summary

- request-bound runner slots:
  - \`${capturePlanDocument?.summary?.requestBoundRunnerCount ?? 0}\`
- manual operator slots:
  - \`${capturePlanDocument?.summary?.manualOperatorCount ?? 0}\`

${capturePlanEntries
  .map((item) => {
    const lines = [
      `- \`${item.filename}\``,
      `  - mode: \`${item.captureMode}\``,
      `  - surface: \`${item.requestedSurface}\``,
    ];

    if (typeof item.routePath === "string" && item.routePath.length > 0) {
      lines.push(`  - route path: \`${item.routePath}\``);
    }

    if (typeof item.manualReason === "string" && item.manualReason.length > 0) {
      lines.push(`  - manual note: ${item.manualReason}`);
    }

    return lines.join("\n");
  })
  .join("\n")}

## Capture Notes

- notes file:
  - \`capture-notes.json\`
- completion requires one reviewed note per screenshot
- every note must include:
  - one non-placeholder \`captureTruth\`
  - one short \`stateSummary\`
  - one non-empty \`operatorNote\` when the screenshot uses approximation, omission, or a fallback contract state

Allowed \`captureTruth\` values:

- \`${STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED}\`
- \`${STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE}\`
- \`${STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE}\`
- \`${STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_POLICY_ONLY_FALLBACK}\`
- \`${STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_PROVIDER_OMITTED}\`
- \`${STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_OTHER_TRUTH_BOUNDARY}\`

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

async function buildCapturePresenceByFilename(capturesDir, filenames) {
  const presence = {};

  for (const filename of normalizeStringArray(filenames)) {
    const filePath = path.join(capturesDir, filename);
    const fileStat = await stat(filePath).catch(() => null);
    presence[filename] = fileStat !== null && fileStat.isFile();
  }

  return presence;
}

export function buildStoreScreenshotCaptureRequestFulfillment({
  fulfilledAt,
  sourceCaptureDir,
  sourceNotesPath,
  archiveId,
  archiveReadmePath,
  archiveManifestPath,
  archiveNotesPath,
  screenshotFilenames,
  reviewedScreenshotCount,
  truthBoundaryCount,
}) {
  return normalizeFulfillment({
    fulfilledAt,
    sourceCaptureDir,
    sourceNotesPath,
    archiveId,
    archiveReadmePath,
    archiveManifestPath,
    archiveNotesPath,
    screenshotFilenames,
    reviewedScreenshotCount,
    truthBoundaryCount,
  });
}

async function writeRequestFiles({
  projectRoot,
  requestDir,
  manifest,
  notesDocument,
}) {
  const capturesDir = path.join(requestDir, "captures");
  const capturePlanDocument = buildStoreScreenshotCapturePlanDocument({
    requestId: manifest.requestId,
    requestCreatedAt: manifest.createdAt,
    captureAutomationMode: manifest.captureAutomationMode,
    requiredScreenshotFilenames: manifest.requiredScreenshotFilenames,
  });

  await mkdir(requestDir, { recursive: true });
  await mkdir(capturesDir, { recursive: true });

  const capturePresenceByFilename = await buildCapturePresenceByFilename(
    capturesDir,
    manifest.requiredScreenshotFilenames,
  );
  const manualHandoffDocument = buildStoreScreenshotManualCaptureHandoffDocument({
    requestId: manifest.requestId,
    requestCreatedAt: manifest.createdAt,
    status: manifest.status,
    capturePlanDocument,
    notesDocument,
    capturePresenceByFilename,
    capturesDirRelative: path.relative(projectRoot, capturesDir),
  });
  await writeFile(
    path.join(requestDir, "capture-request.json"),
    `${JSON.stringify(manifest, null, 2)}
`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "capture-plan.json"),
    `${JSON.stringify(capturePlanDocument, null, 2)}
`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "manual-capture-handoff.json"),
    `${JSON.stringify(manualHandoffDocument, null, 2)}
`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "manual-capture-handoff.md"),
    `${buildStoreScreenshotManualCaptureHandoffMarkdown(manualHandoffDocument).trimEnd()}
`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "capture-notes.json"),
    `${JSON.stringify(notesDocument, null, 2)}
`,
    "utf8",
  );
  await writeFile(
    path.join(requestDir, "README.md"),
    `${buildReadme({ ...manifest, capturePlanDocument, manualHandoffDocument }).trimEnd()}
`,
    "utf8",
  );
  await writeFile(
    path.join(capturesDir, "README.md"),
    `${buildCapturesReadme({
      requestId: manifest.requestId,
      status: manifest.status,
      fulfillment: manifest.fulfillment,
      requiredScreenshotFilenames: manifest.requiredScreenshotFilenames,
      capturePlanDocument,
      manualHandoffDocument,
    }).trimEnd()}
`,
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
  notesDocument,
}) {
  const normalizedTemplate = normalizeTemplate(requestTemplate);
  const requestDir = path.join(requestRoot, requestId);
  const requestDirRelative = path.relative(projectRoot, requestDir);
  const normalizedNotes = normalizeStoreScreenshotCaptureNotesDocument(
    notesDocument ??
      buildStoreScreenshotCaptureNotesDocument({
        requestId,
        requestCreatedAt: createdAt,
        requiredScreenshotFilenames: normalizedTemplate.requiredScreenshotFilenames,
      }),
  );
  const manifest = {
    requestId,
    createdAt,
    status: STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    sourceTemplate,
    storyboardPath: normalizedTemplate.storyboardPath,
    selectionPackPath: normalizedTemplate.selectionPackPath,
    baselinePackReadme: normalizedTemplate.baselinePackReadme,
    baselinePackPlan: normalizedTemplate.baselinePackPlan,
    baselineArchiveReadme: normalizedTemplate.baselineArchiveReadme,
    runtimeSource: normalizedTemplate.runtimeSource,
    captureAutomationMode: normalizedTemplate.captureAutomationMode,
    preferredSize: normalizedTemplate.preferredSize,
    fallbackSize: normalizedTemplate.fallbackSize,
    requiredScreenshotFilenames: normalizedTemplate.requiredScreenshotFilenames,
    workflow: normalizedTemplate.workflow,
    truthRules: normalizedTemplate.truthRules,
    fulfillment: null,
  };

  await writeRequestFiles({
    projectRoot,
    requestDir,
    manifest,
    notesDocument: normalizedNotes,
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
  notesDocument,
}) {
  const normalizedTemplate = normalizeTemplate(requestTemplate);
  const normalizedNotes = normalizeStoreScreenshotCaptureNotesDocument(
    notesDocument ??
      buildStoreScreenshotCaptureNotesDocument({
        requestId,
        requestCreatedAt: createdAt,
        requiredScreenshotFilenames: normalizedTemplate.requiredScreenshotFilenames,
      }),
  );
  const manifest = {
    requestId,
    createdAt,
    status,
    sourceTemplate,
    storyboardPath: normalizedTemplate.storyboardPath,
    selectionPackPath: normalizedTemplate.selectionPackPath,
    baselinePackReadme: normalizedTemplate.baselinePackReadme,
    baselinePackPlan: normalizedTemplate.baselinePackPlan,
    baselineArchiveReadme: normalizedTemplate.baselineArchiveReadme,
    runtimeSource: normalizedTemplate.runtimeSource,
    captureAutomationMode: normalizedTemplate.captureAutomationMode,
    preferredSize: normalizedTemplate.preferredSize,
    fallbackSize: normalizedTemplate.fallbackSize,
    requiredScreenshotFilenames: normalizedTemplate.requiredScreenshotFilenames,
    workflow: normalizedTemplate.workflow,
    truthRules: normalizedTemplate.truthRules,
    fulfillment: normalizeFulfillment(fulfillment),
  };

  await writeRequestFiles({
    projectRoot,
    requestDir,
    manifest,
    notesDocument: normalizedNotes,
  });

  return manifest;
}
