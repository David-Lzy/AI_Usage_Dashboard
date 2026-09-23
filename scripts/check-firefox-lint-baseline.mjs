#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { resolveBuildPaths } from "./lib/build-paths.mjs";
import { isKnownReactDomInnerHtmlWarning } from "./lib/firefox-react-dom-warning.mjs";

const projectRoot = process.cwd();
const { firefoxDir } = resolveBuildPaths({ projectRoot });
const webExtBin = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "web-ext.cmd" : "web-ext",
);

const expectedKnownWarningCount = 2;

const result = spawnSync(
  webExtBin,
  ["lint", "--source-dir", firefoxDir, "--output=json"],
  {
    cwd: projectRoot,
    encoding: "utf8",
  },
);

if (result.error) {
  throw result.error;
}

if (!result.stdout.trim()) {
  console.error("firefox lint baseline: web-ext did not return JSON output.");
  if (result.stderr.trim()) {
    console.error(result.stderr.trim());
  }
  process.exit(1);
}

let lintResult;
try {
  lintResult = JSON.parse(result.stdout);
} catch (error) {
  console.error("firefox lint baseline: failed to parse web-ext JSON output.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const errors = lintResult.errors ?? [];
const notices = lintResult.notices ?? [];
const warnings = lintResult.warnings ?? [];
const reactDomBundle = await readFile(
  path.join(firefoxDir, "assets/usage-progress.js"),
  "utf8",
);
const knownWarnings = warnings.filter((warning) =>
  isKnownReactDomInnerHtmlWarning(warning, reactDomBundle),
);
const unexpectedWarnings = warnings.filter(
  (warning) => !isKnownReactDomInnerHtmlWarning(warning, reactDomBundle),
);

if (
  result.status !== 0 ||
  errors.length > 0 ||
  notices.length > 0 ||
  unexpectedWarnings.length > 0 ||
  knownWarnings.length !== expectedKnownWarningCount
) {
  console.error("firefox lint baseline failed");
  console.error(
    JSON.stringify(
      {
        exitStatus: result.status,
        errors: errors.length,
        notices: notices.length,
        warnings: warnings.length,
        knownWarnings: knownWarnings.length,
        expectedKnownWarningCount,
        unexpectedWarnings,
      },
      null,
      2,
    ),
  );
  if (result.stderr.trim()) {
    console.error(result.stderr.trim());
  }
  process.exit(1);
}

console.log(
  `firefox lint baseline passed: 0 errors, 0 notices, ${knownWarnings.length} verified React DOM warnings.`,
);
