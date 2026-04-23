import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase55-visual-review");
const previewUrl = "http://127.0.0.1:4173/src/sidepanel/index.html";
const widths = [360, 420, 720];
const viewportHeight = 1200;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function slugify(label) {
  return label.toLowerCase().replaceAll(/\s+/g, "-");
}

async function collectLayoutStats(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const summaryStrip = document.querySelector(".summary-strip");
    const topBar = document.querySelector(".top-app-bar");
    const gridTemplateColumns = summaryStrip
      ? getComputedStyle(summaryStrip).gridTemplateColumns
      : "";
    const summaryColumns = gridTemplateColumns
      ? gridTemplateColumns
          .split(" ")
          .map((value) => value.trim())
          .filter(Boolean).length
      : 0;

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      summaryColumns,
      topBarTop: topBar ? Math.round(topBar.getBoundingClientRect().top) : null,
    };
  });
}

async function captureRoute(page, width, routeLabel, navigate) {
  await page.setViewportSize({ width, height: viewportHeight });
  await navigate();
  await page.waitForLoadState("networkidle");

  const beforeScroll = await collectLayoutStats(page);
  const screenshotPath = path.join(
    artifactDir,
    `${slugify(routeLabel)}-${width}.png`,
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

  return {
    width,
    routeLabel,
    screenshotPath,
    beforeScroll,
    afterScroll,
  };
}

async function runVisualReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  const page = await browser.newPage();
  const results = [];

  try {
    for (const width of widths) {
      const dashboardResult = await captureRoute(
        page,
        width,
        "dashboard",
        async () => {
          await page.goto(previewUrl, { waitUntil: "networkidle" });
          await page.waitForSelector("text=AI Usage Dashboard");
          await page.waitForSelector("text=Provider cards");
        },
      );

      assert(
        dashboardResult.beforeScroll.horizontalOverflow <= 1,
        `Dashboard overflow detected at width ${width}: ${dashboardResult.beforeScroll.horizontalOverflow}px`,
      );

      const settingsResult = await captureRoute(
        page,
        width,
        "settings",
        async () => {
          await page.goto(previewUrl, { waitUntil: "networkidle" });
          await page.waitForSelector("text=AI Usage Dashboard");
          await page.getByRole("button", { name: "Settings" }).click();
          await page.waitForSelector("text=Settings Overview");
          await page.waitForSelector("text=Hybrid source contracts");
        },
      );

      assert(
        settingsResult.beforeScroll.horizontalOverflow <= 1,
        `Settings overflow detected at width ${width}: ${settingsResult.beforeScroll.horizontalOverflow}px`,
      );
      assert(
        settingsResult.afterScroll.topBarTop !== null &&
          settingsResult.afterScroll.topBarTop <= 32,
        `Sticky Settings top bar drifted too far at width ${width}: top=${settingsResult.afterScroll.topBarTop}`,
      );

      results.push(dashboardResult, settingsResult);
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(artifactDir, "phase55-results.json");
  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`phase55: saved artifacts under ${artifactDir}`);
  console.log(`phase55: saved machine-readable results to ${reportPath}`);

  for (const result of results) {
    console.log(
      [
        "phase55:",
        `${result.routeLabel}@${result.width}`,
        `overflow=${result.beforeScroll.horizontalOverflow}`,
        `summary_columns=${result.beforeScroll.summaryColumns}`,
        `sticky_top_after_scroll=${result.afterScroll.topBarTop}`,
        `screenshot=${result.screenshotPath}`,
      ].join(" "),
    );
  }
}

await runVisualReview();
