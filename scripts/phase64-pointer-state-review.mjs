import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(projectRoot, "tmp", "phase64-pointer-state-review");
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

function hasAnyDifference(first, second, keys) {
  return keys.some((key) => first?.[key] !== second?.[key]);
}

async function collectPointerStyles(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(element);

    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      boxShadow: styles.boxShadow,
      transform: styles.transform,
      color: styles.color,
      cursor: styles.cursor,
    };
  });
}

async function pressWithoutClick(page, locator) {
  const box = await locator.boundingBox();

  if (!box) {
    throw new Error("Target bounding box was unavailable.");
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const releaseX = Math.min(startX + Math.max(box.width / 2, 28), box.x + box.width - 2);
  const releaseY = Math.min(startY + Math.max(box.height / 2, 18), box.y + box.height - 2);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.move(releaseX, releaseY);
}

async function releasePointer(page) {
  await page.mouse.up();
  await page.waitForTimeout(80);
}

async function reviewPointerTarget(page, config) {
  await page.setViewportSize(config.viewport);
  await page.goto(config.url, { waitUntil: "networkidle" });
  await config.ready(page);

  const locator = config.locator(page);
  await locator.waitFor({ state: "visible" });
  await locator.scrollIntoViewIfNeeded();

  const baseline = await collectPointerStyles(locator);
  await locator.hover();
  await page.waitForTimeout(80);
  const hovered = await collectPointerStyles(locator);

  await page.screenshot({
    path: path.join(artifactDir, `${slugify(config.slug)}-hover.png`),
    fullPage: true,
  });

  await pressWithoutClick(page, locator);
  const pressed = await collectPointerStyles(locator);

  await page.screenshot({
    path: path.join(artifactDir, `${slugify(config.slug)}-press.png`),
    fullPage: true,
  });

  await releasePointer(page);

  assert(baseline !== null, `${config.slug}: baseline styles could not be read.`);
  assert(hovered !== null, `${config.slug}: hover styles could not be read.`);
  assert(pressed !== null, `${config.slug}: pressed styles could not be read.`);
  assert(
    hovered.cursor === config.expectedCursor,
    `${config.slug}: expected cursor ${config.expectedCursor}, got ${hovered.cursor}.`,
  );
  assert(
    hasAnyDifference(baseline, hovered, config.hoverKeys),
    `${config.slug}: hover state did not change any expected visual keys.`,
  );
  assert(
    hasAnyDifference(hovered, pressed, config.pressKeys),
    `${config.slug}: pressed state did not change any expected visual keys.`,
  );

  return {
    slug: config.slug,
    surface: config.surface,
    label: config.label,
    baseline,
    hovered,
    pressed,
    hoverKeys: config.hoverKeys,
    pressKeys: config.pressKeys,
  };
}

const reviewTargets = [
  {
    slug: "settings-topbar-back-pointer",
    surface: "settings",
    label: "Settings top-bar Back button",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Settings Overview"),
    locator: (page) => page.getByRole("button", { name: "Back" }),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor", "borderColor", "boxShadow", "transform"],
    pressKeys: ["backgroundColor", "boxShadow", "transform"],
  },
  {
    slug: "settings-nav-chip-pointer",
    surface: "settings",
    label: "Settings section-nav chip",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Settings Overview"),
    locator: (page) => page.getByRole("button", { name: "Preferences" }),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor", "borderColor", "boxShadow", "transform"],
    pressKeys: ["backgroundColor", "transform"],
  },
  {
    slug: "settings-select-pointer",
    surface: "settings",
    label: "Settings default sync select",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Global Preferences"),
    locator: (page) => page.getByLabel("Default sync interval"),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor", "borderColor"],
    pressKeys: ["backgroundColor", "borderColor"],
  },
  {
    slug: "settings-switch-row-pointer",
    surface: "settings",
    label: "Settings visibility switch row",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Provider Visibility"),
    locator: (page) => page.locator("#settings-visibility .switch-row").first(),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor"],
    pressKeys: ["backgroundColor", "borderColor"],
  },
  {
    slug: "settings-details-toggle-pointer",
    surface: "settings",
    label: "Settings diagnostics disclosure toggle",
    url: sidePanelUrl,
    viewport: { width: 420, height: 900 },
    ready: (page) => page.waitForSelector("text=Hybrid source contracts"),
    locator: (page) =>
      page.locator("#settings-sources .source-card__details-toggle").first(),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor", "color", "transform"],
    pressKeys: ["backgroundColor", "transform"],
  },
  {
    slug: "popup-refresh-pointer",
    surface: "popup",
    label: "Popup refresh button",
    url: popupUrl,
    viewport: { width: 360, height: 760 },
    ready: (page) => page.waitForSelector("text=Quick glance"),
    locator: (page) => page.getByRole("button", { name: "Refresh" }),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor", "color", "transform"],
    pressKeys: ["backgroundColor", "transform"],
  },
  {
    slug: "popup-open-dashboard-pointer",
    surface: "popup",
    label: "Popup open-dashboard action",
    url: popupUrl,
    viewport: { width: 360, height: 760 },
    ready: (page) => page.waitForSelector("text=Quick Actions"),
    locator: (page) => page.getByRole("button", { name: "Open dashboard" }),
    expectedCursor: "pointer",
    hoverKeys: ["backgroundColor", "color", "transform"],
    pressKeys: ["backgroundColor", "transform"],
  },
];

async function runPointerReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage();
  const results = [];

  try {
    for (const target of reviewTargets) {
      const result = await reviewPointerTarget(page, target);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(artifactDir, "phase64-results.json");
  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`phase64: saved artifacts under ${artifactDir}`);
  console.log(`phase64: saved machine-readable results to ${reportPath}`);

  for (const result of results) {
    console.log(
      [
        "phase64:",
        `${result.surface}:${result.slug}`,
        `cursor=${result.hovered.cursor}`,
        `hover_changed=${hasAnyDifference(result.baseline, result.hovered, result.hoverKeys)}`,
        `press_changed=${hasAnyDifference(result.hovered, result.pressed, result.pressKeys)}`,
      ].join(" "),
    );
  }
}

void runPointerReview().catch((error) => {
  console.error("phase64: pointer-state review failed");
  console.error(error);
  process.exitCode = 1;
});
