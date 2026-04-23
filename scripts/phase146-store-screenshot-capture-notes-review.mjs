import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp/phase146-store-screenshot-capture-notes-review",
);
const issues = [];

const requestIndexMarkdown = await readFile(
  path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Requests.md"),
  "utf8",
);
const requestIndexJsonRaw = await readFile(
  path.join(projectRoot, "Doc/testing/store_screenshot_capture_requests/index.json"),
  "utf8",
);
const requestIndexJson = JSON.parse(requestIndexJsonRaw);
const archiveIndexJsonRaw = await readFile(
  path.join(projectRoot, "Doc/testing/store_screenshot_archives/index.json"),
  "utf8",
);
const archiveIndexJson = JSON.parse(archiveIndexJsonRaw);
const runbook = await readFile(
  path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Runbook.md"),
  "utf8",
);
const phaseIndex = await readFile(
  path.join(projectRoot, "Doc/TODOs/00_Phase_Index.md"),
  "utf8",
);
const strategicIndex = await readFile(
  path.join(projectRoot, "Doc/Roadmap/00_Strategic_Directions_Index.md"),
  "utf8",
);
const directionTen = await readFile(
  path.join(
    projectRoot,
    "Doc/Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md",
  ),
  "utf8",
);
const realRequestNotesRaw = await readFile(
  path.join(
    projectRoot,
    "Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/capture-notes.json",
  ),
  "utf8",
);
const realRequestNotes = JSON.parse(realRequestNotesRaw);

if (requestIndexJson.pendingRequestCount !== 1 || requestIndexJson.fulfilledRequestCount !== 0) {
  issues.push("Store screenshot request index should remain at one pending and zero fulfilled in the repo baseline.");
}

if (archiveIndexJson.recordCount !== 0) {
  issues.push("Store screenshot archive index should remain empty in the repo baseline.");
}

if (!requestIndexMarkdown.includes("capture notes")) {
  issues.push("Store screenshot request index is missing capture-notes summary lines.");
}

if (!runbook.includes("capture-notes.json")) {
  issues.push("Store screenshot runbook is missing the request-bound capture-notes workflow.");
}

if (!phaseIndex.includes("146_Phase_Store_Screenshot_Capture_Truth_Notes_And_Archive_Metadata.md")) {
  issues.push("Phase index latest completed slice was not updated to Phase 146.");
}

if (!strategicIndex.includes("completed the next executable `Direction 10` slice and added request-bound capture notes")) {
  issues.push("Strategic index is missing the Phase 146 completion summary.");
}

if (!directionTen.includes("Phase 146")) {
  issues.push("Direction 10 is missing the Phase 146 execution note.");
}

if (realRequestNotes.notes.length !== 5) {
  issues.push("The real pending screenshot request should now carry one notes entry per required screenshot.");
}

if (
  realRequestNotes.notes.some(
    (note) => note.captureTruth !== "not_reviewed" || note.stateSummary !== "" || note.operatorNote !== "",
  )
) {
  issues.push("The real pending screenshot request notes should stay unreviewed in the repo baseline until the first operator pass happens.");
}

const tempRoot = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-phase146-"));
const requestRoot = path.join(tempRoot, "requests");
const archiveRoot = path.join(tempRoot, "archives");
const capturesDir = path.join(tempRoot, "captures");
await mkdir(capturesDir, { recursive: true });

await execFileAsync(
  "node",
  [
    "./scripts/create-store-screenshot-capture-request.mjs",
    "--request-id",
    "phase146-generated-request",
    "--request-root",
    path.relative(projectRoot, requestRoot),
  ],
  { cwd: projectRoot },
);

const tempRequestDir = path.join(requestRoot, "phase146-generated-request");
const tempNotesPath = path.join(tempRequestDir, "capture-notes.json");
const tempNotesRaw = await readFile(tempNotesPath, "utf8");
const tempNotes = JSON.parse(tempNotesRaw);

tempNotes.notes = tempNotes.notes.map((note, index) => {
  if (index === 2) {
    return {
      ...note,
      captureTruth: "policy_only_fallback",
      stateSummary: "Contract-only popup state used for the policy-only storyboard step.",
      operatorNote:
        "Live usage for this screenshot was not available, so the truthful contract-only fallback was captured instead.",
    };
  }

  if (index === 4) {
    return {
      ...note,
      captureTruth: "provider_omitted",
      stateSummary: "Dashboard depth screenshot keeps only the current shipped providers in frame.",
      operatorNote:
        "Deferred providers were intentionally omitted so the screenshot only shows currently shipped depth.",
    };
  }

  return {
    ...note,
    captureTruth: "exact_runtime_capture",
    stateSummary: `Reviewed runtime state for ${note.filename}.`,
    operatorNote: "",
  };
});

await writeFile(tempNotesPath, `${JSON.stringify(tempNotes, null, 2)}\n`, "utf8");

await execFileAsync(
  "node",
  [
    "./scripts/refresh-store-screenshot-capture-request-packages.mjs",
    "--request-root",
    path.relative(projectRoot, requestRoot),
  ],
  { cwd: projectRoot },
);

