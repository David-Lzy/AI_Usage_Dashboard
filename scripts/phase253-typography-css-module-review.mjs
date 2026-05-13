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
  "phase253-typography-css-module-review",
);
const devPort = 42653;

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
    packageJson.scripts["phase253:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase253-typography-css-module-review.mjs",
    "package.json is missing the expected phase253:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyCssSplit() {
  const sidepanelEntry = await readProjectFile("src/sidepanel/main.tsx");
  const popupEntry = await readProjectFile("src/popup/main.tsx");
  const materialTheme = await readProjectFile(
    "src/sidepanel/theme/material-theme.css",
  );
  const typographyTheme = await readProjectFile(
    "src/sidepanel/theme/typography.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/app-shell.css";',
    'import "./theme/buttons.css";',
    'import "./theme/chips.css";',
    'import "./theme/typography.css";',
    'import "./theme/surfaces.css";',
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
    'import "../sidepanel/theme/typography.css";',
    'import "../sidepanel/theme/surfaces.css";',
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);

  assert(
    !materialTheme.includes("\n.section-label") &&
      !materialTheme.includes("\n.display-headline") &&
      !materialTheme.includes("\n.body-copy") &&
      !materialTheme.includes("\n.supporting-copy") &&
      !materialTheme.includes("\n.feature-list") &&
      !materialTheme.includes("\n.token-list"),
    "material-theme.css still owns shared typography selectors.",
  );

  verifyMarkers(typographyTheme, "src/sidepanel/theme/typography.css", [
    ".section-label",
    ".display-headline",
    ".section-title",
    ".body-copy",
    ".supporting-copy",
    ".feature-list",
    ".token-list",
    "overflow-wrap: anywhere",
    "@media (max-width: 480px)",
  ]);

  return [
    { scope: "src/sidepanel/main.tsx", markers: 17 },
    { scope: "src/popup/main.tsx", markers: 8 },
    { scope: "src/sidepanel/theme/material-theme.css", markers: 6 },
    { scope: "src/sidepanel/theme/typography.css", markers: 9 },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_253_Typography_CSS_Module_Split.md",
      markers: [
        "Phase 253",
        "Typography CSS Module Split",
        "npm run phase253:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/253_Phase_Typography_CSS_Module_Split.md",
      markers: [
        "Phase 253",
        "completed and archived on 2026-05-03",
        "typography.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "253_Phase_Typography_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 253", "Typography CSS module split"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 253", "typography CSS module"],
    },
    {
      relativePath: "README.md",
      markers: [
        "Typography CSS now lives in `src/sidepanel/theme/typography.css`",
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

  return { server, getLogTail: () => logs.join("\n") };
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

async function collectTypographyStyles(locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(element);

    return {
      color: styles.color,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      letterSpacing: styles.letterSpacing,
      lineHeight: styles.lineHeight,
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
      overflowWrap: styles.overflowWrap,
      paddingInlineStart: styles.paddingInlineStart,
      textTransform: styles.textTransform,
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

function assertTextPrimitiveStyles(styles, label) {
  assert(styles !== null, `${label} did not resolve to an HTML element.`);
  assert(styles.fontSize !== "0px", `${label} lost font sizing.`);
  assert(styles.lineHeight !== "normal", `${label} lost token line height.`);
  assert(styles.marginTop === "0px", `${label} top margin is not reset.`);
  assert(styles.marginBottom === "0px", `${label} bottom margin is not reset.`);
}

async function reviewDashboardTypography(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#dashboard`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".hero-card .display-headline", {
      timeout: 20_000,
    });

    const result = {
      overflow: await collectOverflowState(page),
      sectionLabel: await collectTypographyStyles(
        page.locator(".hero-card .section-label").first(),
      ),
      displayHeadline: await collectTypographyStyles(
        page.locator(".hero-card .display-headline").first(),
      ),
      bodyCopy: await collectTypographyStyles(
        page.locator(".hero-card .body-copy").first(),
      ),
      supportingCopy: await collectTypographyStyles(
        page.locator(".dashboard-section__header .supporting-copy").first(),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "dashboard-typography.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `dashboard typography overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertTextPrimitiveStyles(result.sectionLabel, "dashboard section-label");
    assertTextPrimitiveStyles(
      result.displayHeadline,
      "dashboard display-headline",
    );
    assertTextPrimitiveStyles(result.bodyCopy, "dashboard body-copy");
    assertTextPrimitiveStyles(result.supportingCopy, "dashboard supporting-copy");
    assert(
      result.sectionLabel.textTransform === "uppercase",
      "dashboard section-label lost uppercase treatment.",
    );
    assert(
      result.bodyCopy.overflowWrap === "anywhere" ||
        result.bodyCopy.wordBreak === "break-word",
      "dashboard body-copy lost overflow protection.",
    );

    return result;
  } finally {
    await page.close();
  }
}

async function reviewSettingsTypography(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".settings-overview .section-label", {
      timeout: 20_000,
    });

    const result = {
      overflow: await collectOverflowState(page),
      sectionLabel: await collectTypographyStyles(
        page.locator(".settings-overview .section-label").first(),
      ),
      supportingCopy: await collectTypographyStyles(
        page.locator(".settings-overview .supporting-copy").first(),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "settings-typography.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `settings typography overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertTextPrimitiveStyles(result.sectionLabel, "settings section-label");
    assertTextPrimitiveStyles(result.supportingCopy, "settings supporting-copy");

    return result;
  } finally {
    await page.close();
  }
}

async function reviewPopupTypography(baseUrl, browser) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/popup/index.html`, { waitUntil: "load" });
    await page.waitForSelector(".popup-header .section-label", {
      timeout: 20_000,
    });
    await page.waitForSelector(".popup-shell .supporting-copy", {
      timeout: 20_000,
    });

    const result = {
      overflow: await collectOverflowState(page),
      sectionLabel: await collectTypographyStyles(
        page.locator(".popup-header .section-label").first(),
      ),
      supportingCopy: await collectTypographyStyles(
        page.locator(".popup-shell .supporting-copy").first(),
      ),
    };

    await page.screenshot({
      path: path.join(artifactDir, "popup-typography.png"),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `popup typography overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assertTextPrimitiveStyles(result.sectionLabel, "popup section-label");
    assertTextPrimitiveStyles(result.supportingCopy, "popup supporting-copy");

    return result;
  } finally {
    await page.close();
  }
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({ channel: "chromium", headless: true });

  try {
    return {
      dashboard: await reviewDashboardTypography(baseUrl, browser),
      settings: await reviewSettingsTypography(baseUrl, browser),
      popup: await reviewPopupTypography(baseUrl, browser),
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

  const report = { markers: markerResults, visual: visualResult };
  const reportPath = path.join(artifactDir, "typography-css-module-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase253: Typography CSS module split verified");
  console.log(`phase253: saved artifacts under ${artifactDir}`);
  console.log(`phase253: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase253: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase253: visual dashboard_overflow=${visualResult.dashboard.overflow.overflowX} settings_overflow=${visualResult.settings.overflow.overflowX} popup_overflow=${visualResult.popup.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase253: Typography CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
