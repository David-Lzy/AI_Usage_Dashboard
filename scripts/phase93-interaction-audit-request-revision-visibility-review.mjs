import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase93-interaction-audit-request-revision-visibility-review",
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
const expectedReviewedAt = "2026-04-23T12:20:30.000Z";
const expectedSessionLabel = "Request Revision Visibility QA";
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
    binding:
      document.querySelector(
        '[data-audit-request-scope-summary="binding"] .source-card__value',
      )?.textContent?.trim() ?? "",
    revision:
      document.querySelector(
        '[data-audit-request-scope-summary="revision"] .source-card__value',
      )?.textContent?.trim() ?? "",
    downloads:
      document.querySelector(
        '[data-audit-request-scope-summary="downloads"] .source-card__value',
      )?.textContent?.trim() ?? "",
    sessionSummary:
      document.querySelector("[data-audit-request-binding-summary]")?.textContent?.trim() ??
      "",
  }));
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });
  const requestTemplate = await readFile(requestTemplatePath, "utf8");
  const requestManifest = JSON.parse(await readFile(requestManifestPath, "utf8"));
  const requestRevisionSha256 = String(
    requestManifest?.requestRevisionSha256 ?? "",
  ).trim();
  const requestRevisionSegment = requestRevisionSha256.slice(0, 12);

  const expectedSignoffDraftFilename =
    `interaction-audit-signoff-draft-2026-04-23-${sanitizeSlug(expectedRequestId, "")}-rev-${requestRevisionSegment}-${sanitizeSlug(expectedSessionLabel, "review-session")}.md`;
  const expectedSignoffJsonFilename =
    `interaction-audit-signoff-export-2026-04-23-${sanitizeSlug(expectedRequestId, "")}-rev-${requestRevisionSegment}-${sanitizeSlug(expectedSessionLabel, "review-session")}.json`;
  const expectedHandoffFilename =
    `interaction-audit-handoff-summary-2026-04-23-${sanitizeSlug(expectedRequestId, "")}-rev-${requestRevisionSegment}-${sanitizeSlug(expectedSessionLabel, "review-session")}.md`;

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
    await openDetails(page, "[data-audit-signoff-import-details]");

    await page.locator("[data-audit-import-textarea]").fill(requestTemplate);
    await page.locator("[data-audit-apply-import]").click();

    await page.locator("[data-audit-session-reviewer]").fill(expectedReviewer);
    await page.locator("[data-audit-session-label]").fill(expectedSessionLabel);
    await page
      .locator("[data-audit-session-reviewed-at]")
      .fill(expectedReviewedAt);

    const scopeState = await readScopeState(page);
    assert(scopeState.mode === "bound", "Request scope did not become bound.");
    assert(
      scopeState.binding.includes(expectedRequestId),
      "Request scope binding did not show the expected request id.",
    );
    assert(
      scopeState.revision === `sha256:${requestRevisionSha256}`,
      "Request scope revision did not show the expected request digest.",
    );
    assert(
      scopeState.downloads.includes("request id and request revision"),
      "Request scope downloads summary did not mention revision-aware downloads.",
    );
    assert(
      scopeState.sessionSummary.includes(`Request revision: sha256:${requestRevisionSha256}`),
      "Review-session summary did not include the bound request revision.",
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
      signoffDraftDownload.suggestedFilename === expectedSignoffDraftFilename,
      "Signoff draft filename did not include the request revision segment.",
    );
    assert(
      signoffJsonDownload.suggestedFilename === expectedSignoffJsonFilename,
      "Signoff JSON filename did not include the request revision segment.",
    );
    assert(
      handoffSummaryDownload.suggestedFilename === expectedHandoffFilename,
      "Handoff summary filename did not include the request revision segment.",
    );

    const signoffDraft = await readFile(signoffDraftDownload.savedPath, "utf8");
    const signoffJson = JSON.parse(
      await readFile(signoffJsonDownload.savedPath, "utf8"),
    );
    const handoffSummary = await readFile(handoffSummaryDownload.savedPath, "utf8");

    assert(
      signoffDraft.includes(
        `- Request revision: sha256:${requestRevisionSha256}`,
      ),
      "Downloaded signoff draft was missing the request revision line.",
    );
    assert(
      signoffJson.requestContext?.requestRevisionSha256 === requestRevisionSha256,
      "Downloaded signoff JSON was missing the bound request revision.",
    );
    assert(
      handoffSummary.includes(
        `- Request revision: sha256:${requestRevisionSha256}`,
      ),
      "Downloaded handoff summary was missing the request revision line.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "interaction-audit-request-revision-visibility-review.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const report = {
      requestId: expectedRequestId,
      requestRevisionSha256,
      scopeState,
      expectedFilenames: {
        signoffDraft: expectedSignoffDraftFilename,
        signoffJson: expectedSignoffJsonFilename,
        handoffSummary: expectedHandoffFilename,
      },
      downloads: {
        signoffDraft: signoffDraftDownload.relativePath,
        signoffJson: signoffJsonDownload.relativePath,
        handoffSummary: handoffSummaryDownload.relativePath,
      },
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase93-results.json");

    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase93: saved artifacts under ${artifactDir}`);
    console.log(`phase93: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase93: revision=${requestRevisionSha256} filename=${signoffJsonDownload.suggestedFilename}`,
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error(
    "phase93: interaction audit request revision visibility review failed",
  );
  console.error(error);
  process.exitCode = 1;
});
