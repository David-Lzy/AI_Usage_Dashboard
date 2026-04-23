import path from "node:path";
import process from "node:process";

import { captureRdpExtensionWindow } from "./lib/rdp-extension-runtime-capture.mjs";

const ROUTES = {
  popup: {
    routePath: "src/popup/index.html",
    expectedTitle: "AI Usage Dashboard Popup",
    width: 640,
    height: 400,
  },
  dashboard: {
    routePath: "src/sidepanel/index.html#dashboard",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  settings: {
    routePath: "src/sidepanel/index.html#settings",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "provider-detail-codex": {
    routePath: "src/sidepanel/index.html#provider-detail/codex",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
};

function parseArgs(argv) {
  const options = {
    route: "",
    output: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--route") {
      options.route = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--output") {
      options.output = argv[index + 1] ?? "";
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
  assert(options.route.length > 0, "Pass `--route <popup|dashboard|settings|provider-detail-codex>`.");
  assert(options.output.length > 0, "Pass `--output <path-to-png>`.");
  assert(options.route in ROUTES, `Unsupported route key: ${options.route}`);

  const routeConfig = ROUTES[options.route];
  const result = await captureRdpExtensionWindow({
    projectRoot: process.cwd(),
    routePath: routeConfig.routePath,
    expectedTitle: routeConfig.expectedTitle,
    width: routeConfig.width,
    height: routeConfig.height,
    outputPath: path.resolve(process.cwd(), options.output),
  });

  console.log(
    `rdp-capture: route=${options.route} extensionId=${result.extensionId} window=${result.windowId} output=${path.relative(process.cwd(), result.outputPath)}`,
  );
}

void run().catch((error) => {
  console.error("rdp-capture: failed to capture extension window");
  console.error(error);
  process.exitCode = 1;
});
