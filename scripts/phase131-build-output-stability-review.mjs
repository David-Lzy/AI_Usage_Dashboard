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
  const popupHtml = await readRelativeFile("dist/chrome/src/popup/index.html");
  const sidepanelHtml = await readRelativeFile("dist/chrome/src/sidepanel/index.html");
  const serviceWorkerLoader = await readRelativeFile("dist/chrome/service-worker-loader.js");

  assert(
    popupHtml.includes('/assets/popup.js'),
    "popup build output should reference /assets/popup.js",
  );
  assert(
    sidepanelHtml.includes('/assets/sidepanel.js'),
    "sidepanel build output should reference /assets/sidepanel.js",
  );
  assert(
    popupHtml.includes('/assets/build-info.js') &&
      sidepanelHtml.includes('/assets/build-info.js'),
    "popup and sidepanel HTML should both preload /assets/build-info.js",
  );
  assert(
    popupHtml.includes('/assets/usage-progress.js') &&
      sidepanelHtml.includes('/assets/usage-progress.js'),
    "popup and sidepanel HTML should both preload /assets/usage-progress.js",
  );
  assert(
    popupHtml.includes('/assets/usage-progress.css') &&
      sidepanelHtml.includes('/assets/usage-progress.css'),
    "popup and sidepanel HTML should both reference /assets/usage-progress.css",
  );
  assert(
    popupHtml.includes('/assets/index.css'),
    "popup HTML should reference /assets/index.css",
  );
  assert(
    sidepanelHtml.includes('/assets/index2.css'),
    "sidepanel HTML should reference /assets/index2.css",
  );
  assert(
    serviceWorkerLoader.includes("./assets/service-worker.js"),
    "service-worker loader should reference ./assets/service-worker.js",
  );

  await Promise.all([
    ensureFileExists("dist/chrome/assets/popup.js"),
    ensureFileExists("dist/chrome/assets/sidepanel.js"),
    ensureFileExists("dist/chrome/assets/build-info.js"),
    ensureFileExists("dist/chrome/assets/usage-progress.js"),
    ensureFileExists("dist/chrome/assets/usage-progress.css"),
    ensureFileExists("dist/chrome/assets/index.css"),
    ensureFileExists("dist/chrome/assets/index2.css"),
    ensureFileExists("dist/chrome/assets/view-models.js"),
    ensureFileExists("dist/chrome/assets/action-badge.js"),
    ensureFileExists("dist/chrome/assets/service-worker.js"),
  ]);

  console.log("phase131: stable build output verified");
}

await main();
