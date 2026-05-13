import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DEFAULT_X11_COMMAND_TIMEOUT_MS = 8000;
const DEFAULT_HOME = process.env.HOME ?? "/home/davidli";
const DEFAULT_RDP_DISPLAY = ":10.0";

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

function buildKnownBrowserCandidates() {
  return [
    {
      label: "Chrome",
      executablePath: "/opt/google/chrome/chrome",
      processMatchers: [
        "/opt/google/chrome/chrome --profile-directory=Default",
        "/usr/bin/google-chrome --profile-directory=Default",
        "/usr/bin/google-chrome-stable --profile-directory=Default",
      ],
      profileDir: path.join(DEFAULT_HOME, ".config", "google-chrome", "Default"),
    },
    {
      label: "Brave",
      executablePath: "/usr/bin/brave-browser",
      processMatchers: [
        "/opt/brave.com/brave/brave --profile-directory=Default",
        "/opt/brave.com/brave/brave-browser --profile-directory=Default",
        "/usr/bin/brave-browser --profile-directory=Default",
      ],
      profileDir: path.join(
        DEFAULT_HOME,
        ".config",
        "BraveSoftware",
        "Brave-Browser",
        "Default",
      ),
    },
  ];
}

function buildConfiguredBrowserCandidate() {
  const executablePath = (
    process.env.RDP_BROWSER_EXECUTABLE_PATH ?? ""
  ).trim();
  const profileDir = (
    process.env.RDP_BROWSER_PROFILE_DIR ??
    process.env.RDP_CHROME_PROFILE_DIR ??
    ""
  ).trim();
  const processMatch = (process.env.RDP_BROWSER_PROCESS_MATCH ?? "").trim();

  if (executablePath.length === 0 && profileDir.length === 0 && processMatch.length === 0) {
    return null;
  }

  return {
    label: "Configured browser",
    executablePath:
      executablePath.length > 0
        ? executablePath
        : "/opt/google/chrome/chrome",
    processMatchers: processMatch.length > 0 ? [processMatch] : [],
    profileDir:
      profileDir.length > 0
        ? profileDir
        : path.join(DEFAULT_HOME, ".config", "google-chrome", "Default"),
  };
}

function candidateKey(candidate) {
  return `${candidate.executablePath}::${candidate.profileDir}`;
}

export function listRdpBrowserCandidates() {
  const candidates = [];
  const configuredCandidate = buildConfiguredBrowserCandidate();

  if (configuredCandidate !== null) {
    candidates.push(configuredCandidate);
  }

  const seen = new Set(candidates.map(candidateKey));

  for (const candidate of buildKnownBrowserCandidates()) {
    const key = candidateKey(candidate);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    candidates.push(candidate);
  }

  return candidates;
}

function candidateLooksAvailable(candidate) {
  return existsSync(candidate.executablePath) || existsSync(candidate.profileDir);
}

export function resolvePreferredRdpBrowserCandidate() {
  const candidates = listRdpBrowserCandidates();
  return candidates.find(candidateLooksAvailable) ?? candidates[0];
}

function buildPreferencesPath(profileDir) {
  return path.join(profileDir, "Preferences");
}

function getFallbackDisplay() {
  return process.env.RDP_BROWSER_DISPLAY ?? process.env.RDP_CHROME_DISPLAY ?? DEFAULT_RDP_DISPLAY;
}

function getFallbackXauthority() {
  return (
    process.env.RDP_BROWSER_XAUTHORITY ??
    process.env.RDP_CHROME_XAUTHORITY ??
    path.join(DEFAULT_HOME, ".Xauthority")
  );
}

function getX11CommandTimeoutMs() {
  const rawTimeout = Number.parseInt(
    process.env.RDP_BROWSER_X11_COMMAND_TIMEOUT_MS ??
      process.env.RDP_CHROME_X11_COMMAND_TIMEOUT_MS ??
      "",
    10,
  );

  return Number.isFinite(rawTimeout) && rawTimeout > 0
    ? rawTimeout
    : DEFAULT_X11_COMMAND_TIMEOUT_MS;
}

function parseWindowTree(rawOutput) {
  return rawOutput
    .split("\n")
    .map((line) =>
      line.match(
        /^\s*(0x[0-9a-f]+)\s+"([^"]+)"(?:\:\s+\("([^"]+)"\s+"([^"]+)"\))?/i,
      ),
    )
    .filter(Boolean)
    .map((match) => ({
      id: match[1],
      title: match[2],
      className: match[3] ?? "",
      classType: match[4] ?? "",
      numericId: parseHexWindowId(match[1]),
    }));
}

async function detectRuntimeEnvironmentFromProcess(browser) {
  for (const processMatch of browser.processMatchers) {
    if (processMatch.length === 0) {
      continue;
    }

    try {
      const { stdout } = await execFileAsync("pgrep", ["-af", processMatch]);
      const lines = stdout
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const primaryLine =
        lines.find((line) => !line.includes(" --type=")) ?? lines.at(0) ?? "";
      const pid = primaryLine.split(" ")[0] ?? "";

      if (pid.length === 0) {
        continue;
      }

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

      assert(
        display.length > 0,
        `Could not detect DISPLAY from the running ${browser.label} process.`,
      );
      assert(
        xauthority.length > 0,
        `Could not detect XAUTHORITY from the running ${browser.label} process.`,
      );

      return {
        pid,
        display,
        xauthority,
        browserLabel: browser.label,
        executablePath: browser.executablePath,
        profileDir: browser.profileDir,
      };
    } catch {
      // Try the next process matcher.
    }
  }

  throw new Error(`Could not find the primary ${browser.label} profile process.`);
}

