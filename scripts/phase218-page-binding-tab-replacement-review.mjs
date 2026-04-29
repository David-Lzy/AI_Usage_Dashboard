import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase218-page-binding-tab-replacement-review",
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
    packageJson.scripts["phase218:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase218-page-binding-tab-replacement-review.mjs",
    "package.json is missing the expected phase218:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/background/page-binding-lifecycle.ts",
      markers: [
        "reconcilePageBindingsForReplacedTab",
        "reconcileProviderBindingsForReplacedTab",
        "moveProviderBindingToReplacementTab",
        "replacementTab.tabId",
        "markProviderBindingStale(provider)",
      ],
    },
    {
      relativePath: "src/background/service-worker.ts",
      markers: [
        "chrome.tabs.onReplaced.addListener",
        "reconcileProviderBindingsForReplacedTab",
        ".get(addedTabId)",
        "syncActionBadgeFromState(state)",
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
      relativePath: "src/background/page-binding-lifecycle.test.ts",
      markers: [
        "moves a binding to the replacement tab",
        "marks a binding stale when Chrome replaces the bound tab",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_218_Page_Binding_Tab_Replacement.md",
      markers: [
        "Phase 218",
        "Page Binding Tab Replacement",
        "npm run phase218:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/218_Phase_Page_Binding_Tab_Replacement.md",
      markers: [
        "Phase 218",
        "completed and archived on 2026-04-29",
        "tabs.onReplaced",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "218_Phase_Page_Binding_Tab_Replacement.md",
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
    "page-binding-tab-replacement-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase218: page-binding tab replacement verified");
  console.log(`phase218: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase218: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase218: page-binding tab replacement review failed");
  console.error(error);
  process.exitCode = 1;
});
