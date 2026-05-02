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
  "phase244-form-controls-css-module-review",
);
const devPort = 42644;

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
    packageJson.scripts["phase244:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase244-form-controls-css-module-review.mjs",
    "package.json is missing the expected phase244:review script.",
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
  const formControlsTheme = await readProjectFile(
    "src/sidepanel/theme/form-controls.css",
  );

  verifyOrder(sidepanelEntry, "src/sidepanel/main.tsx", [
    'import "./theme/material-theme.css";',
    'import "./theme/detail-surfaces.css";',
    'import "./theme/form-controls.css";',
    'import "./theme/settings-source-cards.css";',
    'import "./theme/interaction-audit.css";',
    'import "./theme/settings-appearance.css";',
    'import "./theme/theme-recovery.css";',
    'import "./theme/usage-progress.css";',
    'import "./theme/provider-card.css";',
  ]);
  assert(
    !popupEntry.includes("form-controls.css"),
    "popup entry should not import the sidepanel-only form-controls CSS module.",
  );
  assert(
    !materialTheme.includes("\n.form-field {\n") &&
      !materialTheme.includes("\n.material-select {\n") &&
      !materialTheme.includes("\n.editable-number-combobox {\n") &&
      !materialTheme.includes("\n.switch-row {\n"),
    "material-theme.css still owns form-control selectors.",
  );

  verifyMarkers(formControlsTheme, "src/sidepanel/theme/form-controls.css", [
    ".form-field",
    ".form-field__control",
    ".material-select",
    ".material-select__menu",
    ".editable-number-combobox",
    ".editable-number-combobox__menu",
    ".switch-row",
    "@media (max-width: 720px)",
  ]);

  return [
    {
      scope: "src/sidepanel/main.tsx",
      markers: 9,
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
      scope: "src/sidepanel/theme/form-controls.css",
      markers: 8,
    },
  ];
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath: "Doc/testing/Phase_244_Form_Controls_CSS_Module_Split.md",
      markers: [
        "Phase 244",
        "Form Controls CSS Module Split",
        "npm run phase244:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/244_Phase_Form_Controls_CSS_Module_Split.md",
      markers: [
        "Phase 244",
        "completed and archived on 2026-05-03",
        "form-controls.css",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "244_Phase_Form_Controls_CSS_Module_Split.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 244", "form-controls CSS module split"],
    },
    {
      relativePath: "README.md",
      markers: [
        "form-controls CSS now lives in `src/sidepanel/theme/form-controls.css`",
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
      gridTemplateColumns: styles.gridTemplateColumns,
      minHeight: styles.minHeight,
      overflow: styles.overflow,
      textOverflow: styles.textOverflow,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function openSettings(baseUrl, browser, viewport) {
  const page = await browser.newPage({ viewport });

  await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
    waitUntil: "load",
  });
  await page.waitForSelector(".editable-number-combobox__anchor", {
    timeout: 20_000,
  });
  await page.waitForSelector(".material-select__button", {
    timeout: 20_000,
  });
  await page.waitForSelector(".switch-row", { timeout: 20_000 });

  return page;
}

async function reviewFormControls(baseUrl, browser, viewport, label) {
  const page = await openSettings(baseUrl, browser, viewport);

  try {
    const editableAnchor = page.locator(".editable-number-combobox__anchor").first();
    const editableButton = page
      .locator(".editable-number-combobox__menu-button")
      .first();
    await editableButton.evaluate((element) => {
      element.scrollIntoView({ block: "center", inline: "nearest" });
    });
    await editableButton.click();
    await page.waitForSelector(".editable-number-combobox__menu", {
      timeout: 20_000,
    });
    const editableMenuStyles = await collectStyles(
      page.locator(".editable-number-combobox__menu").first(),
    );
    await page.keyboard.press("Escape");
    await page
      .locator(".editable-number-combobox__menu")
      .first()
      .waitFor({ state: "detached", timeout: 20_000 });

    const materialSelectButton = page.locator(".material-select__button").first();
    await materialSelectButton.evaluate((element) => {
      element.scrollIntoView({ block: "center", inline: "nearest" });
    });
    await materialSelectButton.click();
    await page.waitForSelector(".material-select__menu", {
      timeout: 20_000,
    });

    const result = {
      overflow: await collectOverflowState(page),
      formControlStyles: await collectStyles(
        page.locator(".form-field__control").first(),
      ),
      editableAnchorStyles: await collectStyles(editableAnchor),
      editableMenuStyles,
      materialButtonStyles: await collectStyles(materialSelectButton),
      materialMenuStyles: await collectStyles(
        page.locator(".material-select__menu").first(),
      ),
      materialValueStyles: await collectStyles(
        page.locator(".material-select__value").first(),
      ),
      switchRowStyles: await collectStyles(page.locator(".switch-row").first()),
    };

    await page.screenshot({
      path: path.join(artifactDir, `${label}-form-controls.png`),
      fullPage: true,
    });

    assert(
      result.overflow.overflowX === 0,
      `${label} form controls overflowed horizontally (${result.overflow.overflowX}px).`,
    );
    assert(
      result.formControlStyles?.borderColor !== "rgba(0, 0, 0, 0)",
      `${label} text form controls lost their explicit border.`,
    );
    assert(
      result.editableAnchorStyles?.gridTemplateColumns.includes("48px"),
      `${label} editable number anchor lost its menu-button grid column.`,
    );
    assert(
      result.editableMenuStyles?.boxShadow !== "none",
      `${label} editable number menu lost its elevated menu shadow.`,
    );
    assert(
      result.materialButtonStyles?.gridTemplateColumns.includes("48px"),
      `${label} Material select button lost its menu-icon grid column.`,
    );
    assert(
      result.materialMenuStyles?.boxShadow !== "none",
      `${label} Material select menu lost its elevated menu shadow.`,
    );
    assert(
      result.materialValueStyles?.textOverflow === "ellipsis",
      `${label} Material select value lost ellipsis overflow treatment.`,
    );
    assert(
      result.switchRowStyles?.borderRadius !== "0px",
      `${label} switch rows lost their rounded Material row shape.`,
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
      compact: await reviewFormControls(
        baseUrl,
        browser,
        { width: 420, height: 900 },
        "compact",
      ),
      wide: await reviewFormControls(
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
    "form-controls-css-module-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase244: form-controls CSS module split verified");
  console.log(`phase244: saved artifacts under ${artifactDir}`);
  console.log(`phase244: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase244: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase244: visual compact_overflow=${visualResult.compact.overflow.overflowX} wide_overflow=${visualResult.wide.overflow.overflowX}`,
  );
}

runReview().catch((error) => {
  console.error("phase244: form-controls CSS module review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
