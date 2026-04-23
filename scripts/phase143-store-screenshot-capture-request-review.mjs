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
  "tmp/phase143-store-screenshot-capture-request-review",
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
const phaseIndex = await readFile(
  path.join(projectRoot, "Doc/TODOs/00_Phase_Index.md"),
  "utf8",
);
const strategicIndex = await readFile(
  path.join(projectRoot, "Doc/Roadmap/00_Strategic_Directions_Index.md"),
  "utf8",
);

if (!requestIndexMarkdown.includes("pending_operator_capture")) {
  issues.push("Store screenshot capture request index is missing the pending status.");
}

if (!requestIndexMarkdown.includes("first-real-store-screenshot-capture-request")) {
  issues.push("Store screenshot capture request index is missing the seeded real request package.");
}

if (requestIndexJson.pendingRequestCount < 1) {
  issues.push("Store screenshot capture request JSON index does not record a pending request.");
}

if (
  !phaseIndex.includes("143_Phase_Store_Screenshot_Capture_Request_Workflow.md")
) {
  issues.push("Phase index latest completed slice was not updated to Phase 143.");
}

if (!strategicIndex.includes("completed through `Phase 143`")) {
  issues.push("Strategic index is missing the latest Phase 143 completion line.");
}

const tempRoot = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-phase143-"));
const requestRootRelative = path.relative(projectRoot, path.join(tempRoot, "requests"));
await execFileAsync(
  "node",
  [
    "./scripts/create-store-screenshot-capture-request.mjs",
    "--request-id",
    "phase143-generated-request",
    "--request-root",
    requestRootRelative,
  ],
  { cwd: projectRoot },
);

const generatedIndexMarkdown = await readFile(
  path.join(tempRoot, "Store_Screenshot_Capture_Requests.md"),
  "utf8",
);
const generatedIndexJsonRaw = await readFile(
  path.join(tempRoot, "requests", "index.json"),
  "utf8",
);
const generatedIndexJson = JSON.parse(generatedIndexJsonRaw);
const generatedRequestReadme = await readFile(
  path.join(tempRoot, "requests", "phase143-generated-request", "README.md"),
  "utf8",
);
const generatedRequestManifestRaw = await readFile(
  path.join(tempRoot, "requests", "phase143-generated-request", "capture-request.json"),
  "utf8",
);
const generatedRequestManifest = JSON.parse(generatedRequestManifestRaw);

if (!generatedIndexMarkdown.includes("phase143-generated-request")) {
  issues.push("Generated capture request index is missing the generated request id.");
}

if (generatedIndexJson.pendingRequestCount !== 1) {
  issues.push("Generated capture request index did not record exactly one pending request.");
}

if (!generatedRequestReadme.includes("pending operator capture workflow")) {
  issues.push("Generated request README is missing the pending workflow truth note.");
}

if (generatedRequestManifest.requiredScreenshotFilenames?.length !== 5) {
  issues.push("Generated request manifest does not preserve the five required screenshot filenames.");
}

const result = {
  issues,
  pendingRequestCount: requestIndexJson.pendingRequestCount,
  generatedPendingRequestCount: generatedIndexJson.pendingRequestCount,
  generatedRequiredScreenshotCount:
    generatedRequestManifest.requiredScreenshotFilenames?.length ?? 0,
  strategicIndexHasPhase143: strategicIndex.includes("completed through `Phase 143`"),
  phaseIndexPointsToPhase143: phaseIndex.includes(
    "143_Phase_Store_Screenshot_Capture_Request_Workflow.md",
  ),
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase143-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase143: store screenshot capture request review found ${issues.length} issue(s).`,
  );
}

console.log(
  "phase143: store screenshot capture request workflow verified",
);
