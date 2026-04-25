import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase207-codex-merged-window-label-review",
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
    packageJson.scripts["phase207:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase207-codex-merged-window-label-review.mjs",
    "package.json is missing the expected phase207:review script.",
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
    "parseInlineWindowPercent",
    "stripInlineWindowRuntimeValues",
    "const label = stripInlineWindowRuntimeValues(snippet) || snippet",
    "remainingPercent === null ? null : Math.max(0, 100 - remainingPercent)",
    "resetAt: resetText ? normalizeResetAt(resetText) : null",
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
    "parses Codex window labels when label and remaining percent are merged",
    "5 小时使用限额 100% 剩余",
    "每周使用限额 32% 剩余 重置时间",
    "GPT-5.3-Codex-Spark 每周使用限额 100％ 剩余",
    "label: \"每周使用限额\"",
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
        "Doc/testing/Phase_207_Codex_Merged_Window_Label_Parser.md",
      markers: [
        "Phase 207",
        "Codex Merged Window Label Parser",
        "npm run phase207:review",
        "label and remaining percent",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/207_Phase_Codex_Merged_Window_Label_Parser.md",
      markers: [
        "Phase 207",
        "completed and archived on 2026-04-25",
        "merged window-label snippets",
        "visible-window truth boundary",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "207_Phase_Codex_Merged_Window_Label_Parser.md",
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
    "codex-merged-window-label-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase207: codex merged window label parser verified");
  console.log(`phase207: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase207: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase207: codex merged window label review failed");
  console.error(error);
  process.exitCode = 1;
});
