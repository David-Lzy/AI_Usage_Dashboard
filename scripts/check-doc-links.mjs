import process from "node:process";

import { runDocLinkCheck } from "./lib/doc-link-check.mjs";

const result = await runDocLinkCheck(process.cwd());

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`docs:links: ${issue}`);
  }

  process.exit(1);
}

console.log(
  `docs:links: verified ${result.checkedLinkCount} local Markdown links across ${result.checkedFileCount} files; skipped ${result.skippedFileCount} closed-evidence files`,
);
