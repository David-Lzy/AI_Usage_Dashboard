import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase179-operator-workspace-shell-localization-review",
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
assert(packageJson.scripts["phase179:review"], "package.json is missing phase179:review.");

const localizedCopySource = await readProjectFile("src", "shared", "localized-copy.ts");
for (const requiredMarker of [
  "buildOperatorWorkspaceLocalizedCopy",
  "interactionAudit",
  "themeRecovery",
  "交互审计",
  "主题恢复审核",
]) {
  assert(
    localizedCopySource.includes(requiredMarker),
    `localized-copy.ts is missing operator workspace marker: ${requiredMarker}`,
  );
}

const appSource = await readProjectFile("src", "sidepanel", "App.tsx");
for (const requiredMarker of [
  "readLocalePreferenceFromStoredAppState",
  "syncRuntimeLocaleAttributes",
  "<InteractionAuditPage i18n={runtimeI18n} />",
  "<ThemeRecoveryReviewPage i18n={runtimeI18n} />",
]) {
  assert(
    appSource.includes(requiredMarker),
    `App.tsx is missing special-route i18n marker: ${requiredMarker}`,
  );
}

const interactionAuditSource = await readProjectFile(
  "src",
  "sidepanel",
  "routes",
  "InteractionAuditPage.tsx",
);
for (const requiredMarker of [
  "buildOperatorWorkspaceLocalizedCopy",
  "InteractionAuditPageProps",
  "copy.topbar.title",
  "copy.guidance.checks",
  "copy.signoff.requestScope",
]) {
  assert(
    interactionAuditSource.includes(requiredMarker),
    `InteractionAuditPage.tsx is missing shell-localization marker: ${requiredMarker}`,
  );
}

const themeRecoverySource = await readProjectFile(
  "src",
  "sidepanel",
  "routes",
  "ThemeRecoveryReviewPage.tsx",
);
for (const requiredMarker of [
  "buildOperatorWorkspaceLocalizedCopy",
  "ThemeRecoveryReviewPageProps",
  "copy.topbar.title",
  "copy.workflow.steps",
  "copy.links.sidePanel[link.id]",
  "copy.outputs.copiedJson",
]) {
  assert(
    themeRecoverySource.includes(requiredMarker),
    `ThemeRecoveryReviewPage.tsx is missing shell-localization marker: ${requiredMarker}`,
  );
}

const boundaryDoc = await readProjectFile(
  "Doc",
  "I18n_Operator_Workspace_Boundary_And_Extraction.md",
);
for (const requiredPhrase of [
  "Phase 179",
  "shell-localized",
  "Evidence payloads remain English",
]) {
  assert(
    boundaryDoc.includes(requiredPhrase),
    `operator workspace i18n boundary doc is missing phrase: ${requiredPhrase}`,
  );
}

const directionDoc = await readProjectFile(
  "Doc",
  "Roadmap",
  "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
);
assert(directionDoc.includes("Phase 179"), "Direction 09 doc is missing Phase 179.");

const phaseIndex = await readProjectFile("Doc", "TODOs", "00_Phase_Index.md");
assert(phaseIndex.includes("Phase 179"), "Phase index is missing Phase 179.");

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "shell-localization-review.json"),
  `${JSON.stringify(
    {
      localizedBuilder: "src/shared/localized-copy.ts",
      wiredRoutes: [
        "src/sidepanel/routes/InteractionAuditPage.tsx",
        "src/sidepanel/routes/ThemeRecoveryReviewPage.tsx",
      ],
      boundary:
        "Shell and action copy localizes; evidence payloads, export schemas, and source-truth strings remain unchanged.",
    },
    null,
    2,
  )}\n`,
);

console.log("phase179: operator workspace shell localization verified");
