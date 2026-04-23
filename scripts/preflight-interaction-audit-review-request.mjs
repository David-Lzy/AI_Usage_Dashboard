import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { resolveInteractionAuditReviewEvidence } from "./lib/interaction-audit-review-evidence.mjs";
import { buildInteractionAuditReviewRequestPreflight } from "./lib/interaction-audit-review-request-preflight.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
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
  assert(options.input.length > 0, "Pass `--input <path-to-signoff-export.json>`.");

  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const inputPath = path.resolve(projectRoot, options.input);
  const requestDir = path.join(requestRoot, options.requestId);
  const requestManifestPath = path.join(requestDir, "review-request.json");
  const requestTemplatePath = path.join(
    requestDir,
    "interaction-audit-signoff-template.json",
  );

  const requestManifest = await readJson(
    requestManifestPath,
    "Review request manifest",
  );
  const requestTemplate = await readJson(
    requestTemplatePath,
    "Review request template",
  );
  const signoffExport = await readJson(inputPath, "Completed signoff export");
  const sourceEvidencePack = await resolveInteractionAuditReviewEvidence({
    projectRoot,
    requestManifest,
    requestDir,
  });
  const sourceTemplateRelativePath =
    typeof requestManifest.sourceTemplate === "string"
      ? requestManifest.sourceTemplate.trim()
      : "";

  assert(
    sourceTemplateRelativePath.length > 0,
    "Review request manifest did not preserve a source template path.",
  );

  const sourceTemplatePath = path.resolve(projectRoot, sourceTemplateRelativePath);
  let currentSourceTemplate = null;
  let sourceTemplateReadError = "";

  try {
    const rawSourceTemplate = await readFile(sourceTemplatePath, "utf8");
    const parsedSourceTemplate = JSON.parse(rawSourceTemplate);

    if (!Array.isArray(parsedSourceTemplate?.surfaces)) {
      sourceTemplateReadError = `Current source template \`${sourceTemplateRelativePath}\` did not contain a valid \`surfaces\` array. Regenerate the pending request before completion.`;
    } else {
      currentSourceTemplate = parsedSourceTemplate;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      sourceTemplateReadError = `Current source template \`${sourceTemplateRelativePath}\` was not valid JSON. Regenerate the pending request before completion.`;
    } else {
      sourceTemplateReadError = `Current source template \`${sourceTemplateRelativePath}\` could not be read. Regenerate the pending request before completion.`;
    }
  }

  const report = buildInteractionAuditReviewRequestPreflight({
    requestManifest,
    requestTemplate,
    signoffExport,
    currentSourceTemplate,
    sourceTemplatePath: sourceTemplateRelativePath,
    sourceTemplateReadError,
    sourceEvidencePack,
  });

  if (options.output.trim().length > 0) {
    const outputPath = path.resolve(projectRoot, options.output);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(report, null, 2), "utf8");
  }

  console.log(
    `interaction-audit: preflight request ${report.requestId} eligible=${report.ok ? "yes" : "no"}`,
  );
  console.log(
    `interaction-audit: evidence=${report.sourceEvidencePack.source} path=${report.sourceEvidencePack.selectedPath || "not-set"} ok=${report.sourceEvidencePack.ok ? "yes" : "no"}`,
  );
  console.log(
    `interaction-audit: ready=${report.signoffSummary.readyForSignoff ? "yes" : "no"} follow_up=${report.signoffSummary.followUpSurfaceCount} not_reviewed=${report.signoffSummary.notReviewedSurfaceCount} pending=${report.signoffSummary.pendingManualCheckCount} / ${report.signoffSummary.totalManualCheckCount}`,
  );

  for (const check of report.checks) {
    console.log(
      `interaction-audit: ${check.ok ? "pass" : "fail"} ${check.id} - ${check.detail}`,
    );
  }

  if (!report.ok) {
    process.exitCode = 1;
  }
}

void run().catch((error) => {
  console.error("interaction-audit: failed to preflight review request");
  console.error(error);
  process.exitCode = 1;
});
