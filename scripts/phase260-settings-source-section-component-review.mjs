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
  "phase260-settings-source-section-component-review",
);
const devPort = 42660;

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
    packageJson.scripts["phase260:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase260-settings-source-section-component-review.mjs",
    "package.json is missing the expected phase260:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "SettingsSourceSection",
        "onSetSourcePreference",
        "settingsCopy={settingsCopy}",
      ],
      forbiddenMarkers: [
        "buildProviderSourceDisplay",
        "buildSettingsSourceCardModel",
        "source-card__details-toggle",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSourceSection.tsx",
      markers: [
        "SettingsSourceSection",
        "buildProviderSourceDisplay",
        "buildSettingsSourceCardModel",
        "MaterialSelect",
        "source-card__details-toggle",
        "source-card__session-actions",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSourceSection.test.tsx",
      markers: [
        "renders source cards with stable source hooks",
        "data-provider-id",
        "source-preference-cursor",
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
        "Doc/testing/Phase_260_Settings_Source_Section_Component_Extraction.md",
      markers: [
        "Phase 260",
        "Settings Source Section Component Extraction",
        "npm run phase260:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/260_Phase_Settings_Source_Section_Component_Extraction.md",
      markers: [
        "Phase 260",
        "completed and archived on 2026-05-03",
        "SettingsSourceSection",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "260_Phase_Settings_Source_Section_Component_Extraction.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 260", "Settings source section component extraction"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 260", "Settings source section component extraction"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings source section now lives in"],
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

async function collectSettingsSourceState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const sources = document.querySelector("#settings-sources");

    return {
      detailToggles:
        sources?.querySelectorAll(".source-card__details-toggle").length ?? 0,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      preferenceComboboxes:
        sources?.querySelectorAll(
          '[data-settings-material-select^="source-preference-"]',
        ).length ?? 0,
      sessionActionButtons:
        sources?.querySelectorAll(".source-card__session-actions button")
          .length ?? 0,
      sourceCards: sources?.querySelectorAll(".source-card").length ?? 0,
      title:
        sources?.querySelector(".section-title")?.textContent?.trim() ?? null,
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
    await page.waitForSelector("#settings-sources .source-card", {
      timeout: 20_000,
    });

    const result = await collectSettingsSourceState(page);

    await page.screenshot({
      path: path.join(artifactDir, "settings-source-section.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `settings sources overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.title !== null, "settings sources title is missing.");
    assert(result.sourceCards >= 4, "settings sources did not render cards.");
    assert(
      result.detailToggles === result.sourceCards,
      "source card count and details toggle count diverged.",
    );
    assert(
      result.preferenceComboboxes >= 1,
      "source preference Material select controls are missing.",
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
    "settings-source-section-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase260: Settings source section component extraction verified");
  console.log(`phase260: saved artifacts under ${artifactDir}`);
  console.log(`phase260: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase260: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase260: visual cards=${visualResult.sourceCards} details=${visualResult.detailToggles} selects=${visualResult.preferenceComboboxes} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase260: Settings source section component review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
