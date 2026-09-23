import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";
import { findBrowserRootPid, getExtensionRendererRows, resolveClockTicksPerSecond, sampleRendererCpu } from "./lib/extension-cpu-sampling.mjs";
import { summarizeMeasurements } from "./lib/performance-statistics.mjs";

const arg = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
assert(arg("--extension"), "Pass --extension=<isolated Chrome build>");
const extensionPath = path.resolve(arg("--extension"));
const manifest = JSON.parse(await readFile(path.join(extensionPath, "manifest.json"), "utf8"));
const smoke = process.argv.includes("--smoke");
const cpuOnly = process.argv.includes("--cpu-only");
const startupOnly = process.argv.includes("--startup-only");
assert(!(cpuOnly && startupOnly), "Choose only one measurement subset");
const repeats = smoke ? 1 : 10;
const cpuRepeats = smoke ? 1 : 3;
const intervalMs = smoke ? 1000 : 30000;
const outputRoot = path.resolve(arg("--output") ?? "tmp/output/playwright/popup-performance");
await mkdir(outputRoot, { recursive: true });
const output = await mkdtemp(path.join(outputRoot, "run-"));
const stateKey = "ai-usage-dashboard.app-state";
const lockKey = "ai-usage-dashboard.store-screenshot-runtime-lock";
const clockTicksPerSecond = await resolveClockTicksPerSecond();
const errors = [];
let browserVersion;

// Load the existing explicit synthetic preset without loading frontend bundles in
// the measured browser. Vite's app config is disabled to avoid build side effects.
const loader = await createServer({ configFile: false, cacheDir: path.join(output, "vite-cache"),
  optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null }, appType: "custom" });
let baseFixture;
try {
  const seed = await loader.ssrLoadModule("/src/sidepanel/store-screenshot-seed.ts");
  baseFixture = JSON.parse(JSON.stringify(seed.getStoreScreenshotSeedPresetDefinition("toolbar-first-quick-glance").appState));
} finally { await loader.close(); }

function fixtureFor({ locale, width, count, mode = "collapsible", reduced = false }) {
  const fixture = structuredClone(baseFixture);
  const enabled = count === 1 ? ["codex-personal-page"] : ["claude-code-team-page", "codex-personal-page", "cursor-personal-page"];
  fixture.settings = { ...fixture.settings, locale, themeMode: "dark", popupSizePreset: width === 320 ? "compact" : "balanced", motionMode: reduced ? "reduced" : "full", popupProviderBrowsingMode: mode };
  fixture.settings.providerOrderBySurface.popup = enabled;
  for (const setting of fixture.providerSettings) setting.displayEnabled = enabled.includes(setting.id);
  return fixture;
}

