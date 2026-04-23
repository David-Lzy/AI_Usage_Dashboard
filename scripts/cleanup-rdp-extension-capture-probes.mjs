import { execFile } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const TARGET_PATTERNS = [
  "xwininfo -root -tree",
  "import -window",
  "node ./scripts/capture-store-screenshot-request-from-rdp.mjs",
  "node ./scripts/apply-rdp-store-screenshot-seed.mjs",
];

function parsePsLines(rawOutput) {
  return rawOutput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [pidToken, ...rest] = line.split(/\s+/);
      const pid = Number.parseInt(pidToken, 10);
      return {
        pid,
        command: rest.join(" "),
      };
    })
    .filter((entry) => Number.isFinite(entry.pid) && entry.command.length > 0);
}

async function listProcesses() {
  const { stdout } = await execFileAsync("ps", ["-eo", "pid,args"]);
  return parsePsLines(stdout);
}

async function run() {
  const currentPid = process.pid;
  const parentPid = process.ppid;
  const processes = await listProcesses();
  const matchingProcesses = processes.filter(
    (entry) =>
      entry.pid !== currentPid &&
      entry.pid !== parentPid &&
      TARGET_PATTERNS.some((pattern) => entry.command.includes(pattern)),
  );

  for (const entry of matchingProcesses) {
    try {
      process.kill(entry.pid, "SIGKILL");
    } catch {
      // Ignore processes that already exited.
    }
  }

  console.log(
    `store-screenshot: cleaned ${matchingProcesses.length} stale RDP capture probe process(es)`,
  );
}

void run().catch((error) => {
  console.error("store-screenshot: failed to clean stale RDP capture probe processes");
  console.error(error);
  process.exitCode = 1;
});
