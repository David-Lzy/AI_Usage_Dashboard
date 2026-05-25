import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

import { installSafeLocalStorageHelpers } from "./browser-local-storage-helpers.mjs";

const projectRoot = process.cwd();
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const appStateStorageKey = "ai-usage-dashboard.app-state";
const widths = [360, 420];

const scenarioExpectations = [
  {
    slug: "no-visible",
    featuredCardCount: 0,
    summaryValues: ["0", "0", "0", "0"],
    setupStageLabel: "Start setup",
    setupHeadline: "No visible providers configured",
    setupDetailIncludes: "Settings > Quick Setup",
    guidanceActionLabel: "Open Quick Setup",
    actionSectionLabel: "Other route",
    actionButtons: ["Open dashboard"],
    surfaceHeadline: "Settings owns setup",
    featuredSectionLabel: "Provider triage",
  },
  {
    slug: "mixed-setup",
    featuredCardCount: 4,
    firstProviderLabel: "Cursor Personal",
    firstStatusLabel: "Needs access",
    firstActionLabel: "Open settings",
    firstPrimaryIncludes: "blocked on host access",
    firstSecondaryIncludes: "Chrome host permission",
    firstChipCount: 2,
    firstHasProgress: false,
  },
  {
    slug: "needs-review",
    featuredCardCount: 3,
    firstProviderLabel: "Cursor Personal",
    firstStatusLabel: "Sync issue",
    firstActionLabel: "Details",
    firstPrimaryIncludes: "live-ready",
    firstSecondaryIncludes: "Window only",
    firstChipCount: 2,
    firstHasProgress: false,
  },
  {
    slug: "policy-only",
    featuredCardCount: 1,
    firstProviderLabel: "Gemini Code Assist",
    firstStatusLabel: "Contract-only",
    firstActionLabel: "Open settings",
    firstPrimaryIncludes: "policy-only",
    firstSecondaryIncludes: "Remaining: Policy",
    firstChipCount: 2,
    firstHasProgress: false,
  },
  {
    slug: "healthy",
    featuredCardCount: 1,
    firstProviderLabel: "Codex Personal",
    firstStatusLabel: "Healthy",
    firstActionLabel: "Details",
    firstPrimaryIncludes: null,
    firstSecondaryIncludes: null,
    firstChipCount: 0,
    firstHasProgress: true,
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArrayEqual(actual, expected, label) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
  );
}

async function waitForPopupAppState(page) {
  await page.waitForFunction((storageKey) => {
    const result = globalThis.__aiUsageDashboardSafeLocalStorage?.getItem(storageKey);
    return result?.ok && Boolean(result.value);
  }, appStateStorageKey);
}

async function seedScenario(page, scenarioSlug) {
  await installSafeLocalStorageHelpers(page);
  await page.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await waitForPopupAppState(page);

  await page.evaluate(
    ({ storageKey, slug }) => {
      const ids = {
        cursor: "cursor-personal-page",
        claude: "claude-code-team-page",
        codex: "codex-personal-page",
        gemini: "gemini-policy",
      };
      const storage = globalThis.__aiUsageDashboardSafeLocalStorage;
      const rawStateResult = storage?.getItem(storageKey) ?? {
        ok: false,
        error: "Safe localStorage helper was not installed.",
      };

      if (!rawStateResult.ok) {
        throw new Error(`Unable to read popup state: ${rawStateResult.error}`);
      }

      if (!rawStateResult.value) {
        throw new Error("Popup state was not initialized before scenario setup.");
      }

      const state = JSON.parse(rawStateResult.value);

      state.settings = {
        ...state.settings,
        locale: "en",
        providerOrderBySurface: {
          ...state.settings.providerOrderBySurface,
          popup: [],
        },
      };
      state.providerSettings = state.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: false,
      }));

      const setProviderSetting = (providerId, patch) => {
        state.providerSettings = state.providerSettings.map((provider) =>
          provider.id === providerId
            ? {
                ...provider,
                displayEnabled: true,
                ...patch,
              }
            : provider,
        );
      };
      const setProviderSnapshot = (providerId, patch) => {
        state.providers = state.providers.map((provider) =>
          provider.providerId === providerId
            ? {
                ...provider,
                ...patch,
              }
            : provider,
        );
      };

      if (slug === "mixed-setup") {
        state.settings.providerOrderBySurface.popup = [
          ids.cursor,
          ids.claude,
          ids.codex,
          ids.gemini,
        ];
        setProviderSetting(ids.cursor, { status: "missing" });
        setProviderSetting(ids.claude, { status: "granted" });
        setProviderSetting(ids.codex, { status: "granted" });
        setProviderSetting(ids.gemini, { status: "granted" });
        setProviderSnapshot(ids.cursor, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Synced just now",
        });
        setProviderSnapshot(ids.claude, {
          syncStatus: "warning",
          tone: "warning",
          warningReason: "Admin API key required before live sync can run.",
          lastSyncLabel: "Usage page needed",
        });
        setProviderSnapshot(ids.codex, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Synced just now",
        });
        setProviderSnapshot(ids.gemini, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Policy reference",
        });
      }

      if (slug === "needs-review") {
        state.settings.providerOrderBySurface.popup = [
          ids.cursor,
          ids.codex,
          ids.gemini,
        ];
        setProviderSetting(ids.cursor, { status: "granted" });
        setProviderSetting(ids.codex, { status: "granted" });
        setProviderSetting(ids.gemini, { status: "granted" });
        setProviderSnapshot(ids.cursor, {
          syncStatus: "error",
          tone: "error",
          warningReason: "cursor still needs review.",
          lastSyncLabel: "Sync failed just now",
        });
        setProviderSnapshot(ids.codex, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Synced just now",
        });
        setProviderSnapshot(ids.gemini, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Policy reference",
        });
      }

      if (slug === "policy-only") {
        state.settings.providerOrderBySurface.popup = [ids.gemini];
        setProviderSetting(ids.gemini, { status: "granted" });
        setProviderSnapshot(ids.gemini, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Policy reference",
        });
      }

      if (slug === "healthy") {
        state.settings.providerOrderBySurface.popup = [ids.codex];
        setProviderSetting(ids.codex, { status: "granted" });
        setProviderSnapshot(ids.codex, {
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Synced just now",
        });
      }

      const writeResult = storage.setItem(storageKey, JSON.stringify(state));

      if (!writeResult.ok) {
        throw new Error(`Unable to write popup state: ${writeResult.error}`);
      }
    },
    {
      storageKey: appStateStorageKey,
      slug: scenarioSlug,
    },
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body?.innerText.includes("Quick glance"));
}

