import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase688-global-motion-preference-review",
);
const userDataDir = await mkdtemp(
  path.join(tmpdir(), "ai-usage-dashboard-phase688-"),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseCssDurationMilliseconds(value) {
  const normalizedValue = value.trim();

  if (normalizedValue.endsWith("ms")) {
    return Number.parseFloat(normalizedValue);
  }

  if (normalizedValue.endsWith("s")) {
    return Number.parseFloat(normalizedValue) * 1_000;
  }

  return Number.NaN;
}

function hasOnlyEffectivelyZeroDurations(value) {
  return value
    .split(",")
    .map(parseCssDurationMilliseconds)
    .every((duration) => Number.isFinite(duration) && duration <= 0.001);
}

async function waitForServiceWorker(context, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for the extension service worker.");
}

async function setMotionMode(page, motionMode) {
  const response = await page.evaluate(
    async (nextMotionMode) =>
      chrome.runtime.sendMessage({
        type: "app:update-settings",
        settings: { motionMode: nextMotionMode },
      }),
    motionMode,
  );

  assert(response?.ok, `Failed to set the shared motion mode to ${motionMode}.`);
}

async function waitForMotionState(page, motionMode, motionResolved) {
  await page.waitForFunction(
    ([expectedMode, expectedResolved]) =>
      document.documentElement.dataset.motionMode === expectedMode &&
      document.documentElement.dataset.motionResolved === expectedResolved,
    [motionMode, motionResolved],
  );
}

async function readMotionStyles(page) {
  return page.evaluate(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const surface = document.querySelector(".app-shell > *");
    const carouselSlide = document.querySelector(".provider-carousel__slide");
    const grantAccessAction = document.querySelector(
      '[data-quick-setup-primary-action="grant_access"]',
    );
    const popupThemeMenu = document.querySelector(
      ".popup-header__theme-mode-menu:not([hidden])",
    );

    return {
      mediumDuration: rootStyles
        .getPropertyValue("--app-motion-duration-medium")
        .trim(),
      surfaceAnimationDuration: surface
        ? getComputedStyle(surface).animationDuration
        : null,
      carouselTransitionDuration: carouselSlide
        ? getComputedStyle(carouselSlide).transitionDuration
        : null,
      grantAccessAnimationName: grantAccessAction
        ? getComputedStyle(grantAccessAction).animationName
        : null,
      popupDisclosureAnimationDuration: popupThemeMenu
        ? getComputedStyle(popupThemeMenu).animationDuration
        : null,
    };
  });
}

await rm(artifactDir, { recursive: true, force: true });
await mkdir(artifactDir, { recursive: true });

let context;

