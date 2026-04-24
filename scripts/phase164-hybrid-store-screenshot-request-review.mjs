import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  captureHybridStoreScreenshotRequestFromRdp,
} from "./capture-hybrid-store-screenshot-request-from-rdp.mjs";
import {
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
  STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_FULL_PAGE_SHELL,
  STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_NATIVE_TOOLBAR_POPUP,
} from "./lib/store-screenshot-capture-plan.mjs";
import {
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
  STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS,
} from "./lib/store-screenshot-capture-request.mjs";

const projectRoot = process.cwd();
const requestId = "2026-04-24-surface-expansion-store-screenshot-refresh-request";
const requestDir = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
  requestId,
);
const capturePlanPath = path.join(requestDir, "capture-plan.json");
const notesPath = path.join(requestDir, "capture-notes.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"));
assert(
  packageJson.scripts["store:capture-hybrid-screenshot-request-from-rdp"],
  "package.json is missing store:capture-hybrid-screenshot-request-from-rdp.",
);
assert(
  packageJson.scripts["phase164:review"],
  "package.json is missing phase164:review.",
);

await access(capturePlanPath);
const beforePlan = await readJson(capturePlanPath);
assert(beforePlan.requestId === requestId, "capture-plan.json request id did not match the pending request.");
assert(beforePlan.summary.manualOperatorCount === 3, "Expected three manual popup slots in capture-plan.json.");
assert(beforePlan.summary.requestBoundRunnerCount === 2, "Expected two request-bound slots in capture-plan.json.");
assert(
  beforePlan.entries.filter((entry) => entry.captureMode === STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE && entry.requestedSurface === STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_NATIVE_TOOLBAR_POPUP).length === 3,
  "Expected capture-plan.json to keep three native-toolbar popup slots manual.",
);
assert(
  beforePlan.entries.filter((entry) => entry.captureMode === STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER && entry.requestedSurface === STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_FULL_PAGE_SHELL).length === 2,
  "Expected capture-plan.json to expose two full-page request-bound slots.",
);

const result = await captureHybridStoreScreenshotRequestFromRdp({ requestId });
assert(result.captureResults.length === 2, "Hybrid capture did not stage two request-bound screenshots.");
assert(result.manualEntries.length === 3, "Hybrid capture should leave three manual popup slots unresolved.");

for (const filename of [
  "04-settings-and-setup-depth.png",
  "05-provider-or-dashboard-depth.png",
]) {
  await access(path.join(requestDir, "captures", filename));
}

const manifest = await readJson(path.join(requestDir, "capture-request.json"));
assert(manifest.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS, "Hybrid capture should not fulfill the request automatically.");

const notes = await readJson(notesPath);
const notesByFilename = new Map(notes.notes.map((note) => [note.filename, note]));
for (const filename of [
  "01-toolbar-first-quick-glance.png",
  "02-setup-guidance.png",
  "03-honest-contract-or-policy-only.png",
]) {
  assert(
    notesByFilename.get(filename)?.captureTruth === STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
    `${filename} should remain manual and not_reviewed after hybrid capture.`,
  );
}
for (const filename of [
  "04-settings-and-setup-depth.png",
  "05-provider-or-dashboard-depth.png",
]) {
  const note = notesByFilename.get(filename);
  assert(note, `${filename} note missing after hybrid capture.`);
  assert(note.captureTruth !== STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED, `${filename} note stayed not_reviewed after hybrid capture.`);
  assert(typeof note.stateSummary === "string" && note.stateSummary.trim().length > 0, `${filename} note is missing stateSummary after hybrid capture.`);
}

console.log(
  `phase164: hybrid screenshot request staging verified auto=${result.captureResults.length} manual_remaining=${result.manualEntries.length} request=${requestId}`,
);
