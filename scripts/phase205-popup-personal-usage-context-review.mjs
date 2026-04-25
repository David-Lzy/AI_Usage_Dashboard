import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase205-popup-personal-usage-context-review",
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
    packageJson.scripts["phase205:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase205-popup-personal-usage-context-review.mjs",
    "package.json is missing the expected phase205:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyPopupViewModel() {
  const relativePath = "src/popup/view-models.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "buildPopupCompactUsageContextDetail",
    "getMostConstrainedUsageWindow",
    "formatPopupUsageWindowDetail",
    "formatPopupUsageBalanceDetail",
    "provider.usageSummary ??",
    "buildPopupFeaturedSecondaryDetail(provider, i18n)",
  ];

  verifyMarkers(fileContent, relativePath, markers);

  return {
    scope: relativePath,
    markers: markers.length,
  };
}

async function verifyPopupTests() {
  const relativePath = "src/popup/view-models.test.ts";
  const fileContent = await readProjectFile(relativePath);
  const markers = [
    "compresses structured personal usage context for popup provider cards",
    "keeps summary-only personal usage context visible in popup provider cards",
    "Weekly usage window: 32% remaining",
    "Flex credit balance: 0 credits",
    "Visible Cursor usage:",
  ];

  verifyMarkers(fileContent, relativePath, markers);

  return {
    scope: relativePath,
    markers: markers.length,
  };
}

async function verifyDocs() {
  const docExpectations = [
    {
      relativePath:
        "Doc/testing/Phase_205_Popup_Personal_Usage_Context_Compression.md",
      markers: [
        "Phase 205",
        "Popup Personal Usage Context Compression",
        "npm run phase205:review",
        "Dashboard and provider-detail surfaces keep the fuller usage context",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/205_Phase_Popup_Personal_Usage_Context_Compression.md",
      markers: [
        "Phase 205",
        "completed and archived on 2026-04-25",
        "most-constrained usage window",
        "summary-only Cursor personal context",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "205_Phase_Popup_Personal_Usage_Context_Compression.md",
        "latest completed slice",
      ],
    },
  ];
  const results = [];

  for (const expectation of docExpectations) {
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
    await verifyPopupViewModel(),
    await verifyPopupTests(),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "popup-personal-usage-context-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase205: popup personal usage context compression verified");
  console.log(`phase205: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase205: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase205: popup personal usage context review failed");
  console.error(error);
  process.exitCode = 1;
});
