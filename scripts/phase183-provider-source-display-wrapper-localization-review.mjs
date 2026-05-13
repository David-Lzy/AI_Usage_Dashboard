import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase183-provider-source-display-wrapper-localization-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
}

async function readProjectFile(...segments) {
  return readFile(path.join(projectRoot, ...segments), "utf8");
}

const packageJson = await readJson("package.json");
assert(packageJson.scripts["phase183:review"], "package.json is missing phase183:review.");

const providerSources = await readProjectFile("src", "shared", "provider-sources.ts");
for (const requiredMarker of [
  "ProviderSourceDisplayCopy",
  "DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY",
  "currentRolloutStageLabel",
  "sessionPageRolloutStageLabel",
  "sessionPageFidelityTone",
  "sourceSelectionReason: provider.sourceSelectionReason",
  "sourceFallbackReason: provider.sourceFallbackReason",
  "warningReason ||",
  "formatAvailabilitySummary(currentPlan, copy)",
]) {
  assert(
    providerSources.includes(requiredMarker),
    `provider-sources.ts is missing localized wrapper/raw passthrough marker: ${requiredMarker}`,
  );
}

const localizedCopy = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "buildProviderSourceDisplayLocalizedCopy",
  "DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY",
  "官方 API",
  "会话页面",
  "已用：",
  "fieldAvailabilityLabels",
  "sourceFidelity",
]) {
  assert(
    localizedCopy.includes(requiredMarker),
    `localized-copy.ts is missing provider-source display copy marker: ${requiredMarker}`,
  );
}

for (const [relativePath, markers] of [
  [
    "src/sidepanel/App.tsx",
    [
      "buildProviderSourceDisplayLocalizedCopy(runtimeI18n)",
      "getVisibleProviders(",
      "getProviderViewModel(",
    ],
  ],
  [
    "src/popup/PopupApp.tsx",
    [
      "buildProviderSourceDisplayLocalizedCopy(runtimeI18n)",
      "buildPopupViewModel(",
    ],
  ],
  [
    "src/popup/view-models.ts",
    ["sourceDisplayCopy?: ProviderSourceDisplayCopy", "getVisibleProviders(state, sourceDisplayCopy)"],
  ],
  [
    "src/sidepanel/routes/SettingsPage.tsx",
    [
      "buildProviderSourceDisplayLocalizedCopy(i18n)",
      "settingsSourceCardLabels",
      "providerSourceDisplayCopy",
    ],
  ],
  [
    "src/sidepanel/settings-view-models.ts",
    ["sessionPageRolloutStageLabel", "sessionPageFidelityTone"],
  ],
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const marker of markers) {
    assert(
      fileContent.includes(marker),
      `${relativePath} is missing provider-source localization wiring marker: ${marker}`,
    );
  }
}

for (const relativePath of [
  "src/shared/provider-sources.test.ts",
  "src/shared/i18n.test.ts",
  "src/sidepanel/view-models.test.ts",
  "src/sidepanel/settings-view-models.test.ts",
]) {
  const fileContent = await readProjectFile(relativePath);
  assert(
    fileContent.includes("buildProviderSourceDisplayLocalizedCopy"),
    `${relativePath} is missing provider-source display localization coverage.`,
  );
}

for (const relativePath of [
  "Doc/I18n/I18n_Raw_Provider_Source_Truth_Policy.md",
  "Doc/I18n/I18n_String_Inventory_Baseline.md",
  "Doc/I18n/I18n_Message_ID_Contract.md",
  "Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
  "Doc/Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
  "Doc/Roadmap/00_Strategic_Directions_Index.md",
  "Doc/AI_Usage_Dashboard_TODOs.md",
  "Doc/TODOs/00_Phase_Index.md",
  "README.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  assert(
    fileContent.includes("Phase 183") ||
      fileContent.includes("provider-source display wrapper localization") ||
      fileContent.includes("provider-source display wrappers"),
    `${relativePath} is missing Phase 183 provider-source display wrapper localization reference.`,
  );
}

for (const relativePath of [
  "Doc/testing/Archive/phase-reports/100-199/Phase_183_Provider_Source_Display_Wrapper_Localization.md",
  "Doc/TODOs/Archive/by-phase/100-199/183_Phase_Provider_Source_Display_Wrapper_Localization.md",
]) {
  const fileContent = await readProjectFile(relativePath);
  for (const requiredMarker of [
    "Phase 183",
    "provider-source display wrapper localization",
    "raw provider source-truth",
    "npm run phase183:review",
  ]) {
    assert(
      fileContent.includes(requiredMarker),
      `${relativePath} is missing closeout marker: ${requiredMarker}`,
    );
  }
}

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "provider-source-display-wrapper-localization-review.json"),
  `${JSON.stringify(
    {
      localizedWrapperBuilder:
        "src/shared/localized-copy.ts#buildProviderSourceDisplayLocalizedCopy",
      displayCopyContract:
        "src/shared/provider-sources.ts#ProviderSourceDisplayCopy",
      protectedRawFields: [
        "ProviderSnapshot.warningReason",
        "ProviderSnapshot.sourceSelectionReason",
        "ProviderSnapshot.sourceFallbackReason",
        "ProviderSourcePlan.contractDetail",
        "ProviderSourcePlan.note",
        "ProviderSourcePlan.graduationGateLabel",
        "ProviderSourcePlan.graduationGateDetail",
      ],
      runtimeSurfaces: ["sidepanel", "popup", "settings source cards"],
    },
    null,
    2,
  )}\n`,
);

console.log("phase183: provider-source display wrapper localization verified");
