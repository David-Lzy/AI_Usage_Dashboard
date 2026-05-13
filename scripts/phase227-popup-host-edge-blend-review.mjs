import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase227-popup-host-edge-blend-review",
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
    packageJson.scripts["phase227:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase227-popup-host-edge-blend-review.mjs",
    "package.json is missing the expected phase227:review script.",
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
        "--app-popup-host-edge-color: #f2f3fa;",
        "--app-popup-host-edge-color: #202124;",
        "background: var(--app-popup-host-edge-color);",
        "body.popup-page {\n  overflow: hidden;",
        "-webkit-mask-image: radial-gradient(white, black);",
        "body.popup-page .popup-shell",
        "contain: paint;",
      ],
    },
    {
      relativePath: "src/popup/index.html",
      markers: [
        "--app-popup-host-edge-color: #f2f3fa;",
        "--app-popup-host-edge-color: #202124;",
        "background: var(--app-popup-host-edge-color, #f2f3fa);",
        "body.popup-page {\n        overflow: hidden;",
        "-webkit-mask-image: radial-gradient(white, black);",
        "#root.popup-page-root {\n        margin: 0;\n        width: 100%;\n        border-radius: inherit;\n        overflow: hidden;",
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
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_227_Popup_Host_Edge_Blend.md",
      markers: [
        "Phase 227",
        "Popup Host Edge Blend",
        "Chrome action popup host",
        "npm run phase227:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/200-299/227_Phase_Popup_Host_Edge_Blend.md",
      markers: [
        "Phase 227",
        "completed and archived on 2026-04-30",
        "host-edge blend",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "227_Phase_Popup_Host_Edge_Blend.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 227",
        "popup host-edge blend",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 227",
        "popup host-edge blend",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "popup host-edge blend",
        "true transparent native popup window",
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
    "popup-host-edge-blend-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase227: popup host edge blend verified");
  console.log(`phase227: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase227: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase227: popup host edge blend review failed");
  console.error(error);
  process.exitCode = 1;
});
