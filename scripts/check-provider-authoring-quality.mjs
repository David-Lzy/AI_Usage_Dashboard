import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateProviderFixtureSizes,
  validateProviderUpstreamProvenance,
} from "./lib/provider-authoring-quality.mjs";

const root = process.cwd();
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const readProjectFile = (path) => readFileSync(resolve(root, path), "utf8");

const ledger = readJson("config/provider-upstream-provenance.json");
const matrix = readJson("config/provider-authoring-matrix.json");
const notices = readProjectFile("THIRD_PARTY_NOTICES.md");
const errors = [
  ...validateProviderUpstreamProvenance({
    ledger,
    notices,
    readLocalFile: readProjectFile,
  }),
  ...validateProviderFixtureSizes(resolve(root, "fixtures")),
];

if (matrix.schemaVersion !== 1 || !Array.isArray(matrix.providers)) {
  errors.push("provider authoring matrix must use schemaVersion 1 and providers[]");
} else {
  const ids = matrix.providers.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) {
    errors.push("provider authoring matrix contains duplicate source-entry IDs");
  }
}

if (errors.length > 0) {
  console.error("Provider authoring quality check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Provider authoring quality check passed (${matrix.providers.length} source entries, ${ledger.adoptions.length} upstream records).`,
  );
}
