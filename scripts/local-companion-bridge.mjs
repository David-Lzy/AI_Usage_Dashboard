#!/usr/bin/env node

import path from "node:path";
import process from "node:process";

import { createLocalCompanionBridge } from "./lib/local-companion-bridge-server.mjs";

const HELP = `Experimental AI Usage Dashboard local companion bridge

Usage:
  npm run bridge:local -- --source <id>=<json-file> [options]

Options:
  --source <id>=<path>  Explicit custom-source.v1 JSON file (repeatable)
  --host <loopback>     127.0.0.1 (default) or ::1
  --port <number>       Listening port (default: 47831)
  --help                Show this help

The bridge never scans directories or executes commands. Tokens remain in
memory and are reset whenever this process stops.
`;

export function parseLocalCompanionBridgeArgs(argv) {
  const result = { host: "127.0.0.1", port: 47_831, sources: [], help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      result.help = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${argument} requires a value.`);
    }
    if (argument === "--host") {
      result.host = value;
      index += 1;
      continue;
    }
    if (argument === "--port") {
      const port = Number.parseInt(value, 10);
      if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error("--port must be an integer from 1 to 65535.");
      }
      result.port = port;
      index += 1;
      continue;
    }
    if (argument === "--source") {
      const separator = value.indexOf("=");
      if (separator <= 0 || separator === value.length - 1) {
        throw new Error("--source must use the <id>=<json-file> form.");
      }
      const sourceId = value.slice(0, separator);
      result.sources.push({
        sourceId,
        label: sourceId.replace(/^custom:/u, ""),
        filePath: path.resolve(value.slice(separator + 1)),
      });
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }
  if (!result.help && result.sources.length === 0) {
    throw new Error("At least one --source <id>=<json-file> is required.");
  }
  return result;
}

async function main() {
  let options;
  try {
    options = parseLocalCompanionBridgeArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error("Run with --help for usage.");
    process.exitCode = 1;
    return;
  }
  if (options.help) {
    console.log(HELP);
    return;
  }

  const bridge = createLocalCompanionBridge({
    ...options,
    onPairingCode(code) {
      console.log(`New pairing code: ${code}`);
    },
  });
  try {
    const address = await bridge.start();
    console.log(`Local companion listening on ${address.baseUrl}`);
    console.log(`Pairing code: ${address.pairingCode}`);
    console.log(
      `Serving ${options.sources.length} explicit source file${
        options.sources.length === 1 ? "" : "s"
      }. Press Ctrl+C to stop.`,
    );
  } catch (error) {
    console.error(
      `Local companion failed to start: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exitCode = 1;
    return;
  }

  const stop = async () => {
    await bridge.stop();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  await main();
}
