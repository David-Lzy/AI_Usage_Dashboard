import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildThemeRecoveryReviewRequestId,
  writeThemeRecoveryReviewRequest,
} from "./lib/theme-recovery-review-request.mjs";
import { writeThemeRecoveryReviewRequestIndex } from "./lib/theme-recovery-review-request-index.mjs";

const projectRoot = process.cwd();
const defaultTemplatePath = path.join(
  projectRoot,
  "fixtures",
  "theme-recovery",
  "operator-review-request-template.fixture.json",
);
const defaultSeedReviewExportPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "2026-04-23-theme-recovery-seeded-archive-baseline",
  "theme-recovery-review-export.json",
);
const defaultSeedArchiveReadmePath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "2026-04-23-theme-recovery-seeded-archive-baseline",
  "README.md",
);
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_review_requests",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Theme_Recovery_Review_Requests.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_review_requests",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    template: defaultTemplatePath,
    seedReviewExport: defaultSeedReviewExportPath,
    seedArchiveReadme: defaultSeedArchiveReadmePath,
    requestRoot: defaultRequestRoot,
    requestId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--template") {
      options.template = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--seed-review-export") {
      options.seedReviewExport = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--seed-archive-readme") {
      options.seedArchiveReadme = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
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

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const templatePath = path.resolve(projectRoot, options.template);
  const seedReviewExportPath = path.resolve(projectRoot, options.seedReviewExport);
  const seedArchiveReadmePath = path.resolve(
    projectRoot,
    options.seedArchiveReadme,
  );
  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const reviewTemplate = await readJson(
    templatePath,
    "Theme recovery review request template",
  );
  const seedReferenceExport = await readJson(
    seedReviewExportPath,
    "Theme recovery seeded reference export",
  );

  assert(
    Array.isArray(reviewTemplate.targetProviderIds),
    "Theme recovery request template did not contain `targetProviderIds`.",
  );
  assert(
    Array.isArray(seedReferenceExport.targetProviders),
    "Theme recovery seeded reference export did not contain `targetProviders`.",
  );

  const createdAt = new Date().toISOString();
  const requestId = buildThemeRecoveryReviewRequestId({
    requestId: options.requestId,
    createdAt,
  });
  const shouldRefreshDefaultIndex = requestRoot === defaultRequestRoot;
  const result = await writeThemeRecoveryReviewRequest({
    projectRoot,
    requestRoot,
    requestId,
    createdAt,
    reviewTemplate,
    sourceTemplate: path.relative(projectRoot, templatePath),
    seedReferenceExport,
    sourceSeedArchiveReadme: path.relative(projectRoot, seedArchiveReadmePath),
    sourceSeedReviewExport: path.relative(projectRoot, seedReviewExportPath),
  });
  const indexMarkdownPath = shouldRefreshDefaultIndex
    ? defaultIndexMarkdownPath
    : path.join(path.dirname(requestRoot), "Theme_Recovery_Review_Requests.md");
  const indexJsonPath = shouldRefreshDefaultIndex
    ? defaultIndexJsonPath
    : path.join(requestRoot, "index.json");
  const indexResult = await writeThemeRecoveryReviewRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: createdAt,
    indexMarkdownPath,
    indexJsonPath,
  });

  console.log(
    `theme-recovery: review request written to ${result.requestDirRelative}`,
  );
  console.log(
    `theme-recovery: status=${result.manifest.status} seeded_reference=${result.manifest.sourceSeedArchiveReadme}`,
  );
  console.log(
    `theme-recovery: request index refreshed pending=${indexResult.pendingRequestCount} fulfilled=${indexResult.fulfilledRequestCount}`,
  );
}

void run().catch((error) => {
  console.error("theme-recovery: failed to create review request");
  console.error(error);
  process.exitCode = 1;
});
