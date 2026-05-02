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
  "phase243-settings-source-cards-css-module-review",
);
const devPort = 42643;

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

function verifyOrder(fileContent, relativePath, orderedMarkers) {
  let previousIndex = -1;

  for (const marker of orderedMarkers) {
    const index = fileContent.indexOf(marker);

    assert(index >= 0, `${relativePath} is missing ordered marker: ${marker}`);
    assert(
      index > previousIndex,
      `${relativePath} has the wrong order for marker: ${marker}`,
    );
    previousIndex = index;
  }
}

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase243:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase243-settings-source-cards-css-module-review.mjs",
    "package.json is missing the expected phase243:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCssSplit() {
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const sourceCardsTheme = await readProjectFile(
    "src/sidepanel/theme/settings-source-cards.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/detail-surfaces.css";',
    'import "./theme/settings-source-cards.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/settings-appearance.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("settings-source-cards.css"),
    "popup entry should not import the sidepanel-only Settings source-card CSS module.",
  );
  assert(
    !materialTheme.includes("\n.source-card {\n") &&
      !materialTheme.includes("\n.source-card__header {\n") &&
      !materialTheme.includes("\n.source-card__details-toggle {\n") &&
      !materialTheme.includes("\n.source-card__diagnostic-group {\n") &&
      !materialTheme.includes("\n.source-card__diagnostic-row {\n"),
    "material-theme.css still owns source-card selectors.",
  );

  verifyMarkers(
    sourceCardsTheme,
    "src/sidepanel/theme/settings-source-cards.css",
    [
      ".source-card",
      ".source-card__summary-grid",
      ".source-card__details[open]",
      ".source-card__diagnostic-group",
      ".source-card__diagnostic-row",
      "@media (prefers-reduced-motion: reduce)",
      "@media (max-width: 720px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 8,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 5,
    },
    {
      scope: "src/sidepanel/theme/settings-source-cards.css",
      markers: 7,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_243_Settings_Source_Cards_CSS_Module_Split.md",
      markers: [
        "Phase 243",
        "Settings Source Cards CSS Module Split",
        "npm run phase243:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/243_Phase_Settings_Source_Cards_CSS_Module_Split.md",
      markers: [
        "Phase 243",
        "completed and archived on 2026-05-03",
        "settings-source-cards.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "243_Phase_Settings_Source_Cards_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 243",
        "Settings source-card CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "Settings source-card CSS now lives in `src/sidepanel/theme/settings-source-cards.css`",
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

async function collectStyles(locator) {
  return locator.evaluate((element) => {
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
      gridTemplateColumns: styles.gridTemplateColumns,
      justifyItems: styles.justifyItems,
      overflowWrap: styles.overflowWrap,
      wordBreak: styles.wordBreak,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function openExpandedSettingsSourceCard(baseUrl, browser, viewport) {
  const page = await browser.newPage({ viewport });

  await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
    waitUntil: "load",
  });
  await page.waitForSelector("#settings-sources .source-card", {
    timeout: 20_000,
  });
  await page
    .locator("#settings-sources .source-card__details-toggle")
    .first()
    .click();
  await page.waitForSelector(".source-card__diagnostic-row", {
    timeout: 20_000,
  });

  return page;
}

async function reviewSettingsSourceCards(baseUrl, browser, viewport, label) {
  const page = await openExpandedSettingsSourceCard(baseUrl, browser, viewport);

  try {
    const sourceCard = page.locator("#settings-sources .source-card").first();
    const sourceField = page.locator(".source-card__field").first();
    const sourceChips = page.locator(".source-card__chips").first();
    const detailsToggle = page.locator(".source-card__details-toggle").first();
    const diagnosticGroup = page
      .locator(".source-card__diagnostic-group")
      .first();
    const diagnosticRow = page.locator(".source-card__diagnostic-row").first();
    const diagnosticValue = page
      .locator(".source-card__diagnostic-value")
      .first();

    const result = {
      overflow: await collectOverflowState(page),
      sourceCardStyles: await collectStyles(sourceCard),
      sourceFieldStyles: await collectStyles(sourceField),
      sourceChipsStyles: await collectStyles(sourceChips),
      detailsToggleStyles: await collectStyles(detailsToggle),
      diagnosticGroupStyles: await collectStyles(diagnosticGroup),
      diagnosticRowStyles: await collectStyles(diagnosticRow),
      diagnosticValueStyles: await collectStyles(diagnosticValue),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-settings-source-cards.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} settings source cards overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.sourceCardStyles?.borderColor !== "rgba(0, 0, 0, 0)",
      `${label} source cards lost their explicit border.`,
    );
    assert(
      result.sourceCardStyles?.boxShadow !== "none",
      `${label} source cards lost their elevation shadow.`,
    );
    assert(
      result.sourceFieldStyles?.backgroundColor !==
        result.sourceCardStyles?.backgroundColor,
      `${label} source-card fields collapsed into the card background.`,
    );
    assert(
      result.diagnosticGroupStyles?.backgroundColor !==
        result.sourceCardStyles?.backgroundColor,
      `${label} diagnostic groups collapsed into the card background.`,
    );
    assert(
      result.detailsToggleStyles?.borderRadius !== "0px",
      `${label} details toggle lost its rounded Material control shape.`,
    );
    assert(
      result.diagnosticRowStyles?.display === "grid",
      `${label} diagnostic rows should remain grid layouts.`,
    );
    assert(
      result.diagnosticValueStyles?.overflowWrap === "anywhere",
      `${label} diagnostic values lost overflow-wrap:anywhere.`,
    );

    return result;
  } finally {
    await page.close();
  }
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });

  try {
    return {
      compact: await reviewSettingsSourceCards(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
      ),
      wide: await reviewSettingsSourceCards(
        baseUrl,
        browser,
        { width: 900, height: 900 },
        "wide",
      ),
    };
  } finally {
    await browser.close();
  }
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyCssSplit()),
    ...(await verifyDocsMarkers()),
  ];

  const baseUrl = `http://127.0.0.1:${devPort}`;
  const { server, getLogTail } = startDevServer();
  let visualResult;

  try {
    await waitForServer(baseUrl, server, getLogTail);
    visualResult = await runVisualReview(baseUrl);
  } finally {
    await stopDevServer(server);
  }

  const report = {
    markers: markerResults,
    visual: visualResult,
  };
  const reportPath = path.join(
    artifactDir,
    "settings-source-cards-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase243: Settings source-card CSS module split verified");
  console.log(`phase243: saved artifacts under ${artifactDir}`);
  console.log(`phase243: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase243: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase243: visual compact_overflow=${visualResult.compact.overflow.overflowX} wide_overflow=${visualResult.wide.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase243: Settings source-card CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
