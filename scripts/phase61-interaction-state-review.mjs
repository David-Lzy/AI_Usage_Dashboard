import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase61-interaction-state-review",
);
const sidePanelUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#settings";
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function slugify(label) {
  return label.toLowerCase().replaceAll(/\s+/g, "-");
}

async function collectInteractionStyles(locator, containerSelector = null) {
  return locator.evaluate((element, selector) => {
    const target = element instanceof HTMLElement ? element : null;

    if (!target) {
      return null;
    }

    const styles = getComputedStyle(target);
    const container =
      selector && target.closest(selector) instanceof HTMLElement
        ? target.closest(selector)
        : null;
    const containerStyles = container ? getComputedStyle(container) : null;

    return {
      focusVisible: target.matches(":focus-visible"),
      boxShadow: styles.boxShadow,
      borderColor: styles.borderColor,
      backgroundColor: styles.backgroundColor,
      transform: styles.transform,
      containerBoxShadow: containerStyles?.boxShadow ?? null,
      containerBorderColor: containerStyles?.borderColor ?? null,
      containerBackgroundColor: containerStyles?.backgroundColor ?? null,
    };
  }, containerSelector);
}

async function resetKeyboardFocus(page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(60);
}

async function focusLocatorByTab(page, locator, maxTabs = 160) {
  await resetKeyboardFocus(page);

  for (let attempt = 1; attempt <= maxTabs; attempt += 1) {
    await page.keyboard.press("Tab");

    const isFocused = await locator.evaluate(
      (element) => element === document.activeElement,
    );

    if (isFocused) {
      return attempt;
    }
  }

  throw new Error(`Unable to keyboard-focus target within ${maxTabs} tabs.`);
}

async function reviewInteractionTarget(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "networkidle" });
  await config.ready(page);

  const locator = config.locator(page);
  await locator.waitFor({ state: "visible" });

  const baseline = await collectInteractionStyles(
    locator,
    config.containerSelector,
  );
  const tabsUsed = await focusLocatorByTab(page, locator, config.maxTabs);
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);

  const focused = await collectInteractionStyles(
    locator,
    config.containerSelector,
  );
  const screenshotPath = path.join(
    artifactDir,
    `${slugify(config.slug)}.png`,
  );

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  assert(focused !== null, `${config.slug}: focused styles could not be read.`);
  assert(
    focused.focusVisible,
    `${config.slug}: target did not enter :focus-visible via keyboard navigation.`,
  );

  const focusIndicatorChanged =
    baseline.boxShadow !== focused.boxShadow ||
    baseline.borderColor !== focused.borderColor ||
    baseline.containerBoxShadow !== focused.containerBoxShadow ||
    baseline.containerBorderColor !== focused.containerBorderColor;

  assert(
    focusIndicatorChanged,
    `${config.slug}: keyboard focus did not change the visible ring or border treatment.`,
  );

  return {
    slug: config.slug,
    surface: config.surface,
    label: config.label,
    tabsUsed,
    screenshotPath,
    baseline,
    focused,
  };
}

const reviewTargets = [
  {
    slug: "settings-topbar-back-focus",
    surface: "settings",
    label: "Settings top-bar Back button",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Settings Overview"),
    locator: (page) => page.getByRole("button", { name: "Back" }),
    maxTabs: 8,
  },
  {
    slug: "settings-nav-chip-focus",
    surface: "settings",
    label: "Settings section-nav chip",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Settings Overview"),
    locator: (page) => page.getByRole("button", { name: "Preferences" }),
    maxTabs: 12,
  },
  {
    slug: "settings-select-focus",
    surface: "settings",
    label: "Settings preference select",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Global Preferences"),
    locator: (page) => page.getByLabel("Default sync interval"),
    maxTabs: 20,
  },
  {
    slug: "settings-switch-focus",
    surface: "settings",
    label: "Settings visibility toggle",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Provider Visibility"),
    locator: (page) => page.locator("#settings-visibility .switch-row__control").first(),
    containerSelector: ".switch-row",
    maxTabs: 28,
  },
  {
    slug: "settings-source-preference-focus",
    surface: "settings",
    label: "Settings source preference select",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Hybrid source contracts"),
    locator: (page) =>
      page.locator("#settings-sources .source-card .form-field__control").first(),
    maxTabs: 80,
  },
  {
    slug: "settings-details-toggle-focus",
    surface: "settings",
    label: "Settings diagnostics disclosure toggle",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Hybrid source contracts"),
    locator: (page) =>
      page.locator("#settings-sources .source-card__details-toggle").first(),
    maxTabs: 120,
  },
  {
    slug: "popup-refresh-focus",
    surface: "popup",
    label: "Popup refresh button",
    url: popupUrl,
    viewport: { width: 360, height: 760 },
    ready: (page) => page.waitForSelector("text=Quick glance"),
    locator: (page) => page.getByRole("button", { name: "Refresh" }),
    maxTabs: 6,
  },
  {
    slug: "popup-open-dashboard-focus",
    surface: "popup",
    label: "Popup open-dashboard action",
    url: popupUrl,
    viewport: { width: 360, height: 760 },
    ready: (page) => page.waitForSelector("text=Quick Actions"),
    locator: (page) => page.getByRole("button", { name: "Open dashboard" }),
    maxTabs: 12,
  },
];

async function runInteractionReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  const page = await browser.newPage();
  const results = [];

  try {
    for (const target of reviewTargets) {
      const result = await reviewInteractionTarget(page, target);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(artifactDir, "phase61-results.json");
  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`phase61: saved artifacts under ${artifactDir}`);
  console.log(`phase61: saved machine-readable results to ${reportPath}`);

  for (const result of results) {
    console.log(
      [
        "phase61:",
        `${result.surface}:${result.slug}`,
        `tabs=${result.tabsUsed}`,
        `focus_visible=${result.focused.focusVisible}`,
        `box_shadow_changed=${result.baseline.boxShadow !== result.focused.boxShadow}`,
        `container_shadow_changed=${result.baseline.containerBoxShadow !== result.focused.containerBoxShadow}`,
        `border_changed=${result.baseline.borderColor !== result.focused.borderColor}`,
        `container_border_changed=${result.baseline.containerBorderColor !== result.focused.containerBorderColor}`,
        `screenshot=${result.screenshotPath}`,
      ].join(" "),
    );
  }
}

await runInteractionReview();
