import path from "node:path";
import process from "node:process";

import { writeInteractionAuditReviewArchiveIndex } from "./lib/interaction-audit-review-archive-index.mjs";

const projectRoot = process.cwd();
const defaultArchiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_reviews",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Interaction_Audit_Review_Archive.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_reviews",
  "index.json",
);

function parseArgs(argv) {
  const options = {
    archiveRoot: defaultArchiveRoot,
    indexMarkdown: defaultIndexMarkdownPath,
    indexJson: defaultIndexJsonPath,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--archive-root") {
      options.archiveRoot = argv[index + 1] ?? "";
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
  const result = await writeInteractionAuditReviewArchiveIndex({
    projectRoot,
    archiveRoot: path.resolve(projectRoot, options.archiveRoot),
    generatedAt,
    indexMarkdownPath: path.resolve(projectRoot, options.indexMarkdown),
    indexJsonPath: path.resolve(projectRoot, options.indexJson),
  });

  console.log(
    `interaction-audit: archive index written seeded=${result.seededRecordCount} operator=${result.operatorRecordCount} total=${result.recordCount}`,
  );
}

void run().catch((error) => {
  console.error("interaction-audit: failed to refresh archive index");
  console.error(error);
  process.exitCode = 1;
});
