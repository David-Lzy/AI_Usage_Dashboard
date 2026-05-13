import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const requestId = "2026-04-24-surface-expansion-store-screenshot-refresh-request";
const requestDir = `Doc/testing/store_screenshot_capture_requests/${requestId}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readUtf8(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

const template = JSON.parse(
  await readUtf8("fixtures/store-screenshot/operator-capture-request-template.fixture.json"),
);
assert(
  template.selectionPackPath === "Doc/Store/Store_Screenshot_Selection_Pack.md" &&
    template.baselineArchiveReadme ===
      "Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md" &&
    template.captureAutomationMode === "manual_capture_required",
  "Store screenshot request template did not record the expected selection-pack, baseline-archive, and manual-capture fields.",
);
assert(
  template.workflow.some((item) => item.includes("native Chrome toolbar action bubble")) &&
    template.workflow.some((item) => item.includes("full-page shell")),
  "Store screenshot request template workflow does not record the expected native-popup and full-page-shell capture rules.",
);

const captureRunner = await readUtf8("scripts/capture-store-screenshot-request-from-rdp.mjs");
assert(
  captureRunner.includes("requires manual capture and cannot use the request-bound RDP runner"),
  "RDP request-bound capture runner does not reject manual-only screenshot requests.",
);

const refreshScript = await readUtf8("scripts/refresh-store-screenshot-capture-request-packages.mjs");
assert(
  refreshScript.includes("manifest.status === STORE_SCREENSHOT_CAPTURE_REQUEST_PENDING_STATUS") &&
    refreshScript.includes(": manifest;"),
  "Request-package refresh script does not preserve fulfilled request manifests as historical refresh sources.",
);

const manifest = JSON.parse(await readUtf8(`${requestDir}/capture-request.json`));
assert(
  manifest.status === "pending_operator_capture" &&
    manifest.captureAutomationMode === "manual_capture_required" &&
    manifest.selectionPackPath === "Doc/Store/Store_Screenshot_Selection_Pack.md" &&
    manifest.baselineArchiveReadme ===
      "Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md",
  "Refreshed pending screenshot request manifest does not reflect the expected manual-capture contract.",
);

const requestReadme = await readUtf8(`${requestDir}/README.md`);
assert(
  requestReadme.includes("manual_capture_required") &&
    requestReadme.includes("native Chrome toolbar action bubble") &&
    requestReadme.includes("full-page shell") &&
    requestReadme.includes("Store_Screenshot_Selection_Pack.md"),
  "Refreshed pending screenshot request README does not describe the expected manual popup and full-page shell workflow.",
);

const requestIndex = JSON.parse(
  await readUtf8("Doc/testing/store_screenshot_capture_requests/index.json"),
);
assert(
  requestIndex.pendingRequestCount === 1 && requestIndex.fulfilledRequestCount === 1,
  "Screenshot request index does not show the expected 1 pending / 1 fulfilled state.",
);
const pendingRecord = requestIndex.records.find((record) => record.requestId === requestId);
assert(
  pendingRecord &&
    pendingRecord.captureAutomationMode === "manual_capture_required" &&
    pendingRecord.selectionPackPath === "Doc/Store/Store_Screenshot_Selection_Pack.md",
  "Screenshot request index did not record the refreshed pending request with the expected manual-capture metadata.",
);
const fulfilledRecord = requestIndex.records.find(
  (record) => record.requestId === "2026-04-24-first-real-store-screenshot-capture-request",
);
assert(
  fulfilledRecord && fulfilledRecord.captureAutomationMode === "request_bound_rdp_runner",
  "Historical fulfilled screenshot request did not preserve its request-bound automation mode during refresh.",
);

const requestsLedger = await readUtf8("Doc/testing/Store_Screenshot_Capture_Requests.md");
assert(
  requestsLedger.includes("1 pending / 5") === false &&
    requestsLedger.includes("Create a new pending store screenshot capture request") &&
    requestsLedger.includes("manual_capture_required") &&
    requestsLedger.includes(requestId),
  "Store screenshot request ledger does not reflect the refreshed pending request state.",
);

const runbook = await readUtf8("Doc/testing/Store_Screenshot_Capture_Runbook.md");
assert(
  runbook.includes(`${requestId}/README.md`) &&
    runbook.includes("fulfilled requests now refresh from their recorded manifest state"),
  "Store screenshot runbook does not describe the current manual request or fulfilled-refresh boundary.",
);

console.log("phase162: refreshed store screenshot request verified");
