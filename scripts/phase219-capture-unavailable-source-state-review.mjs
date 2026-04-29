import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase219-capture-unavailable-source-state-review",
);

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
    packageJson.scripts["phase219:review"] ===
      "./scripts/with-preferred-node.sh node ./scripts/phase219-capture-unavailable-source-state-review.mjs",
    "package.json is missing the expected phase219:review script.",
  );

  return {
    scope: "package-script",
    markers: 1,
  };
}

async function verifyRuntimeMarkers() {
  const expectations = [
    {
      relativePath: "src/shared/provider-sources.ts",
      markers: [
        '"capture_unavailable"',
        "captureUnavailableLabel",
        "createCaptureUnavailableSourceState",
        'warningDiagnostic.code === "page_session.capture_unavailable"',
      ],
    },
    {
      relativePath: "src/shared/localized-copy.ts",
      markers: [
        "Page capture unavailable",
        "页面捕获不可用",
        "could not be read by the extension",
        "当前页面无法被扩展读取",
        "statusReloadPage",
        "primaryPageUnreadable",
      ],
    },
    {
      relativePath: "src/sidepanel/view-models.ts",
      markers: ['| "capture_unavailable"'],
    },
    {
      relativePath: "src/sidepanel/components/ProviderCard.tsx",
      markers: ['currentSourceStateKind === "capture_unavailable"'],
    },
    {
      relativePath: "src/sidepanel/theme-recovery-review.ts",
      markers: [
        '| "capture_unavailable"',
        'provider.currentSourceStateKind === "capture_unavailable"',
      ],
    },
    {
      relativePath: "src/popup/view-models.ts",
      markers: [
        'case "capture_unavailable"',
        "Reload page",
        "Current page session is open but cannot be read.",
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

async function verifyTestsAndDocs() {
  const expectations = [
    {
      relativePath: "src/shared/provider-sources.test.ts",
      markers: [
        'toBe("capture_unavailable")',
        'toBe("Page capture unavailable")',
        "could not be read by extension scripting",
      ],
    },
    {
      relativePath: "src/shared/i18n.test.ts",
      markers: [
        "builds localized page-capture unavailable diagnostic presentation",
        "当前页面无法被扩展读取",
      ],
    },
    {
      relativePath:
        "Doc/testing/Phase_219_Capture_Unavailable_Source_State.md",
      markers: [
        "Phase 219",
        "Capture Unavailable Source State",
        "npm run phase219:review",
      ],
    },
    {
      relativePath:
        "Doc/TODOs/Archive/219_Phase_Capture_Unavailable_Source_State.md",
      markers: [
        "Phase 219",
        "completed and archived on 2026-04-29",
        "capture_unavailable",
      ],
    },
    {
      relativePath: "Doc/TODOs/00_Phase_Index.md",
      markers: [
        "219_Phase_Capture_Unavailable_Source_State.md",
        "latest completed slice",
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

async function runReview() {
  const results = [
    await verifyPackageScript(),
    ...(await verifyRuntimeMarkers()),
    ...(await verifyTestsAndDocs()),
  ];

  await mkdir(artifactDir, { recursive: true });

  const reportPath = path.join(
    artifactDir,
    "capture-unavailable-source-state-review.json",
  );

  await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log("phase219: capture-unavailable source state verified");
  console.log(`phase219: saved machine-readable results to ${reportPath}`);
  for (const result of results) {
    console.log(`phase219: ${result.scope} markers=${result.markers}`);
  }
}

void runReview().catch((error) => {
  console.error("phase219: capture-unavailable source state review failed");
  console.error(error);
  process.exitCode = 1;
});
