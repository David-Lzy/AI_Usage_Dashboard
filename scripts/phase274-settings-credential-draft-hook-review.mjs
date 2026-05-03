import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase274-settings-credential-draft-hook-review",
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
    packageJson.scripts["phase274:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase274-settings-credential-draft-hook-review.mjs",
    "package.json is missing the expected phase274:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "useSettingsCredentialDrafts",
        "handleSaveProviderApiKey",
        "handleClearCodexConfig",
        "themeCustomSeedDraft",
      ],
      forbiddenMarkers: [
        "const [credentialInputs, setCredentialInputs]",
        "const [codexAnalyticsApiKeyInput, setCodexAnalyticsApiKeyInput]",
        "const [codexWorkspaceIdInput, setCodexWorkspaceIdInput]",
        "function handleSaveProviderApiKey",
        "function handleSaveCodexConfig",
        "function handleProviderApiKeyInputChange",
      ],
    },
    {
      relativePath: "src/sidepanel/use-settings-credential-drafts.ts",
      markers: [
        "export function useSettingsCredentialDrafts",
        "const [credentialInputs, setCredentialInputs]",
        "function handleSaveProviderApiKey",
        "function handleSaveCodexConfig",
        "function handleProviderApiKeyInputChange",
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
    for (const forbiddenMarker of expectation.forbiddenMarkers ?? []) {
      assert(
        !fileContent.includes(forbiddenMarker),
        `${expectation.relativePath} still contains forbidden inline marker: ${forbiddenMarker}`,
      );
    }
    results.push({
      scope: expectation.relativePath,
      markers:
        expectation.markers.length + (expectation.forbiddenMarkers?.length ?? 0),
    });
  }

  return results;
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_274_Settings_Credential_Draft_Hook.md",
      markers: [
        "Phase 274",
        "Settings Credential Draft Hook",
        "npm run phase274:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/274_Phase_Settings_Credential_Draft_Hook.md",
      markers: [
        "Phase 274",
        "completed and archived on 2026-05-03",
        "use-settings-credential-drafts.ts",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "274_Phase_Settings_Credential_Draft_Hook.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 274", "Settings credential draft hook"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 274", "Settings credential draft hook"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings credential draft state now lives in"],
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
    ...(await verifyDocsMarkers()),
  ];
  const report = { markers: markerResults };
  const reportPath = path.join(
    artifactDir,
    "settings-credential-draft-hook-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 274 Settings credential draft hook review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
