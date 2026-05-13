import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp/phase141-toolbar-store-doc-review",
);

const read = async (relativePath) =>
  await readFile(path.join(projectRoot, relativePath), "utf8");

const strategicIndex = await read("Doc/Roadmap/00_Strategic_Directions_Index.md");
const direction10 = await read(
  "Doc/Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md",
);
const storyboard = await read("Doc/Store/Store_Screenshot_Storyboard.md");
const decisionMatrix = await read(
  "Doc/Archive/benchmarks/Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md",
);
const phaseIndex = await read("Doc/TODOs/00_Phase_Index.md");

const issues = [];

if (!direction10.includes("first executable slice landed")) {
  issues.push("Direction 10 execution note was not updated for the first shipped slice.");
}

for (const token of ["## Adopt", "## Adapt", "## Reject"]) {
  if (!decisionMatrix.includes(token)) {
    issues.push(`Decision matrix is missing ${token}.`);
  }
}

for (const token of ["Ai Usage 100%", "QuotaMeter", "Chrome Web Store"]) {
  if (!decisionMatrix.includes(token)) {
    issues.push(`Decision matrix is missing expected source context for ${token}.`);
  }
}

for (const token of ["## Screenshot Storyboard Order", "Toolbar-first quick glance", "Setup guidance", "Honest contract-only or policy-only state"]) {
  if (!storyboard.includes(token)) {
    issues.push(`Storyboard doc is missing ${token}.`);
  }
}

if (!strategicIndex.includes("completed through `Phase 141`")) {
  issues.push("Strategic index is missing the latest Phase 141 completion line.");
}

if (
  !phaseIndex.includes(
    "141_Phase_Toolbar_Competitive_Fit_Decision_Matrix_And_Storyboard.md",
  )
) {
  issues.push("Phase index latest completed slice was not updated to Phase 141.");
}

const result = {
  issues,
  direction10Started: direction10.includes("first executable slice landed"),
  hasDecisionMatrix: true,
  hasStoryboard: true,
  strategicIndexHasPhase141: strategicIndex.includes("completed through `Phase 141`"),
  phaseIndexPointsToPhase141: phaseIndex.includes(
    "141_Phase_Toolbar_Competitive_Fit_Decision_Matrix_And_Storyboard.md",
  ),
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase141-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase141: toolbar/store doc review found ${issues.length} issue(s).`,
  );
}

console.log(
  "phase141: toolbar competitive-fit decision matrix and screenshot storyboard verified",
);
