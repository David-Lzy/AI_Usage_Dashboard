import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { chromium } from "playwright";

const execFileAsync = promisify(execFile);

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(projectRoot, "tmp", "extension-cpu-profile");
const userDataDir = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-cpu-"));
const sampleCount = getNumberArg("--sample-count", 10);
const intervalMs = getNumberArg("--interval-ms", 3000);
const headed = process.argv.includes("--headed");
const explicitPids = getPidArg();
const currentExtensionRenderers = process.argv.includes(
  "--current-extension-renderers",
);
const clockTicksPerSecond = await resolveClockTicksPerSecond();

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

async function resolveClockTicksPerSecond() {
  try {
    const { stdout } = await execFileAsync("getconf", ["CLK_TCK"]);
    const value = Number.parseInt(stdout.trim(), 10);

    return Number.isFinite(value) && value > 0 ? value : 100;
  } catch {
    return 100;
  }
}

async function listProcesses() {
  const { stdout } = await execFileAsync("ps", ["-eo", "pid=,ppid=,args="], {
    maxBuffer: 1024 * 1024 * 8,
  });

  return stdout
    .split("\n")
    .map((line) => line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/))
    .filter((match) => match !== null)
    .map((match) => ({
      pid: Number.parseInt(match[1], 10),
      ppid: Number.parseInt(match[2], 10),
      args: match[3],
    }));
}

async function findChromeRootPid() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 10000) {
    const rows = await listProcesses();
    const root = rows.find(
      (row) =>
        row.args.includes(userDataDir) &&
        !row.args.includes("--type=") &&
        /chrome|chromium/i.test(row.args),
    );

    if (root) {
      return root.pid;
    }

    await delay(250);
  }

  throw new Error("Could not resolve launched Chrome root process.");
}

function collectDescendants(rows, rootPid) {
  const childrenByParent = new Map();

  for (const row of rows) {
    const children = childrenByParent.get(row.ppid) ?? [];
    children.push(row);
    childrenByParent.set(row.ppid, children);
  }

  const descendants = [];
  const pending = [...(childrenByParent.get(rootPid) ?? [])];

  while (pending.length > 0) {
    const row = pending.shift();

    if (!row) {
      continue;
    }

    descendants.push(row);
    pending.push(...(childrenByParent.get(row.pid) ?? []));
  }

  return descendants;
}

function isExtensionRenderer(row) {
  return (
    row.args.includes("--type=renderer") &&
    row.args.includes("--extension-process")
  );
}

async function readCpuTicks(pid) {
  try {
    const stat = await readFile(`/proc/${pid}/stat`, "utf8");
    const tail = stat.slice(stat.lastIndexOf(")") + 2).trim().split(/\s+/);
    const userTicks = Number.parseInt(tail[11], 10);
    const systemTicks = Number.parseInt(tail[12], 10);

    if (!Number.isFinite(userTicks) || !Number.isFinite(systemTicks)) {
      return null;
    }

    return userTicks + systemTicks;
  } catch {
    return null;
  }
}

async function getExtensionRendererRows(rootPid) {
  const rows = await listProcesses();

  return collectDescendants(rows, rootPid).filter(isExtensionRenderer);
}

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
  const beforeRows = await resolveRows();
  const beforeTicks = new Map();
  const startedAt = process.hrtime.bigint();

  await Promise.all(
    beforeRows.map(async (row) => {
      const ticks = await readCpuTicks(row.pid);

      if (ticks !== null) {
        beforeTicks.set(row.pid, ticks);
      }
    }),
  );

  await delay(intervalMs);

  const afterRows = await resolveRows();
  const afterTicks = new Map();

  await Promise.all(
    afterRows.map(async (row) => {
      const ticks = await readCpuTicks(row.pid);

      if (ticks !== null) {
        afterTicks.set(row.pid, ticks);
      }
    }),
  );

  const elapsedSeconds =
    Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
  let totalCpuPercent = 0;
  const rowsByPid = new Map(afterRows.map((row) => [row.pid, row]));
  const pidSummaries = [];

  for (const [pid, after] of afterTicks) {
    const before = beforeTicks.get(pid);

    if (before === undefined) {
      continue;
    }

    const cpuPercent =
      ((after - before) / clockTicksPerSecond / elapsedSeconds) * 100;

    totalCpuPercent += cpuPercent;
    pidSummaries.push({
      pid,
      cpuPercent: round(cpuPercent),
      args: summarizeArgs(rowsByPid.get(pid)?.args ?? ""),
    });
  }

  return {
    cpuPercent: round(totalCpuPercent),
    extensionRendererCount: afterRows.length,
    pids: pidSummaries,
  };
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

function summarizeArgs(args) {
  const clientIdMatch = args.match(/--renderer-client-id=(\d+)/);
  const launchTicksMatch = args.match(/--launch-time-ticks=(\d+)/);

  return [
    clientIdMatch ? `renderer-client-id=${clientIdMatch[1]}` : "renderer",
    launchTicksMatch ? `launch-time-ticks=${launchTicksMatch[1]}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

async function waitForServiceWorker(context, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker;
    }

    await delay(500);
  }

  throw new Error("Timed out waiting for extension service worker to start.");
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
  const nextPathAndSearch = pathAndSearch.includes("perf=1")
    ? pathAndSearch
    : `${pathAndSearch}${separator}perf=1`;

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
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  process.exit(0);
}

if (currentExtensionRenderers) {
  await runLiveProfile({
    id: "current-extension-renderers",
    resolveRows: getCurrentExtensionRendererRows,
  });
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
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

  const output = {
    generatedAt: new Date().toISOString(),
    extensionId,
    rootPid,
    sampleCount,
    intervalMs,
    headed,
    results,
  };

  await writeFile(
    path.join(artifactDir, "last-run.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(`Wrote ${path.join(artifactDir, "last-run.json")}`);
} finally {
  await context?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
