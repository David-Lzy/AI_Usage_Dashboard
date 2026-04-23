import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase72-interaction-audit-signoff-import-review",
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

async function openDetails(page, selector) {
  await page.evaluate((targetSelector) => {
    const details = document.querySelector(targetSelector);

    if (details instanceof HTMLDetailsElement) {
      details.open = true;
    }
  }, selector);
}

async function readImportState(page) {
  return page.evaluate(() => ({
    feedback:
      document.querySelector("[data-audit-signoff-feedback] .supporting-copy")
        ?.textContent ?? "",
    importValue:
      document.querySelector("[data-audit-import-textarea]") instanceof
      HTMLTextAreaElement
        ? document.querySelector("[data-audit-import-textarea]").value
        : "",
    reviewedSurfaces:
      document.querySelector(
        '[data-audit-signoff-summary-id="reviewed-surfaces"] [data-audit-signoff-summary-value]',
      )?.textContent?.trim() ?? "",
    dashboardStatus:
      document.querySelector('[data-audit-signoff-status-id="dashboard-360"]') instanceof
      HTMLSelectElement
        ? document.querySelector('[data-audit-signoff-status-id="dashboard-360"]').value
        : "",
    settingsStatus:
      document.querySelector('[data-audit-signoff-status-id="settings-420"]') instanceof
      HTMLSelectElement
        ? document.querySelector('[data-audit-signoff-status-id="settings-420"]').value
        : "",
    dashboardCheck:
      document.querySelector('[data-audit-manual-toggle-id="dashboard-360:1"]') instanceof
      HTMLInputElement
        ? document.querySelector('[data-audit-manual-toggle-id="dashboard-360:1"]').checked
        : false,
    settingsCheck:
      document.querySelector('[data-audit-manual-toggle-id="settings-420:2"]') instanceof
      HTMLInputElement
        ? document.querySelector('[data-audit-manual-toggle-id="settings-420:2"]').checked
        : false,
    dashboardNotes:
      document.querySelector('[data-audit-signoff-notes-id="dashboard-360"]') instanceof
      HTMLTextAreaElement
        ? document.querySelector('[data-audit-signoff-notes-id="dashboard-360"]').value
        : "",
    settingsNotes:
      document.querySelector('[data-audit-signoff-notes-id="settings-420"]') instanceof
      HTMLTextAreaElement
        ? document.querySelector('[data-audit-signoff-notes-id="settings-420"]').value
        : "",
  }));
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
    await openDetails(page, "[data-audit-signoff-import-details]");

    await page.locator("[data-audit-apply-import]").click();
    const emptyImportState = await readImportState(page);
    assert(
      emptyImportState.feedback.includes("Paste exported signoff JSON before importing."),
      "Empty import did not show the expected feedback.",
    );

    await page.locator("[data-audit-import-textarea]").fill("{bad json");
    await page.locator("[data-audit-apply-import]").click();
    const invalidImportState = await readImportState(page);
    assert(
      invalidImportState.feedback.includes("Signoff import JSON could not be parsed."),
      "Invalid import did not show the expected feedback.",
    );

    const importedJson = JSON.stringify({
      surfaces: [
        {
          id: "dashboard-360",
          signoffStatus: "pass",
          operatorNotes: "Imported dashboard signoff note.",
          manualChecks: [{ completed: true }, { completed: false }],
        },
        {
          id: "settings-420",
          signoffStatus: "follow_up",
          operatorNotes: "Imported settings follow-up note.",
          manualChecks: [{ completed: false }, { completed: true }, { completed: false }],
        },
      ],
    });

    await page.locator("[data-audit-import-textarea]").fill(importedJson);
    await page.locator("[data-audit-apply-import]").click();

    const importedState = await readImportState(page);
    assert(
      importedState.feedback.includes("Imported signoff JSON into the workspace."),
      "Successful import did not show the expected feedback.",
    );
    assert(importedState.reviewedSurfaces === "2 / 5", "Imported reviewed count was incorrect.");
    assert(importedState.dashboardStatus === "pass", "Imported dashboard status was incorrect.");
    assert(importedState.settingsStatus === "follow_up", "Imported settings status was incorrect.");
    assert(importedState.dashboardCheck, "Imported dashboard manual check was not applied.");
    assert(importedState.settingsCheck, "Imported settings manual check was not applied.");
    assert(
      importedState.dashboardNotes === "Imported dashboard signoff note.",
      "Imported dashboard note was incorrect.",
    );
    assert(
      importedState.settingsNotes === "Imported settings follow-up note.",
      "Imported settings note was incorrect.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-signoff-import.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-audit-surface-id]");
    await openDetails(page, "[data-audit-signoff-import-details]");
    const reloadedState = await readImportState(page);
    assert(reloadedState.dashboardStatus === "pass", "Imported dashboard status did not persist.");
    assert(reloadedState.settingsStatus === "follow_up", "Imported settings status did not persist.");
    assert(reloadedState.dashboardCheck, "Imported dashboard manual check did not persist.");
    assert(reloadedState.settingsCheck, "Imported settings manual check did not persist.");

    const report = {
      emptyImportState,
      invalidImportState,
      importedState,
      reloadedState,
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase72-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase72: saved artifacts under ${artifactDir}`);
    console.log(`phase72: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase72: reviewed=${importedState.reviewedSurfaces} dashboard=${importedState.dashboardStatus} settings=${importedState.settingsStatus}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase72: interaction audit signoff import review failed");
  console.error(error);
  process.exitCode = 1;
});
