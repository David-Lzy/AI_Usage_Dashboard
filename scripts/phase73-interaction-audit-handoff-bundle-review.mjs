import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase73-interaction-audit-handoff-bundle-review",
);
const phase69ReportPath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readPhase69Report() {
  const raw = await readFile(phase69ReportPath, "utf8");
  const report = JSON.parse(raw);

  assert(
    Array.isArray(report.evidenceItems) && report.evidenceItems.length > 0,
    "Phase 69 evidence pack is missing or empty.",
  );

  return report;
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

async function readHandoffState(page) {
  return page.evaluate(() => ({
    ready:
      document
        .querySelector(
          '[data-audit-handoff-summary-id="ready"] [data-audit-handoff-summary-value]',
        )
        ?.textContent?.trim() ?? "",
    followUp:
      document
        .querySelector(
          '[data-audit-handoff-summary-id="follow-up"] [data-audit-handoff-summary-value]',
        )
        ?.textContent?.trim() ?? "",
    notReviewed:
      document
        .querySelector(
          '[data-audit-handoff-summary-id="not-reviewed"] [data-audit-handoff-summary-value]',
        )
        ?.textContent?.trim() ?? "",
    pendingChecks:
      document
        .querySelector(
          '[data-audit-handoff-summary-id="pending-checks"] [data-audit-handoff-summary-value]',
        )
        ?.textContent?.trim() ?? "",
    followUpItems: Array.from(
      document.querySelectorAll("[data-audit-handoff-follow-up-item]"),
    ).map((item) => item.textContent?.trim() ?? ""),
    notReviewedItems: Array.from(
      document.querySelectorAll("[data-audit-handoff-not-reviewed-item]"),
    ).map((item) => item.textContent?.trim() ?? ""),
    pendingItems: Array.from(
      document.querySelectorAll("[data-audit-handoff-pending-item]"),
    ).map((item) => item.textContent?.trim() ?? ""),
    handoffPreview:
      document.querySelector("[data-audit-handoff-preview]")?.textContent ?? "",
  }));
}

function buildHandoffBundleMarkdown(report, handoffState) {
  const evidenceBySurfaceTitle = new Map();

  for (const item of report.evidenceItems) {
    const currentItems = evidenceBySurfaceTitle.get(item.surfaceTitle) ?? [];
    currentItems.push(item);
    evidenceBySurfaceTitle.set(item.surfaceTitle, currentItems);
  }

  const lines = [
    "# Interaction Audit Handoff Bundle",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Source evidence pack: \`${path.relative(projectRoot, phase69ReportPath)}\``,
    "",
    "## Current workspace handoff summary",
    "",
    handoffState.handoffPreview.trim(),
    "",
    "## Linked preset evidence",
    "",
  ];

  for (const [surfaceTitle, items] of evidenceBySurfaceTitle.entries()) {
    lines.push(`### ${surfaceTitle}`);
    lines.push("");

    for (const item of items) {
      lines.push(
        `- ${item.label}: ${item.expectation} Evidence: \`${item.screenshot}\`. Latest audit state: ${item.auditStatus.message}`,
      );
    }

    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const phase69Report = await readPhase69Report();
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
    await page.evaluate(() => {
      globalThis.localStorage?.removeItem(
        "ai-usage-dashboard:interaction-audit-signoff:v1",
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-audit-surface-id]");
    await openDetails(page, "[data-audit-signoff-import-details]");

    const importedJson = JSON.stringify({
      surfaces: [
        {
          id: "dashboard-360",
          signoffStatus: "pass",
          operatorNotes:
            "Keyboard focus remained coherent, but one dashboard density check is still pending.",
          manualChecks: [{ completed: true }, { completed: false }],
        },
        {
          id: "settings-420",
          signoffStatus: "follow_up",
          operatorNotes:
            "Expanded diagnostics still need one more compact-width operator pass.",
          manualChecks: [
            { completed: true },
            { completed: false },
            { completed: false },
          ],
        },
        {
          id: "popup-360",
          signoffStatus: "pass",
          operatorNotes: "Compact popup actions stayed readable in the current pass.",
          manualChecks: [{ completed: true }, { completed: true }],
        },
      ],
    });

    await page.locator("[data-audit-import-textarea]").fill(importedJson);
    await page.locator("[data-audit-apply-import]").click();
    await openDetails(page, "[data-audit-handoff-preview-details]");

    const handoffState = await readHandoffState(page);

    assert(handoffState.ready === "Not ready", "Handoff ready state was incorrect.");
    assert(handoffState.followUp === "1", "Handoff follow-up count was incorrect.");
    assert(handoffState.notReviewed === "2", "Handoff not-reviewed count was incorrect.");
    assert(
      handoffState.pendingChecks === "7 / 11",
      "Handoff pending-check summary was incorrect.",
    );
    assert(
      handoffState.followUpItems.some((item) => item.includes("Settings")),
      "Handoff follow-up list did not include Settings.",
    );
    assert(
      handoffState.notReviewedItems.some((item) =>
        item.includes("Provider Detail · Cursor"),
      ),
      "Handoff not-reviewed list did not include Cursor detail.",
    );
    assert(
      handoffState.notReviewedItems.some((item) =>
        item.includes("Provider Detail · Codex"),
      ),
      "Handoff not-reviewed list did not include Codex detail.",
    );
    assert(
      handoffState.pendingItems.some((item) => item.includes("Dashboard")),
      "Handoff pending-check list did not include Dashboard.",
    );
    assert(
      handoffState.pendingItems.some((item) => item.includes("Settings")),
      "Handoff pending-check list did not include Settings.",
    );
    assert(
      handoffState.handoffPreview.includes("## Follow-up required"),
      "Handoff preview was missing the follow-up section.",
    );
    assert(
      handoffState.handoffPreview.includes("## Pending manual checks"),
      "Handoff preview was missing the pending-check section.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-handoff-summary.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const bundlePath = path.join(
      artifactDir,
      "interaction-audit-handoff-bundle.md",
    );
    await writeFile(
      bundlePath,
      buildHandoffBundleMarkdown(phase69Report, handoffState),
      "utf8",
    );

    const reviewReport = {
      sourceEvidencePack: path.relative(projectRoot, phase69ReportPath),
      summary: {
        ready: handoffState.ready,
        followUp: handoffState.followUp,
        notReviewed: handoffState.notReviewed,
        pendingChecks: handoffState.pendingChecks,
      },
      followUpItems: handoffState.followUpItems,
      notReviewedItems: handoffState.notReviewedItems,
      pendingItems: handoffState.pendingItems,
      handoffPreview: handoffState.handoffPreview,
      screenshot: path.relative(projectRoot, screenshotPath),
      handoffBundle: path.relative(projectRoot, bundlePath),
    };
    const reportPath = path.join(artifactDir, "phase73-results.json");
    await writeFile(reportPath, JSON.stringify(reviewReport, null, 2), "utf8");

    console.log(`phase73: saved artifacts under ${artifactDir}`);
    console.log(`phase73: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase73: ready=${handoffState.ready} follow_up=${handoffState.followUp} not_reviewed=${handoffState.notReviewed} pending=${handoffState.pendingChecks}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase73: interaction audit handoff bundle review failed");
  console.error(error);
  process.exitCode = 1;
});
