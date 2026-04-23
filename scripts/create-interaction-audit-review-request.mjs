import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditReviewRequestId,
  writeInteractionAuditReviewRequest,
} from "./lib/interaction-audit-review-request.mjs";
import { writeInteractionAuditReviewRequestIndex } from "./lib/interaction-audit-review-request-index.mjs";

const projectRoot = process.cwd();
const defaultTemplatePath = path.join(
  projectRoot,
  "fixtures",
  "interaction-audit",
  "operator-review-request-template.fixture.json",
);
const defaultEvidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Interaction_Audit_Review_Requests.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    template: defaultTemplatePath,
    evidence: defaultEvidencePath,
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

    if (arg === "--evidence") {
      options.evidence = argv[index + 1] ?? "";
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
  const evidencePath = path.resolve(projectRoot, options.evidence);
  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const signoffTemplate = await readJson(templatePath, "Review request template");
  const evidenceReport = await readJson(evidencePath, "Evidence report");

  assert(
    Array.isArray(signoffTemplate.surfaces),
    "Review request template did not contain a `surfaces` array.",
  );
  assert(
    Array.isArray(evidenceReport.evidenceItems),
    "Evidence report did not contain an `evidenceItems` array.",
  );

  const createdAt = new Date().toISOString();
  const requestId = buildInteractionAuditReviewRequestId({
    requestId: options.requestId,
    createdAt,
  });
  const shouldRefreshDefaultIndex = requestRoot === defaultRequestRoot;
  const result = await writeInteractionAuditReviewRequest({
    projectRoot,
    requestRoot,
    requestId,
    createdAt,
    signoffTemplate,
    sourceTemplate: path.relative(projectRoot, templatePath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    evidenceReport,
  });
  const indexMarkdownPath = shouldRefreshDefaultIndex
    ? defaultIndexMarkdownPath
    : path.join(path.dirname(requestRoot), "Interaction_Audit_Review_Requests.md");
  const indexJsonPath = shouldRefreshDefaultIndex
    ? defaultIndexJsonPath
    : path.join(requestRoot, "index.json");
  const indexResult = await writeInteractionAuditReviewRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: createdAt,
    indexMarkdownPath,
    indexJsonPath,
  });

  console.log(
    `interaction-audit: review request written to ${result.requestDirRelative}`,
  );
  console.log(
    `interaction-audit: status=${result.manifest.status} evidence=${result.manifest.sourceEvidencePack}`,
  );
  console.log(
    `interaction-audit: request index refreshed pending=${indexResult.pendingRequestCount} fulfilled=${indexResult.fulfilledRequestCount}`,
  );
}

void run().catch((error) => {
  console.error("interaction-audit: failed to create review request");
  console.error(error);
  process.exitCode = 1;
});
