import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase225-capture-unavailable-source-tab-reload-review",
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
    packageJson.scripts["phase225:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase225-capture-unavailable-source-tab-reload-review.mjs",
    "package.json is missing the expected phase225:review script.",
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
        "shouldReloadBeforeSourcePageRecoveryRefresh",
        'sourceStateKind === "capture_unavailable"',
        "reloadSourcePageTabBeforeRefresh",
        "chrome.tabs.reload(tabId)",
      ],
    },
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: [
        "shouldReloadBeforeRefresh",
        "reloadSourcePageTabBeforeRefresh(preferredTab.id)",
        "A matching source tab was reloaded",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "sourceStateKind?: SourcePageRecoverySourceState",
        "reloadSourcePageTabBeforeRefresh(preferredTab.id)",
        "await chrome.tabs.update(preferredTab.id, { active: true });",
      ],
    },
    {
      relativePath: "src/popup/view-models.ts",
      markers: [
        "sourceStateKind?: ProviderViewModel",
        "sourceStateKind: provider.currentSourceStateKind",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.tsx",
      markers: [
        "sourceStateKind: ProviderViewModel",
        "provider.currentSourceStateKind",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/ProviderDetailPage.tsx",
      markers: [
        "sourceStateKind: ProviderViewModel",
        "provider.currentSourceStateKind",
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
        "reloads an existing source tab before refresh for capture-unavailable recovery",
        "does not reload newly opened or non-capture-unavailable source pages",
      ],
    },
    {
      relativePath: "src/popup/view-models.test.ts",
      markers: ['sourceStateKind: "capture_unavailable"'],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_225_Capture_Unavailable_Source_Tab_Reload.md",
      markers: [
        "Phase 225",
        "Capture Unavailable Source Tab Reload",
        "npm run phase225:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/225_Phase_Capture_Unavailable_Source_Tab_Reload.md",
      markers: [
        "Phase 225",
        "completed and archived on 2026-04-29",
        "capture-unavailable source-tab reload",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "225_Phase_Capture_Unavailable_Source_Tab_Reload.md",
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
    "capture-unavailable-source-tab-reload-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase225: capture-unavailable source tab reload verified");
  console.log(`phase225: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase225: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase225: capture-unavailable source tab reload review failed");
  console.error(error);
  process.exitCode = 1;
});
