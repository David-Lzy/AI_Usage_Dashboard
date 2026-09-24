import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startSourceQaServer } from "./lib/source-qa-server.mjs";
import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const output = path.join(process.cwd(), ".local", "visual-checks", "codex-local", new Date().toISOString().replaceAll(":", "-"));
const settingsOnly = process.argv.includes("--settings-only");
const popupOnly = process.argv.includes("--popup-only");
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true });
const server = await startSourceQaServer();
const results = [];

async function seed(page, mode, theme) {
  await page.goto(`${server.baseUrl}/package.json`);
  await page.evaluate(async ({ mode, theme }) => {
    const { SAMPLE_APP_STATE } = await import("/src/shared/demo-state.ts");
    const state = structuredClone(SAMPLE_APP_STATE);
    state.settings.userLevel = "basic";
    state.settings.themeMode = theme;
    state.settings.fullPageProgressStyle = mode === "line" ? "line" : "circle";
    state.settings.popupProgressStyle = mode === "line" ? "line" : "circle";
    for (const setting of state.providerSettings) setting.displayEnabled = setting.id === "codex-personal-page";
    const codex = state.providers.find((item) => item.providerId === "codex-personal-page");
    codex.syncSource = "local_companion";
    codex.syncStatus = "ok";
    codex.syncedAt = new Date().toISOString();
    codex.lastSuccessAt = codex.syncedAt;
    codex.used = 40;
    codex.remaining = 60;
    codex.total = 100;
    const weekly = { label: "Weekly limit", normalizedLabel: "Weekly limit", kind: "weekly", modelLabel: null, quotaUnit: "percent", used: 40, remaining: 60, total: 100, resetAt: "2026-09-30T10:00:00.000Z", resetLabel: null };
    const five = { label: "5-hour limit", normalizedLabel: "5-hour limit", kind: "rolling_5h", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: "2026-09-24T15:00:00.000Z", resetLabel: null };
    codex.usageWindows = mode === "single" ? [weekly] : [five, weekly];
    codex.codexLocal = { availableResetCount: 0, accountVerified: true, estimates: mode === "single" ? [{ windowId: "primary", status: "ready", fullUsd: 200, fullLowerUsd: 190, fullUpperUsd: 210, currentUsd: 80, sampleCount: 4, confidence: "medium", priceDate: "2026-09-24" }] : [{ windowId: "primary", status: "learning", fullUsd: null, fullLowerUsd: null, fullUpperUsd: null, currentUsd: null, sampleCount: 0, confidence: null, priceDate: null }, { windowId: "secondary", status: "ready", fullUsd: 200, fullLowerUsd: 190, fullUpperUsd: 210, currentUsd: 80, sampleCount: 4, confidence: "medium", priceDate: "2026-09-24" }] };
    localStorage.setItem("ai-usage-dashboard.app-state", JSON.stringify(state));
    localStorage.setItem("ai-usage-dashboard.store-screenshot-seed-lock", "true");
  }, { mode, theme });
}

