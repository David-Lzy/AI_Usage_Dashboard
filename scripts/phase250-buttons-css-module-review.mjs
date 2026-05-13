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
  "phase250-buttons-css-module-review",
);
const devPort = 42650;

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
    packageJson.scripts["phase250:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase250-buttons-css-module-review.mjs",
    "package.json is missing the expected phase250:review script.",
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
  const buttonsTheme = await readProjectFile("src/sidepanel/theme/buttons.css");

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/app-shell.css";',
    'import "./theme/buttons.css";',
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
    'import "../sidepanel/theme/usage-progress.css";',
    'import "./popup-theme.css";',
  ]);
  assert(
    !materialTheme.includes("\n.icon-button") &&
      !materialTheme.includes("\n.text-button") &&
      !materialTheme.includes("a.text-button"),
    "material-theme.css still owns button selectors.",
  );

  verifyMarkers(buttonsTheme, "src/sidepanel/theme/buttons.css", [
    ".icon-button",
    ".icon-button--primary",
    ".icon-button:focus-visible",
    ".text-button",
    "a.text-button:link",
    ".text-button:focus-visible",
    ".text-button--inline",
  ]);

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 14,
    },
    {
      scope: "src/popup/main.tsx",
      markers: 5,
    },
    {
      scope: "src/sidepanel/theme/material-theme.css",
      markers: 3,
    },
    {
      scope: "src/sidepanel/theme/buttons.css",
      markers: 7,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Archive/phase-reports/200-299/Phase_250_Buttons_CSS_Module_Split.md",
      markers: [
        "Phase 250",
        "Buttons CSS Module Split",
        "npm run phase250:review",
      ],
    },
    {
      relativePath: "Doc/TODOs/Archive/by-phase/200-299/250_Phase_Buttons_CSS_Module_Split.md",
      markers: [
        "Phase 250",
        "completed and archived on 2026-05-03",
        "buttons.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "250_Phase_Buttons_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 250", "Buttons CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "Button CSS now lives in `src/sidepanel/theme/buttons.css`",
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
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      display: styles.display,
      height: styles.height,
      minHeight: styles.minHeight,
      minWidth: styles.minWidth,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function reviewButtons(baseUrl, browser, target) {
  const page = await browser.newPage({ viewport: target.viewport });

  try {
    await page.goto(target.url(baseUrl), { waitUntil: "load" });
    await page.waitForSelector(".icon-button", { timeout: 20_000 });
    await page.waitForSelector(".text-button", { timeout: 20_000 });

    const iconButton = page.locator(".icon-button").first();
    const textButton = page.locator(".text-button").first();
    await iconButton.focus();
    const focusedIconStyles = await collectStyles(iconButton);
    await textButton.focus();
    const focusedTextStyles = await collectStyles(textButton);

    const result = {
      overflow: await collectOverflowState(page),
      iconStyles: await collectStyles(iconButton),
      textStyles: await collectStyles(textButton),
      focusedIconStyles,
      focusedTextStyles,
    };

    await page.screenshot({
      path: path.join(artifactDir, `${target.label}-buttons.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${target.label} button surface overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.iconStyles?.display === "inline-flex" ||
        result.iconStyles?.display === "flex",
      `${target.label} icon button lost flex layout.`,
    );
    assert(
      result.iconStyles?.height === "44px",
      `${target.label} icon button lost fixed touch target height.`,
    );
    assert(
      result.iconStyles?.borderRadius !== "0px",
      `${target.label} icon button lost rounded shape.`,
    );
    assert(
      result.textStyles?.display === "inline-flex" ||
        result.textStyles?.display === "flex",
      `${target.label} text button lost flex layout.`,
    );
    assert(
      result.textStyles?.borderRadius !== "0px",
      `${target.label} text button lost rounded shape.`,
    );
    assert(
      result.textStyles?.minHeight === "36px",
      `${target.label} text button lost minimum height.`,
    );
    assert(
      result.focusedIconStyles?.boxShadow !== "none",
      `${target.label} focused icon button lost focus/elevation treatment.`,
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
      sidepanel: await reviewButtons(baseUrl, browser, {
        label: "sidepanel-settings",
        viewport: { width: 420, height: 900 },
        url: (urlBase) => `${urlBase}/src/sidepanel/index.html#settings`,
      }),
      popup: await reviewButtons(baseUrl, browser, {
        label: "popup",
        viewport: { width: 420, height: 900 },
        url: (urlBase) => `${urlBase}/src/popup/index.html`,
      }),
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
  const reportPath = path.join(artifactDir, "buttons-css-module-review.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase250: Buttons CSS module split verified");
  console.log(`phase250: saved artifacts under ${artifactDir}`);
  console.log(`phase250: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase250: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase250: visual sidepanel_overflow=${visualResult.sidepanel.overflow.overflowX} popup_overflow=${visualResult.popup.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase250: Buttons CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
