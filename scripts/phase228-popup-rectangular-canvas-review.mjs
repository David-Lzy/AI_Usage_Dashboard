import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase228-popup-rectangular-canvas-review",
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

function verifyMissing(fileContent, relativePath, markers) {
  for (const marker of markers) {
    assert(
      !fileContent.includes(marker),
      `${relativePath} still contains removed marker: ${marker}`,
    );
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase228:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase228-popup-rectangular-canvas-review.mjs",
    "package.json is missing the expected phase228:review script.",
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
        "html.popup-page,\nbody.popup-page,\n#root.popup-page-root {\n  min-height: 0;\n  background: linear-gradient(",
        "body.popup-page {\n  overflow-x: hidden;\n}",
        "body.popup-page .popup-shell {\n  background: transparent;",
        "body.popup-page .status-card",
      ],
      removedMarkers: [
        "--app-popup-host-edge-color",
        "-webkit-mask-image: radial-gradient(white, black);",
        "contain: paint;",
      ],
    },
    {
      relativePath: "src/popup/index.html",
      markers: [
        "--app-popup-page-background-start: #f8f9ff;",
        "--app-popup-page-background-end: #f2f3fa;",
        "--app-popup-page-background-start: #38393d;",
        "--app-popup-page-background-end: #1a1c20;",
        "body.popup-page {\n        overflow-x: hidden;\n      }",
        "#root.popup-page-root {\n        margin: 0;\n        width: 100%;\n      }",
      ],
      removedMarkers: [
        "--app-popup-host-edge-color",
        "clip-path: inset(0 round var(--app-popup-shell-radius, 28px));",
        "-webkit-mask-image: radial-gradient(white, black);",
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
    verifyMissing(
      fileContent,
      expectation.relativePath,
      expectation.removedMarkers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length + expectation.removedMarkers.length,
    });
  }

  return results;
}

async function verifyDocs() {
  const expectations = [
    {
      relativePath: "Doc/testing/Phase_228_Popup_Rectangular_Canvas_Reset.md",
      markers: [
        "Phase 228",
        "Popup Rectangular Canvas Reset",
        "community default_popup guidance",
        "npm run phase228:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/228_Phase_Popup_Rectangular_Canvas_Reset.md",
      markers: [
        "Phase 228",
        "completed and archived on 2026-04-30",
        "rectangular popup canvas",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "228_Phase_Popup_Rectangular_Canvas_Reset.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 228",
        "rectangular popup canvas",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 228",
        "rectangular popup canvas",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "rectangular popup canvas",
        "internal cards and controls",
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
    "popup-rectangular-canvas-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase228: popup rectangular canvas verified");
  console.log(`phase228: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase228: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase228: popup rectangular canvas review failed");
  console.error(error);
  process.exitCode = 1;
});
