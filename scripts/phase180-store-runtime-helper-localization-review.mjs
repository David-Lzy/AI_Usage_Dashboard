import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase180-store-runtime-helper-localization-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(path.join(projectRoot, relativePath), "utf8"),
  );
}

async function readProjectFile(...segments) {
  return readFile(path.join(projectRoot, ...segments), "utf8");
}

const packageJson = await readJson("package.json");
assert(packageJson.scripts["phase180:review"], "package.json is missing phase180:review.");

const localizedCopySource = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "buildStoreWorkflowLocalizedCopy",
  "screenshotSeed",
  "nativePopupProbe",
  "Store Screenshot 调试路由",
  "已请求原生 popup",
]) {
  assert(
    localizedCopySource.includes(requiredMarker),
    `localized-copy.ts is missing store-helper marker: ${requiredMarker}`,
  );
}

const appSource = await readProjectFile("src", "sidepanel", "App.tsx");
for (const requiredMarker of [
  "<StoreScreenshotSeedPage i18n={runtimeI18n} />",
  "<StoreScreenshotNativePopupProbePage i18n={runtimeI18n} />",
]) {
  assert(
    appSource.includes(requiredMarker),
    `App.tsx is missing store-helper i18n marker: ${requiredMarker}`,
  );
}

const seedPageSource = await readProjectFile(
  "src",
  "sidepanel",
  "routes",
  "StoreScreenshotSeedPage.tsx",
);
for (const requiredMarker of [
  "buildStoreWorkflowLocalizedCopy",
  "StoreScreenshotSeedPageProps",
  "copy.presetHeadline",
  "copy.temporaryLockActiveDetail",
  "AI Usage Dashboard Screenshot Seed Applied",
]) {
  assert(
    seedPageSource.includes(requiredMarker),
    `StoreScreenshotSeedPage.tsx is missing localization or automation marker: ${requiredMarker}`,
  );
}

const probePageSource = await readProjectFile(
  "src",
  "sidepanel",
  "routes",
  "StoreScreenshotNativePopupProbePage.tsx",
);
for (const requiredMarker of [
  "buildStoreWorkflowLocalizedCopy",
  "StoreScreenshotNativePopupProbePageProps",
  "copy.acceptedMessage",
  "AI Usage Dashboard Native Popup Probe",
]) {
  assert(
    probePageSource.includes(requiredMarker),
    `StoreScreenshotNativePopupProbePage.tsx is missing localization or automation marker: ${requiredMarker}`,
  );
}

const directionDoc = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
);
assert(directionDoc.includes("Phase 180"), "Direction 09 doc is missing Phase 180.");

const childTodo = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
);
assert(childTodo.includes("Phase 180"), "Direction 09.2 TODO is missing Phase 180.");

const helperBoundaryDoc = await readProjectFile(
  "Doc",
  "I18n_Store_Runtime_Helper_Copy.md",
);
for (const requiredPhrase of [
  "maintained reference",
  "Preserved Automation Boundary",
  "not final store-facing screenshot surfaces",
]) {
  assert(
    helperBoundaryDoc.includes(requiredPhrase),
    `store helper boundary doc is missing phrase: ${requiredPhrase}`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
assert(phaseIndex.includes("Phase 180"), "Phase index is missing Phase 180.");

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "store-runtime-helper-localization-review.json"),
  `${JSON.stringify(
    {
      localizedBuilder: "src/shared/localized-copy.ts",
      helperRoutes: [
        "src/sidepanel/index.html#debug-store-screenshot-seed",
        "src/sidepanel/index.html#debug-native-popup-probe",
      ],
      preservedAutomationSignals: [
        "AI Usage Dashboard Screenshot Seed Applied",
        "AI Usage Dashboard Screenshot Seed Cleared",
        "AI Usage Dashboard Native Popup Probe",
      ],
    },
    null,
    2,
  )}\n`,
);

console.log("phase180: store runtime helper localization verified");
