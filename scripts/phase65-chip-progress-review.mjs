import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase65-chip-progress-review");
const dashboardUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#dashboard";
const settingsUrl = "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const jetbrainsDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/jetbrains";
const cursorDetailUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/cursor";

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
      color: styles.color,
      borderRadius: styles.borderRadius,
    };
  });
}

async function collectProgressState(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const fill = element.querySelector(".usage-progress__fill");
    const fillStyles =
      fill instanceof HTMLElement ? getComputedStyle(fill) : null;

    return {
      ariaValueNow: element.getAttribute("aria-valuenow"),
      ariaValueText: element.getAttribute("aria-valuetext"),
      className: element.className,
      fillWidth: fill instanceof HTMLElement ? fill.style.width : null,
      fillBackgroundImage: fillStyles?.backgroundImage ?? null,
    };
  });
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 420, height: 900 });
    await page.goto(dashboardUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Provider cards");

    const tokenChip = page.locator(".token-chip").first();
    const neutralStatusChip = page
      .locator(".provider-card:not(.provider-card--warning):not(.provider-card--error) .status-chip")
      .first();
    const neutralMetaChip = page
      .locator(".provider-card:not(.provider-card--warning):not(.provider-card--error) .meta-chip")
      .first();
    const warningMetaChip = page.locator(".provider-card .meta-chip--warning").first();

    const dashboardStyles = {
      tokenChip: await collectStyles(tokenChip),
      neutralStatusChip: await collectStyles(neutralStatusChip),
      neutralMetaChip: await collectStyles(neutralMetaChip),
      warningMetaChip: await collectStyles(warningMetaChip),
    };

    await page.screenshot({
      path: path.join(artifactDir, "dashboard-chip-review.png"),
      fullPage: true,
    });

    assert(
      dashboardStyles.tokenChip?.borderRadius === "999px",
      "Dashboard token chip no longer uses the shared pill radius.",
    );
    assert(
      dashboardStyles.tokenChip?.borderColor !== "rgba(0, 0, 0, 0)",
      "Dashboard token chip lost its explicit border treatment.",
    );
    assert(
      dashboardStyles.neutralStatusChip?.backgroundColor !==
        dashboardStyles.neutralMetaChip?.backgroundColor,
      "Neutral status chips and neutral meta chips collapsed into the same emphasis level.",
    );
    assert(
      dashboardStyles.warningMetaChip?.backgroundColor !==
        dashboardStyles.neutralMetaChip?.backgroundColor,
      "Warning meta chips no longer differ from neutral meta chips.",
    );

    await page.goto(settingsUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Stored secrets and workspace config");

    const missingCredentialState = page.locator(".credential-state--missing").first();
    const settingsNeutralMetaChip = page.locator("#settings-sources .meta-chip").first();

    const settingsStyles = {
      missingCredentialState: await collectStyles(missingCredentialState),
      neutralMetaChip: await collectStyles(settingsNeutralMetaChip),
    };

    await page.screenshot({
      path: path.join(artifactDir, "settings-chip-review.png"),
      fullPage: true,
    });

    assert(
      settingsStyles.missingCredentialState?.borderRadius === "999px",
      "Credential state badge no longer uses the shared pill radius.",
    );
    assert(
      settingsStyles.missingCredentialState?.backgroundColor !==
        settingsStyles.neutralMetaChip?.backgroundColor,
      "Credential state badge collapsed into the neutral meta-chip role.",
    );

    await page.goto(jetbrainsDetailUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("text=JetBrains AI");

    const determinateProgress = page.locator(".usage-progress__track").first();
    const determinateState = await collectProgressState(determinateProgress);

    await page.screenshot({
      path: path.join(artifactDir, "detail-determinate-progress-review.png"),
      fullPage: true,
    });

    assert(
      determinateState?.ariaValueNow === "80",
      `Expected determinate progress aria-valuenow=80, got ${determinateState?.ariaValueNow}.`,
    );
    assert(
      determinateState?.ariaValueText === "80% used",
      `Expected determinate progress aria-valuetext='80% used', got ${determinateState?.ariaValueText}.`,
    );
    assert(
      !determinateState?.className.includes("usage-progress__track--indeterminate"),
      "Determinate progress incorrectly rendered as indeterminate.",
    );
    assert(
      determinateState?.fillWidth === "80%",
      `Expected determinate progress fill width 80%, got ${determinateState?.fillWidth}.`,
    );

    await page.goto(cursorDetailUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Cursor");

    const indeterminateProgress = page.locator(".usage-progress__track").first();
    const indeterminateState = await collectProgressState(indeterminateProgress);

    await page.screenshot({
      path: path.join(artifactDir, "detail-indeterminate-progress-review.png"),
      fullPage: true,
    });

    assert(
      indeterminateState?.ariaValueNow === null,
      "Indeterminate progress should omit aria-valuenow.",
    );
    assert(
      indeterminateState?.ariaValueText === "Usage percentage unavailable",
      `Expected indeterminate progress aria-valuetext to explain unavailable values, got ${indeterminateState?.ariaValueText}.`,
    );
    assert(
      indeterminateState?.className.includes("usage-progress__track--indeterminate"),
      "Unknown progress did not expose the indeterminate track class.",
    );
    assert(
      indeterminateState?.fillWidth === "",
      `Indeterminate progress should not use an inline fake width, got ${indeterminateState?.fillWidth}.`,
    );
    assert(
      indeterminateState?.fillBackgroundImage !== "none",
      "Indeterminate progress lost its explicit striped treatment.",
    );

    await page.goto(popupUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Featured providers");

    const popupMetaChip = page.locator(".popup-provider-card .meta-chip").first();
    const popupMetaChipStyles = await collectStyles(popupMetaChip);

    await page.screenshot({
      path: path.join(artifactDir, "popup-chip-review.png"),
      fullPage: true,
    });

    assert(
      popupMetaChipStyles?.backgroundColor ===
        dashboardStyles.neutralMetaChip?.backgroundColor,
      "Popup meta chips drifted away from the dashboard neutral chip role.",
    );

    const results = {
      dashboardStyles,
      settingsStyles,
      determinateState,
      indeterminateState,
      popupMetaChipStyles,
    };

    const reportPath = path.join(artifactDir, "phase65-results.json");
    await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

    console.log(`phase65: saved artifacts under ${artifactDir}`);
    console.log(`phase65: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase65: determinate_progress=${determinateState?.ariaValueNow} indeterminate_value_text=${indeterminateState?.ariaValueText}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase65: chip-and-progress review failed");
  console.error(error);
  process.exitCode = 1;
});
