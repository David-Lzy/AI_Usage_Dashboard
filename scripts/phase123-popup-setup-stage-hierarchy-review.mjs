import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase123-popup-setup-stage-hierarchy-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarios = [
  {
    slug: "no-visible",
    expectedStageLabel: "Start setup",
    expectedStageTone: "warning",
    expectedHeadline: "No visible providers configured",
    expectedDetail:
      "Enable one provider in settings first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
  },
  {
    slug: "mixed-setup",
    expectedStageLabel: "Needs setup",
    expectedStageTone: "warning",
    expectedHeadline: "4 visible providers",
    expectedDetail:
      "Finish settings setup before treating this popup as ready. 1 provider needs host access. 1 provider needs credentials.",
  },
  {
    slug: "policy-only",
    expectedStageLabel: "Contract-only",
    expectedStageTone: "neutral",
    expectedHeadline: "1 visible provider",
    expectedDetail:
      "Visible providers are configured, but their current contract is policy-only rather than one live in-browser path.",
  },
  {
    slug: "healthy",
    expectedStageLabel: "Ready",
    expectedStageTone: "neutral",
    expectedHeadline: "4 visible providers",
    expectedDetail: "3 providers are live-ready. 1 provider is policy-only.",
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function seedScenario(page, scenarioSlug) {
  await page.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Quick glance");

  await page.evaluate(
    ({ storageKey, slug }) => {
      const rawState = globalThis.localStorage.getItem(storageKey);

      if (!rawState) {
        throw new Error("Popup preview state was not seeded before scenario setup.");
      }

      const state = JSON.parse(rawState);
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

      globalThis.localStorage.setItem(storageKey, JSON.stringify(state));
    },
    {
      storageKey: appStateStorageKey,
      slug: scenarioSlug,
    },
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const bodyText = document.body?.innerText ?? "";

    return (
      bodyText.includes("Quick glance") || bodyText.includes("Popup load failed")
    );
  });
  const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
  assert(
    bodyText.includes("Quick glance"),
    `${scenarioSlug}: popup did not return to the ready state after reload`,
  );
}

async function collectPopupSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const stageChip = document.querySelector(
      "[data-popup-setup-coverage-stage] .status-chip",
    );

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      stageLabel: stageChip?.textContent?.trim() ?? null,
      stageClassName: stageChip?.className ?? "",
      setupHeadline:
        document
          .querySelector('[data-theme-local-surface="popup-setup-coverage-card"] .section-title')
          ?.textContent?.trim() ?? null,
      setupDetail:
        document
          .querySelector("[data-popup-setup-coverage-detail]")
          ?.textContent?.trim() ?? null,
    };
  });
}

async function reviewScenarioWidth(context, scenario, width) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width, height: 900 });

  console.log(`phase123: ${scenario.slug}@${width}`);
  await seedScenario(page, scenario.slug);
  await page.waitForSelector("[data-popup-setup-coverage-stage] .status-chip");
  await page.waitForSelector("[data-popup-setup-coverage-detail]");

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
    snapshot.stageLabel === scenario.expectedStageLabel,
    `${scenario.slug}@${width}: unexpected stage label ${snapshot.stageLabel}`,
  );
  assert(
    snapshot.stageClassName.includes(`status-chip--${scenario.expectedStageTone}`),
    `${scenario.slug}@${width}: unexpected stage tone class ${snapshot.stageClassName}`,
  );
  assert(
    snapshot.setupHeadline === scenario.expectedHeadline,
    `${scenario.slug}@${width}: unexpected setup headline ${snapshot.setupHeadline}`,
  );
  assert(
    snapshot.setupDetail === scenario.expectedDetail,
    `${scenario.slug}@${width}: unexpected setup detail ${snapshot.setupDetail}`,
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
      console.log(`phase123: reviewing ${scenario.slug}`);
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

    const resultsPath = path.join(artifactDir, "phase123-results.json");
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`phase123: wrote results to ${resultsPath}`);
  } finally {
    await browser.close();
  }
}

await runReview();
