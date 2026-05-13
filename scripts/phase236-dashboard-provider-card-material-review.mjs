import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase236-dashboard-provider-card-material-review",
);
const devPort = 42636;
const appStateStorageKey = "ai-usage-dashboard.app-state";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readProjectFile(relativePath));
}

function verifyMarkers(fileContent, relativePath, markers) {
  for (const marker of markers) {
    assert(
      fileContent.includes(marker),
      `${relativePath} is missing marker: ${marker}`,
    );
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase236:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase236-dashboard-provider-card-material-review.mjs",
    "package.json is missing the expected phase236:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/components/ProviderCard.tsx",
      markers: [
        "provider-card__identity",
        "provider-card__status",
        "provider-card__summary",
        "provider-card__usage-label",
        "provider-card__progress-surface",
        "provider-card__action--primary",
      ],
    },
    {
      relativePath: "src/sidepanel/theme/provider-card.css",
      markers: [
        ".provider-card__summary",
        ".provider-card__progress-surface",
        ".provider-card__action--primary",
        ".provider-card__footer",
        "flex-direction: row;",
      ],
    },
    {
      relativePath: "src/sidepanel/main.tsx",
      markers: [
        'import "./theme/material-theme.css";',
        'import "./theme/provider-card.css";',
      ],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.test.tsx",
      markers: [
        "uses the Material provider-card hierarchy",
        "provider-card__progress-surface",
        "provider-card__action--primary",
      ],
    },
  ];
  const results = [];

  for (const expectation of expectations) {
    const fileContent = await readProjectFile(expectation.relativePath);

    verifyMarkers(
      fileContent,
      expectation.relativePath,
      expectation.markers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length,
    });
  }

  return results;
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_236_Dashboard_Provider_Card_Material_Unification.md",
      markers: [
        "Phase 236",
        "Dashboard Provider Card Material Unification",
        "npm run phase236:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/236_Phase_Dashboard_Provider_Card_Material_Unification.md",
      markers: [
        "Phase 236",
        "completed and archived on 2026-05-03",
        "dashboard provider cards",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "Phase 236",
        "dashboard provider-card structure",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 236",
        "dashboard provider-card Material unification",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 236",
        "dashboard provider-card Material",
      ],
    },
    {
      relativePath:
        "Doc/Roadmap/04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md",
      markers: [
        "Phase 236",
        "dashboard provider cards",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "dashboard provider cards now use the same Material card, supporting-surface, progress, chip, and action hierarchy",
      ],
    },
  ];
  const results = [];

  for (const expectation of expectations) {
    const fileContent = await readProjectFile(expectation.relativePath);

    verifyMarkers(
      fileContent,
      expectation.relativePath,
      expectation.markers,
    );
    results.push({
      scope: expectation.relativePath,
      markers: expectation.markers.length,
    });
  }

  return results;
}

