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
  "phase261-settings-preferences-section-component-review",
);
const devPort = 42661;

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

async function verifyPackageScript() {
  const packageJson = await readJson("package.json");

  assert(
    packageJson.scripts["phase261:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase261-settings-preferences-section-component-review.mjs",
    "package.json is missing the expected phase261:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "SettingsPreferencesSection",
        "handleApplyThemeCustomSeed",
        "themeCustomSeedDraft",
      ],
      forbiddenMarkers: [
        "EditableNumberCombobox",
        "MaterialSelect",
        "buildActionBadgeSelectOptions",
        "popup-appearance-preview-card",
        "theme-customization-card",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsPreferencesSection.tsx",
      markers: [
        "SettingsPreferencesSection",
        "EditableNumberCombobox",
        "MaterialSelect",
        "buildActionBadgeSelectOptions",
        "popup-appearance-preview-card",
        "theme-customization-form",
      ],
    },
    {
      relativePath:
        "src/sidepanel/components/SettingsPreferencesSection.test.tsx",
      markers: [
        "renders preference controls, popup preview, and theme customization",
        "data-settings-custom-number-field",
        "action-badge-selection",
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
    for (const forbiddenMarker of expectation.forbiddenMarkers ?? []) {
      assert(
        !fileContent.includes(forbiddenMarker),
        `${expectation.relativePath} still contains forbidden inline marker: ${forbiddenMarker}`,
      );
    }
    results.push({
      scope: expectation.relativePath,
      markers:
        expectation.markers.length + (expectation.forbiddenMarkers?.length ?? 0),
    });
  }

  return results;
}

async function verifyDocsMarkers() {
  const expectations = [
    {
      relativePath:
        "Doc/testing/Archive/phase-reports/200-299/Phase_261_Settings_Preferences_Section_Component_Extraction.md",
      markers: [
        "Phase 261",
        "Settings Preferences Section Component Extraction",
        "npm run phase261:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/261_Phase_Settings_Preferences_Section_Component_Extraction.md",
      markers: [
        "Phase 261",
        "completed and archived on 2026-05-03",
        "SettingsPreferencesSection",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "261_Phase_Settings_Preferences_Section_Component_Extraction.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: [
        "Phase 261",
        "Settings preferences section component extraction",
      ],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: [
        "Phase 261",
        "Settings preferences section component extraction",
      ],
    },
    {
      relativePath: "README.md",
      markers: ["Settings preferences section now lives in"],
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

async function collectSettingsPreferencesState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const preferences = document.querySelector("#settings-preferences");

    return {
      customNumberFields:
        preferences?.querySelectorAll("[data-settings-custom-number-field]")
          .length ?? 0,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      materialSelects:
        preferences?.querySelectorAll("[data-settings-material-select]")
          .length ?? 0,
      popupPreviewCards:
        preferences?.querySelectorAll(".popup-appearance-preview-card")
          .length ?? 0,
      sectionLabel:
        preferences?.querySelector(".section-label")?.textContent?.trim() ??
        null,
      themeForms:
        preferences?.querySelectorAll(".theme-customization-form").length ?? 0,
    };
  });
}

async function runVisualReview(baseUrl) {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  try {
    await page.goto(`${baseUrl}/src/sidepanel/index.html#settings`, {
      waitUntil: "load",
    });
    await page.waitForSelector("#settings-preferences .settings-grid", {
      timeout: 20_000,
    });

    const result = await collectSettingsPreferencesState(page);

    await page.screenshot({
      path: path.join(artifactDir, "settings-preferences-section.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `settings preferences overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.sectionLabel !== null, "settings preferences label missing.");
    assert(
      result.customNumberFields === 2,
      "settings preferences should render two editable number fields.",
    );
    assert(
      result.materialSelects >= 8,
      "settings preferences Material select controls are missing.",
    );
    assert(
      result.popupPreviewCards === 1,
      "settings popup appearance preview should render once.",
    );
    assert(
      result.themeForms === 1,
      "settings theme customization form should render once.",
    );

    return result;
  } finally {
    await page.close();
    await browser.close();
  }
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const markerResults = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
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
  const reportPath = path.join(
    artifactDir,
    "settings-preferences-section-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(
    "phase261: Settings preferences section component extraction verified",
  );
  console.log(`phase261: saved artifacts under ${artifactDir}`);
  console.log(`phase261: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase261: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase261: visual custom=${visualResult.customNumberFields} selects=${visualResult.materialSelects} preview=${visualResult.popupPreviewCards} themeForms=${visualResult.themeForms} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error(
    "phase261: Settings preferences section component review failed",
  );
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
