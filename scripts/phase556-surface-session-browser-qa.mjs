import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";
import {
  assert,
  assertVisibleTop,
  collectSettingsSnapshot,
  waitForProviderDetail,
  waitForSettings,
} from "./lib/surface-qa-browser-harness.mjs";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase556-surface-session-browser-qa",
);
const settingsSessionStorageKey =
  "ai-usage-dashboard:surface-session-state:standard:settings";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath)] ?? "application/octet-stream";
}

async function startStaticServer(rootDir) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const candidatePath = path.normalize(
        path.join(rootDir, pathname === "/" ? "src/sidepanel/index.html" : pathname),
      );

      if (!candidatePath.startsWith(rootDir)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const fileStat = await stat(candidatePath);
      const filePath = fileStat.isDirectory()
        ? path.join(candidatePath, "index.html")
        : candidatePath;
      const body = await readFile(filePath);

      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": getMimeType(filePath),
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  assert(address && typeof address === "object", "Static server did not bind.");

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

async function switchSurface(page, viewport) {
  const openedPagePromise = page.context().waitForEvent("page");

  await page.locator("[data-topbar-open-full-page='true']").click();

  const nextPage = await openedPagePromise;

  nextPage.setDefaultTimeout(20_000);
  await nextPage.setViewportSize(viewport);
  await nextPage.waitForLoadState("domcontentloaded");
  await nextPage.waitForTimeout(1_500);

  return nextPage;
}

async function installExtensionSessionStorageShim(context) {
  await context.addInitScript(() => {
    const storagePrefix = "phase556:chrome-storage-session:";
    const existingChrome = globalThis.chrome ?? {};
    const existingStorage = existingChrome.storage ?? {};

    globalThis.chrome = {
      ...existingChrome,
      storage: {
        ...existingStorage,
        session: {
          async get(key) {
            if (typeof key === "string") {
              const rawValue = localStorage.getItem(`${storagePrefix}${key}`);

              return rawValue ? { [key]: JSON.parse(rawValue) } : {};
            }

            if (Array.isArray(key)) {
              return Object.fromEntries(
                key.flatMap((entry) => {
                  const rawValue = localStorage.getItem(`${storagePrefix}${entry}`);

                  return rawValue ? [[entry, JSON.parse(rawValue)]] : [];
                }),
              );
            }

            if (key && typeof key === "object") {
              return Object.fromEntries(
                Object.entries(key).map(([entry, fallbackValue]) => {
                  const rawValue = localStorage.getItem(`${storagePrefix}${entry}`);

                  return [entry, rawValue ? JSON.parse(rawValue) : fallbackValue];
                }),
              );
            }

            return {};
          },
          async remove(key) {
            const keys = Array.isArray(key) ? key : [key];

            for (const entry of keys) {
              if (typeof entry === "string") {
                localStorage.removeItem(`${storagePrefix}${entry}`);
              }
            }
          },
          async set(items) {
            for (const [key, value] of Object.entries(items)) {
              localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value));
            }
          },
        },
      },
    };
  });
}

async function scrollTo(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -96));
  await page.waitForTimeout(150);
}

function findMovedCarousel(beforeSnapshot, afterSnapshot) {
  const before = beforeSnapshot.carousels.find(
    (carousel) => carousel.count > 1 && carousel.activeId,
  );

  if (!before) {
    return null;
  }

  return afterSnapshot.carousels.find(
    (carousel) =>
      carousel.count === before.count && carousel.activeId === before.activeId,
  ) ?? null;
}

async function prepareSettingsSession(page) {
  await scrollTo(page, "#settings-quick-setup");

  const carousel = page.locator("[data-provider-carousel][data-provider-carousel-count]").first();
  const carouselCount = await carousel
    .getAttribute("data-provider-carousel-count")
    .then((value) => Number(value ?? "0"))
    .catch(() => 0);

  if (carouselCount > 1) {
    await carousel.locator("[data-provider-carousel-action='next']").click();
    await page.waitForTimeout(150);
  }

  await scrollTo(page, "#settings-provider-display");

  const detailsSummary = page
    .locator("[data-provider-progress-preference-provider-summary]")
    .first();
  const detailsSummaryCount = await detailsSummary.count();
  let openedProviderProgressDetailsId = null;

  if (detailsSummaryCount > 0) {
    openedProviderProgressDetailsId = await detailsSummary.getAttribute(
      "data-provider-progress-preference-provider-summary",
    );
    await detailsSummary.click();
    await page.waitForTimeout(150);
  }

  await scrollTo(page, "#settings-appearance");
  await page.locator(".settings-preferences__more-toggle").click();
  await page.waitForTimeout(150);
  await page.locator(".settings-preferences__test-popup-button").click();
  await page.waitForTimeout(150);

  const colorDropdown = page
    .locator("[data-session-popover-id='progress-color-band:high:color'] button")
    .first();

  await colorDropdown.scrollIntoViewIfNeeded();
  await colorDropdown.click();
  await page.waitForTimeout(150);

  const snapshot = await collectSettingsSnapshot(page);

  assert(
    snapshot.colorDropdownOpen === "true",
    `Source color dropdown did not open before surface switch; snapshot=${JSON.stringify(snapshot)}`,
  );

  return {
    openedProviderProgressDetailsId,
    snapshot,
  };
}

