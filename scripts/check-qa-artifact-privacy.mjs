import path from "node:path";
import process from "node:process";

import { scanQaArtifactFiles } from "./lib/qa-artifact-privacy.mjs";

const projectRoot = process.cwd();
const artifactRoot = path.join(projectRoot, "tmp");
const scanResult = await scanQaArtifactFiles(artifactRoot);

if (scanResult.results.length > 0) {
  const details = scanResult.results
    .map(({ filePath, issues }) => {
      const relativePath = path.relative(projectRoot, filePath);
      const formattedIssues = issues
        .map((issue) => `  - ${issue.path}: ${issue.reason}`)
        .join("\n");

      return `${relativePath}\n${formattedIssues}`;
    })
    .join("\n\n");

  throw new Error(`QA artifact privacy check failed:\n${details}`);
}

console.log(
  `qa-artifacts: checked ${scanResult.checkedFileCount} JSON artifact file(s)`,
);
