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
  "phase241-settings-appearance-css-module-review",
);
const devPort = 42641;

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
    packageJson.scripts["phase241:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase241-settings-appearance-css-module-review.mjs",
    "package.json is missing the expected phase241:review script.",
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
  const settingsAppearanceTheme = await readProjectFile(
    "src/sidepanel/theme/settings-appearance.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/settings-appearance.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("settings-appearance.css"),
    "popup entry should not import the sidepanel-only Settings appearance CSS module.",
  );
  assert(
    !materialTheme.includes("popup-appearance-preview") &&
      !materialTheme.includes("theme-preview") &&
      !materialTheme.includes("theme-customization-card"),
    "material-theme.css still owns Settings appearance selectors.",
  );

  verifyMarkers(
    settingsAppearanceTheme,
    "src/sidepanel/theme/settings-appearance.css",
    [
      ".theme-customization-card",
      ".popup-appearance-preview-card",
      ".popup-appearance-preview-frame",
      ".popup-appearance-preview-surface",
      ".theme-preview-grid",
      ".theme-preview-swatch__color",
      "@media (max-width: 720px)",
      "@media (max-width: 480px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 6,
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
      scope: "src/sidepanel/theme/settings-appearance.css",
      markers: 8,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Phase_241_Settings_Appearance_CSS_Module_Split.md",
      markers: [
        "Phase 241",
        "Settings Appearance CSS Module Split",
        "npm run phase241:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/241_Phase_Settings_Appearance_CSS_Module_Split.md",
      markers: [
        "Phase 241",
        "completed and archived on 2026-05-03",
        "settings-appearance.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "241_Phase_Settings_Appearance_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 241",
        "Settings appearance CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "Settings appearance CSS now lives in `src/sidepanel/theme/settings-appearance.css`",
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

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: {
      width: 420,
      height: 980,
    },
  });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".popup-appearance-preview-card", {
      timeout: 20_000,
    });
    await page.locator('input[placeholder="#4F46E5"]').fill("#4F46E5");
    await page.waitForSelector(".theme-preview-grid", {
      timeout: 20_000,
    });

    const snapshot = await page.evaluate(() => {
      const root = document.documentElement;
      const previewCard = document.querySelector(".popup-appearance-preview-card");
      const previewSurface = document.querySelector(
        ".popup-appearance-preview-surface",
      );
      const themeGrid = document.querySelector(".theme-preview-grid");
      const swatches = Array.from(
        document.querySelectorAll(".theme-preview-swatch__color"),
      );

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
          gridTemplateColumns: styles.gridTemplateColumns,
          width: styles.width,
        };
      };

      return {
        horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
        swatchCount: swatches.length,
        previewCard: styleSnapshot(previewCard),
        previewSurface: styleSnapshot(previewSurface),
        themeGrid: styleSnapshot(themeGrid),
      };
    });

    assert(
      snapshot.horizontalOverflow <= 1,
      `Settings appearance section overflowed horizontally (${snapshot.horizontalOverflow}px).`,
    );
    assert(
      snapshot.swatchCount === 3,
      `expected 3 theme preview swatches, found ${snapshot.swatchCount}.`,
    );
    assert(
      snapshot.previewCard?.display === "grid",
      `popup appearance preview card lost grid display: ${JSON.stringify(snapshot.previewCard)}`,
    );
    assert(
      snapshot.previewSurface?.borderRadius !== "0px",
      "popup appearance preview surface lost rounded shape.",
    );
    assert(
      snapshot.themeGrid?.display === "grid",
      `theme preview grid lost grid display: ${JSON.stringify(snapshot.themeGrid)}`,
    );

    const screenshotPath = path.join(
      artifactDir,
      "settings-appearance-css-module.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    return {
      screenshotPath,
      snapshot,
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
    "settings-appearance-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase241: Settings appearance CSS module split verified");
  console.log(`phase241: saved artifacts under ${artifactDir}`);
  console.log(`phase241: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase241: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase241: visual swatches=${visualResult.snapshot.swatchCount} overflow=${visualResult.snapshot.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase241: Settings appearance CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
