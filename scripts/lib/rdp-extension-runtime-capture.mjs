import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DEFAULT_X11_COMMAND_TIMEOUT_MS = 8000;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseHexWindowId(value) {
  return Number.parseInt(value, 16);
}

function getX11CommandTimeoutMs() {
  const rawTimeout = Number.parseInt(
    process.env.RDP_CHROME_X11_COMMAND_TIMEOUT_MS ?? "",
    10,
  );

  return Number.isFinite(rawTimeout) && rawTimeout > 0
    ? rawTimeout
    : DEFAULT_X11_COMMAND_TIMEOUT_MS;
}

function parseWindowTree(rawOutput) {
  return rawOutput
    .split("\n")
    .map((line) => line.match(/^\s*(0x[0-9a-f]+)\s+"([^"]+)"/i))
    .filter(Boolean)
    .map((match) => ({
      id: match[1],
      title: match[2],
      numericId: parseHexWindowId(match[1]),
    }));
}

export async function detectChromeRuntimeEnvironment() {
  try {
    const { stdout } = await execFileAsync("pgrep", [
      "-af",
      "/opt/google/chrome/chrome --profile-directory=Default",
    ]);
    const lines = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const primaryLine =
      lines.find((line) => !line.includes(" --type=")) ?? lines.at(0) ?? "";
    const pid = primaryLine.split(" ")[0] ?? "";

    assert(pid.length > 0, "Could not find the primary Chrome profile process.");

    const envBuffer = await readFile(`/proc/${pid}/environ`);
    const entries = envBuffer
      .toString("utf8")
      .split("\u0000")
      .filter((entry) => entry.length > 0);
    const envMap = new Map(
      entries.map((entry) => {
        const separatorIndex = entry.indexOf("=");
        return [
          entry.slice(0, separatorIndex),
          separatorIndex === -1 ? "" : entry.slice(separatorIndex + 1),
        ];
      }),
    );
    const display = envMap.get("DISPLAY") ?? "";
    const xauthority = envMap.get("XAUTHORITY") ?? "";

    assert(display.length > 0, "Could not detect DISPLAY from the running Chrome process.");
    assert(
      xauthority.length > 0,
      "Could not detect XAUTHORITY from the running Chrome process.",
    );

    return {
      pid,
      display,
      xauthority,
    };
  } catch {
    const display = process.env.RDP_CHROME_DISPLAY ?? ":10.0";
    const xauthority =
      process.env.RDP_CHROME_XAUTHORITY ??
      path.join(process.env.HOME ?? "/home/davidli", ".Xauthority");

    return {
      pid: "",
      display,
      xauthority,
    };
  }
}

export async function detectLoadedExtensionId({ projectRoot }) {
  const preferencesPath = path.join(
    process.env.HOME ?? "/home/davidli",
    ".config/google-chrome/Default/Preferences",
  );
  const preferences = JSON.parse(await readFile(preferencesPath, "utf8"));
  const extensionSettings = preferences?.extensions?.settings ?? {};
  const expectedPath = path.join(projectRoot, "dist");

  for (const [extensionId, record] of Object.entries(extensionSettings)) {
    const recordPath =
      record && typeof record === "object" && typeof record.path === "string"
        ? path.resolve(record.path)
        : "";

    if (recordPath === expectedPath) {
      return extensionId;
    }
  }

  throw new Error(
    `Could not detect the loaded unpacked extension id for ${expectedPath}.`,
  );
}

async function runX11Command({
  command,
  args,
  runtime,
  label,
  timeoutMs = getX11CommandTimeoutMs(),
}) {
  try {
    return await execFileAsync(command, args, {
      env: {
        ...process.env,
        DISPLAY: runtime.display,
        XAUTHORITY: runtime.xauthority,
      },
      timeout: timeoutMs,
      killSignal: "SIGKILL",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const details =
      error instanceof Error && error.message.length > 0
        ? error.message
        : String(error);
    throw new Error(`${label} failed within ${timeoutMs}ms: ${details}`);
  }
}

async function listChromeWindows(runtime) {
  const { stdout } = await runX11Command({
    command: "xwininfo",
    args: ["-root", "-tree"],
    runtime,
    label: "xwininfo window-tree probe",
  });

  return parseWindowTree(stdout);
}

function spawnChromeAppWindow({ display, xauthority, url, width, height }) {
  const child = spawn(
    "/opt/google/chrome/chrome",
    [
      "--profile-directory=Default",
      `--app=${url}`,
      `--window-size=${width},${height}`,
    ],
    {
      env: {
        ...process.env,
        DISPLAY: display,
        XAUTHORITY: xauthority,
      },
      detached: true,
      stdio: "ignore",
    },
  );

  child.unref();
}

export async function openRdpExtensionWindow({
  projectRoot,
  routePath,
  expectedTitle,
  width,
  height,
  waitMs = 3000,
  pollMs = 400,
  timeoutMs = 8000,
}) {
  const runtime = await detectChromeRuntimeEnvironment();
  const extensionId = await detectLoadedExtensionId({ projectRoot });
  const url = `chrome-extension://${extensionId}/${routePath}`;
  const existingWindows = await listChromeWindows(runtime);
  const existingIds = new Set(
    existingWindows
      .filter((windowInfo) => windowInfo.title === expectedTitle)
      .map((windowInfo) => windowInfo.id),
  );

  spawnChromeAppWindow({
    display: runtime.display,
    xauthority: runtime.xauthority,
    url,
    width,
    height,
  });

  await sleep(waitMs);

  const deadline = Date.now() + timeoutMs;
  let targetWindow = null;

  while (Date.now() <= deadline) {
    const windows = await listChromeWindows(runtime);
    const matchingWindows = windows
      .filter((windowInfo) => windowInfo.title === expectedTitle)
      .sort((left, right) => left.numericId - right.numericId);
    targetWindow =
      matchingWindows.find((windowInfo) => !existingIds.has(windowInfo.id)) ??
      matchingWindows.at(-1) ??
      null;

    if (targetWindow !== null) {
      break;
    }

    await sleep(pollMs);
  }

  assert(
    targetWindow !== null,
    `Could not locate a Chrome window titled "${expectedTitle}" after opening ${url}.`,
  );

  return {
    extensionId,
    url,
    windowId: targetWindow.id,
    title: targetWindow.title,
    display: runtime.display,
    xauthority: runtime.xauthority,
  };
}

export async function captureRdpExtensionWindow({
  projectRoot,
  routePath,
  expectedTitle,
  outputPath,
  width,
  height,
  waitMs = 3000,
  pollMs = 400,
  timeoutMs = 8000,
}) {
  const windowInfo = await openRdpExtensionWindow({
    projectRoot,
    routePath,
    expectedTitle,
    width,
    height,
    waitMs,
    pollMs,
    timeoutMs,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await runX11Command({
    command: "import",
    args: ["-window", windowInfo.windowId, outputPath],
    runtime: {
      display: windowInfo.display,
      xauthority: windowInfo.xauthority,
    },
    label: "ImageMagick window capture",
  });

  return {
    extensionId: windowInfo.extensionId,
    url: windowInfo.url,
    windowId: windowInfo.windowId,
    title: windowInfo.title,
    display: windowInfo.display,
    outputPath,
  };
}
