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
  "phase255-settings-navigation-component-review",
);
const devPort = 42655;

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
    packageJson.scripts["phase255:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase255-settings-navigation-component-review.mjs",
    "package.json is missing the expected phase255:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "SettingsSectionNavigation",
        "SettingsBackToTopButton",
        "SETTINGS_SECTION_ID_VALUES",
        "settingsSectionNavItems",
        "scrollToSection",
        "scrollToSettingsTop",
      ],
      forbiddenMarkers: [
        'className="settings-section-nav"',
        'className="settings-back-to-top-fab"',
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsNavigation.tsx",
      markers: [
        "SettingsSectionNavigation",
        "SettingsBackToTopButton",
        "settings-section-nav",
        "settings-nav-chip",
        "settings-back-to-top-fab",
        "settings-back-to-top-fab__label",
      ],
    },
    {
      relativePath: "src/sidepanel/settings-section-ids.ts",
      markers: [
        "SETTINGS_SECTION_IDS",
        "SettingsSectionId",
        "SETTINGS_SECTION_ID_VALUES",
        "settings-preferences",
        "settings-permissions",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsNavigation.test.tsx",
      markers: [
        "renders section chips with one active section",
        "renders the back-to-top floating action",
      ],
    },
    {
      relativePath: "src/sidepanel/routes/SettingsPage.test.tsx",
      markers: [
        "renders section navigation inside the top bar and a back-to-top action",
        "settings-section-nav",
        "settings-back-to-top-fab",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_255_Settings_Navigation_Component_Extraction.md",
      markers: [
        "Phase 255",
        "Settings Navigation Component Extraction",
        "npm run phase255:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/255_Phase_Settings_Navigation_Component_Extraction.md",
      markers: [
        "Phase 255",
        "completed and archived on 2026-05-03",
        "SettingsNavigation.tsx",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "255_Phase_Settings_Navigation_Component_Extraction.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 255", "Settings navigation component extraction"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 255", "Settings navigation component extraction"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings navigation components now live in"],
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
    const nav = document.querySelector(".settings-section-nav");
    const activeChip = document.querySelector(
      '.settings-nav-chip[data-active="true"]',
    );
    const fab = document.querySelector(".settings-back-to-top-fab");
    const topBarBottom = document.querySelector(".top-app-bar__bottom");
    const root = document.documentElement;

    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      const rect = element.getBoundingClientRect();
      const styles = getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        styles.display !== "none" &&
        styles.visibility !== "hidden"
      );
    };

    return {
      activeChipText: activeChip?.textContent?.trim() ?? null,
      fabAriaLabel: fab?.getAttribute("aria-label") ?? null,
      fabLabel: fab
        ?.querySelector(".settings-back-to-top-fab__label")
        ?.textContent?.trim() ?? null,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      navChipCount: nav?.querySelectorAll(".settings-nav-chip").length ?? 0,
      navInTopBar: Boolean(topBarBottom?.contains(nav)),
      navVisible: isVisible(nav),
      fabVisible: isVisible(fab),
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
    await page.waitForSelector(".settings-section-nav", { timeout: 20_000 });
    await page.waitForSelector(".settings-back-to-top-fab", {
      timeout: 20_000,
    });

    const result = await collectSettingsNavigationState(page);

    await page.screenshot({
      path: path.join(artifactDir, "settings-navigation-component.png"),
      fullPage: true,
    });

    assert(result.navInTopBar, "settings section nav is no longer in TopBar bottom content.");
    assert(result.navVisible, "settings section nav is not visible.");
    assert(result.navChipCount === 5, "settings section nav chip count changed.");
    assert(result.activeChipText !== null, "settings section nav lost active chip.");
    assert(result.fabVisible, "settings back-to-top FAB is not visible.");
    assert(result.fabAriaLabel !== null, "settings back-to-top FAB lost aria label.");
    assert(result.fabLabel !== null, "settings back-to-top FAB lost short label.");
    assert(
      result.horizontalOverflow === 0,
      `settings navigation component overflowed horizontally (${result.horizontalOverflow}px).`,
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
    "settings-navigation-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase255: Settings navigation component extraction verified");
  console.log(`phase255: saved artifacts under ${artifactDir}`);
  console.log(`phase255: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase255: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase255: visual chips=${visualResult.navChipCount} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase255: Settings navigation component review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
