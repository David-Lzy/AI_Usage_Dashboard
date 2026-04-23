import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { normalizeThemeRecoveryReviewExport } from "./lib/theme-recovery-review-archive.mjs";
import { buildThemeRecoveryReviewRequestPreflight } from "./lib/theme-recovery-review-request-preflight.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_review_requests",
);

function parseArgs(argv) {
  const options = {
    requestId: "",
    input: "",
    requestRoot: defaultRequestRoot,
    output: "",
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

    if (arg === "--output") {
      options.output = argv[index + 1] ?? "";
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

  assert(options.requestId.length > 0, "Pass `--request-id <pending-request-id>`.");
  assert(
    options.input.length > 0,
    "Pass `--input <path-to-theme-recovery-review-export.json>`.",
  );

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const inputPath = path.resolve(projectRoot, options.input);
  const requestDir = path.join(requestRoot, options.requestId);
  const requestManifestPath = path.join(requestDir, "review-request.json");
  const requestTemplatePath = path.join(
    requestDir,
    "theme-recovery-review-template.json",
  );

  const requestManifest = await readJson(
    requestManifestPath,
    "Theme recovery review request manifest",
  );
  const requestTemplate = await readJson(
    requestTemplatePath,
    "Theme recovery review request template",
  );
  const reviewExport = normalizeThemeRecoveryReviewExport(
    await readJson(inputPath, "Theme recovery review export"),
  );
  const report = buildThemeRecoveryReviewRequestPreflight({
    requestManifest,
    reviewTemplate: requestTemplate,
    reviewExport,
  });

  if (options.output.trim().length > 0) {
    const outputPath = path.resolve(projectRoot, options.output);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  console.log(
    `theme-recovery: preflight request ${report.requestId} eligible=${report.ok ? "yes" : "no"}`,
  );
  console.log(
    `theme-recovery: stage=${report.reviewSummary.overallLabel} popup=${report.reviewSummary.popupSnapshotLabel} scope=${report.reviewSummary.scopeIsolationLabel}`,
  );
  console.log(
    `theme-recovery: theme=${report.reviewSummary.themeMode}/${report.reviewSummary.themePreset}${report.reviewSummary.themeCustomSeedHex ? ` seed=${report.reviewSummary.themeCustomSeedHex}` : ""} providers=${report.reviewSummary.targetProviderCount}`,
  );

  for (const check of report.checks) {
    console.log(
      `theme-recovery: ${check.ok ? "pass" : "fail"} ${check.id} - ${check.detail}`,
    );
  }

  if (!report.ok) {
    process.exitCode = 1;
  }
}

void run().catch((error) => {
  console.error("theme-recovery: failed to preflight review request");
  console.error(error);
  process.exitCode = 1;
});
