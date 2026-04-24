import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const requestId = "2026-04-24-surface-expansion-store-screenshot-refresh-request";
const requestDir = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
  requestId,
);

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
  packageJson.scripts["phase167:review"],
  "package.json is missing phase167:review.",
);

const handoffJsonPath = path.join(requestDir, "manual-capture-handoff.json");
const overlayTemplatePath = path.join(
  requestDir,
  "manual-popup-notes-overlay.template.json",
);
const checklistPath = path.join(requestDir, "manual-popup-capture-checklist.md");

await access(handoffJsonPath);
await access(overlayTemplatePath);
await access(checklistPath);

const handoff = await readJson(handoffJsonPath);
const overlayTemplate = await readJson(overlayTemplatePath);
const checklist = await readFile(checklistPath, "utf8");

assert(
  handoff.manualNotesTemplatePath ===
    "Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-notes-overlay.template.json",
  "manual handoff is missing the request-bound popup-notes template path.",
);
assert(
  handoff.manualChecklistPath ===
    "Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-capture-checklist.md",
  "manual handoff is missing the request-bound popup checklist path.",
);
assert(
  handoff.manualImportWithNotesCommand.includes("manual-popup-notes-overlay.template.json"),
  "manual handoff did not upgrade the notes import command to the request-bound template path.",
);
assert(
  overlayTemplate.notes.length === 3,
  "popup-notes overlay template should only include the three manual popup slots.",
);
assert(
  overlayTemplate.notes.every((note) => note.captureTruth === "not_reviewed"),
  "popup-notes overlay template should start every manual slot as not_reviewed.",
);
assert(
  overlayTemplate.notes.map((note) => note.filename).join(",") ===
    [
      "01-toolbar-first-quick-glance.png",
      "02-setup-guidance.png",
      "03-honest-contract-or-policy-only.png",
    ].join(","),
  "popup-notes overlay template filenames did not match the three manual popup slots.",
);
assert(
  checklist.includes("manual-popup-notes-overlay.template.json"),
  "manual popup checklist is missing the generated notes template path.",
);
assert(
  checklist.includes("store:import-manual-screenshot-captures"),
  "manual popup checklist is missing the popup import command.",
);

console.log(
  `phase167: manual popup template verified request=${requestId} template_notes=${overlayTemplate.notes.length} remaining_manual=${handoff.summary.remainingManualCount}`,
);
