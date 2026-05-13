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
  "phase245-popup-theme-css-module-review",
);
const devPort = 42645;

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
    packageJson.scripts["phase245:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase245-popup-theme-css-module-review.mjs",
    "package.json is missing the expected phase245:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyCssSplit() {
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const popupTheme = await readProjectFile("src/popup/popup-theme.css");

  verifyOrder(popupEntry, "src/popup/main.tsx", [
    'import "../sidepanel/theme/material-theme.css";',
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);
  assert(
    !sidepanelEntry.includes("popup-theme.css"),
    "sidepanel entry should not import the popup-only theme module.",
  );
  assert(
    !materialTheme.includes("popup-page") &&
      !materialTheme.includes("popup-shell") &&
      !materialTheme.includes("popup-provider-card") &&
      !materialTheme.includes("popup-progress-ring"),
    "material-theme.css still owns popup-only selectors.",
  );

  verifyMarkers(popupTheme, "src/popup/popup-theme.css", [
    "html.popup-page",
    ".popup-shell",
    ".popup-provider-card",
    ".popup-provider-card__progress--circle",
    ".popup-progress-ring",
    ".popup-provider-card__provider",
    "@media (max-width: 720px)",
    "@media (max-width: 480px)",
  ]);

  return [
    {
      scope: "src/popup/main.tsx",
      markers: 3,
    },
    {
      scope: "src/sidepanel/main.tsx",
      markers: 1,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 4,
    },
    {
      scope: "src/popup/popup-theme.css",
      markers: 8,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_245_Popup_Theme_CSS_Module_Split.md",
      markers: [
        "Phase 245",
        "Popup Theme CSS Module Split",
        "npm run phase245:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/245_Phase_Popup_Theme_CSS_Module_Split.md",
      markers: [
        "Phase 245",
        "completed and archived on 2026-05-03",
        "popup-theme.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "Phase 245",
        "popup-only",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 245", "popup-theme CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "popup-theme CSS now lives in `src/popup/popup-theme.css`",
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
      const response = await fetch(`${baseUrl}/src/popup/index.html`);
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
      gap: styles.gap,
      gridTemplateColumns: styles.gridTemplateColumns,
      maxWidth: styles.maxWidth,
      minWidth: styles.minWidth,
      width: styles.width,
    };
  });
}

async function collectPopupState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    htmlWidth: getComputedStyle(document.documentElement).width,
    bodyWidth: getComputedStyle(document.body).width,
    popupSizePreset:
      document.documentElement.getAttribute("data-popup-size-preset"),
    popupCornerStyle:
      document.documentElement.getAttribute("data-popup-corner-style"),
    popupShadowStyle:
      document.documentElement.getAttribute("data-popup-shadow-style"),
  }));
}

async function reviewPopup(baseUrl, browser, viewport, label) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${baseUrl}/src/popup/index.html`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".popup-shell", { timeout: 20_000 });
    await page.waitForSelector(".popup-actions", { timeout: 20_000 });
    await page.waitForSelector(".popup-provider-card", { timeout: 20_000 });

    const result = {
      popupState: await collectPopupState(page),
      shellStyles: await collectStyles(page.locator(".popup-shell").first()),
      statusCardStyles: await collectStyles(page.locator(".status-card").first()),
      providerCardStyles: await collectStyles(
        page.locator(".popup-provider-card").first(),
      ),
      providerHeaderStyles: await collectStyles(
        page.locator(".popup-provider-card__header").first(),
      ),
      progressStyles: await collectStyles(
        page.locator(".popup-provider-card__progress").first(),
      ),
      actionsStyles: await collectStyles(page.locator(".popup-actions").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-popup-theme.png`),
      fullPage: true,
    });

    assert(
      result.popupState.overflowX === 0,
      `${label} popup overflowed horizontally (${result.popupState.overflowX}px).`,
    );
    assert(
      result.shellStyles?.minWidth === "0px",
      `${label} popup shell should use the popup-page min-width override.`,
    );
    assert(
      result.statusCardStyles?.borderRadius !== "0px",
      `${label} popup status cards lost their runtime radius.`,
    );
    assert(
      result.providerCardStyles?.boxShadow !== "none",
      `${label} popup provider cards lost their configured elevation.`,
    );
    assert(
      result.providerHeaderStyles?.display === "flex",
      `${label} popup provider-card header lost its flex layout.`,
    );
    assert(
      result.progressStyles?.display === "grid",
      `${label} popup provider-card progress lost its grid layout.`,
    );
    assert(
      result.actionsStyles?.display === "flex",
      `${label} popup actions lost their flex layout.`,
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
      balanced: await reviewPopup(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "balanced",
      ),
      narrow: await reviewPopup(
        baseUrl,
        browser,
        { width: 360, height: 900 },
        "narrow",
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
    "popup-theme-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase245: popup-theme CSS module split verified");
  console.log(`phase245: saved artifacts under ${artifactDir}`);
  console.log(`phase245: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase245: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase245: visual balanced_overflow=${visualResult.balanced.popupState.overflowX} narrow_overflow=${visualResult.narrow.popupState.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase245: popup-theme CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
