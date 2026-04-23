import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildThemeRecoveryReviewArchiveId,
  normalizeThemeRecoveryReviewExport,
  writeThemeRecoveryReviewArchive,
} from "./lib/theme-recovery-review-archive.mjs";
import { writeThemeRecoveryReviewArchiveIndex } from "./lib/theme-recovery-review-archive-index.mjs";

const projectRoot = process.cwd();
const defaultArchiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Theme_Recovery_Review_Archive.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    input: "",
    archiveRoot: defaultArchiveRoot,
    archiveId: "",
    seeded: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--input") {
      options.input = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--archive-root") {
      options.archiveRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--archive-id") {
      options.archiveId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--seeded") {
      options.seeded = true;
    }
  }

  return options;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.input.length > 0, "Pass `--input <path-to-theme-recovery-export.json>`.");

  const inputPath = path.resolve(projectRoot, options.input);
  const archiveRoot = path.resolve(projectRoot, options.archiveRoot);
  const reviewExport = normalizeThemeRecoveryReviewExport(
    await readJson(inputPath, "Theme recovery export"),
  );

  assert(
    Array.isArray(reviewExport.targetProviders) &&
      reviewExport.targetProviders.length > 0,
    "Theme recovery export did not contain any `targetProviders`.",
  );

  const archivedAt = new Date().toISOString();
  const archiveId = buildThemeRecoveryReviewArchiveId({
    reviewExport,
    archiveId: options.archiveId,
    archivedAt,
    seeded: options.seeded,
  });
  const result = await writeThemeRecoveryReviewArchive({
    projectRoot,
    reviewExport,
    sourceReviewExport: path.relative(projectRoot, inputPath),
    archiveRoot,
    archiveId,
    archivedAt,
    seeded: options.seeded,
  });
  const shouldRefreshDefaultIndex = archiveRoot === defaultArchiveRoot;

  if (shouldRefreshDefaultIndex) {
    await writeThemeRecoveryReviewArchiveIndex({
      projectRoot,
      archiveRoot,
      generatedAt: archivedAt,
      indexMarkdownPath: defaultIndexMarkdownPath,
      indexJsonPath: defaultIndexJsonPath,
    });
  }

  console.log(`theme-recovery: archive written to ${result.archiveDirRelative}`);
  console.log(
    `theme-recovery: stage=${result.manifest.summary.overallLabel} recovered=${result.manifest.summary.recoveredProviderCount}/${result.manifest.summary.targetProviderCount} seeded=${result.manifest.seeded ? "yes" : "no"}`,
  );
  if (shouldRefreshDefaultIndex) {
    console.log("theme-recovery: default archive index refreshed");
  }
}

void run().catch((error) => {
  console.error("theme-recovery: failed to archive review session");
  console.error(error);
  process.exitCode = 1;
});
