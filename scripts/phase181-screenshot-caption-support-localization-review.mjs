import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase181-screenshot-caption-support-localization-review",
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
assert(packageJson.scripts["phase181:review"], "package.json is missing phase181:review.");

const localizedCopySource = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "submissionCaptionLabel",
  "Submission-support caption",
  "当访问权限或凭据缺失时，明确下一步配置动作。",
  "This caption only helps the operator match the current preset",
]) {
  assert(
    localizedCopySource.includes(requiredMarker),
    `localized-copy.ts is missing screenshot-caption support marker: ${requiredMarker}`,
  );
}

const seedPageSource = await readProjectFile(
  "src",
  "sidepanel",
  "routes",
  "StoreScreenshotSeedPage.tsx",
);
for (const requiredMarker of [
  "copy.submissionCaption(currentPreset)",
  "copy.submissionCaptionLabel",
  "copy.submissionCaptionDetail",
  "currentPreset !== \"unlock\"",
]) {
  assert(
    seedPageSource.includes(requiredMarker),
    `StoreScreenshotSeedPage.tsx is missing caption-support marker: ${requiredMarker}`,
  );
}

const i18nTestSource = await readProjectFile("src", "shared", "i18n.test.ts");
assert(
  i18nTestSource.includes("storeCopy.screenshotSeed.submissionCaption(\"setup-guidance\")"),
  "i18n.test.ts is missing the screenshot-caption localization assertion.",
);

const helperBoundaryDoc = await readProjectFile(
  "Doc",
  "I18n_Store_Runtime_Helper_Copy.md",
);
for (const requiredPhrase of [
  "submission-support captions",
  "not injected into final popup, side-panel, or full-page screenshots",
  "Phase 181",
]) {
  assert(
    helperBoundaryDoc.includes(requiredPhrase),
    `store helper boundary doc is missing Phase 181 phrase: ${requiredPhrase}`,
  );
}

const directionDoc = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
);
assert(directionDoc.includes("Phase 181"), "Direction 09 doc is missing Phase 181.");

const childTodo = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md",
);
for (const requiredPhrase of [
  "Phase 181",
  "screenshot-adjacent submission-support caption",
  "raw provider source-truth strings",
]) {
  assert(
    childTodo.includes(requiredPhrase),
    `Direction 09.2 TODO is missing Phase 181 phrase: ${requiredPhrase}`,
  );
}

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
assert(phaseIndex.includes("Phase 181"), "Phase index is missing Phase 181.");

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "screenshot-caption-support-localization-review.json"),
  `${JSON.stringify(
    {
      localizedBuilder: "src/shared/localized-copy.ts",
      helperRoute: "src/sidepanel/index.html#debug-store-screenshot-seed",
      addedRuntimeSupport: [
        "localized submission-support caption label",
        "localized preset-to-caption mapping",
        "helper-only boundary copy",
      ],
      preservedBoundaries: [
        "final popup/sidebar/full-page screenshots are unchanged",
        "store listing source docs remain maintained references",
        "automation document titles and preset ids stay stable",
      ],
    },
    null,
    2,
  )}\n`,
);

console.log("phase181: screenshot caption support localization verified");
