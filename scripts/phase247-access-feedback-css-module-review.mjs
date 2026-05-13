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
  "phase247-access-feedback-css-module-review",
);
const devPort = 42647;

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
    packageJson.scripts["phase247:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase247-access-feedback-css-module-review.mjs",
    "package.json is missing the expected phase247:review script.",
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
  const accessFeedbackTheme = await readProjectFile(
    "src/sidepanel/theme/access-feedback.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/access-feedback.css";',
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
    !popupEntry.includes("access-feedback.css"),
    "popup entry should not import the sidepanel-only access-feedback CSS module.",
  );
  assert(
    !materialTheme.includes("@keyframes app-toast-enter") &&
      !materialTheme.includes("\n.permission-prompt") &&
      !materialTheme.includes("\n.credential-card") &&
      !materialTheme.includes("\n.credential-actions") &&
      !materialTheme.includes("\n.toast"),
    "material-theme.css still owns access-feedback selectors.",
  );

  verifyMarkers(
    accessFeedbackTheme,
    "src/sidepanel/theme/access-feedback.css",
    [
      "@keyframes app-toast-enter",
      ".permission-prompt",
      ".permission-prompt--warning",
      ".credential-card",
      ".credential-state--configured",
      ".credential-state--missing",
      ".toast",
      ".toast--success",
      ".toast--error",
      "@media (max-width: 720px)",
    ],
  );

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 11,
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
      scope: "src/sidepanel/theme/access-feedback.css",
      markers: 10,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_247_Access_Feedback_CSS_Module_Split.md",
      markers: [
        "Phase 247",
        "Access Feedback CSS Module Split",
        "npm run phase247:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/247_Phase_Access_Feedback_CSS_Module_Split.md",
      markers: [
        "Phase 247",
        "completed and archived on 2026-05-03",
        "access-feedback.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "247_Phase_Access_Feedback_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 247", "Access feedback CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "Access feedback CSS now lives in `src/sidepanel/theme/access-feedback.css`",
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
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      display: styles.display,
      flexWrap: styles.flexWrap,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function reviewSettingsAccessFeedback(baseUrl, browser, viewport, label) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector(".credential-state", { timeout: 20_000 });
    await page.waitForSelector(".credential-actions", { timeout: 20_000 });

    await page.locator(".top-app-bar__actions .icon-button--primary").click();
    await page.waitForSelector(".toast", { timeout: 20_000 });

    const result = {
      overflow: await collectOverflowState(page),
      credentialStateStyles: await collectStyles(
        page.locator(".credential-state").first(),
      ),
      credentialActionsStyles: await collectStyles(
        page.locator(".credential-actions").first(),
      ),
      toastStyles: await collectStyles(page.locator(".toast")),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-settings-access-feedback.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} Settings access-feedback surfaces overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.credentialStateStyles?.borderRadius !== "0px",
      `${label} credential state lost its rounded chip shape.`,
    );
    assert(
      result.credentialActionsStyles?.display === "flex" &&
        result.credentialActionsStyles.flexWrap === "wrap",
      `${label} credential actions should remain a wrapping flex row.`,
    );
    assert(
      result.toastStyles?.display === "flex",
      `${label} settings toast lost its flex layout.`,
    );
    assert(
      result.toastStyles?.animationName === "app-toast-enter",
      `${label} settings toast lost its entry animation contract.`,
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
      compact: await reviewSettingsAccessFeedback(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
      ),
      wide: await reviewSettingsAccessFeedback(
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
    "access-feedback-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase247: Access feedback CSS module split verified");
  console.log(`phase247: saved artifacts under ${artifactDir}`);
  console.log(`phase247: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase247: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase247: visual compact_overflow=${visualResult.compact.overflow.overflowX} wide_overflow=${visualResult.wide.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase247: Access feedback CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
