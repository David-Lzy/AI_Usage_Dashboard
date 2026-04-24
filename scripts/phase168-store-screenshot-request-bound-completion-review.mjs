import { access, cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import {
  importStoreScreenshotManualCaptures,
} from "./import-store-screenshot-manual-captures.mjs";
import {
  completeStoreScreenshotCaptureRequest,
} from "./complete-store-screenshot-capture-request.mjs";

const projectRoot = process.cwd();
const requestId = "2026-04-24-surface-expansion-store-screenshot-refresh-request";
const sourceRequestDir = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
  requestId,
);
const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0VZ8kAAAAASUVORK5CYII=";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);
assert(
  packageJson.scripts["phase168:review"],
  "package.json is missing phase168:review.",
);

const manifest = await readJson(path.join(sourceRequestDir, "capture-request.json"));
const tempRoot = await mkdtemp(
  path.join(os.tmpdir(), "phase168-store-screenshot-complete-"),
);
const tempRequestRoot = path.join(tempRoot, "requests");
const tempArchiveRoot = path.join(tempRoot, "archives");
const tempRequestDir = path.join(tempRequestRoot, requestId);
const tempSourceDir = path.join(tempRoot, "manual-popup-captures");
const tempNotesPath = path.join(tempRoot, "manual-popup-notes-overlay.json");

await mkdir(tempRequestRoot, { recursive: true });
await mkdir(tempArchiveRoot, { recursive: true });
await mkdir(tempSourceDir, { recursive: true });
await cp(sourceRequestDir, tempRequestDir, { recursive: true });
await access(tempRequestDir);

const manualPopupFilenames = [
  "01-toolbar-first-quick-glance.png",
  "02-setup-guidance.png",
  "03-honest-contract-or-policy-only.png",
];

for (const filename of manualPopupFilenames) {
  await writeFile(
    path.join(tempSourceDir, filename),
    Buffer.from(tinyPngBase64, "base64"),
  );
}

await writeFile(
  tempNotesPath,
  `${JSON.stringify(
    {
      requestId,
      requestCreatedAt: manifest.createdAt,
      notes: manualPopupFilenames.map((filename) => ({
        filename,
        captureTruth: "exact_runtime_capture",
        stateSummary: `Manual native-toolbar popup capture imported for ${filename}.`,
        operatorNote: "",
      })),
    },
    null,
    2,
  )}
`,
  "utf8",
);

await importStoreScreenshotManualCaptures({
  requestId,
  requestRoot: tempRequestRoot,
  sourceDir: tempSourceDir,
  notesFile: tempNotesPath,
});

const completionResult = await completeStoreScreenshotCaptureRequest({
  requestId,
  requestRoot: tempRequestRoot,
  archiveRoot: tempArchiveRoot,
});

const requestManifestPath = path.join(tempRequestDir, "capture-request.json");
const requestManifest = await readJson(requestManifestPath);
const archiveDir = path.join(
  tempArchiveRoot,
  `${requestId}-archive`,
);

await access(path.join(archiveDir, "README.md"));
await access(path.join(archiveDir, "capture-archive.json"));

assert(
  requestManifest.status === "fulfilled_operator_capture",
  "Request manifest did not move to fulfilled after request-bound completion.",
);
assert(
  requestManifest.fulfillment?.archiveId === `${requestId}-archive`,
  "Request fulfillment did not record the expected archive id.",
);
assert(
  requestManifest.fulfillment?.sourceCaptureDir.endsWith(
    `/requests/${requestId}/captures`,
  ),
  "Request fulfillment did not record the temp request capture directory.",
);
assert(
  completionResult.archiveId === `${requestId}-archive`,
  "Completion result did not return the expected archive id.",
);
assert(
  completionResult.notesSummary.reviewedScreenshotCount === 5,
  "Completion result did not report all five screenshots as reviewed.",
);

console.log(
  `phase168: request-bound completion verified request=${completionResult.requestId} archive=${completionResult.archiveId} reviewed=${completionResult.notesSummary.reviewedScreenshotCount}`,
);