const tempRequestIndexMarkdown = await readFile(
  path.join(tempRoot, "Store_Screenshot_Capture_Requests.md"),
  "utf8",
);
const tempRequestIndexJsonRaw = await readFile(
  path.join(requestRoot, "index.json"),
  "utf8",
);
const tempRequestIndexJson = JSON.parse(tempRequestIndexJsonRaw);

if (!tempRequestIndexMarkdown.includes("5/5")) {
  issues.push("Refreshed request index did not surface the reviewed capture-notes summary.");
}

if (!tempRequestIndexMarkdown.includes("truth boundaries `2`")) {
  issues.push("Refreshed request index did not surface the truth-boundary count.");
}

const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9X2s8AAAAASUVORK5CYII=",
  "base64",
);
const captureNames = [
  "01-toolbar-first-quick-glance.png",
  "02-setup-guidance.png",
  "03-honest-contract-or-policy-only.png",
  "04-settings-and-setup-depth.png",
  "05-provider-or-dashboard-depth.png",
];

for (const filename of captureNames) {
  await writeFile(path.join(capturesDir, filename), pngBytes);
}

await execFileAsync(
  "node",
  [
    "./scripts/complete-store-screenshot-capture-request.mjs",
    "--request-id",
    "phase146-generated-request",
    "--captures-dir",
    path.relative(projectRoot, capturesDir),
    "--request-root",
    path.relative(projectRoot, requestRoot),
    "--archive-root",
    path.relative(projectRoot, archiveRoot),
  ],
  { cwd: projectRoot },
);

const tempArchiveManifestRaw = await readFile(
  path.join(archiveRoot, "phase146-generated-request-archive", "capture-archive.json"),
  "utf8",
);
const tempArchiveManifest = JSON.parse(tempArchiveManifestRaw);
const tempArchiveReadme = await readFile(
  path.join(archiveRoot, "phase146-generated-request-archive", "README.md"),
  "utf8",
);
const tempArchiveNotesRaw = await readFile(
  path.join(archiveRoot, "phase146-generated-request-archive", "capture-notes.json"),
  "utf8",
);
const tempArchiveNotes = JSON.parse(tempArchiveNotesRaw);
const completedRequestManifestRaw = await readFile(
  path.join(tempRequestDir, "capture-request.json"),
  "utf8",
);
const completedRequestManifest = JSON.parse(completedRequestManifestRaw);
const completedRequestIndexJsonRaw = await readFile(
  path.join(requestRoot, "index.json"),
  "utf8",
);
const completedRequestIndexJson = JSON.parse(completedRequestIndexJsonRaw);
const completedArchiveIndexJsonRaw = await readFile(
  path.join(archiveRoot, "index.json"),
  "utf8",
);
const completedArchiveIndexJson = JSON.parse(completedArchiveIndexJsonRaw);

if (completedRequestIndexJson.pendingRequestCount !== 0) {
  issues.push("Generated store screenshot request flow did not clear the pending request count after completion.");
}

if (completedRequestIndexJson.fulfilledRequestCount !== 1) {
  issues.push("Generated store screenshot request flow did not record one fulfilled request after completion.");
}

if (completedArchiveIndexJson.recordCount !== 1) {
  issues.push("Generated store screenshot archive flow did not record exactly one archive.");
}

if (tempArchiveManifest.captureNotesSummary.truthBoundaryCount !== 2) {
  issues.push("Generated archive manifest did not preserve the truth-boundary note count.");
}

if (tempArchiveNotes.notes.length !== 5) {
  issues.push("Generated archive notes file did not preserve one note per screenshot.");
}

if (!tempArchiveReadme.includes("archive notes file")) {
  issues.push("Generated archive README is missing the archived capture-notes reference.");
}

if (
  completedRequestManifest.fulfillment?.truthBoundaryCount !== 2 ||
  completedRequestManifest.fulfillment?.reviewedScreenshotCount !== 5
) {
  issues.push("Completed request manifest did not preserve capture-notes fulfillment metadata.");
}

const result = {
  issues,
  repoPendingRequestCount: requestIndexJson.pendingRequestCount,
  repoFulfilledRequestCount: requestIndexJson.fulfilledRequestCount,
  repoArchiveRecordCount: archiveIndexJson.recordCount,
  repoRealRequestNoteCount: realRequestNotes.notes.length,
  generatedRefreshedRequestReviewedCount:
    tempRequestIndexJson.records[0]?.captureNotesSummary?.reviewedScreenshotCount ?? null,
  generatedArchiveTruthBoundaryCount:
    tempArchiveManifest.captureNotesSummary.truthBoundaryCount,
  generatedArchiveRecordCount: completedArchiveIndexJson.recordCount,
  generatedFulfilledRequestCount: completedRequestIndexJson.fulfilledRequestCount,
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase146-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase146: store screenshot capture notes review found ${issues.length} issue(s).`,
  );
}

console.log("phase146: store screenshot capture truth notes workflow verified");
