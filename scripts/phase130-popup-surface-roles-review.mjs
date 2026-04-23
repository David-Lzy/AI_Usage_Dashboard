import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase130-popup-surface-roles-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarios = [
  {
    slug: "no-visible",
    expectedHeadline: "Settings owns setup",
    expectedDetail:
      "Use settings to enable providers, grant host access, and add credentials. The dashboard becomes useful after at least one provider is visible.",
    expectSnapshotStatus: false,
  },
  {
    slug: "mixed-setup",
    expectedHeadline: "Settings owns setup",
    expectedDetail:
      "Use settings for provider toggles, host access, and stored credentials. The popup stays a quick triage layer until setup is clear.",
    expectSnapshotStatus: true,
  },
  {
    slug: "needs-review",
    expectedHeadline: "Provider detail owns review",
    expectedDetail:
      "Use provider detail for one provider's current path and health after setup is already clear. Dashboard stays the broader multi-provider surface.",
    expectSnapshotStatus: true,
  },
  {
    slug: "policy-only",
    expectedHeadline: "Dashboard owns contract review",
    expectedDetail:
      "Use dashboard for broader contract context across visible providers. Settings still owns provider controls and stored credentials.",
    expectSnapshotStatus: true,
  },
  {
    slug: "healthy",
    expectedHeadline: "Popup stays quick glance",
    expectedDetail:
      "Use dashboard for broader multi-provider context, settings for controls, and provider detail only when you need one provider's deeper contract and health.",
    expectSnapshotStatus: true,
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
        state.providers = state.providers.map((provider) =>
          normalizeHealthyProvider(provider),
        );
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

async function collectSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const surfaceRolesCard = document.querySelector(
      '[data-theme-local-surface="popup-contract-card"]',
    );

    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      label:
        surfaceRolesCard?.querySelector(".section-label")?.textContent?.trim() ??
        null,
      headline:
        document
          .querySelector('[data-popup-surface-roles-headline="true"]')
          ?.textContent?.trim() ?? null,
      detail:
        document
          .querySelector('[data-popup-surface-roles-detail="true"]')
          ?.textContent?.trim() ?? null,
      snapshotVisible: Boolean(
        document.querySelector(
          '[data-theme-local-surface="popup-snapshot-status-card"]',
        ),
      ),
      bodyText: document.body?.innerText ?? "",
    };
  });
}

async function reviewScenarioWidth(context, scenario, width) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.setViewportSize({ width, height: 900 });

  console.log(`phase130: ${scenario.slug}@${width}`);
  await seedScenario(page, scenario.slug);
  await page.waitForSelector('[data-popup-surface-roles-headline="true"]');

  const snapshot = await collectSnapshot(page);
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
    snapshot.label === "Surface roles",
    `${scenario.slug}@${width}: expected "Surface roles" label, got "${snapshot.label}"`,
  );
  assert(
    snapshot.headline === scenario.expectedHeadline,
    `${scenario.slug}@${width}: expected headline "${scenario.expectedHeadline}", got "${snapshot.headline}"`,
  );
  assert(
    snapshot.detail === scenario.expectedDetail,
    `${scenario.slug}@${width}: expected detail "${scenario.expectedDetail}", got "${snapshot.detail}"`,
  );
  assert(
    snapshot.snapshotVisible === scenario.expectSnapshotStatus,
    `${scenario.slug}@${width}: expected snapshot visible=${scenario.expectSnapshotStatus}, got ${snapshot.snapshotVisible}`,
  );
  assert(
    !snapshot.bodyText.includes("Popup Contract"),
    `${scenario.slug}@${width}: old static popup contract copy is still visible`,
  );
  assert(
    !snapshot.detail.includes("Current shipped contract"),
    `${scenario.slug}@${width}: surface-roles detail still replays side-panel contract prose`,
  );

  await page.close();

  return {
    scenario: scenario.slug,
    width,
    screenshotPath: path.relative(projectRoot, screenshotPath),
    horizontalOverflow: snapshot.horizontalOverflow,
    label: snapshot.label,
    headline: snapshot.headline,
    detail: snapshot.detail,
    snapshotVisible: snapshot.snapshotVisible,
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

  const resultsPath = path.join(artifactDir, "phase130-results.json");
  await writeFile(resultsPath, `${JSON.stringify(results, null, 2)}\n`);

  console.log(`phase130: wrote ${path.relative(projectRoot, resultsPath)}`);
}

await main();
