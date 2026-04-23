import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildStoreScreenshotCaptureRequestId,
  writeStoreScreenshotCaptureRequest,
} from "./lib/store-screenshot-capture-request.mjs";
import { writeStoreScreenshotCaptureRequestIndex } from "./lib/store-screenshot-capture-request-index.mjs";

const projectRoot = process.cwd();
const defaultTemplatePath = path.join(
  projectRoot,
  "fixtures",
  "store-screenshot",
  "operator-capture-request-template.fixture.json",
);
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

function parseArgs(argv) {
  const options = {
    template: defaultTemplatePath,
    requestRoot: defaultRequestRoot,
    requestId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--template") {
      options.template = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-root") {
      options.requestRoot = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--request-id") {
      options.requestId = argv[index + 1] ?? "";
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

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const templatePath = path.resolve(projectRoot, options.template);
  const requestRoot = path.resolve(projectRoot, options.requestRoot);
  const requestTemplate = await readJson(
    templatePath,
    "Store screenshot capture request template",
  );
  const createdAt = new Date().toISOString();
  const requestId = buildStoreScreenshotCaptureRequestId({
    requestId: options.requestId,
    createdAt,
  });
  const shouldRefreshDefaultIndex = requestRoot === defaultRequestRoot;
  const result = await writeStoreScreenshotCaptureRequest({
    projectRoot,
    requestRoot,
    requestId,
    createdAt,
    requestTemplate,
    sourceTemplate: path.relative(projectRoot, templatePath),
  });
  const indexMarkdownPath = shouldRefreshDefaultIndex
    ? defaultIndexMarkdownPath
    : path.join(path.dirname(requestRoot), "Store_Screenshot_Capture_Requests.md");
  const indexJsonPath = shouldRefreshDefaultIndex
    ? defaultIndexJsonPath
    : path.join(requestRoot, "index.json");
  const indexResult = await writeStoreScreenshotCaptureRequestIndex({
    projectRoot,
    requestRoot,
    generatedAt: createdAt,
    indexMarkdownPath,
    indexJsonPath,
  });

  console.log(
    `store-screenshot: capture request written to ${result.requestDirRelative}`,
  );
  console.log(
    `store-screenshot: status=${result.manifest.status} baseline_pack=${result.manifest.baselinePackReadme}`,
  );
  console.log(
    `store-screenshot: request index refreshed pending=${indexResult.pendingRequestCount} fulfilled=${indexResult.fulfilledRequestCount}`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to create capture request");
  console.error(error);
  process.exitCode = 1;
});
