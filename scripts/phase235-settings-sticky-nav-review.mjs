import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase235-settings-sticky-nav-review",
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
    packageJson.scripts["phase235:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase235-settings-sticky-nav-review.mjs",
    "package.json is missing the expected phase235:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "bottomContent",
        "settings-section-nav",
        "activeSettingsSection",
        "IntersectionObserver",
        "settings-back-to-top-fab",
        "settings-back-to-top-fab__label",
        "settings.actions.back_to_top",
      ],
    },
    {
      relativePath: "src/sidepanel/components/TopBar.tsx",
      markers: [
        "bottomContent",
        "top-app-bar__main",
        "top-app-bar__bottom",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        ".top-app-bar__bottom",
        "position: sticky",
        ".settings-nav-chip[data-active=\"true\"]",
        ".settings-back-to-top-fab",
        ".settings-back-to-top-fab__label",
      ],
    },
    {
      relativePath: "src/shared/i18n.ts",
      markers: [
        "settings.actions.back_to_top",
        "settings.actions.back_to_top_short",
        "Back to top",
        "Top",
        "返回顶部",
        "顶部",
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

async function verifyTestsAndDocs() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.test.tsx",
      markers: [
        "renders section navigation inside the top bar and a back-to-top action",
        "top-app-bar__bottom",
        "settings-back-to-top-fab",
      ],
    },
    {
      relativePath: "src/sidepanel/components/TopBar.test.tsx",
      markers: [
        "renders optional bottom content inside the same top bar surface",
        "top-app-bar__bottom",
      ],
    },
    {
      relativePath: "Doc/testing/Phase_235_Settings_Sticky_Nav.md",
      markers: [
        "Phase 235",
        "Settings Sticky Nav",
        "npm run phase235:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/235_Phase_Settings_Sticky_Nav.md",
      markers: [
        "Phase 235",
        "completed and archived on 2026-05-03",
        "merged sticky top bar",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "235_Phase_Settings_Sticky_Nav.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 235",
        "Settings sticky section navigation",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 235",
        "Settings sticky section navigation",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "Settings section chips now live inside the sticky top bar",
        "extended back-to-top floating action button",
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
  const results = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyTestsAndDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(artifactDir, "settings-sticky-nav-review.json");

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase235: Settings sticky nav verified");
  console.log(`phase235: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase235: ${result.scope} markers=${result.markers}`);
  }
}

runReview().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "phase235 review failed",
  );
  process.exit(1);
});
