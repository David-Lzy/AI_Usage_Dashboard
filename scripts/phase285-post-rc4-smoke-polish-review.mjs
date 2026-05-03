import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase285-post-rc4-smoke-polish-review");

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
    packageJson.scripts["phase285:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase285-post-rc4-smoke-polish-review.mjs",
    "package.json is missing the expected phase285:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/host-access-request.ts",
      markers: [
        "findHostAccessRefreshCandidate",
        "hasDirectHostAccessRequest",
        "requestHostAccessForProvider",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-actions.ts",
      markers: [
        "findHostAccessRefreshCandidate",
        "requestHostAccessForProvider",
        "refresh cannot read the provider page yet",
      ],
    },
    {
      relativePath: "src/popup/PopupApp.tsx",
      markers: [
        "findHostAccessRefreshCandidate",
        "requestHostAccessForProvider",
        "Reopen the popup and refresh again after granting host access",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsNavigation.tsx",
      markers: ["createPortal", "document.body"],
    },
    {
      relativePath: "src/sidepanel/theme/provider-card.css",
      markers: [
        "usage-window-progress-list--circle",
        "min-height: 148px",
        "white-space: nowrap",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/settings-navigation.css",
      markers: [".settings-shell .top-app-bar__bottom", "padding-inline-start"],
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

async function verifyTestMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/host-access-request.test.ts",
      markers: [
        "returns the requested provider when refresh targets one missing grant",
        "does not pick a refresh-all candidate when multiple grants are missing",
      ],
    },
    {
      relativePath: "src/sidepanel/standard-app-actions.test.ts",
      markers: [
        "requests missing host access before refreshing one provider",
        "stops refresh when the host access request is denied",
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

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/TODOs/Archive/285_Phase_Post_RC4_Smoke_Polish_And_Host_Access_Refresh.md",
      markers: [
        "Phase 285",
        "post-rc4 smoke polish",
        "completed and archived on 2026-05-03",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_285_Post_RC4_Smoke_Polish_And_Host_Access_Refresh.md",
      markers: [
        "Phase 285",
        "npm run phase285:review",
        "RDP smoke check",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "285_Phase_Post_RC4_Smoke_Polish_And_Host_Access_Refresh.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 285", "post-rc4 smoke polish"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 285", "host access refresh prompt"],
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
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyTestMarkers()),
    ...(await verifyDocsMarkers()),
  ];
  const report = { markers: markerResults };
  const reportPath = path.join(artifactDir, "post-rc4-smoke-polish-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 285 post-rc4 smoke polish review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
