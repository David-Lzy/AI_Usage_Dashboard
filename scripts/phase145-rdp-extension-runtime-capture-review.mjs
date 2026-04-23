import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { captureRdpExtensionWindow } from "./lib/rdp-extension-runtime-capture.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp/phase145-rdp-extension-runtime-capture-review",
);
const issues = [];

async function identifyImage(filePath) {
  const { stdout } = await execFileAsync("identify", [filePath]);
  return stdout.trim();
}

const popupPath = path.join(outputDir, "popup-runtime.png");
const settingsPath = path.join(outputDir, "settings-runtime.png");
const dashboardPath = path.join(outputDir, "dashboard-runtime.png");

const popupCapture = await captureRdpExtensionWindow({
  projectRoot,
  routePath: "src/popup/index.html",
  expectedTitle: "AI Usage Dashboard Popup",
  width: 640,
  height: 400,
  outputPath: popupPath,
});
const settingsCapture = await captureRdpExtensionWindow({
  projectRoot,
  routePath: "src/sidepanel/index.html#settings",
  expectedTitle: "AI Usage Dashboard",
  width: 1280,
  height: 800,
  outputPath: settingsPath,
});
const dashboardCapture = await captureRdpExtensionWindow({
  projectRoot,
  routePath: "src/sidepanel/index.html#dashboard",
  expectedTitle: "AI Usage Dashboard",
  width: 1280,
  height: 800,
  outputPath: dashboardPath,
});

const popupIdentify = await identifyImage(popupPath);
const settingsIdentify = await identifyImage(settingsPath);
const dashboardIdentify = await identifyImage(dashboardPath);

if (!popupIdentify.includes("PNG")) {
  issues.push("Popup runtime capture did not produce a PNG file.");
}

if (!settingsIdentify.includes("PNG")) {
  issues.push("Settings runtime capture did not produce a PNG file.");
}

if (!dashboardIdentify.includes("PNG")) {
  issues.push("Dashboard runtime capture did not produce a PNG file.");
}

const result = {
  issues,
  popupCapture,
  settingsCapture,
  dashboardCapture,
  popupIdentify,
  settingsIdentify,
  dashboardIdentify,
};

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase145-results.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `phase145: RDP extension runtime capture review found ${issues.length} issue(s).`,
  );
}

console.log("phase145: RDP extension runtime capture workflow verified");
