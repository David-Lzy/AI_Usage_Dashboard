import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase234-action-badge-quota-selection-review",
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
    packageJson.scripts["phase234:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase234-action-badge-quota-selection-review.mjs",
    "package.json is missing the expected phase234:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/action-badge-preferences.ts",
      markers: [
        "buildActionBadgeQuotaCandidates",
        "buildActionBadgeSelectOptions",
        "getEffectiveActionBadgeSelection",
        "ACTION_BADGE_ATTENTION_SELECTION",
      ],
    },
    {
      relativePath: "src/background/action-badge.ts",
      markers: [
        "buildQuotaBadgeModel",
        "formatQuotaBadgeText",
        "Selected quota badge source is no longer available.",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "settings.preferences.action_badge_label",
        "action-badge-selection",
        "onActionBadgeSelectionChange",
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
      relativePath: "src/shared/action-badge-preferences.test.ts",
      markers: [
        "builds quota candidates only from visible providers with remaining data",
        "falls back to attention when a stored quota selection is no longer available",
      ],
    },
    {
      relativePath: "src/background/action-badge.test.ts",
      markers: [
        "shows a selected quota source when the badge is configured for remaining usage",
        "Weekly usage window",
      ],
    },
    {
      relativePath: "Doc/testing/Phase_234_Action_Badge_Quota_Selection.md",
      markers: [
        "Phase 234",
        "Action Badge Quota Selection",
        "npm run phase234:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/234_Phase_Action_Badge_Quota_Selection.md",
      markers: [
        "Phase 234",
        "completed and archived on 2026-05-03",
        "dynamic quota candidates",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "234_Phase_Action_Badge_Quota_Selection.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 234",
        "action badge quota selection",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 234",
        "action badge quota selection",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "toolbar badge can now be configured",
        "dynamic quota candidates",
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
    "action-badge-quota-selection-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase234: Action badge quota selection verified");
  console.log(`phase234: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase234: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "phase234 review failed",
  );
  process.exit(1);
});
