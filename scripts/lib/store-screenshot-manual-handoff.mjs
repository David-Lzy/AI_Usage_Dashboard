import {
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
  normalizeStoreScreenshotCaptureNotesDocument,
} from "./store-screenshot-capture-request.mjs";
import {
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
} from "./store-screenshot-capture-plan.mjs";

export const STORE_SCREENSHOT_MANUAL_CAPTURE_HANDOFF_SCHEMA_VERSION = 1;

const STORE_SCREENSHOT_SLOT_STORY = {
  "01-toolbar-first-quick-glance.png": {
    label: "Toolbar-first quick glance",
    claim: "one click gives a compact, readable AI usage snapshot",
    mustShow:
      "popup header, top summary, setup coverage, featured provider, and badge-compatible quick-glance framing",
  },
  "02-setup-guidance.png": {
    label: "Setup guidance",
    claim:
      "the product tells the user what to do next instead of only showing raw usage cards",
    mustShow: "guidance card, setup stage, and stateful CTA",
  },
  "03-honest-contract-or-policy-only.png": {
    label: "Honest contract-only or policy-only state",
    claim:
      "the extension is honest about provider coverage and does not fake live precision",
    mustShow:
      "setup or contract story without pretending unsupported live data exists",
  },
  "04-settings-and-setup-depth.png": {
    label: "Settings and setup depth",
    claim: "setup ownership lives in the deeper workspace instead of a bloated popup",
    mustShow:
      "theme and source/setup controls with enough surrounding context to read as an expanded extension workspace",
  },
  "05-provider-or-dashboard-depth.png": {
    label: "Provider or dashboard depth",
    claim:
      "the expanded workspace owns deeper review, contract context, and provider detail",
    mustShow:
      "one deeper inspection surface that clearly extends beyond the popup quick-glance role",
  },
};

function normalizeCapturePresenceByFilename(value) {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([filename, present]) => [filename, Boolean(present)]),
  );
}

function getStoryboardContract(filename) {
  return (
    STORE_SCREENSHOT_SLOT_STORY[filename] ?? {
      label: filename,
      claim: "capture the truthful runtime state requested for this screenshot slot",
      mustShow: "the actual extension surface needed to support the current store storyboard",
    }
  );
}

function getNormalizedNote(filename, notesByFilename) {
  const note = notesByFilename.get(filename);

  if (note) {
    return note;
  }

  return {
    filename,
    captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
    stateSummary: "",
    operatorNote: "",
  };
}

function isNoteComplete(note) {
  if (note.captureTruth === STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED) {
    return false;
  }

  if (note.stateSummary.trim().length === 0) {
    return false;
  }

  if (
    note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE &&
    note.operatorNote.trim().length === 0
  ) {
    return false;
  }

  return true;
}

function buildCompletionCommand({ requestId, capturesDirRelative }) {
  return `npm run store:complete-screenshot-capture-request -- --request-id ${requestId} --captures-dir ${capturesDirRelative}`;
}

function buildArchiveReadinessIssues({ entries, notesByFilename, capturePresenceByFilename }) {
  const issues = [];

  for (const entry of entries) {
    const note = getNormalizedNote(entry.filename, notesByFilename);
    const capturePresent = Boolean(capturePresenceByFilename[entry.filename]);

    if (!capturePresent) {
      issues.push(`Capture file is still missing for \`${entry.filename}\`.`);
    }

    if (note.captureTruth === STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED) {
      issues.push(`Capture notes are still \`not_reviewed\` for \`${entry.filename}\`.`);
    }

    if (note.stateSummary.trim().length === 0) {
      issues.push(`Capture notes are missing \`stateSummary\` for \`${entry.filename}\`.`);
    }

    if (
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED &&
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE &&
      note.operatorNote.trim().length === 0
    ) {
      issues.push(
        `Capture notes need \`operatorNote\` for \`${entry.filename}\` when \`captureTruth\` is \`${note.captureTruth}\`.`,
      );
    }
  }

  return issues;
}

function renderEntryLines(entry, modeLabel) {
  const lines = [
    `- \`${entry.filename}\``,
    `  - slot: ${entry.storyboardLabel}`,
    `  - claim: ${entry.storyboardClaim}`,
    `  - must show: ${entry.mustShow}`,
    `  - mode: \`${modeLabel}\``,
    `  - surface: \`${entry.requestedSurface}\``,
    `  - capture present: \`${entry.capturePresent ? "yes" : "no"}\``,
    `  - note status: \`${entry.noteStatus}\``,
  ];

  if (typeof entry.preferredSize === "string" && entry.preferredSize.length > 0) {
    lines.push(`  - preferred size: \`${entry.preferredSize}\``);
  }

  if (typeof entry.fallbackSize === "string" && entry.fallbackSize.length > 0) {
    lines.push(`  - fallback size: \`${entry.fallbackSize}\``);
  }

  if (typeof entry.routePath === "string" && entry.routePath.length > 0) {
    lines.push(`  - route path: \`${entry.routePath}\``);
  }

  if (typeof entry.capturePath === "string" && entry.capturePath.length > 0) {
    lines.push(`  - capture path: \`${entry.capturePath}\``);
  }

  if (typeof entry.manualReason === "string" && entry.manualReason.length > 0) {
    lines.push(`  - manual note: ${entry.manualReason}`);
  }

  if (entry.noteStateSummary.trim().length > 0) {
    lines.push(`  - state summary: ${entry.noteStateSummary}`);
  }

  if (entry.noteOperatorNote.trim().length > 0) {
    lines.push(`  - operator note: ${entry.noteOperatorNote}`);
  }

  return lines.join("\n");
}

