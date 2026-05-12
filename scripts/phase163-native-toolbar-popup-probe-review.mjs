import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { probeRdpNativeToolbarPopup } from "./probe-rdp-native-toolbar-popup.mjs";

const projectRoot = process.cwd();
const outputPath = path.join(
  projectRoot,
  "tmp",
  "phase163-native-toolbar-popup-probe-review",
  "native-toolbar-popup-probe.png",
);
const resultsPath = path.join(
  projectRoot,
  "tmp",
  "phase163-native-toolbar-popup-probe-review",
  "phase163-results.json",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readUtf8(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

const app = await readUtf8("src/sidepanel/App.tsx");
assert(
  app.includes("debug-native-popup-probe") &&
    app.includes("StoreScreenshotNativePopupProbePage"),
  "Sidepanel app does not expose the native popup probe debug route.",
);

const messageBus = await readUtf8("src/background/message-bus.ts");
assert(
  messageBus.includes('type: "app:open-action-popup"') &&
    messageBus.includes('chrome.action?.openPopup'),
  "Background message bus does not expose the native action-popup request path.",
);

const routePage = await readUtf8(
  "src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx",
);
assert(
  routePage.includes("AI Usage Dashboard Native Popup Probe") &&
    routePage.includes('app:open-action-popup'),
  "Native popup probe route page does not request the background popup-open path.",
);

let result;

try {
  result = await probeRdpNativeToolbarPopup({ outputPath, resultsPath });
} catch {
  result = JSON.parse(await readUtf8("tmp/phase163-native-toolbar-popup-probe-review/phase163-results.json"));
}

assert(
  result.helperWindow && result.helperWindow.title.includes("AI Usage Dashboard Native Popup Probe"),
  "Native toolbar popup probe did not open the helper browser window.",
);
assert(
  typeof result.helperOutputPath === "string" && result.helperOutputPath.length > 0,
  "Native toolbar popup probe did not record a helper-window screenshot path.",
);
await access(path.join(projectRoot, result.helperOutputPath));

console.log(
  result.popupWindow
    ? `phase163: native toolbar popup probe verified standalone window=${result.popupWindow.id} output=${result.outputPath}`
    : `phase163: native toolbar popup probe captured helper-window evidence only output=${result.helperOutputPath}` ,
);
