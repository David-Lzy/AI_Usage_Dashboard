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
  "phase246-settings-navigation-css-module-review",
);
const devPort = 42646;

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
    packageJson.scripts["phase246:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase246-settings-navigation-css-module-review.mjs",
    "package.json is missing the expected phase246:review script.",
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
  const settingsNavigationTheme = await readProjectFile(
    "src/sidepanel/theme/settings-navigation.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/detail-surfaces.css";',
    'import "./theme/form-controls.css";',
    'import "./theme/settings-navigation.css";',
    'import "./theme/settings-source-cards.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/settings-appearance.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("settings-navigation.css"),
    "popup entry should not import the sidepanel-only Settings navigation CSS module.",
  );
  assert(
    !materialTheme.includes("\n.settings-grid {\n") &&
      !materialTheme.includes("\n.settings-section-nav {\n") &&
      !materialTheme.includes("\n.settings-nav-chip {\n") &&
      !materialTheme.includes("\n.settings-back-to-top-fab {\n"),
    "material-theme.css still owns Settings navigation selectors.",
  );

  verifyMarkers(
    settingsNavigationTheme,
    "src/sidepanel/theme/settings-navigation.css",
    [
      ".settings-grid",
      ".settings-section-anchor",
      ".settings-section-nav",
      ".settings-nav-chip",
      ".settings-back-to-top-fab",
      ".settings-back-to-top-fab__label",
      "@media (max-width: 720px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 10,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 4,
    },
    {
      scope: "src/sidepanel/theme/settings-navigation.css",
      markers: 7,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_246_Settings_Navigation_CSS_Module_Split.md",
      markers: [
        "Phase 246",
        "Settings Navigation CSS Module Split",
        "npm run phase246:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/246_Phase_Settings_Navigation_CSS_Module_Split.md",
      markers: [
        "Phase 246",
        "completed and archived on 2026-05-03",
        "settings-navigation.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "246_Phase_Settings_Navigation_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 246", "Settings navigation CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "Settings navigation CSS now lives in `src/sidepanel/theme/settings-navigation.css`",
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
      flexWrap: styles.flexWrap,
      gridTemplateColumns: styles.gridTemplateColumns,
      position: styles.position,
      scrollMarginTop: styles.scrollMarginTop,
      whiteSpace: styles.whiteSpace,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function reviewSettingsNavigation(baseUrl, browser, viewport, label) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".settings-section-nav", { timeout: 20_000 });
    await page.waitForSelector(".settings-nav-chip", { timeout: 20_000 });
    await page.waitForSelector(".settings-back-to-top-fab", {
      timeout: 20_000,
    });

    const navChip = page.locator(".settings-nav-chip").first();
    await navChip.focus();

    const result = {
      overflow: await collectOverflowState(page),
      topBarStyles: await collectStyles(page.locator(".top-app-bar").first()),
      navStyles: await collectStyles(page.locator(".settings-section-nav")),
      activeChipStyles: await collectStyles(
        page.locator('.settings-nav-chip[data-active="true"]').first(),
      ),
      focusedChipStyles: await collectStyles(navChip),
      anchorStyles: await collectStyles(
        page.locator(".settings-section-anchor").first(),
      ),
      fabStyles: await collectStyles(page.locator(".settings-back-to-top-fab")),
      fabLabelStyles: await collectStyles(
        page.locator(".settings-back-to-top-fab__label"),
      ),
      settingsGridStyles: await collectStyles(page.locator(".settings-grid").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-settings-navigation.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} Settings navigation overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.topBarStyles?.position === "sticky",
      `${label} Settings top app bar should remain sticky.`,
    );
    assert(
      result.navStyles?.display === "flex" &&
        result.navStyles.flexWrap === "wrap",
      `${label} Settings section nav should remain a wrapping flex row.`,
    );
    assert(
      result.activeChipStyles?.borderRadius !== "0px",
      `${label} active Settings nav chip lost its rounded shape.`,
    );
    assert(
      result.focusedChipStyles?.boxShadow !== "none",
      `${label} focused Settings nav chip lost its focus/elevation treatment.`,
    );
    assert(
      result.fabStyles?.position === "fixed",
      `${label} back-to-top action should remain fixed.`,
    );
    assert(
      result.fabLabelStyles?.whiteSpace === "nowrap" ||
        result.fabLabelStyles?.display === "none",
      `${label} back-to-top label should either stay nowrap or be hidden compactly.`,
    );
    assert(
      result.settingsGridStyles?.display === "grid",
      `${label} Settings grid lost its grid layout.`,
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
      compact: await reviewSettingsNavigation(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
      ),
      wide: await reviewSettingsNavigation(
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
    "settings-navigation-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase246: Settings navigation CSS module split verified");
  console.log(`phase246: saved artifacts under ${artifactDir}`);
  console.log(`phase246: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase246: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase246: visual compact_overflow=${visualResult.compact.overflow.overflowX} wide_overflow=${visualResult.wide.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase246: Settings navigation CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
