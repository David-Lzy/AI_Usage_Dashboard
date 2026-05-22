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
  "phase202-codex-usage-context-extension-review",
);
const codexVendorUrl =
  "https://chatgpt.com/codex/cloud/settings/analytics#usage";
const codexPermissionOrigins = [
  "https://api.chatgpt.com/*",
  "https://chatgpt.com/*",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createCodexUsageContextHtml() {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Codex</title>
  </head>
  <body>
    <main>
      <h1>Codex 分析</h1>
      <nav>
        <span>7天</span>
        <span>1个月</span>
      </nav>
      <section>
        <h2>使用情况</h2>
        <p>5 小时使用限额</p>
        <p>100%</p>
        <p>剩余</p>
      </section>
      <section>
        <p>每周使用限额</p>
        <p>32%</p>
        <p>剩余</p>
        <p>重置时间：2026年4月29日 4:00</p>
      </section>
      <section>
        <p>GPT-5.3-Codex-Spark 5 小时使用限额</p>
        <p>100%</p>
        <p>剩余</p>
      </section>
      <section>
        <p>GPT-5.3-Codex-Spark 每周使用限额</p>
        <p>100%</p>
      </section>
      <section>
        <p>余额额度</p>
        <p>0</p>
        <p>使用积分可在超出套餐限制后继续使用 Codex</p>
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
    path.join(tmpdir(), "ai-usage-dashboard-phase202-"),
  );

  let context = await launchExtensionContext(userDataDir);
  const extensionId = await getExtensionId(context);
  await context.close();

  await patchProfileGrantedHosts(userDataDir, extensionId, codexPermissionOrigins);

  context = await launchExtensionContext(userDataDir);

  return {
    userDataDir,
    context,
    extensionId: await getExtensionId(context),
  };
}

async function installCodexUsageContextRoute(context) {
  const html = createCodexUsageContextHtml();

  await context.route(
    "https://chatgpt.com/codex/cloud/settings/analytics*",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: html,
      });
    },
  );
}

