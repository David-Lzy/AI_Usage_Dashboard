import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildThemeRecoveryReviewArchiveId,
  normalizeThemeRecoveryReviewExport,
  writeThemeRecoveryReviewArchive,
} from "./lib/theme-recovery-review-archive.mjs";
import { writeThemeRecoveryReviewArchiveIndex } from "./lib/theme-recovery-review-archive-index.mjs";
import {
  buildThemeRecoveryReviewRequestFulfillment,
  THEME_RECOVERY_REVIEW_REQUEST_FULFILLED_STATUS,
  THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
  updateThemeRecoveryReviewRequest,
} from "./lib/theme-recovery-review-request.mjs";
import { buildThemeRecoveryReviewRequestPreflight } from "./lib/theme-recovery-review-request-preflight.mjs";
import { writeThemeRecoveryReviewRequestIndex } from "./lib/theme-recovery-review-request-index.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_review_requests",
);
const defaultArchiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
);
const defaultRequestIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Theme_Recovery_Review_Requests.md",
);
const defaultRequestIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_review_requests",
  "index.json",
);
const defaultArchiveIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Theme_Recovery_Review_Archive.md",
);
const defaultArchiveIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    input: "",
    requestRoot: defaultRequestRoot,
    archiveRoot: defaultArchiveRoot,
    archiveId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--input") {
      options.input = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
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

async function readJsonWithRaw(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return {
    raw,
    parsed,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.requestId.length > 0, "Pass `--request-id <pending-request-id>`.");
  assert(
    options.input.length > 0,
    "Pass `--input <path-to-theme-recovery-review-export.json>`.",
  );

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const archiveRoot = path.resolve(projectRoot, options.archiveRoot);
  const inputPath = path.resolve(projectRoot, options.input);
  const requestDir = path.join(requestRoot, options.requestId);
  const requestManifestPath = path.join(requestDir, "review-request.json");
  const requestTemplatePath = path.join(
    requestDir,
    "theme-recovery-review-template.json",
  );
  const seedReferencePath = path.join(
    requestDir,
    "theme-recovery-seeded-reference.json",
  );

  const requestManifest = await readJson(
    requestManifestPath,
    "Theme recovery review request manifest",
  );
  const requestTemplate = await readJson(
    requestTemplatePath,
    "Theme recovery review request template",
  );
  const seedReferenceExport = await readJson(
    seedReferencePath,
    "Theme recovery seeded reference export",
  );
  const reviewExportResult = await readJsonWithRaw(
    inputPath,
    "Completed theme recovery review export",
  );
  const reviewExport = normalizeThemeRecoveryReviewExport(reviewExportResult.parsed);

  assert(
    requestManifest.status === THEME_RECOVERY_REVIEW_REQUEST_PENDING_STATUS,
    `Theme recovery request \`${requestManifest.requestId || options.requestId}\` is not pending.`,
  );

  const preflight = buildThemeRecoveryReviewRequestPreflight({
    requestManifest,
    reviewTemplate: requestTemplate,
    reviewExport,
  });

  assert(
    preflight.ok,
    preflight.failures[0] ??
      "Completed theme-recovery export did not satisfy the pending request.",
  );

  const fulfilledAt = new Date().toISOString();
  const archiveId = buildThemeRecoveryReviewArchiveId({
    reviewExport,
    archiveId: options.archiveId,
    archivedAt: fulfilledAt,
  });
  const archiveResult = await writeThemeRecoveryReviewArchive({
    projectRoot,
    reviewExport,
    sourceReviewExport: path.relative(projectRoot, inputPath),
    archiveRoot,
    archiveId,
    archivedAt: fulfilledAt,
    seeded: false,
    sourceRequest: {
      requestId: requestManifest.requestId,
      requestReadmePath: path.relative(projectRoot, path.join(requestDir, "README.md")),
      requestManifestPath: path.relative(projectRoot, requestManifestPath),
    },
  });
  const archiveReadmePath = path.join(archiveResult.archiveDir, "README.md");
  const archiveManifestPath = path.join(
    archiveResult.archiveDir,
    "review-archive.json",
  );

  const fulfillment = buildThemeRecoveryReviewRequestFulfillment({
    fulfilledAt,
    sourceCompletedReviewExport: path.relative(projectRoot, inputPath),
    archiveId,
    archiveReadmePath: path.relative(projectRoot, archiveReadmePath),
    archiveManifestPath: path.relative(projectRoot, archiveManifestPath),
    reviewExport,
    rawReviewExport: reviewExportResult.raw,
  });

  await updateThemeRecoveryReviewRequest({
    projectRoot,
    requestDir,
    requestId: requestManifest.requestId,
    createdAt: requestManifest.createdAt,
    reviewTemplate: requestTemplate,
    sourceTemplate: requestManifest.sourceTemplate,
    seedReferenceExport,
    sourceSeedArchiveReadme: requestManifest.sourceSeedArchiveReadme,
    sourceSeedReviewExport: requestManifest.sourceSeedReviewExport,
    status: THEME_RECOVERY_REVIEW_REQUEST_FULFILLED_STATUS,
    fulfillment,
  });

  const requestIndexMarkdownPath =
    requestRoot === defaultRequestRoot
      ? defaultRequestIndexMarkdownPath
      : path.join(path.dirname(requestRoot), "Theme_Recovery_Review_Requests.md");
  const requestIndexJsonPath =
    requestRoot === defaultRequestRoot
      ? defaultRequestIndexJsonPath
      : path.join(requestRoot, "index.json");
  const archiveIndexMarkdownPath =
    archiveRoot === defaultArchiveRoot
      ? defaultArchiveIndexMarkdownPath
      : path.join(path.dirname(archiveRoot), "Theme_Recovery_Review_Archive.md");
  const archiveIndexJsonPath =
    archiveRoot === defaultArchiveRoot
      ? defaultArchiveIndexJsonPath
      : path.join(archiveRoot, "index.json");

  const requestIndexResult = await writeThemeRecoveryReviewRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: fulfilledAt,
    indexMarkdownPath: requestIndexMarkdownPath,
    indexJsonPath: requestIndexJsonPath,
  });
  const archiveIndexResult = await writeThemeRecoveryReviewArchiveIndex({
    projectRoot,
    archiveRoot,
    generatedAt: fulfilledAt,
    indexMarkdownPath: archiveIndexMarkdownPath,
    indexJsonPath: archiveIndexJsonPath,
  });

  console.log(`theme-recovery: request fulfilled ${requestManifest.requestId}`);
  console.log(`theme-recovery: archive written to ${archiveResult.archiveDirRelative}`);
  console.log(
    `theme-recovery: request index refreshed pending=${requestIndexResult.pendingRequestCount} fulfilled=${requestIndexResult.fulfilledRequestCount}`,
  );
  console.log(
    `theme-recovery: archive index refreshed seeded=${archiveIndexResult.seededRecordCount} operator=${archiveIndexResult.operatorRecordCount}`,
  );
}

void run().catch((error) => {
  console.error("theme-recovery: failed to complete review request");
  console.error(error);
  process.exitCode = 1;
});
