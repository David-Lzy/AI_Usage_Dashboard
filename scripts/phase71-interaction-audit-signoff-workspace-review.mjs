import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase71-interaction-audit-signoff-workspace-review",
);
const signoffStorageKey = "ai-usage-dashboard:interaction-audit-signoff:v1";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForAuditHub(page) {
  await page.goto(
    "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit",
    { waitUntil: "networkidle" },
  );
  await page.waitForSelector("[data-audit-surface-id]");
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".interaction-audit-frame")).every(
      (frame) =>
        frame instanceof HTMLIFrameElement &&
        frame.contentDocument?.readyState === "complete",
    ),
  );
}

async function openDraftPreview(page) {
  const details = page.locator("[data-audit-signoff-preview-details]");
  await page.evaluate(() => {
    const preview = document.querySelector("[data-audit-signoff-preview-details]");

    if (preview instanceof HTMLDetailsElement) {
      preview.open = true;
    }
  });
  await details.waitFor();
}

async function readWorkspaceState(page) {
  return page.evaluate(() => {
    function readSummary(id) {
      return (
        document
          .querySelector(
            `[data-audit-signoff-summary-id="${id}"] [data-audit-signoff-summary-value]`,
          )
          ?.textContent?.trim() ?? ""
      );
    }

    const dashboardToggle = document.querySelector(
      '[data-audit-manual-toggle-id="dashboard-360:1"]',
    );
    const popupToggle = document.querySelector(
      '[data-audit-manual-toggle-id="popup-360:1"]',
    );
    const dashboardStatus = document.querySelector(
      '[data-audit-signoff-status-id="dashboard-360"]',
    );
    const popupStatus = document.querySelector(
      '[data-audit-signoff-status-id="popup-360"]',
    );
    const dashboardNotes = document.querySelector(
      '[data-audit-signoff-notes-id="dashboard-360"]',
    );
    const popupNotes = document.querySelector(
      '[data-audit-signoff-notes-id="popup-360"]',
    );

    return {
      reviewedSurfaces: readSummary("reviewed-surfaces"),
      pass: readSummary("pass"),
      followUp: readSummary("follow-up"),
      completedChecks: readSummary("completed-checks"),
      draft:
        document.querySelector("[data-audit-signoff-preview]")?.textContent ?? "",
      feedback:
        document.querySelector("[data-audit-signoff-feedback] .supporting-copy")
          ?.textContent ?? "",
      dashboardFirstCheck:
        dashboardToggle instanceof HTMLInputElement
          ? dashboardToggle.checked
          : false,
      popupFirstCheck:
        popupToggle instanceof HTMLInputElement ? popupToggle.checked : false,
      dashboardStatus:
        dashboardStatus instanceof HTMLSelectElement
          ? dashboardStatus.value
          : "",
      popupStatus:
        popupStatus instanceof HTMLSelectElement ? popupStatus.value : "",
      dashboardNotes:
        dashboardNotes instanceof HTMLTextAreaElement
          ? dashboardNotes.value
          : "",
      popupNotes:
        popupNotes instanceof HTMLTextAreaElement ? popupNotes.value : "",
      hasCopyDraftButton: Boolean(
        document.querySelector("[data-audit-copy-signoff-draft]"),
      ),
      hasCopyJsonButton: Boolean(
        document.querySelector("[data-audit-copy-signoff-json]"),
      ),
    };
  });
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 2400,
    },
  });

  try {
    await waitForAuditHub(page);
    await page.evaluate((storageKey) => {
      globalThis.localStorage?.removeItem(storageKey);
    }, signoffStorageKey);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-audit-surface-id]");
    await openDraftPreview(page);

    const initialState = await readWorkspaceState(page);
    assert(initialState.reviewedSurfaces === "0 / 5", "Initial reviewed count was not empty.");
    assert(initialState.pass === "0", "Initial pass count was not empty.");
    assert(initialState.followUp === "0", "Initial follow-up count was not empty.");
    assert(initialState.completedChecks === "0 / 11", "Initial completed-check count was not empty.");
    assert(initialState.hasCopyDraftButton, "Copy draft button was missing.");
    assert(initialState.hasCopyJsonButton, "Copy JSON button was missing.");

    await page.locator('[data-audit-manual-toggle-id="dashboard-360:1"]').check();
    await page.locator('[data-audit-signoff-status-id="dashboard-360"]').selectOption("pass");
    await page
      .locator('[data-audit-signoff-notes-id="dashboard-360"]')
      .fill("Focus treatment stayed aligned with nearby hover states.");

    await page.locator('[data-audit-manual-toggle-id="popup-360:1"]').check();
    await page.locator('[data-audit-signoff-status-id="popup-360"]').selectOption("follow_up");
    await page
      .locator('[data-audit-signoff-notes-id="popup-360"]')
      .fill("Need one more real-mouse compact spacing pass.");

    const editedState = await readWorkspaceState(page);
    assert(editedState.reviewedSurfaces === "2 / 5", "Edited reviewed count was incorrect.");
    assert(editedState.pass === "1", "Edited pass count was incorrect.");
    assert(editedState.followUp === "1", "Edited follow-up count was incorrect.");
    assert(editedState.completedChecks === "2 / 11", "Edited completed-check count was incorrect.");
    assert(
      editedState.draft.includes("- [x] Confirm the focused Open action still feels visually coherent"),
      "Draft did not include the checked dashboard manual item.",
    );
    assert(
      editedState.draft.includes("Focus treatment stayed aligned with nearby hover states."),
      "Draft did not include the dashboard operator note.",
    );
    assert(
      editedState.draft.includes("- [x] Pass"),
      "Draft did not mark a pass state.",
    );
    assert(
      editedState.draft.includes("- [x] Follow-up required"),
      "Draft did not mark a follow-up state.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-signoff-workspace.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-audit-surface-id]");
    await openDraftPreview(page);

    const reloadedState = await readWorkspaceState(page);
    assert(reloadedState.dashboardFirstCheck, "Dashboard manual check did not persist after reload.");
    assert(reloadedState.popupFirstCheck, "Popup manual check did not persist after reload.");
    assert(reloadedState.dashboardStatus === "pass", "Dashboard signoff status did not persist after reload.");
    assert(reloadedState.popupStatus === "follow_up", "Popup signoff status did not persist after reload.");
    assert(
      reloadedState.dashboardNotes ===
        "Focus treatment stayed aligned with nearby hover states.",
      "Dashboard notes did not persist after reload.",
    );
    assert(
      reloadedState.popupNotes === "Need one more real-mouse compact spacing pass.",
      "Popup notes did not persist after reload.",
    );

    await page.locator("[data-audit-reset-signoff]").click();
    const resetState = await readWorkspaceState(page);
    assert(resetState.reviewedSurfaces === "0 / 5", "Reset reviewed count was not cleared.");
    assert(resetState.pass === "0", "Reset pass count was not cleared.");
    assert(resetState.followUp === "0", "Reset follow-up count was not cleared.");
    assert(resetState.completedChecks === "0 / 11", "Reset completed-check count was not cleared.");
    assert(!resetState.dashboardFirstCheck, "Dashboard manual check was not cleared by reset.");
    assert(!resetState.popupFirstCheck, "Popup manual check was not cleared by reset.");
    assert(resetState.dashboardStatus === "not_reviewed", "Dashboard status was not reset.");
    assert(resetState.popupStatus === "not_reviewed", "Popup status was not reset.");

    const report = {
      initialState,
      editedState,
      reloadedState,
      resetState,
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase71-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase71: saved artifacts under ${artifactDir}`);
    console.log(`phase71: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase71: reviewed=${editedState.reviewedSurfaces} pass=${editedState.pass} follow_up=${editedState.followUp}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase71: interaction audit signoff workspace review failed");
  console.error(error);
  process.exitCode = 1;
});
