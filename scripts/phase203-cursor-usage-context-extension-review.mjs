import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const extensionPath = path.join(projectRoot, "dist", "chrome");
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase203-cursor-usage-context-extension-review",
);
const cursorVendorUrl = "https://cursor.com/dashboard/usage";
const cursorPermissionOrigins = [
  "https://api.cursor.com/*",
  "https://cursor.com/*",
];
const expectedUsageSummary =
  "Visible Cursor usage: Billing period: Mar 23 - Apr 21 · Your usage per day across this billing period · Visible plans: Pro · Pro+ · Ultra · On-demand usage is off. · CSV export available";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createCursorUsageContextHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cursor - Usage</title>
  </head>
  <body>
    <main>
      <h1>Usage</h1>
      <section>
        <p>Pro</p>
        <p>Pro+</p>
        <p>Ultra</p>
        <p>On-Demand Usage is Off</p>
        <p>Your Usage</p>
        <p>Your usage per day across this billing period</p>
        <p>By Model</p>
        <p>Spend</p>
        <p>Export CSV</p>
        <p>Mar 23 - Apr 21</p>
      </section>
    </main>
  </body>
</html>`;
}

async function waitForServiceWorker(context, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const [serviceWorker] = context.serviceWorkers();

    if (serviceWorker) {
      return serviceWorker;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  throw new Error("Timed out waiting for the extension service worker.");
}

async function getExtensionId(context) {
  const serviceWorker = await waitForServiceWorker(context);
  const extensionId = serviceWorker.url().split("/")[2];
  assert(extensionId, "Failed to resolve extension id from service worker URL.");
  return extensionId;
}

async function launchExtensionContext(userDataDir) {
  return chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    locale: "en-US",
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}

function unionStrings(existingValues, nextValues) {
  return [...new Set([...(existingValues ?? []), ...(nextValues ?? [])])];
}

function ensurePermissionBlock(container, key, origins) {
  const block =
    typeof container[key] === "object" && container[key] !== null
      ? container[key]
      : {};

  container[key] = {
    api: Array.isArray(block.api) ? block.api : [],
    explicit_host: unionStrings(
      Array.isArray(block.explicit_host) ? block.explicit_host : [],
      origins,
    ),
    manifest_permissions: Array.isArray(block.manifest_permissions)
      ? block.manifest_permissions
      : [],
    scriptable_host: Array.isArray(block.scriptable_host)
      ? block.scriptable_host
      : [],
  };
}

async function patchProfileGrantedHosts(userDataDir, extensionId, origins) {
  const preferencesPath = path.join(userDataDir, "Default", "Preferences");
  const rawPreferences = await readFile(preferencesPath, "utf8");
  const preferences = JSON.parse(rawPreferences);
  const extensionSettings = preferences?.extensions?.settings?.[extensionId] ?? null;

  assert(
    extensionSettings !== null,
    `Could not find unpacked extension settings for ${extensionId}.`,
  );

  ensurePermissionBlock(extensionSettings, "active_permissions", origins);
  ensurePermissionBlock(extensionSettings, "granted_permissions", origins);
  ensurePermissionBlock(extensionSettings, "runtime_granted_permissions", origins);

  await writeFile(preferencesPath, JSON.stringify(preferences), "utf8");
}

async function createExtensionRuntime() {
  const userDataDir = await mkdtemp(
    path.join(tmpdir(), "ai-usage-dashboard-phase203-"),
  );

  let context = await launchExtensionContext(userDataDir);
  const extensionId = await getExtensionId(context);
  await context.close();

  await patchProfileGrantedHosts(userDataDir, extensionId, cursorPermissionOrigins);

  context = await launchExtensionContext(userDataDir);

  return {
    userDataDir,
    context,
    extensionId: await getExtensionId(context),
  };
}

async function installCursorUsageContextRoute(context) {
  const html = createCursorUsageContextHtml();

  await context.route("https://cursor.com/dashboard/usage*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: html,
    });
  });
}

async function openSyntheticCursorTab(context) {
  const page = await context.newPage();
  await page.goto(cursorVendorUrl, { waitUntil: "load" });
  await page.waitForSelector("text=On-Demand Usage is Off");
  return page;
}

function buildExtensionUrl(extensionId, routePath) {
  return `chrome-extension://${extensionId}/${routePath}`;
}

async function openExtensionPage(context, extensionId, routePath) {
  const page = await context.newPage();
  await page.goto(buildExtensionUrl(extensionId, routePath), {
    waitUntil: "load",
  });
  return page;
}

async function focusCursorProviderState(page) {
  await page.evaluate(async () => {
    const providerIds = ["jetbrains", "claude-code", "gemini", "codex"];

    for (const providerId of providerIds) {
      const response = await chrome.runtime.sendMessage({
        type: "app:set-provider-enabled",
        providerId,
        enabled: false,
      });

      if (!response?.ok) {
        throw new Error(
          response?.error ?? `Could not disable ${providerId} for Cursor focus.`,
        );
      }
    }

    const response = await chrome.runtime.sendMessage({
      type: "app:set-provider-enabled",
      providerId: "cursor",
      enabled: true,
    });

    if (!response?.ok) {
      throw new Error(response?.error ?? "Could not enable Cursor for focus.");
    }
  });
}

async function refreshCursorFromExtensionPage(page) {
  return page.evaluate(async () => {
    const response = await chrome.runtime.sendMessage({
      type: "app:request-refresh",
      providerId: "cursor",
    });

    if (!response?.ok) {
      throw new Error(response?.error ?? "Cursor refresh failed.");
    }

    return response.state.providers.find(
      (provider) => provider.providerId === "cursor",
    );
  });
}

