import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp",
  "phase149-store-screenshot-first-archive-review",
);
const requestId = "2026-04-24-first-real-store-screenshot-capture-request";
const archiveId = `${requestId}-archive`;
const requestDir = path.join(
  projectRoot,
  "Doc/testing/store_screenshot_capture_requests",
  requestId,
);
const archiveDir = path.join(
  projectRoot,
  "Doc/testing/store_screenshot_archives",
  archiveId,
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

async function ensureFileExists(filePath) {
  await access(filePath);
}

async function run() {
  const issues = [];

  await mkdir(outputDir, { recursive: true });

  const requestIndex = await readJson(
    path.join(projectRoot, "Doc/testing/store_screenshot_capture_requests/index.json"),
    "Store screenshot request index",
  );
  const archiveIndex = await readJson(
    path.join(projectRoot, "Doc/testing/store_screenshot_archives/index.json"),
    "Store screenshot archive index",
  );
  const requestManifest = await readJson(
    path.join(requestDir, "capture-request.json"),
    "Store screenshot request manifest",
  );
  const requestNotes = await readJson(
    path.join(requestDir, "capture-notes.json"),
    "Store screenshot request notes",
  );
  const archiveManifest = await readJson(
    path.join(archiveDir, "capture-archive.json"),
    "Store screenshot archive manifest",
  );
  const archiveNotes = await readJson(
    path.join(archiveDir, "capture-notes.json"),
    "Store screenshot archive notes",
  );
  const requestReadme = await readFile(path.join(requestDir, "README.md"), "utf8");
  const archiveReadme = await readFile(path.join(archiveDir, "README.md"), "utf8");
  const requestLedger = await readFile(
    path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Requests.md"),
    "utf8",
  );
  const archiveLedger = await readFile(
    path.join(projectRoot, "Doc/testing/Store_Screenshot_Capture_Archive.md"),
    "utf8",
  );

  if (requestIndex.pendingRequestCount !== 0 || requestIndex.fulfilledRequestCount !== 1) {
    issues.push(
      `Request index counts were pending=${requestIndex.pendingRequestCount} fulfilled=${requestIndex.fulfilledRequestCount}, expected 0/1.`,
    );
  }

  if (archiveIndex.recordCount !== 1) {
    issues.push(`Archive index recordCount was ${archiveIndex.recordCount}, expected 1.`);
  }

  if (requestManifest.status !== "fulfilled_operator_capture") {
    issues.push(`Request manifest status was ${requestManifest.status}, expected fulfilled_operator_capture.`);
  }

  if (requestManifest.fulfillment?.archiveId !== archiveId) {
    issues.push("Request manifest fulfillment archiveId did not match the first real archive.");
  }

  if (requestManifest.fulfillment?.reviewedScreenshotCount !== 5) {
    issues.push("Request manifest did not preserve reviewedScreenshotCount=5.");
  }

  if (requestManifest.fulfillment?.truthBoundaryCount !== 5) {
    issues.push("Request manifest did not preserve truthBoundaryCount=5.");
  }

  if (!Array.isArray(requestNotes.notes) || requestNotes.notes.length !== 5) {
    issues.push("Request capture notes did not contain 5 reviewed note entries.");
  }

  if (requestNotes.notes.some((note) => note.captureTruth === "not_reviewed")) {
    issues.push("Request capture notes still contain not_reviewed entries.");
  }

  if (!Array.isArray(archiveNotes.notes) || archiveNotes.notes.length !== 5) {
    issues.push("Archive capture notes did not contain 5 entries.");
  }

  if (archiveNotes.notes.some((note) => note.captureTruth === "not_reviewed")) {
    issues.push("Archive capture notes still contain not_reviewed entries.");
  }

  if (archiveManifest.sourceRequest?.requestId !== requestId) {
    issues.push("Archive manifest did not preserve the source request id.");
  }

  if (archiveManifest.captureNotesSummary?.reviewedScreenshotCount !== 5) {
    issues.push("Archive manifest did not preserve reviewedScreenshotCount=5.");
  }

  if (archiveManifest.captureNotesSummary?.truthBoundaryCount !== 5) {
    issues.push("Archive manifest did not preserve truthBoundaryCount=5.");
  }

  for (const filename of requestManifest.requiredScreenshotFilenames ?? []) {
    await ensureFileExists(path.join(requestDir, "captures", filename)).catch(() => {
      issues.push(`Request capture file was missing: ${filename}`);
    });
    await ensureFileExists(path.join(archiveDir, "screenshots", filename)).catch(() => {
      issues.push(`Archived screenshot file was missing: ${filename}`);
    });
  }

  if (!requestLedger.includes("no pending store screenshot capture requests are recorded yet")) {
    issues.push("Request ledger did not show the empty pending queue.");
  }

  if (!requestLedger.includes("fulfilled_operator_capture")) {
    issues.push("Request ledger did not show the fulfilled request state.");
  }

  if (!archiveLedger.includes(archiveId)) {
    issues.push("Archive ledger did not list the first real screenshot archive.");
  }

  if (!requestReadme.includes("this request package has been fulfilled")) {
    issues.push("Fulfilled request README did not switch to fulfilled status copy.");
  }

  if (!archiveReadme.includes("the screenshots listed below are the durable archived evidence")) {
    issues.push("Archive README did not include the closed-evidence status note.");
  }

  await writeFile(
    path.join(outputDir, "phase149-results.json"),
    `${JSON.stringify(
      {
        issues,
        requestId,
        archiveId,
        pendingRequestCount: requestIndex.pendingRequestCount,
        fulfilledRequestCount: requestIndex.fulfilledRequestCount,
        archiveRecordCount: archiveIndex.recordCount,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  if (issues.length > 0) {
    throw new Error(
      `phase149: first real store screenshot archive review found ${issues.length} issue(s).\n${issues
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
  }

  console.log("phase149: first real store screenshot archive verified");
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
