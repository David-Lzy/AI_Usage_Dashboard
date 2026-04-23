import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase62-status-surface-review");
const sidePanelUrl = "http://127.0.0.1:4173/src/sidepanel/index.html";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function slugify(label) {
  return label.toLowerCase().replaceAll(/\s+/g, "-");
}

async function readSurfaceStyles(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(element);

    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      boxShadow: styles.boxShadow,
      color: styles.color,
    };
  });
}

async function captureRoute(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "networkidle" });
  await config.ready(page);

  const result = await config.collect(page);
  const screenshotPath = path.join(artifactDir, `${slugify(config.slug)}.png`);

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return {
    slug: config.slug,
    screenshotPath,
    ...result,
  };
}

const reviewConfigs = [
  {
    slug: "dashboard-status-surfaces",
    url: sidePanelUrl,
    viewport: { width: 420, height: 980 },
    ready: async (page) => {
      await page.waitForSelector("text=AI Usage Dashboard");
      await page.waitForSelector(".provider-card");
    },
    collect: async (page) => {
      const neutralSummary = page
        .locator(".summary-pill:not(.summary-pill--warning):not(.summary-pill--error)")
        .first();
      const errorSummary = page.locator(".summary-pill--error").first();
      const neutralProvider = page
        .locator(".provider-card:not(.provider-card--warning):not(.provider-card--error)")
        .first();
      const warningProvider = page.locator(".provider-card--warning").first();

      await neutralSummary.waitFor({ state: "visible" });
      await errorSummary.waitFor({ state: "visible" });
      await neutralProvider.waitFor({ state: "visible" });
      await warningProvider.waitFor({ state: "visible" });

      const neutralSummaryStyles = await readSurfaceStyles(neutralSummary);
      const errorSummaryStyles = await readSurfaceStyles(errorSummary);
      const neutralProviderStyles = await readSurfaceStyles(neutralProvider);
      const warningProviderStyles = await readSurfaceStyles(warningProvider);

      assert(
        neutralSummaryStyles?.backgroundColor !== errorSummaryStyles?.backgroundColor,
        "Dashboard error summary pill did not diverge from the neutral summary surface.",
      );
      assert(
        neutralProviderStyles?.backgroundColor !== warningProviderStyles?.backgroundColor,
        "Dashboard warning provider card still matches the neutral provider background.",
      );
      assert(
        neutralProviderStyles?.borderColor !== warningProviderStyles?.borderColor,
        "Dashboard warning provider card border did not diverge from the neutral provider border.",
      );

      return {
        neutralSummaryStyles,
        errorSummaryStyles,
        neutralProviderStyles,
        warningProviderStyles,
      };
    },
  },
  {
    slug: "settings-status-surfaces",
    url: sidePanelUrl,
    viewport: { width: 420, height: 980 },
    ready: async (page) => {
      await page.waitForSelector("text=AI Usage Dashboard");
      await page.getByRole("button", { name: "Settings" }).click();
      await page.waitForSelector("text=Permission controls");
    },
    collect: async (page) => {
      const neutralPrompt = page
        .locator(".permission-prompt:not(.permission-prompt--warning)")
        .first();
      const warningPrompt = page.locator(".permission-prompt--warning").first();

      await neutralPrompt.waitFor({ state: "visible" });
      await warningPrompt.waitFor({ state: "visible" });

      await page.locator(".top-app-bar .icon-button--primary").click();

      const successToast = page.locator(".toast--success");
      await successToast.waitFor({ state: "visible" });

      const neutralPromptStyles = await readSurfaceStyles(neutralPrompt);
      const warningPromptStyles = await readSurfaceStyles(warningPrompt);
      const successToastStyles = await readSurfaceStyles(successToast);

      assert(
        neutralPromptStyles?.backgroundColor !== warningPromptStyles?.backgroundColor,
        "Settings warning permission prompt still matches the neutral prompt background.",
      );
      assert(
        neutralPromptStyles?.borderColor !== warningPromptStyles?.borderColor,
        "Settings warning permission prompt border did not diverge from the neutral prompt border.",
      );
      assert(
        successToastStyles?.backgroundColor !== "rgb(255, 255, 255)",
        "Success toast still uses a neutral white surface.",
      );
      assert(
        successToastStyles?.borderColor !== "rgb(196, 198, 208)",
        "Success toast border still uses the default outline color.",
      );

      return {
        neutralPromptStyles,
        warningPromptStyles,
        successToastStyles,
      };
    },
  },
  {
    slug: "popup-status-surfaces",
    url: popupUrl,
    viewport: { width: 380, height: 820 },
    ready: async (page) => {
      await page.waitForSelector("text=Quick glance");
      await page.waitForSelector(".popup-provider-card");
    },
    collect: async (page) => {
      const neutralStatusCard = page
        .locator(".status-card:not(.status-card--warning):not(.status-card--error)")
        .first();
      const tonedStatusCard = page
        .locator(".status-card--warning, .status-card--error")
        .first();
      const tonedPopupProvider = page
        .locator(".popup-provider-card--warning, .popup-provider-card--error")
        .first();

      await neutralStatusCard.waitFor({ state: "visible" });
      await tonedStatusCard.waitFor({ state: "visible" });
      await tonedPopupProvider.waitFor({ state: "visible" });

      const neutralStatusCardStyles = await readSurfaceStyles(neutralStatusCard);
      const tonedStatusCardStyles = await readSurfaceStyles(tonedStatusCard);
      const tonedPopupProviderStyles = await readSurfaceStyles(
        tonedPopupProvider,
      );

      assert(
        neutralStatusCardStyles?.backgroundColor !== tonedStatusCardStyles?.backgroundColor,
        "Popup toned status card still matches the neutral status-card background.",
      );
      assert(
        tonedPopupProviderStyles?.backgroundColor !== "rgb(255, 255, 255)",
        "Popup toned provider card still uses a neutral white background.",
      );
      assert(
        tonedPopupProviderStyles?.borderColor !== "rgb(196, 198, 208)",
        "Popup toned provider card still uses the default outline border.",
      );

      return {
        neutralStatusCardStyles,
        tonedStatusCardStyles,
        tonedPopupProviderStyles,
      };
    },
  },
];

async function runStatusSurfaceReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage();
  const results = [];

  try {
    for (const config of reviewConfigs) {
      results.push(await captureRoute(page, config));
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(artifactDir, "phase62-results.json");
  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`phase62: saved artifacts under ${artifactDir}`);
  console.log(`phase62: saved machine-readable results to ${reportPath}`);

  for (const result of results) {
    console.log(
      [
        "phase62:",
        result.slug,
        `screenshot=${result.screenshotPath}`,
      ].join(" "),
    );
  }
}

await runStatusSurfaceReview();
