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
  "tmp/phase144-store-screenshot-capture-archive-review",
);
const issues = [];

const archiveIndexMarkdown = await readFile(
  path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Archive.md"),
  "utf8",
);
const archiveIndexJsonRaw = await readFile(
  path.join(projectRoot, "Doc/testing/store_screenshot_archives/index.json"),
  "utf8",
);
const archiveIndexJson = JSON.parse(archiveIndexJsonRaw);
const requestIndexJsonRaw = await readFile(
  path.join(projectRoot, "Doc/testing/store_screenshot_capture_requests/index.json"),
  "utf8",
);
const requestIndexJson = JSON.parse(requestIndexJsonRaw);
const phaseIndex = await readFile(
  path.join(projectRoot, "Doc/TODOs/00_Phase_Index.md"),
  "utf8",
);
const strategicIndex = await readFile(
  path.join(projectRoot, "Doc/Roadmap/00_Strategic_Directions_Index.md"),
  "utf8",
);

if (!archiveIndexMarkdown.includes("no archived store screenshot capture sets")) {
  issues.push("Store screenshot archive index should truthfully remain empty in the repo baseline.");
}

if (archiveIndexJson.recordCount !== 0) {
  issues.push("Store screenshot archive JSON index should record zero archives in the repo baseline.");
}

if (requestIndexJson.pendingRequestCount !== 1 || requestIndexJson.fulfilledRequestCount !== 0) {
  issues.push("Store screenshot request index should remain at one pending and zero fulfilled in the repo baseline.");
}

if (!phaseIndex.includes("144_Phase_Store_Screenshot_Capture_Archive_And_Completion_Workflow.md")) {
  issues.push("Phase index latest completed slice was not updated to Phase 144.");
}

if (!strategicIndex.includes("completed through `Phase 144`")) {
  issues.push("Strategic index is missing the latest Phase 144 completion line.");
}

const tempRoot = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-phase144-"));
const requestRoot = path.join(tempRoot, "requests");
const archiveRoot = path.join(tempRoot, "archives");
const capturesDir = path.join(tempRoot, "captures");
await mkdir(capturesDir, { recursive: true });

await execFileAsync(
  "node",
  [
    "./scripts/create-store-screenshot-capture-request.mjs",
    "--request-id",
    "phase144-generated-request",
    "--request-root",
    path.relative(projectRoot, requestRoot),
  ],
  { cwd: projectRoot },
);

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
    "phase144-generated-request",
    "--captures-dir",
    path.relative(projectRoot, capturesDir),
    "--request-root",
    path.relative(projectRoot, requestRoot),
    "--archive-root",
    path.relative(projectRoot, archiveRoot),
  ],
  { cwd: projectRoot },
);

const tempRequestIndexJsonRaw = await readFile(
  path.join(requestRoot, "index.json"),
  "utf8",
);
const tempRequestIndexJson = JSON.parse(tempRequestIndexJsonRaw);
const tempArchiveIndexJsonRaw = await readFile(
  path.join(archiveRoot, "index.json"),
  "utf8",
);
const tempArchiveIndexJson = JSON.parse(tempArchiveIndexJsonRaw);
const tempArchiveIndexMarkdown = await readFile(
  path.join(tempRoot, "Store_Screenshot_Capture_Archive.md"),
  "utf8",
);
const archiveReadme = await readFile(
  path.join(archiveRoot, "phase144-generated-request-archive", "README.md"),
  "utf8",
);

if (tempRequestIndexJson.pendingRequestCount !== 0) {
  issues.push("Generated request completion flow did not clear the pending request count.");
}

if (tempRequestIndexJson.fulfilledRequestCount !== 1) {
  issues.push("Generated request completion flow did not record one fulfilled request.");
}

if (tempArchiveIndexJson.recordCount !== 1) {
  issues.push("Generated archive flow did not record exactly one archive.");
}

if (!tempArchiveIndexMarkdown.includes("phase144-generated-request-archive")) {
  issues.push("Generated archive index is missing the archive id.");
}

if (!archiveReadme.includes("source request")) {
  issues.push("Generated archive README is missing the source request trace.");
}

const result = {
  issues,
  repoArchiveRecordCount: archiveIndexJson.recordCount,
  repoPendingRequestCount: requestIndexJson.pendingRequestCount,
  repoFulfilledRequestCount: requestIndexJson.fulfilledRequestCount,
  strategicIndexHasPhase144: strategicIndex.includes("completed through `Phase 144`"),
  generatedArchiveRecordCount: tempArchiveIndexJson.recordCount,
  generatedFulfilledRequestCount: tempRequestIndexJson.fulfilledRequestCount,
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase144-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase144: store screenshot capture archive review found ${issues.length} issue(s).`,
  );
}

console.log("phase144: store screenshot capture archive workflow verified");
