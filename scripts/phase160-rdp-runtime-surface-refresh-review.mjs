import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  captureRdpExtensionWindow,
  closeRdpExtensionWindows,
} from "./lib/rdp-extension-runtime-capture.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase160-rdp-runtime-surface-refresh-review",
);

const CAPTURE_PLAN = [
  {
    key: "popup",
    routePath: "src/popup/index.html",
    expectedTitle: "AI Usage Dashboard Popup",
    width: 640,
    height: 400,
    filename: "popup-runtime-refresh.png",
  },
  {
    key: "sidebar-settings",
    routePath: "src/sidepanel/index.html#settings",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
    filename: "sidebar-settings-runtime-refresh.png",
  },
  {
    key: "full-page-dashboard",
    routePath: "src/sidepanel/index.html?surface=full-page#dashboard",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
    filename: "full-page-dashboard-runtime-refresh.png",
  },
  {
    key: "full-page-settings",
    routePath: "src/sidepanel/index.html?surface=full-page#settings",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
    filename: "full-page-settings-runtime-refresh.png",
  },
  {
    key: "full-page-provider-detail-codex",
    routePath: "src/sidepanel/index.html?surface=full-page#provider-detail/codex",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
    filename: "full-page-provider-detail-codex-runtime-refresh.png",
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await mkdir(artifactDir, { recursive: true });

const captureResults = [];

try {
  for (const capturePlan of CAPTURE_PLAN) {
    await closeRdpExtensionWindows({});
    const captureResult = await captureRdpExtensionWindow({
      projectRoot,
      routePath: capturePlan.routePath,
      expectedTitle: capturePlan.expectedTitle,
      width: capturePlan.width,
      height: capturePlan.height,
      waitMs: 2500,
      timeoutMs: 12000,
      outputPath: path.join(artifactDir, capturePlan.filename),
      closeAfterCapture: true,
    });

    captureResults.push({
      key: capturePlan.key,
      routePath: capturePlan.routePath,
      title: captureResult.title,
      extensionId: captureResult.extensionId,
      windowId: captureResult.windowId,
      outputPath: path.relative(projectRoot, captureResult.outputPath),
    });
  }
} finally {
  await closeRdpExtensionWindows({});
}

assert(
  captureResults.length === CAPTURE_PLAN.length,
  `Expected ${CAPTURE_PLAN.length} captures but collected ${captureResults.length}.`,
);

await writeFile(
  path.join(artifactDir, "phase160-results.json"),
  `${JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      captureResults,
    },
    null,
    2,
  )}
`,
  "utf8",
);

console.log(
  `phase160: captured ${captureResults.length} real RDP runtime surface screenshot(s)`,
);
