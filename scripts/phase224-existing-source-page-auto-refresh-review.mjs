import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase224-existing-source-page-auto-refresh-review",
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
    packageJson.scripts["phase224:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase224-existing-source-page-auto-refresh-review.mjs",
    "package.json is missing the expected phase224:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/source-page-recovery.ts",
      markers: [
        "SourcePageRecoveryTarget",
        "shouldRefreshAfterSourcePageRecovery",
        'target === "existing-tab"',
      ],
    },
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: [
        "shouldRefreshAfterSourcePageRecovery",
        'shouldRefreshAfterSourcePageRecovery("existing-tab")',
        'type: "app:request-refresh"',
        "The binding was saved and the provider was refreshed immediately.",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "bindingResponse.ok",
        'shouldRefreshAfterSourcePageRecovery("existing-tab")',
        'type: "app:request-refresh"',
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
      relativePath: "src/shared/source-page-recovery.test.ts",
      markers: [
        "refreshes immediately when recovery reuses an existing matching tab",
        "waits for manual refresh when recovery opens a new source page",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_224_Existing_Source_Page_Auto_Refresh.md",
      markers: [
        "Phase 224",
        "Existing Source Page Auto Refresh",
        "npm run phase224:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/224_Phase_Existing_Source_Page_Auto_Refresh.md",
      markers: [
        "Phase 224",
        "completed and archived on 2026-04-29",
        "existing source-page recovery",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "224_Phase_Existing_Source_Page_Auto_Refresh.md",
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
    "existing-source-page-auto-refresh-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase224: existing source page auto refresh verified");
  console.log(`phase224: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase224: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase224: existing source page auto refresh review failed");
  console.error(error);
  process.exitCode = 1;
});
