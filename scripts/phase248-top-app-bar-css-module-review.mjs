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
  "phase248-top-app-bar-css-module-review",
);
const devPort = 42648;

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
    packageJson.scripts["phase248:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase248-top-app-bar-css-module-review.mjs",
    "package.json is missing the expected phase248:review script.",
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
  const topAppBarTheme = await readProjectFile(
    "src/sidepanel/theme/top-app-bar.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
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
  assert(
    !popupEntry.includes("top-app-bar.css"),
    "popup entry should not import the sidepanel-only top-app-bar CSS module.",
  );
  assert(
    !materialTheme.includes("\n.top-app-bar") &&
      !materialTheme.includes("top-app-bar__headline") &&
      !materialTheme.includes("top-app-bar__eyebrow"),
    "material-theme.css still owns top-app-bar selectors.",
  );

  verifyMarkers(
    topAppBarTheme,
    "src/sidepanel/theme/top-app-bar.css",
    [
      ".top-app-bar",
      ".top-app-bar--sticky",
      ".top-app-bar__main",
      ".top-app-bar__actions",
      ".top-app-bar__eyebrow",
      ".top-app-bar__headline",
      "@media (max-width: 720px)",
      "@media (max-width: 480px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 12,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 3,
    },
    {
      scope: "src/sidepanel/theme/top-app-bar.css",
      markers: 8,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_248_Top_App_Bar_CSS_Module_Split.md",
      markers: [
        "Phase 248",
        "Top App Bar CSS Module Split",
        "npm run phase248:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/248_Phase_Top_App_Bar_CSS_Module_Split.md",
      markers: [
        "Phase 248",
        "completed and archived on 2026-05-03",
        "top-app-bar.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "248_Phase_Top_App_Bar_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 248", "Top app bar CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "Top app bar CSS now lives in `src/sidepanel/theme/top-app-bar.css`",
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
      alignItems: styles.alignItems,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      display: styles.display,
      flexDirection: styles.flexDirection,
      gap: styles.gap,
      gridTemplateColumns: styles.gridTemplateColumns,
      overflowWrap: styles.overflowWrap,
      position: styles.position,
      top: styles.top,
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

async function reviewTopAppBar(baseUrl, browser, viewport, label) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".top-app-bar", { timeout: 20_000 });
    await page.waitForSelector(".top-app-bar__bottom", { timeout: 20_000 });

    const firstAction = page.locator(".top-app-bar__actions .icon-button").first();
    await firstAction.focus();

    const result = {
      overflow: await collectOverflowState(page),
      topBarStyles: await collectStyles(page.locator(".top-app-bar")),
      mainStyles: await collectStyles(page.locator(".top-app-bar__main")),
      actionsStyles: await collectStyles(page.locator(".top-app-bar__actions")),
      headlineStyles: await collectStyles(page.locator(".top-app-bar__headline")),
      focusedActionStyles: await collectStyles(firstAction),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-settings-top-app-bar.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} Settings top app bar overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.topBarStyles?.display === "grid",
      `${label} top app bar lost its grid layout.`,
    );
    assert(
      result.topBarStyles?.position === "sticky",
      `${label} top app bar lost sticky positioning.`,
    );
    assert(
      result.topBarStyles?.borderRadius !== "0px",
      `${label} top app bar lost rounded shape.`,
    );
    assert(
      result.mainStyles?.display === "flex",
      `${label} top app bar main row lost flex layout.`,
    );
    assert(
      result.actionsStyles?.display === "flex",
      `${label} top app bar action row lost flex layout.`,
    );
    assert(
      result.headlineStyles?.overflowWrap === "anywhere" ||
        result.headlineStyles?.overflowWrap === "break-word",
      `${label} top app bar headline lost overflow wrapping.`,
    );
    assert(
      result.focusedActionStyles?.boxShadow !== "none",
      `${label} focused top app bar action lost focus/elevation treatment.`,
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
      compact: await reviewTopAppBar(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
      ),
      wide: await reviewTopAppBar(
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
    "top-app-bar-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase248: Top app bar CSS module split verified");
  console.log(`phase248: saved artifacts under ${artifactDir}`);
  console.log(`phase248: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase248: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase248: visual compact_overflow=${visualResult.compact.overflow.overflowX} wide_overflow=${visualResult.wide.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase248: Top app bar CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
