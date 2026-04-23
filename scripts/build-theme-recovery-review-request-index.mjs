import path from "node:path";
import process from "node:process";

import { writeThemeRecoveryReviewRequestIndex } from "./lib/theme-recovery-review-request-index.mjs";

const projectRoot = process.cwd();
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
  const generatedAt = new Date().toISOString();
  const result = await writeThemeRecoveryReviewRequestIndex({
    projectRoot,
    requestRoot: path.resolve(projectRoot, options.requestRoot),
    generatedAt,
    indexMarkdownPath: path.resolve(projectRoot, options.indexMarkdown),
    indexJsonPath: path.resolve(projectRoot, options.indexJson),
  });

  console.log(
    `theme-recovery: request index written pending=${result.pendingRequestCount} fulfilled=${result.fulfilledRequestCount} total=${result.recordCount}`,
  );
}

void run().catch((error) => {
  console.error("theme-recovery: failed to refresh review request index");
  console.error(error);
  process.exitCode = 1;
});
