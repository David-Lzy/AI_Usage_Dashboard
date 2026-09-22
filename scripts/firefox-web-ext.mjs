#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { resolveBuildPaths } from "./lib/build-paths.mjs";

const routingOptions = new Set([
  "--source-dir",
  "--artifacts-dir",
  "--overwrite-dest",
]);

function assertNoRoutingOverrides(argumentsToForward) {
  for (const argument of argumentsToForward) {
    const option = argument.split("=", 1)[0];

    if (routingOptions.has(option) || /^-[sao](?:$|[^-])/.test(argument)) {
      throw new Error(
        `${option} is managed by AI_USAGE_BUILD_ROOT-aware Firefox packaging.`,
      );
    }
  }
}

export function resolveFirefoxWebExtInvocation({
  projectRoot = process.cwd(),
  environment = process.env,
  arguments: commandArguments = [],
} = {}) {
  const [command, ...argumentsToForward] = commandArguments;
  const { firefoxDir, releaseDir } = resolveBuildPaths({
    projectRoot,
    environment,
  });

  if (command !== "lint" && command !== "build") {
    throw new Error("Usage: firefox-web-ext.mjs <lint|build> [web-ext arguments]");
  }

  assertNoRoutingOverrides(argumentsToForward);

  if (command === "lint") {
    return {
      command,
      arguments: ["lint", "--source-dir", firefoxDir, ...argumentsToForward],
    };
  }

  return {
    command,
    arguments: [
      "build",
      "--source-dir",
      firefoxDir,
      "--artifacts-dir",
      path.join(releaseDir, "firefox"),
      "--overwrite-dest",
      ...argumentsToForward,
    ],
  };
}

async function main() {
  const projectRoot = process.cwd();
  const invocation = resolveFirefoxWebExtInvocation({
    projectRoot,
    arguments: process.argv.slice(2),
  });
  const webExtBin = path.join(
    projectRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "web-ext.cmd" : "web-ext",
  );

  const child = spawn(webExtBin, invocation.arguments, {
    cwd: projectRoot,
    stdio: "inherit",
  });

  child.on("error", (error) => {
    throw error;
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

const invokedScript = process.argv[1] && path.resolve(process.argv[1]);
if (invokedScript && import.meta.url === pathToFileURL(invokedScript).href) {
  await main();
}
