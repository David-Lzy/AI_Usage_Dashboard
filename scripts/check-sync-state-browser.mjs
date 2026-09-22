import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import react from "@vitejs/plugin-react";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = process.cwd();
const output = path.join(root, "tmp", "output", "playwright", "sync-state-merge");
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
// Plain web-mode Vite avoids CRX's development output in a user's loaded build.
const server = await createServer({
  root, configFile: false, plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __GIT_COMMIT__: JSON.stringify("browser-qa"),
    __SOURCE_ORIGIN__: JSON.stringify(pkg.homepage),
  },
  server: { host: "127.0.0.1", port: 0, hmr: false, watch: null },
});
let browser;
try {
  await mkdir(output, { recursive: true });
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" });
  const page = await browser.newPage({ viewport: { width: 1360, height: 960 } });
  const errors = [];
  page.on("pageerror", (error) => { errors.push(error.message); console.error(error.message); });
  page.on("console", (message) => { if (message.type() === "error") console.error(message.text()); });
  await page.goto(`${base}/src/sidepanel/index.html?surface=full-page#settings`);
  await page.locator("#settings-appearance").waitFor().catch(async (error) => {
    await page.screenshot({ path: path.join(output, "startup-failure.png") });
    throw error;
  });
  await page.evaluate(async () => {
    const { updateAppState } = await import("/src/shared/storage.ts");
    const { CUSTOM_SOURCE_SCHEMA_V1 } = await import("/src/shared/custom-sources.ts");
    const { runSyncEngine } = await import("/src/background/sync-engine.ts");
    const nativeFetch = window.fetch.bind(window);
    window.chrome = { ...window.chrome, runtime: { id: "isolated-sync-qa" }, permissions: {
      contains: async ({ origins }) => origins?.every((origin) => origin === "https://qa.example.test/*") ?? false,
    } };
    window.fetch = async (input, init) => {
      if (String(input) !== "https://qa.example.test/usage") return nativeFetch(input, init);
      window.__syncQaPending = true;
      await new Promise((resolve) => { window.__releaseSyncQa = resolve; });
      return new Response(JSON.stringify({ schema: CUSTOM_SOURCE_SCHEMA_V1, label: "Synthetic QA",
        status: "ok", quota: { unit: "requests", remaining: 90, total: 100 } }),
      { status: 200, headers: { "Content-Type": "application/json" } });
    };
    const now = new Date().toISOString();
    await updateAppState((state) => ({
      ...state,
      providerSettings: state.providerSettings.map((setting) => ({ ...setting, displayEnabled: false })),
      customSources: [{ id: "custom:sync-qa", label: "Synthetic QA", description: null,
        endpointUrl: "https://qa.example.test/usage", displayEnabled: true,
        refreshIntervalMinutes: 15, createdAt: now, updatedAt: now }],
      customSourceStates: [],
    }));
    window.__syncQaRun = runSyncEngine({ trigger: "manual" });
  });
  await page.waitForFunction(() => window.__syncQaPending === true);
  const input = page.locator('[data-settings-custom-number-field="warning-threshold"] input');
  await input.fill("77");
  await input.press("Enter");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("ai-usage-dashboard.app-state"))?.settings.warningThresholdPercent === 77);
  const pendingScreenshot = path.join(output, "settings-during-pending-sync.png");
  await page.screenshot({ path: pendingScreenshot });
  const result = await page.evaluate(async () => {
    window.__releaseSyncQa();
    await window.__syncQaRun;
    const { readAppState } = await import("/src/shared/storage.ts");
    const state = await readAppState();
    return {
      warningThresholdPercent: state.settings.warningThresholdPercent,
      sourceStatus: state.customSourceStates.find((entry) => entry.sourceId === "custom:sync-qa")?.status,
      sourceRemaining: state.customSourceStates.find((entry) => entry.sourceId === "custom:sync-qa")?.snapshot?.remaining,
    };
  });
  assert.equal(result.warningThresholdPercent, 77);
  assert.equal(result.sourceStatus, "ok");
  assert.equal(result.sourceRemaining, 90);
  assert.deepEqual(errors, []);
  await page.screenshot({ path: path.join(output, "settings-after-sync.png") });
  await writeFile(path.join(output, "result.json"), JSON.stringify({ ...result, pageErrors: errors, pendingScreenshot }, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser?.close();
  await server.close();
}
