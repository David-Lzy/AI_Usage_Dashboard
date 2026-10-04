import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";

const engine = process.argv.includes("--browser=firefox") ? "firefox" : "chromium";
const outputRoot = path.resolve("tmp/output/playwright/material-ui-motion");
await mkdir(outputRoot, { recursive: true });
const output = await mkdtemp(path.join(outputRoot, "run-"));
const server = await startSourceQaServer();
const browser = await (engine === "firefox" ? firefox : chromium).launch({ headless: true,
  ...(engine === "firefox" ? {} : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
});
const results = [], errors = [], remoteRequests = [];
const frames = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
try {
  for (const system of ["no-preference", "reduce"]) for (const mode of ["full", "system", "expressive", "reduced"]) {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 }, reducedMotion: system });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      if (route.request().url().startsWith(server.baseUrl) || route.request().url().startsWith("data:")) return route.continue();
      remoteRequests.push(route.request().url());
      return route.abort();
    });
    await page.goto(`${server.baseUrl}/src/sidepanel/index.html?surface=full-page#settings`);
    await page.locator(".settings-fusion").waitFor();
    await page.evaluate(async () => {
      const { default: React } = await import("/__qa/react.js");
      const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
      const { FusionSelect, FusionCheckbox, FusionButton } = await import("/src/sidepanel/components/material-ui/FusionControls.tsx");
      const { useFusionTheme } = await import("/src/sidepanel/components/material-ui/fusion-theme.ts");
      const { DEFAULT_THEME_SETTINGS, applyThemeSettings } = await import("/src/shared/theme.ts");
      window.__applyMotionMode = (motionMode) => applyThemeSettings({ ...DEFAULT_THEME_SETTINGS, themeMode: "light", motionMode }, document.documentElement, window);
      document.querySelector("#root").hidden = true;
      const host = document.createElement("main");
      host.style.cssText = "padding:24px;max-width:650px;display:grid;gap:20px";
      document.body.append(host);
      const h = React.createElement;
      function Fixture() {
        const ref = React.useRef(null);
        useFusionTheme(ref);
        const [value, setValue] = React.useState("one"), [checked, setChecked] = React.useState(false);
        return h("section", { ref, className: "fusion-theme", id: "motion-controls", style: { display: "grid", gap: 20 } },
          h(FusionSelect, { label: "Motion choice", fieldIdPrefix: "motion-probe", value, onChange: setValue,
            options: [{ value: "one", label: "First" }, { value: "two", label: "Second" }] }),
          h(FusionCheckbox, { id: "motion-checkbox", checked, onChange: setChecked }, "Weekly quota"),
          h(FusionButton, { id: "motion-command", onClick: () => {} }, "Test command"));
      }
      window.__materialMotionRoot = ReactDOM.createRoot(host);
      window.__materialMotionRoot.render(h(Fixture));
      window.__applyMotionMode("full");
      window.scrollTo(0, 0);
      window.__shadowAnimations = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function(keyframes, options) {
        const animation = animate.call(this, keyframes, options);
        let node = this;
        while (node && !node.closest?.("#motion-controls")) node = node.getRootNode?.().host;
        if (node) window.__shadowAnimations.push({ duration: animation.effect.getTiming().duration,
          target: this.className, createdProfile: document.documentElement.dataset.motionProfile,
          scopeProfile: document.querySelector("#motion-controls").dataset.fusionMotionProfile });
        return animation;
      };
      window.__sampleShadowAnimations = () => {
        const seen = new Set();
        const visit = (root) => {
          for (const animation of root.getAnimations({ subtree: true })) seen.add(animation);
          for (const node of root.querySelectorAll("*")) if (node.shadowRoot) visit(node.shadowRoot);
        };
        visit(document.querySelector("#motion-controls"));
        return [...seen].filter((animation) => animation.playState === "running")
          .map((animation) => ({ duration: animation.effect.getTiming().duration, target: animation.effect.target.className }));
      };
    });
    const input = page.locator('[data-fusion-field="motion-probe"] input:not(.hidden-input)');
    await input.waitFor();
    await input.click();
    await page.keyboard.press("Escape");
    await page.evaluate((mode) => { window.__applyMotionMode(mode); window.__shadowAnimations = []; }, mode);
    await frames(page);
    const reduced = mode === "reduced" || mode === "system" && system === "reduce";
    const modeSwitch = await page.evaluate(() => ({ created: window.__shadowAnimations, active: window.__sampleShadowAnimations() }));
    if (reduced) assert(modeSwitch.active.every((row) => Number(row.duration) <= 1), JSON.stringify({ system, mode, modeSwitch }));
    await page.evaluate(() => { window.__shadowAnimations = []; });
    await input.click();
    await page.locator('[data-fusion-field="motion-probe"]').getByRole("menu").waitFor();
    const open = await page.evaluate(() => window.__sampleShadowAnimations());
    await page.keyboard.press("Escape");
    await page.locator("#motion-checkbox").click();
    await page.locator("#motion-command").click();
    await frames(page);
    const evidence = await page.evaluate(() => ({ created: window.__shadowAnimations, active: window.__sampleShadowAnimations(),
      profile: document.documentElement.dataset.motionProfile, scope: document.querySelector("#motion-controls").dataset.fusionMotion,
      short: getComputedStyle(document.querySelector("#motion-controls mdui-select")).getPropertyValue("--mdui-motion-duration-short4"),
      medium: getComputedStyle(document.querySelector("#motion-controls mdui-select")).getPropertyValue("--mdui-motion-duration-medium4") }));
    assert.equal(evidence.scope, reduced ? "reduced" : "full");
    if (reduced) {
      assert([...evidence.created, ...open, ...evidence.active].every((row) => Number(row.duration) <= 1), JSON.stringify({ system, mode, evidence, open }));
    } else assert(evidence.created.some((row) => Number(row.duration) > 0), "Normal and More ignore OS reduction for MDUI timing");
    await page.waitForTimeout(500);
    const equivalentModeChange = system === "no-preference" && mode === "full" ? await page.evaluate(async () => {
      const node = document.createElement("span");
      document.querySelector("#motion-command").shadowRoot.append(node);
      const animation = node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 270 });
      animation.pause();
      window.__applyMotionMode("system");
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const result = { profile: document.documentElement.dataset.motionProfile, state: animation.playState };
      animation.cancel();
      node.remove();
      return result;
    }) : null;
    results.push({ system, mode, open, modeSwitch, equivalentModeChange, ...evidence });
    if (equivalentModeChange) {
      assert.equal(equivalentModeChange.profile, "standard");
      assert.equal(equivalentModeChange.state, "finished", "Same-intensity choice changes settle finite shadow animations");
    }
    await page.evaluate(() => window.__materialMotionRoot.unmount());
    await page.close();
    console.log(`MDUI motion ${system}/${mode}: passed`);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(remoteRequests, []);
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ engine, results, errors, remoteRequests }, null, 2));
  await browser.close();
  await server.close();
  console.log(`MDUI motion evidence: ${output}`);
}