export function buildStoreScreenshotManualCaptureHandoffDocument({
  requestId,
  requestCreatedAt,
  status,
  capturePlanDocument,
  notesDocument,
  capturePresenceByFilename,
  capturesDirRelative,
}) {
  const normalizedNotes = normalizeStoreScreenshotCaptureNotesDocument(notesDocument);
  const notesByFilename = new Map(
    normalizedNotes.notes.map((note) => [note.filename, note]),
  );
  const presenceMap = normalizeCapturePresenceByFilename(capturePresenceByFilename);
  const planEntries = Array.isArray(capturePlanDocument?.entries)
    ? capturePlanDocument.entries
    : [];
  const manualEntries = [];
  const stagedEntries = [];

  for (const entry of planEntries) {
    const note = getNormalizedNote(entry.filename, notesByFilename);
    const storyboard = getStoryboardContract(entry.filename);
    const capturePresent = Boolean(presenceMap[entry.filename]);
    const common = {
      filename: entry.filename,
      requestedSurface: entry.requestedSurface,
      capturePresent,
      noteStatus: note.captureTruth,
      noteStateSummary: note.stateSummary,
      noteOperatorNote: note.operatorNote,
      noteComplete: isNoteComplete(note),
      storyboardLabel: storyboard.label,
      storyboardClaim: storyboard.claim,
      mustShow: storyboard.mustShow,
    };

    if (entry.captureMode === STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE) {
      manualEntries.push({
        ...common,
        preferredSize:
          typeof entry.preferredSize === "string" ? entry.preferredSize : "",
        fallbackSize:
          typeof entry.fallbackSize === "string" ? entry.fallbackSize : "",
        manualReason:
          typeof entry.manualReason === "string" ? entry.manualReason : "",
      });
      continue;
    }

    stagedEntries.push({
      ...common,
      routePath: typeof entry.routePath === "string" ? entry.routePath : "",
      capturePath: capturePresent
        ? `${capturesDirRelative}/${entry.filename}`
        : "",
    });
  }

  const remainingManualEntries = manualEntries.filter(
    (entry) => !entry.capturePresent || !entry.noteComplete,
  );
  const stagedReadyEntries = stagedEntries.filter(
    (entry) => entry.capturePresent && entry.noteComplete,
  );
  const stagedPendingEntries = stagedEntries.filter(
    (entry) => !entry.capturePresent || !entry.noteComplete,
  );
  const archiveReadinessIssues = buildArchiveReadinessIssues({
    entries: planEntries,
    notesByFilename,
    capturePresenceByFilename: presenceMap,
  });

  return {
    requestId,
    requestCreatedAt,
    handoffSchemaVersion: STORE_SCREENSHOT_MANUAL_CAPTURE_HANDOFF_SCHEMA_VERSION,
    status,
    completionCommand: buildCompletionCommand({
      requestId,
      capturesDirRelative,
    }),
    summary: {
      entryCount: planEntries.length,
      manualEntryCount: manualEntries.length,
      remainingManualCount: remainingManualEntries.length,
      stagedRequestBoundCount: stagedEntries.length,
      stagedReadyCount: stagedReadyEntries.length,
      stagedPendingCount: stagedPendingEntries.length,
      archiveReady: archiveReadinessIssues.length === 0,
    },
    manualEntries,
    remainingManualEntries,
    stagedEntries,
    stagedReadyEntries,
    stagedPendingEntries,
    archiveReadinessIssues,
  };
}

export function buildStoreScreenshotManualCaptureHandoffMarkdown(handoffDocument) {
  const remainingManualSection =
    handoffDocument.remainingManualEntries.length === 0
      ? "- none; this request no longer has unresolved manual screenshot work."
      : handoffDocument.remainingManualEntries
          .map((entry) =>
            renderEntryLines(entry, "manual_operator_capture"),
          )
          .join("\n");
  const stagedSection =
    handoffDocument.stagedEntries.length === 0
      ? "- none; this request does not currently carry staged request-bound entries."
      : handoffDocument.stagedEntries
          .map((entry) =>
            renderEntryLines(entry, "request_bound_rdp_runner"),
          )
          .join("\n");
  const readinessSection =
    handoffDocument.archiveReadinessIssues.length === 0
      ? "- ready; the request can now be completed with the command below."
      : handoffDocument.archiveReadinessIssues
          .map((issue) => `- ${issue}`)
          .join("\n");

  return `# Store Screenshot Manual Capture Handoff - ${handoffDocument.requestId}

Date: ${handoffDocument.requestCreatedAt.slice(0, 10)}

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this file is the current manual-capture handoff for one request-bound screenshot package
- refresh or regenerate it through the request refresh or manual handoff command instead of editing it by hand

## Handoff Summary

- request id:
  - \`${handoffDocument.requestId}\`
- status:
  - \`${handoffDocument.status}\`
- manual slots:
  - \`${handoffDocument.summary.manualEntryCount}\`
- remaining manual slots:
  - \`${handoffDocument.summary.remainingManualCount}\`
- staged request-bound slots:
  - \`${handoffDocument.summary.stagedRequestBoundCount}\`
- staged ready slots:
  - \`${handoffDocument.summary.stagedReadyCount}\`
- archive ready:
  - \`${handoffDocument.summary.archiveReady ? "yes" : "no"}\`
- completion command:
  - \`${handoffDocument.completionCommand}\`

## Remaining Manual Captures

${remainingManualSection}

## Staged Request-Bound Entries

${stagedSection}

## Archive Readiness

${readinessSection}
`;
}
