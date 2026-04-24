import { access, copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildStoreScreenshotCaptureNotesDocument,
  normalizeStoreScreenshotCaptureNotesDocument,
  STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
  STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
  updateStoreScreenshotCaptureRequest,
} from "./lib/store-screenshot-capture-request.mjs";
import {
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
} from "./lib/store-screenshot-capture-plan.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    requestRoot: defaultRequestRoot,
    sourceDir: "",
    notesFile: "",
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

    if (arg === "--source-dir") {
      options.sourceDir = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--notes-file") {
      options.notesFile = argv[index + 1] ?? "";
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

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

function mergeNotesOverlay({
  requestId,
  requestCreatedAt,
  requiredScreenshotFilenames,
  currentNotesDocument,
  overlayNotesDocument,
  manualFilenames,
}) {
  if (
    overlayNotesDocument.requestId.length > 0 &&
    overlayNotesDocument.requestId !== requestId
  ) {
    throw new Error(
      `Manual popup notes request id \`${overlayNotesDocument.requestId}\` did not match request \`${requestId}\`.`,
    );
  }

  if (
    overlayNotesDocument.requestCreatedAt.length > 0 &&
    overlayNotesDocument.requestCreatedAt !== requestCreatedAt
  ) {
    throw new Error(
      `Manual popup notes requestCreatedAt \`${overlayNotesDocument.requestCreatedAt}\` did not match request \`${requestCreatedAt}\`.`,
    );
  }

  const manualFilenameSet = new Set(manualFilenames);
  const unexpectedNotes = overlayNotesDocument.notes
    .map((note) => note.filename)
    .filter((filename) => filename.length > 0 && !manualFilenameSet.has(filename));

  assert(
    unexpectedNotes.length === 0,
    `Manual popup notes included unexpected filenames: ${unexpectedNotes.map((item) => `\`${item}\``).join(", ")}.`,
  );

  const baseNotesByFilename = new Map(
    currentNotesDocument.notes.map((note) => [note.filename, note]),
  );

  for (const note of overlayNotesDocument.notes) {
    if (!manualFilenameSet.has(note.filename)) {
      continue;
    }

    baseNotesByFilename.set(note.filename, note);
  }

  const defaultNotes = buildStoreScreenshotCaptureNotesDocument({
    requestId,
    requestCreatedAt,
    requiredScreenshotFilenames,
  });
  const defaultNotesByFilename = new Map(
    defaultNotes.notes.map((note) => [note.filename, note]),
  );

  return {
    requestId,
    requestCreatedAt,
    notesSchemaVersion: currentNotesDocument.notesSchemaVersion,
    captureTruthLegend: currentNotesDocument.captureTruthLegend,
    notes: requiredScreenshotFilenames.map(
      (filename) =>
        baseNotesByFilename.get(filename) ??
        defaultNotesByFilename.get(filename),
    ),
  };
}

export async function importStoreScreenshotManualCaptures({
  requestId,
  requestRoot = defaultRequestRoot,
  sourceDir,
  notesFile = "",
}) {
  assert(requestId.length > 0, "Pass `--request-id <pending-request-id>`.");
  assert(
    typeof sourceDir === "string" && sourceDir.length > 0,
    "Pass `--source-dir <native-toolbar-popup-capture-dir>`.",
  );

  const resolvedRequestRoot = path.resolve(projectRoot, requestRoot);
  const resolvedSourceDir = path.resolve(projectRoot, sourceDir);
  const requestDir = path.join(resolvedRequestRoot, requestId);
  const manifestPath = path.join(requestDir, "capture-request.json");
  const notesPath = path.join(requestDir, "capture-notes.json");
  const capturePlanPath = path.join(requestDir, "capture-plan.json");
  const capturesDir = path.join(requestDir, "captures");
  const manifest = await readJson(
    manifestPath,
    "Store screenshot capture request manifest",
  );

  assert(
    manifest.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    `Store screenshot capture request \`${requestId}\` is not pending.`,
  );
  assert(
    manifest.captureAutomationMode ===
      STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
    `Store screenshot capture request \`${requestId}\` is not on the manual handoff path.`,
  );

  const requestTemplate =
    typeof manifest.sourceTemplate === "string" && manifest.sourceTemplate.length > 0
      ? await readJson(
          path.resolve(projectRoot, manifest.sourceTemplate),
          "Store screenshot capture request source template",
        ).catch(() => manifest)
      : manifest;
  const currentNotesDocument = normalizeStoreScreenshotCaptureNotesDocument(
    await readJson(notesPath, "Store screenshot capture notes").catch(() =>
      buildStoreScreenshotCaptureNotesDocument({
        requestId: manifest.requestId,
        requestCreatedAt: manifest.createdAt,
        requiredScreenshotFilenames: manifest.requiredScreenshotFilenames,
      }),
    ),
  );
  const capturePlanDocument = await readJson(
    capturePlanPath,
    "Store screenshot capture plan",
  );
  const manualEntries = Array.isArray(capturePlanDocument.entries)
    ? capturePlanDocument.entries.filter(
        (entry) =>
          entry.captureMode ===
          STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
      )
    : [];

  assert(
    manualEntries.length > 0,
    `Store screenshot capture request \`${requestId}\` has no manual popup slots to import.`,
  );

  await access(resolvedSourceDir);

  const importedFilenames = [];

  for (const entry of manualEntries) {
    const sourcePath = path.join(resolvedSourceDir, entry.filename);
    const targetPath = path.join(capturesDir, entry.filename);
    const sourceExists = await access(sourcePath).then(
      () => true,
      () => false,
    );

    if (!sourceExists) {
      continue;
    }

    await copyFile(sourcePath, targetPath);
    importedFilenames.push(entry.filename);
  }

  let mergedNotesDocument = currentNotesDocument;
  let notesUpdatedCount = 0;

  if (notesFile.length > 0) {
    const overlayNotesDocument = normalizeStoreScreenshotCaptureNotesDocument(
      await readJson(
        path.resolve(projectRoot, notesFile),
        "Manual popup notes overlay",
      ),
    );
    const manualFilenameSet = new Set(manualEntries.map((entry) => entry.filename));

    mergedNotesDocument = mergeNotesOverlay({
      requestId: manifest.requestId,
      requestCreatedAt: manifest.createdAt,
      requiredScreenshotFilenames: manifest.requiredScreenshotFilenames,
      currentNotesDocument,
      overlayNotesDocument,
      manualFilenames: manualEntries.map((entry) => entry.filename),
    });
    notesUpdatedCount = overlayNotesDocument.notes.filter(
      (note) => note.filename.length > 0 && manualFilenameSet.has(note.filename),
    ).length;
  }

  await updateStoreScreenshotCaptureRequest({
    projectRoot,
    requestDir,
    requestId: manifest.requestId,
    createdAt: manifest.createdAt,
    requestTemplate,
    sourceTemplate: manifest.sourceTemplate,
    status: manifest.status,
    fulfillment: manifest.fulfillment,
    notesDocument: mergedNotesDocument,
  });

  const handoffDocument = await readJson(
    path.join(requestDir, "manual-capture-handoff.json"),
    "Store screenshot manual handoff",
  );

  return {
    requestDir,
    importedFilenames,
    notesUpdatedCount,
    handoffDocument,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const result = await importStoreScreenshotManualCaptures({
    requestId: options.requestId,
    requestRoot: options.requestRoot,
    sourceDir: options.sourceDir,
    notesFile: options.notesFile,
  });

  console.log(
    `store-screenshot: imported manual captures request=${result.handoffDocument.requestId} imported=${result.importedFilenames.length} notes_updated=${result.notesUpdatedCount} remaining_manual=${result.handoffDocument.summary.remainingManualCount} archive_ready=${result.handoffDocument.summary.archiveReady ? "yes" : "no"}`,
  );
}

const executedAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;

if (executedAsScript) {
  void run().catch((error) => {
    console.error("store-screenshot: failed to import manual captures");
    console.error(error);
    process.exitCode = 1;
  });
}