async function collectPopupSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const text = (selector) =>
      document.querySelector(selector)?.textContent?.trim() ?? null;
    const firstCard = document.querySelector(
      '[data-theme-local-surface="popup-first-provider-card"]',
    );
    const firstStatusChip = firstCard?.querySelector(
      '[data-popup-featured-status="true"] .status-chip',
    );
    const summaryItems = Array.from(
      document.querySelectorAll(
        '.summary-strip[aria-label="Popup top summary"] .summary-pill',
      ),
    ).map((pill) => ({
      label: pill.querySelector(".summary-pill__label")?.textContent?.trim() ?? null,
      value: pill.querySelector(".summary-pill__value")?.textContent?.trim() ?? null,
      tone: pill.getAttribute("data-summary-tone"),
    }));
    const setupItems = Array.from(
      document.querySelectorAll(
        '.summary-strip[aria-label="Popup setup coverage"] .summary-pill',
      ),
    ).map((pill) => ({
      label: pill.querySelector(".summary-pill__label")?.textContent?.trim() ?? null,
      value: pill.querySelector(".summary-pill__value")?.textContent?.trim() ?? null,
      tone: pill.getAttribute("data-summary-tone"),
    }));

    return {
      htmlLang: root.lang || null,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      footerLabel: text('[data-theme-local-surface="popup-footer-label"]'),
      footerTitle: text(".popup-footer__title"),
      footerDetail: text(".popup-footer__detail"),
      featuredCardCount: document.querySelectorAll(".popup-provider-card").length,
      firstProviderLabel:
        firstCard?.querySelector(".popup-provider-card__provider")?.textContent?.trim() ??
        null,
      firstStatusText: firstStatusChip?.textContent?.trim() ?? null,
      firstStatusLabel:
        firstStatusChip?.getAttribute("aria-label") ??
        firstStatusChip?.getAttribute("title") ??
        firstStatusChip?.textContent?.trim() ??
        null,
      firstActionLabel:
        firstCard
          ?.querySelector('[data-popup-featured-action="true"]')
          ?.textContent?.trim() ?? null,
      firstPrimary:
        firstCard
          ?.querySelector('[data-popup-featured-primary="true"]')
          ?.textContent?.trim() ?? null,
      firstSecondary:
        firstCard
          ?.querySelector('[data-popup-featured-secondary="true"]')
          ?.textContent?.trim() ?? null,
      firstChipLabels: Array.from(
        firstCard?.querySelectorAll('[data-popup-featured-chips="true"] .meta-chip') ??
          [],
      ).map((chip) => chip.textContent?.trim() ?? ""),
      firstHasProgress: Boolean(
        firstCard?.querySelector('[data-popup-featured-progress="true"]'),
      ),
      legacySectionsVisible: {
        guidance: Boolean(
          document.querySelector('[data-theme-local-surface="popup-guidance-card"]'),
        ),
        setupCoverage: Boolean(
          document.querySelector(
            '[data-theme-local-surface="popup-setup-coverage-card"]',
          ),
        ),
        action: Boolean(
          document.querySelector('[data-theme-local-surface="popup-actions-card"]'),
        ),
        surfaceRoles: Boolean(
          document.querySelector('[data-theme-local-surface="popup-contract-card"]'),
        ),
        featuredEmpty: Boolean(
          document.querySelector('[data-theme-local-surface="popup-empty-state-card"]'),
        ),
      },
      summaryItems,
      setupStageLabel:
        document
          .querySelector("[data-popup-setup-coverage-stage] .status-chip")
          ?.textContent?.trim() ?? null,
      setupHeadline:
        document
          .querySelector(
            '[data-theme-local-surface="popup-setup-coverage-card"] .section-title',
          )
          ?.textContent?.trim() ?? null,
      setupDetail: text("[data-popup-setup-coverage-detail]"),
      setupItems,
      guidanceHeadline:
        document
          .querySelector('[data-theme-local-surface="popup-guidance-card"] .section-title')
          ?.textContent?.trim() ?? null,
      guidanceActionLabel:
        document
          .querySelector('[data-theme-local-surface="popup-guidance-action"]')
          ?.textContent?.trim() ?? null,
      actionSectionLabel: text('[data-theme-local-surface="popup-actions-label"]'),
      actionButtons: Array.from(
        document.querySelectorAll(
          '[data-theme-local-surface="popup-actions-card"] .text-button',
        ),
      ).map((button) => button.textContent?.trim() ?? ""),
      surfaceHeadline: text("[data-popup-surface-roles-headline]"),
      surfaceDetail: text("[data-popup-surface-roles-detail]"),
      featuredSectionLabel: text(
        '[data-theme-local-surface="popup-featured-section-label"]',
      ),
    };
  });
}

