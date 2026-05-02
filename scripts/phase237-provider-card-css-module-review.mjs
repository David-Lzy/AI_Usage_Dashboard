import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase237-provider-card-css-module-review",
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
    packageJson.scripts["phase237:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase237-provider-card-css-module-review.mjs",
    "package.json is missing the expected phase237:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCssSplit() {
  const mainTsx = await readProjectFile("src/sidepanel/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const providerCardTheme = await readProjectFile(
    "src/sidepanel/theme/provider-card.css",
  );
  const materialThemeImportIndex = mainTsx.indexOf(
    'import "./theme/material-theme.css";',
  );
  const providerCardImportIndex = mainTsx.indexOf(
    'import "./theme/provider-card.css";',
  );

  assert(
    materialThemeImportIndex >= 0,
    "src/sidepanel/main.tsx is missing the material-theme import.",
  );
  assert(
    providerCardImportIndex > materialThemeImportIndex,
    "provider-card.css must load after material-theme.css so provider-card action overrides win the cascade.",
  );
  assert(
    !materialTheme.includes(".provider-card__summary"),
    "material-theme.css still owns provider-card summary styles.",
  );
  assert(
    !materialTheme.includes(".provider-card__action--primary"),
    "material-theme.css still owns provider-card action hierarchy styles.",
  );

  verifyMarkers(providerCardTheme, "src/sidepanel/theme/provider-card.css", [
    ".provider-shell-list",
    ".provider-card__summary",
    ".provider-card__progress-surface",
    ".provider-card__action--primary",
    "@media (max-width: 720px)",
  ]);

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 2,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 2,
    },
    {
      scope: "src/sidepanel/theme/provider-card.css",
      markers: 5,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_237_Provider_Card_CSS_Module_Split.md",
      markers: [
        "Phase 237",
        "Provider Card CSS Module Split",
        "npm run phase237:review",
        "npm run phase236:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/237_Phase_Provider_Card_CSS_Module_Split.md",
      markers: [
        "Phase 237",
        "completed and archived on 2026-05-03",
        "provider-card.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "237_Phase_Provider_Card_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 237",
        "provider-card CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "provider-card CSS now lives in `src/sidepanel/theme/provider-card.css`",
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

  const results = [
    await verifyPackageScript(),
    ...(await verifyCssSplit()),
    ...(await verifyDocsMarkers()),
  ];
  const reportPath = path.join(
    artifactDir,
    "provider-card-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase237: provider-card CSS module split verified");
  console.log(`phase237: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase237: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error("phase237: provider-card CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
