import { access, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const homeDir = process.env.HOME ?? "";
const playwrightCacheDir = path.join(homeDir, ".cache", "ms-playwright");
const webExtBin = path.join(projectRoot, "node_modules", "web-ext", "bin", "web-ext.js");
const localRdpSafeFirefoxBin = path.join(homeDir, ".local", "bin", "firefox-rdp-safe");

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveDisplayEnv(baseEnv) {
  if (baseEnv.DISPLAY) {
    return baseEnv;
  }

  for (const display of [":10", ":0"]) {
    const socketPath = path.join("/tmp", ".X11-unix", `X${display.slice(1)}`);

    if (await pathExists(socketPath)) {
      return {
        ...baseEnv,
        DISPLAY: display,
        XAUTHORITY: baseEnv.XAUTHORITY || path.join(homeDir, ".Xauthority"),
      };
    }
  }

  return baseEnv;
}

async function resolvePlaywrightFirefoxPath() {
  try {
    const { firefox } = await import("playwright");
    const executablePath = firefox.executablePath();

    if (await pathExists(executablePath)) {
      return executablePath;
    }
  } catch {
    // Fall back to scanning the Playwright browser cache below.
  }

  const entries = await readdir(playwrightCacheDir, { withFileTypes: true }).catch(() => []);
  const firefoxDirs = entries
    .filter((entry) => entry.isDirectory() && /^firefox-\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => Number(right.split("-")[1]) - Number(left.split("-")[1]));

  for (const firefoxDir of firefoxDirs) {
    const executablePath = path.join(playwrightCacheDir, firefoxDir, "firefox", "firefox");

    if (await pathExists(executablePath)) {
      return executablePath;
    }
  }

  return null;
}

async function main() {
  const runEnv = await resolveDisplayEnv({ ...process.env });
  const firefoxPath =
    process.env.FIREFOX_BIN ||
    ((await pathExists(localRdpSafeFirefoxBin)) && runEnv.DISPLAY
      ? localRdpSafeFirefoxBin
      : null) ||
    (await resolvePlaywrightFirefoxPath());

  if (!firefoxPath) {
    throw new Error(
      "Could not find Firefox. Set FIREFOX_BIN or run `npx playwright install firefox`.",
    );
  }

  if (!runEnv.DISPLAY) {
    console.warn(
      "No DISPLAY is set. Firefox may fail to open; set DISPLAY/XAUTHORITY or run inside the desktop session.",
    );
  }

  console.log(`Using Firefox binary: ${firefoxPath}`);
  console.log(`Using DISPLAY: ${runEnv.DISPLAY ?? "(not set)"}`);

  const child = spawn(
    process.execPath,
    [
      webExtBin,
      "run",
      "--source-dir",
      "dist-firefox",
      "--firefox",
      firefoxPath,
      ...process.argv.slice(2),
    ],
    {
      cwd: projectRoot,
      env: runEnv,
      stdio: "inherit",
    },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

await main();
