import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase196-diagnostic-presentation-compact-evidence-review",
);
const appStateStorageKey = "ai-usage-dashboard.app-state";
const storeRuntimeLockKey = "ai-usage-dashboard.store-screenshot-runtime-lock";
const storeSeedLockKey = "ai-usage-dashboard.store-screenshot-seed-lock";
const baseUrl = "http://127.0.0.1:4173/src/sidepanel/index.html";
const reviewRunId = Date.now().toString(36);
let navigationCounter = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
}

async function readProjectFile(...segments) {
  return readFile(path.join(projectRoot, ...segments), "utf8");
}

function buildPreviewUrl(hash) {
  navigationCounter += 1;
  return `${baseUrl}?phase196=${reviewRunId}-${navigationCounter}${hash}`;
}

function buildDiagnosticRawBodies() {
  return {
    warningReason:
      "The matched Cursor usage page no longer exposed parseable billing-period usage signals. Inspect the live route and update the parser before trusting this snapshot.",
    sourceSelectionReason:
      "Official API preference fell back to Session page after the configured Admin API path could not produce a usable snapshot.",
    sourceFallbackReason:
      "Official API unavailable: No Cursor Admin API key is stored. Keep this raw fallback body visible for evidence and support handoff.",
  };
}

async function seedDiagnosticStressState(page) {
  await page.goto(buildPreviewUrl("#settings"), { waitUntil: "networkidle" });
  await page.waitForSelector(".source-card");

  await page.evaluate(
    ({ appKey, runtimeLockKey, seedLockKey, rawBodies }) => {
      const rawState = globalThis.localStorage.getItem(appKey);

      if (!rawState) {
        throw new Error("App state was not initialized before diagnostic QA seeding.");
      }

      const state = JSON.parse(rawState);
      state.settings = {
        ...state.settings,
        locale: "zh-CN",
        themeMode: "light",
      };

      state.providers = state.providers.map((provider) => {
        if (provider.providerId !== "cursor") {
          return provider;
        }

        return {
          ...provider,
          providerLabel: "Cursor",
          planName: "Cursor Personal Dashboard",
          syncSource: "page_parse",
          syncStatus: "error",
          tone: "error",
          warningReason: rawBodies.warningReason,
          warningDiagnostic: {
            code: "adapter.parse_failed",
            category: "adapter_error",
            severity: "error",
            rawMessage: rawBodies.warningReason,
            params: {
              providerId: "cursor",
              adapterErrorKind: "parse_failed",
              sourceKind: "session_page",
              failureCode: "route_drift",
              parserStage: "personal_usage_page",
            },
          },
          sourceSelectionReason: rawBodies.sourceSelectionReason,
          sourceSelectionDiagnostic: {
            code: "source.preference_selected_session_page",
            category: "source_selection",
            severity: "info",
            rawMessage: rawBodies.sourceSelectionReason,
            params: {
              providerId: "cursor",
              sourcePreference: "official_api",
              selectedKind: "session_page",
              hadFallback: true,
            },
          },
          sourceFallbackReason: rawBodies.sourceFallbackReason,
          sourceFallbackDiagnostic: {
            code: "source.official_api_missing_credential",
            category: "source_fallback",
            severity: "warning",
            rawMessage: rawBodies.sourceFallbackReason,
            params: {
              providerId: "cursor",
              sourcePreference: "official_api",
              failedSourceKind: "official_api",
              failureCode: "credential_missing",
            },
          },
          lastSyncLabel: "Cursor usage page parse failed",
          resetLabel:
            "Retry after checking the Cursor dashboard page and parser assumptions",
        };
      });

      state.providerSettings = state.providerSettings.map((provider) =>
        provider.id === "cursor"
          ? {
              ...provider,
              status: "granted",
              credentialStatus: "missing",
              sourcePreference: "official_api",
            }
          : provider,
      );

      globalThis.localStorage.setItem(runtimeLockKey, "true");
      globalThis.localStorage.setItem(seedLockKey, "true");
      globalThis.localStorage.setItem(appKey, JSON.stringify(state));
    },
    {
      appKey: appStateStorageKey,
      runtimeLockKey: storeRuntimeLockKey,
      seedLockKey: storeSeedLockKey,
      rawBodies: buildDiagnosticRawBodies(),
    },
  );
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
      overflowWrap: styles.overflowWrap,
      wordBreak: styles.wordBreak,
    };
  });
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function collectTextContent(page, selector) {
  return page.locator(selector).evaluateAll((elements) =>
    elements.map((element) => element.textContent?.trim() ?? "").filter(Boolean),
  );
}

