import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp/phase140-doc-direction-maintenance-review",
);

const read = async (relativePath) =>
  await readFile(path.join(projectRoot, relativePath), "utf8");

const direction08 = await read(
  "Doc/Roadmap/08_Direction_Documentation_Completion_And_Truth_Audit.md",
);
const strategicIndex = await read(
  "Doc/Roadmap/00_Strategic_Directions_Index.md",
);
const phaseIndex = await read("Doc/TODOs/00_Phase_Index.md");

const getSection = (sourceText, heading, nextHeading) => {
  const startIndex = sourceText.indexOf(heading);
  if (startIndex === -1) {
    return "";
  }
  const sectionStart = startIndex + heading.length;
  const sectionTail = sourceText.slice(sectionStart);
  if (!nextHeading) {
    return sectionTail;
  }
  const endIndex = sectionTail.indexOf(nextHeading);
  return endIndex === -1 ? sectionTail : sectionTail.slice(0, endIndex);
};

const strategicRefreshSection = getSection(
  strategicIndex,
  "### 2026-04-24 strategic refresh",
  "### Active continuation order",
);
const requested20260424Section = getSection(
  strategicIndex,
  "### Additional requested directions from 2026-04-24",
  "Completed first:",
);

const issues = [];

if (!direction08.includes("maintenance mode")) {
  issues.push("Direction 08 does not explicitly declare maintenance mode.");
}

if (!direction08.includes("- `P7`")) {
  issues.push("Direction 08 priority was not lowered to `P7`.");
}

if (strategicIndex.includes("completed through `Phase 136`")) {
  issues.push("Strategic index still contains the stale `Phase 136` completion line.");
}

if (!strategicIndex.includes("completed through `Phase 140`")) {
  issues.push("Strategic index is missing the latest `Phase 140` completion line.");
}

const expectedOrder = [
  "[Direction 10 - Toolbar Competitive Fit And Store Readiness]",
  "[Direction 09 - Internationalization Bootstrap And Pilot Locales]",
  "[Direction 08 - Documentation Completion And Truth Audit]",
];

const assertOrder = (sectionText, label) => {
  let prior = -1;
  for (const token of expectedOrder) {
    const next = sectionText.indexOf(token, prior + 1);
    if (next === -1) {
      issues.push(`${label} is missing ${token}.`);
      continue;
    }
    if (next < prior) {
      issues.push(`${label} does not preserve the expected Direction 10 -> 09 -> 08 ordering.`);
    }
    prior = next;
  }
};

assertOrder(strategicRefreshSection, "2026-04-24 strategic refresh section");
assertOrder(
  requested20260424Section ?? "",
  "2026-04-24 requested-directions section",
);

if (
  !phaseIndex.includes(
    "140_Phase_Direction_08_Maintenance_Transition_And_Strategic_Reprioritization.md",
  )
) {
  issues.push("Phase index latest completed slice was not updated to Phase 140.");
}

const result = {
  issues,
  maintainedDirection: "Direction 08",
  loweredPriority: direction08.includes("- `P7`"),
  strategicIndexHasPhase140: strategicIndex.includes("completed through `Phase 140`"),
  phaseIndexPointsToPhase140: phaseIndex.includes(
    "140_Phase_Direction_08_Maintenance_Transition_And_Strategic_Reprioritization.md",
  ),
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase140-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase140: direction-maintenance review found ${issues.length} issue(s).`,
  );
}

console.log(
  "phase140: documentation direction maintenance transition and strategic reprioritization verified",
);
