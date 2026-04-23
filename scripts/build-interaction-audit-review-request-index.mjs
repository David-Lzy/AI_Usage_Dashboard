import path from "node:path";
import process from "node:process";

import { writeInteractionAuditReviewRequestIndex } from "./lib/interaction-audit-review-request-index.mjs";

const projectRoot = process.cwd();
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
    requestRoot: defaultRequestRoot,
    indexMarkdown: defaultIndexMarkdownPath,
    indexJson: defaultIndexJsonPath,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--index-markdown") {
      options.indexMarkdown = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--index-json") {
      options.indexJson = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return options;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const indexMarkdownPath = path.resolve(projectRoot, options.indexMarkdown);
  const indexJsonPath = path.resolve(projectRoot, options.indexJson);
  const generatedAt = new Date().toISOString();
  const result = await writeInteractionAuditReviewRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt,
    indexMarkdownPath,
    indexJsonPath,
  });

  console.log(
    `interaction-audit: request index written pending=${result.pendingRequestCount} fulfilled=${result.fulfilledRequestCount} total=${result.recordCount}`,
  );
}

void run().catch((error) => {
  console.error("interaction-audit: failed to refresh review request index");
  console.error(error);
  process.exitCode = 1;
});
