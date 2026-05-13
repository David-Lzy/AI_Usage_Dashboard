import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const DOC_TAXONOMY_CONVENTION_ONLY_PATTERNS = [
  "Doc/TODOs/Archive/by-phase/*/*.md",
  "Doc/testing/Archive/phase-reports/*/Phase_*.md",
  "Doc/testing/operator_reviews/*/interaction-audit-handoff-bundle.md",
  "Doc/testing/theme_recovery_reviews/*/theme-recovery-summary.md",
];

export const DOC_TOP_LEVEL_MARKDOWN_ALLOWLIST = [
  "Doc/AI_Usage_Dashboard_TODOs.md",
  "Doc/AUTONOMOUS_PROMPT.md",
  "Doc/Development_Guardrails.md",
  "Doc/Documentation_Taxonomy.md",
  "Doc/Project_Quickstart.md",
  "Doc/README.md",
  "Doc/Release_Packaging_Guide.md",
];

export const DOC_COMPATIBILITY_STUBS = [
  "Doc/AUTONOMOUS_PROMPT.md",
  "Doc/Development_Guardrails.md",
  "Doc/Documentation_Taxonomy.md",
  "Doc/Project_Quickstart.md",
  "Doc/Release_Packaging_Guide.md",
  "Doc/testing/Interaction_Audit_Operator_Handoff_Runbook.md",
  "Doc/testing/Manual_Test_Checklist.md",
  "Doc/testing/Page_Session_Fixture_Conventions.md",
  "Doc/testing/Store_Screenshot_Capture_Runbook.md",
  "Doc/testing/Theme_Recovery_Operator_Runbook.md",
];

export const DOC_COMPATIBILITY_STUB_MAX_LINE_COUNT = 40;

export function parsePhaseTupleFromFilename(filename) {
  const match = path.basename(filename).match(/^(\d+)(?:_(\d+))?_Phase_/);

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

export function formatPhaseTupleLabel(tuple) {
  return tuple[1] === 0 ? `Phase ${tuple[0]}` : `Phase ${tuple[0]}.${tuple[1]}`;
}

export function extractLatestCompletedSlicePath(phaseIndexText) {
  const match = phaseIndexText.match(
    /latest completed slice:\s*\[[^\]]+\]\(([^)]+)\)/,
  );

  return match ? match[1] : null;
}

function phaseIndexHasNoQueuedPhaseFiles(phaseIndexText) {
  return /queued phase files:\s*none/i.test(phaseIndexText);
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

export function evaluateTopLevelDocFiles(relativePaths) {
  const allowlist = new Set(DOC_TOP_LEVEL_MARKDOWN_ALLOWLIST);
  return relativePaths
    .filter((relativePath) => !allowlist.has(relativePath))
    .map(
      (relativePath) =>
        `${relativePath} is an unclassified top-level Doc markdown file; move it into a functional directory or add an explicit allowlist entry.`,
    );
}

export function evaluateCompatibilityStub({
  relativePath,
  text,
  maxLineCount = DOC_COMPATIBILITY_STUB_MAX_LINE_COUNT,
}) {
  const issues = [];
  const lineCount = text.trimEnd().split(/\r?\n/).length;

  if (!/compatibility stub/i.test(text)) {
    issues.push(`${relativePath} must identify itself as a compatibility stub.`);
  }

  if (lineCount > maxLineCount) {
    issues.push(
      `${relativePath} has ${lineCount} lines; compatibility stubs must stay at or below ${maxLineCount} lines.`,
    );
  }

  return issues;
}

async function listMarkdownFiles(projectRoot, relativeDir, { recursive = false } = {}) {
  const results = [];

  async function visit(currentRelativeDir) {
    const absoluteDir = path.join(projectRoot, currentRelativeDir);
    const entries = (await readdir(absoluteDir, { withFileTypes: true })).sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { numeric: true }),
    );

    for (const entry of entries) {
      const relativePath = `${currentRelativeDir}/${entry.name}`;

      if (entry.isDirectory()) {
        if (recursive) {
          await visit(relativePath);
        }
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(relativePath);
      }
    }
  }

  await visit(relativeDir);
  return results;
}

function toRequirements(
  relativePaths,
  { needsClass = true, needsFreshness = true, needsStatus = true } = {},
) {
  return relativePaths.map((relativePath) => ({
    relativePath,
    needsClass,
    needsFreshness,
    needsStatus,
  }));
}

