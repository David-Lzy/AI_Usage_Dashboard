import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const expectedPackageVersion = "0.1.0-rc.8";
const expectedManifestVersion = "0.1.0.8";
const archiveRelativePath =
  "release/ai-usage-dashboard-0.1.0-rc.8.zip";
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase289-settings-topbar-rc8-review",
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

async function hashFile(relativePath) {
  const buffer = await readFile(path.join(projectRoot, relativePath));

  return createHash("sha256").update(buffer).digest("hex");
}

async function verifyVersionState() {
  const packageJson = await readJson("package.json");
  const packageLockJson = await readJson("package-lock.json");
  const sourceManifest = await readJson("src/manifest.json");
  const distManifest = await readJson("dist/manifest.json");
  const archiveStats = await stat(path.join(projectRoot, archiveRelativePath));

  assert(
    packageJson.version === expectedPackageVersion,
    `package.json version must be ${expectedPackageVersion}.`,
  );
  assert(
    packageLockJson.version === expectedPackageVersion,
    `package-lock.json version must be ${expectedPackageVersion}.`,
  );
  assert(
    packageLockJson.packages?.[""]?.version === expectedPackageVersion,
    `package-lock root package version must be ${expectedPackageVersion}.`,
  );
  assert(
    sourceManifest.version === expectedManifestVersion,
    `src/manifest.json version must be ${expectedManifestVersion}.`,
  );
  assert(
    sourceManifest.version_name === expectedPackageVersion,
    `src/manifest.json version_name must be ${expectedPackageVersion}.`,
  );
  assert(
    distManifest.version === expectedManifestVersion,
    `dist/manifest.json version must be ${expectedManifestVersion}.`,
  );
  assert(
    distManifest.version_name === expectedPackageVersion,
    `dist/manifest.json version_name must be ${expectedPackageVersion}.`,
  );
  assert(
    archiveStats.size > 0,
    `${archiveRelativePath} must exist and be non-empty.`,
  );

  return {
    scope: "version-state",
    markers: 8,
    archiveSizeBytes: archiveStats.size,
  };
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase289:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase289-settings-topbar-rc8-review.mjs",
    "package.json is missing the expected phase289:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyCssMarkers() {
  const css = await readProjectFile("src/sidepanel/theme/settings-navigation.css");

  verifyMarkers(css, "src/sidepanel/theme/settings-navigation.css", [
    ".settings-shell .top-app-bar {",
    "grid-template-columns: minmax(180px, max-content) minmax(0, 1fr) auto",
    ".settings-shell .top-app-bar__main",
    "display: contents",
    ".settings-shell .top-app-bar__bottom",
    "grid-column: 2",
    "@media (max-width: 900px)",
    "justify-content: center",
  ]);

  return {
    scope: "src/sidepanel/theme/settings-navigation.css",
    markers: 8,
  };
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "README.md",
      markers: [
        expectedPackageVersion,
        expectedManifestVersion,
        archiveRelativePath,
        "Phase 289 Settings top-bar adaptive layout",
      ],
    },
    {
      relativePath: "Doc/Release_Packaging_Guide.md",
      markers: [
        expectedPackageVersion,
        expectedManifestVersion,
        archiveRelativePath,
        "Phase 289 Settings top-bar adaptive layout",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 289",
        expectedPackageVersion,
        "Provider closure waits on accounts",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 289",
        expectedPackageVersion,
        "provider closure waits on available accounts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "289_Phase_Settings_Topbar_Adaptive_Layout_And_RC8_Packaging.md",
        "latest completed slice",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/289_Phase_Settings_Topbar_Adaptive_Layout_And_RC8_Packaging.md",
      markers: [
        "Phase 289",
        expectedPackageVersion,
        archiveRelativePath,
        "completed and archived on 2026-05-04",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_289_Settings_Topbar_Adaptive_Layout_And_RC8_Packaging.md",
      markers: [
        "Phase 289",
        expectedPackageVersion,
        archiveRelativePath,
        "npm run phase289:review",
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
  await mkdir(artifactDir, { recursive: true });

  const archiveSha256 = await hashFile(archiveRelativePath);
  const markerResults = [
    await verifyVersionState(),
    await verifyPackageScript(),
    await verifyCssMarkers(),
    ...(await verifyDocsMarkers()),
  ];
  const report = {
    packageVersion: expectedPackageVersion,
    manifestVersion: expectedManifestVersion,
    archive: archiveRelativePath,
    sha256: archiveSha256,
    markers: markerResults,
  };
  const reportPath = path.join(artifactDir, "settings-topbar-rc8-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 289 Settings top-bar RC8 review passed.");
  console.log(`- package: ${expectedPackageVersion}`);
  console.log(`- manifest: ${expectedManifestVersion}`);
  console.log(`- archive: ${archiveRelativePath}`);
  console.log(`- sha256: ${archiveSha256}`);
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
