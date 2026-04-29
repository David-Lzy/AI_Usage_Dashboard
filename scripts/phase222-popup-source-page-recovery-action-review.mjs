import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase222-popup-source-page-recovery-action-review",
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
    packageJson.scripts["phase222:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase222-popup-source-page-recovery-action-review.mjs",
    "package.json is missing the expected phase222:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/popup/view-models.ts",
      markers: [
        'kind: "source-page"',
        "openSourcePageAction",
        "capture_unavailable",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "openProviderSourcePage",
        "getSessionPagePlan",
        'type: "app:set-provider-page-binding"',
      ],
    },
    {
      relativePath: "src/shared/localized-copy.ts",
      markers: ["openSourcePageAction", "打开来源页面"],
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
      relativePath: "src/popup/view-models.test.ts",
      markers: [
        "uses direct source-page recovery",
        'kind: "source-page"',
        "打开来源页面",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_222_Popup_Source_Page_Recovery_Action.md",
      markers: [
        "Phase 222",
        "Popup Source Page Recovery Action",
        "npm run phase222:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/222_Phase_Popup_Source_Page_Recovery_Action.md",
      markers: [
        "Phase 222",
        "completed and archived on 2026-04-29",
        "popup source-page recovery",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "222_Phase_Popup_Source_Page_Recovery_Action.md",
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
    "popup-source-page-recovery-action-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase222: popup source-page recovery action verified");
  console.log(`phase222: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase222: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase222: popup source-page recovery action review failed");
  console.error(error);
  process.exitCode = 1;
});
