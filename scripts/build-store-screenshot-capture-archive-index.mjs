import path from "node:path";
import process from "node:process";

import { writeStoreScreenshotCaptureArchiveIndex } from "./lib/store-screenshot-capture-archive-index.mjs";

const projectRoot = process.cwd();
const archiveRoot = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_archives",
);
const indexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Store_Screenshot_Capture_Archive.md",
);
const indexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "store_screenshot_archives",
  "index.json",
);

async function run() {
  const generatedAt = new Date().toISOString();
  const result = await writeStoreScreenshotCaptureArchiveIndex({
    projectRoot,
    archiveRoot,
    generatedAt,
    indexMarkdownPath,
    indexJsonPath,
  });

  console.log(
    `store-screenshot: archive index refreshed recordCount=${result.recordCount}`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to refresh archive index");
  console.error(error);
  process.exitCode = 1;
});
