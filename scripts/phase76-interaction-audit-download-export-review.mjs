import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase76-interaction-audit-download-export-review",
);
const signoffStorageKey = "ai-usage-dashboard:interaction-audit-signoff:v1";
const signoffMetadataStorageKey =
  "ai-usage-dashboard:interaction-audit-signoff-metadata:v1";
const expectedReviewedAt = "2026-04-23T10:20:30.000Z";
const expectedSessionLabel = "Direct Download QA";
const expectedReviewer = "Codex QA";

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

async function triggerDownload(page, selector, targetDir) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(selector).click(),
  ]);
  const suggestedFilename = download.suggestedFilename();
  const targetPath = path.join(targetDir, suggestedFilename);

  await download.saveAs(targetPath);

  return {
    suggestedFilename,
    savedPath: targetPath,
    relativePath: path.relative(projectRoot, targetPath),
  };
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
    acceptDownloads: true,
  });
  const page = await context.newPage();

  try {
    await waitForAuditHub(page);
    await page.evaluate(([stateKey, metadataKey]) => {
      globalThis.localStorage?.removeItem(stateKey);
      globalThis.localStorage?.removeItem(metadataKey);
    }, [signoffStorageKey, signoffMetadataStorageKey]);
    await page.reload({ waitUntil: "networkidle" });
    await waitForAuditHub(page);
    await openDetails(page, "[data-audit-operator-workflow-details]");

    await page.locator("[data-audit-session-reviewer]").fill(expectedReviewer);
    await page.locator("[data-audit-session-label]").fill(expectedSessionLabel);
    await page
      .locator("[data-audit-session-reviewed-at]")
      .fill(expectedReviewedAt);

    await page.locator('[data-audit-manual-toggle-id="dashboard-360:1"]').check();
    await page.locator('[data-audit-signoff-status-id="dashboard-360"]').selectOption("pass");
    await page
      .locator('[data-audit-signoff-notes-id="dashboard-360"]')
      .fill("Dashboard focus state remained coherent during download review.");

    await page.locator('[data-audit-manual-toggle-id="settings-420:2"]').check();
    await page.locator('[data-audit-signoff-status-id="settings-420"]').selectOption("follow_up");
    await page
      .locator('[data-audit-signoff-notes-id="settings-420"]')
      .fill("Settings still need one compact-width operator pass.");

    const workflowText = await page
      .locator("[data-audit-operator-workflow]")
      .innerText();
    assert(
      workflowText.includes("Download signoff JSON"),
      "Operator workflow did not mention direct signoff download.",
    );

    const signoffDraftDownload = await triggerDownload(
      page,
      "[data-audit-download-signoff-draft]",
      artifactDir,
    );
    const signoffJsonDownload = await triggerDownload(
      page,
      "[data-audit-download-signoff-json]",
      artifactDir,
    );
    const handoffSummaryDownload = await triggerDownload(
      page,
      "[data-audit-download-handoff-summary]",
      artifactDir,
    );

    assert(
      signoffDraftDownload.suggestedFilename ===
        "interaction-audit-signoff-draft-2026-04-23-direct-download-qa.md",
      "Signoff draft filename was incorrect.",
    );
    assert(
      signoffJsonDownload.suggestedFilename ===
        "interaction-audit-signoff-export-2026-04-23-direct-download-qa.json",
      "Signoff JSON filename was incorrect.",
    );
    assert(
      handoffSummaryDownload.suggestedFilename ===
        "interaction-audit-handoff-summary-2026-04-23-direct-download-qa.md",
      "Handoff summary filename was incorrect.",
    );

    const signoffDraft = await readFile(signoffDraftDownload.savedPath, "utf8");
    const signoffJson = JSON.parse(
      await readFile(signoffJsonDownload.savedPath, "utf8"),
    );
    const handoffSummary = await readFile(handoffSummaryDownload.savedPath, "utf8");

    assert(
      signoffDraft.includes("- Reviewer: Codex QA"),
      "Downloaded signoff draft was missing the reviewer metadata.",
    );
    assert(
      signoffDraft.includes("- Session: Direct Download QA"),
      "Downloaded signoff draft was missing the session metadata.",
    );
    assert(
      signoffDraft.includes(`- Reviewed at: ${expectedReviewedAt}`),
      "Downloaded signoff draft was missing the reviewed-at metadata.",
    );
    assert(
      signoffJson.metadata?.reviewerName === expectedReviewer,
      "Downloaded signoff JSON was missing the reviewer metadata.",
    );
    assert(
      signoffJson.metadata?.sessionLabel === expectedSessionLabel,
      "Downloaded signoff JSON was missing the session metadata.",
    );
    assert(
      signoffJson.metadata?.reviewedAt === expectedReviewedAt,
      "Downloaded signoff JSON was missing the reviewed-at metadata.",
    );
    assert(
      handoffSummary.includes("- Reviewer: Codex QA"),
      "Downloaded handoff summary was missing the reviewer metadata.",
    );
    assert(
      handoffSummary.includes("- Session: Direct Download QA"),
      "Downloaded handoff summary was missing the session metadata.",
    );
    assert(
      handoffSummary.includes(`- Reviewed at: ${expectedReviewedAt}`),
      "Downloaded handoff summary was missing the reviewed-at metadata.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-download-export-review.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const report = {
      reviewer: expectedReviewer,
      sessionLabel: expectedSessionLabel,
      reviewedAt: expectedReviewedAt,
      workflowText,
      downloads: {
        signoffDraft: signoffDraftDownload.relativePath,
        signoffJson: signoffJsonDownload.relativePath,
        handoffSummary: handoffSummaryDownload.relativePath,
      },
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase76-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase76: saved artifacts under ${artifactDir}`);
    console.log(`phase76: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase76: downloads=${signoffDraftDownload.suggestedFilename},${signoffJsonDownload.suggestedFilename},${handoffSummaryDownload.suggestedFilename}`,
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase76: interaction audit download export review failed");
  console.error(error);
  process.exitCode = 1;
});
