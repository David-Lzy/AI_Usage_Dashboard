import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase210-surface-progress-style-preferences-review",
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
    packageJson.scripts["phase210:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase210-surface-progress-style-preferences-review.mjs",
    "package.json is missing the expected phase210:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/providers/types.ts",
      markers: [
        "export type ProgressDisplayStyle = \"line\" | \"circle\"",
        "popupProgressStyle: ProgressDisplayStyle",
        "sidebarProgressStyle: ProgressDisplayStyle",
        "fullPageProgressStyle: ProgressDisplayStyle",
      ],
    },
    {
      relativePath: "src/shared/progress-display.ts",
      markers: [
        "DEFAULT_POPUP_PROGRESS_STYLE",
        "DEFAULT_SIDEBAR_PROGRESS_STYLE",
        "DEFAULT_FULL_PAGE_PROGRESS_STYLE",
        "normalizeProgressDisplayStyle",
      ],
    },
    {
      relativePath: "src/sidepanel/components/UsageProgress.tsx",
      markers: [
        "displayStyle?: ProgressDisplayStyle",
        "usage-progress--circle",
        "usage-progress__ring",
        "--usage-progress-percent",
      ],
    },
    {
      relativePath: "src/sidepanel/components/UsageWindowProgressList.tsx",
      markers: [
        "displayStyle?: ProgressDisplayStyle",
        "usage-window-progress-list--${displayStyle}",
        "displayStyle={displayStyle}",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "popup-shell--quota-first",
        "renderPopupProviderProgress",
        "popupProgressStyle",
        "popup-provider-card--quota-first",
      ],
    },
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: [
        "const progressDisplayStyle = isFullPageSurface",
        "appState.settings.fullPageProgressStyle",
        "appState.settings.sidebarProgressStyle",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "PROGRESS_DISPLAY_STYLE_OPTIONS",
        "onPopupProgressStyleChange",
        "onSidebarProgressStyleChange",
        "onFullPageProgressStyleChange",
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
      relativePath: "src/sidepanel/components/UsageProgress.test.tsx",
      markers: [
        "renders circular progress semantics when requested",
        "usage-progress__ring--warning",
      ],
    },
    {
      relativePath: "src/sidepanel/components/UsageWindowProgressList.test.tsx",
      markers: [
        "renders every visible usage window as circular progress when requested",
        "usage-window-progress-list--circle",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_210_Surface_Progress_Style_Preferences.md",
      markers: [
        "Phase 210",
        "Surface Progress Style Preferences",
        "npm run phase210:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/210_Phase_Surface_Progress_Style_Preferences.md",
      markers: [
        "Phase 210",
        "completed and archived on 2026-04-26",
        "popup quota-first",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "210_Phase_Surface_Progress_Style_Preferences.md",
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
    "surface-progress-style-preferences-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase210: surface progress style preferences verified");
  console.log(`phase210: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase210: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase210: surface progress style preferences review failed");
  console.error(error);
  process.exitCode = 1;
});
