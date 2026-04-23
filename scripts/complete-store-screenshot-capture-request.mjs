import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildStoreScreenshotCaptureArchiveId,
  writeStoreScreenshotCaptureArchive,
} from "./lib/store-screenshot-capture-archive.mjs";
import { writeStoreScreenshotCaptureArchiveIndex } from "./lib/store-screenshot-capture-archive-index.mjs";
import {
  buildStoreScreenshotCaptureNotesSummary,
  buildStoreScreenshotCaptureRequestFulfillment,
  STORE_SCREENSHOT_CAPTURE_REQUEST_FULFILLED_STATUS,
  STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
  updateStoreScreenshotCaptureRequest,
  validateStoreScreenshotCaptureNotesDocument,
} from "./lib/store-screenshot-capture-request.mjs";
import { writeStoreScreenshotCaptureRequestIndex } from "./lib/store-screenshot-capture-request-index.mjs";

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
const defaultRequestIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Store_Screenshot_Capture_Requests.md",
);
const defaultRequestIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
  "index.json",
);
const defaultArchiveIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Store_Screenshot_Capture_Archive.md",
);
const defaultArchiveIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_archives",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    capturesDir: "",
    requestRoot: defaultRequestRoot,
    archiveRoot: defaultArchiveRoot,
    archiveId: "",
    notesFile: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--captures-dir") {
      options.capturesDir = argv[index + 1] ?? "";
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

    if (arg === "--archive-id") {
      options.archiveId = argv[index + 1] ?? "";
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

async function assertCaptureFiles(capturesDir, filenames) {
  for (const filename of filenames) {
    const filePath = path.join(capturesDir, filename);
    const fileStat = await stat(filePath).catch(() => null);

    assert(fileStat !== null && fileStat.isFile(), `Missing required screenshot \`${filename}\` in \`${capturesDir}\`.`);
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.requestId.length > 0, "Pass `--request-id <pending-request-id>`.");
  assert(options.capturesDir.length > 0, "Pass `--captures-dir <directory-with-captured-pngs>`.");

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const archiveRoot = path.resolve(projectRoot, options.archiveRoot);
  const requestDir = path.join(requestRoot, options.requestId);
  const capturesDir = path.resolve(projectRoot, options.capturesDir);
  const requestManifestPath = path.join(requestDir, "capture-request.json");
  const notesFilePath = path.resolve(
    projectRoot,
    options.notesFile.length > 0
      ? options.notesFile
      : path.join(requestDir, "capture-notes.json"),
  );
  const requestManifest = await readJson(
    requestManifestPath,
    "Store screenshot capture request manifest",
  );
  const captureNotes = await readJson(
    notesFilePath,
    "Store screenshot capture notes",
  );

  assert(
    requestManifest.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
    `Store screenshot capture request \`${requestManifest.requestId || options.requestId}\` is not pending.`,
  );

  await assertCaptureFiles(
    capturesDir,
    requestManifest.requiredScreenshotFilenames ?? [],
  );
  const notesValidation = validateStoreScreenshotCaptureNotesDocument({
    notesDocument: captureNotes,
    requestId: requestManifest.requestId,
    requestCreatedAt: requestManifest.createdAt,
    requiredScreenshotFilenames: requestManifest.requiredScreenshotFilenames ?? [],
  });

  assert(
    notesValidation.issues.length === 0,
    `Store screenshot capture notes did not pass validation:\n${notesValidation.issues.map((item) => `- ${item}`).join("\n")}`,
  );

  const fulfilledAt = new Date().toISOString();
  const archiveId = buildStoreScreenshotCaptureArchiveId({
    requestId: requestManifest.requestId,
    archiveId: options.archiveId,
  });
  const archiveResult = await writeStoreScreenshotCaptureArchive({
    projectRoot,
    archiveRoot,
    archiveId,
    archivedAt: fulfilledAt,
    requestManifest,
    requestDir,
    capturesDir,
    captureFiles: requestManifest.requiredScreenshotFilenames,
    notesDocument: notesValidation.normalized,
    notesFilePath,
  });
  const notesSummary = buildStoreScreenshotCaptureNotesSummary(
    notesValidation.normalized,
  );

  const fulfillment = buildStoreScreenshotCaptureRequestFulfillment({
    fulfilledAt,
    sourceCaptureDir: path.relative(projectRoot, capturesDir),
    sourceNotesPath: path.relative(projectRoot, notesFilePath),
    archiveId,
    archiveReadmePath: path.relative(
      projectRoot,
      path.join(archiveResult.archiveDir, "README.md"),
    ),
    archiveManifestPath: path.relative(
      projectRoot,
      path.join(archiveResult.archiveDir, "capture-archive.json"),
    ),
    archiveNotesPath: path.relative(
      projectRoot,
      path.join(archiveResult.archiveDir, "capture-notes.json"),
    ),
    screenshotFilenames: requestManifest.requiredScreenshotFilenames,
    reviewedScreenshotCount: notesSummary.reviewedScreenshotCount,
    truthBoundaryCount: notesSummary.truthBoundaryCount,
  });

  await updateStoreScreenshotCaptureRequest({
    projectRoot,
    requestDir,
    requestId: requestManifest.requestId,
    createdAt: requestManifest.createdAt,
    requestTemplate: requestManifest,
    sourceTemplate: requestManifest.sourceTemplate,
    status: STORE_SCREENSHOT_CAPTURE_REQUEST_FULFILLED_STATUS,
    fulfillment,
    notesDocument: notesValidation.normalized,
  });

  const requestIndexMarkdownPath =
    requestRoot === defaultRequestRoot
      ? defaultRequestIndexMarkdownPath
      : path.join(path.dirname(requestRoot), "Store_Screenshot_Capture_Requests.md");
  const requestIndexJsonPath =
    requestRoot === defaultRequestRoot
      ? defaultRequestIndexJsonPath
      : path.join(requestRoot, "index.json");
  const archiveIndexMarkdownPath =
    archiveRoot === defaultArchiveRoot
      ? defaultArchiveIndexMarkdownPath
      : path.join(path.dirname(archiveRoot), "Store_Screenshot_Capture_Archive.md");
  const archiveIndexJsonPath =
    archiveRoot === defaultArchiveRoot
      ? defaultArchiveIndexJsonPath
      : path.join(archiveRoot, "index.json");

  const requestIndexResult = await writeStoreScreenshotCaptureRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: fulfilledAt,
    indexMarkdownPath: requestIndexMarkdownPath,
    indexJsonPath: requestIndexJsonPath,
  });
  const archiveIndexResult = await writeStoreScreenshotCaptureArchiveIndex({
    projectRoot,
    archiveRoot,
    generatedAt: fulfilledAt,
    indexMarkdownPath: archiveIndexMarkdownPath,
    indexJsonPath: archiveIndexJsonPath,
  });

  console.log(
    `store-screenshot: completed request ${requestManifest.requestId} -> archive ${archiveId}`,
  );
  console.log(
    `store-screenshot: notes reviewed=${notesSummary.reviewedScreenshotCount}/${notesSummary.noteCount} truth_boundaries=${notesSummary.truthBoundaryCount}`,
  );
  console.log(
    `store-screenshot: request index refreshed pending=${requestIndexResult.pendingRequestCount} fulfilled=${requestIndexResult.fulfilledRequestCount}`,
  );
  console.log(
    `store-screenshot: archive index refreshed recordCount=${archiveIndexResult.recordCount}`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to complete capture request");
  console.error(error);
  process.exitCode = 1;
});