async function buildDocRequirements(projectRoot) {
  const providerNoteFiles = toRequirements(
    await listMarkdownFiles(projectRoot, "Doc/provider_notes"),
  );
  const roadmapFiles = toRequirements(
    (await listMarkdownFiles(projectRoot, "Doc/Roadmap")).filter(
      (relativePath) => relativePath !== "Doc/Roadmap/00_Strategic_Directions_Index.md",
    ),
    { needsFreshness: false },
  );
  const archiveReferenceFiles = toRequirements(
    await listMarkdownFiles(projectRoot, "Doc/Archive", { recursive: true }),
  );
  const i18nReferenceFiles = toRequirements(await listMarkdownFiles(projectRoot, "Doc/I18n"));
  const productReferenceFiles = toRequirements(
    await listMarkdownFiles(projectRoot, "Doc/Product"),
  );
  const storeReferenceFiles = toRequirements(
    (await listMarkdownFiles(projectRoot, "Doc/Store")).filter(
      (relativePath) => !path.basename(relativePath).startsWith("Chrome_Web_Store_Product_Description_"),
    ),
  );
  const generatedPackageReadmeDirs = [
    "Doc/testing/operator_review_requests",
    "Doc/testing/operator_reviews",
    "Doc/testing/theme_recovery_review_requests",
    "Doc/testing/theme_recovery_reviews",
  ];
  const generatedPackageReadmeRequirements = [];

  for (const relativeDir of generatedPackageReadmeDirs) {
    const absoluteDir = path.join(projectRoot, relativeDir);
    const entries = (await readdir(absoluteDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const entry of entries) {
      generatedPackageReadmeRequirements.push({
        relativePath: `${relativeDir}/${entry}/README.md`,
        needsClass: true,
        needsFreshness: false,
        needsStatus: true,
      });
    }
  }

  return [
    {
      relativePath: "Doc/README.md",
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
      relativePath: "Doc/Project_Quickstart.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/AUTONOMOUS_PROMPT.md",
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
    ...roadmapFiles,
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/TODOs/Archive/README.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/README.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    ...archiveReferenceFiles,
    ...i18nReferenceFiles,
    ...productReferenceFiles,
    ...storeReferenceFiles,
    ...providerNoteFiles,
    {
      relativePath: "Doc/testing/README.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/testing/Archive/README.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
    {
      relativePath: "Doc/testing/Archive/phase-reports/README.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
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
      relativePath: "Doc/testing/Store_Screenshot_Capture_Runbook.md",
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
    ...generatedPackageReadmeRequirements,
  ];
}

export async function runDocTaxonomyCheck(projectRoot) {
  const requirements = await buildDocRequirements(projectRoot);
  const issues = [];
  const results = [];

  const topLevelMarkdownFiles = (await readdir(path.join(projectRoot, "Doc"), {
    withFileTypes: true,
  }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => `Doc/${entry.name}`)
    .sort();
  issues.push(...evaluateTopLevelDocFiles(topLevelMarkdownFiles));

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

  for (const relativePath of DOC_COMPATIBILITY_STUBS) {
    const text = await readFile(path.join(projectRoot, relativePath), "utf8");
    issues.push(...evaluateCompatibilityStub({ relativePath, text }));
  }

  const phaseIndexPath = path.join(projectRoot, "Doc/TODOs/00_Phase_Index.md");
  const phaseIndexText = await readFile(phaseIndexPath, "utf8");
  const latestCompletedSlicePath = extractLatestCompletedSlicePath(phaseIndexText);

  if (!latestCompletedSlicePath) {
    issues.push(
      "Doc/TODOs/00_Phase_Index.md is missing a parsable `latest completed slice` entry.",
    );
  }

  const archiveFiles = (await listMarkdownFiles(projectRoot, "Doc/TODOs/Archive", {
    recursive: true,
  }))
    .filter((relativePath) => parsePhaseTupleFromFilename(relativePath))
    .sort((left, right) =>
      comparePhaseTuples(
        parsePhaseTupleFromFilename(left),
        parsePhaseTupleFromFilename(right),
      ),
    );

  const latestArchivedPhasePath = archiveFiles.at(-1) ?? null;
  const latestArchivedPhaseFilename = latestArchivedPhasePath
    ? path.basename(latestArchivedPhasePath)
    : null;

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

  const latestArchivedPhaseTuple = latestArchivedPhaseFilename
    ? parsePhaseTupleFromFilename(latestArchivedPhaseFilename)
    : null;
  const latestPhaseLabel = latestArchivedPhaseTuple
    ? formatPhaseTupleLabel(latestArchivedPhaseTuple)
    : null;

  if (latestPhaseLabel) {
    const currentReferenceChecks = [
      {
        relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
        requiredText: `Current post-\`${latestPhaseLabel}\` execution priority:`,
      },
      {
        relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
        requiredText: `completed through \`${latestPhaseLabel}\``,
      },
    ];

    if (phaseIndexHasNoQueuedPhaseFiles(phaseIndexText)) {
      currentReferenceChecks.push(
        {
          relativePath: "README.md",
          requiredText: `no numbered phase is currently queued after \`${latestPhaseLabel}\``,
        },
        {
          relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
          requiredText: `no numbered phase is currently queued after \`${latestPhaseLabel}\``,
        },
      );
    }

    for (const check of currentReferenceChecks) {
      const absolutePath = path.join(projectRoot, check.relativePath);
      const text = await readFile(absolutePath, "utf8");

      if (!text.includes(check.requiredText)) {
        issues.push(
          `${check.relativePath} is missing current phase reference \`${check.requiredText}\`.`,
        );
      }
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    checkedFileCount: results.length,
    latestCompletedSliceFilename,
    latestArchivedPhaseFilename,
    conventionOnlyPatterns: DOC_TAXONOMY_CONVENTION_ONLY_PATTERNS,
    results,
    issues,
  };
}
