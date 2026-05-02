import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase233-codex-hydration-retry-review",
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
    packageJson.scripts["phase233:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase233-codex-hydration-retry-review.mjs",
    "package.json is missing the expected phase233:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/providers/codex/personal-page-client.ts",
      markers: [
        "DEFAULT_HYDRATION_RETRY_ATTEMPTS",
        "DEFAULT_HYDRATION_RETRY_DELAY_MS",
        "shouldRetryHydratingCodexRoute",
        "result.status === \"route_drift\"",
        "hydrationRetryAttempts",
        "hydrationRetryDelayMs",
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
      relativePath: "src/providers/codex/personal-page-client.test.ts",
      markers: [
        "retries a newly matched Codex route while the page hydrates usage windows",
        "Usage limits loading",
      ],
    },
    {
      relativePath: "Doc/testing/Phase_233_Codex_Hydration_Retry.md",
      markers: [
        "Phase 233",
        "Codex Hydration Retry",
        "npm run phase233:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/233_Phase_Codex_Hydration_Retry.md",
      markers: [
        "Phase 233",
        "completed and archived on 2026-05-03",
        "hydration race",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "233_Phase_Codex_Hydration_Retry.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 233",
        "Codex hydration retry",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 233",
        "Codex hydration retry",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "Codex hydration retry",
        "matched route hydrates usage windows",
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
    "codex-hydration-retry-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase233: Codex hydration retry verified");
  console.log(`phase233: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase233: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "phase233 review failed",
  );
  process.exit(1);
});
