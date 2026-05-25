import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";
import { installSafeLocalStorageHelpers } from "./lib/browser-local-storage-helpers.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase126-popup-header-and-summary-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarios = [
  {
    slug: "no-visible",
    expectedHeaderDetail:
      "Start in settings. Once one provider is visible, this popup will summarize live readiness and next steps.",
    expectedSummaryValues: ["0", "0", "0", "0"],
  },
  {
    slug: "mixed-setup",
    expectedHeaderDetail:
      "Use this popup to separate setup blockers from the providers that are already ready.",
    expectedSummaryValues: ["4", "1", "2", "1"],
  },
  {
    slug: "policy-only",
    expectedHeaderDetail:
      "This popup is showing current contract context rather than one live in-browser sync path.",
    expectedSummaryValues: ["1", "0", "0", "1"],
  },
  {
    slug: "healthy",
    expectedHeaderDetail:
      "Use this popup for quick freshness and provider triage without reopening the full dashboard.",
    expectedSummaryValues: ["4", "3", "0", "1"],
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function seedScenario(page, scenarioSlug) {
  await installSafeLocalStorageHelpers(page);
  await page.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction((storageKey) => {
    const result = globalThis.__aiUsageDashboardSafeLocalStorage?.getItem(storageKey);
    return result?.ok && Boolean(result.value);
  }, appStateStorageKey);

  await page.evaluate(
    ({ storageKey, slug }) => {
      const storage = globalThis.__aiUsageDashboardSafeLocalStorage;
      const rawStateResult = storage?.getItem(storageKey) ?? {
        ok: false,
        error: "Safe localStorage helper was not installed.",
      };

      if (!rawStateResult.ok) {
        throw new Error(
          `Unable to read popup preview state: ${rawStateResult.error}`,
        );
      }

      const rawState = rawStateResult.value;

      if (!rawState) {
        throw new Error("Popup preview state was not seeded before scenario setup.");
      }

      const state = JSON.parse(rawState);
      state.settings = {
        ...state.settings,
        locale: "en",
      };
      const normalizeHealthyProvider = (provider) => ({
        ...provider,
        syncedAt: "2026-04-20 10:42",
        lastSyncLabel: "Synced just now",
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      });

      if (slug === "no-visible") {
        state.providerSettings = state.providerSettings.map((provider) => ({
          ...provider,
          enabled: false,
        }));
      }

      if (slug === "mixed-setup") {
        state.providers = state.providers.map((provider) => {
          if (provider.providerId === "claude-code") {
            return {
              ...provider,
              syncStatus: "error",
              tone: "error",
              warningReason: "Admin API key required before live sync can run.",
            };
          }

          if (
            provider.providerId === "cursor" ||
            provider.providerId === "codex"
          ) {
            return normalizeHealthyProvider(provider);
          }

          return provider;
        });

        state.providerSettings = state.providerSettings.map((provider) => {
          if (provider.id === "cursor") {
            return {
              ...provider,
              enabled: true,
              status: "missing",
              credentialStatus: "configured",
            };
          }

          if (provider.id === "claude-code") {
            return {
              ...provider,
              enabled: true,
              status: "granted",
              credentialStatus: "missing",
            };
          }

          if (provider.id === "codex") {
            return {
              ...provider,
              enabled: true,
              status: "granted",
              credentialStatus: "configured",
            };
          }

          if (provider.id === "gemini") {
            return {
              ...provider,
              enabled: true,
              status: "granted",
              credentialStatus: "not_required",
            };
          }

          return {
            ...provider,
            enabled: false,
          };
        });
      }

      if (slug === "policy-only") {
        state.providers = state.providers.map((provider) =>
          normalizeHealthyProvider(provider),
        );

        state.providerSettings = state.providerSettings.map((provider) => ({
          ...provider,
          enabled: provider.id === "gemini",
          status: provider.id === "gemini" ? "granted" : provider.status,
          credentialStatus:
            provider.id === "gemini" ? "not_required" : provider.credentialStatus,
        }));
      }

      if (slug === "healthy") {
        state.providers = state.providers.map((provider) =>
          normalizeHealthyProvider(provider),
        );

        state.providerSettings = state.providerSettings.map((provider) => {
          if (provider.id === "jetbrains") {
            return {
              ...provider,
              enabled: false,
            };
          }

          return {
            ...provider,
            enabled: true,
            status: "granted",
            credentialStatus:
              provider.id === "gemini" ? "not_required" : "configured",
          };
        });
      }

      const writeResult = storage.setItem(storageKey, JSON.stringify(state));

      if (!writeResult.ok) {
        throw new Error(
          `Unable to write popup preview state: ${writeResult.error}`,
        );
      }
    },
    {
      storageKey: appStateStorageKey,
      slug: scenarioSlug,
    },
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const bodyText = document.body?.innerText ?? "";
    const isReady =
      bodyText.includes("Quick glance") || bodyText.includes("快速概览");

    return isReady || bodyText.includes("Popup load failed");
  });
  const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
  assert(
    bodyText.includes("Quick glance") || bodyText.includes("快速概览"),
    `${scenarioSlug}: popup did not return to the ready state after reload`,
  );
}

