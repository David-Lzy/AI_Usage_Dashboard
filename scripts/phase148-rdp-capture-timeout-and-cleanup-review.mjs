import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp",
  "phase148-rdp-capture-timeout-and-cleanup-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const issues = [];

  await mkdir(outputDir, { recursive: true });

  const cleanupStart = performance.now();
  const cleanupResult = await execFileAsync("node", [
    "./scripts/cleanup-rdp-extension-capture-probes.mjs",
  ]);
  const cleanupDurationMs = Math.round(performance.now() - cleanupStart);

  if (!cleanupResult.stdout.includes("store-screenshot: cleaned")) {
    issues.push("Cleanup command did not emit the expected summary line.");
  }

  const timedCaptureStart = performance.now();
  let timedCaptureFailed = false;
  let timedCaptureMessage = "";

  try {
    await execFileAsync(
      "node",
      [
        "./scripts/capture-rdp-extension-window.mjs",
        "--route",
        "popup",
        "--output",
        path.join(outputDir, "should-not-exist.png"),
      ],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          RDP_BROWSER_X11_COMMAND_TIMEOUT_MS: "1",
        },
      },
    );
    issues.push(
      "RDP capture command unexpectedly succeeded with a 1ms X11 command timeout.",
    );
  } catch (error) {
    timedCaptureFailed = true;
    timedCaptureMessage =
      error instanceof Error ? error.message : String(error);
  }

  const timedCaptureDurationMs = Math.round(performance.now() - timedCaptureStart);

  if (!timedCaptureFailed) {
    issues.push("RDP capture timeout probe did not fail.");
  }

  if (timedCaptureDurationMs > 10000) {
    issues.push(
      `RDP capture timeout probe took ${timedCaptureDurationMs}ms, which is too slow for a cleanup-oriented fast-fail path.`,
    );
  }

  if (
    !timedCaptureMessage.includes("failed within 1ms") &&
    !timedCaptureMessage.includes("rdp-capture: failed to capture extension window")
  ) {
    issues.push("RDP capture timeout probe did not surface the timeout failure clearly.");
  }

  const runbook = await readFile(
    path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Runbook.md"),
    "utf8",
  );

  if (!runbook.includes("store:cleanup-rdp-capture-probes")) {
    issues.push("Store screenshot runbook is missing the cleanup command.");
  }

  const packageJson = JSON.parse(
    await readFile(path.join(projectRoot, "package.json"), "utf8"),
  );

  if (!packageJson.scripts?.["store:cleanup-rdp-capture-probes"]) {
    issues.push("package.json is missing store:cleanup-rdp-capture-probes.");
  }

  if (!packageJson.scripts?.["phase148:review"]) {
    issues.push("package.json is missing phase148:review.");
  }

  await writeFile(
    path.join(outputDir, "phase148-results.json"),
    `${JSON.stringify(
      {
        issues,
        cleanupDurationMs,
        timedCaptureDurationMs,
        timedCaptureMessage,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  if (issues.length > 0) {
    throw new Error(
      `phase148: RDP capture timeout review found ${issues.length} issue(s).\n${issues
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
  }

  console.log("phase148: RDP capture timeout and cleanup workflow verified");
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