try {
  await mkdir(output, { recursive: true });
  for (const locale of settingsOnly || popupOnly ? [] : SUPPORTED_RDP_CAPTURE_LOCALES) {
    for (const mode of ["single", "dual", "line"]) {
      for (const theme of ["light", "dark"]) {
        for (const width of [360, 720]) {
          const page = await browser.newPage({ viewport: { width, height: 900 } });
          try {
            await seed(page, mode, theme);
            const route = `/src/sidepanel/index.html?surface=full-page&app-locale=${encodeURIComponent(locale)}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#provider-detail/codex-personal-page`;
            await page.goto(`${server.baseUrl}${route}`);
            await page.locator(".codex-estimate-strip").waitFor({ timeout: 10_000 });
            await page.locator(".codex-progress-group").scrollIntoViewIfNeeded();
            await page.evaluate(async () => { await document.fonts.ready; });
            await page.waitForFunction(() => {
              let element = document.querySelector(".codex-progress-group");
              if (!element) return false;
              let opacity = 1;
              while (element instanceof Element) {
                opacity *= Number.parseFloat(getComputedStyle(element).opacity) || 0;
                element = element.parentElement;
              }
              return opacity >= 0.95;
            }, undefined, { timeout: 10_000 });
            const check = await page.locator(".codex-progress-group").evaluate((group) => {
              const metrics = [...group.querySelectorAll(".codex-estimate-strip__metric")];
              const rect = group.getBoundingClientRect();
              return {
                groupWidth: Math.round(rect.width),
                metrics: metrics.length,
                overflow: group.scrollWidth > group.clientWidth + 1 || metrics.some((metric) => metric.scrollWidth > metric.clientWidth + 1),
                single: group.classList.contains("codex-progress-group--single-ring"),
                status: group.querySelector(".codex-estimate-strip")?.getAttribute("data-codex-estimate-status"),
                text: group.textContent ?? "",
                direction: getComputedStyle(group).direction,
              };
            });
            if (check.metrics !== 3 || check.overflow || check.single !== (mode === "single") || check.direction !== (locale === "ar" ? "rtl" : "ltr")) throw new Error(`${locale}/${mode}/${theme}/${width}: ${JSON.stringify(check)}`);
            if (mode === "single" && check.status !== "ready") throw new Error(`${locale}/${mode}/${theme}/${width}: priced value missing`);
            results.push({ locale, mode, theme, width, metrics: check.metrics, overflow: check.overflow });
            if (["en", "zh-CN", "ja", "de", "ar"].includes(locale)) {
              await page.locator(".codex-progress-group").screenshot({ path: path.join(output, `${locale}-${mode}-${theme}-${width}.png`) });
            }
          } finally { await page.close(); }
        }
      }
    }
  }
  for (const locale of popupOnly ? [] : SUPPORTED_RDP_CAPTURE_LOCALES) {
    for (const theme of ["light", "dark"]) {
      for (const width of [360, 720]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        try {
          await seed(page, "single", theme);
          await page.goto(`${server.baseUrl}/src/sidepanel/index.html?surface=full-page&app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}#settings`);
          const section = page.locator("[data-codex-local-settings]");
          await section.waitFor({ timeout: 10_000 });
          await section.evaluate((element) => {
            window.scrollTo({ top: Math.max(0, element.getBoundingClientRect().top + window.scrollY - 320), behavior: "instant" });
          });
          await page.waitForFunction(() => {
            let element = document.querySelector("[data-codex-local-settings]");
            let opacity = 1;
            while (element instanceof Element) {
              opacity *= Number.parseFloat(getComputedStyle(element).opacity) || 0;
              element = element.parentElement;
            }
            return opacity >= 0.95;
          });
          const check = await section.evaluate((element) => ({
            inputs: element.querySelectorAll("input").length,
            mode: element.querySelector(".material-select")?.textContent ?? "",
            overflow: element.scrollWidth > element.clientWidth + 1,
            guideOpen: element.querySelector("[data-codex-local-setup]")?.open ?? false,
            commandVisible: element.querySelector("[data-codex-local-setup] code")?.textContent?.includes("ABSOLUTE_CODEX_HOME_PATH") ?? false,
            commandOverflow: (() => {
              const command = element.querySelector("[data-codex-local-setup] pre");
              return command ? command.scrollWidth > command.clientWidth + 1 : true;
            })(),
            top: element.getBoundingClientRect().top,
          }));
          if (check.inputs !== 2 || !check.mode || check.overflow || !check.guideOpen || !check.commandVisible || check.commandOverflow || check.top < 250) throw new Error(`settings/${locale}/${theme}/${width}: ${JSON.stringify(check)}`);
          await section.screenshot({ path: path.join(output, `settings-${locale}-${theme}-${width}.png`) });
          results.push({ locale, mode: "settings", theme, width, overflow: check.overflow });
        } finally { await page.close(); }
      }
    }
  }
  const popupScenarios = ["en", "ar"].flatMap((locale) => ["single", "dual", "line"].flatMap((mode) => ["light", "dark"].flatMap((theme) => [360, 720].map((width) => ({ locale, mode, theme, width })))));
  for (const { locale, mode, theme, width } of settingsOnly ? [] : popupScenarios) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await seed(page, mode, theme);
      await page.goto(`${server.baseUrl}/src/popup/index.html?app-locale=${locale}&app-dir=${locale === "ar" ? "rtl" : "ltr"}`);
      const group = page.locator(".codex-progress-group").first();
      await group.waitFor({ timeout: 10_000 });
      await group.scrollIntoViewIfNeeded();
      await page.evaluate(async () => { await document.fonts.ready; });
      const check = await group.evaluate((element) => ({
        metrics: element.querySelectorAll(".codex-estimate-strip__metric").length,
        single: element.classList.contains("codex-progress-group--single-ring"),
        overflow: element.scrollWidth > element.clientWidth + 1,
        direction: getComputedStyle(element).direction,
      }));
      if (check.metrics !== 3 || check.single !== (mode === "single") || check.overflow || check.direction !== (locale === "ar" ? "rtl" : "ltr")) throw new Error(`popup/${locale}/${mode}/${theme}/${width}: ${JSON.stringify(check)}`);
      await group.screenshot({ path: path.join(output, `popup-${locale}-${mode}-${theme}-${width}.png`) });
      results.push({ locale, mode: `popup-${mode}`, theme, width, overflow: check.overflow });
    } finally { await page.close(); }
  }
  await writeFile(path.join(output, "report.json"), JSON.stringify({ checks: results.length, results }, null, 2));
  console.log(`codex-local-ui: ${results.length} synthetic layout checks passed; ${output}`);
} finally {
  await browser.close();
  await server.close();
}
