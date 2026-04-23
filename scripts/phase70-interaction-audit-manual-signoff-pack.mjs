import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase70-interaction-audit-manual-signoff-pack",
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

function buildSignoffTemplate(report) {
  const lines = [
    "# Interaction Audit Manual Signoff Pack",
    "",
    `Generated: ${report.generatedAt}`,
    `Source evidence pack: \`${report.sourceEvidencePack}\``,
    "",
    "Use this template after reviewing the audit hub in a real browser. The preset evidence below is already captured; the remaining checklist items require human judgment.",
    "",
  ];

  for (const surface of report.surfaces) {
    lines.push(`## ${surface.title}`);
    lines.push("");
    lines.push(surface.description);
    lines.push("");
    lines.push("Preset evidence:");

    for (const evidence of surface.evidenceItems) {
      lines.push(
        `- ${evidence.label}: ${evidence.expectation} Evidence: \`${evidence.screenshot}\`. Latest audit state: ${evidence.auditStatus.message}`,
      );
    }

    lines.push("");
    lines.push("Manual checks:");

    for (const check of surface.manualChecks) {
      lines.push(`- [ ] ${check}`);
    }

    lines.push("");
    lines.push("Operator notes:");
    lines.push("- ");
    lines.push("");
    lines.push("Signoff:");
    lines.push("- [ ] Pass");
    lines.push("- [ ] Follow-up required");
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
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

async function readAuditSurfaceData(page) {
  const surfaces = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-audit-surface-id]")).map(
      (surface, index) => ({
        order: index + 1,
        surfaceId: surface.getAttribute("data-audit-surface-id") ?? "",
        title:
          surface.querySelector(".section-title")?.textContent?.trim() ?? "",
        description:
          surface.querySelector(".supporting-copy")?.textContent?.trim() ?? "",
        manualChecks: Array.from(
          surface.querySelectorAll("[data-audit-manual-check-id]"),
        ).map((check) => check.textContent?.trim() ?? ""),
      }),
    ),
  );

  assert(surfaces.length > 0, "No audit surfaces were found on the audit hub.");

  for (const surface of surfaces) {
    assert(surface.surfaceId.length > 0, "Audit surface is missing an id.");
    assert(surface.title.length > 0, `${surface.surfaceId} is missing a title.`);
    assert(
      surface.manualChecks.length > 0,
      `${surface.surfaceId} is missing visible manual checks.`,
    );
  }

  return surfaces;
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
      height: 2400,
    },
  });

  try {
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

    const surfaces = await readAuditSurfaceData(page);
    const evidenceBySurfaceId = new Map();

    for (const item of phase69Report.evidenceItems) {
      const currentItems = evidenceBySurfaceId.get(item.surfaceId) ?? [];
      currentItems.push(item);
      evidenceBySurfaceId.set(item.surfaceId, currentItems);
    }

    const reportSurfaces = surfaces.map((surface) => {
      const evidenceItems = evidenceBySurfaceId.get(surface.surfaceId) ?? [];

      assert(
        evidenceItems.length > 0,
        `${surface.surfaceId} is missing linked phase 69 evidence.`,
      );

      return {
        ...surface,
        evidenceItems,
      };
    });

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-manual-signoff.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const signoffTemplatePath = path.join(
      artifactDir,
      "interaction-audit-manual-signoff.md",
    );

    const report = {
      generatedAt: new Date().toISOString(),
      sourceEvidencePack: path.relative(projectRoot, phase69ReportPath),
      overviewScreenshot: path.relative(projectRoot, screenshotPath),
      signoffTemplate: path.relative(projectRoot, signoffTemplatePath),
      surfaces: reportSurfaces,
    };

    await writeFile(
      signoffTemplatePath,
      buildSignoffTemplate(report),
      "utf8",
    );

    const reportPath = path.join(artifactDir, "phase70-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase70: saved artifacts under ${artifactDir}`);
    console.log(`phase70: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase70: surfaces=${reportSurfaces.length} signoff_template=${path.relative(projectRoot, signoffTemplatePath)}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase70: interaction audit manual signoff pack failed");
  console.error(error);
  process.exitCode = 1;
});
