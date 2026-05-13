import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase226-popup-shell-corner-mask-review",
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
    packageJson.scripts["phase226:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase226-popup-shell-corner-mask-review.mjs",
    "package.json is missing the expected phase226:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyStyleMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/theme/material-theme.css",
      markers: [
        "--app-popup-shell-radius",
        "#root.popup-page-root {\n  width: 100%;\n  border-radius: inherit;",
        "html.popup-page[data-popup-corner-style=\"square\"] {\n  --app-popup-shell-radius",
        "html.popup-page[data-popup-corner-style=\"soft\"] {\n  --app-popup-shell-radius",
        "html.popup-page[data-popup-corner-style=\"rounded\"] {\n  --app-popup-shell-radius",
        "body.popup-page .popup-shell",
        "background-clip: padding-box;",
        "clip-path: inset(",
      ],
    },
    {
      relativePath: "src/popup/index.html",
      markers: [
        "--app-popup-shell-radius: 28px;",
        "html.popup-page,\n      body.popup-page,\n      #root.popup-page-root {\n        background: transparent;",
        "body.popup-page {\n        overflow-x: hidden;\n        border-radius: var(--app-popup-shell-radius, 28px);",
        "#root.popup-page-root {\n        margin: 0;\n        width: 100%;\n        border-radius: inherit;",
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

async function verifyDocs() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_226_Popup_Shell_Corner_Mask.md",
      markers: [
        "Phase 226",
        "Popup Shell Corner Mask",
        "Chrome action popup host window",
        "npm run phase226:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/200-299/226_Phase_Popup_Shell_Corner_Mask.md",
      markers: [
        "Phase 226",
        "completed and archived on 2026-04-29",
        "visual corner mask",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "226_Phase_Popup_Shell_Corner_Mask.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 226",
        "popup shell visual corner mask",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 226",
        "popup shell visual corner mask",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "popup shell visual corner mask",
        "Chrome action-popup host shape",
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
    ...(await verifyStyleMarkers()),
    ...(await verifyDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "popup-shell-corner-mask-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase226: popup shell corner mask verified");
  console.log(`phase226: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase226: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase226: popup shell corner mask review failed");
  console.error(error);
  process.exitCode = 1;
});
