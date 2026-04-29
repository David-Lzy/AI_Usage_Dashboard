import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase221-source-page-recovery-action-review",
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
    packageJson.scripts["phase221:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase221-source-page-recovery-action-review.mjs",
    "package.json is missing the expected phase221:review script.",
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
      markers: ["getOpenableRouteHint", '!normalizedRoute.includes("*")'],
    },
    {
      relativePath: "src/sidepanel/view-models.ts",
      markers: ["openableSessionPageUrl", "getOpenableRouteHint"],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.tsx",
      markers: [
        "data-provider-card-open-source-page",
        "Source page",
        "onOpenSourcePage",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/ProviderDetailPage.tsx",
      markers: [
        "data-provider-detail-open-source-page",
        "sourcePageRecovery",
        "onOpenSourcePage",
      ],
    },
    {
      relativePath: "src/sidepanel/App.tsx",
      markers: ["onOpenSourcePage={handleOpenSessionPage}"],
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
        "derives an openable session-page route",
        "https://cursor.com/*/dashboard/usage*",
      ],
    },
    {
      relativePath: "src/sidepanel/view-models.test.ts",
      markers: [
        "openableSessionPageUrl",
        "https://chatgpt.com/codex/cloud/settings/analytics",
      ],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.test.tsx",
      markers: [
        "source-page recovery action",
        "data-provider-card-open-source-page",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/ProviderDetailPage.test.tsx",
      markers: [
        "source-page recovery action",
        "data-provider-detail-open-source-page",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_221_Source_Page_Recovery_Action.md",
      markers: [
        "Phase 221",
        "Source Page Recovery Action",
        "npm run phase221:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/221_Phase_Source_Page_Recovery_Action.md",
      markers: [
        "Phase 221",
        "completed and archived on 2026-04-29",
        "source-page recovery",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "221_Phase_Source_Page_Recovery_Action.md",
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
    "source-page-recovery-action-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase221: source-page recovery action verified");
  console.log(`phase221: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase221: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase221: source-page recovery action review failed");
  console.error(error);
  process.exitCode = 1;
});
