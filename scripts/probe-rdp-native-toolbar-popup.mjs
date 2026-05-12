import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

import {
  detectLoadedExtensionRuntime,
  detectRdpBrowserRuntimeEnvironment,
} from "./lib/rdp-extension-runtime-capture.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const DEFAULT_TIMEOUT_MS = 12000;
const HELPER_TITLE = "AI Usage Dashboard Native Popup Probe";
const POPUP_TITLE = "AI Usage Dashboard Popup";

function parseArgs(argv) {
  const options = {
    output: path.join(
      projectRoot,
      "tmp",
      "native-toolbar-popup-probe",
      "native-toolbar-popup-probe.png",
    ),
    results: path.join(
      projectRoot,
      "tmp",
      "native-toolbar-popup-probe",
      "native-toolbar-popup-probe-results.json",
    ),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--output") {
      options.output = path.resolve(projectRoot, argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (arg === "--results") {
      options.results = path.resolve(projectRoot, argv[index + 1] ?? "");
      index += 1;
    }
  }

  return options;
}

function parseHexWindowId(value) {
  return Number.parseInt(value, 16);
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildHelperOutputPath(outputPath) {
  return outputPath.endsWith(".png")
    ? outputPath.replace(/\.png$/i, "-helper-window.png")
    : `${outputPath}-helper-window.png`;
}

async function runX11Command({ runtime, command, args, label, timeoutMs = DEFAULT_TIMEOUT_MS }) {
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
    runtime,
    command: "xwininfo",
    args: ["-root", "-tree"],
    label: "xwininfo window-tree probe",
  });

  return parseWindowTree(stdout);
}

async function captureWindowById({ runtime, windowId, outputPath }) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await runX11Command({
    runtime,
    command: "import",
    args: ["-window", windowId, outputPath],
    label: "ImageMagick native-popup capture",
  });
}

async function closeWindowById(runtime, windowId) {
  await runX11Command({
    runtime,
    command: "xkill",
    args: ["-id", windowId],
    label: `xkill close-window ${windowId}`,
  }).catch(() => undefined);
}

function spawnBrowserUrlWindow({ browser, runtime, url, width, height }) {
  const child = spawn(
    browser.executablePath,
    [
      "--profile-directory=Default",
      "--new-window",
      url,
      `--window-size=${width},${height}`,
    ],
    {
      env: {
        ...process.env,
        DISPLAY: runtime.display,
        XAUTHORITY: runtime.xauthority,
      },
      detached: true,
      stdio: "ignore",
    },
  );

  child.unref();
}

function pickHelperWindow(windows, existingIds) {
  return (
    windows
      .filter(
        (windowInfo) =>
          !existingIds.has(windowInfo.id) &&
          windowInfo.title.includes(HELPER_TITLE),
      )
      .sort((left, right) => left.numericId - right.numericId)
      .at(-1) ?? null
  );
}

function pickPopupCandidate(windows, existingIds, helperWindowId) {
  return (
    windows
      .filter((windowInfo) => !existingIds.has(windowInfo.id))
      .filter((windowInfo) => windowInfo.id !== helperWindowId)
      .filter(
        (windowInfo) =>
          windowInfo.title === POPUP_TITLE ||
          windowInfo.title.includes(POPUP_TITLE) ||
          (windowInfo.title.includes("AI Usage Dashboard") &&
            !windowInfo.title.includes(HELPER_TITLE)),
      )
      .sort((left, right) => left.numericId - right.numericId)
      .at(-1) ?? null
  );
}