function assertNoVisibleScenario(phaseNumber, scenario, snapshot) {
  assert(
    snapshot.featuredCardCount === scenario.featuredCardCount,
    `phase${phaseNumber}:${scenario.slug}: expected no featured cards, received ${snapshot.featuredCardCount}`,
  );
  assert(
    Object.values(snapshot.legacySectionsVisible).every(Boolean),
    `phase${phaseNumber}:${scenario.slug}: expected legacy empty-state sections to be visible`,
  );
  assertArrayEqual(
    snapshot.summaryItems.map((item) => item.value),
    scenario.summaryValues,
    `phase${phaseNumber}:${scenario.slug}: top-summary values`,
  );
  assertArrayEqual(
    snapshot.setupItems.map((item) => item.value),
    scenario.summaryValues,
    `phase${phaseNumber}:${scenario.slug}: setup coverage values`,
  );
  assert(
    snapshot.setupStageLabel === scenario.setupStageLabel,
    `phase${phaseNumber}:${scenario.slug}: expected setup stage ${scenario.setupStageLabel}, received ${snapshot.setupStageLabel}`,
  );
  assert(
    snapshot.setupHeadline === scenario.setupHeadline,
    `phase${phaseNumber}:${scenario.slug}: expected setup headline ${scenario.setupHeadline}, received ${snapshot.setupHeadline}`,
  );
  assert(
    snapshot.setupDetail?.includes(scenario.setupDetailIncludes),
    `phase${phaseNumber}:${scenario.slug}: setup detail did not mention ${scenario.setupDetailIncludes}`,
  );
  assert(
    snapshot.guidanceActionLabel === scenario.guidanceActionLabel,
    `phase${phaseNumber}:${scenario.slug}: expected guidance action ${scenario.guidanceActionLabel}, received ${snapshot.guidanceActionLabel}`,
  );
  assert(
    snapshot.actionSectionLabel === scenario.actionSectionLabel,
    `phase${phaseNumber}:${scenario.slug}: expected action section ${scenario.actionSectionLabel}, received ${snapshot.actionSectionLabel}`,
  );
  assertArrayEqual(
    snapshot.actionButtons,
    scenario.actionButtons,
    `phase${phaseNumber}:${scenario.slug}: action buttons`,
  );
  assert(
    snapshot.surfaceHeadline === scenario.surfaceHeadline,
    `phase${phaseNumber}:${scenario.slug}: expected surface headline ${scenario.surfaceHeadline}, received ${snapshot.surfaceHeadline}`,
  );
  assert(
    snapshot.featuredSectionLabel === scenario.featuredSectionLabel,
    `phase${phaseNumber}:${scenario.slug}: expected featured label ${scenario.featuredSectionLabel}, received ${snapshot.featuredSectionLabel}`,
  );
}

