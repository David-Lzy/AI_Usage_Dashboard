import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase88-interaction-audit-request-scope-visibility-review",
);
const signoffStorageKey = "ai-usage-dashboard:interaction-audit-signoff:v1";
const signoffMetadataStorageKey =
  "ai-usage-dashboard:interaction-audit-signoff-metadata:v1";
const signoffRequestContextStorageKey =
  "ai-usage-dashboard:interaction-audit-signoff-request-context:v1";
const requestTemplatePath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
  "2026-04-23-first-real-operator-review-request",
  "interaction-audit-signoff-template.json",
);
const requestManifestPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "operator_review_requests",
  "2026-04-23-first-real-operator-review-request",
  "review-request.json",
);
const expectedReviewedAt = "2026-04-23T11:20:30.000Z";
const expectedSessionLabel = "Request Bound Export QA";
const expectedReviewer = "Codex QA";
const expectedRequestId = "2026-04-23-first-real-operator-review-request";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sanitizeSlug(value, fallback) {
  const sanitized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (sanitized.length === 0) {
    return fallback;
  }

  return sanitized.slice(0, 48);
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

async function readScopeState(page) {
  return page.evaluate(() => ({
    mode:
      document.querySelector("[data-audit-request-scope]")?.getAttribute(
        "data-audit-request-scope-mode",
      ) ?? "",
    label:
      document.querySelector("[data-audit-request-scope-label]")?.textContent?.trim() ??
      "",
    summary:
      document.querySelector("[data-audit-request-scope-copy]")?.textContent?.trim() ??
      "",
    archiveCommand:
      document.querySelector("[data-audit-request-scope-archive]")?.textContent?.trim() ??
      "",
    preflightCommand:
      document.querySelector("[data-audit-request-scope-preflight]")?.textContent?.trim() ??
      "",
    completeCommand:
      document.querySelector("[data-audit-request-scope-complete]")?.textContent?.trim() ??
      "",
  }));
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });
  const requestTemplate = await readFile(requestTemplatePath, "utf8");
  const requestManifest = JSON.parse(await readFile(requestManifestPath, "utf8"));
  const requestRevisionSegment = String(
    requestManifest?.requestRevisionSha256 ?? "",
  )
    .trim()
    .slice(0, 12);
  const expectedFilename =
    `interaction-audit-signoff-export-2026-04-23-${sanitizeSlug(expectedRequestId, "")}-rev-${requestRevisionSegment}-${sanitizeSlug(expectedSessionLabel, "review-session")}.json`;

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
    await page.evaluate(([stateKey, metadataKey, requestKey]) => {
      globalThis.localStorage?.removeItem(stateKey);
      globalThis.localStorage?.removeItem(metadataKey);
      globalThis.localStorage?.removeItem(requestKey);
    }, [
      signoffStorageKey,
      signoffMetadataStorageKey,
      signoffRequestContextStorageKey,
    ]);
    await page.reload({ waitUntil: "networkidle" });
    await waitForAuditHub(page);

    const defaultScope = await readScopeState(page);
    assert(defaultScope.mode === "adhoc", "Default workspace scope was not ad hoc.");
    assert(
      defaultScope.archiveCommand.includes("interaction-audit:archive"),
      "Ad-hoc request scope did not expose the archive command.",
    );

    await openDetails(page, "[data-audit-signoff-import-details]");
    await page.locator("[data-audit-import-textarea]").fill(requestTemplate);
    await page.locator("[data-audit-apply-import]").click();

    await page.locator("[data-audit-session-reviewer]").fill(expectedReviewer);
    await page.locator("[data-audit-session-label]").fill(expectedSessionLabel);
    await page
      .locator("[data-audit-session-reviewed-at]")
      .fill(expectedReviewedAt);

    const boundScope = await readScopeState(page);
    assert(boundScope.mode === "bound", "Imported request scope did not become bound.");
    assert(
      boundScope.label.includes("Repo-backed request"),
      "Bound request scope did not expose the repo-backed label.",
    );
    assert(
      boundScope.preflightCommand.includes(expectedRequestId),
      "Bound request scope did not expose the preflight command.",
    );
    assert(
      boundScope.completeCommand.includes(expectedRequestId),
      "Bound request scope did not expose the completion command.",
    );

    const signoffJsonDownload = await triggerDownload(
      page,
      "[data-audit-download-signoff-json]",
      artifactDir,
    );

    assert(
      signoffJsonDownload.suggestedFilename === expectedFilename,
      "Bound signoff JSON filename did not include the request scope.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-request-scope-visibility-review.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const report = {
      defaultScope,
      boundScope,
      expectedFilename,
      downloads: {
        signoffJson: signoffJsonDownload.relativePath,
      },
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase88-results.json");

    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase88: saved artifacts under ${artifactDir}`);
    console.log(`phase88: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase88: scope=${boundScope.mode} filename=${signoffJsonDownload.suggestedFilename}`,
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase88: interaction audit request scope visibility review failed");
  console.error(error);
  process.exitCode = 1;
});
