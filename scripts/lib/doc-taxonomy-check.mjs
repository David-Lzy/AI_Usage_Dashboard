import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const DOC_TAXONOMY_CONVENTION_ONLY_PATTERNS = [
];

export const DOC_TOP_LEVEL_MARKDOWN_ALLOWLIST = [
  "Doc/README.md",
];

export const DOC_COMPATIBILITY_STUBS = [
];

export const DOC_COMPATIBILITY_STUB_MAX_LINE_COUNT = 40;

export function parsePhaseTupleFromFilename(filename) {
  const match = path.basename(filename).match(/^(\d+(?:_\d+)*)_Phase_/);

  if (!match) {
    return null;
  }

  const tuple = match[1].split("_").map((part) => Number(part));

  return tuple.length === 1 ? [tuple[0], 0] : tuple;
}

export function comparePhaseTuples(left, right) {
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

export function formatPhaseTupleLabel(tuple) {
  return tuple.length === 2 && tuple[1] === 0
    ? `Phase ${tuple[0]}`
    : `Phase ${tuple.join(".")}`;
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
  const i18nReferenceFiles = toRequirements(await listMarkdownFiles(projectRoot, "Doc/I18n"));
  const productReferenceFiles = toRequirements(
    await listMarkdownFiles(projectRoot, "Doc/Product"),
  );
  const storeReferenceFiles = toRequirements(
    (await listMarkdownFiles(projectRoot, "Doc/Store")).filter(
      (relativePath) => !path.basename(relativePath).startsWith("Chrome_Web_Store_Product_Description_"),
    ),
  );

  return [
    {
      relativePath: "Doc/README.md",
      needsClass: true,
      needsFreshness: true,
      needsStatus: true,
    },
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

  return {
    checkedAt: new Date().toISOString(),
    checkedFileCount: results.length,
    latestCompletedSliceFilename: null,
    latestArchivedPhaseFilename: null,
    conventionOnlyPatterns: DOC_TAXONOMY_CONVENTION_ONLY_PATTERNS,
    results,
    issues,
  };
}
