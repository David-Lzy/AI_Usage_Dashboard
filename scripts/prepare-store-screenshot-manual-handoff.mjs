import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildStoreScreenshotCaptureNotesDocument,
  normalizeStoreScreenshotCaptureNotesDocument,
  STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
  STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
  updateStoreScreenshotCaptureRequest,
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

export async function prepareStoreScreenshotManualHandoff({
  requestId,
  requestRoot = defaultRequestRoot,
}) {
  assert(requestId.length > 0, "Pass `--request-id <pending-request-id>`." );

  const resolvedRequestRoot = path.resolve(projectRoot, requestRoot);
  const requestDir = path.join(resolvedRequestRoot, requestId);
  const manifestPath = path.join(requestDir, "capture-request.json");
  const notesPath = path.join(requestDir, "capture-notes.json");
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
  const notesDocument = normalizeStoreScreenshotCaptureNotesDocument(
    await readJson(notesPath, "Store screenshot capture notes").catch(() =>
      buildStoreScreenshotCaptureNotesDocument({
        requestId: manifest.requestId,
        requestCreatedAt: manifest.createdAt,
        requiredScreenshotFilenames: manifest.requiredScreenshotFilenames,
      }),
    ),
  );

  await updateStoreScreenshotCaptureRequest({
    projectRoot,
    requestDir,
    requestId: manifest.requestId,
    createdAt: manifest.createdAt,
    requestTemplate,
    sourceTemplate: manifest.sourceTemplate,
    status: manifest.status,
    fulfillment: manifest.fulfillment,
    notesDocument,
  });

  const handoffPath = path.join(requestDir, "manual-capture-handoff.json");
  const handoffDocument = await readJson(
    handoffPath,
    "Store screenshot manual handoff",
  );

  return {
    requestDir,
    handoffPath,
    handoffDocument,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const result = await prepareStoreScreenshotManualHandoff({
    requestId: options.requestId,
    requestRoot: options.requestRoot,
  });

  console.log(
    `store-screenshot: manual handoff prepared request=${result.handoffDocument.requestId} remaining_manual=${result.handoffDocument.summary.remainingManualCount} staged_ready=${result.handoffDocument.summary.stagedReadyCount} archive_ready=${result.handoffDocument.summary.archiveReady ? "yes" : "no"}`,
  );
}

const executedAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;

if (executedAsScript) {
  void run().catch((error) => {
    console.error("store-screenshot: failed to prepare manual handoff");
    console.error(error);
    process.exitCode = 1;
  });
}
