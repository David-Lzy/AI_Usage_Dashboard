import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase215-active-session-page-binding-review",
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
    packageJson.scripts["phase215:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase215-active-session-page-binding-review.mjs",
    "package.json is missing the expected phase215:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/provider-sources.ts",
      markers: [
        "doesUrlMatchRouteHint",
        "doesUrlMatchRouteHints",
        "routeHint.includes(\"*\")",
      ],
    },
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: [
        "handleAttachActiveSessionPage",
        "chrome.tabs.query",
        "currentWindow: true",
        "doesUrlMatchRouteHints(activeTab.url, sessionPagePlan.routeHints)",
        "app:set-provider-page-binding",
        "app:request-refresh",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "onAttachActiveSessionPage",
        "settingsCopy.sources.useActivePage",
      ],
    },
    {
      relativePath: "src/shared/localized-copy.ts",
      markers: ["useActivePage: \"Use current page\"", "useActivePage: \"使用当前页面\""],
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
      relativePath: "src/shared/provider-sources.test.ts",
      markers: [
        "matches active-tab URLs against concrete and wildcard session-page route hints",
        "rejects non-provider active-tab URLs",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_215_Active_Session_Page_Binding.md",
      markers: [
        "Phase 215",
        "Active Session Page Binding",
        "npm run phase215:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/215_Phase_Active_Session_Page_Binding.md",
      markers: [
        "Phase 215",
        "completed and archived on 2026-04-29",
        "Use current page",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "215_Phase_Active_Session_Page_Binding.md",
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
    "active-session-page-binding-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase215: active session-page binding verified");
  console.log(`phase215: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase215: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase215: active session-page binding review failed");
  console.error(error);
  process.exitCode = 1;
});