export async function probeRdpNativeToolbarPopup({ outputPath, resultsPath }) {
  const extensionRuntime = await detectLoadedExtensionRuntime({ projectRoot });
  const runtime = await detectRdpBrowserRuntimeEnvironment({
    browser: extensionRuntime.browser,
  });
  const extensionId = extensionRuntime.extensionId;
  const helperUrl = `chrome-extension://${extensionId}/src/sidepanel/index.html#debug-native-popup-probe`;
  const beforeWindows = await listBrowserWindows(runtime);
  const existingIds = new Set(beforeWindows.map((windowInfo) => windowInfo.id));
  const beforeTitles = beforeWindows.map((windowInfo) => windowInfo.title);

  spawnBrowserUrlWindow({
    browser: extensionRuntime.browser,
    runtime,
    url: helperUrl,
    width: 1280,
    height: 900,
  });

  const deadline = Date.now() + DEFAULT_TIMEOUT_MS;
  let helperWindow = null;
  let helperSnapshot = beforeWindows;

  while (Date.now() <= deadline) {
    helperSnapshot = await listBrowserWindows(runtime);
    helperWindow = pickHelperWindow(helperSnapshot, existingIds);

    if (helperWindow !== null) {
      break;
    }

    await sleep(400);
  }

  if (helperWindow === null) {
    const result = {
      ok: false,
      reason: "helper_window_not_found",
      browserLabel: extensionRuntime.browser.label,
      browserExecutablePath: extensionRuntime.browser.executablePath,
      profileDir: extensionRuntime.browser.profileDir,
      helperUrl,
      beforeTitles,
      afterTitles: helperSnapshot.map((windowInfo) => windowInfo.title),
    };
    await mkdir(path.dirname(resultsPath), { recursive: true });
    await writeFile(resultsPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    throw new Error(
      `Could not find a ${extensionRuntime.browser.label} window whose title included "${HELPER_TITLE}".`,
    );
  }

  let popupWindow = null;
  let finalSnapshot = helperSnapshot;
  const helperOutputPath = buildHelperOutputPath(outputPath);

  while (Date.now() <= deadline) {
    finalSnapshot = await listBrowserWindows(runtime);
    popupWindow = pickPopupCandidate(finalSnapshot, existingIds, helperWindow.id);

    if (popupWindow !== null) {
      break;
    }

    await sleep(400);
  }

  const result = {
    ok: popupWindow !== null,
    browserLabel: extensionRuntime.browser.label,
    browserExecutablePath: extensionRuntime.browser.executablePath,
    profileDir: extensionRuntime.browser.profileDir,
    helperUrl,
    helperWindow,
    popupWindow,
    helperOutputPath: path.relative(projectRoot, helperOutputPath),
    outputPath: popupWindow ? path.relative(projectRoot, outputPath) : null,
    beforeTitles,
    afterTitles: finalSnapshot.map((windowInfo) => windowInfo.title),
    newWindows: finalSnapshot
      .filter((windowInfo) => !existingIds.has(windowInfo.id))
      .map((windowInfo) => ({ id: windowInfo.id, title: windowInfo.title })),
  };

  try {
    await captureWindowById({ runtime, windowId: helperWindow.id, outputPath: helperOutputPath });

    if (popupWindow !== null) {
      await captureWindowById({ runtime, windowId: popupWindow.id, outputPath });
    }
  } finally {
    if (popupWindow !== null) {
      await closeWindowById(runtime, popupWindow.id);
    }
    await closeWindowById(runtime, helperWindow.id);
  }

  await mkdir(path.dirname(resultsPath), { recursive: true });
  await writeFile(resultsPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  if (popupWindow === null) {
    throw new Error(
      `The native toolbar popup did not appear as a capturable X11 window. New windows: ${result.newWindows.map((item) => item.title).join(", ") || "none"}.`,
    );
  }

  return result;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const result = await probeRdpNativeToolbarPopup({
    outputPath: options.output,
    resultsPath: options.results,
  });

  console.log(
    `store-screenshot: native toolbar popup captured window=${result.popupWindow.id} output=${result.outputPath}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void run().catch((error) => {
    console.error("store-screenshot: failed to probe native toolbar popup");
    console.error(error);
    process.exitCode = 1;
  });
}