async function reviewSettingsDiagnosticStack(page) {
  await page.setViewportSize({ width: 420, height: 920 });
  await page.goto(buildPreviewUrl("#settings"), { waitUntil: "networkidle" });
  await page.waitForSelector('html[lang="zh-CN"]');

  const cursorCard = page.locator('.source-card[data-provider-id="cursor"]');
  await cursorCard.locator(".source-card__details-toggle").click();
  await cursorCard.locator(".source-card__diagnostic-group").first().waitFor();

  const overflow = await collectOverflowState(page);
  const diagnosticValues = await collectTextContent(
    page,
    '.source-card[data-provider-id="cursor"] .source-card__diagnostic-value',
  );
  const noteLines = await collectTextContent(
    page,
    '.source-card[data-provider-id="cursor"] .detail-note .supporting-copy',
  );
  const diagnosticGroupStyles = await collectStyles(
    cursorCard.locator(".source-card__diagnostic-group").first(),
  );
  const diagnosticValueStyles = await collectStyles(
    cursorCard.locator(".source-card__diagnostic-value").first(),
  );

  await page.screenshot({
    path: path.join(artifactDir, "settings-diagnostic-stack-420.png"),
    fullPage: true,
  });

  assert(
    overflow.overflowX <= 0,
    `settings diagnostic stack overflowed horizontally (${overflow.overflowX}px).`,
  );
  assert(
    diagnosticValues.includes("适配器解析失败"),
    "Settings diagnostic stack is missing localized adapter-error label.",
  );
  assert(
    diagnosticValues.some((value) => value.includes("raw diagnostic body")),
    "Settings diagnostic stack is missing localized adapter-error summary.",
  );
  assert(
    diagnosticValues.some((value) => value.includes("官方 API 缺少凭据")),
    "Settings diagnostic stack is missing localized fallback diagnostic label.",
  );
  assert(
    diagnosticValues.some((value) =>
      value.includes("Official API preference fell back to Session page"),
    ),
    "Settings diagnostic stack is missing raw source-selection evidence.",
  );
  assert(
    noteLines.some((value) => value.includes("No Cursor Admin API key is stored")),
    "Settings diagnostic stack is missing raw fallback evidence in the note area.",
  );
  assert(
    diagnosticGroupStyles?.borderColor !== "rgba(0, 0, 0, 0)",
    "Settings diagnostic group lost its visual boundary.",
  );
  assert(
    diagnosticValueStyles?.overflowWrap === "anywhere",
    "Settings diagnostic values lost overflow-wrap:anywhere.",
  );

  return {
    slug: "settings-diagnostic-stack-420",
    viewport: { width: 420, height: 920 },
    overflow,
    diagnosticValueCount: diagnosticValues.length,
    noteLineCount: noteLines.length,
    diagnosticGroupStyles,
    diagnosticValueStyles,
  };
}

