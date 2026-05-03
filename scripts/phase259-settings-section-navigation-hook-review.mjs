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
  "phase259-settings-section-navigation-hook-review",
);
const devPort = 42659;

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
    packageJson.scripts["phase259:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase259-settings-section-navigation-hook-review.mjs",
    "package.json is missing the expected phase259:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "useSettingsSectionNavigation",
        "activeSettingsSection",
        "scrollToSection",
        "scrollToSettingsTop",
      ],
      forbiddenMarkers: [
        "IntersectionObserver",
        "SETTINGS_SECTION_ID_VALUES",
        "getPreferredScrollBehavior",
      ],
    },
    {
      relativePath: "src/sidepanel/use-settings-section-navigation.ts",
      markers: [
        "useSettingsSectionNavigation",
        "IntersectionObserver",
        "SETTINGS_SECTION_ID_VALUES",
        "getPreferredScrollBehavior",
        "scrollToSettingsTop",
      ],
    },
    {
      relativePath: "src/sidepanel/use-settings-section-navigation.test.tsx",
      markers: [
        "SettingsSectionNavigationProbe",
        "data-active-section",
        "data-has-section-scroll",
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
        "Doc/testing/Phase_259_Settings_Section_Navigation_Hook_Extraction.md",
      markers: [
        "Phase 259",
        "Settings Section Navigation Hook Extraction",
        "npm run phase259:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/259_Phase_Settings_Section_Navigation_Hook_Extraction.md",
      markers: [
        "Phase 259",
        "completed and archived on 2026-05-03",
        "useSettingsSectionNavigation",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "259_Phase_Settings_Section_Navigation_Hook_Extraction.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 259", "Settings section navigation hook extraction"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 259", "Settings section navigation hook extraction"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings section navigation state now lives in"],
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

async function collectSettingsNavigationState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const navigation = document.querySelector(".settings-section-nav");

    return {
      activeItems:
        navigation?.querySelectorAll('[aria-current="true"]').length ?? 0,
      backToTopButtons:
        document.querySelectorAll(".settings-back-to-top-fab").length,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      navButtons: navigation?.querySelectorAll("button").length ?? 0,
      settingsAnchors:
        document.querySelectorAll(".settings-section-anchor").length,
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
    await page.waitForSelector(".settings-section-nav button", {
      timeout: 20_000,
    });

    const result = await collectSettingsNavigationState(page);

    await page.screenshot({
      path: path.join(artifactDir, "settings-section-navigation-hook.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `settings navigation overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.navButtons >= 5, "settings section navigation buttons missing.");
    assert(
      result.activeItems === 1,
      "settings section navigation should expose exactly one active item.",
    );
    assert(
      result.backToTopButtons === 1,
      "settings back-to-top action should render once.",
    );
    assert(
      result.settingsAnchors >= 5,
      "settings section anchors should remain renderable.",
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
    "settings-section-navigation-hook-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase259: Settings section navigation hook extraction verified");
  console.log(`phase259: saved artifacts under ${artifactDir}`);
  console.log(`phase259: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase259: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase259: visual nav=${visualResult.navButtons} active=${visualResult.activeItems} anchors=${visualResult.settingsAnchors} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase259: Settings section navigation hook review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
