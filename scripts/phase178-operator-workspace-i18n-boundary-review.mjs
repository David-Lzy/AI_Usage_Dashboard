import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase178-operator-workspace-i18n-boundary-review",
);

const workspaceFiles = [
  {
    id: "interaction-audit",
    path: path.join(
      projectRoot,
      "src",
      "sidepanel",
      "routes",
      "InteractionAuditPage.tsx",
    ),
    requiredMarkers: [
      "Interaction Audit",
      "Real-browser QA hub",
      "Signoff Workspace",
      "Current operator draft",
      "Copied the current signoff JSON to the clipboard.",
    ],
  },
  {
    id: "theme-recovery",
    path: path.join(
      projectRoot,
      "src",
      "sidepanel",
      "routes",
      "ThemeRecoveryReviewPage.tsx",
    ),
    requiredMarkers: [
      "Theme Recovery Review",
      "Operator workspace",
      "Recovery status right now",
      "Real-session follow-up steps",
      "Copied the current theme recovery JSON export.",
    ],
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractQuotedStrings(source) {
  return Array.from(source.matchAll(/"([^"\n]{4,})"/g))
    .map((match) => match[1])
    .filter((value) => /[A-Za-z]/.test(value));
}

function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length;
}

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(path.join(projectRoot, relativePath), "utf8"),
  );
}

const packageJson = await readJson("package.json");
assert(packageJson.scripts["phase178:review"], "package.json is missing phase178:review.");

const inventory = [];

for (const workspace of workspaceFiles) {
  const source = await readFile(workspace.path, "utf8");
  const quotedStrings = extractQuotedStrings(source);

  for (const marker of workspace.requiredMarkers) {
    assert(
      source.includes(marker),
      `${workspace.id} workspace is missing expected marker: ${marker}`,
    );
  }

  inventory.push({
    id: workspace.id,
    relativePath: path.relative(projectRoot, workspace.path),
    lineCount: source.split("\n").length,
    quotedStringCount: quotedStrings.length,
    topLevelLabelCount: countMatches(source, /section-(?:label|title)/g),
    operatorFeedbackMessageCount: countMatches(source, /message: "/g),
    buttonOrActionLabelCount: countMatches(
      source,
      /primaryActionLabel|secondaryActionLabel|text-button|Copy|Download/g,
    ),
    sampleStrings: quotedStrings.slice(0, 20),
  });
}

const boundaryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_Operator_Workspace_Boundary_And_Extraction.md"),
  "utf8",
);

for (const requiredPhrase of [
  "Document class:",
  "maintained reference",
  "Interaction audit workspace",
  "Theme recovery workspace",
  "Evidence-preserving English",
  "first extraction review",
]) {
  assert(
    boundaryDoc.includes(requiredPhrase),
    `operator workspace boundary doc is missing phrase: ${requiredPhrase}`,
  );
}

const directionDoc = await readFile(
  path.join(
    projectRoot,
    "Doc",
    "Roadmap",
    "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
  ),
  "utf8",
);
assert(directionDoc.includes("Phase 178"), "Direction 09 doc is missing Phase 178.");

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, "operator-workspace-copy-inventory.json"),
  `${JSON.stringify({ inventory }, null, 2)}\n`,
);

console.log(
  `phase178: operator workspace i18n boundary verified for ${inventory.length} workspaces`,
);
