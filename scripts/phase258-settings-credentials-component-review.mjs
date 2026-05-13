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
  "phase258-settings-credentials-component-review",
);
const devPort = 42658;

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
    packageJson.scripts["phase258:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase258-settings-credentials-component-review.mjs",
    "package.json is missing the expected phase258:review script.",
  );

  return { scope: "package-script", markers: 1 };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/sidepanel/routes/SettingsPage.tsx",
      markers: [
        "SettingsCredentialsSection",
        "handleProviderApiKeyInputChange",
        "settingsCopy.credentials",
      ],
      forbiddenMarkers: [
        'className="credential-form"',
        "data-credential-provider-id",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSections.tsx",
      markers: [
        "SettingsCredentialsSection",
        "CredentialProviderSection",
        "data-credential-provider-id",
        "labels.codexTitle",
      ],
    },
    {
      relativePath: "src/sidepanel/components/SettingsSections.test.tsx",
      markers: [
        "renders credential cards with stable credential hooks",
        "data-credential-provider-id",
        "Save config",
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
        "Doc/testing/Archive/phase-reports/200-299/Phase_258_Settings_Credentials_Component_Extraction.md",
      markers: [
        "Phase 258",
        "Settings Credentials Component Extraction",
        "npm run phase258:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/by-phase/200-299/258_Phase_Settings_Credentials_Component_Extraction.md",
      markers: [
        "Phase 258",
        "completed and archived on 2026-05-03",
        "SettingsCredentialsSection",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "258_Phase_Settings_Credentials_Component_Extraction.md",
        "latest completed slice",
      ],
    },
    {
      relativePath: "Doc/AI_Usage_Dashboard_TODOs.md",
      markers: ["Phase 258", "Settings credentials component extraction"],
    },
    {
      relativePath: "Doc/Roadmap/00_Strategic_Directions_Index.md",
      markers: ["Phase 258", "Settings credentials component extraction"],
    },
    {
      relativePath: "README.md",
      markers: ["Settings credentials section now lives in"],
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

async function collectSettingsCredentialsState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const credentials = document.querySelector("#settings-credentials");

    return {
      credentialCards:
        credentials?.querySelectorAll("[data-credential-provider-id]").length ??
        0,
      forms: credentials?.querySelectorAll(".credential-form").length ?? 0,
      horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
      passwordInputs:
        credentials?.querySelectorAll('input[type="password"]').length ?? 0,
      title:
        credentials?.querySelector(".section-title")?.textContent?.trim() ??
        null,
      visibleProviderIds: Array.from(
        credentials?.querySelectorAll("[data-credential-provider-id]") ?? [],
      ).map((element) =>
        element.getAttribute("data-credential-provider-id"),
      ),
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
    await page.waitForSelector("#settings-credentials .credential-form", {
      timeout: 20_000,
    });

    const result = await collectSettingsCredentialsState(page);

    await page.screenshot({
      path: path.join(artifactDir, "settings-credentials-section.png"),
      fullPage: true,
    });

    assert(
      result.horizontalOverflow === 0,
      `settings credentials overflowed horizontally (${result.horizontalOverflow}px).`,
    );
    assert(result.title !== null, "settings credentials title is missing.");
    assert(
      result.credentialCards >= 3,
      "settings credentials did not render expected credential cards.",
    );
    assert(
      result.forms === result.credentialCards,
      "credential card count and form count diverged.",
    );
    assert(
      result.passwordInputs >= 3,
      "settings credentials did not render expected password inputs.",
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
    "settings-credentials-component-review.json",
  );

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("phase258: Settings credentials component extraction verified");
  console.log(`phase258: saved artifacts under ${artifactDir}`);
  console.log(`phase258: saved machine-readable results to ${reportPath}`);
  for (const result of markerResults) {
    console.log(`phase258: ${result.scope} markers=${result.markers}`);
  }
  console.log(
    `phase258: visual cards=${visualResult.credentialCards} forms=${visualResult.forms} inputs=${visualResult.passwordInputs} overflow=${visualResult.horizontalOverflow}`,
  );
}

runReview().catch((error) => {
  console.error("phase258: Settings credentials component review failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
