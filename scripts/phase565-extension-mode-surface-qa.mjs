import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase565-extension-mode-surface-qa",
);
const artifactPath = path.join(
  artifactDir,
  "phase565-extension-mode-surface-qa-results.json",
);
const settingsSessionStorageKey =
  "ai-usage-dashboard:surface-session-state:standard:settings";
const surfaceSessionStateTtlMs = 30 * 60 * 1000;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function serializeError(error) {
  return {
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message : String(error),
  };
}

async function writeArtifact(result) {
  await mkdir(artifactDir, { recursive: true });
  await writeFile(
    artifactPath,
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        mode: "headless_unpacked_chromium_extension",
        extensionPath,
        ...result,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function waitForServiceWorker(context, timeoutMs = 15_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return null;
}

const launchAttempts = [
  {
    label: "chromium_channel",
    options: {
      channel: "chromium",
    },
  },
  {
    label: "bundled_chromium",
    options: {},
  },
];

async function launchExtensionContext(userDataDir, launchOptions) {
  return chromium.launchPersistentContext(userDataDir, {
    ...launchOptions,
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}

async function createExtensionRuntime() {
  const userDataDir = await mkdtemp(
    path.join(tmpdir(), "ai-usage-dashboard-phase565-"),
  );
  const blockers = [];

  for (const launchAttempt of launchAttempts) {
    try {
      const context = await launchExtensionContext(
        userDataDir,
        launchAttempt.options,
      );
      const serviceWorker = await waitForServiceWorker(context);

      if (!serviceWorker) {
        await context.close();
        blockers.push({
          launchAttempt: launchAttempt.label,
          stage: "resolve_extension_service_worker",
          detail:
            "Chromium launched but no unpacked-extension service worker appeared in the persistent context. This usually means the local headless browser cannot run extensions.",
        });
        continue;
      }

      const extensionId = serviceWorker.url().split("/")[2] ?? "";

      if (!extensionId) {
        await context.close();
        blockers.push({
          launchAttempt: launchAttempt.label,
          stage: "resolve_extension_id",
          detail: `Could not parse extension id from service worker URL: ${serviceWorker.url()}`,
        });
        continue;
      }

      return {
        status: "ready",
        context,
        extensionId,
        launchAttempt: launchAttempt.label,
        userDataDir,
      };
    } catch (error) {
      blockers.push({
        launchAttempt: launchAttempt.label,
        stage: "launch_persistent_extension_context",
        detail:
          "Chromium could not launch a persistent context with the unpacked extension.",
        error: serializeError(error),
      });
    }
  }

  return {
    status: "blocked",
    userDataDir,
    blocker: {
      stage: "extension_runtime_unavailable",
      detail:
        "No launch strategy produced a usable unpacked-extension service worker.",
      attempts: blockers,
    },
  };
}

function buildExtensionUrl(extensionId, relativePathWithHash) {
  return `chrome-extension://${extensionId}/${relativePathWithHash}`;
}

async function openExtensionPage(context, extensionId, relativePathWithHash) {
  const page = await context.newPage();

  page.setDefaultTimeout(20_000);
  await page.goto(buildExtensionUrl(extensionId, relativePathWithHash), {
    waitUntil: "domcontentloaded",
  });

  return page;
}

async function waitForDashboard(page) {
  await page.waitForSelector(".dashboard-section");
  await page.waitForTimeout(250);
}

async function waitForSettings(page) {
  await page.waitForSelector("#settings-appearance");
  await page.waitForSelector("[data-topbar-open-full-page='true']");
  await page.waitForTimeout(250);
}

async function waitForProviderDetail(page) {
  await page.waitForSelector(
    "[data-theme-stability-surface='provider-detail-sync-status-card']",
  );
  await page.waitForSelector("[data-topbar-open-full-page='true']");
  await page.waitForTimeout(250);
}

async function collectExtensionCapabilities(page) {
  return page.evaluate(() => ({
    runtimeId: globalThis.chrome?.runtime?.id ?? null,
    hasStorageSessionGet:
      typeof globalThis.chrome?.storage?.session?.get === "function",
    hasStorageSessionSet:
      typeof globalThis.chrome?.storage?.session?.set === "function",
    hasStorageSessionRemove:
      typeof globalThis.chrome?.storage?.session?.remove === "function",
    hasSidePanelOpen: typeof globalThis.chrome?.sidePanel?.open === "function",
    hasSidePanelSetOptions:
      typeof globalThis.chrome?.sidePanel?.setOptions === "function",
  }));
}

async function setChromeSessionEnvelope(page, key, envelope) {
  await page.evaluate(
    async ({ storageKey, nextEnvelope }) => {
      if (typeof chrome?.storage?.session?.set !== "function") {
        throw new Error("chrome.storage.session.set is unavailable.");
      }

      await chrome.storage.session.set({
        [storageKey]: nextEnvelope,
      });
    },
    {
      storageKey: key,
      nextEnvelope: envelope,
    },
  );
}

async function removeChromeSessionValue(page, key) {
  await page.evaluate(async (storageKey) => {
    if (typeof chrome?.storage?.session?.remove !== "function") {
      return;
    }

    await chrome.storage.session.remove(storageKey);
  }, key);
}

function createSettingsEnvelope(statePatch = {}) {
  return {
    version: 1,
    expiresAt: Date.now() + surfaceSessionStateTtlMs,
    state: {
      routeName: "settings",
      routeKey: "settings",
      scrollY: null,
      scrollProgress: 0.55,
      settings: {
        activeSectionId: "settings-appearance",
        advancedOpen: true,
        uiMoreOpen: true,
        toolbarPopupPreview: {
          open: true,
          percent: 42,
          position: null,
        },
        activePopover: {
          id: "progress-color-band:high:color",
          customPanelOpen: true,
        },
        providerProgressDetailsOpen: {},
        carouselIndexById: {},
      },
      providerDetail: null,
      ...statePatch,
    },
  };
}

async function collectSettingsSnapshot(page) {
  return page.evaluate(() => {
    function rectTop(selector) {
      const element = document.querySelector(selector);

      return element ? Math.round(element.getBoundingClientRect().top) : null;
    }

    const colorDropdownButton = document.querySelector(
      "[data-session-popover-id='progress-color-band:high:color'] button",
    );
    const uiMore = document.querySelector(".settings-preferences__more");
    const toolbarPreviewButton = document.querySelector(
      ".settings-preferences__test-popup-button",
    );

    return {
      urlProtocol: window.location.protocol,
      hash: window.location.hash,
      search: window.location.search,
      viewportHeight: window.innerHeight,
      colorDropdownOpen: colorDropdownButton?.getAttribute("data-open") ?? null,
      colorDropdownTop: rectTop(
        "[data-session-popover-id='progress-color-band:high:color']",
      ),
      quickSetupTop: rectTop("#settings-quick-setup"),
      advancedTop: rectTop("#settings-advanced"),
      uiMoreOpen: uiMore?.getAttribute("data-open") ?? null,
      toolbarPreviewOpen:
        toolbarPreviewButton?.getAttribute("aria-pressed") ?? null,
    };
  });
}

function assertVisibleTop(snapshot, key, label) {
  const top = snapshot[key];

  assert(typeof top === "number", `${label} top was not available.`);
  assert(
    top >= -120 && top <= snapshot.viewportHeight * 0.8,
    `${label} was not restored into view; top=${top}, viewport=${snapshot.viewportHeight}.`,
  );
}

async function runSettingsSessionRestoreCheck(context, extensionId, seedPage) {
  await setChromeSessionEnvelope(
    seedPage,
    settingsSessionStorageKey,
    createSettingsEnvelope(),
  );

  const page = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html?surface=full-page#settings",
  );

  try {
    await page.setViewportSize({ width: 1360, height: 920 });
    await waitForSettings(page);
    await page.waitForTimeout(800);

    const snapshot = await collectSettingsSnapshot(page);

    assert(
      snapshot.urlProtocol === "chrome-extension:",
      `settings restore did not run under the extension protocol: ${snapshot.urlProtocol}`,
    );
    assert(snapshot.hash === "#settings", `settings restore hash was ${snapshot.hash}.`);
    assert(
      snapshot.search === "?surface=full-page",
      `settings restore search was ${snapshot.search}.`,
    );
    assert(
      snapshot.colorDropdownOpen === "true",
      `settings restore did not reopen the active color dropdown; snapshot=${JSON.stringify(snapshot)}.`,
    );
    assertVisibleTop(snapshot, "colorDropdownTop", "settings active color dropdown");
    assert(snapshot.uiMoreOpen === "true", "settings More UI state was not restored.");
    assert(
      snapshot.toolbarPreviewOpen === "true",
      "settings toolbar popup preview state was not restored.",
    );

    return snapshot;
  } finally {
    await page.close();
  }
}

async function runExplicitRouteFocusCheck(context, extensionId, seedPage) {
  await setChromeSessionEnvelope(
    seedPage,
    settingsSessionStorageKey,
    createSettingsEnvelope({
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
    }),
  );

  const page = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html?surface=full-page#settings/section/settings-quick-setup",
  );

  try {
    await page.setViewportSize({ width: 1360, height: 920 });
    await waitForSettings(page);
    await page.waitForTimeout(800);

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
    await page.close();
  }
}

async function runProviderDetailDirectCheck(context, extensionId) {
  const page = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html?surface=full-page#provider-detail/codex-personal-page",
  );

  try {
    await page.setViewportSize({ width: 1360, height: 920 });
    await waitForProviderDetail(page);

    const snapshot = await page.evaluate(() => ({
      urlProtocol: window.location.protocol,
      hash: window.location.hash,
      search: window.location.search,
      hasProviderDetailSurface: Boolean(
        document.querySelector(
          "[data-theme-stability-surface='provider-detail-sync-status-card']",
        ),
      ),
    }));

    assert(
      snapshot.urlProtocol === "chrome-extension:",
      `provider detail did not run under the extension protocol: ${snapshot.urlProtocol}`,
    );
    assert(
      snapshot.hash === "#provider-detail/codex-personal-page",
      `provider detail hash was ${snapshot.hash}.`,
    );
    assert(
      snapshot.search === "?surface=full-page",
      `provider detail search was ${snapshot.search}.`,
    );
    assert(
      snapshot.hasProviderDetailSurface,
      "provider detail surface marker was not available.",
    );

    return snapshot;
  } finally {
    await page.close();
  }
}

async function runExtensionModeChecks(context, extensionId, launchAttempt) {
  const seedPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html#dashboard",
  );

  try {
    await waitForDashboard(seedPage);

    const capabilities = await collectExtensionCapabilities(seedPage);

    assert(
      capabilities.runtimeId === extensionId,
      `chrome.runtime.id was ${capabilities.runtimeId}, expected ${extensionId}.`,
    );
    assert(
      capabilities.hasStorageSessionGet &&
        capabilities.hasStorageSessionSet &&
        capabilities.hasStorageSessionRemove,
      `chrome.storage.session was not fully available: ${JSON.stringify(capabilities)}.`,
    );

    await removeChromeSessionValue(seedPage, settingsSessionStorageKey);

    const settingsSessionRestore = await runSettingsSessionRestoreCheck(
      context,
      extensionId,
      seedPage,
    );
    const explicitRouteFocus = await runExplicitRouteFocusCheck(
      context,
      extensionId,
      seedPage,
    );
    const providerDetailDirect = await runProviderDetailDirectCheck(
      context,
      extensionId,
    );

    await removeChromeSessionValue(seedPage, settingsSessionStorageKey);

    return {
      extensionId,
      launchAttempt,
      capabilities,
      sidePanelExercise:
        capabilities.hasSidePanelOpen || capabilities.hasSidePanelSetOptions
          ? "not_exercised_headless_direct_full_page_only"
          : "chrome.sidePanel API not exposed in this headless page context; direct full-page extension routes were checked instead",
      settingsSessionRestore,
      explicitRouteFocus,
      providerDetailDirect,
    };
  } finally {
    await seedPage.close();
  }
}

const runtime = await createExtensionRuntime();

if (runtime.status === "blocked") {
  await writeArtifact({
    status: "blocked",
    blocker: runtime.blocker,
  });
  await rm(runtime.userDataDir, { recursive: true, force: true });
  console.log(
    `phase565: extension-mode surface QA blocked at ${runtime.blocker.stage}`,
  );
  process.exit(0);
}

try {
  const checks = await runExtensionModeChecks(
    runtime.context,
    runtime.extensionId,
    runtime.launchAttempt,
  );

  await writeArtifact({
    status: "passed",
    checks,
  });

  console.log("phase565: extension-mode surface QA passed");
} catch (error) {
  await writeArtifact({
    status: "failed",
    error: serializeError(error),
  });
  throw error;
} finally {
  await runtime.context.close();
  await rm(runtime.userDataDir, { recursive: true, force: true });
}
