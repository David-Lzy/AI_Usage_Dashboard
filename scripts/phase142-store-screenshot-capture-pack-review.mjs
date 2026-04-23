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
  "tmp/phase142-store-screenshot-capture-pack-review",
);

const issues = [];

const runbook = await readFile(
  path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Runbook.md"),
  "utf8",
);
const packIndex = await readFile(
  path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Packs.md"),
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
const baselinePlanRaw = await readFile(
  path.join(
    projectRoot,
    "Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/capture-plan.json",
  ),
  "utf8",
);
const baselinePlan = JSON.parse(baselinePlanRaw);

if (!runbook.includes("RDP Chrome")) {
  issues.push("Runbook is missing the RDP Chrome runtime rule.");
}

if (!runbook.includes("1280x800") || !runbook.includes("640x400")) {
  issues.push("Runbook is missing screenshot size guidance.");
}

if (!packIndex.includes("2026-04-24-toolbar-storyboard-baseline")) {
  issues.push("Capture pack index is missing the baseline pack.");
}

if (baselinePlan.screenshots.length !== 5) {
  issues.push("Baseline capture plan does not contain five storyboard screenshots.");
}

if (
  !phaseIndex.includes("142_Phase_Store_Screenshot_Capture_Workflow_And_Baseline_Pack.md")
) {
  issues.push("Phase index latest completed slice was not updated to Phase 142.");
}

if (!strategicIndex.includes("completed through `Phase 142`")) {
  issues.push("Strategic index is missing the latest Phase 142 completion line.");
}

const tempRoot = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-phase142-"));
const relativeOutputDir = path.relative(projectRoot, tempRoot);

await execFileAsync(
  "node",
  [
    "./scripts/create-store-screenshot-capture-pack.mjs",
    "--pack-id",
    "phase142-generated-pack",
    "--output-dir",
    relativeOutputDir,
  ],
  { cwd: projectRoot },
);

const generatedPlanRaw = await readFile(
  path.join(tempRoot, "capture-plan.json"),
  "utf8",
);
const generatedPlan = JSON.parse(generatedPlanRaw);
const generatedReadme = await readFile(path.join(tempRoot, "README.md"), "utf8");
const generatedCaptureReadme = await readFile(
  path.join(tempRoot, "captures/README.md"),
  "utf8",
);

if (generatedPlan.screenshots.length !== 5) {
  issues.push("Generated pack does not contain five screenshot entries.");
}

if (!generatedReadme.includes("RDP Chrome")) {
  issues.push("Generated pack README is missing the runtime source note.");
}

if (!generatedCaptureReadme.includes("01-toolbar-first-quick-glance.png")) {
  issues.push("Generated captures README is missing the expected filename contract.");
}

const result = {
  issues,
  baselinePackId: baselinePlan.packId,
  baselineScreenshotCount: baselinePlan.screenshots.length,
  generatedPackId: generatedPlan.packId,
  generatedScreenshotCount: generatedPlan.screenshots.length,
  strategicIndexHasPhase142: strategicIndex.includes("completed through `Phase 142`"),
  phaseIndexPointsToPhase142: phaseIndex.includes(
    "142_Phase_Store_Screenshot_Capture_Workflow_And_Baseline_Pack.md",
  ),
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase142-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase142: store screenshot capture pack review found ${issues.length} issue(s).`,
  );
}

console.log(
  "phase142: store screenshot capture workflow and baseline pack verified",
);
