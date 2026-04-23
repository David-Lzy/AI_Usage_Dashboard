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
  "phase74-interaction-audit-operator-bundle-review",
);
const inputPath = path.join(artifactDir, "sample-signoff-export.json");
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
  await page.waitForSelector("[data-audit-surface-id]");
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".interaction-audit-frame")).every(
      (frame) =>
        frame instanceof HTMLIFrameElement &&
        frame.contentDocument?.readyState === "complete",
    ),
  );
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const sampleSignoffExport = {
    metadata: {
      reviewerName: "Codex",
      sessionLabel: "Operator Bundle Review",
      reviewedAt: "2026-04-23T01:02:03.000Z",
    },
    summary: {
      reviewedSurfaceCount: 3,
      passSurfaceCount: 2,
      followUpSurfaceCount: 1,
      completedManualCheckCount: 4,
      totalManualCheckCount: 11,
    },
    surfaces: [
      {
        id: "dashboard-360",
        title: "Dashboard",
        description:
          "Use this frame to inspect summary pills, provider-card density, and the main top-bar action row at a realistic narrow side-panel width.",
        signoffStatus: "pass",
        operatorNotes:
          "Keyboard focus remained coherent, but one dashboard density check is still pending.",
        manualChecks: [
          {
            label:
              "Confirm the focused Open action still feels visually coherent with the hover treatment on nearby dashboard controls.",
            completed: true,
          },
          {
            label:
              "Confirm provider-card summary density remains readable at the shipped 360px audit width without chip or text collisions.",
            completed: false,
          },
        ],
      },
      {
        id: "settings-420",
        title: "Settings",
        description:
          "Review sticky actions, section-jump chips, disclosure density, selects, switch rows, and compact source-card readability in one wider audit frame.",
        signoffStatus: "follow_up",
        operatorNotes:
          "Expanded diagnostics still need one more compact-width operator pass.",
        manualChecks: [
          {
            label:
              "Confirm the sticky top bar and section-jump shell still feel stable after the diagnostics disclosure and focused select are prepared.",
            completed: true,
          },
          {
            label:
              "Confirm the expanded diagnostics groups remain scannable and do not introduce horizontal overflow at the shipped 420px audit width.",
            completed: false,
          },
          {
            label:
              "Confirm the focused source-preference select stays visually explicit without overpowering the surrounding source-card summary.",
            completed: false,
          },
        ],
      },
      {
        id: "cursor-detail-360",
        title: "Provider Detail · Cursor",
        description:
          "Inspect long-value wrapping, neutral note hierarchy, status surfaces, and progress honesty on a compact provider-detail route.",
        signoffStatus: "not_reviewed",
        operatorNotes: "",
        manualChecks: [
          {
            label:
              "Confirm the first note remains visually distinct from the lighter detail-field tiles instead of blending into the parent surface.",
            completed: false,
          },
          {
            label:
              "Confirm long supporting values and labels still wrap cleanly at the shipped 360px compact detail width.",
            completed: false,
          },
        ],
      },
      {
        id: "codex-detail-420",
        title: "Provider Detail · Codex",
        description:
          "Use this frame for the denser hybrid-source detail path, especially fidelity notes, graduation gates, and supporting-surface hierarchy.",
        signoffStatus: "not_reviewed",
        operatorNotes: "",
        manualChecks: [
          {
            label:
              "Confirm fidelity and graduation-gate notes remain easy to distinguish from regular supporting fields at the shipped 420px detail width.",
            completed: false,
          },
          {
            label:
              "Confirm dense hybrid-source supporting text still reads cleanly without overflow or flattened hierarchy after the note jump.",
            completed: false,
          },
        ],
      },
      {
        id: "popup-360",
        title: "Toolbar Popup",
        description:
          "Review quick actions, snapshot-status tone, featured provider cards, and compact popup spacing without opening the browser action repeatedly.",
        signoffStatus: "pass",
        operatorNotes:
          "Compact popup actions stayed readable in the current pass.",
        manualChecks: [
          {
            label:
              "Confirm quick actions and featured-provider actions still feel readable and comfortably tappable at the shipped 360px popup width.",
            completed: true,
          },
          {
            label:
              "Confirm the focused popup actions preserve compact spacing instead of collapsing the snapshot-status and featured-card rhythm.",
            completed: true,
          },
        ],
      },
    ],
  };

  await writeFile(inputPath, JSON.stringify(sampleSignoffExport, null, 2), "utf8");

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

  let workflowSummary;

  try {
    await waitForAuditHub(page);
    await page.evaluate(() => {
      const details = document.querySelector("[data-audit-operator-workflow-details]");

      if (details instanceof HTMLDetailsElement) {
        details.open = true;
      }
    });

    workflowSummary = await page.evaluate(() => ({
      body:
        document.querySelector("[data-audit-operator-workflow]")?.textContent?.trim() ??
        "",
      command:
        document.querySelector("[data-audit-operator-bundle-command]")?.textContent?.trim() ??
        "",
    }));

    assert(
      workflowSummary.body.includes("Copy signoff JSON"),
      "Operator workflow did not mention copying signoff JSON.",
    );
    assert(
      workflowSummary.command.includes("npm run interaction-audit:bundle"),
      "Operator workflow command was missing.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-operator-workflow.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

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
      bundleJson.summary.readyForSignoff === false,
      "Bundle ready state was incorrect.",
    );
    assert(
      bundleJson.summary.followUpSurfaceCount === 1,
      "Bundle follow-up count was incorrect.",
    );
    assert(
      bundleJson.summary.notReviewedSurfaceCount === 2,
      "Bundle not-reviewed count was incorrect.",
    );
    assert(
      bundleJson.summary.pendingManualCheckCount === 7,
      "Bundle pending-check count was incorrect.",
    );
    assert(
      bundleJson.reviewSession?.reviewerName === "Codex",
      "Bundle review-session reviewer was incorrect.",
    );
    assert(
      bundleMarkdown.includes("- Session: Operator Bundle Review"),
      "Bundle markdown was missing the review-session metadata.",
    );
    assert(
      bundleMarkdown.includes("## Linked preset evidence"),
      "Bundle markdown was missing linked evidence.",
    );
    assert(
      bundleMarkdown.includes("### Settings"),
      "Bundle markdown was missing the Settings surface section.",
    );
    assert(
      bundleMarkdown.includes("Provider Detail · Cursor (2 pending checks)"),
      "Bundle markdown was missing the unresolved Cursor detail surface.",
    );

    const report = {
      workflowSummary,
      summary: bundleJson.summary,
      screenshot: path.relative(projectRoot, screenshotPath),
      input: path.relative(projectRoot, inputPath),
      bundleJson: path.relative(projectRoot, bundleJsonPath),
      bundleMarkdown: path.relative(projectRoot, bundleMarkdownPath),
    };
    const reportPath = path.join(artifactDir, "phase74-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase74: saved artifacts under ${artifactDir}`);
    console.log(`phase74: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase74: ready=${bundleJson.summary.readyForSignoff ? "yes" : "no"} follow_up=${bundleJson.summary.followUpSurfaceCount} not_reviewed=${bundleJson.summary.notReviewedSurfaceCount} pending=${bundleJson.summary.pendingManualCheckCount} / ${bundleJson.summary.totalManualCheckCount}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase74: interaction audit operator workflow review failed");
  console.error(error);
  process.exitCode = 1;
});
