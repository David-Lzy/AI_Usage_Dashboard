import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase206-codex-inline-remaining-percent-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readProjectFile(relativePath));
}

function verifyMarkers(fileContent, relativePath, markers) {
  for (const marker of markers) {
    assert(
      fileContent.includes(marker),
      `${relativePath} is missing marker: ${marker}`,
    );
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase206:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase206-codex-inline-remaining-percent-review.mjs",
    "package.json is missing the expected phase206:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCodexParser() {
  const relativePath = "src/providers/codex/personal-page-parser.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "STANDALONE_PERCENT_PATTERN",
    "INLINE_PERCENT_PATTERN",
    "parsePercentValue",
    "REMAINING_MARKER_PATTERN.test(normalizedValue)",
    "parsePercent(snippet)",
  ];

  verifyMarkers(fileContent, relativePath, markers);

  return {
    scope: relativePath,
    markers: markers.length,
  };
}

async function verifyCodexParserTests() {
  const relativePath = "src/providers/codex/personal-page-parser.test.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "parses inline remaining percentage snippets from merged Codex DOM text",
    "100% 剩余",
    "32% remaining",
    "100％ 剩余",
    "余额额度 0",
  ];

  verifyMarkers(fileContent, relativePath, markers);

  return {
    scope: relativePath,
    markers: markers.length,
  };
}

async function verifyDocs() {
  const docExpectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_206_Codex_Inline_Remaining_Percent_Parser.md",
      markers: [
        "Phase 206",
        "Codex Inline Remaining Percent Parser",
        "npm run phase206:review",
        "merged DOM text",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/206_Phase_Codex_Inline_Remaining_Percent_Parser.md",
      markers: [
        "Phase 206",
        "completed and archived on 2026-04-25",
        "inline remaining percentages",
        "full-width percent",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "206_Phase_Codex_Inline_Remaining_Percent_Parser.md",
        "latest completed slice",
      ],
    },
  ];
  const results = [];

  for (const expectation of docExpectations) {
    const fileContent = await readProjectFile(expectation.relativePath);

    verifyMarkers(
      fileContent,
      expectation.relativePath,
      expectation.markers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length,
    });
  }

  return results;
}

async function runReview() {
  const results = [
    await verifyPackageScript(),
    await verifyCodexParser(),
    await verifyCodexParserTests(),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "codex-inline-remaining-percent-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase206: codex inline remaining percent parser verified");
  console.log(`phase206: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase206: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase206: codex inline remaining percent review failed");
  console.error(error);
  process.exitCode = 1;
});
