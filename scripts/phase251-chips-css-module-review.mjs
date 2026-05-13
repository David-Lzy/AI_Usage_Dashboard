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
  "phase251-chips-css-module-review",
);
const devPort = 42651;

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
    packageJson.scripts["phase251:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase251-chips-css-module-review.mjs",
    "package.json is missing the expected phase251:review script.",
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
  const chipsTheme = await readProjectFile("src/sidepanel/theme/chips.css");

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/app-shell.css";',
    'import "./theme/buttons.css";',
    'import "./theme/chips.css";',
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
    'import "../sidepanel/theme/buttons.css";',
    'import "../sidepanel/theme/chips.css";',
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);
  assert(
    !materialTheme.includes("\n.token-chip") &&
      !materialTheme.includes("\n.status-chip") &&
      !materialTheme.includes("\n.meta-chip"),
    "material-theme.css still owns chip selectors.",
  );

  verifyMarkers(chipsTheme, "src/sidepanel/theme/chips.css", [
    ".token-chip",
    ".status-chip",
    ".status-chip--warning",
    ".status-chip--error",
    ".meta-chip",
    ".meta-chip--warning",
    ".meta-chip--error",
  ]);

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 15,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 6,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 3,
    },
    {
      scope: "src/sidepanel/theme/chips.css",
      markers: 7,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_251_Chips_CSS_Module_Split.md",
      markers: [
        "Phase 251",
        "Chips CSS Module Split",
        "npm run phase251:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/200-299/251_Phase_Chips_CSS_Module_Split.md",
      markers: [
        "Phase 251",
        "completed and archived on 2026-05-03",
        "chips.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "251_Phase_Chips_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 251", "Chips CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: ["Chip CSS now lives in `src/sidepanel/theme/chips.css`"],
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
      borderRadius: styles.borderRadius,
      display: styles.display,
      minHeight: styles.minHeight,
      padding: styles.padding,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

function assertChipStyles(styles, label, expectedMinHeight) {
  assert(
    styles?.display === "inline-flex" || styles?.display === "flex",
    `${label} lost flex chip layout.`,
  );
  assert(styles.borderRadius !== "0px", `${label} lost rounded chip shape.`);
  assert(
    styles.minHeight === expectedMinHeight,
    `${label} lost expected min-height ${expectedMinHeight}.`,
  );
}

async function reviewDashboardChips(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#dashboard`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".token-chip", { timeout: 20_000 });
    await page.waitForSelector(".status-chip", { timeout: 20_000 });
    await page.waitForSelector(".meta-chip", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      tokenChipStyles: await collectStyles(page.locator(".token-chip").first()),
      statusChipStyles: await collectStyles(page.locator(".status-chip").first()),
      metaChipStyles: await collectStyles(page.locator(".meta-chip").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, "dashboard-chips.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `dashboard chips overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertChipStyles(result.tokenChipStyles, "dashboard token chip", "32px");
    assertChipStyles(result.statusChipStyles, "dashboard status chip", "30px");
    assertChipStyles(result.metaChipStyles, "dashboard meta chip", "28px");

    return result;
  } finally {
    await page.close();
  }
}

async function reviewPopupChips(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/popup/index.html`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".meta-chip", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      metaChipStyles: await collectStyles(page.locator(".meta-chip").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, "popup-chips.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `popup chips overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertChipStyles(result.metaChipStyles, "popup meta chip", "28px");

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
      dashboard: await reviewDashboardChips(baseUrl, browser),
      popup: await reviewPopupChips(baseUrl, browser),
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
  const reportPath = path.join(artifactDir, "chips-css-module-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase251: Chips CSS module split verified");
  console.log(`phase251: saved artifacts under ${artifactDir}`);
  console.log(`phase251: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase251: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase251: visual dashboard_overflow=${visualResult.dashboard.overflow.overflowX} popup_overflow=${visualResult.popup.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase251: Chips CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