function startDevServer() {
  const logs = [];
  const server = spawn(
    "npm",
    [
      "run",
      "dev",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(devPort),
      "--strictPort",
    ],
    {
      cwd: projectRoot,
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const pushLogs = (chunk) => {
    logs.push(
      ...chunk
        .toString()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );
    if (logs.length > 80) {
      logs.splice(0, logs.length - 80);
    }
  };

  server.stdout?.on("data", pushLogs);
  server.stderr?.on("data", pushLogs);

  return {
    server,
    getLogTail: () => logs.join("\n"),
  };
}

async function waitForServer(baseUrl, server, getLogTail) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `Vite dev server exited before becoming ready.\n${getLogTail()}`,
      );
    }

    try {
      const response = await fetch(`${baseUrl}/src/sidepanel/index.html`);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry while Vite starts.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for Vite dev server.\n${getLogTail()}`);
}

async function stopDevServer(server) {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (server.exitCode !== null) {
      return;
    }
    await delay(100);
  }

  server.kill("SIGKILL");
}

async function seedCodexDashboardState(page, baseUrl, themeMode) {
  await page.goto(`${baseUrl}/src/sidepanel/index.html#dashboard`, {
    waitUntil: "load",
  });
  await page.waitForSelector(".provider-shell-list", { timeout: 20_000 });

  await page.evaluate(
    ({ storageKey, requestedThemeMode }) => {
      const rawState = localStorage.getItem(storageKey);

      if (!rawState) {
        throw new Error("Missing app state after dashboard seed.");
      }

      const state = JSON.parse(rawState);

      state.settings = {
        ...state.settings,
        locale: "en",
        themeMode: requestedThemeMode,
        themePreset: "default",
        sidebarProgressStyle: "line",
        fullPageProgressStyle: "line",
      };

      state.providerSettings = state.providerSettings.map((provider) =>
        provider.id === "codex"
          ? {
              ...provider,
              enabled: true,
              status: "granted",
              sourcePreference: "session_page",
            }
          : provider,
      );

      state.providers = state.providers.map((provider) =>
        provider.providerId === "codex"
          ? {
              ...provider,
              planName: "Codex Personal Usage Page (Weekly usage window)",
              quotaUnit: "percent",
              quotaWindow: "Weekly usage window",
              used: 42,
              remaining: 58,
              total: 100,
              resetAt: "2026-05-05T06:06:00.000Z",
              resetLabel: "Weekly usage window resets at 2026-05-05 15:36",
              syncedAt: "2026-05-03 02:30",
              syncSource: "page_parse",
              syncStatus: "ok",
              warningReason: null,
              warningDiagnostic: null,
              lastSyncLabel: "Codex personal usage page synced just now",
              sourceSelectionReason: "Selected session page from saved preference.",
              sourceFallbackReason: null,
              tone: "neutral",
              usageSummary:
                "Visible Codex usage: 5-hour usage window: 86% remaining · Weekly usage window: 58% remaining · GPT-5.3-Codex-Spark weekly usage window: 100% remaining",
              usageWindows: [
                {
                  label: "5-hour usage window",
                  normalizedLabel: "5-hour usage window",
                  used: 14,
                  remaining: 86,
                  total: 100,
                  resetAt: "2026-05-03T08:25:00.000Z",
                  resetLabel: "5-hour usage window resets at 2026-05-03 08:25",
                },
                {
                  label: "Weekly usage window",
                  normalizedLabel: "Weekly usage window",
                  used: 42,
                  remaining: 58,
                  total: 100,
                  resetAt: "2026-05-05T06:06:00.000Z",
                  resetLabel: "Weekly usage window resets at 2026-05-05 15:36",
                },
                {
                  label: "GPT-5.3-Codex-Spark weekly usage window",
                  normalizedLabel: "GPT-5.3-Codex-Spark weekly usage window",
                  used: 0,
                  remaining: 100,
                  total: 100,
                  resetAt: null,
                  resetLabel: null,
                },
              ],
              usageBalances: [],
            }
          : provider,
      );

      localStorage.setItem(storageKey, JSON.stringify(state));
    },
    {
      storageKey: appStateStorageKey,
      requestedThemeMode: themeMode,
    },
  );
}

async function waitForTheme(page, themeMode) {
  await page.waitForFunction(
    (expectedThemeMode) => {
      const root = document.documentElement;

      return (
        root.dataset.themeMode === expectedThemeMode &&
        root.dataset.themeResolved === expectedThemeMode
      );
    },
    themeMode,
  );
}

async function collectDashboardSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const cards = Array.from(document.querySelectorAll(".provider-card"));
    const codexCard = document.querySelector('[data-provider-id="codex"]');
    const neutralCard = document.querySelector(
      ".provider-card:not(.provider-card--warning):not(.provider-card--error)",
    );
    const tonedCard = document.querySelector(
      ".provider-card--warning, .provider-card--error",
    );
    const footer = codexCard?.querySelector(".provider-card__footer");
    const progressSurface = codexCard?.querySelector(
      ".provider-card__progress-surface",
    );
    const actions = Array.from(
      codexCard?.querySelectorAll(".provider-card__action") ?? [],
    );

    const overflowedCards = cards.filter((card) => {
      const rect = card.getBoundingClientRect();
      return rect.left < -1 || rect.right > window.innerWidth + 1;
    });

    const styleSnapshot = (element) => {
      if (!(element instanceof HTMLElement)) {
        return null;
      }
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        display: styles.display,
        flexDirection: styles.flexDirection,
        justifyContent: styles.justifyContent,
      };
    };

    const codexRect =
      codexCard instanceof HTMLElement ? codexCard.getBoundingClientRect() : null;

    return {
      themeMode: root.dataset.themeMode ?? null,
      themeResolved: root.dataset.themeResolved ?? null,
      viewportWidth: window.innerWidth,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      cardCount: cards.length,
      overflowedCardCount: overflowedCards.length,
      codexCardWidth: codexRect ? Math.round(codexRect.width) : null,
      codexWindowProgressCount:
        codexCard?.querySelectorAll(".usage-window-progress-list__item").length ??
        0,
      progressSurfaceCount:
        codexCard?.querySelectorAll(".provider-card__progress-surface").length ??
        0,
      actionCount: actions.length,
      maxActionWidth: actions.reduce((maxWidth, action) => {
        if (!(action instanceof HTMLElement)) {
          return maxWidth;
        }

        return Math.max(maxWidth, Math.round(action.getBoundingClientRect().width));
      }, 0),
      card: styleSnapshot(codexCard),
      footer: styleSnapshot(footer),
      progressSurface: styleSnapshot(progressSurface),
      neutralCard: styleSnapshot(neutralCard),
      tonedCard: styleSnapshot(tonedCard),
    };
  });
}

