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
  "phase249-app-shell-css-module-review",
);
const devPort = 42649;

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
    packageJson.scripts["phase249:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase249-app-shell-css-module-review.mjs",
    "package.json is missing the expected phase249:review script.",
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
  const appShellTheme = await readProjectFile(
    "src/sidepanel/theme/app-shell.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/app-shell.css";',
    'import "./theme/access-feedback.css";',
    'import "./theme/top-app-bar.css";',
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
  verifyOrder(popupEntry, "src/popup/main.tsx", [
    'import "../sidepanel/theme/material-theme.css";',
    'import "../sidepanel/theme/app-shell.css";',
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);
  assert(
    !materialTheme.includes("@keyframes app-surface-enter") &&
      !materialTheme.includes("@keyframes app-disclosure-enter") &&
      !materialTheme.includes("@keyframes app-full-page-enter-from-popup") &&
      !materialTheme.includes("\n.app-shell"),
    "material-theme.css still owns app-shell selectors or keyframes.",
  );

  verifyMarkers(appShellTheme, "src/sidepanel/theme/app-shell.css", [
    "@keyframes app-surface-enter",
    "@keyframes app-disclosure-enter",
    "@keyframes app-full-page-enter-from-popup",
    "@keyframes app-full-page-enter-from-sidebar",
    ".app-shell",
    ".full-page-shell .app-shell",
    "@media (prefers-reduced-motion: reduce)",
    "@media (max-width: 480px)",
  ]);

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 13,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 4,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 4,
    },
    {
      scope: "src/sidepanel/theme/app-shell.css",
      markers: 8,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Phase_249_App_Shell_CSS_Module_Split.md",
      markers: [
        "Phase 249",
        "App Shell CSS Module Split",
        "npm run phase249:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/249_Phase_App_Shell_CSS_Module_Split.md",
      markers: [
        "Phase 249",
        "completed and archived on 2026-05-03",
        "app-shell.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "249_Phase_App_Shell_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 249", "App shell CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "App shell CSS now lives in `src/sidepanel/theme/app-shell.css`",
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
      animationName: styles.animationName,
      display: styles.display,
      gap: styles.gap,
      gridTemplateColumns: styles.gridTemplateColumns,
      marginInline: styles.marginInline,
      minWidth: styles.minWidth,
      padding: styles.padding,
      width: styles.width,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function reviewSidepanelShell(baseUrl, browser, viewport, label, route) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html${route}`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".app-shell", { timeout: 20_000 });
    await page.waitForSelector(".app-shell > *", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      shellStyles: await collectStyles(page.locator(".app-shell").first()),
      firstChildStyles: await collectStyles(page.locator(".app-shell > *").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-sidepanel-shell.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} sidepanel shell overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.shellStyles?.display === "grid",
      `${label} sidepanel app shell lost its grid layout.`,
    );
    assert(
      result.shellStyles?.gridTemplateColumns !== "none",
      `${label} sidepanel app shell lost its grid template.`,
    );
    assert(
      result.firstChildStyles?.minWidth === "0px",
      `${label} sidepanel app shell child lost min-width protection.`,
    );

    return result;
  } finally {
    await page.close();
  }
}

async function reviewPopupShell(baseUrl, browser, viewport, label) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${baseUrl}/src/popup/index.html`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".app-shell.popup-shell", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      shellStyles: await collectStyles(page.locator(".app-shell").first()),
      firstChildStyles: await collectStyles(page.locator(".app-shell > *").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-popup-shell.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} popup shell overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.shellStyles?.display === "grid",
      `${label} popup app shell lost its grid layout.`,
    );
    assert(
      result.firstChildStyles?.minWidth === "0px",
      `${label} popup app shell child lost min-width protection.`,
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
      sidepanelCompact: await reviewSidepanelShell(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
        "#dashboard",
      ),
      fullPageWide: await reviewSidepanelShell(
        baseUrl,
        browser,
        { width: 1200, height: 900 },
        "wide-full-page",
        "?surface=full-page#dashboard",
      ),
      popupCompact: await reviewPopupShell(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
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
  const reportPath = path.join(artifactDir, "app-shell-css-module-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase249: App shell CSS module split verified");
  console.log(`phase249: saved artifacts under ${artifactDir}`);
  console.log(`phase249: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase249: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase249: visual sidepanel_overflow=${visualResult.sidepanelCompact.overflow.overflowX} full_page_overflow=${visualResult.fullPageWide.overflow.overflowX} popup_overflow=${visualResult.popupCompact.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase249: App shell CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
