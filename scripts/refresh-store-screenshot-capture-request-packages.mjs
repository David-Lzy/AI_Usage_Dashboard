import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildStoreScreenshotCaptureNotesDocument,
  normalizeStoreScreenshotCaptureNotesDocument,
  updateStoreScreenshotCaptureRequest,
} from "./lib/store-screenshot-capture-request.mjs";
import { writeStoreScreenshotCaptureRequestIndex } from "./lib/store-screenshot-capture-request-index.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Store_Screenshot_Capture_Requests.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    requestRoot: defaultRequestRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return options;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const generatedAt = new Date().toISOString();
  const requestEntries = await readdir(requestRoot, { withFileTypes: true });
  let refreshedCount = 0;

  for (const entry of requestEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const requestDir = path.join(requestRoot, entry.name);
    const manifestPath = path.join(requestDir, "capture-request.json");
    const notesPath = path.join(requestDir, "capture-notes.json");

    try {
      const manifest = await readJson(manifestPath);
      const requestTemplate =
        typeof manifest.sourceTemplate === "string" &&
        manifest.sourceTemplate.length > 0
          ? await readJson(path.resolve(projectRoot, manifest.sourceTemplate)).catch(
              () => manifest,
            )
          : manifest;
      const notesDocument = normalizeStoreScreenshotCaptureNotesDocument(
        await readJson(notesPath).catch(() =>
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
      refreshedCount += 1;
    } catch {
      // Skip directories without a valid request manifest.
    }
  }

  const indexMarkdownPath =
    requestRoot === defaultRequestRoot
      ? defaultIndexMarkdownPath
      : path.join(path.dirname(requestRoot), "Store_Screenshot_Capture_Requests.md");
  const indexJsonPath =
    requestRoot === defaultRequestRoot
      ? defaultIndexJsonPath
      : path.join(requestRoot, "index.json");
  const indexResult = await writeStoreScreenshotCaptureRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt,
    indexMarkdownPath,
    indexJsonPath,
  });

  console.log(
    `store-screenshot: refreshed ${refreshedCount} request package(s) pending=${indexResult.pendingRequestCount} fulfilled=${indexResult.fulfilledRequestCount}`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to refresh request packages");
  console.error(error);
  process.exitCode = 1;
});