async function collectPopupSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const headerDetail = document
      .querySelector(".popup-header .supporting-copy")
      ?.textContent?.trim();
    const summaryItems = Array.from(
      document.querySelectorAll(
        '.summary-strip[aria-label="Popup top summary"] .summary-pill',
      ),
    ).map((pill) => ({
      label: pill.querySelector(".summary-pill__label")?.textContent?.trim() ?? null,
      value: pill.querySelector(".summary-pill__value")?.textContent?.trim() ?? null,
    }));

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      headerDetail: headerDetail ?? null,
      summaryItems,
    };
  });
}

async function reviewScenarioWidth(context, scenario, width) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width, height: 900 });

  console.log(`phase126: ${scenario.slug}@${width}`);
  await seedScenario(page, scenario.slug);
  await page.waitForSelector('.summary-strip[aria-label="Popup top summary"]');

  const snapshot = await collectPopupSnapshot(page);
  const screenshotPath = path.join(
    artifactDir,
    `${scenario.slug}-${width}.png`,
  );

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  assert(
    snapshot.horizontalOverflow === 0,
    `${scenario.slug}@${width}: expected no horizontal overflow, received ${snapshot.horizontalOverflow}`,
  );
  assert(
    snapshot.headerDetail === scenario.expectedHeaderDetail,
    `${scenario.slug}@${width}: unexpected header detail ${snapshot.headerDetail}`,
  );
  assert(
    JSON.stringify(snapshot.summaryItems.map((item) => item.label)) ===
      JSON.stringify(["Visible", "Live ready", "Setup blockers", "Policy-only"]),
    `${scenario.slug}@${width}: popup top-summary labels drifted`,
  );
  assert(
    JSON.stringify(snapshot.summaryItems.map((item) => item.value)) ===
      JSON.stringify(scenario.expectedSummaryValues),
    `${scenario.slug}@${width}: unexpected popup top-summary values ${JSON.stringify(snapshot.summaryItems.map((item) => item.value))}`,
  );

  return {
    width,
    screenshotPath,
    ...snapshot,
  };
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const context = await browser.newContext();
    const results = [];

    for (const scenario of scenarios) {
      console.log(`phase126: reviewing ${scenario.slug}`);
      const scenarioResult = {
        scenario: scenario.slug,
        widths: [],
      };

      for (const width of widths) {
        const widthResult = await reviewScenarioWidth(context, scenario, width);
        scenarioResult.widths.push(widthResult);
      }

      results.push(scenarioResult);
    }

    const resultsPath = path.join(artifactDir, "phase126-results.json");
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`phase126: wrote results to ${resultsPath}`);
  } finally {
    await browser.close();
  }
}

await runReview();
