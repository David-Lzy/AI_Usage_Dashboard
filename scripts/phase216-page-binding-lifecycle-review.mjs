import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase216-page-binding-lifecycle-review",
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
    packageJson.scripts["phase216:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase216-page-binding-lifecycle-review.mjs",
    "package.json is missing the expected phase216:review script.",
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
        "reconcilePageBindingsForRemovedTab",
        "reconcilePageBindingsForTabUrlChange",
        "markProviderBindingsStaleForRemovedTab",
        "markProviderBindingsStaleForTabUrlChange",
        "markPageBindingStale",
      ],
    },
    {
      relativePath: "src/background/service-worker.ts",
      markers: [
        "chrome.tabs.onRemoved.addListener",
        "chrome.tabs.onUpdated.addListener",
        "markProviderBindingsStaleForRemovedTab",
        "markProviderBindingsStaleForTabUrlChange",
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
        "marks a bound provider page stale when the bound tab closes",
        "marks a binding stale when the bound tab navigates away",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_216_Page_Binding_Lifecycle.md",
      markers: [
        "Phase 216",
        "Page Binding Lifecycle",
        "npm run phase216:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/216_Phase_Page_Binding_Lifecycle.md",
      markers: [
        "Phase 216",
        "completed and archived on 2026-04-29",
        "tabs.onRemoved",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "216_Phase_Page_Binding_Lifecycle.md",
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
    "page-binding-lifecycle-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase216: page binding lifecycle verified");
  console.log(`phase216: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase216: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase216: page binding lifecycle review failed");
  console.error(error);
  process.exitCode = 1;
});
