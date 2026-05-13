import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase232-codex-automatic-managed-page-sync-review",
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
    packageJson.scripts["phase232:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase232-codex-automatic-managed-page-sync-review.mjs",
    "package.json is missing the expected phase232:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/background/alarms.ts",
      markers: [
        "LEGACY_PERIODIC_SYNC_ALARMS",
        "PERIODIC_SYNC_ALARM = \"ai-usage-dashboard.periodic-sync.v2\"",
        "INITIAL_PERIODIC_SYNC_DELAY_MINUTES = 1",
        "clearLegacyPeriodicSyncAlarms",
        "delayInMinutes: INITIAL_PERIODIC_SYNC_DELAY_MINUTES",
      ],
    },
    {
      relativePath: "src/providers/codex/adapter.ts",
      markers: [
        "shouldOpenCodexPageWhenMissing",
        "trigger === \"bootstrap\"",
        "provider.warningDiagnostic?.code === \"page_session.logged_out\"",
        "hasPageBindingFingerprint(setting.pageBinding)",
        "setting.sourcePreference === \"auto\"",
        "setting.sourcePreference === \"session_page\"",
      ],
    },
    {
      relativePath: "src/providers/codex/personal-page-capture.ts",
      markers: [
        "https://chatgpt.com/codex/cloud/settings/analytics",
        "active: false",
        "closeOnUnmatched: true",
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
      relativePath: "src/background/alarms.test.ts",
      markers: [
        "creates the periodic sync alarm with a short initial delay",
        "normalizes too-small settings to Chrome's supported fifteen-minute period",
      ],
    },
    {
      relativePath: "src/providers/codex/adapter.test.ts",
      markers: [
        "enables managed Codex page opening on alarm before a page binding exists",
        "does not auto-open the Codex page repeatedly on alarms after logged-out detection",
      ],
    },
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_232_Codex_Automatic_Managed_Page_Sync.md",
      markers: [
        "Phase 232",
        "Codex Automatic Managed Page Sync",
        "npm run phase232:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/232_Phase_Codex_Automatic_Managed_Page_Sync.md",
      markers: [
        "Phase 232",
        "completed and archived on 2026-05-02",
        "inactive managed tab",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "232_Phase_Codex_Automatic_Managed_Page_Sync.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 232",
        "automatic Codex managed-page sync",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 232",
        "automatic Codex managed-page sync",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "automatic Codex managed-page sync",
        "not a fully hidden offscreen scrape",
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
    "codex-automatic-managed-page-sync-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase232: Codex automatic managed-page sync verified");
  console.log(`phase232: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase232: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "phase232 review failed",
  );
  process.exit(1);
});
