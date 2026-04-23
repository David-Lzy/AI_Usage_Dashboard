import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export function parsePhaseTupleFromFilename(filename) {
  const match = filename.match(/^(\d+)(?:_(\d+))?_Phase_/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2] ?? "0")];
}

export function comparePhaseTuples(left, right) {
  if (left[0] !== right[0]) {
    return left[0] - right[0];
  }

  return left[1] - right[1];
}

export function extractLatestCompletedSlicePath(phaseIndexText) {
  const match = phaseIndexText.match(
    /latest completed slice:\s*\[[^\]]+\]\(([^)]+)\)/,
  );

  return match ? match[1] : null;
}

export function evaluateDocLabels({
  relativePath,
  text,
  needsClass = false,
  needsFreshness = false,
  needsStatus = false,
}) {
  const issues = [];

  if (needsClass && !text.includes("Document class:")) {
    issues.push(`${relativePath} is missing \`Document class:\`.`);
  }

  if (needsFreshness && !text.includes("Freshness model:")) {
    issues.push(`${relativePath} is missing \`Freshness model:\`.`);
  }

  if (needsStatus && !text.includes("Status note:")) {
    issues.push(`${relativePath} is missing \`Status note:\`.`);
  }

  return {
    relativePath,
    needsClass,
    needsFreshness,
    needsStatus,
    hasClass: text.includes("Document class:"),
    hasFreshness: text.includes("Freshness model:"),
    hasStatus: text.includes("Status note:"),
    issues,
  };
}

async function buildDocRequirements(projectRoot) {
  const providerNotesDir = path.join(projectRoot, "Doc/provider_notes");
  const providerNoteFiles = (await readdir(providerNotesDir))
    .filter((entry) => entry.endsWith(".md"))
    .sort()
    .map((entry) => ({
      relativePath: `Doc/provider_notes/${entry}`,
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    }));

  return [
    {
      relativePath: "Doc/AI_Usage_Dashboard_MVP_Design.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/Development_Guardrails.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/Documentation_Completion_Audit_2026-04-24.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/Documentation_Taxonomy.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/Release_Packaging_Guide.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      needsClass: true,
      needsFreshness: false,
      needsStatus: true,
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/Toolbar_Product_Benchmark_Matrix_2026-04-23.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    ...providerNoteFiles,
    {
      relativePath: "Doc/testing/Interaction_Audit_Operator_Handoff_Runbook.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/testing/Interaction_Audit_Review_Archive.md",
      needsClass: true,
      needsFreshness: false,
      needsStatus: false,
    },
    {
      relativePath: "Doc/testing/Interaction_Audit_Review_Requests.md",
      needsClass: true,
      needsFreshness: false,
      needsStatus: false,
    },
    {
      relativePath: "Doc/testing/Manual_Test_Checklist.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/testing/Page_Session_Fixture_Conventions.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/testing/Theme_Recovery_Operator_Runbook.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/testing/Theme_Recovery_Review_Archive.md",
      needsClass: true,
      needsFreshness: false,
      needsStatus: false,
    },
    {
      relativePath: "Doc/testing/Theme_Recovery_Review_Requests.md",
      needsClass: true,
      needsFreshness: false,
      needsStatus: false,
    },
  ];
}

export async function runDocTaxonomyCheck(projectRoot) {
  const requirements = await buildDocRequirements(projectRoot);
  const issues = [];
  const results = [];

  for (const requirement of requirements) {
    const absolutePath = path.join(projectRoot, requirement.relativePath);
    const text = await readFile(absolutePath, "utf8");
    const result = evaluateDocLabels({
      ...requirement,
      text,
    });

    results.push(result);
    issues.push(...result.issues);
  }

  const phaseIndexPath = path.join(projectRoot, "Doc/TODOs/00_Phase_Index.md");
  const phaseIndexText = await readFile(phaseIndexPath, "utf8");
  const latestCompletedSlicePath = extractLatestCompletedSlicePath(phaseIndexText);

  if (!latestCompletedSlicePath) {
    issues.push(
      "Doc/TODOs/00_Phase_Index.md is missing a parsable `latest completed slice` entry.",
    );
  }

  const archiveDir = path.join(projectRoot, "Doc/TODOs/Archive");
  const archiveFiles = (await readdir(archiveDir))
    .filter((entry) => entry.endsWith(".md"))
    .filter((entry) => parsePhaseTupleFromFilename(entry))
    .sort((left, right) =>
      comparePhaseTuples(
        parsePhaseTupleFromFilename(left),
        parsePhaseTupleFromFilename(right),
      ),
    );

  const latestArchivedPhaseFilename = archiveFiles.at(-1) ?? null;

  if (!latestArchivedPhaseFilename) {
    issues.push("Doc/TODOs/Archive does not contain any parsable phase archive files.");
  }

  const latestCompletedSliceFilename = latestCompletedSlicePath
    ? path.basename(latestCompletedSlicePath)
    : null;

  if (
    latestArchivedPhaseFilename &&
    latestCompletedSliceFilename &&
    latestArchivedPhaseFilename !== latestCompletedSliceFilename
  ) {
    issues.push(
      `Doc/TODOs/00_Phase_Index.md latest completed slice \`${latestCompletedSliceFilename}\` did not match latest archived phase \`${latestArchivedPhaseFilename}\`.`,
    );
  }

  return {
    checkedAt: new Date().toISOString(),
    checkedFileCount: results.length,
    latestCompletedSliceFilename,
    latestArchivedPhaseFilename,
    results,
    issues,
  };
}