async function launch(id, config) {
  const profile = path.join(output, "profiles", id);
  const context = await chromium.launchPersistentContext(profile, {
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
    headless: true, offline: true, viewport: { width: config.width, height: 760 },
    reducedMotion: config.reduced ? "reduce" : "no-preference",
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    browserVersion = context.browser()?.version();
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker", { timeout: 15000 });
    await worker.evaluate(async ({ stateKey, lockKey, fixture }) => {
      await chrome.storage.local.set({ [lockKey]: true });
      for (let i = 0; i < 100; i++) {
        if ((await chrome.storage.local.get(stateKey))[stateKey]) break;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      await chrome.storage.local.set({ [stateKey]: fixture });
    }, { stateKey, lockKey, fixture: fixtureFor(config) });
    return { context, profile, extensionId: new URL(worker.url()).host };
  } catch (error) { await context.close(); throw error; }
}

async function openPopup(runtime, config) {
  const page = await runtime.context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`chrome-extension://${runtime.extensionId}/${manifest.action.default_popup}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(({ count, locale }) => document.querySelectorAll(".popup-provider-card").length === count && document.documentElement.lang === locale, config);
  const measurement = await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const card = document.querySelector(".popup-provider-card");
    const rect = card.getBoundingClientRect();
    return { readyMs: performance.now(), firstCard: { width: rect.width, height: rect.height }, direction: document.documentElement.dir, bodyWidth: document.body.getBoundingClientRect().width, horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) };
  });
  assert(measurement.firstCard.width > 100 && measurement.firstCard.height > 40, "Popup is blank");
  if (measurement.horizontalOverflow !== 0) {
    await page.screenshot({ path: path.join(output, "overflow.png"), fullPage: true });
    const overflowing = await page.evaluate(() => [...document.querySelectorAll("body *")].map((element) => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, class: String(element.className), left: rect.left, right: rect.right, width: rect.width, text: element.textContent?.slice(0, 90) };
    }).filter((element) => element.left < -0.5 || element.right > innerWidth + 0.5));
    await writeFile(path.join(output, "overflow.json"), JSON.stringify({ config, measurement, overflowing }, null, 2));
  }
  assert.equal(measurement.horizontalOverflow, 0, "Popup overflows tested width");
  if (config.locale === "ar") assert.equal(measurement.direction, "rtl");
  return { page, measurement };
}

async function motionSnapshot(page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".popup-provider-stage");
    const track = document.querySelector(".popup-provider-list");
    return {
      active: stage?.dataset.popupProviderAutoGlideActive ?? null,
      height: stage?.getBoundingClientRect().height,
      motion: document.documentElement.dataset.motionResolved,
      animations: (track?.getAnimations() ?? []).map((animation) => ({ state: animation.playState, time: Number(animation.currentTime), duration: Number(animation.effect?.getTiming().duration) })),
      transform: track ? getComputedStyle(track).transform : null,
      order: [...(track?.children ?? [])].map((card) => card.querySelector(".popup-provider-card__provider")?.textContent?.trim()),
    };
  });
}

async function verifyMotion(page, id) {
  if (id === "idle") return;
  if (id === "reduced") {
    await page.waitForFunction(() => document.documentElement.dataset.motionResolved === "reduced" && document.querySelector(".popup-provider-stage")?.dataset.popupProviderAutoGlideActive === "false");
    const before = await motionSnapshot(page);
    await page.waitForTimeout(500);
    const after = await motionSnapshot(page);
    assert(!after.animations.some((animation) => animation.state === "running"), "Reduced-motion glide is running");
    assert.equal(after.transform, before.transform, "Reduced-motion track moved");
    return;
  }
  await page.waitForFunction(() => document.querySelector(".popup-provider-stage")?.dataset.popupProviderAutoGlideActive === "true");
  await page.mouse.move(1, 1);
  await page.waitForFunction(() => document.querySelector(".popup-provider-list")?.getAnimations().some((animation) => animation.playState === "running"));
  if (id === "hover-paused") await page.locator(".popup-provider-stage").hover();
  else await page.mouse.move(1, 1);
  await page.waitForTimeout(120);
  const before = await motionSnapshot(page);
  await page.waitForTimeout(500);
  const after = await motionSnapshot(page);
  assert(after.height >= 96, "Glide viewport is empty");
  if (id === "hover-paused") {
    assert(after.animations.length > 0 && after.animations.every((animation) => animation.state === "paused"), "Hover did not pause glide");
    assert.equal(after.transform, before.transform, "Paused glide moved");
  } else {
    assert(after.animations.some((animation) => animation.state === "running"), "Glide is not running");
    assert.notEqual(after.transform, before.transform, "Glide did not move");
  }
}

async function filesUnder(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(filename));
    else if (entry.isFile()) result.push({ path: path.relative(extensionPath, filename), bytes: (await stat(filename)).size });
  }
  return result;
}

const report = {
  status: "running", smoke, subset: cpuOnly ? "cpu" : startupOnly ? "startup" : "all", generatedAt: new Date().toISOString(),
  revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  extensionPath, fixtureSha256: createHash("sha256").update(JSON.stringify(baseFixture)).digest("hex"),
  environment: { node: process.version, platform: os.platform(), release: os.release(), arch: os.arch(), cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, memoryBytes: os.totalmem(), loadAverage: os.loadavg(), clockTicksPerSecond, headless: true, offline: true },
  workingTreeStatus: execFileSync("git", ["status", "--short"], { encoding: "utf8" }).trim(),
  definitions: {
    ready: "Navigation start to expected cards, locale, loaded fonts and two animation frames; excludes browser launch/worker initialization and fixture injection.",
    cold: "First frontend open in a fresh browser profile; OS file cache not flushed. Synthetic state seeded through worker before opening UI.",
    warm: "Repeated new popup pages in the same browser/profile after the cold open; pages closed between opens.",
    cpu: "Owned extension renderer user+system ticks only, percent of one core; excludes browser/GPU processes; PID continuity required. Other-host load is uncontrolled.",
    fixture: "Existing explicit toolbar-first synthetic preset, one or three cards, dark theme; not a benchmark of every possible chart/account workload.",
  },
  startup: [], cpu: [], errors,
};

try {
  const requestedLocale = arg("--locale");
  assert(!requestedLocale || ["en", "de", "ar"].includes(requestedLocale), "Supported baseline locales: en, de, ar");
  const locales = cpuOnly ? [] : requestedLocale ? [requestedLocale] : smoke ? ["en"] : ["en", "de", "ar"];
  for (const locale of locales) for (const width of [320, 392]) for (const count of [1, 3]) {
    const config = { locale, width, count };
    const id = `${locale}-${width}-${count}`;
    const cold = [], warm = [];
    for (let iteration = 0; iteration < repeats; iteration++) {
      const runtime = await launch(`${id}-${iteration}`, config);
      try {
        const first = await openPopup(runtime, config);
        cold.push(first.measurement);
        if (iteration === 0) await first.page.screenshot({ path: path.join(output, `${id}.png`), animations: "disabled", fullPage: true });
        await first.page.close();
        if (iteration === 0) for (let repeat = 0; repeat < repeats; repeat++) {
          const next = await openPopup(runtime, config);
          warm.push(next.measurement);
          await next.page.close();
        }
      } finally { await runtime.context.close(); }
    }
    report.startup.push({ ...config, cold, warm, coldSummary: summarizeMeasurements(cold.map((row) => row.readyMs)), warmSummary: summarizeMeasurements(warm.map((row) => row.readyMs)) });
    console.log(`startup ${id}: cold ${report.startup.at(-1).coldSummary.median.toFixed(1)}ms, warm ${report.startup.at(-1).warmSummary.median.toFixed(1)}ms`);
    await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  }
  for (const id of startupOnly ? [] : ["idle", "glide", "hover-paused", "reduced"]) {
    const config = { locale: "en", width: 392, count: 3, mode: id === "idle" ? "collapsible" : "scroll", reduced: id === "reduced" };
    const runtime = await launch(`cpu-${id}`, config);
    try {
      const rootPid = await findBrowserRootPid(runtime.profile);
      const { page } = await openPopup(runtime, config);
      await verifyMotion(page, id);
      const before = await motionSnapshot(page);
      const samples = [];
      for (let index = 0; index < cpuRepeats; index++) {
        const sample = await sampleRendererCpu(() => getExtensionRendererRows(rootPid), { intervalMs, clockTicksPerSecond });
        assert(sample.coverageComplete, "CPU renderer continuity unavailable; missing data must not be zero");
        samples.push(sample);
        console.log(`cpu ${id} ${index + 1}/${cpuRepeats}: ${sample.cpuPercent.toFixed(2)}% over ${sample.elapsedSeconds.toFixed(1)}s`);
      }
      const after = await motionSnapshot(page);
      await verifyMotion(page, id);
      await page.screenshot({ path: path.join(output, `cpu-${id}.png`) });
      report.cpu.push({ id, ...config, rootPid, profile: runtime.profile, before, after, samples, loadAverage: os.loadavg(), summary: summarizeMeasurements(samples.map((row) => row.cpuPercent)) });
      await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
    } finally { await runtime.context.close(); }
  }
  const files = await filesUnder(extensionPath);
  const contentHash = createHash("sha256");
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) contentHash.update(file.path).update("\0").update(await readFile(path.join(extensionPath, file.path))).update("\0");
  report.build = { sha256: contentHash.digest("hex"), bytes: files.reduce((sum, file) => sum + file.bytes, 0), fileCount: files.length, largest: files.sort((a, b) => b.bytes - a.bytes).slice(0, 15), archiveBytes: arg("--archive") ? (await stat(path.resolve(arg("--archive")))).size : null };
  assert.deepEqual(errors, []);
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = error.stack ?? error.message;
  throw error;
} finally {
  report.environment.browser = browserVersion;
  await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  console.log(`Evidence: ${output}`);
}
