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
  "phase257-settings-permissions-component-review",
);
const devPort = 42657;

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
    packageJson.scripts["phase257:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase257-settings-permissions-component-review.mjs",
    "package.json is missing the expected phase257:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "SettingsPermissionsSection",
        "settingsCopy.permissions",
        "onTogglePermission",
      ],
      forbiddenMarkers: [
        "PermissionPrompt",
        "data-permission-action",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSections.tsx",
      markers: [
        "SettingsPermissionsSection",
        "PermissionPrompt",
        "PermissionPromptLabels",
        "data-visibility-provider-id",
        "settings-overview",
      ],
    },
    {
      relativePath: "src/sidepanel/components/PermissionPrompt.tsx",
      markers: ["export type PermissionPromptLabels", "PermissionPrompt"],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSections.test.tsx",
      markers: [
        "renders permission prompts with stable permission hooks",
        "data-permission-action",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_257_Settings_Permissions_Component_Extraction.md",
      markers: [
        "Phase 257",
        "Settings Permissions Component Extraction",
        "npm run phase257:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/257_Phase_Settings_Permissions_Component_Extraction.md",
      markers: [
        "Phase 257",
        "completed and archived on 2026-05-03",
        "SettingsPermissionsSection",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "257_Phase_Settings_Permissions_Component_Extraction.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 257", "Settings permissions component extraction"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 257", "Settings permissions component extraction"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings permissions section now lives in"],
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

async function collectSettingsPermissionsState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const permissions = document.querySelector("#settings-permissions");

    return {
      actionButtons:
        permissions?.querySelectorAll("[data-permission-action]").length ?? 0,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      permissionPrompts:
        permissions?.querySelectorAll(".permission-prompt").length ?? 0,
      title:
        permissions?.querySelector(".section-title")?.textContent?.trim() ??
        null,
      warningPrompts:
        permissions?.querySelectorAll(".permission-prompt--warning").length ??
        0,
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
    await page.waitForSelector("#settings-permissions .permission-prompt", {
      timeout: 20_000,
    });

    const result = await collectSettingsPermissionsState(page);

    await page.screenshot({
      path: path.join(artifactDir, "settings-permissions-section.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `settings permissions overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.title !== null, "settings permissions title is missing.");
    assert(
      result.permissionPrompts >= 4,
      "settings permissions did not render provider prompts.",
    );
    assert(
      result.actionButtons === result.permissionPrompts,
      "permission prompt count and action button count diverged.",
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
    "settings-permissions-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase257: Settings permissions component extraction verified");
  console.log(`phase257: saved artifacts under ${artifactDir}`);
  console.log(`phase257: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase257: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase257: visual prompts=${visualResult.permissionPrompts} actions=${visualResult.actionButtons} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase257: Settings permissions component review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
