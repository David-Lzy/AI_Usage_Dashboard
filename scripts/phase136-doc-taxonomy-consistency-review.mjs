import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { runDocTaxonomyCheck } from "./lib/doc-taxonomy-check.mjs";

const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp/phase136-doc-taxonomy-consistency-review",
);

const result = await runDocTaxonomyCheck(projectRoot);

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase136-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (result.issues.length > 0) {
  throw new Error(
    `phase136: documentation taxonomy consistency review found ${result.issues.length} issue(s).`,
  );
}

console.log(
  `phase136: documentation taxonomy consistency verified across ${result.checkedFileCount} docs`,
);
