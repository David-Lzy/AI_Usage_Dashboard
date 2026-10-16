import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const extension = process.argv.find((value) => value.startsWith("--extension="))?.slice(12);
assert(extension, "Pass an isolated Chrome extension path");
const source = path.resolve(extension);
assert(!source.startsWith(path.resolve("dist") + path.sep), "Never use the loaded extension");
const root = path.resolve(".local/qa/provider-insights/824/native-chrome-notifications");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const owned = path.join(output, "owned-extension");
await cp(source, owned, { recursive: true });
const manifest = JSON.parse(await readFile(path.join(owned, "manifest.json"), "utf8"));
manifest.permissions = [...new Set([...manifest.permissions, "notifications"])];
manifest.optional_permissions = manifest.optional_permissions.filter((permission) => permission !== "notifications");
await writeFile(path.join(owned, "manifest.json"), JSON.stringify(manifest));
let context;
const report = { synthetic: true, apiAccepted: false, osBanner: "not_observed_headless", error: null };
try {
  context = await chromium.launchPersistentContext(path.join(output, "owned-profile"), {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, headless: true, offline: true,
    args: [`--disable-extensions-except=${owned}`, `--load-extension=${owned}`],
  });
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
  const result = await worker.evaluate(async () => {
    await chrome.storage.local.set({ "ai-usage-dashboard.store-screenshot-runtime-lock": true });
    try {
      const id = await chrome.notifications.create("synthetic-provider-insights-api", { type: "basic",
        title: "AI Usage Dashboard synthetic API test", message: "No account data. API acceptance only.", iconUrl: chrome.runtime.getURL("icons/icon128.png") });
      await chrome.notifications.clear(id); return { accepted: true, error: null };
    } catch (error) { return { accepted: false, error: String(error).slice(0, 200) }; }
  });
  report.apiAccepted = result.accepted; report.error = result.error;
  report.browser = context.browser()?.version();
  assert.equal(result.accepted, true, result.error ?? "Native Chrome notification API rejected the synthetic message");
} finally {
  await context?.close();
  await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  console.log(`Native Chrome notification evidence: ${output}`);
}
