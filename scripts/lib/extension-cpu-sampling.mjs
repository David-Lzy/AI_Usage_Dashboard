import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function collectDescendants(rows, rootPid) {
  const descendants = [];
  const pending = [rootPid];
  const seen = new Set(pending);
  while (pending.length) {
    const parent = pending.shift();
    for (const row of rows.filter((candidate) => candidate.ppid === parent)) {
      if (seen.has(row.pid)) continue;
      seen.add(row.pid);
      descendants.push(row);
      pending.push(row.pid);
    }
  }
  return descendants;
}

export function parseCpuTicks(stat) {
  const tail = stat.slice(stat.lastIndexOf(")") + 2).trim().split(/\s+/);
  const user = Number(tail[11]);
  const system = Number(tail[12]);
  return Number.isFinite(user) && Number.isFinite(system) ? user + system : null;
}

export function parseProcessCpuIdentity(stat) {
  const tail = stat.slice(stat.lastIndexOf(")") + 2).trim().split(/\s+/);
  const ticks = parseCpuTicks(stat);
  const startedAt = tail[19];
  return ticks !== null && /^\d+$/.test(startedAt ?? "") ? { ticks, startedAt } : null;
}

export function processCpuDelta(before, after) {
  return before && after && before.startedAt === after.startedAt && after.ticks >= before.ticks
    ? after.ticks - before.ticks : null;
}

export async function listProcesses() {
  const { stdout } = await exec("ps", ["-eo", "pid=,ppid=,args="], { maxBuffer: 8 * 1024 * 1024 });
  return stdout.split("\n").map((line) => line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean)
    .map((match) => ({ pid: Number(match[1]), ppid: Number(match[2]), args: match[3] }));
}

export const isExtensionRenderer = (row) => row.args.includes("--type=renderer") && row.args.includes("--extension-process");
export async function getExtensionRendererRows(rootPid) {
  return collectDescendants(await listProcesses(), rootPid).filter(isExtensionRenderer);
}

export async function findBrowserRootPid(profileDir) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const root = (await listProcesses()).find((row) => row.args.includes(`--user-data-dir=${profileDir}`) &&
      !row.args.includes("--type=") && /chrome|chromium/i.test(row.args));
    if (root) return root.pid;
    await delay(250);
  }
  throw new Error("Cannot identify the browser started with this test profile");
}

export async function resolveClockTicksPerSecond() {
  const { stdout } = await exec("getconf", ["CLK_TCK"]);
  const ticks = Number(stdout.trim());
  if (!Number.isFinite(ticks) || ticks <= 0) throw new Error("Cannot determine Linux clock tick rate");
  return ticks;
}

async function readTicks(pid) {
  try { return parseProcessCpuIdentity(await readFile(`/proc/${pid}/stat`, "utf8")); }
  catch { return null; }
}

export async function sampleRendererCpu(resolveRows, { intervalMs, clockTicksPerSecond }) {
  const beforeRows = await resolveRows();
  const before = new Map();
  const start = process.hrtime.bigint();
  for (const row of beforeRows) before.set(row.pid, await readTicks(row.pid));
  await delay(intervalMs);
  const afterRows = await resolveRows();
  const ticks = [];
  for (const row of afterRows) {
    const previous = before.get(row.pid);
    const current = await readTicks(row.pid);
    const delta = processCpuDelta(previous, current);
    if (delta !== null) ticks.push({ pid: row.pid, startedAt: current.startedAt, ticks: delta });
  }
  const elapsedSeconds = Number(process.hrtime.bigint() - start) / 1e9;
  const pids = ticks.map(({ pid, startedAt, ticks: value }) => ({ pid, startedAt, cpuPercent: value / clockTicksPerSecond / elapsedSeconds * 100 }));
  return {
    cpuPercent: pids.length ? pids.reduce((sum, row) => sum + row.cpuPercent, 0) : null,
    elapsedSeconds, extensionRendererCount: afterRows.length, pids,
    coverageComplete: pids.length > 0 && pids.length === beforeRows.length && pids.length === afterRows.length,
  };
}
