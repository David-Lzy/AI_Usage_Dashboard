import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";
import { installSafeLocalStorageHelpers } from "./lib/browser-local-storage-helpers.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase122-popup-setup-summary-width-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarios = [
  {
    slug: "no-visible",
    expectedValues: ["0", "0", "0", "0"],
    expectedGuidanceHeadline: "Enable a provider in settings",
    expectedFeaturedLabel: "Provider triage",
    expectedSetupHeadline: "No visible providers configured",
    expectsGuidance: true,
  },
  {
    slug: "mixed-setup",
    expectedValues: ["1", "1", "1", "1"],
    expectedGuidanceHeadline: "Grant access for Cursor",
    expectedFeaturedLabel: "Needs attention",
    expectedSetupHeadline: "4 visible providers",
    expectsGuidance: true,
  },
  {
    slug: "healthy",
    expectedValues: ["3", "0", "0", "1"],
    expectedGuidanceHeadline: null,
    expectedFeaturedLabel: "All clear",
    expectedSetupHeadline: "4 visible providers",
    expectsGuidance: false,
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
    const setupCard = document.querySelector(
      '[data-theme-local-surface="popup-setup-coverage-card"]',
    );
    const setupGrid = document.querySelector(
      '.summary-strip[aria-label="Popup setup coverage"]',
    );
    const featuredSectionLabel = document.querySelector(
      '[data-theme-local-surface="popup-featured-section-label"]',
    );
    const guidanceHeadline = document.querySelector(
      '[data-theme-local-surface="popup-guidance-card"] .section-title',
    );
    const gridStyles = setupGrid ? getComputedStyle(setupGrid) : null;
    const setupItems = Array.from(
      document.querySelectorAll(
        '.summary-strip[aria-label="Popup setup coverage"] .summary-pill',
      ),
    ).map((pill) => {
      const label = pill.querySelector(".summary-pill__label");
      const value = pill.querySelector(".summary-pill__value");

      return {
        label: label?.textContent?.trim() ?? null,
        value: value?.textContent?.trim() ?? null,
        tone: pill.getAttribute("data-summary-tone"),
      };
    });

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      setupHeadline:
        setupCard?.querySelector(".section-title")?.textContent?.trim() ?? null,
      setupDetail:
        document
          .querySelector("[data-popup-setup-coverage-detail]")
          ?.textContent?.trim() ?? null,
      guidanceHeadline: guidanceHeadline?.textContent?.trim() ?? null,
      guidancePresent: Boolean(guidanceHeadline),
      featuredLabel: featuredSectionLabel?.textContent?.trim() ?? null,
      setupGridColumns: gridStyles
        ? gridStyles.gridTemplateColumns.split(" ").filter(Boolean).length
        : 0,
      setupItems,
    };
  });
}

async function reviewScenarioWidth(context, scenario, width) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width, height: 900 });

  console.log(`phase122: ${scenario.slug}@${width}`);
  await seedScenario(page, scenario.slug);

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
    snapshot.setupGridColumns === 2,
    `${scenario.slug}@${width}: expected 2 setup-coverage columns, received ${snapshot.setupGridColumns}`,
  );
  assert(
    snapshot.setupHeadline === scenario.expectedSetupHeadline,
    `${scenario.slug}@${width}: unexpected setup headline ${snapshot.setupHeadline}`,
  );
  assert(
    snapshot.featuredLabel === scenario.expectedFeaturedLabel,
    `${scenario.slug}@${width}: unexpected featured label ${snapshot.featuredLabel}`,
  );
  assert(
    snapshot.guidancePresent === scenario.expectsGuidance,
    `${scenario.slug}@${width}: expected guidance present=${scenario.expectsGuidance}, received ${snapshot.guidancePresent}`,
  );

  if (scenario.expectedGuidanceHeadline) {
    assert(
      snapshot.guidanceHeadline === scenario.expectedGuidanceHeadline,
      `${scenario.slug}@${width}: unexpected guidance headline ${snapshot.guidanceHeadline}`,
    );
  }

  assert(
    JSON.stringify(snapshot.setupItems.map((item) => item.label)) ===
      JSON.stringify([
        "Live ready",
        "Host access",
        "Credentials",
        "Policy-only",
      ]),
    `${scenario.slug}@${width}: setup-coverage labels drifted`,
  );
  assert(
    JSON.stringify(snapshot.setupItems.map((item) => item.value)) ===
      JSON.stringify(scenario.expectedValues),
    `${scenario.slug}@${width}: unexpected setup-coverage values ${JSON.stringify(snapshot.setupItems.map((item) => item.value))}`,
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
      console.log(`phase122: reviewing ${scenario.slug}`);
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

    const resultsPath = path.join(artifactDir, "phase122-results.json");
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`phase122: wrote results to ${resultsPath}`);
  } finally {
    await browser.close();
  }
}

await runReview();
