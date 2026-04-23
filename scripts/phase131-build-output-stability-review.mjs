import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readRelativeFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  return readFile(absolutePath, "utf8");
}

async function ensureFileExists(relativePath) {
  await access(path.join(projectRoot, relativePath));
}

async function main() {
  const popupHtml = await readRelativeFile("dist/src/popup/index.html");
  const sidepanelHtml = await readRelativeFile("dist/src/sidepanel/index.html");
  const serviceWorkerLoader = await readRelativeFile("dist/service-worker-loader.js");

  assert(
    popupHtml.includes('/assets/popup.js'),
    "popup build output should reference /assets/popup.js",
  );
  assert(
    sidepanelHtml.includes('/assets/sidepanel.js'),
    "sidepanel build output should reference /assets/sidepanel.js",
  );
  assert(
    popupHtml.includes('/assets/material-theme.css') &&
      sidepanelHtml.includes('/assets/material-theme.css'),
    "popup and sidepanel HTML should both reference /assets/material-theme.css",
  );
  assert(
    popupHtml.includes('/assets/message-bus.js') &&
      sidepanelHtml.includes('/assets/message-bus.js'),
    "popup and sidepanel HTML should both reference /assets/message-bus.js",
  );
  assert(
    sidepanelHtml.includes('/assets/action-badge.js'),
    "sidepanel HTML should reference /assets/action-badge.js",
  );
  assert(
    serviceWorkerLoader.includes("./assets/service-worker.js"),
    "service-worker loader should reference ./assets/service-worker.js",
  );

  await Promise.all([
    ensureFileExists("dist/assets/popup.js"),
    ensureFileExists("dist/assets/sidepanel.js"),
    ensureFileExists("dist/assets/message-bus.js"),
    ensureFileExists("dist/assets/material-theme.js"),
    ensureFileExists("dist/assets/material-theme.css"),
    ensureFileExists("dist/assets/action-badge.js"),
    ensureFileExists("dist/assets/service-worker.js"),
  ]);

  console.log("phase131: stable build output verified");
}

await main();
