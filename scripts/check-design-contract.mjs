import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  DESIGN_CONTRACT_REQUIRED_REFERENCES,
  DESIGN_CONTRACT_REQUIRED_SECTIONS,
  validateDesignContract,
} from "./lib/design-contract.mjs";

const projectRoot = process.cwd();
const contractPath = path.join(projectRoot, "DESIGN.md");
const content = await readFile(contractPath, "utf8");
const issues = validateDesignContract({
  content,
  pathExists: (relativePath) => existsSync(path.join(projectRoot, relativePath)),
});

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`design:check: ${issue}`);
  }

  process.exit(1);
}

console.log(
  `design:check: verified ${DESIGN_CONTRACT_REQUIRED_SECTIONS.length} sections and ${DESIGN_CONTRACT_REQUIRED_REFERENCES.length} implementation references`,
);

