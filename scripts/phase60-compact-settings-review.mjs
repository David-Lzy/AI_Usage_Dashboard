import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase60-compact-settings-review");
const previewUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const scenarios = [
  {
    label: "compact-motion-safe",
    width: 360,
    height: 740,
    reducedMotion: "no-preference",
  },
  {
    label: "compact-reduced-motion",
    width: 360,
    height: 740,
    reducedMotion: "reduce",
  },
  {
    label: "medium-motion-safe",
    width: 420,
    height: 900,
    reducedMotion: "no-preference",
  },
  {
    label: "medium-reduced-motion",
    width: 420,
    height: 900,
    reducedMotion: "reduce",
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countGridTracks(gridTemplateColumns) {
  return gridTemplateColumns
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean).length;
}

async function collectLayoutStats(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const topBar = document.querySelector(".top-app-bar");
    const sessionGrid = document.querySelector(".source-card__session-grid");
    const diagnosticRow = document.querySelector(".source-card__diagnostic-row");
    const mediumMotionDuration = getComputedStyle(document.documentElement)
      .getPropertyValue("--app-motion-duration-medium")
      .trim();

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      topBarTop: topBar ? Math.round(topBar.getBoundingClientRect().top) : null,
      sessionGridColumns: sessionGrid
        ? countGridTracks(getComputedStyle(sessionGrid).gridTemplateColumns)
        : 0,
      diagnosticRowColumns: diagnosticRow
        ? countGridTracks(getComputedStyle(diagnosticRow).gridTemplateColumns)
        : 0,
      mediumMotionDuration,
      openDetailsCount: document.querySelectorAll(".source-card__details[open]")
        .length,
    };

    function countGridTracks(gridTemplateColumns) {
      return gridTemplateColumns
        .split(" ")
        .map((value) => value.trim())
        .filter(Boolean).length;
    }
  });
}

async function captureScenario(browser, scenario) {
  const page = await browser.newPage({
    viewport: {
      width: scenario.width,
      height: scenario.height,
    },
  });

  await page.emulateMedia({ reducedMotion: scenario.reducedMotion });
  await page.goto(previewUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Settings Overview");
  await page.waitForSelector("text=Hybrid source contracts");

  const firstSourceCard = page.locator(".source-card").first();
  await firstSourceCard.scrollIntoViewIfNeeded();
  const firstToggle = firstSourceCard.locator(".source-card__details-toggle");
  await firstToggle.click();
  await page.waitForTimeout(200);

  const beforeScroll = await collectLayoutStats(page);
  const screenshotPath = path.join(
    artifactDir,
    `${scenario.label}-${scenario.width}x${scenario.height}.png`,
  );

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(150);
  const afterScroll = await collectLayoutStats(page);

  await page.close();

  return {
    ...scenario,
    screenshotPath,
    beforeScroll,
    afterScroll,
  };
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  const results = [];

  try {
    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario);

      assert(
        result.beforeScroll.horizontalOverflow <= 1,
        `Compact Settings overflow detected for ${scenario.label}: ${result.beforeScroll.horizontalOverflow}px`,
      );
      assert(
        result.beforeScroll.openDetailsCount >= 1,
        `Disclosure did not open for ${scenario.label}.`,
      );
      assert(
        result.afterScroll.topBarTop !== null &&
          result.afterScroll.topBarTop <= 32,
        `Sticky Settings top bar drifted too far for ${scenario.label}: top=${result.afterScroll.topBarTop}`,
      );
      assert(
        result.beforeScroll.diagnosticRowColumns === 1,
        `Expanded diagnostic rows did not collapse to one column for ${scenario.label}: columns=${result.beforeScroll.diagnosticRowColumns}`,
      );

      if (scenario.reducedMotion === "reduce") {
        assert(
          result.beforeScroll.mediumMotionDuration === "0ms",
          `Reduced-motion medium duration was not disabled for ${scenario.label}: ${result.beforeScroll.mediumMotionDuration}`,
        );
      } else {
        assert(
          result.beforeScroll.mediumMotionDuration !== "0ms",
          `Motion-safe scenario unexpectedly resolved to 0ms for ${scenario.label}.`,
        );
      }

      results.push(result);
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(artifactDir, "phase60-results.json");
  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`phase60: saved artifacts under ${artifactDir}`);
  console.log(`phase60: saved machine-readable results to ${reportPath}`);

  for (const result of results) {
    console.log(
      [
        "phase60:",
        result.label,
        `viewport=${result.width}x${result.height}`,
        `reduced_motion=${result.reducedMotion}`,
        `overflow=${result.beforeScroll.horizontalOverflow}`,
        `open_details=${result.beforeScroll.openDetailsCount}`,
        `session_grid_columns=${result.beforeScroll.sessionGridColumns}`,
        `diagnostic_row_columns=${result.beforeScroll.diagnosticRowColumns}`,
        `motion_duration=${result.beforeScroll.mediumMotionDuration}`,
        `sticky_top_after_scroll=${result.afterScroll.topBarTop}`,
        `screenshot=${result.screenshotPath}`,
      ].join(" "),
    );
  }
}

await runReview();
