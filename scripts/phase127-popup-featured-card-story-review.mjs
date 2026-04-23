import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase127-popup-featured-card-story-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarios = [
  {
    slug: "mixed-setup",
    expectedSectionLabel: "Needs attention",
    expectedStatusLabel: "Needs setup",
    expectedPrimaryDetail: "Current path still needs stored credentials.",
    expectedSecondarySubstring: "Admin API key required",
  },
  {
    slug: "needs-review",
    expectedSectionLabel: "Needs attention",
    expectedStatusLabel: "Needs review",
    expectedPrimaryDetail:
      "Settings setup is clear, but this provider still needs review.",
    expectedSecondarySubstring: "cursor still needs review.",
  },
  {
    slug: "policy-only",
    expectedSectionLabel: "Current contract",
    expectedStatusLabel: "Contract-only",
    expectedPrimaryDetail: "Current contract is policy-only in this profile.",
    expectedSecondarySubstring: "documented quota policy",
  },
  {
    slug: "healthy",
    expectedSectionLabel: "All clear",
    expectedStatusLabel: "Healthy",
    expectedPrimaryDetail: "Current path is live-ready in this profile.",
    expectedSecondarySubstring: "Current shipped contract",
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

      if (slug === "needs-review") {
        state.providers = state.providers.map((provider) => {
          if (provider.providerId === "cursor") {
            return {
              ...provider,
              syncedAt: "2026-04-20 10:42",
              lastSyncLabel: "Synced just now",
              syncStatus: "error",
              tone: "error",
              warningReason: "cursor still needs review.",
            };
          }

          return normalizeHealthyProvider(provider);
        });

        state.providerSettings = state.providerSettings.map((provider) => ({
          ...provider,
          enabled: provider.id !== "jetbrains",
          status: provider.id !== "jetbrains" ? "granted" : provider.status,
          credentialStatus:
            provider.id === "gemini" ? "not_required" : "configured",
        }));
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

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      featuredSectionLabel:
        document
          .querySelector('[data-theme-local-surface="popup-featured-section-label"]')
          ?.textContent?.trim() ?? null,
      featuredStatus:
        document
          .querySelector('[data-popup-featured-status="true"]')
          ?.textContent?.trim() ?? null,
      featuredPrimary:
        document
          .querySelector('[data-popup-featured-primary="true"]')
          ?.textContent?.trim() ?? null,
      featuredSecondary:
        document
          .querySelector('[data-popup-featured-secondary="true"]')
          ?.textContent?.trim() ?? null,
    };
  });
}

async function reviewScenarioWidth(context, scenario, width) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width, height: 900 });

  console.log(`phase127: ${scenario.slug}@${width}`);
  await seedScenario(page, scenario.slug);
  await page.waitForSelector('[data-popup-featured-primary="true"]');

  const snapshot = await collectPopupSnapshot(page);
  const screenshotPath = path.join(
    artifactDir,
    `${scenario.slug}-${width}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  assert(
    snapshot.horizontalOverflow === 0,
    `${scenario.slug}@${width}: expected no horizontal overflow, got ${snapshot.horizontalOverflow}`,
  );
  assert(
    snapshot.featuredSectionLabel === scenario.expectedSectionLabel,
    `${scenario.slug}@${width}: expected featured section label "${scenario.expectedSectionLabel}", got "${snapshot.featuredSectionLabel}"`,
  );
  assert(
    snapshot.featuredStatus === scenario.expectedStatusLabel,
    `${scenario.slug}@${width}: expected featured status "${scenario.expectedStatusLabel}", got "${snapshot.featuredStatus}"`,
  );
  assert(
    snapshot.featuredPrimary === scenario.expectedPrimaryDetail,
    `${scenario.slug}@${width}: expected primary detail "${scenario.expectedPrimaryDetail}", got "${snapshot.featuredPrimary}"`,
  );
  assert(
    typeof snapshot.featuredSecondary === "string" &&
      snapshot.featuredSecondary.includes(scenario.expectedSecondarySubstring),
    `${scenario.slug}@${width}: expected secondary detail to include "${scenario.expectedSecondarySubstring}", got "${snapshot.featuredSecondary}"`,
  );

  await page.close();

  return {
    scenario: scenario.slug,
    width,
    screenshotPath: path.relative(projectRoot, screenshotPath),
    ...snapshot,
  };
}

async function main() {
  await mkdir(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  try {
    for (const scenario of scenarios) {
      for (const width of widths) {
        results.push(await reviewScenarioWidth(context, scenario, width));
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const resultsPath = path.join(artifactDir, "phase127-results.json");
  await writeFile(resultsPath, `${JSON.stringify(results, null, 2)}\n`);

  console.log(`phase127: wrote ${path.relative(projectRoot, resultsPath)}`);
}

await main();
