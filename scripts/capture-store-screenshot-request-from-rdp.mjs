import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  captureRdpExtensionWindow,
  closeRdpExtensionWindow,
  closeRdpExtensionWindows,
  openRdpExtensionWindow,
} from "./lib/rdp-extension-runtime-capture.mjs";
import {
  getStoreScreenshotCapturePlanEntry,
  buildStoreScreenshotSeedRoutePath,
  STORE_SCREENSHOT_SEED_APPLIED_TITLE,
  STORE_SCREENSHOT_SEED_CLEARED_TITLE,
} from "./lib/store-screenshot-rdp-capture.mjs";
import {
  normalizeStoreScreenshotCaptureNotesDocument,
  STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
  validateStoreScreenshotCaptureNotesDocument,
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

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.requestId.length > 0, "Pass `--request-id <pending-request-id>`.");

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const requestDir = path.join(requestRoot, options.requestId);
  const requestManifestPath = path.join(requestDir, "capture-request.json");
  const notesFilePath = path.resolve(
    projectRoot,
    options.notesFile.length > 0
      ? options.notesFile
      : path.join(requestDir, "capture-notes.json"),
  );
  const capturesDir = path.resolve(
    projectRoot,
    options.capturesDir.length > 0
      ? options.capturesDir
      : path.join(requestDir, "captures"),
  );
  const requestManifest = await readJson(
    requestManifestPath,
    "Store screenshot capture request manifest",
  );

  assert(
    requestManifest.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    `Store screenshot request \`${requestManifest.requestId || options.requestId}\` is not pending.`,
  );

  const originalNotesDocument = normalizeStoreScreenshotCaptureNotesDocument(
    await readJson(notesFilePath, "Store screenshot capture notes"),
  );
  const updatedNotesDocument = {
    ...originalNotesDocument,
    notes: [...originalNotesDocument.notes],
  };
  const captureResults = [];

  await mkdir(capturesDir, { recursive: true });

  try {
    await closeRdpExtensionWindows({});
    await applyScreenshotSeed("unlock");

    for (const filename of requestManifest.requiredScreenshotFilenames ?? []) {
      const capturePlan = getStoreScreenshotCapturePlanEntry(filename);

      assert(
        capturePlan !== null,
        `No RDP screenshot capture plan entry exists for \`${filename}\`.`,
      );

      await closeRdpExtensionWindows({});
      await applyScreenshotSeed(capturePlan.preset);

      const captureResult = await captureRdpExtensionWindow({
        projectRoot,
        routePath: capturePlan.routePath,
        expectedTitle: capturePlan.expectedTitle,
        width: capturePlan.width,
        height: capturePlan.height,
        waitMs: 2500,
        timeoutMs: 12000,
        outputPath: path.join(capturesDir, filename),
        closeAfterCapture: true,
      });

      const noteIndex = updatedNotesDocument.notes.findIndex(
        (note) => note.filename === filename,
      );

      assert(noteIndex !== -1, `Store screenshot notes were missing \`${filename}\`.`);

      updatedNotesDocument.notes[noteIndex] = {
        filename,
        captureTruth: capturePlan.captureTruth,
        stateSummary: capturePlan.stateSummary,
        operatorNote: capturePlan.operatorNote,
      };

      captureResults.push({
        filename,
        preset: capturePlan.preset,
        routePath: capturePlan.routePath,
        captureTruth: capturePlan.captureTruth,
        outputPath: path.relative(projectRoot, captureResult.outputPath),
        windowId: captureResult.windowId,
        extensionId: captureResult.extensionId,
      });
    }
  } finally {
    try {
      await closeRdpExtensionWindows({});
      await applyScreenshotSeed("unlock");
      await closeRdpExtensionWindows({});
    } catch (error) {
      console.error("store-screenshot: warning: failed to unlock screenshot seed");
      console.error(error);
    }
  }

  const notesValidation = validateStoreScreenshotCaptureNotesDocument({
    notesDocument: updatedNotesDocument,
    requestId: requestManifest.requestId,
    requestCreatedAt: requestManifest.createdAt,
    requiredScreenshotFilenames: requestManifest.requiredScreenshotFilenames ?? [],
  });

  assert(
    notesValidation.issues.length === 0,
    `Updated screenshot notes did not validate:\n${notesValidation.issues.map((item) => `- ${item}`).join("\n")}`,
  );

  await writeFile(
    notesFilePath,
    `${JSON.stringify(notesValidation.normalized, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `store-screenshot: captured ${captureResults.length} screenshot(s) for ${requestManifest.requestId}`,
  );
  for (const result of captureResults) {
    console.log(
      `store-screenshot: ${result.filename} preset=${result.preset} truth=${result.captureTruth} output=${result.outputPath}`,
    );
  }
}

void run().catch((error) => {
  console.error("store-screenshot: failed to capture request screenshots from RDP");
  console.error(error);
  process.exitCode = 1;
});