try {
  context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    reducedMotion: "reduce",
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const serviceWorker = await waitForServiceWorker(context);
  const extensionId = serviceWorker.url().split("/")[2];
  assert(extensionId, "Failed to resolve the extension id.");

  const settingsPage = await context.newPage();
  const popupPage = await context.newPage();
  await popupPage.setViewportSize({ width: 392, height: 900 });
  const settingsUrl = `chrome-extension://${extensionId}/src/sidepanel/index.html?surface=full-page#settings`;
  const popupUrl = `chrome-extension://${extensionId}/src/popup/index.html`;

  await settingsPage.goto(settingsUrl, { waitUntil: "domcontentloaded" });
  await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await settingsPage.waitForSelector('[data-provider-carousel=""]');
  await popupPage.waitForSelector(".popup-shell");

  await setMotionMode(settingsPage, "full");
  await Promise.all([
    waitForMotionState(settingsPage, "full", "full"),
    waitForMotionState(popupPage, "full", "full"),
  ]);

  const fullStyles = await readMotionStyles(settingsPage);
  await popupPage.click('[data-popup-toggle-theme-mode="true"]');
  await popupPage.waitForSelector(
    ".popup-header__theme-mode-menu:not([hidden])",
  );
  const fullPopupStyles = await readMotionStyles(popupPage);
  assert(
    parseCssDurationMilliseconds(fullStyles.mediumDuration) === 220,
    `On did not preserve the motion token: ${fullStyles.mediumDuration}.`,
  );
  assert(
    fullStyles.carouselTransitionDuration !== "0s",
    "On did not preserve the Quick Setup carousel transition.",
  );
  if (fullStyles.grantAccessAnimationName !== null) {
    assert(
      fullStyles.grantAccessAnimationName === "app-access-cta-pulse",
      "On did not preserve the Quick Setup access animation.",
    );
  }
  assert(
    fullPopupStyles.surfaceAnimationDuration !== null &&
      !hasOnlyEffectivelyZeroDurations(
        fullPopupStyles.surfaceAnimationDuration,
      ),
    `On did not preserve popup surface entry motion: ${fullPopupStyles.surfaceAnimationDuration}.`,
  );
  assert(
    fullPopupStyles.popupDisclosureAnimationDuration !== null &&
      !hasOnlyEffectivelyZeroDurations(
        fullPopupStyles.popupDisclosureAnimationDuration,
      ),
    `On did not preserve popup disclosure motion: ${fullPopupStyles.popupDisclosureAnimationDuration}.`,
  );
  await popupPage.click('[data-popup-toggle-theme-mode="true"]');

  await setMotionMode(settingsPage, "reduced");
  await Promise.all([
    waitForMotionState(settingsPage, "reduced", "reduced"),
    waitForMotionState(popupPage, "reduced", "reduced"),
  ]);

  const reducedStyles = await readMotionStyles(settingsPage);
  await popupPage.click('[data-popup-toggle-theme-mode="true"]');
  await popupPage.waitForSelector(
    ".popup-header__theme-mode-menu:not([hidden])",
  );
  const reducedPopupStyles = await readMotionStyles(popupPage);
  assert(
    parseCssDurationMilliseconds(reducedStyles.mediumDuration) === 0,
    `Reduced did not zero the global motion token: ${reducedStyles.mediumDuration}.`,
  );
  assert(
    reducedStyles.carouselTransitionDuration !== null &&
      hasOnlyEffectivelyZeroDurations(
        reducedStyles.carouselTransitionDuration,
      ),
    `Reduced did not stop the Quick Setup carousel transition: ${reducedStyles.carouselTransitionDuration}.`,
  );
  if (reducedStyles.grantAccessAnimationName !== null) {
    assert(
      reducedStyles.grantAccessAnimationName === "none",
      "Reduced did not stop the Quick Setup access animation.",
    );
  }
  assert(
    reducedPopupStyles.surfaceAnimationDuration !== null &&
      hasOnlyEffectivelyZeroDurations(
        reducedPopupStyles.surfaceAnimationDuration,
      ),
    `Reduced did not stop popup surface entry motion: ${reducedPopupStyles.surfaceAnimationDuration}.`,
  );
  assert(
    reducedPopupStyles.popupDisclosureAnimationDuration !== null &&
      hasOnlyEffectivelyZeroDurations(
        reducedPopupStyles.popupDisclosureAnimationDuration,
      ),
    `Reduced did not stop popup disclosure motion: ${reducedPopupStyles.popupDisclosureAnimationDuration}.`,
  );
  await popupPage.click('[data-popup-toggle-theme-mode="true"]');

  await setMotionMode(settingsPage, "system");
  await Promise.all([
    waitForMotionState(settingsPage, "system", "reduced"),
    waitForMotionState(popupPage, "system", "reduced"),
  ]);

  await Promise.all([
    settingsPage.emulateMedia({ reducedMotion: "no-preference" }),
    popupPage.emulateMedia({ reducedMotion: "no-preference" }),
  ]);
  await Promise.all([
    waitForMotionState(settingsPage, "system", "full"),
    waitForMotionState(popupPage, "system", "full"),
  ]);

  await setMotionMode(settingsPage, "full");
  await Promise.all([
    settingsPage.emulateMedia({ reducedMotion: "reduce" }),
    popupPage.emulateMedia({ reducedMotion: "reduce" }),
  ]);
  await Promise.all([
    waitForMotionState(settingsPage, "full", "full"),
    waitForMotionState(popupPage, "full", "full"),
  ]);

  await settingsPage.screenshot({
    path: path.join(artifactDir, "settings-motion-on-system-reduced.png"),
    fullPage: true,
  });
  await popupPage.click('[data-popup-toggle-theme-mode="true"]');
  await popupPage.waitForSelector(
    ".popup-header__theme-mode-menu:not([hidden])",
  );
  await popupPage.screenshot({
    path: path.join(artifactDir, "popup-motion-on-system-reduced.png"),
    fullPage: true,
  });

  console.log("phase688: global motion preference authority verified");
} finally {
  await context?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
