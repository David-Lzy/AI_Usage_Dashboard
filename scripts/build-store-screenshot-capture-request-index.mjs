import path from "node:path";
import process from "node:process";

import { writeStoreScreenshotCaptureRequestIndex } from "./lib/store-screenshot-capture-request-index.mjs";

const projectRoot = process.cwd();
const defaultRequestRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
);
const defaultIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Store_Screenshot_Capture_Requests.md",
);
const defaultIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_capture_requests",
  "index.json",
);

async function run() {
  const generatedAt = new Date().toISOString();
  const result = await writeStoreScreenshotCaptureRequestIndex({
    projectRoot,
    requestRoot: defaultRequestRoot,
    generatedAt,
    indexMarkdownPath: defaultIndexMarkdownPath,
    indexJsonPath: defaultIndexJsonPath,
  });

  console.log(
    `store-screenshot: request index written pending=${result.pendingRequestCount} fulfilled=${result.fulfilledRequestCount} total=${result.recordCount}`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to refresh capture request index");
  console.error(error);
  process.exitCode = 1;
});