export async function detectRdpBrowserRuntimeEnvironment({
  browser = resolvePreferredRdpBrowserCandidate(),
} = {}) {
  try {
    return await detectRuntimeEnvironmentFromProcess(browser);
  } catch {
    return {
      pid: "",
      display: getFallbackDisplay(),
      xauthority: getFallbackXauthority(),
      browserLabel: browser.label,
      executablePath: browser.executablePath,
      profileDir: browser.profileDir,
    };
  }
}

export async function detectChromeRuntimeEnvironment() {
  return detectRdpBrowserRuntimeEnvironment();
}

export async function detectLoadedExtensionRuntime({
  projectRoot,
  browserCandidates = listRdpBrowserCandidates(),
}) {
  const expectedPath = path.join(projectRoot, "dist");
  const attemptedPreferencesPaths = [];

  for (const browser of browserCandidates) {
    const preferencesPath = buildPreferencesPath(browser.profileDir);
    attemptedPreferencesPaths.push(preferencesPath);

    if (!existsSync(preferencesPath)) {
      continue;
    }

    const preferences = JSON.parse(await readFile(preferencesPath, "utf8"));
    const extensionSettings = preferences?.extensions?.settings ?? {};

    for (const [extensionId, record] of Object.entries(extensionSettings)) {
      const recordPath =
        record && typeof record === "object" && typeof record.path === "string"
          ? path.resolve(record.path)
          : "";

      if (recordPath === expectedPath) {
        return {
          extensionId,
          browser,
          preferencesPath,
        };
      }
    }
  }

  throw new Error(
    `Could not detect the loaded unpacked extension id for ${expectedPath} in ${attemptedPreferencesPaths.join(", ")}.`,
  );
}

export async function detectLoadedExtensionId({ projectRoot }) {
  const runtime = await detectLoadedExtensionRuntime({ projectRoot });
  return runtime.extensionId;
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

async function listBrowserWindows(runtime) {
  const { stdout } = await runX11Command({
    command: "xwininfo",
    args: ["-root", "-tree"],
    runtime,
    label: "xwininfo window-tree probe",
  });

  return parseWindowTree(stdout);
}

async function closeBrowserWindow(runtime, windowId) {
  await runX11Command({
    command: "xkill",
    args: ["-id", windowId],
    runtime,
    label: `xkill close-window ${windowId}`,
  });
}

function spawnBrowserAppWindow({ browser, display, xauthority, url, width, height }) {
  const child = spawn(
    browser.executablePath,
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
  const extensionRuntime = await detectLoadedExtensionRuntime({ projectRoot });
  const runtime = await detectRdpBrowserRuntimeEnvironment({
    browser: extensionRuntime.browser,
  });
  const url = `chrome-extension://${extensionRuntime.extensionId}/${routePath}`;
  const existingWindows = await listBrowserWindows(runtime);
  const existingIds = new Set(
    existingWindows
      .filter(
        (windowInfo) =>
          windowInfo.title === expectedTitle ||
          windowInfo.className.startsWith(`${extensionRuntime.extensionId}__`),
      )
      .map((windowInfo) => windowInfo.id),
  );

  spawnBrowserAppWindow({
    browser: extensionRuntime.browser,
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
    const windows = await listBrowserWindows(runtime);
    const matchingWindows = windows
      .filter(
        (windowInfo) =>
          windowInfo.title === expectedTitle ||
          windowInfo.className.startsWith(`${extensionRuntime.extensionId}__`),
      )
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
    `Could not locate a ${extensionRuntime.browser.label} window titled "${expectedTitle}" after opening ${url}.`,
  );

  return {
    extensionId: extensionRuntime.extensionId,
    url,
    windowId: targetWindow.id,
    title: targetWindow.title,
    display: runtime.display,
    xauthority: runtime.xauthority,
    browserLabel: extensionRuntime.browser.label,
    browserExecutablePath: extensionRuntime.browser.executablePath,
    profileDir: extensionRuntime.browser.profileDir,
  };
}

export async function closeRdpExtensionWindow({
  windowId,
  display,
  xauthority,
  waitMs = 400,
}) {
  await closeBrowserWindow({ display, xauthority }, windowId);
  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

export async function closeRdpExtensionWindows({
  runtime,
  titles = ["AI Usage Dashboard", "AI Usage Dashboard Popup"],
  waitMs = 400,
}) {
  const resolvedRuntime =
    runtime ?? (await detectRdpBrowserRuntimeEnvironment());
  const windows = (await listBrowserWindows(resolvedRuntime)).filter((windowInfo) =>
    titles.includes(windowInfo.title),
  );

  for (const windowInfo of windows.sort((left, right) => right.numericId - left.numericId)) {
    await closeBrowserWindow(resolvedRuntime, windowInfo.id);
    if (waitMs > 0) {
      await sleep(waitMs);
    }
  }

  return {
    closedCount: windows.length,
    windows,
    display: resolvedRuntime.display,
    xauthority: resolvedRuntime.xauthority,
    browserLabel: resolvedRuntime.browserLabel ?? null,
    browserExecutablePath: resolvedRuntime.executablePath ?? null,
    profileDir: resolvedRuntime.profileDir ?? null,
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
  closeAfterCapture = false,
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

  if (closeAfterCapture) {
    await closeRdpExtensionWindow({
      windowId: windowInfo.windowId,
      display: windowInfo.display,
      xauthority: windowInfo.xauthority,
    });
  }

  return {
    extensionId: windowInfo.extensionId,
    url: windowInfo.url,
    windowId: windowInfo.windowId,
    title: windowInfo.title,
    display: windowInfo.display,
    outputPath,
    browserLabel: windowInfo.browserLabel,
    browserExecutablePath: windowInfo.browserExecutablePath,
    profileDir: windowInfo.profileDir,
  };
}