function assertCursorSnapshot(snapshot) {
  assert(snapshot, "Cursor snapshot was missing after refresh.");
  assert(snapshot.syncSource === "page_parse", "Cursor did not use page_parse.");
  assert(
    snapshot.planName === "Cursor Personal Dashboard",
    `Unexpected Cursor planName: ${snapshot.planName}`,
  );
  assert(snapshot.used === null, `Expected null used, received ${snapshot.used}.`);
  assert(
    snapshot.remaining === null,
    `Expected null remaining, received ${snapshot.remaining}.`,
  );
  assert(snapshot.total === null, `Expected null total, received ${snapshot.total}.`);
  assert(
    snapshot.resetAt === "Mar 23 - Apr 21",
    `Expected billing period Mar 23 - Apr 21, received ${snapshot.resetAt}.`,
  );
  assert(
    snapshot.resetLabel === "Your usage per day across this billing period",
    `Unexpected Cursor resetLabel: ${snapshot.resetLabel}`,
  );
  assert(
    snapshot.warningReason === "On-demand usage is off.",
    `Unexpected Cursor warningReason: ${snapshot.warningReason}`,
  );
  assert(
    snapshot.usageSummary === expectedUsageSummary,
    `Unexpected Cursor usageSummary: ${snapshot.usageSummary}`,
  );
  assert(
    snapshot.sourceSelectionReason === "Auto fell back to Session page.",
    `Unexpected Cursor sourceSelectionReason: ${snapshot.sourceSelectionReason}`,
  );
  assert(
    String(snapshot.sourceFallbackReason ?? "").includes(
      "Official API unavailable: No Cursor Admin API key is stored.",
    ),
    `Unexpected Cursor sourceFallbackReason: ${snapshot.sourceFallbackReason}`,
  );
}

async function assertDashboardSurface(page) {
  await page.waitForSelector(".provider-shell-list");
  await page.waitForSelector("text=Cursor Personal Dashboard");
  await page.waitForSelector("text=Usage unknown · requests");
  await page.waitForSelector(`text=${expectedUsageSummary}`);
}

async function assertProviderDetailSurface(context, extensionId) {
  const detailPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html?surface=full-page#provider-detail/cursor",
  );
  await detailPage.waitForSelector("text=Provider Detail");
  await detailPage.waitForSelector("text=Cursor Personal Dashboard");
  await detailPage.waitForSelector("text=Visible usage context");
  await detailPage.waitForSelector(`text=${expectedUsageSummary}`);
  await detailPage.screenshot({
    path: path.join(artifactDir, "provider-detail-cursor-usage-context.png"),
    fullPage: true,
  });
  await detailPage.close();
}

async function assertPopupSurface(context, extensionId) {
  const popupPage = await openExtensionPage(
    context,
    extensionId,
    "src/popup/index.html",
  );
  await popupPage.waitForSelector("text=TOOLBAR POPUP");
  await popupPage.waitForSelector(`text=${expectedUsageSummary}`);
  await popupPage.screenshot({
    path: path.join(artifactDir, "popup-cursor-usage-context.png"),
    fullPage: true,
  });
  await popupPage.close();
}

await mkdir(artifactDir, { recursive: true });

let runtime = null;

try {
  runtime = await createExtensionRuntime();
  await installCursorUsageContextRoute(runtime.context);
  const cursorTab = await openSyntheticCursorTab(runtime.context);
  const dashboardPage = await openExtensionPage(
    runtime.context,
    runtime.extensionId,
    "src/sidepanel/index.html#dashboard",
  );
  await dashboardPage.waitForSelector(".provider-shell-list");
  await focusCursorProviderState(dashboardPage);

  const snapshot = await refreshCursorFromExtensionPage(dashboardPage);
  assertCursorSnapshot(snapshot);
  await assertDashboardSurface(dashboardPage);
  await dashboardPage.screenshot({
    path: path.join(artifactDir, "dashboard-cursor-usage-context.png"),
    fullPage: true,
  });
  await assertProviderDetailSurface(runtime.context, runtime.extensionId);
  await assertPopupSurface(runtime.context, runtime.extensionId);

  await writeFile(
    path.join(artifactDir, "phase203-results.json"),
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        cursorVendorUrl,
        extensionId: runtime.extensionId,
        snapshot: {
          planName: snapshot.planName,
          used: snapshot.used,
          remaining: snapshot.remaining,
          total: snapshot.total,
          resetAt: snapshot.resetAt,
          resetLabel: snapshot.resetLabel,
          syncSource: snapshot.syncSource,
          warningReason: snapshot.warningReason,
          usageSummary: snapshot.usageSummary,
          sourceSelectionReason: snapshot.sourceSelectionReason,
          sourceFallbackReason: snapshot.sourceFallbackReason,
        },
        screenshots: [
          "tmp/phase203-cursor-usage-context-extension-review/dashboard-cursor-usage-context.png",
          "tmp/phase203-cursor-usage-context-extension-review/provider-detail-cursor-usage-context.png",
          "tmp/phase203-cursor-usage-context-extension-review/popup-cursor-usage-context.png",
        ],
      },
      null,
      2,
    )}
`,
    "utf8",
  );

  await cursorTab.close();
  await dashboardPage.close();

  console.log(
    "phase203: verified Cursor billing-period usage context in extension mode",
  );
} finally {
  await runtime?.context.close().catch(() => {});
  if (runtime?.userDataDir) {
    await rm(runtime.userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}
