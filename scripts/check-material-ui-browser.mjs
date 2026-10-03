import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const root = path.resolve("tmp/output/playwright/material-ui");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await startSourceQaServer();
const engine = process.argv.find((value) => value.startsWith("--browser="))?.slice(10) ?? "chromium";
assert(["chromium", "firefox"].includes(engine), "Use --browser=chromium or firefox");
const browser = await (engine === "firefox" ? firefox : chromium).launch({ headless: true,
  ...(engine === "firefox" ? {} : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : { channel: "chrome" }),
});
const results = [];
const errors = [];
const remoteRequests = [];
const systemMotion = process.argv.find((value) => value.startsWith("--system-motion="))?.slice(16) ?? "reduce";
assert(["reduce", "no-preference"].includes(systemMotion), "Use a valid OS motion preference");
const locales = process.env.FUSION_QA_SMOKE ? ["en"] : SUPPORTED_RDP_CAPTURE_LOCALES;
try {
  for (const locale of locales) for (const theme of ["light", "dark"]) for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: systemMotion });
    const name = `${locale}-${theme}-${width}`;
    page.on("pageerror", (error) => errors.push({ name, message: error.message }));
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith(server.baseUrl) || url.startsWith("data:")) return route.continue();
      remoteRequests.push(url);
      return route.abort();
    });
    try {
      await page.goto(`${server.baseUrl}/src/sidepanel/index.html?surface=full-page&app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings/section/settings-overview`);
      await page.locator('[data-fusion-field="settings-user-level"] input:not(.hidden-input)').waitFor();
      await page.evaluate(async ({ theme }) => {
        const { updateAppState } = await import("/src/shared/storage.ts");
        await updateAppState((state) => ({ ...state, settings: { ...state.settings, themeMode: theme, motionMode: "reduced" } }));
      }, { theme });
      await page.reload();
      const field = page.locator('[data-fusion-field="settings-user-level"]');
      const select = field.locator("mdui-select");
      const input = field.locator("input:not(.hidden-input)");
      await input.waitFor();
      await page.waitForFunction(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select')?.shadowRoot?.querySelector("mdui-text-field")?.shadowRoot?.querySelector("input")?.hasAttribute("aria-label"));
      assert(await input.getAttribute("aria-label"));
      assert.equal(await input.getAttribute("role"), "button");
      assert.equal(await input.getAttribute("type"), "button");
      assert.equal(await input.getAttribute("aria-haspopup"), "menu");
      assert((await input.getAttribute("aria-label")).includes(await input.inputValue()));
      assert.equal(await input.evaluate((element) => element.required), true);
      assert.equal(await field.getAttribute("data-session-popover-id"), "settings-user-level");
      for (const key of ["Enter", "Space"]) {
        await input.focus();
        await page.keyboard.press(key);
        await page.waitForFunction(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select')?.shadowRoot?.querySelector("mdui-dropdown")?.open === true);
        await field.getByRole("menu").waitFor({ state: "visible" });
        await page.keyboard.press("Escape");
        await field.getByRole("menu").waitFor({ state: "hidden" });
      }
      await input.focus();
      await page.keyboard.press("ArrowDown");
      await page.waitForFunction(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select')?.shadowRoot?.querySelector("mdui-dropdown")?.open === true);
      const items = field.locator("mdui-menu-item");
      assert.equal(await field.getByRole("menu").count(), 1);
      assert.equal(await field.getByRole("menuitemradio").count(), await items.count());
      assert.equal(await field.getByRole("menuitemradio", { checked: true }).count(), 1,
        JSON.stringify(await items.evaluateAll((elements) => elements.map((item) => ({ value: item.getAttribute('value'), checked: item.getAttribute('aria-checked'), role: item.getAttribute('role') })))));
      const focusIs = (locator) => locator.evaluate((item) => new Promise((resolve, reject) => {
        const deadline = performance.now() + 2000;
        const check = () => item === document.activeElement ? resolve(true)
          : performance.now() > deadline ? reject(new Error(`Expected focus on ${item.textContent}`)) : requestAnimationFrame(check);
        check();
      }));
      await focusIs(items.first());
      await page.keyboard.press("End");
      await focusIs(items.last());
      await page.keyboard.press("Home");
      await focusIs(items.first());
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select')?.shadowRoot?.querySelector("mdui-dropdown")?.open === false);
      await input.focus();
      await page.keyboard.press("ArrowDown");
      await items.nth(1).click();
      await page.waitForFunction(() => document.querySelector('[data-fusion-field="settings-user-level"] mdui-select')?.value === "advanced");
      assert.equal(await items.nth(1).getAttribute("aria-checked"), "true");
      await input.click();
      await items.nth(1).click();
      assert.equal(await select.evaluate((element) => element.value), "advanced", `${name}: required current value`);
      await input.click();
      const bounds = await select.evaluate((element) => {
        const menu = element.shadowRoot.querySelector("mdui-menu");
        const box = menu.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, height: innerHeight };
      });
      assert(bounds.left >= -1 && bounds.right <= width + 1 && bounds.top >= 0 && bounds.bottom <= bounds.height + 1, `${name}: ${JSON.stringify(bounds)}`);
      await page.screenshot({ path: path.join(output, `${name}-settings.png`) });
      await page.keyboard.press("Escape");
      const restoredAnchor = await page.evaluate(async () => {
        const { restoreSurfacePopoverAnchorAfterLayout } = await import("/src/sidepanel/surface-scroll-position.ts");
        window.scrollTo(0, document.documentElement.scrollHeight);
        return restoreSurfacePopoverAnchorAfterLayout("settings-user-level");
      });
      assert.equal(restoredAnchor, true, "Existing surface session can locate the adapter field");

      await page.evaluate(async () => {
        const { default: React } = await import("/__qa/react.js");
        const { default: ReactDOM } = await import("/__qa/react-dom-client.js");
        const { FusionSelect, FusionTextField, FusionCheckbox, FusionButton } = await import("/src/sidepanel/components/material-ui/FusionControls.tsx");
        const { useFusionTheme } = await import("/src/sidepanel/components/material-ui/fusion-theme.ts");
        const h = React.createElement;
        document.querySelector("#root").hidden = true;
        const holder = document.createElement("main");
        holder.id = "material-ui-qa";
        holder.style.cssText = "padding:20px;max-width:650px;display:grid;gap:18px";
        document.body.append(holder);
        window.scrollTo(0, 0);
        function Fixture() {
          const ref = React.useRef(null);
          useFusionTheme(ref);
          const [value, setValue] = React.useState("80");
          const [checked, setChecked] = React.useState(false);
          const [status, setStatus] = React.useState("");
          return h("section", { className: "fusion-theme", ref, style: { display: "grid", gap: 18 } },
            h(FusionSelect, { label: "Denied preference", fieldIdPrefix: "rejected", value: "off", onChange: () => { window.__fusionRejectedAttempts = (window.__fusionRejectedAttempts ?? 0) + 1; }, options: [{ value: "off", label: "Off" }, { value: "on", label: "On" }] }),
            h(FusionTextField, { id: "percent", label: "Used percent", value, type: "number", min: 1, max: 100, step: 1, helper: "Independent threshold", onChange: setValue }),
            h(FusionCheckbox, { id: "weekly", checked, onChange: setChecked }, "Weekly quota"),
            h(FusionButton, { id: "fixture-save", onClick: () => setStatus(`${value}:${checked}`) }, "Test command"),
            h(FusionButton, { id: "fixture-disabled", disabled: true, onClick: () => setStatus("unexpected") }, "Disabled command"),
            h(FusionTextField, { id: "untrusted", label: "Untrusted text", value: '<img src="https://invalid.example/sentinel" onerror="window.__unsafeRender=true">', disabled: true, onChange: () => {} }),
            h(FusionSelect, { label: "Untrusted option", fieldIdPrefix: "untrusted-option", value: "literal", disabled: true, onChange: () => {}, options: [{ value: "literal", label: '<img src="https://invalid.example/sentinel">' }] }),
            h("output", { id: "fixture-status" }, status));
        }
        ReactDOM.createRoot(holder).render(h(Fixture));
      });
      const rejected = page.locator('[data-fusion-field="rejected"]');
      await rejected.locator("input:not(.hidden-input)").click();
      await rejected.locator('mdui-menu-item[value="on"]').click();
      await page.waitForFunction(() => document.querySelector('[data-fusion-field="rejected"] mdui-select')?.value === "off");
      await rejected.locator("input:not(.hidden-input)").click();
      await rejected.locator('mdui-menu-item[value="on"]').click();
      assert.equal(await page.evaluate(() => window.__fusionRejectedAttempts), 2, "Rejected selection must remain selectable again");
      const number = page.getByRole("spinbutton", { name: "Used percent" });
      await rejected.locator("input:not(.hidden-input)").click();
      await page.waitForFunction(() => document.activeElement?.matches('[data-fusion-field="rejected"] mdui-menu-item'));
      await page.keyboard.press("Tab");
      assert(await number.evaluate((input) => input.getRootNode().activeElement === input), "Tab exits the menu to the next field");
      await page.keyboard.press("Shift+Tab");
      assert(await rejected.locator("input:not(.hidden-input)").evaluate((input) => input.getRootNode().activeElement === input), "Shift+Tab returns to the trigger");
      await number.fill("92");
      await page.locator("#weekly").click();
      await page.locator("#fixture-save").click();
      assert.equal(await page.locator("#fixture-status").textContent(), "92:true");
      assert.equal(await number.getAttribute("aria-description"), "Independent threshold");
      assert.equal(await page.locator("#material-ui-qa img").count(), 0);
      assert.equal(await page.evaluate(() => window.__unsafeRender), undefined);
      const palettes = await page.evaluate(async () => {
        const { applyThemeSettings } = await import("/src/shared/theme.ts");
        const { syncFusionThemeTokens } = await import("/src/sidepanel/components/material-ui/fusion-theme.ts");
        const scope = document.querySelector("#material-ui-qa .fusion-theme");
        const output = [];
        for (const mode of ["light", "dark", "system", "time"]) {
          for (const preset of ["default", "meadow", "sunset", "custom"]) {
            applyThemeSettings({ themeMode: mode, themePreset: preset, themeCustomSeedHex: "#147d72", uiFontFamily: "serif", motionMode: "reduced" }, document.documentElement,
              { matchMedia: (query) => ({ matches: query.includes("dark") }), now: () => new Date("2026-10-02T22:00:00") });
            syncFusionThemeTokens(scope);
            const styles = getComputedStyle(scope);
            output.push({ mode, preset, resolved: document.documentElement.dataset.themeResolved, primary: styles.getPropertyValue("--mdui-color-primary"), font: styles.getPropertyValue("--mdui-typescale-body-large-font") });
          }
        }
        for (const color of ["#abc", "rgb(12 34 56)", "color-mix(in srgb, #00ff00 50%, #0000ff)"]) {
          scope.style.setProperty("--md-sys-color-primary", color);
          syncFusionThemeTokens(scope);
          output.push({ mode: "css-color", preset: color, primary: getComputedStyle(scope).getPropertyValue("--mdui-color-primary"), font: getComputedStyle(scope).getPropertyValue("--mdui-typescale-body-large-font") });
        }
        return output;
      });
      assert.equal(new Set(palettes.map((item) => item.primary)).size >= 8, true);
      assert(palettes.every((item) => item.font.includes("serif")));
      assert.equal(palettes.find((item) => item.preset === "#abc").primary, "170, 187, 204");
      assert.equal(palettes.find((item) => item.preset === "rgb(12 34 56)").primary, "12, 34, 56");
      const fonts = await page.evaluate(async () => {
        const { applyThemeSettings } = await import("/src/shared/theme.ts");
        const { getUiFontFamilyStack } = await import("/src/shared/ui-font-family.ts");
        const scope = document.querySelector("#material-ui-qa .fusion-theme");
        return ["default", "system", "serif", "mono"].map((font) => {
          applyThemeSettings({ themeMode: "dark", themePreset: "default", uiFontFamily: font, motionMode: "reduced" }, document.documentElement);
          return { font, actual: getComputedStyle(scope).getPropertyValue("--mdui-typescale-body-large-font").trim(), expected: getUiFontFamilyStack(font) };
        });
      });
      assert(fonts.every((row) => row.actual === row.expected), JSON.stringify(fonts));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert(overflow <= 1, `${name}: horizontal overflow ${overflow}`);
      results.push({ name, bounds, palettes: palettes.length, fonts, overflow });
      console.log(`MDUI source gate ${name}: passed`);
    } catch (error) {
      const overflowElements = await page.evaluate(() => {
        const elements = [];
        const visit = (root) => {
          for (const element of root.querySelectorAll('*')) {
            const rect = element.getBoundingClientRect();
            if (rect.width && (rect.right > innerWidth + 1 || rect.left < -1)) elements.push({ tag: element.tagName, part: element.getAttribute('part'), class: element.className, right: rect.right, width: rect.width, minWidth: getComputedStyle(element).minWidth, inlineStyle: element.getAttribute('style') });
            if (element.shadowRoot) visit(element.shadowRoot);
          }
        };
        visit(document);
        return elements;
      });
      await writeFile(path.join(output, `${name}-overflow.json`), JSON.stringify(overflowElements, null, 2));
      await page.screenshot({ path: path.join(output, `${name}-failure.png`), fullPage: true });
      throw error;
    } finally { await page.close(); }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(remoteRequests, []);
} finally {
  await writeFile(path.join(output, "result.json"), JSON.stringify({ engine, systemMotion, browserVersion: browser.version(), results, errors, remoteRequests }, null, 2));
  await browser.close();
  await server.close();
  console.log(`Evidence: ${output}`);
}
