import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase208-usage-window-progress-bars-review",
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
    packageJson.scripts["phase208:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase208-usage-window-progress-bars-review.mjs",
    "package.json is missing the expected phase208:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyProgressComponents() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/UsageProgress.tsx",
      markers: [
        "valueKind?: \"used\" | \"remaining\"",
        "usage-progress--${valueKind}",
        "`${roundedPercent}% remaining`",
        "aria-valuetext={progressValueText}",
      ],
    },
    {
      relativePath: "src/sidepanel/components/UsageWindowProgressList.tsx",
      markers: [
        "UsageWindowProgressList",
        "data-usage-window-progress-list",
        "getUsageWindowProgressTone",
        "valueKind=\"remaining\"",
        "windows.map((usageWindow)",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.tsx",
      markers: [
        "UsageWindowProgressList",
        "windows={provider.usageWindows}",
        "density=\"compact\"",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/ProviderDetailPage.tsx",
      markers: [
        "UsageWindowProgressList",
        "(provider.usageWindows?.length ?? 0) > 0",
        "windows={provider.usageWindows}",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        ".usage-progress--remaining .usage-progress__track--neutral",
        ".usage-window-progress-list",
        ".usage-window-progress-list__item",
      ],
    },
  ];
  const results = [];

  for (const expectation of expectations) {
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

async function verifyTests() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/UsageProgress.test.tsx",
      markers: [
        "renders remaining-mode progress semantics",
        "28% remaining",
        "usage-progress--remaining",
      ],
    },
    {
      relativePath: "src/sidepanel/components/UsageWindowProgressList.test.tsx",
      markers: [
        "renders every visible usage window as a remaining progress bar",
        "GPT-5.3-Codex-Spark 5 小时使用限额",
        "aria-valuenow=\"100\"",
      ],
    },
  ];
  const results = [];

  for (const expectation of expectations) {
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

async function verifyDocs() {
  const docExpectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_208_Usage_Window_Progress_Bars.md",
      markers: [
        "Phase 208",
        "Usage Window Progress Bars",
        "npm run phase208:review",
        "dashboard and provider detail",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/208_Phase_Usage_Window_Progress_Bars.md",
      markers: [
        "Phase 208",
        "completed and archived on 2026-04-25",
        "all visible usage windows",
        "popup remains compact",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "208_Phase_Usage_Window_Progress_Bars.md",
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
    ...(await verifyProgressComponents()),
    ...(await verifyTests()),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "usage-window-progress-bars-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase208: usage window progress bars verified");
  console.log(`phase208: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase208: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase208: usage window progress bars review failed");
  console.error(error);
  process.exitCode = 1;
});
