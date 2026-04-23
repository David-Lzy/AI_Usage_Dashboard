import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase66-detail-supporting-surface-review",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function collectStyles(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(element);

    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      borderRadius: styles.borderRadius,
      overflowWrap: styles.overflowWrap,
      wordBreak: styles.wordBreak,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function reviewProviderDetail(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Provider Detail");

  const detailField = page.locator(".detail-field").first();
  const detailFieldValue = page.locator(".detail-field__value").first();
  const detailNote = page.locator(".detail-note--neutral").first();
  const statusCard = page.locator(".status-card").last();

  const overflow = await collectOverflowState(page);
  const detailFieldStyles = await collectStyles(detailField);
  const detailFieldValueStyles = await collectStyles(detailFieldValue);
  const detailNoteStyles = await collectStyles(detailNote);
  const statusCardStyles = await collectStyles(statusCard);

  await page.screenshot({
    path: path.join(artifactDir, `${config.slug}.png`),
    fullPage: true,
  });

  assert(
    overflow.overflowX === 0,
    `${config.slug}: provider detail overflowed horizontally (${overflow.overflowX}px).`,
  );
  assert(
    detailFieldStyles?.borderColor !== "rgba(0, 0, 0, 0)",
    `${config.slug}: detail fields lost their explicit border.`,
  );
  assert(
    detailFieldStyles?.backgroundColor !== statusCardStyles?.backgroundColor,
    `${config.slug}: detail fields collapsed into the same background as the parent status card.`,
  );
  assert(
    detailNoteStyles?.backgroundColor !== detailFieldStyles?.backgroundColor,
    `${config.slug}: neutral detail notes no longer read as a stronger supporting surface than detail fields.`,
  );
  assert(
    detailFieldValueStyles?.overflowWrap === "anywhere",
    `${config.slug}: detail field values lost overflow-wrap:anywhere.`,
  );

  return {
    slug: config.slug,
    viewport: config.viewport,
    overflow,
    detailFieldStyles,
    detailFieldValueStyles,
    detailNoteStyles,
    statusCardStyles,
  };
}

async function reviewSettingsDiagnostics(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Hybrid source contracts");

  const detailsToggle = page.locator("#settings-sources .source-card__details-toggle").first();
  await detailsToggle.click();
  await page.waitForSelector(".source-card__diagnostic-group");

  const overflow = await collectOverflowState(page);
  const diagnosticGroup = page.locator(".source-card__diagnostic-group").first();
  const sourceCard = page.locator("#settings-sources .source-card").first();
  const diagnosticValue = page.locator(".source-card__diagnostic-value").first();

  const diagnosticGroupStyles = await collectStyles(diagnosticGroup);
  const sourceCardStyles = await collectStyles(sourceCard);
  const diagnosticValueStyles = await collectStyles(diagnosticValue);

  await page.screenshot({
    path: path.join(artifactDir, `${config.slug}.png`),
    fullPage: true,
  });

  assert(
    overflow.overflowX === 0,
    `${config.slug}: settings diagnostics overflowed horizontally (${overflow.overflowX}px).`,
  );
  assert(
    diagnosticGroupStyles?.borderColor !== "rgba(0, 0, 0, 0)",
    `${config.slug}: diagnostic groups lost their explicit border.`,
  );
  assert(
    diagnosticGroupStyles?.backgroundColor !== sourceCardStyles?.backgroundColor,
    `${config.slug}: diagnostic groups collapsed into the same background as the source card.`,
  );
  assert(
    diagnosticValueStyles?.overflowWrap === "anywhere",
    `${config.slug}: diagnostic values lost overflow-wrap:anywhere.`,
  );

  return {
    slug: config.slug,
    viewport: config.viewport,
    overflow,
    diagnosticGroupStyles,
    sourceCardStyles,
    diagnosticValueStyles,
  };
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage();

  try {
    const results = [];

    results.push(
      await reviewProviderDetail(page, {
        slug: "provider-detail-cursor-360",
        url: "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/cursor",
        viewport: { width: 360, height: 820 },
      }),
    );

    results.push(
      await reviewProviderDetail(page, {
        slug: "provider-detail-codex-420",
        url: "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/codex",
        viewport: { width: 420, height: 900 },
      }),
    );

    results.push(
      await reviewSettingsDiagnostics(page, {
        slug: "settings-diagnostics-420",
        url: "http://127.0.0.1:4173/src/sidepanel/index.html#settings",
        viewport: { width: 420, height: 900 },
      }),
    );

    const reportPath = path.join(artifactDir, "phase66-results.json");
    await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

    console.log(`phase66: saved artifacts under ${artifactDir}`);
    console.log(`phase66: saved machine-readable results to ${reportPath}`);

    for (const result of results) {
      console.log(
        `phase66: ${result.slug} overflow=${result.overflow.overflowX}`,
      );
    }
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase66: supporting-surface review failed");
  console.error(error);
  process.exitCode = 1;
});
