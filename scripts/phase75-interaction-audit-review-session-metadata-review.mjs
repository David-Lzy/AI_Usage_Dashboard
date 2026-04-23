import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { chromium } from "playwright";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase75-interaction-audit-review-session-metadata-review",
);
const signoffStorageKey = "ai-usage-dashboard:interaction-audit-signoff:v1";
const signoffMetadataStorageKey =
  "ai-usage-dashboard:interaction-audit-signoff-metadata:v1";
const inputPath = path.join(artifactDir, "review-session-signoff-export.json");
const outputDir = path.join(artifactDir, "generated-bundle");
const bundleJsonPath = path.join(outputDir, "interaction-audit-handoff-bundle.json");
const bundleMarkdownPath = path.join(
  outputDir,
  "interaction-audit-handoff-bundle.md",
);

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
  await waitForAuditHubFrames(page);
}

async function waitForAuditHubFrames(page) {
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

    function readInputValue(selector) {
      const field = document.querySelector(selector);

      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        return field.value;
      }

      return "";
    }

    function readCheckbox(selector) {
      const field = document.querySelector(selector);
      return field instanceof HTMLInputElement ? field.checked : false;
    }

    return {
      reviewer: readInputValue("[data-audit-session-reviewer]"),
      sessionLabel: readInputValue("[data-audit-session-label]"),
      reviewedAt: readInputValue("[data-audit-session-reviewed-at]"),
      sessionSummary:
        document.querySelector("[data-audit-session-summary] .supporting-copy")
          ?.textContent?.trim() ?? "",
      reviewedSurfaces: readSummary("reviewed-surfaces"),
      pass: readSummary("pass"),
      followUp: readSummary("follow-up"),
      completedChecks: readSummary("completed-checks"),
      draft:
        document.querySelector("[data-audit-signoff-preview]")?.textContent ?? "",
      feedback:
        document.querySelector("[data-audit-signoff-feedback] .supporting-copy")
          ?.textContent ?? "",
      dashboardStatus: readInputValue('[data-audit-signoff-status-id="dashboard-360"]'),
      settingsStatus: readInputValue('[data-audit-signoff-status-id="settings-420"]'),
      dashboardCheck: readCheckbox('[data-audit-manual-toggle-id="dashboard-360:1"]'),
      settingsCheck: readCheckbox('[data-audit-manual-toggle-id="settings-420:2"]'),
      dashboardNotes: readInputValue('[data-audit-signoff-notes-id="dashboard-360"]'),
      settingsNotes: readInputValue('[data-audit-signoff-notes-id="settings-420"]'),
      importValue: readInputValue("[data-audit-import-textarea]"),
    };
  });
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: {
      width: 1600,
      height: 2600,
    },
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  const page = await context.newPage();

  try {
    await waitForAuditHub(page);
    await page.evaluate(([stateKey, metadataKey]) => {
      globalThis.localStorage?.removeItem(stateKey);
      globalThis.localStorage?.removeItem(metadataKey);
    }, [signoffStorageKey, signoffMetadataStorageKey]);
    await page.reload({ waitUntil: "networkidle" });
    await waitForAuditHubFrames(page);
    await openDetails(page, "[data-audit-signoff-preview-details]");

    const initialState = await readWorkspaceState(page);
    assert(initialState.reviewer === "", "Initial reviewer field was not empty.");
    assert(initialState.sessionLabel === "", "Initial session label field was not empty.");
    assert(initialState.reviewedAt === "", "Initial reviewed-at field was not empty.");
    assert(
      initialState.draft.includes("- Reviewer: not set"),
      "Initial draft did not show empty review-session metadata.",
    );

    await page.locator("[data-audit-session-reviewer]").fill("Codex QA");
    await page
      .locator("[data-audit-session-label]")
      .fill("Operator compact interaction pass");
    await page.locator("[data-audit-session-stamp-time]").click();

    const stampedState = await readWorkspaceState(page);
    assert(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(stampedState.reviewedAt),
      "Stamp current time did not populate an ISO-like reviewed-at value.",
    );

    await page.locator('[data-audit-manual-toggle-id="dashboard-360:1"]').check();
    await page.locator('[data-audit-signoff-status-id="dashboard-360"]').selectOption("pass");
    await page
      .locator('[data-audit-signoff-notes-id="dashboard-360"]')
      .fill("Dashboard focus state stayed aligned with nearby hover states.");

    await page.locator('[data-audit-manual-toggle-id="settings-420:2"]').check();
    await page.locator('[data-audit-signoff-status-id="settings-420"]').selectOption("follow_up");
    await page
      .locator('[data-audit-signoff-notes-id="settings-420"]')
      .fill("Settings still need one more compact-width operator pass.");

    const editedState = await readWorkspaceState(page);
    assert(editedState.reviewer === "Codex QA", "Reviewer metadata was not stored.");
    assert(
      editedState.sessionLabel === "Operator compact interaction pass",
      "Session label metadata was not stored.",
    );
    assert(
      editedState.reviewedSurfaces === "2 / 5",
      "Edited reviewed-surface count was incorrect.",
    );
    assert(editedState.pass === "1", "Edited pass count was incorrect.");
    assert(editedState.followUp === "1", "Edited follow-up count was incorrect.");
    assert(
      editedState.completedChecks === "2 / 11",
      "Edited completed-check count was incorrect.",
    );
    assert(
      editedState.draft.includes("- Reviewer: Codex QA"),
      "Draft did not include the reviewer metadata.",
    );
    assert(
      editedState.draft.includes("- Session: Operator compact interaction pass"),
      "Draft did not include the session-label metadata.",
    );
    assert(
      editedState.draft.includes(`- Reviewed at: ${editedState.reviewedAt}`),
      "Draft did not include the reviewed-at metadata.",
    );
    assert(
      editedState.draft.includes(
        "Dashboard focus state stayed aligned with nearby hover states.",
      ),
      "Draft did not include the dashboard note.",
    );

    await page.locator("[data-audit-copy-signoff-json]").click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const exportedJson = JSON.parse(clipboardText);

    assert(
      exportedJson.metadata?.reviewerName === "Codex QA",
      "Copied signoff JSON was missing reviewer metadata.",
    );
    assert(
      exportedJson.metadata?.sessionLabel === "Operator compact interaction pass",
      "Copied signoff JSON was missing session metadata.",
    );
    assert(
      exportedJson.metadata?.reviewedAt === editedState.reviewedAt,
      "Copied signoff JSON was missing reviewed-at metadata.",
    );

    await writeFile(inputPath, JSON.stringify(exportedJson, null, 2), "utf8");
    await execFileAsync(
      process.execPath,
      [
        "./scripts/build-interaction-audit-handoff-bundle.mjs",
        "--input",
        path.relative(projectRoot, inputPath),
        "--output-dir",
        path.relative(projectRoot, outputDir),
      ],
      {
        cwd: projectRoot,
      },
    );

    const bundleJson = JSON.parse(await readFile(bundleJsonPath, "utf8"));
    const bundleMarkdown = await readFile(bundleMarkdownPath, "utf8");

    assert(
      bundleJson.reviewSession?.reviewerName === "Codex QA",
      "Bundle JSON did not preserve the reviewer metadata.",
    );
    assert(
      bundleJson.reviewSession?.sessionLabel ===
        "Operator compact interaction pass",
      "Bundle JSON did not preserve the session label metadata.",
    );
    assert(
      bundleJson.reviewSession?.reviewedAt === editedState.reviewedAt,
      "Bundle JSON did not preserve the reviewed-at metadata.",
    );
    assert(
      bundleMarkdown.includes("- Reviewer: Codex QA"),
      "Bundle markdown did not include the reviewer metadata.",
    );
    assert(
      bundleMarkdown.includes("- Session: Operator compact interaction pass"),
      "Bundle markdown did not include the session-label metadata.",
    );
    assert(
      bundleMarkdown.includes(`- Reviewed at: ${editedState.reviewedAt}`),
      "Bundle markdown did not include the reviewed-at metadata.",
    );

    await page.reload({ waitUntil: "networkidle" });
    await waitForAuditHubFrames(page);
    await openDetails(page, "[data-audit-signoff-preview-details]");
    const reloadedState = await readWorkspaceState(page);
    assert(
      reloadedState.reviewer === editedState.reviewer,
      "Reviewer metadata did not persist after reload.",
    );
    assert(
      reloadedState.sessionLabel === editedState.sessionLabel,
      "Session label metadata did not persist after reload.",
    );
    assert(
      reloadedState.reviewedAt === editedState.reviewedAt,
      "Reviewed-at metadata did not persist after reload.",
    );

    await page.locator("[data-audit-reset-signoff]").click();
    const resetState = await readWorkspaceState(page);
    assert(resetState.reviewer === "", "Reset did not clear the reviewer metadata.");
    assert(
      resetState.sessionLabel === "",
      "Reset did not clear the session label metadata.",
    );
    assert(resetState.reviewedAt === "", "Reset did not clear the reviewed-at metadata.");
    assert(
      resetState.dashboardStatus === "not_reviewed",
      "Reset did not clear the dashboard signoff state.",
    );

    await openDetails(page, "[data-audit-signoff-import-details]");
    await page.locator("[data-audit-import-textarea]").fill(clipboardText);
    await page.locator("[data-audit-apply-import]").click();
    await openDetails(page, "[data-audit-signoff-preview-details]");
    const importedState = await readWorkspaceState(page);
    assert(
      importedState.reviewer === editedState.reviewer,
      "Import did not restore reviewer metadata.",
    );
    assert(
      importedState.sessionLabel === editedState.sessionLabel,
      "Import did not restore the session label metadata.",
    );
    assert(
      importedState.reviewedAt === editedState.reviewedAt,
      "Import did not restore the reviewed-at metadata.",
    );
    assert(
      importedState.dashboardStatus === "pass",
      "Import did not restore the dashboard signoff state.",
    );
    assert(
      importedState.settingsStatus === "follow_up",
      "Import did not restore the settings signoff state.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-review-session-metadata.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const report = {
      initialState,
      stampedState,
      editedState,
      exportedMetadata: exportedJson.metadata,
      reloadedState,
      resetState,
      importedState,
      bundleReviewSession: bundleJson.reviewSession,
      bundleMarkdownPath: path.relative(projectRoot, bundleMarkdownPath),
      bundleJsonPath: path.relative(projectRoot, bundleJsonPath),
      exportedSignoffPath: path.relative(projectRoot, inputPath),
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase75-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase75: saved artifacts under ${artifactDir}`);
    console.log(`phase75: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase75: reviewer=${editedState.reviewer} session=${editedState.sessionLabel} reviewed_surfaces=${editedState.reviewedSurfaces}`,
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase75: interaction audit review-session metadata review failed");
  console.error(error);
  process.exitCode = 1;
});
