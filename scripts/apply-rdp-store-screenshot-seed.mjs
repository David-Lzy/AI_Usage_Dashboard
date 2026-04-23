import process from "node:process";

import { openRdpExtensionWindow } from "./lib/rdp-extension-runtime-capture.mjs";
import {
  buildStoreScreenshotSeedRoutePath,
  STORE_SCREENSHOT_SEED_APPLIED_TITLE,
  STORE_SCREENSHOT_SEED_CLEARED_TITLE,
} from "./lib/store-screenshot-rdp-capture.mjs";

function parseArgs(argv) {
  const options = {
    preset: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--preset") {
      options.preset = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return options;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  assert(options.preset.length > 0, "Pass `--preset <store-screenshot-preset>`.");

  const expectedTitle =
    options.preset === "unlock"
      ? STORE_SCREENSHOT_SEED_CLEARED_TITLE
      : STORE_SCREENSHOT_SEED_APPLIED_TITLE;
  const result = await openRdpExtensionWindow({
    projectRoot: process.cwd(),
    routePath: buildStoreScreenshotSeedRoutePath(options.preset),
    expectedTitle,
    width: 960,
    height: 720,
    waitMs: 2000,
    timeoutMs: 12000,
  });

  console.log(
    `store-screenshot: seed preset=${options.preset} extensionId=${result.extensionId} window=${result.windowId} title=${result.title}`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to apply RDP screenshot seed");
  console.error(error);
  process.exitCode = 1;
});
