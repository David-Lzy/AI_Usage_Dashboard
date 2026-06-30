import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "popup-high-dpi-action-edge-review",
);
const cssFiles = [
  "src/sidepanel/theme/tokens.css",
  "src/sidepanel/theme/material-theme.css",
  "src/sidepanel/theme/app-shell.css",
  "src/sidepanel/theme/buttons.css",
  "src/sidepanel/theme/surfaces.css",
  "src/popup/popup-theme.css",
];
const viewports = [320, 344, 360, 392, 420, 520];
const deviceScaleFactors = [1, 1.25, 1.5, 2];
const minimumRightInsetPx = 6;
const maximumActionGapDeltaPx = 2;
const minimumRefreshToIconWidthRatio = 1.45;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readPopupCss() {
  const cssChunks = await Promise.all(
    cssFiles.map((file) => readFile(path.join(projectRoot, file), "utf8")),
  );

  return cssChunks.join("\n\n");
}

function getPopupSizePreset(width) {
  if (width < 360) {
    return "compact";
  }

  if (width > 420) {
    return "wide";
  }

  return "balanced";
}

function buildFixtureHtml(css, width) {
  const popupSizePreset = getPopupSizePreset(width);

  return `<!doctype html>
<html class="popup-page" data-popup-size-preset="${popupSizePreset}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${css}</style>
  </head>
  <body class="popup-page">
    <main class="app-shell popup-shell popup-shell--quota-first">
      <section class="status-card popup-header">
        <button class="icon-button popup-header__collapse-toggle" type="button">
          <span class="popup-header__action-icon">⌃</span>
        </button>
        <div id="popup-header-actions" class="popup-header__actions">
          <button class="icon-button popup-header__icon-action popup-header__icon-action--refresh" type="button">
            <span class="popup-header__action-icon">R</span>
            <span class="popup-header__refresh-countdown">2:40</span>
          </button>
          <button class="icon-button popup-header__icon-action" type="button">
            <span class="popup-header__action-icon">M</span>
          </button>
          <button class="icon-button popup-header__icon-action" type="button">
            <span class="popup-header__action-icon">T</span>
          </button>
          <button class="icon-button popup-header__icon-action" type="button">
            <span class="popup-header__action-icon">S</span>
          </button>
          <button class="icon-button popup-header__icon-action" type="button" data-popup-open-settings="true">
            <span class="popup-header__action-icon">G</span>
          </button>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

async function launchChromium() {
  const launchCandidates = [
    { channel: "chrome", headless: true },
    { channel: "chromium", headless: true },
    { executablePath: "/usr/bin/google-chrome", headless: true },
    { headless: true },
  ];
  let lastError = null;

  for (const launchOptions of launchCandidates) {
    try {
      return await chromium.launch(launchOptions);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to launch Chromium.");
}

async function inspectScenario(browser, css, { width, deviceScaleFactor }) {
  const context = await browser.newContext({
    deviceScaleFactor,
    viewport: {
      width,
      height: 260,
    },
  });
  const page = await context.newPage();

  await page.setContent(buildFixtureHtml(css, width), {
    waitUntil: "domcontentloaded",
  });

  const snapshot = await page.evaluate(() => {
    const header = document.querySelector(".popup-header");
    const actions = document.querySelector(".popup-header__actions");
    const buttons = Array.from(
      document.querySelectorAll(".popup-header__icon-action"),
    );
    const lastButton = buttons.at(-1);

    if (!header || !actions || !lastButton) {
      throw new Error("Popup action fixture did not render.");
    }

    const headerRect = header.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    const buttonRects = buttons.map((button) => button.getBoundingClientRect());
    const lastButtonRect = lastButton.getBoundingClientRect();
    const actionGaps = [
      buttonRects[0].left - actionsRect.left,
      ...buttonRects
        .slice(1)
        .map((rect, index) => rect.left - buttonRects[index].right),
      actionsRect.right - lastButtonRect.right,
    ];
    const actionGapRange = Math.max(...actionGaps) - Math.min(...actionGaps);
    const iconButtonWidths = buttonRects.slice(1).map((rect) => rect.width);
    const refreshButtonWidth = buttonRects[0].width;

    return {
      actionCount: buttons.length,
      actionGapRange,
      actionGaps,
      actionsInlineSize: actionsRect.width,
      actionsRightInset: headerRect.right - actionsRect.right,
      bodyWidth: document.body.getBoundingClientRect().width,
      devicePixelRatio: window.devicePixelRatio,
      headerWidth: headerRect.width,
      horizontalOverflow: Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth,
      ),
      iconButtonWidths,
      refreshButtonWidth,
      rightInset: headerRect.right - lastButtonRect.right,
      viewportWidth: window.innerWidth,
    };
  });

  assert(
    snapshot.actionCount === 5,
    `${width}@${deviceScaleFactor}: expected 5 header actions, got ${snapshot.actionCount}`,
  );
  assert(
    snapshot.horizontalOverflow === 0,
    `${width}@${deviceScaleFactor}: horizontal overflow ${snapshot.horizontalOverflow}px`,
  );
  assert(
    snapshot.rightInset >= minimumRightInsetPx,
    `${width}@${deviceScaleFactor}: rightmost action inset ${snapshot.rightInset}px below ${minimumRightInsetPx}px`,
  );
  assert(
    snapshot.actionGapRange <= maximumActionGapDeltaPx,
    `${width}@${deviceScaleFactor}: action gaps are not evenly distributed (${snapshot.actionGaps
      .map((gap) => `${gap.toFixed(2)}px`)
      .join(", ")})`,
  );
  assert(
    snapshot.refreshButtonWidth >=
      Math.min(...snapshot.iconButtonWidths) * minimumRefreshToIconWidthRatio,
    `${width}@${deviceScaleFactor}: refresh action width ${snapshot.refreshButtonWidth}px was compressed too close to icon width ${Math.min(
      ...snapshot.iconButtonWidths,
    )}px`,
  );
  assert(
    snapshot.actionsRightInset >= 0,
    `${width}@${deviceScaleFactor}: action row overflowed header by ${Math.abs(snapshot.actionsRightInset)}px`,
  );

  await context.close();

  return {
    width,
    deviceScaleFactor,
    snapshot,
  };
}

await mkdir(artifactDir, { recursive: true });

const css = await readPopupCss();
const browser = await launchChromium();

try {
  const results = [];

  for (const deviceScaleFactor of deviceScaleFactors) {
    for (const width of viewports) {
      results.push(await inspectScenario(browser, css, {
        deviceScaleFactor,
        width,
      }));
    }
  }

  await writeFile(
    path.join(artifactDir, "results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        deviceScaleFactors,
        maximumActionGapDeltaPx,
        minimumRefreshToIconWidthRatio,
        minimumRightInsetPx,
        results,
        viewports,
      },
      null,
      2,
    ),
  );

  console.log(
    `popup high-DPI action edge verified for ${results.length} scenarios`,
  );
} finally {
  await browser.close();
}
