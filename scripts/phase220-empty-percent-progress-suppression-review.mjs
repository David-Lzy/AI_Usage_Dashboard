import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase220-empty-percent-progress-suppression-review",
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
    packageJson.scripts["phase220:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase220-empty-percent-progress-suppression-review.mjs",
    "package.json is missing the expected phase220:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/usage-progress-visibility.ts",
      markers: [
        "shouldShowSingleUsageProgress",
        'provider.quotaUnit !== "percent"',
        "provider.total !== null",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.tsx",
      markers: [
        "shouldShowSingleUsageProgress(provider)",
        "showSingleUsageProgress",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/ProviderDetailPage.tsx",
      markers: [
        "shouldShowSingleUsageProgress(provider)",
        "showSingleUsageProgress",
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

async function verifyTestsAndDocs() {
  const expectations = [
    {
      relativePath: "src/sidepanel/usage-progress-visibility.test.ts",
      markers: [
        "hides empty percent progress",
        "keeps documented non-percent totals visible",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.test.tsx",
      markers: [
        "does not render empty percent progress",
        'not.toContain(\'role="progressbar"\')',
        "rolling percent",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_220_Empty_Percent_Progress_Suppression.md",
      markers: [
        "Phase 220",
        "Empty Percent Progress Suppression",
        "npm run phase220:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/220_Phase_Empty_Percent_Progress_Suppression.md",
      markers: [
        "Phase 220",
        "completed and archived on 2026-04-29",
        "empty percent progress",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "220_Phase_Empty_Percent_Progress_Suppression.md",
        "latest completed slice",
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

async function runReview() {
  const results = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyTestsAndDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "empty-percent-progress-suppression-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase220: empty percent progress suppression verified");
  console.log(`phase220: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase220: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase220: empty percent progress suppression review failed");
  console.error(error);
  process.exitCode = 1;
});