async function reviewProviderDetailDiagnosticStack(page) {
  await page.setViewportSize({ width: 360, height: 920 });
  await page.goto(buildPreviewUrl("#provider-detail/cursor"), {
    waitUntil: "networkidle",
  });
  await page.waitForSelector('html[lang="zh-CN"]');
  await page.waitForSelector("text=适配器解析失败");

  const overflow = await collectOverflowState(page);
  const detailValues = await collectTextContent(page, ".detail-field__value");
  const noteLines = await collectTextContent(page, ".detail-note .supporting-copy");
  const detailValueStyles = await collectStyles(
    page.locator(".detail-field__value").first(),
  );
  const detailNoteStyles = await collectStyles(
    page.locator(".detail-note").filter({ hasText: "适配器解析失败" }).first(),
  );

  await page.screenshot({
    path: path.join(artifactDir, "provider-detail-diagnostic-stack-360.png"),
    fullPage: true,
  });

  assert(
    overflow.overflowX <= 0,
    `provider detail diagnostic stack overflowed horizontally (${overflow.overflowX}px).`,
  );
  assert(
    detailValues.some((value) => value.includes("偏好选择会话页面")),
    "Provider Detail is missing localized source-selection diagnostic label.",
  );
  assert(
    detailValues.some((value) => value.includes("官方 API 缺少凭据")),
    "Provider Detail is missing localized fallback diagnostic label.",
  );
  assert(
    noteLines.some((value) => value.includes("适配器解析失败")),
    "Provider Detail is missing localized adapter-error diagnostic note.",
  );
  assert(
    noteLines.some((value) => value.includes("parseable billing-period usage")),
    "Provider Detail is missing raw adapter warning evidence.",
  );
  assert(
    detailValueStyles?.overflowWrap === "anywhere",
    "Provider Detail values lost overflow-wrap:anywhere.",
  );
  assert(
    detailNoteStyles?.borderColor !== "rgba(0, 0, 0, 0)",
    "Provider Detail diagnostic note lost its visual boundary.",
  );

  return {
    slug: "provider-detail-diagnostic-stack-360",
    viewport: { width: 360, height: 920 },
    overflow,
    detailValueCount: detailValues.length,
    noteLineCount: noteLines.length,
    detailValueStyles,
    detailNoteStyles,
  };
}

async function verifyDocsAndCloseoutMarkers() {
  const packageJson = await readJson("package.json");
  assert(
    packageJson.scripts["phase196:review"],
    "package.json is missing phase196:review.",
  );

  for (const [relativePath, markers] of [
    [
      "Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md",
      [
        "Diagnostic Presentation Compact-Width And Evidence QA",
        "Phase 196",
        "Diagnostic Archive And Export Compatibility Review",
      ],
    ],
    [
      "Doc/testing/Phase_196_Diagnostic_Presentation_Compact_Evidence_QA.md",
      [
        "Phase 196",
        "Diagnostic Presentation Compact Evidence QA",
        "npm run phase196:review",
      ],
    ],
    [
      "Doc/TODOs/Archive/196_Phase_Diagnostic_Presentation_Compact_Evidence_QA.md",
      [
        "Phase 196",
        "Diagnostic Presentation Compact Evidence QA",
        "raw evidence",
      ],
    ],
  ]) {
    const fileContent = await readProjectFile(relativePath);
    for (const marker of markers) {
      assert(
        fileContent.includes(marker),
        `${relativePath} is missing marker: ${marker}`,
      );
    }
  }
}

async function runReview() {
  await verifyDocsAndCloseoutMarkers();
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await seedDiagnosticStressState(page);

    const results = [
      await reviewSettingsDiagnosticStack(page),
      await reviewProviderDetailDiagnosticStack(page),
    ];
    const reportPath = path.join(
      artifactDir,
      "diagnostic-presentation-compact-evidence-review.json",
    );

    await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

    console.log(`phase196: saved artifacts under ${artifactDir}`);
    console.log(`phase196: saved machine-readable results to ${reportPath}`);

    for (const result of results) {
      console.log(
        `phase196: ${result.slug} overflow=${result.overflow.overflowX}`,
      );
    }
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase196: diagnostic presentation compact evidence review failed");
  console.error(error);
  process.exitCode = 1;
});
