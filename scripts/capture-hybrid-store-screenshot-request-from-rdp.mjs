import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  captureRdpExtensionWindow,
  closeRdpExtensionWindows,
  openRdpExtensionWindow,
  closeRdpExtensionWindow,
} from "./lib/rdp-extension-runtime-capture.mjs";
import {
  buildStoreScreenshotSeedRoutePath,
  STORE_SCREENSHOT_SEED_APPLIED_TITLE,
  STORE_SCREENSHOT_SEED_CLEARED_TITLE,
} from "./lib/store-screenshot-rdp-capture.mjs";
import {
  buildStoreScreenshotCapturePlanDocument,
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
} from "./lib/store-screenshot-capture-plan.mjs";
import {
  normalizeStoreScreenshotCaptureNotesDocument,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
  STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
} from "./lib/store-screenshot-capture-request.mjs";

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
    capturesDir: "",
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

    if (arg === "--captures-dir") {
      options.capturesDir = argv[index + 1] ?? "";
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

async function applyScreenshotSeed(preset) {
  const expectedTitle =
    preset === "unlock"
      ? STORE_SCREENSHOT_SEED_CLEARED_TITLE
      : STORE_SCREENSHOT_SEED_APPLIED_TITLE;

  const windowInfo = await openRdpExtensionWindow({
    projectRoot,
    routePath: buildStoreScreenshotSeedRoutePath(preset),
    expectedTitle,
    width: 960,
    height: 720,
    waitMs: 2000,
    timeoutMs: 12000,
  });

  await closeRdpExtensionWindow({
    windowId: windowInfo.windowId,
    display: windowInfo.display,
    xauthority: windowInfo.xauthority,
  });
}

export async function captureHybridStoreScreenshotRequestFromRdp({
  requestId,
  requestRoot = defaultRequestRoot,
  capturesDir = "",
  notesFile = "",
} = {}) {
  assert(requestId && requestId.length > 0, "Pass `requestId` for the pending screenshot request.");

  const resolvedRequestRoot = path.resolve(projectRoot, requestRoot);
  const requestDir = path.join(resolvedRequestRoot, requestId);
  const requestManifestPath = path.join(requestDir, "capture-request.json");
  const notesFilePath = path.resolve(
    projectRoot,
    notesFile.length > 0 ? notesFile : path.join(requestDir, "capture-notes.json"),
  );
  const resolvedCapturesDir = path.resolve(
    projectRoot,
    capturesDir.length > 0 ? capturesDir : path.join(requestDir, "captures"),
  );
  const requestManifest = await readJson(
    requestManifestPath,
    "Store screenshot capture request manifest",
  );

  assert(
    requestManifest.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    `Store screenshot request \`${requestManifest.requestId || requestId}\` is not pending.`,
  );

  const capturePlanDocument = buildStoreScreenshotCapturePlanDocument({
    requestId: requestManifest.requestId,
    requestCreatedAt: requestManifest.createdAt,
    captureAutomationMode: requestManifest.captureAutomationMode,
    requiredScreenshotFilenames: requestManifest.requiredScreenshotFilenames ?? [],
  });
  const requestBoundEntries = capturePlanDocument.entries.filter(
    (entry) =>
      entry.captureMode ===
      STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
  );
  const manualEntries = capturePlanDocument.entries.filter(
    (entry) =>
      entry.captureMode !==
      STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
  );

  assert(
    requestBoundEntries.length > 0,
    `Store screenshot request \`${requestManifest.requestId}\` did not include any request-bound RDP capture slots.`,
  );

  const originalNotesDocument = normalizeStoreScreenshotCaptureNotesDocument(
    await readJson(notesFilePath, "Store screenshot capture notes"),
  );
  const updatedNotesDocument = {
    ...originalNotesDocument,
    notes: [...originalNotesDocument.notes],
  };
  const captureResults = [];

  await mkdir(resolvedCapturesDir, { recursive: true });

  try {
    await closeRdpExtensionWindows({});
    await applyScreenshotSeed("unlock");

    for (const entry of requestBoundEntries) {
      await closeRdpExtensionWindows({});
      await applyScreenshotSeed(entry.preset);

      const captureResult = await captureRdpExtensionWindow({
        projectRoot,
        routePath: entry.routePath,
        expectedTitle: entry.expectedTitle,
        width: entry.width,
        height: entry.height,
        waitMs: 2500,
        timeoutMs: 12000,
        outputPath: path.join(resolvedCapturesDir, entry.filename),
        closeAfterCapture: true,
      });

      const noteIndex = updatedNotesDocument.notes.findIndex(
        (note) => note.filename === entry.filename,
      );

      assert(noteIndex !== -1, `Store screenshot notes were missing \`${entry.filename}\`.`);

      updatedNotesDocument.notes[noteIndex] = {
        filename: entry.filename,
        captureTruth: entry.captureTruth,
        stateSummary: entry.stateSummary,
        operatorNote: entry.operatorNote,
      };

      captureResults.push({
        filename: entry.filename,
        preset: entry.preset,
        routePath: entry.routePath,
        outputPath: path.relative(projectRoot, captureResult.outputPath),
        captureTruth: entry.captureTruth,
      });
    }
  } finally {
    try {
      await closeRdpExtensionWindows({});
      await applyScreenshotSeed("unlock");
      await closeRdpExtensionWindows({});
    } catch (error) {
      console.error("store-screenshot: warning: failed to unlock screenshot seed after hybrid capture");
      console.error(error);
    }
  }

  const notesByFilename = new Map(
    updatedNotesDocument.notes.map((note) => [note.filename, note]),
  );

  for (const entry of requestBoundEntries) {
    const note = notesByFilename.get(entry.filename);

    assert(note, `Updated screenshot notes were missing \`${entry.filename}\`.`);
    assert(
      note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
      `Updated screenshot notes left \`${entry.filename}\` as not_reviewed.`,
    );
    assert(
      typeof note.stateSummary === "string" && note.stateSummary.trim().length > 0,
      `Updated screenshot notes left \`${entry.filename}\` without stateSummary.`,
    );
  }

  await writeFile(
    notesFilePath,
    `${JSON.stringify(updatedNotesDocument, null, 2)}\n`,
    "utf8",
  );

  return {
    requestId: requestManifest.requestId,
    capturesDir: path.relative(projectRoot, resolvedCapturesDir),
    notesFilePath: path.relative(projectRoot, notesFilePath),
    requestBoundEntries,
    manualEntries,
    captureResults,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const result = await captureHybridStoreScreenshotRequestFromRdp({
    requestId: options.requestId,
    requestRoot: options.requestRoot,
    capturesDir: options.capturesDir,
    notesFile: options.notesFile,
  });

  console.log(
    `store-screenshot: hybrid-captured ${result.captureResults.length} request-bound screenshot(s) for ${result.requestId}`,
  );
  console.log(
    `store-screenshot: manual slots remaining=${result.manualEntries.length} captures_dir=${result.capturesDir}`,
  );
  for (const captureResult of result.captureResults) {
    console.log(
      `store-screenshot: ${captureResult.filename} truth=${captureResult.captureTruth} output=${captureResult.outputPath}`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void run().catch((error) => {
    console.error("store-screenshot: failed to hybrid-capture request screenshots from RDP");
    console.error(error);
    process.exitCode = 1;
  });
}
