import path from "node:path";
import process from "node:process";

import { captureRdpExtensionWindow } from "./lib/rdp-extension-runtime-capture.mjs";
import {
  getRdpExtensionWindowRouteConfig,
  getRdpExtensionWindowRouteKeys,
} from "./lib/rdp-extension-window-routes.mjs";

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
  assert(
    options.route.length > 0,
    `Pass \`--route <${getRdpExtensionWindowRouteKeys().join("|")}>\`.`,
  );
  assert(options.output.length > 0, "Pass `--output <path-to-png>`.");
  const routeConfig = getRdpExtensionWindowRouteConfig(options.route);
  assert(routeConfig, `Unsupported route key: ${options.route}`);

  const result = await captureRdpExtensionWindow({
    projectRoot: process.cwd(),
    routePath: routeConfig.routePath,
    expectedTitle: routeConfig.expectedTitle,
    width: routeConfig.width,
    height: routeConfig.height,
    outputPath: path.resolve(process.cwd(), options.output),
    closeAfterCapture: true,
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