function assertSettingsSessionRestored(
  snapshot,
  sourceSnapshot,
  openedProviderProgressDetailsId,
  label,
) {
  assert(snapshot.hash === "#settings", `${label}: hash was ${snapshot.hash}.`);
  assert(
    snapshot.colorDropdownOpen === "true",
    `${label}: active color dropdown was not restored; source=${sourceSnapshot.colorDropdownOpen}, destination=${snapshot.colorDropdownOpen}, snapshot=${JSON.stringify(snapshot)}.`,
  );
  assertVisibleTop(snapshot, "colorDropdownTop", `${label}: active color dropdown`);
  assert(snapshot.uiMoreOpen === "true", `${label}: More UI state was not restored.`);
  assert(
    snapshot.toolbarPreviewOpen === "true",
    `${label}: toolbar popup preview was not restored.`,
  );

  if (openedProviderProgressDetailsId) {
    const restoredDetails = snapshot.providerProgressDetails.find(
      (details) => details.id === openedProviderProgressDetailsId,
    );

    assert(
      restoredDetails?.open === true,
      `${label}: provider progress details ${openedProviderProgressDetailsId} were not restored.`,
    );
  }

  assert(
    findMovedCarousel(sourceSnapshot, snapshot),
    `${label}: provider carousel active item was not restored; source=${JSON.stringify(sourceSnapshot.carousels)}, destination=${JSON.stringify(snapshot.carousels)}.`,
  );
}

async function runSettingsSurfaceRoundTrip(context, baseUrl) {
  const sidebarPage = await context.newPage();

  sidebarPage.setDefaultTimeout(20_000);
  await sidebarPage.setViewportSize({ width: 430, height: 900 });
  await sidebarPage.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
    waitUntil: "domcontentloaded",
  });
  await waitForSettings(sidebarPage);

  const prepared = await prepareSettingsSession(sidebarPage);
  const fullPage = await switchSurface(sidebarPage, {
    width: 1360,
    height: 920,
  });
  await waitForSettings(fullPage);

  const fullPageSnapshot = await collectSettingsSnapshot(fullPage);

  assert(
    fullPageSnapshot.search === "?surface=full-page",
    `sidebar->full-page: search was ${fullPageSnapshot.search}.`,
  );
  assertSettingsSessionRestored(
    fullPageSnapshot,
    prepared.snapshot,
    prepared.openedProviderProgressDetailsId,
    "sidebar->full-page",
  );

  const sidebarReturnPage = await switchSurface(fullPage, {
    width: 430,
    height: 900,
  });
  await waitForSettings(sidebarReturnPage);

  const sidebarReturnSnapshot = await collectSettingsSnapshot(sidebarReturnPage);

  assert(
    sidebarReturnSnapshot.search === "",
    `full-page->sidebar: search was ${sidebarReturnSnapshot.search}.`,
  );
  assertSettingsSessionRestored(
    sidebarReturnSnapshot,
    prepared.snapshot,
    prepared.openedProviderProgressDetailsId,
    "full-page->sidebar",
  );

  return {
    source: prepared.snapshot,
    fullPage: fullPageSnapshot,
    sidebarReturn: sidebarReturnSnapshot,
    openedProviderProgressDetailsId: prepared.openedProviderProgressDetailsId,
  };
}

