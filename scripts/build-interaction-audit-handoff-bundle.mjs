import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditHandoffBundle,
  buildInteractionAuditHandoffBundleMarkdown,
} from "./lib/interaction-audit-handoff-bundle.mjs";

const projectRoot = process.cwd();
const defaultEvidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);

function parseArgs(argv) {
  const options = {
    input: "",
    evidence: defaultEvidencePath,
    outputDir: path.join(projectRoot, "tmp", "interaction-audit-handoff-bundle"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--input") {
      options.input = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--evidence") {
      options.evidence = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--output-dir") {
      options.outputDir = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
  }

  return options;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.input.length > 0, "Pass `--input <path-to-signoff-export.json>`.");
  assert(options.outputDir.length > 0, "Pass `--output-dir <target-directory>`.");

  const inputPath = path.resolve(projectRoot, options.input);
  const evidencePath = path.resolve(projectRoot, options.evidence);
  const outputDir = path.resolve(projectRoot, options.outputDir);

  const signoffExport = await readJson(inputPath, "Signoff export");
  const evidenceReport = await readJson(evidencePath, "Evidence report");

  assert(
    Array.isArray(signoffExport.surfaces),
    "Signoff export did not contain a `surfaces` array.",
  );
  assert(
    Array.isArray(evidenceReport.evidenceItems),
    "Evidence report did not contain an `evidenceItems` array.",
  );

  await mkdir(outputDir, { recursive: true });

  const bundle = buildInteractionAuditHandoffBundle({
    signoffExport,
    evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, inputPath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    evidenceContext: {
      source: "bundle_input",
      sourceLabel: "Bundle evidence input",
      selectedPath: path.relative(projectRoot, evidencePath),
      requestPath: "",
      snapshotPath: "",
      evidenceItemCount: evidenceReport.evidenceItems.length,
      integrityOk: true,
      integrityState: "not_applicable",
      expectedSha256: "",
      actualSha256: "",
      expectedSizeBytes: 0,
      actualSizeBytes: 0,
    },
    generatedAt: new Date().toISOString(),
  });
  const bundleMarkdown = buildInteractionAuditHandoffBundleMarkdown(bundle);
  const markdownPath = path.join(outputDir, "interaction-audit-handoff-bundle.md");
  const jsonPath = path.join(outputDir, "interaction-audit-handoff-bundle.json");

  await writeFile(markdownPath, bundleMarkdown, "utf8");
  await writeFile(jsonPath, JSON.stringify(bundle, null, 2), "utf8");

  console.log(`interaction-audit: bundle written to ${path.relative(projectRoot, outputDir)}`);
  console.log(
    `interaction-audit: ready=${bundle.summary.readyForSignoff ? "yes" : "no"} follow_up=${bundle.summary.followUpSurfaceCount} not_reviewed=${bundle.summary.notReviewedSurfaceCount} pending=${bundle.summary.pendingManualCheckCount} / ${bundle.summary.totalManualCheckCount}`,
  );
  console.log(
    `interaction-audit: markdown=${path.relative(projectRoot, markdownPath)} json=${path.relative(projectRoot, jsonPath)}`,
  );
}

void run().catch((error) => {
  console.error("interaction-audit: failed to build handoff bundle");
  console.error(error);
  process.exitCode = 1;
});
