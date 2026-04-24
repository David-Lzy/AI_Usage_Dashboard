import path from "node:path";
import process from "node:process";

import {
  completeStoreScreenshotCaptureRequest,
} from "./complete-store-screenshot-capture-request.mjs";
import {
  importStoreScreenshotManualCaptures,
} from "./import-store-screenshot-manual-captures.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
);
const defaultArchiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_archives",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    requestRoot: defaultRequestRoot,
    archiveRoot: defaultArchiveRoot,
    sourceDir: "",
    notesFile: "",
    archiveId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--archive-root") {
      options.archiveRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--source-dir") {
      options.sourceDir = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--notes-file") {
      options.notesFile = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--archive-id") {
      options.archiveId = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return options;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildArchiveReadinessError(handoffDocument) {
  const issues = Array.isArray(handoffDocument?.archiveReadinessIssues)
    ? handoffDocument.archiveReadinessIssues
    : [];
  const summary = handoffDocument?.summary ?? {};
  const details = [
    `request=${handoffDocument?.requestId || "unknown"}`,
    `remaining_manual=${summary.remainingManualCount ?? 0}`,
    `manual_missing=${summary.manualCaptureMissingCount ?? 0}`,
    `manual_notes_incomplete=${summary.manualNoteIncompleteCount ?? 0}`,
  ];

  return [
    "Manual screenshot request is not ready to archive after import.",
    details.join(" "),
    ...issues.map((issue) => `- ${issue}`),
  ].join("\n");
}

export async function finalizeStoreScreenshotManualRequest({
  requestId,
  requestRoot = defaultRequestRoot,
  archiveRoot = defaultArchiveRoot,
  sourceDir,
  notesFile = "",
  archiveId = "",
}) {
  assert(requestId.length > 0, "Pass `--request-id <pending-request-id>`." );
  assert(
    typeof sourceDir === "string" && sourceDir.length > 0,
    "Pass `--source-dir <native-toolbar-popup-capture-dir>`." ,
  );

  const importResult = await importStoreScreenshotManualCaptures({
    requestId,
    requestRoot,
    sourceDir,
    notesFile,
  });
  const handoffDocument = importResult.handoffDocument;

  assert(
    Boolean(handoffDocument?.summary?.archiveReady),
    buildArchiveReadinessError(handoffDocument),
  );

  const completionResult = await completeStoreScreenshotCaptureRequest({
    requestId,
    requestRoot,
    archiveRoot,
    archiveId,
  });

  return {
    requestId: completionResult.requestId,
    archiveId: completionResult.archiveId,
    importedFilenames: importResult.importedFilenames,
    notesUpdatedCount: importResult.notesUpdatedCount,
    handoffDocument,
    completionResult,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const result = await finalizeStoreScreenshotManualRequest({
    requestId: options.requestId,
    requestRoot: options.requestRoot,
    archiveRoot: options.archiveRoot,
    sourceDir: options.sourceDir,
    notesFile: options.notesFile,
    archiveId: options.archiveId,
  });

  console.log(
    `store-screenshot: finalized manual request request=${result.requestId} imported=${result.importedFilenames.length} notes_updated=${result.notesUpdatedCount} archive=${result.archiveId} reviewed=${result.completionResult.notesSummary.reviewedScreenshotCount}`,
  );
}

const executedAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;

if (executedAsScript) {
  void run().catch((error) => {
    console.error("store-screenshot: failed to finalize manual screenshot request");
    console.error(error);
    process.exitCode = 1;
  });
}
