import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";
import { installSafeLocalStorageHelpers } from "./lib/browser-local-storage-helpers.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase124-popup-top-stack-density-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarios = [
  {
    slug: "no-visible",
    expectedTopStackCount: 2,
    expectsGuidance: true,
    expectsSnapshot: false,
    expectedSetupStage: "Start setup",
  },
  {
    slug: "mixed-setup",
    expectedTopStackCount: 3,
    expectsGuidance: true,
    expectsSnapshot: true,
    expectedSetupStage: "Needs setup",
    expectedSnapshotDetail:
      "Newest visible snapshot: Cursor (Synced just now). Oldest visible snapshot: Claude Code (Analytics snapshot 34m ago).",
  },
  {
    slug: "policy-only",
    expectedTopStackCount: 3,
    expectsGuidance: true,
    expectsSnapshot: true,
    expectedSetupStage: "Contract-only",
    expectedSnapshotDetail: "The visible provider shares the same cached snapshot window.",
  },
  {
    slug: "healthy",
    expectedTopStackCount: 2,
    expectsGuidance: false,
    expectsSnapshot: true,
    expectedSetupStage: "Ready",
    expectedSnapshotDetail:
      "All 4 visible providers share the same cached snapshot window.",
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
    const guidanceCard = document.querySelector(
      '[data-theme-local-surface="popup-guidance-card"]',
    );
    const setupCard = document.querySelector(
      '[data-theme-local-surface="popup-setup-coverage-card"]',
    );
    const snapshotCard = document.querySelector(
      '[data-theme-local-surface="popup-snapshot-status-card"]',
    );
    const topStackCards = [guidanceCard, setupCard, snapshotCard].filter(Boolean);

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      topStackCount: topStackCards.length,
      guidanceVisible: Boolean(guidanceCard),
      snapshotVisible: Boolean(snapshotCard),
      setupStageLabel:
        document
          .querySelector("[data-popup-setup-coverage-stage] .status-chip")
          ?.textContent?.trim() ?? null,
      snapshotDetail:
        snapshotCard?.querySelector(".supporting-copy")?.textContent?.trim() ?? null,
    };
  });
}

async function reviewScenarioWidth(context, scenario, width) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width, height: 900 });

  console.log(`phase124: ${scenario.slug}@${width}`);
  await seedScenario(page, scenario.slug);
  await page.waitForSelector("[data-popup-setup-coverage-stage] .status-chip");

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
    snapshot.topStackCount === scenario.expectedTopStackCount,
    `${scenario.slug}@${width}: unexpected top-stack card count ${snapshot.topStackCount}`,
  );
  assert(
    snapshot.guidanceVisible === scenario.expectsGuidance,
    `${scenario.slug}@${width}: expected guidance visible=${scenario.expectsGuidance}, received ${snapshot.guidanceVisible}`,
  );
  assert(
    snapshot.snapshotVisible === scenario.expectsSnapshot,
    `${scenario.slug}@${width}: expected snapshot visible=${scenario.expectsSnapshot}, received ${snapshot.snapshotVisible}`,
  );
  assert(
    snapshot.setupStageLabel === scenario.expectedSetupStage,
    `${scenario.slug}@${width}: unexpected setup stage ${snapshot.setupStageLabel}`,
  );

  if (scenario.expectedSnapshotDetail) {
    assert(
      snapshot.snapshotDetail === scenario.expectedSnapshotDetail,
      `${scenario.slug}@${width}: unexpected snapshot detail ${snapshot.snapshotDetail}`,
    );
    assert(
      !snapshot.snapshotDetail.includes("Visible providers are currently healthy.") &&
        !snapshot.snapshotDetail.includes("Visible providers still need review.") &&
        !snapshot.snapshotDetail.includes(
          "At least one visible provider currently has a sync issue.",
        ),
      `${scenario.slug}@${width}: snapshot detail still repeats status language`,
    );
  } else {
    assert(
      snapshot.snapshotDetail === null,
      `${scenario.slug}@${width}: expected no snapshot detail, received ${snapshot.snapshotDetail}`,
    );
  }

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
      console.log(`phase124: reviewing ${scenario.slug}`);
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

    const resultsPath = path.join(artifactDir, "phase124-results.json");
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`phase124: wrote results to ${resultsPath}`);
  } finally {
    await browser.close();
  }
}

await runReview();
