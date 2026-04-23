import process from "node:process";

import { runDocTaxonomyCheck } from "./lib/doc-taxonomy-check.mjs";

const result = await runDocTaxonomyCheck(process.cwd());

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`docs:check: ${issue}`);
  }

  process.exit(1);
}

console.log(
  `docs:check: verified ${result.checkedFileCount} documentation files; latest completed slice matches ${result.latestArchivedPhaseFilename}`,
);
