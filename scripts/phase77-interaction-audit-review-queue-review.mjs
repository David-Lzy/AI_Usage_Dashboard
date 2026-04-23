import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase77-interaction-audit-review-queue-review",
);
const signoffStorageKey = "ai-usage-dashboard:interaction-audit-signoff:v1";
const signoffMetadataStorageKey =
  "ai-usage-dashboard:interaction-audit-signoff-metadata:v1";

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

async function readQueueState(page) {
  return page.evaluate(() => {
    function readSummary(id) {
      return (
        document
          .querySelector(
            `[data-audit-review-queue-summary-id="${id}"] [data-audit-review-queue-summary-value]`,
          )
          ?.textContent?.trim() ?? ""
      );
    }

    return {
      nextTarget: readSummary("next"),
      followUp: readSummary("follow-up"),
      notReviewed: readSummary("not-reviewed"),
      pendingChecks: readSummary("pending-checks"),
      ready: readSummary("ready"),
      itemOrder: Array.from(
        document.querySelectorAll("[data-audit-review-queue-item]"),
      ).map((item) => item.getAttribute("data-audit-review-queue-item") ?? ""),
      statuses: Object.fromEntries(
        Array.from(document.querySelectorAll("[data-audit-review-queue-item]")).map(
          (item) => [
            item.getAttribute("data-audit-review-queue-item") ?? "",
            item.getAttribute("data-audit-review-queue-status") ?? "",
          ],
        ),
      ),
      activeSignoffSurface:
        document.activeElement?.getAttribute("data-audit-signoff-status-id") ?? "",
      feedback:
        document.querySelector("[data-audit-signoff-feedback] .supporting-copy")
          ?.textContent ?? "",
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
      height: 2600,
    },
  });

  try {
    await waitForAuditHub(page);
    await page.evaluate(([stateKey, metadataKey]) => {
      globalThis.localStorage?.removeItem(stateKey);
      globalThis.localStorage?.removeItem(metadataKey);
    }, [signoffStorageKey, signoffMetadataStorageKey]);
    await page.reload({ waitUntil: "networkidle" });
    await waitForAuditHub(page);

    const initialState = await readQueueState(page);
    assert(initialState.nextTarget === "Dashboard", "Initial next target was incorrect.");
    assert(initialState.followUp === "0", "Initial follow-up count was incorrect.");
    assert(initialState.notReviewed === "5", "Initial not-reviewed count was incorrect.");
    assert(initialState.pendingChecks === "0", "Initial pending-check count was incorrect.");
    assert(initialState.ready === "0", "Initial ready count was incorrect.");

    await page.locator('[data-audit-manual-toggle-id="dashboard-360:1"]').check();
    await page.locator('[data-audit-manual-toggle-id="dashboard-360:2"]').check();
    await page.locator('[data-audit-signoff-status-id="dashboard-360"]').selectOption("pass");

    await page.locator('[data-audit-manual-toggle-id="settings-420:1"]').check();
    await page.locator('[data-audit-signoff-status-id="settings-420"]').selectOption("follow_up");

    await page.locator('[data-audit-manual-toggle-id="codex-detail-420:1"]').check();
    await page.locator('[data-audit-signoff-status-id="codex-detail-420"]').selectOption("pass");

    const updatedState = await readQueueState(page);
    assert(updatedState.nextTarget === "Settings", "Updated next target was incorrect.");
    assert(updatedState.followUp === "1", "Updated follow-up count was incorrect.");
    assert(updatedState.notReviewed === "2", "Updated not-reviewed count was incorrect.");
    assert(updatedState.pendingChecks === "1", "Updated pending-check count was incorrect.");
    assert(updatedState.ready === "1", "Updated ready count was incorrect.");
    assert(
      updatedState.itemOrder[0] === "settings-420",
      "Follow-up surface did not move to the front of the review queue.",
    );
    assert(
      updatedState.statuses["dashboard-360"] === "ready",
      "Dashboard queue status was incorrect after completion.",
    );
    assert(
      updatedState.statuses["codex-detail-420"] === "pending_checks",
      "Codex detail queue status was incorrect after partial completion.",
    );

    await page.locator("[data-audit-review-queue-next-target]").click();
    const nextTargetFocusState = await readQueueState(page);
    assert(
      nextTargetFocusState.activeSignoffSurface === "settings-420",
      "Jump to next target did not focus the expected surface.",
    );
    assert(
      nextTargetFocusState.feedback.includes("Jumped to Settings."),
      "Next-target jump did not update workspace feedback.",
    );

    await page.locator('[data-audit-review-queue-jump="popup-360"]').click();
    const popupFocusState = await readQueueState(page);
    assert(
      popupFocusState.activeSignoffSurface === "popup-360",
      "Jump-to-surface did not focus the popup surface.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-review-queue.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const report = {
      initialState,
      updatedState,
      nextTargetFocusState,
      popupFocusState,
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase77-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase77: saved artifacts under ${artifactDir}`);
    console.log(`phase77: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase77: next_target=${updatedState.nextTarget} follow_up=${updatedState.followUp} ready=${updatedState.ready}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase77: interaction audit review queue review failed");
  console.error(error);
  process.exitCode = 1;
});
