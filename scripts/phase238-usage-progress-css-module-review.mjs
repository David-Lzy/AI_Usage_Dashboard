import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase238-usage-progress-css-module-review",
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

function verifyOrder(fileContent, relativePath, orderedMarkers) {
  let previousIndex = -1;

  for (const marker of orderedMarkers) {
    const index = fileContent.indexOf(marker);

    assert(index >= 0, `${relativePath} is missing ordered marker: ${marker}`);
    assert(
      index > previousIndex,
      `${relativePath} has the wrong order for marker: ${marker}`,
    );
    previousIndex = index;
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase238:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase238-usage-progress-css-module-review.mjs",
    "package.json is missing the expected phase238:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCssSplit() {
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const usageProgressTheme = await readProjectFile(
    "src/sidepanel/theme/usage-progress.css",
  );
  const providerCardTheme = await readProjectFile(
    "src/sidepanel/theme/provider-card.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  verifyOrder(popupEntry, "src/popup/main.tsx", [
    'import "../sidepanel/theme/material-theme.css";',
    'import "../sidepanel/theme/usage-progress.css";',
  ]);

  assert(
    !materialTheme.includes("@keyframes app-progress-indeterminate-shift"),
    "material-theme.css still owns the usage progress keyframes.",
  );
  assert(
    !materialTheme.includes("\n.usage-progress {\n"),
    "material-theme.css still owns the base usage-progress block.",
  );
  assert(
    !materialTheme.includes("\n.usage-window-progress-list {\n"),
    "material-theme.css still owns the base usage-window-progress-list block.",
  );

  verifyMarkers(
    usageProgressTheme,
    "src/sidepanel/theme/usage-progress.css",
    [
      "@keyframes app-progress-indeterminate-shift",
      ".usage-progress",
      ".usage-progress__track",
      ".usage-progress__ring",
      ".usage-window-progress-list",
      "@media (prefers-reduced-motion: reduce)",
    ],
  );
  verifyMarkers(providerCardTheme, "src/sidepanel/theme/provider-card.css", [
    ".provider-card__progress-surface",
    ".usage-window-progress-list__item",
  ]);

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 3,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 2,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 3,
    },
    {
      scope: "src/sidepanel/theme/usage-progress.css",
      markers: 6,
    },
    {
      scope: "src/sidepanel/theme/provider-card.css",
      markers: 2,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_238_Usage_Progress_CSS_Module_Split.md",
      markers: [
        "Phase 238",
        "Usage Progress CSS Module Split",
        "npm run phase238:review",
        "npm run phase236:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/238_Phase_Usage_Progress_CSS_Module_Split.md",
      markers: [
        "Phase 238",
        "completed and archived on 2026-05-03",
        "usage-progress.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "Phase 238",
        "usage-progress",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 238",
        "usage-progress CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "usage-progress CSS now lives in `src/sidepanel/theme/usage-progress.css`",
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
    "usage-progress-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase238: usage-progress CSS module split verified");
  console.log(`phase238: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase238: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error("phase238: usage-progress CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
