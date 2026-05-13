import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase230-background-session-page-refresh-review",
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
    packageJson.scripts["phase230:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase230-background-session-page-refresh-review.mjs",
    "package.json is missing the expected phase230:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/providers/page-session.ts",
      markers: [
        "PageSessionOpenWhenMissing",
        "openWhenMissing?: PageSessionOpenWhenMissing",
        "openMissingPageSessionTab",
        "closeOpenedPageSessionTab",
        "closeOnUnmatched",
        "active: openWhenMissing.active ?? false",
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-capture.ts",
      markers: [
        "openPageWhenMissing?: boolean",
        "route.routeKey === \"cloud_analytics\"",
        "https://chatgpt.com/codex/cloud/settings/analytics",
        "closeOnUnmatched: true",
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-client.ts",
      markers: [
        "openPageWhenMissing?: boolean",
        "openPageWhenMissing: options.openPageWhenMissing ?? false",
      ],
    },
    {
      relativePath: "src/providers/codex/adapter.ts",
      markers: [
        "shouldOpenCodexPageWhenMissing",
        "trigger === \"bootstrap\"",
        "hasPageBindingFingerprint(setting.pageBinding)",
        "provider.warningDiagnostic?.code === \"page_session.logged_out\"",
        "openPageWhenMissing: shouldOpenCodexPageWhenMissing",
      ],
    },
    {
      relativePath: "src/providers/registry.ts",
      markers: ["trigger: context.trigger"],
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
      relativePath: "src/providers/page-session.test.ts",
      markers: [
        "opens an inactive managed tab when configured and no candidate exists",
        "cleans up an auto-opened managed tab when the session is logged out",
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-capture.test.ts",
      markers: [
        "only auto-opens the preferred cloud analytics route when enabled",
      ],
    },
    {
      relativePath: "src/providers/codex/adapter.test.ts",
      markers: [
        "enables managed Codex page opening on alarm after a page binding exists",
        "does not auto-open the Codex page repeatedly on alarms after logged-out detection",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_230_Background_Session_Page_Refresh.md",
      markers: [
        "Phase 230",
        "Background Session Page Refresh",
        "npm run phase230:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/230_Phase_Background_Session_Page_Refresh.md",
      markers: [
        "Phase 230",
        "completed and archived on 2026-04-30",
        "managed-tab flow",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "230_Phase_Background_Session_Page_Refresh.md",
        "managed background session-page refresh",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 230",
        "managed source-tab refresh",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 230",
        "managed source-tab refresh",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "inactive managed tab",
        "previously bound analytics page",
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
    "background-session-page-refresh-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase230: background session-page refresh verified");
  console.log(`phase230: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase230: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase230: background session-page refresh review failed");
  console.error(error);
  process.exitCode = 1;
});
