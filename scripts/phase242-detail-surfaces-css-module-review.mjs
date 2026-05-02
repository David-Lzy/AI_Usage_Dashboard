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
  "phase242-detail-surfaces-css-module-review",
);
const devPort = 42642;

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
    packageJson.scripts["phase242:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase242-detail-surfaces-css-module-review.mjs",
    "package.json is missing the expected phase242:review script.",
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
  const detailSurfacesTheme = await readProjectFile(
    "src/sidepanel/theme/detail-surfaces.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/detail-surfaces.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/settings-appearance.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("detail-surfaces.css"),
    "popup entry should not import the sidepanel-only detail-surfaces CSS module.",
  );
  assert(
    !materialTheme.includes("\n.detail-grid {\n") &&
      !materialTheme.includes("\n.detail-field {\n") &&
      !materialTheme.includes("\n.detail-note {\n") &&
      !materialTheme.includes("\n.detail-note--warning {\n"),
    "material-theme.css still owns detail-surface selectors.",
  );

  verifyMarkers(
    detailSurfacesTheme,
    "src/sidepanel/theme/detail-surfaces.css",
    [
      ".detail-grid",
      ".detail-field",
      ".detail-field__value",
      ".detail-note",
      ".detail-note--warning",
      ".detail-note--error",
      "@media (max-width: 720px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 7,
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
      scope: "src/sidepanel/theme/detail-surfaces.css",
      markers: 7,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Phase_242_Detail_Surfaces_CSS_Module_Split.md",
      markers: [
        "Phase 242",
        "Detail Surfaces CSS Module Split",
        "npm run phase242:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/242_Phase_Detail_Surfaces_CSS_Module_Split.md",
      markers: [
        "Phase 242",
        "completed and archived on 2026-05-03",
        "detail-surfaces.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "242_Phase_Detail_Surfaces_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 242",
        "detail-surfaces CSS module split",
      ],
    },
    {
      relativePath: "README.md",
      markers: [
        "detail-surfaces CSS now lives in `src/sidepanel/theme/detail-surfaces.css`",
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

async function reviewProviderDetail(baseUrl, browser) {
  const page = await browser.newPage({
    viewport: {
      width: 420,
      height: 900,
    },
  });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#provider-detail/codex`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".detail-field", { timeout: 20_000 });
    await page.waitForSelector(".detail-note--neutral", { timeout: 20_000 });

    const detailField = page.locator(".detail-field").first();
    const detailFieldValue = page.locator(".detail-field__value").first();
    const detailNote = page.locator(".detail-note--neutral").first();
    const statusCard = page.locator(".status-card").last();

    const result = {
      overflow: await collectOverflowState(page),
      detailFieldStyles: await collectStyles(detailField),
      detailFieldValueStyles: await collectStyles(detailFieldValue),
      detailNoteStyles: await collectStyles(detailNote),
      statusCardStyles: await collectStyles(statusCard),
    };

    await page.screenshot({
      path: path.join(artifactDir, "provider-detail-codex-detail-surfaces.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `provider detail overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.detailFieldStyles?.borderColor !== "rgba(0, 0, 0, 0)",
      "detail fields lost their explicit border.",
    );
    assert(
      result.detailFieldStyles?.backgroundColor !==
        result.statusCardStyles?.backgroundColor,
      "detail fields collapsed into the same background as the parent status card.",
    );
    assert(
      result.detailNoteStyles?.backgroundColor !==
        result.detailFieldStyles?.backgroundColor,
      "neutral detail notes no longer read as a stronger supporting surface than detail fields.",
    );
    assert(
      result.detailFieldValueStyles?.overflowWrap === "anywhere",
      "detail field values lost overflow-wrap:anywhere.",
    );

    return result;
  } finally {
    await page.close();
  }
}

async function reviewSettingsDiagnostics(baseUrl, browser) {
  const page = await browser.newPage({
    viewport: {
      width: 420,
      height: 900,
    },
  });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector("#settings-sources .source-card__details-toggle", {
      timeout: 20_000,
    });
    await page
      .locator("#settings-sources .source-card__details-toggle")
      .first()
      .click();
    await page.waitForSelector(".source-card__diagnostic-group", {
      timeout: 20_000,
    });
    await page.waitForSelector(".detail-note", { timeout: 20_000 });

    const detailNote = page.locator(".detail-note").first();
    const diagnosticGroup = page.locator(".source-card__diagnostic-group").first();
    const sourceCard = page.locator("#settings-sources .source-card").first();

    const result = {
      overflow: await collectOverflowState(page),
      detailNoteStyles: await collectStyles(detailNote),
      diagnosticGroupStyles: await collectStyles(diagnosticGroup),
      sourceCardStyles: await collectStyles(sourceCard),
    };

    await page.screenshot({
      path: path.join(artifactDir, "settings-diagnostics-detail-surfaces.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `settings diagnostics overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.detailNoteStyles?.borderColor !== "rgba(0, 0, 0, 0)",
      "settings detail notes lost their explicit border.",
    );
    assert(
      result.diagnosticGroupStyles?.backgroundColor !==
        result.sourceCardStyles?.backgroundColor,
      "diagnostic groups collapsed into the same background as the source card.",
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
      providerDetail: await reviewProviderDetail(baseUrl, browser),
      settingsDiagnostics: await reviewSettingsDiagnostics(baseUrl, browser),
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
    "detail-surfaces-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase242: detail-surfaces CSS module split verified");
  console.log(`phase242: saved artifacts under ${artifactDir}`);
  console.log(`phase242: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase242: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase242: visual provider_overflow=${visualResult.providerDetail.overflow.overflowX} settings_overflow=${visualResult.settingsDiagnostics.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase242: detail-surfaces CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
