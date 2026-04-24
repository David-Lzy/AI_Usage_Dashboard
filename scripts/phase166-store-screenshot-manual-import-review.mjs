import { access, cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import {
  importStoreScreenshotManualCaptures,
} from "./import-store-screenshot-manual-captures.mjs";

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
  packageJson.scripts["store:import-manual-screenshot-captures"],
  "package.json is missing store:import-manual-screenshot-captures.",
);
assert(
  packageJson.scripts["phase166:review"],
  "package.json is missing phase166:review.",
);

const manifest = await readJson(path.join(sourceRequestDir, "capture-request.json"));
const tempRoot = await mkdtemp(
  path.join(os.tmpdir(), "phase166-store-screenshot-import-"),
);
const tempRequestRoot = path.join(tempRoot, "requests");
const tempRequestDir = path.join(tempRequestRoot, requestId);
const tempSourceDir = path.join(tempRoot, "manual-popup-captures");
const tempNotesPath = path.join(tempRoot, "manual-popup-notes-overlay.json");

await mkdir(tempRequestRoot, { recursive: true });
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

const result = await importStoreScreenshotManualCaptures({
  requestId,
  requestRoot: tempRequestRoot,
  sourceDir: tempSourceDir,
  notesFile: tempNotesPath,
});

assert(
  result.importedFilenames.length === 3,
  "Expected three popup screenshots to import into the temp request.",
);
assert(
  result.notesUpdatedCount === 3,
  "Expected three popup screenshot note updates in the temp request.",
);
assert(
  result.handoffDocument.summary.manualCaptureMissingCount === 0,
  "Expected the temp handoff to report zero missing manual captures after import.",
);
assert(
  result.handoffDocument.summary.manualNoteIncompleteCount === 0,
  "Expected the temp handoff to report zero incomplete manual notes after import.",
);
assert(
  result.handoffDocument.summary.manualReadyCount === 3,
  "Expected the temp handoff to report three ready manual slots after import.",
);
assert(
  result.handoffDocument.summary.remainingManualCount === 0,
  "Expected the temp handoff to report zero remaining manual slots after import.",
);
assert(
  result.handoffDocument.summary.archiveReady === true,
  "Expected the temp handoff to become archive-ready after full popup import.",
);

const handoffMarkdownPath = path.join(
  tempRequestDir,
  "manual-capture-handoff.md",
);
const handoffMarkdown = await readFile(handoffMarkdownPath, "utf8");

assert(
  handoffMarkdown.includes("store:import-manual-screenshot-captures"),
  "manual-capture-handoff.md is missing the manual import command.",
);
assert(
  handoffMarkdown.includes("manual-popup-notes-overlay.json"),
  "manual-capture-handoff.md is missing the notes-overlay import command.",
);

console.log(
  `phase166: manual screenshot import verified imported=${result.importedFilenames.length} notes_updated=${result.notesUpdatedCount} archive_ready=${result.handoffDocument.summary.archiveReady ? "yes" : "no"} request=${requestId}`,
);
