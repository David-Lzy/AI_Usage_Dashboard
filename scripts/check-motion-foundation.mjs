import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";

const root = path.resolve("tmp/output/playwright/motion-foundation");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await startSourceQaServer();
const browser = await chromium.launch({ headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chrome" }),
});
const results = [];
const errors = [];
try {
  for (const system of ["no-preference", "reduce"]) for (const mode of ["full", "system", "expressive", "reduced"]) {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 }, reducedMotion: system });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => route.request().url().startsWith(server.baseUrl) || route.request().url().startsWith("data:")
      ? route.continue() : route.abort());
    await page.goto(`${server.baseUrl}/src/sidepanel/index.html?surface=full-page#settings`);
    await page.locator(".settings-category-layout").waitFor();
    await page.evaluate(async (motionMode) => {
      const { default: React } = await import("/__qa/react.js");
      const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
      const { ControlVisibilityBoundary } = await import("/src/shared/control-visibility.tsx");
      const { DEFAULT_THEME_SETTINGS, applyThemeSettings } = await import("/src/shared/theme.ts");
      applyThemeSettings({ ...DEFAULT_THEME_SETTINGS, themeMode: "light", motionMode }, document.documentElement, window);
      document.querySelector("#root").hidden = true;
      const host = document.createElement("main");
      host.style.cssText = "margin:24px;display:grid;gap:16px;max-width:600px";
      document.body.append(host);
      const h = React.createElement;
      function Fixture() {
        const [hidden, setHidden] = React.useState(true);
        const [parentHidden, setParentHidden] = React.useState(false);
        const [long, setLong] = React.useState(false);
        Object.assign(window, { __motionSet: setHidden, __motionParent: setParentHidden, __motionLong: setLong });
        return h(ControlVisibilityBoundary, { hidden: parentHidden },
          h("button", { id: "motion-trigger", "aria-controls": "motion-body", "aria-expanded": !hidden, onClick: () => setHidden(!hidden) }, "Configure"),
          h(ControlVisibilityBoundary, { animate: true, hidden, id: "motion-body", style: { padding: 16, background: "#f0f4f8" } },
            h("label", null, "Draft", h("input", { id: "motion-draft", defaultValue: "retained" })),
            h("p", null, "Settings stay mounted while motion changes visibility."),
            long ? h("div", { style: { height: 600 } }, "Dynamic long content") : null));
      }
      window.__motionRoot = ReactDOM.createRoot(host);
      window.__motionRoot.render(h(Fixture));
      window.scrollTo(0, 0);
    }, mode);
    const reduced = mode === "reduced" || mode === "system" && system === "reduce";
    const profile = reduced ? "reduced" : mode === "expressive" ? "expressive" : "standard";
    assert.equal(await page.locator("html").getAttribute("data-motion-profile"), profile);
    const body = page.locator("#motion-body");
    await page.locator("#motion-trigger").click();
    await page.waitForTimeout(45);
    const intermediate = await body.evaluate((element) => ({ hidden: element.hidden, inert: element.inert, height: element.getBoundingClientRect().height, active: element.getAnimations().length }));
    assert.equal(intermediate.hidden, false);
    assert.equal(intermediate.inert, false);
    assert.equal(intermediate.active > 0, !reduced, JSON.stringify({ mode, system, intermediate }));
    await page.evaluate(() => window.__motionLong(true));
    await page.waitForTimeout(45);
    const retarget = await body.evaluate((element) => element.getAnimations().map((animation) => ({ duration: animation.effect.getTiming().duration, frames: animation.effect.getKeyframes().map((frame) => frame.height) })));
    if (!reduced) assert(retarget.some((animation) => Number.parseFloat(animation.frames.at(-1)) > 600), "Async content retargets during the same entrance");
    await page.waitForTimeout(400);
    await page.locator("#motion-draft").fill("edited draft");
    await page.locator("#motion-draft").focus();
    await page.evaluate(() => window.__motionSet(true));
    await page.waitForTimeout(35);
    assert.equal(await body.getAttribute("inert"), "");
    assert.equal(await body.getAttribute("aria-hidden"), "true");
    assert.equal(await page.evaluate(() => document.activeElement?.id), "motion-trigger");
    await page.evaluate(() => window.__motionSet(false));
    await page.waitForTimeout(35);
    await page.evaluate(() => window.__motionSet(true));
    await page.waitForTimeout(35);
    await page.evaluate(() => { window.__motionSet(false); window.__motionLong(true); });
    await page.waitForTimeout(400);
    assert.equal(await body.getAttribute("hidden"), null);
    assert.equal(await body.getAttribute("inert"), null);
    assert.equal(await page.locator("#motion-draft").inputValue(), "edited draft");
    assert(await body.evaluate((element) => element.getBoundingClientRect().height > 600));
    await page.evaluate(() => window.__motionSet(true));
    await page.waitForTimeout(35);
    await page.evaluate(() => { document.documentElement.dataset.motionResolved = "reduced"; document.documentElement.dataset.motionProfile = "reduced"; });
    await page.waitForTimeout(35);
    assert.equal(await body.getAttribute("hidden"), "");
    assert.equal(await body.evaluate((element) => element.style.height), "");
    await page.evaluate(() => { window.__motionSet(false); window.__motionParent(true); });
    await page.waitForTimeout(50);
    assert.equal(await page.locator("#motion-trigger").isVisible(), false);
    await page.evaluate(() => window.__motionParent(false));
    await page.waitForTimeout(50);
    assert.equal(await page.locator("#motion-draft").inputValue(), "edited draft");
    await page.evaluate(() => window.__motionRoot.unmount());
    assert.equal(await page.evaluate(() => document.getAnimations().filter((animation) => animation.effect?.target?.closest?.("#motion-body")).length), 0);
    results.push({ mode, system, profile, intermediate, retarget, rapidInterruptions: "pass", drafts: "retained", focus: "returned", modeChange: "settled", unmount: "clean" });
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ output, results, errors }, null, 2));
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  await server.close();
}
