import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { chromium } from "playwright";
import { installSafeLocalStorageHelpers } from "./lib/browser-local-storage-helpers.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase113-theme-recovery-archive-workflow-review",
);
const downloadDir = path.join(artifactDir, "downloads");
const reviewUrl =
  "http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review";
const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
const customSeedHex = "#4F46E5";
const seededArchiveId = "2026-04-23-theme-recovery-seeded-archive-baseline";
const repoArchiveDir = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  seededArchiveId,
);
const repoArchiveReadmePath = path.join(repoArchiveDir, "README.md");
const repoArchiveManifestPath = path.join(repoArchiveDir, "review-archive.json");
const repoArchiveExportPath = path.join(
  repoArchiveDir,
  "theme-recovery-review-export.json",
);
const repoArchiveSummaryPath = path.join(
  repoArchiveDir,
  "theme-recovery-summary.md",
);
const repoArchiveIndexMarkdownPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "Theme_Recovery_Review_Archive.md",
);
const repoArchiveIndexJsonPath = path.join(
  projectRoot,
  "Doc",
  "testing",
  "theme_recovery_reviews",
  "index.json",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

async function waitForWorkspace(page) {
  await installSafeLocalStorageHelpers(page);
  await page.goto(reviewUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-theme-recovery-page='true']");
  await page.waitForSelector("[data-theme-recovery-summary-draft]");
  await page.waitForSelector("[data-theme-recovery-json-draft]");
}

async function installDownloadCapture(context) {
  await context.addInitScript(() => {
    const events = [];
    const blobTextPromises = new Map();

    globalThis.__themeRecoveryDownloadCapture = {
      events,
      blobTextPromises,
    };

    URL.createObjectURL = (blob) => {
      const objectUrl = `blob:theme-recovery-capture-${crypto.randomUUID()}`;
      blobTextPromises.set(objectUrl, blob.text());
      return objectUrl;
    };

    URL.revokeObjectURL = () => {};

    HTMLAnchorElement.prototype.click = function clickCapture() {
      events.push({
        href: this.href,
        download: this.download,
        rel: this.rel,
      });
    };
  });
}

async function seedDegradedScenario(page) {
  await page.evaluate(
    ({ appKey, seedHex }) => {
      const storage = globalThis.__aiUsageDashboardSafeLocalStorage;
      const rawStateResult = storage?.getItem(appKey) ?? {
        ok: false,
        error: "Safe localStorage helper was not installed.",
      };

      if (!rawStateResult.ok) {
        throw new Error(
          `Unable to read theme recovery review state: ${rawStateResult.error}`,
        );
      }

      const rawState = rawStateResult.value;

      if (!rawState) {
        throw new Error("Theme recovery review storage was not initialized.");
      }

      const state = JSON.parse(rawState);

      state.settings.themeMode = "light";
      state.settings.themePreset = "custom";
      state.settings.themeCustomSeedHex = seedHex;

      state.providerSettings = state.providerSettings.map((provider) => {
        const next = { ...provider };

        next.enabled = provider.id === "cursor" || provider.id === "codex";

        if (provider.id === "cursor" || provider.id === "codex") {
          next.sourcePreference = "session_page";
          next.status = "missing";
        }

        return next;
      });

      state.providers = state.providers.map((provider) => {
        if (provider.providerId === "cursor" || provider.providerId === "codex") {
          return {
            ...provider,
            syncSource: "page_parse",
            syncStatus: "ok",
            tone: "neutral",
            syncedAt: "2026-04-23 13:20",
            lastSyncLabel: "Synced 1m ago",
            warningReason: "Host access missing for the personal usage page.",
          };
        }

        return provider;
      });

      const writeResult = storage.setItem(appKey, JSON.stringify(state));

      if (!writeResult.ok) {
        throw new Error(
          `Unable to write theme recovery review state: ${writeResult.error}`,
        );
      }
    },
    {
      appKey: APP_STATE_STORAGE_KEY,
      seedHex: customSeedHex,
    },
  );
}

async function waitForDegradedState(page) {
  await page.waitForFunction(
    ({ seed }) => {
      const text = (selector) =>
        document.querySelector(selector)?.textContent?.trim() ?? "";

      return (
        document.documentElement.dataset.themeMode === "light" &&
        document.documentElement.dataset.themePreset === "custom" &&
        document.documentElement.dataset.themeResolved === "light" &&
        document.documentElement.dataset.themeCustomSeedHex === seed &&
        text("[data-theme-recovery-overall-label]") === "Needs access" &&
        text("[data-theme-recovery-popup-label]") === "Mixed state" &&
        text("[data-theme-recovery-badge-text]") === "2" &&
        text("[data-theme-recovery-scope-label]") === "Cursor + Codex isolated" &&
        text("[data-theme-recovery-provider='cursor'] .status-chip") ===
          "Needs access" &&
        text("[data-theme-recovery-provider='codex'] .status-chip") ===
          "Needs access"
      );
    },
    { seed: customSeedHex },
  );
}

async function triggerDownload(page, selector) {
  const previousCount = await page.evaluate(
    () => globalThis.__themeRecoveryDownloadCapture?.events.length ?? 0,
  );

  await page.locator(selector).click();
  await page.waitForFunction(
    (count) =>
      (globalThis.__themeRecoveryDownloadCapture?.events.length ?? 0) > count,
    previousCount,
  );

  const capturedDownload = await page.evaluate(async () => {
    const capture = globalThis.__themeRecoveryDownloadCapture;
    const event = capture.events.at(-1);
    const content = await capture.blobTextPromises.get(event.href);

    return {
      suggestedFilename: event.download,
      content,
    };
  });
  const targetPath = path.join(downloadDir, capturedDownload.suggestedFilename);

  await writeFile(targetPath, capturedDownload.content, "utf8");

  return {
    suggestedFilename: capturedDownload.suggestedFilename,
    savedPath: targetPath,
    relativePath: path.relative(projectRoot, targetPath),
  };
}

async function runThemeRecoveryArchiveCommand(inputRelativePath) {
  return execFileAsync(
    process.execPath,
    [
      path.join(projectRoot, "scripts", "archive-theme-recovery-review.mjs"),
      "--input",
      inputRelativePath,
      "--archive-id",
      seededArchiveId,
      "--seeded",
    ],
    { cwd: projectRoot },
  );
}

async function runThemeRecoveryIndexRefreshCommand() {
  return execFileAsync(
    process.execPath,
    [
      path.join(
        projectRoot,
        "scripts",
        "build-theme-recovery-review-archive-index.mjs",
      ),
    ],
    { cwd: projectRoot },
  );
}

async function runReview() {
  await mkdir(downloadDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: {
      width: 1600,
      height: 2400,
    },
  });
  await installDownloadCapture(context);
  const page = await context.newPage();

  try {
    await waitForWorkspace(page);
    await seedDegradedScenario(page);
    await page.reload({ waitUntil: "networkidle" });
    await waitForWorkspace(page);
    await waitForDegradedState(page);

    const workspaceState = await page.evaluate(() => ({
      summaryDraft:
        document.querySelector("[data-theme-recovery-summary-draft]")?.textContent ??
        "",
      jsonDraft:
        document.querySelector("[data-theme-recovery-json-draft]")?.textContent ?? "",
      overallLabel:
        document.querySelector("[data-theme-recovery-overall-label]")?.textContent?.trim() ??
        "",
      popupLabel:
        document.querySelector("[data-theme-recovery-popup-label]")?.textContent?.trim() ??
        "",
      badgeText:
        document.querySelector("[data-theme-recovery-badge-text]")?.textContent?.trim() ??
        "",
      scopeLabel:
        document.querySelector("[data-theme-recovery-scope-label]")?.textContent?.trim() ??
        "",
    }));

    const summaryDownload = await triggerDownload(
      page,
      "[data-theme-recovery-download='summary']",
    );
    const jsonDownload = await triggerDownload(
      page,
      "[data-theme-recovery-download='json']",
    );

    const summaryFile = await readFile(summaryDownload.savedPath, "utf8");
    const jsonFile = await readFile(jsonDownload.savedPath, "utf8");
    const downloadedExport = JSON.parse(jsonFile);
    const generatedDate =
      typeof downloadedExport.generatedAt === "string"
        ? downloadedExport.generatedAt.slice(0, 10)
        : "undated";
    const expectedSummaryFilename = `theme-recovery-summary-${generatedDate}-light-needs-access-custom.md`;
    const expectedJsonFilename = `theme-recovery-export-${generatedDate}-light-needs-access-custom.json`;

    assert(
      summaryDownload.suggestedFilename === expectedSummaryFilename,
      "Theme recovery summary download filename was incorrect.",
    );
    assert(
      jsonDownload.suggestedFilename === expectedJsonFilename,
      "Theme recovery JSON download filename was incorrect.",
    );
    assert(
      summaryFile.trim() === workspaceState.summaryDraft.trim(),
      "Downloaded summary did not match the visible summary draft.",
    );
    assert(
      JSON.stringify(JSON.parse(jsonFile)) ===
        JSON.stringify(JSON.parse(workspaceState.jsonDraft)),
      "Downloaded JSON did not match the visible JSON draft.",
    );
    assert(
      downloadedExport.overallLabel === "Needs access",
      "Downloaded export did not preserve the degraded review stage.",
    );
    assert(
      downloadedExport.popupSnapshotLabel === "Mixed state",
      "Downloaded export did not preserve the popup snapshot label.",
    );

    const screenshotPath = path.join(
      artifactDir,
      "theme-recovery-download-archive-review.png",
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const archiveCommandResult = await runThemeRecoveryArchiveCommand(
      jsonDownload.relativePath,
    );
    const indexCommandResult = await runThemeRecoveryIndexRefreshCommand();
    const archiveReadme = await readFile(repoArchiveReadmePath, "utf8");
    const archiveManifest = await readJson(
      repoArchiveManifestPath,
      "Theme recovery archive manifest",
    );
    const archivedExport = await readJson(
      repoArchiveExportPath,
      "Archived theme recovery export",
    );
    const archivedSummary = await readFile(repoArchiveSummaryPath, "utf8");
    const archiveIndexMarkdown = await readFile(
      repoArchiveIndexMarkdownPath,
      "utf8",
    );
    const archiveIndexJson = await readJson(
      repoArchiveIndexJsonPath,
      "Theme recovery archive index",
    );

    assert(
      archiveManifest.archiveId === seededArchiveId,
      "Theme recovery archive manifest lost the expected archive id.",
    );
    assert(
      archiveManifest.seeded === true,
      "Theme recovery archive manifest did not preserve the seeded marker.",
    );
    assert(
      archiveManifest.sourceReviewExport === jsonDownload.relativePath,
      "Theme recovery archive manifest lost the source export path.",
    );
    assert(
      archiveManifest.summary.overallLabel === "Needs access",
      "Theme recovery archive manifest lost the degraded stage label.",
    );
    assert(
      archiveManifest.summary.needsAccessProviderCount === 2,
      "Theme recovery archive manifest had the wrong needs-access count.",
    );
    assert(
      archivedExport.themePreset === "custom" &&
        archivedExport.themeCustomSeedHex === customSeedHex,
      "Archived theme recovery export lost the custom-seed theme state.",
    );
    assert(
      archivedSummary.includes("Review stage: Needs access"),
      "Archived theme recovery summary did not preserve the review stage.",
    );
    assert(
      archiveReadme.includes("seeded internal baseline"),
      "Theme recovery archive README did not explain the seeded baseline truth note.",
    );
    assert(
      archiveReadme.includes("Review stage: Needs access"),
      "Theme recovery archive README did not preserve the review stage.",
    );
    assert(
      archiveIndexMarkdown.includes("## Seeded Baselines"),
      "Theme recovery archive index markdown was missing the seeded section.",
    );
    assert(
      archiveIndexMarkdown.includes(seededArchiveId),
      "Theme recovery archive index markdown was missing the seeded archive entry.",
    );
    assert(
      archiveIndexMarkdown.includes(
        "no real operator theme-recovery sessions are archived yet",
      ),
      "Theme recovery archive index markdown lost the honest operator-session placeholder.",
    );
    assert(
      archiveIndexJson.seededRecordCount === 1,
      "Theme recovery archive index JSON had the wrong seeded count.",
    );
    assert(
      archiveIndexJson.operatorRecordCount === 0,
      "Theme recovery archive index JSON unexpectedly claimed a real operator session.",
    );
    assert(
      Array.isArray(archiveIndexJson.records) &&
        archiveIndexJson.records.some((record) => record.archiveId === seededArchiveId),
      "Theme recovery archive index JSON did not preserve the seeded archive record.",
    );
    assert(
      archiveCommandResult.stdout.includes("seeded=yes"),
      "Theme recovery archive command stdout did not report the seeded archive.",
    );
    assert(
      indexCommandResult.stdout.includes("seeded=1 operator=0 total=1"),
      "Theme recovery archive index refresh stdout was incorrect.",
    );

    const report = {
      reviewUrl,
      scenario: {
        overallLabel: workspaceState.overallLabel,
        popupLabel: workspaceState.popupLabel,
        badgeText: workspaceState.badgeText,
        scopeLabel: workspaceState.scopeLabel,
      },
      downloads: {
        summary: summaryDownload.relativePath,
        summaryFilename: summaryDownload.suggestedFilename,
        json: jsonDownload.relativePath,
        jsonFilename: jsonDownload.suggestedFilename,
      },
      archive: {
        archiveId: seededArchiveId,
        archiveReadme: path.relative(projectRoot, repoArchiveReadmePath),
        archiveManifest: path.relative(projectRoot, repoArchiveManifestPath),
        archiveExport: path.relative(projectRoot, repoArchiveExportPath),
        archiveSummary: path.relative(projectRoot, repoArchiveSummaryPath),
        archiveIndexMarkdown: path.relative(projectRoot, repoArchiveIndexMarkdownPath),
        archiveIndexJson: path.relative(projectRoot, repoArchiveIndexJsonPath),
      },
      seededRecordCount: archiveIndexJson.seededRecordCount,
      operatorRecordCount: archiveIndexJson.operatorRecordCount,
      screenshot: path.relative(projectRoot, screenshotPath),
    };
    const reportPath = path.join(artifactDir, "phase113-results.json");

    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    console.log(`phase113: downloads saved under ${path.relative(projectRoot, downloadDir)}`);
    console.log(`phase113: repo archive written to ${path.relative(projectRoot, repoArchiveDir)}`);
    console.log(`phase113: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase113: seeded=${archiveIndexJson.seededRecordCount} operator=${archiveIndexJson.operatorRecordCount} stage=${archiveManifest.summary.overallLabel}`,
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase113: theme recovery archive workflow review failed");
  console.error(error);
  process.exitCode = 1;
});
