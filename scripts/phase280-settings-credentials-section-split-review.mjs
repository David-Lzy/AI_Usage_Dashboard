import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase280-settings-credentials-section-split-review",
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
    packageJson.scripts["phase280:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase280-settings-credentials-section-split-review.mjs",
    "package.json is missing the expected phase280:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/SettingsSections.tsx",
      markers: [
        "SettingsCredentialsSection",
        "CredentialProviderSection",
        "SettingsOverviewSection",
        "SettingsPermissionsSection",
      ],
      forbiddenMarkers: [
        "type FormEvent",
        "data-credential-provider-id",
        "credential-form",
        "labels.codexTitle",
        "ApiKeyProviderId",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsCredentialsSection.tsx",
      markers: [
        "export function SettingsCredentialsSection",
        "export type CredentialProviderSection",
        "data-credential-provider-id",
        "credential-form",
        "labels.codexTitle",
        "onSaveCodexConfig",
      ],
    },
    {
      relativePath:
        "src/sidepanel/components/SettingsCredentialsSection.test.tsx",
      markers: [
        "SettingsCredentialsSection",
        "data-credential-provider-id",
        "Save config",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSections.test.tsx",
      markers: [
        "SettingsOverviewSection",
        "SettingsVisibilitySection",
        "SettingsPermissionsSection",
      ],
      forbiddenMarkers: [
        "SettingsCredentialsSection",
        "data-credential-provider-id",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "SettingsCredentialsSection",
        "handleProviderApiKeyInputChange",
        "settingsCopy.credentials",
      ],
      forbiddenMarkers: ["data-credential-provider-id", "credential-form"],
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_280_Settings_Credentials_Section_Split.md",
      markers: [
        "Phase 280",
        "Settings Credentials Section Split",
        "npm run phase280:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/280_Phase_Settings_Credentials_Section_Split.md",
      markers: [
        "Phase 280",
        "completed and archived on 2026-05-03",
        "SettingsCredentialsSection.tsx",
        "SettingsSections.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "280_Phase_Settings_Credentials_Section_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 280", "Settings credentials section split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 280", "Settings credentials section split"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings credential card rendering now lives in"],
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
    "settings-credentials-section-split-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Phase 280 Settings credentials section split review passed.");
  for (const result of markerResults) {
    console.log(`- ${result.scope}: ${result.markers} markers`);
  }
  console.log(`- report: ${path.relative(projectRoot, reportPath)}`);
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