async function runProviderDetailRoundTrip(context, baseUrl) {
  const page = await context.newPage();

  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto(
    `${baseUrl}/src/sidepanel/index.html#provider-detail/codex-personal-page`,
    { waitUntil: "domcontentloaded" },
  );
  await waitForProviderDetail(page);

  const fullPage = await switchSurface(page, {
    width: 1360,
    height: 920,
  });
  await waitForProviderDetail(fullPage);

  const fullPageSnapshot = await fullPage.evaluate(() => ({
    hash: window.location.hash,
    search: window.location.search,
    hasProviderDetailSurface: Boolean(
      document.querySelector(
        "[data-theme-stability-surface='provider-detail-sync-status-card']",
      ),
    ),
  }));

  assert(
    fullPageSnapshot.hash === "#provider-detail/codex-personal-page",
    `provider detail full-page hash was ${fullPageSnapshot.hash}.`,
  );
  assert(
    fullPageSnapshot.search === "?surface=full-page",
    `provider detail full-page search was ${fullPageSnapshot.search}.`,
  );

  const sidebarReturnPage = await switchSurface(fullPage, {
    width: 430,
    height: 900,
  });
  await waitForProviderDetail(sidebarReturnPage);

  const sidebarReturnSnapshot = await sidebarReturnPage.evaluate(() => ({
    hash: window.location.hash,
    search: window.location.search,
    hasProviderDetailSurface: Boolean(
      document.querySelector(
        "[data-theme-stability-surface='provider-detail-sync-status-card']",
      ),
    ),
  }));

  assert(
    sidebarReturnSnapshot.hash === "#provider-detail/codex-personal-page",
    `provider detail sidebar return hash was ${sidebarReturnSnapshot.hash}.`,
  );
  assert(
    sidebarReturnSnapshot.search === "",
    `provider detail sidebar return search was ${sidebarReturnSnapshot.search}.`,
  );

  return {
    fullPage: fullPageSnapshot,
    sidebarReturn: sidebarReturnSnapshot,
  };
}

async function runExplicitRouteFocusCheck(browser, baseUrl) {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 920 },
  });

  await installExtensionSessionStorageShim(context);
  await context.addInitScript((storageKey) => {
    const staleEnvelope = {
      version: 1,
      expiresAt: Date.now() + 30 * 60 * 1000,
      state: {
        routeName: "settings",
        routeKey: "#settings",
        scrollY: 999_999,
        scrollProgress: 1,
        settings: {
          activeSectionId: "settings-advanced",
          advancedOpen: true,
          uiMoreOpen: true,
          toolbarPopupPreview: null,
          activePopover: null,
          providerProgressDetailsOpen: {},
          carouselIndexById: {},
        },
        providerDetail: null,
      },
    };

    sessionStorage.setItem(storageKey, JSON.stringify(staleEnvelope));
    localStorage.setItem(storageKey, JSON.stringify(staleEnvelope));
  }, settingsSessionStorageKey);

  try {
    const page = await context.newPage();

    page.setDefaultTimeout(20_000);
    await page.goto(
      `${baseUrl}/src/sidepanel/index.html?surface=full-page#settings/section/settings-quick-setup`,
      { waitUntil: "domcontentloaded" },
    );
    await waitForSettings(page);
    await page.waitForTimeout(600);

    const snapshot = await collectSettingsSnapshot(page);

    assert(
      snapshot.hash === "#settings/section/settings-quick-setup",
      `explicit focus hash was ${snapshot.hash}.`,
    );
    assertVisibleTop(snapshot, "quickSetupTop", "explicit quick setup focus route");
    assert(
      snapshot.advancedTop === null || snapshot.advancedTop > snapshot.quickSetupTop,
      "stale advanced session appeared to override the explicit quick setup route.",
    );

    return snapshot;
  } finally {
    await context.close();
  }
}

await mkdir(artifactDir, { recursive: true });

const server = await startStaticServer(distRoot);
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 430, height: 900 },
  });

  await installExtensionSessionStorageShim(context);
  const settingsRoundTrip = await runSettingsSurfaceRoundTrip(
    context,
    server.baseUrl,
  );
  const providerDetailRoundTrip = await runProviderDetailRoundTrip(
    context,
    server.baseUrl,
  );
  const explicitRouteFocus = await runExplicitRouteFocusCheck(
    browser,
    server.baseUrl,
  );

  await writeFile(
    path.join(artifactDir, "phase556-browser-qa-results.json"),
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        mode: "headless_browser_dist_preview_with_chrome_storage_session_shim",
        baseUrl: server.baseUrl,
        firefoxManualAddonSession: "not_available_in_headless_run",
        settingsRoundTrip,
        providerDetailRoundTrip,
        explicitRouteFocus,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("phase556: surface session browser QA passed");
} finally {
  await browser.close();
  await server.close();
}
