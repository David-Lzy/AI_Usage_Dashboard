import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase63-toned-content-review");
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

async function readColor(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    return getComputedStyle(element).color;
  });
}

async function captureReview(page, config) {
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
    slug: "dashboard-toned-content",
    url: sidePanelUrl,
    viewport: { width: 420, height: 980 },
    ready: async (page) => {
      await page.waitForSelector(".summary-strip");
      await page.waitForSelector(".provider-card");
    },
    collect: async (page) => {
      const neutralSummaryLabel = page
        .locator(".summary-pill:not(.summary-pill--warning):not(.summary-pill--error) .summary-pill__label")
        .first();
      const errorSummaryLabel = page.locator(".summary-pill--error .summary-pill__label").first();
      const errorSummaryValue = page.locator(".summary-pill--error .summary-pill__value").first();
      const neutralProviderPlan = page
        .locator(".provider-card:not(.provider-card--warning):not(.provider-card--error) .provider-card__plan")
        .first();
      const warningProviderTitle = page.locator(".provider-card--warning .provider-card__provider").first();
      const warningProviderPlan = page.locator(".provider-card--warning .provider-card__plan").first();

      await neutralSummaryLabel.waitFor({ state: "visible" });
      await errorSummaryLabel.waitFor({ state: "visible" });
      await errorSummaryValue.waitFor({ state: "visible" });
      await neutralProviderPlan.waitFor({ state: "visible" });
      await warningProviderTitle.waitFor({ state: "visible" });
      await warningProviderPlan.waitFor({ state: "visible" });

      const neutralSummaryLabelColor = await readColor(neutralSummaryLabel);
      const errorSummaryLabelColor = await readColor(errorSummaryLabel);
      const errorSummaryValueColor = await readColor(errorSummaryValue);
      const neutralProviderPlanColor = await readColor(neutralProviderPlan);
      const warningProviderTitleColor = await readColor(warningProviderTitle);
      const warningProviderPlanColor = await readColor(warningProviderPlan);

      assert(
        neutralSummaryLabelColor !== errorSummaryLabelColor,
        "Dashboard error summary label still uses the neutral summary-label color.",
      );
      assert(
        errorSummaryLabelColor !== errorSummaryValueColor,
        "Dashboard error summary label and value still share the same color.",
      );
      assert(
        neutralProviderPlanColor !== warningProviderPlanColor,
        "Dashboard warning provider plan still uses the neutral plan color.",
      );
      assert(
        warningProviderTitleColor !== warningProviderPlanColor,
        "Dashboard warning provider title and plan still share the same color.",
      );

      return {
        neutralSummaryLabelColor,
        errorSummaryLabelColor,
        errorSummaryValueColor,
        neutralProviderPlanColor,
        warningProviderTitleColor,
        warningProviderPlanColor,
      };
    },
  },
  {
    slug: "settings-toned-content",
    url: sidePanelUrl,
    viewport: { width: 420, height: 980 },
    ready: async (page) => {
      await page.waitForSelector("text=AI Usage Dashboard");
      await page.getByRole("button", { name: "Settings" }).click();
      await page.waitForSelector("text=Permission controls");
    },
    collect: async (page) => {
      const neutralSupporting = page.locator(".status-card .supporting-copy").first();
      const neutralPromptProvider = page
        .locator(".permission-prompt:not(.permission-prompt--warning) .permission-prompt__provider")
        .first();
      const warningPromptProvider = page
        .locator(".permission-prompt--warning .permission-prompt__provider")
        .first();
      const warningPromptHosts = page
        .locator(".permission-prompt--warning .permission-prompt__hosts")
        .first();
      const warningDetailNoteSupport = page
        .locator(".detail-note--warning .supporting-copy")
        .first();

      await neutralSupporting.waitFor({ state: "visible" });
      await neutralPromptProvider.waitFor({ state: "visible" });
      await warningPromptProvider.waitFor({ state: "visible" });
      await warningPromptHosts.waitFor({ state: "visible" });
      await warningDetailNoteSupport.waitFor({ state: "visible" });

      await page.locator(".top-app-bar .icon-button--primary").click();
      const successToastTitle = page.locator(".toast--success .toast__title");
      const successToastSupporting = page.locator(".toast--success .supporting-copy");
      await successToastTitle.waitFor({ state: "visible" });
      await successToastSupporting.waitFor({ state: "visible" });

      const neutralSupportingColor = await readColor(neutralSupporting);
      const neutralPromptProviderColor = await readColor(neutralPromptProvider);
      const warningPromptProviderColor = await readColor(warningPromptProvider);
      const warningPromptHostsColor = await readColor(warningPromptHosts);
      const warningDetailNoteSupportColor = await readColor(warningDetailNoteSupport);
      const successToastTitleColor = await readColor(successToastTitle);
      const successToastSupportingColor = await readColor(successToastSupporting);

      assert(
        neutralPromptProviderColor !== warningPromptProviderColor,
        "Settings warning permission prompt title still uses the neutral prompt-title color.",
      );
      assert(
        warningPromptProviderColor !== warningPromptHostsColor,
        "Settings warning permission prompt title and host text still share the same color.",
      );
      assert(
        warningDetailNoteSupportColor !== neutralSupportingColor,
        "Settings warning detail note still uses the neutral supporting-copy color.",
      );
      assert(
        successToastTitleColor !== successToastSupportingColor,
        "Success toast title and supporting text still share the same color.",
      );
      assert(
        successToastSupportingColor !== neutralSupportingColor,
        "Success toast supporting text still uses the neutral supporting-copy color.",
      );

      return {
        neutralSupportingColor,
        neutralPromptProviderColor,
        warningPromptProviderColor,
        warningPromptHostsColor,
        warningDetailNoteSupportColor,
        successToastTitleColor,
        successToastSupportingColor,
      };
    },
  },
  {
    slug: "popup-toned-content",
    url: popupUrl,
    viewport: { width: 380, height: 820 },
    ready: async (page) => {
      await page.waitForSelector(".status-card");
      await page.waitForSelector(".popup-provider-card");
    },
    collect: async (page) => {
      const neutralStatusSupporting = page
        .locator(".status-card:not(.status-card--warning):not(.status-card--error) .supporting-copy")
        .first();
      const tonedStatusLabel = page
        .locator(".status-card--warning .section-label, .status-card--error .section-label")
        .first();
      const tonedStatusTitle = page
        .locator(".status-card--warning .section-title, .status-card--error .section-title")
        .first();
      const tonedStatusSupporting = page
        .locator(".status-card--warning .supporting-copy, .status-card--error .supporting-copy")
        .first();
      const warningPopupProviderTitle = page
        .locator(".popup-provider-card--warning .popup-provider-card__provider, .popup-provider-card--error .popup-provider-card__provider")
        .first();
      const warningPopupProviderPlan = page
        .locator(".popup-provider-card--warning .popup-provider-card__plan, .popup-provider-card--error .popup-provider-card__plan")
        .first();

      await neutralStatusSupporting.waitFor({ state: "visible" });
      await tonedStatusLabel.waitFor({ state: "visible" });
      await tonedStatusTitle.waitFor({ state: "visible" });
      await tonedStatusSupporting.waitFor({ state: "visible" });
      await warningPopupProviderTitle.waitFor({ state: "visible" });
      await warningPopupProviderPlan.waitFor({ state: "visible" });

      const neutralStatusSupportingColor = await readColor(neutralStatusSupporting);
      const tonedStatusLabelColor = await readColor(tonedStatusLabel);
      const tonedStatusTitleColor = await readColor(tonedStatusTitle);
      const tonedStatusSupportingColor = await readColor(tonedStatusSupporting);
      const warningPopupProviderTitleColor = await readColor(warningPopupProviderTitle);
      const warningPopupProviderPlanColor = await readColor(warningPopupProviderPlan);

      assert(
        tonedStatusTitleColor !== tonedStatusSupportingColor,
        "Popup toned status title and supporting text still share the same color.",
      );
      assert(
        tonedStatusLabelColor === tonedStatusSupportingColor,
        "Popup toned status label and supporting text no longer share the same subordinate color.",
      );
      assert(
        tonedStatusSupportingColor !== neutralStatusSupportingColor,
        "Popup toned status supporting text still uses the neutral supporting-copy color.",
      );
      assert(
        warningPopupProviderTitleColor !== warningPopupProviderPlanColor,
        "Popup toned provider title and plan still share the same color.",
      );

      return {
        neutralStatusSupportingColor,
        tonedStatusLabelColor,
        tonedStatusTitleColor,
        tonedStatusSupportingColor,
        warningPopupProviderTitleColor,
        warningPopupProviderPlanColor,
      };
    },
  },
];

async function runTonedContentReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage();
  const results = [];

  try {
    for (const config of reviewConfigs) {
      results.push(await captureReview(page, config));
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(artifactDir, "phase63-results.json");
  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`phase63: saved artifacts under ${artifactDir}`);
  console.log(`phase63: saved machine-readable results to ${reportPath}`);

  for (const result of results) {
    console.log(
      ["phase63:", result.slug, `screenshot=${result.screenshotPath}`].join(" "),
    );
  }
}

await runTonedContentReview();