function verifyDashboardSnapshot(label, snapshot, themeMode) {
  assert(
    snapshot.themeMode === themeMode,
    `${label}: expected themeMode=${themeMode}, received ${snapshot.themeMode}`,
  );
  assert(
    snapshot.themeResolved === themeMode,
    `${label}: expected resolved theme=${themeMode}, received ${snapshot.themeResolved}`,
  );
  assert(
    snapshot.horizontalOverflow <= 1,
    `${label}: horizontal overflow ${snapshot.horizontalOverflow}px`,
  );
  assert(
    snapshot.overflowedCardCount === 0,
    `${label}: ${snapshot.overflowedCardCount} provider cards overflow the viewport`,
  );
  assert(
    snapshot.cardCount >= 4,
    `${label}: expected at least four provider cards, received ${snapshot.cardCount}`,
  );
  assert(
    snapshot.codexWindowProgressCount >= 3,
    `${label}: expected Codex structured usage windows to remain visible, received ${snapshot.codexWindowProgressCount}`,
  );
  assert(
    snapshot.progressSurfaceCount >= 1,
    `${label}: expected Codex progress surface to render`,
  );
  assert(
    snapshot.footer?.display === "flex" &&
      snapshot.footer?.flexDirection === "row" &&
      snapshot.footer?.justifyContent === "flex-end",
    `${label}: provider-card footer action hierarchy drifted: ${JSON.stringify(snapshot.footer)}`,
  );
  assert(
    snapshot.codexCardWidth !== null &&
      snapshot.maxActionWidth < snapshot.codexCardWidth,
    `${label}: provider-card actions look full-width: action=${snapshot.maxActionWidth} card=${snapshot.codexCardWidth}`,
  );
  assert(
    snapshot.card?.borderRadius !== "0px" &&
      snapshot.card?.boxShadow !== "none",
    `${label}: provider-card lost Material surface shape/elevation`,
  );
  assert(
    snapshot.progressSurface?.borderColor !== "rgba(0, 0, 0, 0)",
    `${label}: progress surface lost its supporting-surface border`,
  );
  assert(
    snapshot.neutralCard?.backgroundColor !== snapshot.tonedCard?.backgroundColor,
    `${label}: toned provider card collapsed into the neutral card surface`,
  );
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const results = [];

  try {
    const context = await browser.newContext({
      colorScheme: "light",
    });
    const seedPage = await context.newPage();

    for (const themeMode of ["light", "dark"]) {
      await seedCodexDashboardState(seedPage, baseUrl, themeMode);

      for (const scenario of [
        {
          slug: "sidepanel-360",
          width: 360,
          height: 900,
          url: `${baseUrl}/src/sidepanel/index.html#dashboard`,
        },
        {
          slug: "sidepanel-420",
          width: 420,
          height: 900,
          url: `${baseUrl}/src/sidepanel/index.html#dashboard`,
        },
        {
          slug: "full-page-1366",
          width: 1366,
          height: 920,
          url: `${baseUrl}/src/sidepanel/index.html?surface=full-page#dashboard`,
        },
      ]) {
        const page = await context.newPage();
        page.setDefaultTimeout(20_000);
        await page.setViewportSize({
          width: scenario.width,
          height: scenario.height,
        });
        await page.goto(scenario.url, { waitUntil: "load" });
        await page.waitForSelector(".provider-shell-list");
        await page.waitForSelector(
          '[data-provider-id="codex"] .provider-card__progress-surface',
        );
        await waitForTheme(page, themeMode);

        const screenshotPath = path.join(
          artifactDir,
          `${themeMode}-${scenario.slug}.png`,
        );
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        const snapshot = await collectDashboardSnapshot(page);
        const label = `${themeMode}-${scenario.slug}`;
        verifyDashboardSnapshot(label, snapshot, themeMode);

        results.push({
          label,
          screenshotPath,
          snapshot,
        });

        await page.close();
      }
    }

    await seedPage.close();
    await context.close();
  } finally {
    await browser.close();
  }

  return results;
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyDocsMarkers()),
  ];

  const baseUrl = `http://127.0.0.1:${devPort}`;
  const { server, getLogTail } = startDevServer();
  let visualResults;

  try {
    await waitForServer(baseUrl, server, getLogTail);
    visualResults = await runVisualReview(baseUrl);
  } finally {
    await stopDevServer(server);
  }

  const report = {
    markers: markerResults,
    visual: visualResults,
  };
  const reportPath = path.join(
    artifactDir,
    "dashboard-provider-card-material-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase236: dashboard provider-card Material review verified");
  console.log(`phase236: saved artifacts under ${artifactDir}`);
  console.log(`phase236: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase236: ${result.scope} markers=${result.markers}`);
  }
  for (const result of visualResults) {
    console.log(
      `phase236: ${result.label} cards=${result.snapshot.cardCount} codex_windows=${result.snapshot.codexWindowProgressCount} overflow=${result.snapshot.horizontalOverflow}`,
    );
  }
}

runReview().catch((error) => {
  console.error("phase236: dashboard provider-card Material review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