async function openSyntheticCodexTab(context) {
  const page = await context.newPage();
  await page.goto(codexVendorUrl, { waitUntil: "load" });
  await page.waitForSelector("text=余额额度");
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

async function refreshCodexFromExtensionPage(page) {
  return page.evaluate(async () => {
    const response = await chrome.runtime.sendMessage({
      type: "app:request-refresh",
      providerId: "codex",
    });

    if (!response?.ok) {
      throw new Error(response?.error ?? "Codex refresh failed.");
    }

    return response.state.providers.find(
      (provider) => provider.providerId === "codex",
    );
  });
}

async function focusCodexProviderState(page) {
  await page.evaluate(async () => {
    const providerIds = ["cursor", "jetbrains", "claude-code", "gemini"];

    for (const providerId of providerIds) {
      const response = await chrome.runtime.sendMessage({
        type: "app:set-provider-enabled",
        providerId,
        enabled: false,
      });

      if (!response?.ok) {
        throw new Error(
          response?.error ?? `Could not disable ${providerId} for Codex focus.`,
        );
      }
    }

    const response = await chrome.runtime.sendMessage({
      type: "app:set-provider-enabled",
      providerId: "codex",
      enabled: true,
    });

    if (!response?.ok) {
      throw new Error(response?.error ?? "Could not enable Codex for focus.");
    }
  });
}

function assertCodexSnapshot(snapshot) {
  assert(snapshot, "Codex snapshot was missing after refresh.");
  assert(snapshot.syncSource === "page_parse", "Codex did not use page_parse.");
  assert(
    snapshot.planName === "Codex Personal Usage Page (Weekly usage window)",
    `Unexpected Codex planName: ${snapshot.planName}`,
  );
  assert(snapshot.used === 68, `Expected 68% used, received ${snapshot.used}.`);
  assert(
    snapshot.remaining === 32,
    `Expected 32% remaining, received ${snapshot.remaining}.`,
  );
  assert(
    snapshot.resetAt === "2026-04-29 04:00",
    `Expected weekly reset at 2026-04-29 04:00, received ${snapshot.resetAt}.`,
  );
  assert(
    Array.isArray(snapshot.usageWindows) && snapshot.usageWindows.length === 4,
    `Expected 4 usage windows, received ${snapshot.usageWindows?.length ?? 0}.`,
  );
  assert(
    snapshot.usageWindows.some(
      (window) => window.kind === "weekly" && window.remaining === 32,
    ),
    "Weekly 32% window was not preserved.",
  );
  assert(
    Array.isArray(snapshot.usageBalances) && snapshot.usageBalances.length === 1,
    `Expected 1 usage balance, received ${snapshot.usageBalances?.length ?? 0}.`,
  );
  assert(
    snapshot.usageBalances[0]?.remaining === 0,
    `Expected flex balance 0, received ${snapshot.usageBalances[0]?.remaining}.`,
  );
  assert(
    String(snapshot.usageSummary ?? "").includes("Flex credit balance: 0 credits"),
    `Usage summary did not include the flex balance: ${snapshot.usageSummary}`,
  );
}

async function assertDashboardSurface(page) {
  await page.waitForSelector(".provider-shell-list");
  await page.waitForSelector("text=Codex Personal Usage Page (Weekly usage window)");
  await page.waitForSelector("text=68% used · 32% remaining");
  await page.waitForSelector("text=Weekly usage window: 32% remaining");
  await page.waitForSelector("text=Flex credit balance: 0 credits");
}

async function assertProviderDetailSurface(context, extensionId) {
  const detailPage = await openExtensionPage(
    context,
    extensionId,
    "src/sidepanel/index.html?surface=full-page#provider-detail/codex",
  );
  await detailPage.waitForSelector("text=Provider Detail");
  await detailPage.waitForSelector("text=Codex Personal Usage Page (Weekly usage window)");
  await detailPage.waitForSelector("text=Visible usage context");
  await detailPage.waitForSelector("text=Weekly usage window: 32% remaining");
  await detailPage.waitForSelector("text=Flex credit balance: 0 credits remaining");
  await detailPage.screenshot({
    path: path.join(artifactDir, "provider-detail-codex-usage-context.png"),
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
  await popupPage.waitForSelector("text=Flex credit balance: 0 credits");
  await popupPage.screenshot({
    path: path.join(artifactDir, "popup-codex-usage-context.png"),
    fullPage: true,
  });
  await popupPage.close();
}

await mkdir(artifactDir, { recursive: true });

let runtime = null;

try {
  runtime = await createExtensionRuntime();
  await installCodexUsageContextRoute(runtime.context);
  const codexTab = await openSyntheticCodexTab(runtime.context);
  const dashboardPage = await openExtensionPage(
    runtime.context,
    runtime.extensionId,
    "src/sidepanel/index.html#dashboard",
  );
  await dashboardPage.waitForSelector(".provider-shell-list");
  await focusCodexProviderState(dashboardPage);

  const snapshot = await refreshCodexFromExtensionPage(dashboardPage);
  assertCodexSnapshot(snapshot);
  await assertDashboardSurface(dashboardPage);
  await dashboardPage.screenshot({
    path: path.join(artifactDir, "dashboard-codex-usage-context.png"),
    fullPage: true,
  });
  await assertProviderDetailSurface(runtime.context, runtime.extensionId);
  await assertPopupSurface(runtime.context, runtime.extensionId);

  await writeFile(
    path.join(artifactDir, "phase202-results.json"),
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        codexVendorUrl,
        extensionId: runtime.extensionId,
        snapshot: {
          planName: snapshot.planName,
          used: snapshot.used,
          remaining: snapshot.remaining,
          resetAt: snapshot.resetAt,
          syncSource: snapshot.syncSource,
          usageWindows: snapshot.usageWindows,
          usageBalances: snapshot.usageBalances,
          usageSummary: snapshot.usageSummary,
        },
        screenshots: [
          "tmp/phase202-codex-usage-context-extension-review/dashboard-codex-usage-context.png",
          "tmp/phase202-codex-usage-context-extension-review/provider-detail-codex-usage-context.png",
          "tmp/phase202-codex-usage-context-extension-review/popup-codex-usage-context.png",
        ],
      },
      null,
      2,
    )}
`,
    "utf8",
  );

  await codexTab.close();
  await dashboardPage.close();

  console.log(
    "phase202: verified Codex multi-window and flex-balance usage context in extension mode",
  );
} finally {
  await runtime?.context.close().catch(() => {});
  if (runtime?.userDataDir) {
    await rm(runtime.userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}
