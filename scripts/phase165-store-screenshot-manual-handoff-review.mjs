import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  prepareStoreScreenshotManualHandoff,
} from "./prepare-store-screenshot-manual-handoff.mjs";

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
  packageJson.scripts["store:prepare-manual-screenshot-handoff"],
  "package.json is missing store:prepare-manual-screenshot-handoff.",
);
assert(
  packageJson.scripts["phase165:review"],
  "package.json is missing phase165:review.",
);

const result = await prepareStoreScreenshotManualHandoff({ requestId });
const handoffJsonPath = path.join(requestDir, "manual-capture-handoff.json");
const handoffMarkdownPath = path.join(requestDir, "manual-capture-handoff.md");
await access(handoffJsonPath);
await access(handoffMarkdownPath);

const handoff = await readJson(handoffJsonPath);
assert(handoff.requestId === requestId, "manual handoff request id did not match the pending request.");
assert(handoff.summary.manualEntryCount === 3, "Expected three manual popup slots in the handoff.");
assert(handoff.summary.remainingManualCount === 3, "Expected three remaining manual popup slots in the handoff.");
assert(handoff.summary.stagedRequestBoundCount === 2, "Expected two staged request-bound slots in the handoff.");
assert(handoff.summary.stagedReadyCount === 2, "Expected two ready staged request-bound slots in the handoff.");
assert(handoff.summary.archiveReady === false, "The handoff should not report archive-ready before manual popup capture.");
assert(
  handoff.remainingManualEntries.map((entry) => entry.filename).join(",") ===
    [
      "01-toolbar-first-quick-glance.png",
      "02-setup-guidance.png",
      "03-honest-contract-or-policy-only.png",
    ].join(","),
  "The handoff did not preserve the three unresolved popup filenames.",
);
assert(
  handoff.stagedReadyEntries.map((entry) => entry.filename).join(",") ===
    [
      "04-settings-and-setup-depth.png",
      "05-provider-or-dashboard-depth.png",
    ].join(","),
  "The handoff did not preserve the two staged full-page filenames.",
);
assert(
  handoff.completionCommand.includes("store:complete-screenshot-capture-request"),
  "The handoff did not preserve the completion command.",
);
assert(
  handoff.archiveReadinessIssues.length >= 3,
  "The handoff should still report missing manual-capture readiness issues.",
);

const markdown = await readFile(handoffMarkdownPath, "utf8");
assert(
  markdown.includes("## Remaining Manual Captures"),
  "manual-capture-handoff.md is missing the remaining-manual section.",
);
assert(
  markdown.includes("## Staged Request-Bound Entries"),
  "manual-capture-handoff.md is missing the staged-entry section.",
);

console.log(
  `phase165: manual screenshot handoff verified manual_remaining=${handoff.summary.remainingManualCount} staged_ready=${handoff.summary.stagedReadyCount} request=${requestId}`,
);