function assertFeaturedScenario(phaseNumber, scenario, snapshot) {
  assert(
    snapshot.featuredCardCount === scenario.featuredCardCount,
    `phase${phaseNumber}:${scenario.slug}: expected ${scenario.featuredCardCount} featured cards, received ${snapshot.featuredCardCount}`,
  );
  assert(
    Object.values(snapshot.legacySectionsVisible).every((visible) => !visible),
    `phase${phaseNumber}:${scenario.slug}: expected legacy empty-state sections to be hidden when featured cards render`,
  );
  assert(
    snapshot.firstProviderLabel === scenario.firstProviderLabel,
    `phase${phaseNumber}:${scenario.slug}: expected first provider ${scenario.firstProviderLabel}, received ${snapshot.firstProviderLabel}`,
  );
  assert(
    snapshot.firstStatusLabel === scenario.firstStatusLabel,
    `phase${phaseNumber}:${scenario.slug}: expected semantic status ${scenario.firstStatusLabel}, received ${snapshot.firstStatusLabel}`,
  );
  assert(
    snapshot.firstStatusLabel !== snapshot.firstStatusText ||
      !["!", "x", "✓"].includes(snapshot.firstStatusText ?? ""),
    `phase${phaseNumber}:${scenario.slug}: status assertion used visible icon text instead of semantic label`,
  );
  assert(
    snapshot.firstActionLabel === scenario.firstActionLabel,
    `phase${phaseNumber}:${scenario.slug}: expected action ${scenario.firstActionLabel}, received ${snapshot.firstActionLabel}`,
  );

  if (scenario.firstPrimaryIncludes) {
    assert(
      snapshot.firstPrimary?.includes(scenario.firstPrimaryIncludes),
      `phase${phaseNumber}:${scenario.slug}: expected primary detail to include ${scenario.firstPrimaryIncludes}, received ${snapshot.firstPrimary}`,
    );
  }

  if (scenario.firstSecondaryIncludes) {
    assert(
      snapshot.firstSecondary?.includes(scenario.firstSecondaryIncludes),
      `phase${phaseNumber}:${scenario.slug}: expected secondary detail to include ${scenario.firstSecondaryIncludes}, received ${snapshot.firstSecondary}`,
    );
  }

  assert(
    snapshot.firstChipLabels.length === scenario.firstChipCount,
    `phase${phaseNumber}:${scenario.slug}: expected ${scenario.firstChipCount} chips, received ${snapshot.firstChipLabels.length}`,
  );
  assert(
    snapshot.firstHasProgress === scenario.firstHasProgress,
    `phase${phaseNumber}:${scenario.slug}: expected progress=${scenario.firstHasProgress}, received ${snapshot.firstHasProgress}`,
  );
}

function assertPopupSnapshot(phaseNumber, scenario, width, snapshot) {
  assert(
    snapshot.horizontalOverflow === 0,
    `phase${phaseNumber}:${scenario.slug}@${width}: expected no horizontal overflow, received ${snapshot.horizontalOverflow}`,
  );
  assert(
    snapshot.htmlLang === "en",
    `phase${phaseNumber}:${scenario.slug}@${width}: expected en locale, received ${snapshot.htmlLang}`,
  );
  assert(
    snapshot.footerLabel === "Toolbar Popup" && snapshot.footerTitle === "Quick glance",
    `phase${phaseNumber}:${scenario.slug}@${width}: footer identity drifted`,
  );

  if (scenario.featuredCardCount === 0) {
    assertNoVisibleScenario(phaseNumber, scenario, snapshot);
  } else {
    assertFeaturedScenario(phaseNumber, scenario, snapshot);
  }
}

export async function runCurrentPopupReview({ phaseNumber, artifactDirName }) {
  const artifactDir = path.join(projectRoot, "tmp", artifactDirName);
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    const context = await browser.newContext();
    const results = [];

    for (const scenario of scenarioExpectations) {
      for (const width of widths) {
        console.log(`phase${phaseNumber}: ${scenario.slug}@${width}`);
        const page = await context.newPage();
        page.setDefaultTimeout(20_000);
        await page.setViewportSize({ width, height: 900 });
        await seedScenario(page, scenario.slug);

        const snapshot = await collectPopupSnapshot(page);
        assertPopupSnapshot(phaseNumber, scenario, width, snapshot);

        const screenshotPath = path.join(artifactDir, `${scenario.slug}-${width}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        await page.close();

        results.push({
          scenario: scenario.slug,
          width,
          artifactPath: path.relative(projectRoot, screenshotPath),
          snapshot,
        });
      }
    }

    const resultsPath = path.join(artifactDir, `phase${phaseNumber}-results.json`);
    await writeFile(
      resultsPath,
      `${JSON.stringify(
        {
          reviewedAt: new Date().toISOString(),
          reviewUrl: popupUrl,
          scenarioCount: scenarioExpectations.length,
          widthCount: widths.length,
          results,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    console.log(`phase${phaseNumber}: wrote ${path.relative(projectRoot, resultsPath)}`);
  } finally {
    await browser.close();
  }
}
