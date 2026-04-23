import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase112-theme-recovery-review-workspace-review",
);
const reviewUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review";
const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
const customSeedHex = "#4F46E5";

const scenarios = [
  {
    slug: "light-degraded-isolated",
    themeMode: "light",
    expectedResolved: "light",
    cursorPermission: "missing",
    codexPermission: "missing",
    extraVisibleProviders: [],
    expected: {
      overallLabel: "Needs access",
      popupLabel: "Mixed state",
      badgeText: "2",
      scopeLabel: "Cursor + Codex isolated",
      cursorRecovery: "Needs access",
      codexRecovery: "Needs access",
    },
  },
  {
    slug: "dark-recovered-isolated",
    themeMode: "dark",
    expectedResolved: "dark",
    cursorPermission: "granted",
    codexPermission: "granted",
    extraVisibleProviders: [],
    expected: {
      overallLabel: "Recovered",
      popupLabel: "Aligned",
      badgeText: "cleared",
      scopeLabel: "Cursor + Codex isolated",
      cursorRecovery: "Healthy",
      codexRecovery: "Healthy",
    },
  },
  {
    slug: "light-recovered-extra-provider",
    themeMode: "light",
    expectedResolved: "light",
    cursorPermission: "granted",
    codexPermission: "granted",
    extraVisibleProviders: ["claude-code"],
    expected: {
      overallLabel: "Needs scope cleanup",
      popupLabel: "Mixed state",
      badgeText: "1",
      scopeLabel: "Additional providers visible",
      cursorRecovery: "Healthy",
      codexRecovery: "Healthy",
    },
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForWorkspace(page) {
  await page.goto(reviewUrl, { waitUntil: "load" });
  await page.waitForSelector("[data-theme-recovery-page='true']");
  await page.waitForSelector("[data-theme-recovery-summary-draft]");
}

async function seedScenario(page, scenario) {
  await page.evaluate(
    ({ appKey, themeMode, customSeedHex: seedHex, cursorPermission, codexPermission, extraVisibleProviders }) => {
      const rawState = localStorage.getItem(appKey);

      if (!rawState) {
        throw new Error("Theme recovery review storage was not initialized.");
      }

      const state = JSON.parse(rawState);
      const visibleProviders = new Set(["cursor", "codex", ...extraVisibleProviders]);

      state.settings.themeMode = themeMode;
      state.settings.themePreset = "custom";
      state.settings.themeCustomSeedHex = seedHex;

      state.providerSettings = state.providerSettings.map((provider) => {
        const next = { ...provider };

        next.enabled = visibleProviders.has(provider.id);

        if (provider.id === "cursor") {
          next.status = cursorPermission;
          next.sourcePreference = "session_page";
        } else if (provider.id === "codex") {
          next.status = codexPermission;
          next.sourcePreference = "session_page";
        }

        return next;
      });

      state.providers = state.providers.map((provider) => {
        if (provider.providerId === "cursor") {
          return {
            ...provider,
            syncSource: "page_parse",
            syncStatus: "ok",
            tone: "neutral",
            syncedAt: "2026-04-23 13:20",
            lastSyncLabel: "Synced 1m ago",
            warningReason:
              cursorPermission === "missing"
                ? "Host access missing for the personal usage page."
                : null,
          };
        }

        if (provider.providerId === "codex") {
          return {
            ...provider,
            syncSource: "page_parse",
            syncStatus: "ok",
            tone: "neutral",
            syncedAt: "2026-04-23 13:20",
            lastSyncLabel: "Synced 1m ago",
            warningReason:
              codexPermission === "missing"
                ? "Host access missing for the personal usage page."
                : null,
          };
        }

        return provider;
      });

      localStorage.setItem(appKey, JSON.stringify(state));
    },
    {
      appKey: APP_STATE_STORAGE_KEY,
      themeMode: scenario.themeMode,
      customSeedHex,
      cursorPermission: scenario.cursorPermission,
      codexPermission: scenario.codexPermission,
      extraVisibleProviders: [...scenario.extraVisibleProviders],
    },
  );
}

async function waitForScenario(page, scenario) {
  await page.waitForFunction(
    ({ expected }) => {
      const text = (selector) =>
        document.querySelector(selector)?.textContent?.trim() ?? "";

      return (
        document.documentElement.dataset.themeMode === expected.themeMode &&
        document.documentElement.dataset.themePreset === "custom" &&
        document.documentElement.dataset.themeResolved === expected.themeResolved &&
        document.documentElement.dataset.themeCustomSeedHex === expected.seed &&
        text("[data-theme-recovery-overall-label]") === expected.overallLabel &&
        text("[data-theme-recovery-popup-label]") === expected.popupLabel &&
        text("[data-theme-recovery-badge-text]") === expected.badgeText &&
        text("[data-theme-recovery-scope-label]") === expected.scopeLabel &&
        text("[data-theme-recovery-provider='cursor'] .status-chip") ===
          expected.cursorRecovery &&
        text("[data-theme-recovery-provider='codex'] .status-chip") ===
          expected.codexRecovery
      );
    },
    {
      expected: {
        themeMode: scenario.themeMode,
        themeResolved: scenario.expectedResolved,
        seed: customSeedHex,
        ...scenario.expected,
      },
    },
  );
}

async function readWorkspaceSnapshot(page) {
  return page.evaluate(() => {
    const text = (selector) =>
      document.querySelector(selector)?.textContent?.trim() ?? null;

    const href = (selector) =>
      document.querySelector(selector)?.getAttribute("href") ?? null;

    return {
      themeMode: document.documentElement.dataset.themeMode ?? null,
      themePreset: document.documentElement.dataset.themePreset ?? null,
      themeResolved: document.documentElement.dataset.themeResolved ?? null,
      themeCustomSeedHex:
        document.documentElement.dataset.themeCustomSeedHex ?? null,
      overallLabel: text("[data-theme-recovery-overall-label]"),
      popupLabel: text("[data-theme-recovery-popup-label]"),
      badgeText: text("[data-theme-recovery-badge-text]"),
      scopeLabel: text("[data-theme-recovery-scope-label]"),
      cursorRecovery: text("[data-theme-recovery-provider='cursor'] .status-chip"),
      codexRecovery: text("[data-theme-recovery-provider='codex'] .status-chip"),
      summaryDraft: text("[data-theme-recovery-summary-draft]"),
      links: {
        settings: href("[data-theme-recovery-link='settings']"),
        dashboard: href("[data-theme-recovery-link='dashboard']"),
        cursorDetail: href("[data-theme-recovery-link='cursor-detail']"),
        codexDetail: href("[data-theme-recovery-link='codex-detail']"),
        popup: href("[data-theme-recovery-link='popup']"),
        cursorVendor: href(
          "[data-theme-recovery-vendor-link='cursor-session-page']",
        ),
        codexVendor: href(
          "[data-theme-recovery-vendor-link='codex-session-page']",
        ),
      },
    };
  });
}

async function runThemeRecoveryWorkspaceReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const context = await browser.newContext({
      colorScheme: "light",
      viewport: {
        width: 1440,
        height: 1600,
      },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);

    await waitForWorkspace(page);

    const results = [];

    for (const scenario of scenarios) {
      console.log(`phase112: seeding ${scenario.slug}`);
      await seedScenario(page, scenario);
      await page.reload({ waitUntil: "load" });
      await page.waitForSelector("[data-theme-recovery-page='true']");
      await waitForScenario(page, scenario);

      const snapshot = await readWorkspaceSnapshot(page);

      assert(
        snapshot.links.settings?.endsWith("./index.html#settings"),
        `${scenario.slug}: settings link did not stay bound to the shipped route.`,
      );
      assert(
        snapshot.links.popup?.endsWith("../popup/index.html"),
        `${scenario.slug}: popup link did not stay bound to the shipped popup route.`,
      );
      assert(
        snapshot.links.cursorVendor === "https://cursor.com/dashboard/usage",
        `${scenario.slug}: Cursor vendor link drifted.`,
      );
      assert(
        snapshot.links.codexVendor ===
          "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        `${scenario.slug}: Codex vendor link drifted.`,
      );
      assert(
        snapshot.summaryDraft?.includes(`Review stage: ${scenario.expected.overallLabel}`),
        `${scenario.slug}: summary draft did not include the expected review stage.`,
      );

      const screenshotPath = path.join(artifactDir, `${scenario.slug}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      results.push({
        scenario: scenario.slug,
        snapshot,
        screenshot: path.relative(projectRoot, screenshotPath),
      });
    }

    const resultsPath = path.join(artifactDir, "phase112-results.json");
    await writeFile(
      resultsPath,
      `${JSON.stringify(
        {
          reviewedAt: new Date().toISOString(),
          reviewUrl,
          customSeedHex,
          scenarioCount: results.length,
          results,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    console.log(
      `phase112: wrote ${path.relative(projectRoot, resultsPath)} with ${results.length} scenarios`,
    );
  } finally {
    await browser.close();
  }
}

void runThemeRecoveryWorkspaceReview().catch((error) => {
  console.error("phase112: failed");
  console.error(error);
  process.exitCode = 1;
});
