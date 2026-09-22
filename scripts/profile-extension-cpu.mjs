import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

import { findBrowserRootPid, getExtensionRendererRows, isExtensionRenderer, listProcesses, resolveClockTicksPerSecond, sampleRendererCpu } from "./lib/extension-cpu-sampling.mjs";

const projectRoot = process.cwd();
const extensionPath = path.resolve(getStringArg("--extension") ?? path.join(process.env.AI_USAGE_BUILD_ROOT ?? path.join(projectRoot, "dist"), "chrome"));
const artifactRoot = path.resolve(getStringArg("--output") ?? path.join(projectRoot, "tmp/output/extension-cpu-profile"));
await mkdir(artifactRoot, { recursive: true });
const artifactDir = await mkdtemp(path.join(artifactRoot, "run-"));
const userDataDir = path.join(artifactDir, "profile");
const sampleCount = getNumberArg("--sample-count", 10);
const intervalMs = getNumberArg("--interval-ms", 3000);
const headed = process.argv.includes("--headed");
const noEffects = process.argv.includes("--no-effects");
const explicitPids = getPidArg();
const currentExtensionRenderers = process.argv.includes(
  "--current-extension-renderers",
);
const clockTicksPerSecond = await resolveClockTicksPerSecond();

function getStringArg(name) {
  return process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

function getNumberArg(name, fallback) {
  const entry = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (!entry) {
    return fallback;
  }

  const value = Number.parseInt(entry.slice(name.length + 1), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getPidArg() {
  const entry = process.argv.find((arg) => arg.startsWith("--pid="));

  if (!entry) {
    return [];
  }

  return entry
    .slice("--pid=".length)
    .split(",")
    .map((pid) => Number.parseInt(pid.trim(), 10))
    .filter((pid) => Number.isFinite(pid) && pid > 0);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findChromeRootPid() { return findBrowserRootPid(userDataDir); }

async function getCurrentExtensionRendererRows() {
  const rows = await listProcesses();

  return rows.filter(isExtensionRenderer);
}

async function getRowsByPid(pids) {
  const pidSet = new Set(pids);
  const rows = await listProcesses();

  return rows.filter((row) => pidSet.has(row.pid));
}

async function collectCpuSample(rootPid) {
  return collectCpuSampleFromRows(() => getExtensionRendererRows(rootPid));
}

async function collectCpuSampleFromRows(resolveRows) {
  const sample = await sampleRendererCpu(resolveRows, { intervalMs, clockTicksPerSecond });
  assert(sample.coverageComplete, "Renderer CPU sample unavailable or process set changed; do not treat as zero");
  return sample;
}

async function runLiveProfile({ id, resolveRows }) {
  await mkdir(artifactDir, { recursive: true });

  const samples = [];

  console.log(
    `Profiling ${id}; sample_count=${sampleCount}, interval_ms=${intervalMs}`,
  );

  for (let index = 0; index < sampleCount; index += 1) {
    const sample = await collectCpuSampleFromRows(resolveRows);
    samples.push(sample);
    console.log(
      `sample ${index + 1}/${sampleCount}: cpu=${sample.cpuPercent}% renderers=${sample.extensionRendererCount}`,
    );
  }

  const cpuValues = samples.map((sample) => sample.cpuPercent);
  const output = {
    generatedAt: new Date().toISOString(),
    mode: id,
    attribution: "Unowned exploratory process selection, not verified target-extension CPU. --current-extension-renderers includes other profiles and extensions; --pid includes exactly the supplied processes.",
    sampleCount,
    intervalMs,
    avgCpuPercent: round(
      cpuValues.reduce((sum, value) => sum + value, 0) /
        Math.max(1, cpuValues.length),
    ),
    maxCpuPercent: round(Math.max(0, ...cpuValues)),
    tailCpuPercent: round(cpuValues.at(-1) ?? 0),
    samples,
  };

  await writeFile(
    path.join(artifactDir, "last-run.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(`Wrote ${path.join(artifactDir, "last-run.json")}`);
}

function round(value) {
  return Math.round(value * 10) / 10;
}

async function readExtensionIdFromPreferences() {
  const preferencesPath = path.join(userDataDir, "Default", "Preferences");
  const expectedPath = path.resolve(extensionPath);

  try {
    const preferences = JSON.parse(await readFile(preferencesPath, "utf8"));
    const extensionSettings = preferences.extensions?.settings ?? {};

    for (const [extensionId, setting] of Object.entries(extensionSettings)) {
      if (
        typeof setting === "object" &&
        setting !== null &&
        path.resolve(String(setting.path ?? "")) === expectedPath
      ) {
        return extensionId;
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveExtensionId(context, timeoutMs = 15000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker.url().split("/")[2];
    }

    const extensionId = await readExtensionIdFromPreferences();

    if (extensionId) {
      return extensionId;
    }

    await delay(500);
  }

  throw new Error("Could not resolve loaded extension id.");
}

async function openExtensionPage(context, extensionId, relativeUrl) {
  const page = await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/${addPerfSearch(relativeUrl)}`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#root").waitFor({ timeout: 15000 });
  await page.waitForTimeout(2000);

  return page;
}

function addPerfSearch(relativeUrl) {
  const [pathAndSearch, hash = ""] = relativeUrl.split("#", 2);
  const separator = pathAndSearch.includes("?") ? "&" : "?";
  let nextPathAndSearch = pathAndSearch.includes("perf=1")
    ? pathAndSearch
    : `${pathAndSearch}${separator}perf=1`;

  if (noEffects && !nextPathAndSearch.includes("perfNoEffects=1")) {
    nextPathAndSearch += `${nextPathAndSearch.includes("?") ? "&" : "?"}perfNoEffects=1`;
  }

  return hash ? `${nextPathAndSearch}#${hash}` : nextPathAndSearch;
}

async function readPerformanceDebugSnapshots(pages) {
  return Promise.all(
    pages.map(async (page, index) => {
      try {
        const snapshot = await page.evaluate(() => {
          const debugApi = window.__AI_USAGE_PERF_DEBUG__;

          return debugApi?.snapshot?.() ?? null;
        });

        return {
          pageIndex: index,
          url: page.url(),
          snapshot,
        };
      } catch (error) {
        return {
          pageIndex: index,
          url: page.url(),
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );
}

async function maybeClickFirst(page, selector) {
  const target = page.locator(selector).first();

  try {
    await target.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    return true;
  } catch {
    return false;
  }
}

async function maybeClickButtonByText(page, pattern) {
  const target = page.getByRole("button").filter({ hasText: pattern }).first();

  try {
    await target.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    return true;
  } catch {
    return false;
  }
}

async function launchExtensionContext() {
  const launchCandidates = [
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? [{ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, headless: !headed }] : []),
    { channel: "chromium", headless: !headed },
    { channel: "chrome", headless: !headed },
    { executablePath: "/usr/bin/google-chrome", headless: !headed },
    { headless: !headed },
  ];
  let lastError = null;

  for (const launchOptions of launchCandidates) {
    let candidateContext;

    try {
      candidateContext = await chromium.launchPersistentContext(userDataDir, {
        ...launchOptions,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
          "--no-first-run",
        ],
      });
      const extensionId = await resolveExtensionId(candidateContext, 15000);

      return {
        context: candidateContext,
        extensionId,
      };
    } catch (error) {
      lastError = error;
      await candidateContext?.close().catch(() => {});
    }
  }

  throw lastError ?? new Error("Unable to launch Chromium.");
}

async function runScenario({ id, setup }, context, extensionId, rootPid) {
  const pages = [];
  const notes = [];

  try {
    const setupResult = await setup(context, extensionId, notes);

    pages.push(...setupResult);
    await delay(2000);

    const samples = [];

    for (let index = 0; index < sampleCount; index += 1) {
      samples.push(await collectCpuSample(rootPid));
    }

    const cpuValues = samples.map((sample) => sample.cpuPercent);
    const maxCpuPercent = Math.max(0, ...cpuValues);
    const avgCpuPercent =
      cpuValues.length === 0
        ? 0
        : cpuValues.reduce((sum, value) => sum + value, 0) / cpuValues.length;
    const tailCpuPercent =
      cpuValues.length === 0 ? 0 : cpuValues[cpuValues.length - 1];
    const performanceDebugSnapshots =
      await readPerformanceDebugSnapshots(pages);

    return {
      id,
      status: "ok",
      notes,
      sampleCount,
      intervalMs,
      avgCpuPercent: round(avgCpuPercent),
      maxCpuPercent: round(maxCpuPercent),
      tailCpuPercent: round(tailCpuPercent),
      performanceDebugSnapshots,
      samples,
    };
  } catch (error) {
    return {
      id,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      notes,
    };
  } finally {
    await Promise.all(pages.map((page) => page.close().catch(() => {})));
  }
}

const scenarios = [
  {
    id: "dashboard-idle",
    setup: async (context, extensionId) => [
      await openExtensionPage(
        context,
        extensionId,
        "src/sidepanel/index.html?surface=full-page#dashboard",
      ),
    ],
  },
  {
    id: "settings-idle",
    setup: async (context, extensionId) => [
      await openExtensionPage(
        context,
        extensionId,
        "src/sidepanel/index.html?surface=full-page#settings",
      ),
    ],
  },
  {
    id: "settings-plus-popup-idle",
    setup: async (context, extensionId) => [
      await openExtensionPage(
        context,
        extensionId,
        "src/sidepanel/index.html?surface=full-page#settings",
      ),
      await openExtensionPage(context, extensionId, "src/popup/index.html"),
    ],
  },
  {
    id: "settings-more-ui-preview",
    setup: async (context, extensionId, notes) => {
      const page = await openExtensionPage(
        context,
        extensionId,
        "src/sidepanel/index.html?surface=full-page#settings",
      );
      const clicked = await maybeClickButtonByText(
        page,
        /More UI|更多 UI|UI 设置|Toolbar popup|工具栏弹窗/i,
      );

      notes.push(
        clicked
          ? "Clicked a More UI / toolbar popup related button."
          : "No More UI / toolbar popup button matched in this locale.",
      );

      return [page];
    },
  },
  {
    id: "settings-dropdown-open",
    setup: async (context, extensionId, notes) => {
      const page = await openExtensionPage(
        context,
        extensionId,
        "src/sidepanel/index.html?surface=full-page#settings",
      );
      const clicked = await maybeClickFirst(
        page,
        ".material-select__button, .color-choice-dropdown__button, .progress-gradient-scheme-dropdown__button",
      );

      notes.push(
        clicked
          ? "Opened the first detected custom dropdown."
          : "No custom dropdown button matched.",
      );

      return [page];
    },
  },
  {
    id: "popup-idle",
    setup: async (context, extensionId) => [
      await openExtensionPage(context, extensionId, "src/popup/index.html"),
    ],
  },
];

if (explicitPids.length > 0) {
  await runLiveProfile({
    id: `live-pid-${explicitPids.join("-")}`,
    resolveRows: () => getRowsByPid(explicitPids),
  });
  process.exit(0);
}

if (currentExtensionRenderers) {
  await runLiveProfile({
    id: "current-extension-renderers",
    resolveRows: getCurrentExtensionRendererRows,
  });
  process.exit(0);
}

assert(
  await readFile(path.join(extensionPath, "manifest.json"), "utf8").then(
    () => true,
    () => false,
  ),
  "dist/chrome/manifest.json is missing. Run `npm run build` first.",
);

await mkdir(artifactDir, { recursive: true });

let context;

try {
  const launchResult = await launchExtensionContext();
  context = launchResult.context;
  const extensionId = launchResult.extensionId;
  const rootPid = await findChromeRootPid();
  const results = [];

  console.log(
    `Profiling extension ${extensionId} with root PID ${rootPid}; sample_count=${sampleCount}, interval_ms=${intervalMs}`,
  );

  for (const scenario of scenarios) {
    console.log(`scenario ${scenario.id}: start`);
    const result = await runScenario(scenario, context, extensionId, rootPid);
    results.push(result);

    if (result.status === "ok") {
      console.log(
        `scenario ${scenario.id}: avg=${result.avgCpuPercent}% max=${result.maxCpuPercent}% tail=${result.tailCpuPercent}%`,
      );
    } else {
      console.log(`scenario ${scenario.id}: error=${result.error}`);
    }
  }

  if (results.some((result) => result.status !== "ok")) process.exitCode = 1;

  const output = {
    generatedAt: new Date().toISOString(),
    extensionPath,
    userDataDir,
    measurementClass: "Exploratory unseeded surface observations; scenario names describe requested setup, not verified reproducible UI state. Use perf:popup:baseline for controlled popup comparisons.",
    extensionId,
    rootPid,
    sampleCount,
    intervalMs,
    headed,
    noEffects,
    results,
  };

  await writeFile(
    path.join(artifactDir, "last-run.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(`Wrote ${path.join(artifactDir, "last-run.json")}`);
} finally {
  await context?.close().catch(() => {});
}
