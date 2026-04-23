import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function collectOverflowState(page) {
  return page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function readPresetMetadata(page) {
  const presets = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-audit-preset-id]")).map(
      (preset, index) => {
        const surface = preset.closest("[data-audit-surface-id]");
        const button = preset.querySelector("[data-audit-action-id]");
        const expectationCopy = preset.querySelector(
          ".interaction-audit__preset-copy",
        );

        return {
          order: index + 1,
          presetId: preset.getAttribute("data-audit-preset-id") ?? "",
          surfaceId: surface?.getAttribute("data-audit-surface-id") ?? "",
          surfaceTitle:
            surface?.querySelector(".section-title")?.textContent?.trim() ?? "",
          actionId:
            button?.getAttribute("data-audit-action-id")?.trim() ?? "",
          label:
            button?.getAttribute("data-audit-action-label")?.trim() ?? "",
          expectation:
            button?.getAttribute("data-audit-action-expectation")?.trim() ?? "",
          expectationCopy: expectationCopy?.textContent?.trim() ?? "",
        };
      },
    ),
  );

  assert(presets.length > 0, "No interaction-audit presets were found.");

  for (const preset of presets) {
    assert(
      preset.surfaceId && preset.actionId && preset.label,
      `Preset metadata is incomplete for ${preset.presetId || "unknown preset"}.`,
    );
    assert(
      preset.expectation.length > 0,
      `${preset.presetId} is missing an expectation string.`,
    );
    assert(
      preset.expectationCopy.length > 0,
      `${preset.presetId} is missing visible expectation copy.`,
    );
    assert(
      preset.expectationCopy === preset.expectation,
      `${preset.presetId} has mismatched expectation copy.`,
    );
  }

  return presets;
}

async function readPresetState(page, surfaceId, actionId) {
  return page.evaluate(
    ({ targetSurfaceId, targetActionId }) => {
      const surface = document.querySelector(
        `[data-audit-surface-id="${targetSurfaceId}"]`,
      );

      if (!(surface instanceof HTMLElement)) {
        return null;
      }

      const iframe = surface.querySelector(".interaction-audit-frame");

      if (!(iframe instanceof HTMLIFrameElement)) {
        return null;
      }

      const frameWindow = iframe.contentWindow;
      const frameDocument = frameWindow?.document;

      if (!frameWindow || !frameDocument) {
        return null;
      }

      switch (`${targetSurfaceId}:${targetActionId}`) {
        case "dashboard-360:focus-first-provider-open": {
          const activeElement = frameDocument.activeElement;
          const markedElement = frameDocument.querySelector(
            "[data-audit-preset-target='true']",
          );

          return {
            activeText: activeElement?.textContent?.trim() ?? "",
            activeTag: activeElement?.tagName ?? "",
            markedText: markedElement?.textContent?.trim() ?? "",
            markedTag: markedElement?.tagName ?? "",
          };
        }
        case "settings-420:open-first-diagnostics": {
          const details = frameDocument.querySelector(".source-card__details");
          const activeElement = frameDocument.activeElement;
          const markedElement = frameDocument.querySelector(
            "[data-audit-preset-target='true']",
          );

          return {
            open:
              details &&
              typeof details === "object" &&
              "open" in details &&
              typeof details.open === "boolean"
                ? details.open
                : false,
            activeTag: activeElement?.tagName ?? "",
            markedTag: markedElement?.tagName ?? "",
          };
        }
        case "settings-420:focus-first-source-preference": {
          const activeElement = frameDocument.activeElement;
          const markedElement = frameDocument.querySelector(
            "[data-audit-preset-target='true']",
          );

          return {
            activeTag: activeElement?.tagName ?? "",
            inSources: Boolean(
              activeElement &&
                typeof activeElement === "object" &&
                "closest" in activeElement &&
                typeof activeElement.closest === "function" &&
                activeElement.closest("#settings-sources"),
            ),
            markedTag: markedElement?.tagName ?? "",
            markedInSources: Boolean(
              markedElement &&
                typeof markedElement === "object" &&
                "closest" in markedElement &&
                typeof markedElement.closest === "function" &&
                markedElement.closest("#settings-sources"),
            ),
          };
        }
        case "cursor-detail-360:jump-first-note":
        case "codex-detail-420:jump-first-note": {
          const firstNote = frameDocument.querySelector(".detail-note");

          if (
            !firstNote ||
            typeof firstNote !== "object" ||
            !("getBoundingClientRect" in firstNote) ||
            typeof firstNote.getBoundingClientRect !== "function"
          ) {
            return {
              scrollY: frameWindow.scrollY,
              noteTop: null,
              noteBottom: null,
              innerHeight: frameWindow.innerHeight,
            };
          }

          const noteRect = firstNote.getBoundingClientRect();

          return {
            scrollY: frameWindow.scrollY,
            noteTop: Math.round(noteRect.top),
            noteBottom: Math.round(noteRect.bottom),
            innerHeight: frameWindow.innerHeight,
          };
        }
        case "popup-360:focus-open-dashboard":
        case "popup-360:focus-first-detail": {
          const activeElement = frameDocument.activeElement;
          const markedElement = frameDocument.querySelector(
            "[data-audit-preset-target='true']",
          );

          return {
            activeText: activeElement?.textContent?.trim() ?? "",
            activeTag: activeElement?.tagName ?? "",
            markedText: markedElement?.textContent?.trim() ?? "",
            markedTag: markedElement?.tagName ?? "",
          };
        }
        default:
          return null;
      }
    },
    {
      targetSurfaceId: surfaceId,
      targetActionId: actionId,
    },
  );
}

async function readAuditStatus(page, surfaceId) {
  return page.evaluate((targetSurfaceId) => {
    const statusNote = document.querySelector(
      `[data-audit-status-id="${targetSurfaceId}"]`,
    );

    if (!(statusNote instanceof HTMLElement)) {
      return null;
    }

    return {
      tone: statusNote.classList.contains("detail-note--warning")
        ? "warning"
        : "neutral",
      label:
        statusNote.querySelector(".detail-note__label")?.textContent?.trim() ??
        "",
      message:
        statusNote.querySelector(".supporting-copy")?.textContent?.trim() ?? "",
    };
  }, surfaceId);
}

function assertPresetState(surfaceId, actionId, state) {
  assert(state !== null, `${surfaceId}:${actionId} did not expose readable state.`);

  switch (`${surfaceId}:${actionId}`) {
    case "dashboard-360:focus-first-provider-open":
      assert(
        (state.activeTag === "BUTTON" && state.activeText.includes("Open")) ||
          (state.markedTag === "BUTTON" && state.markedText.includes("Open")),
        `${surfaceId}:${actionId} did not focus the provider Open button.`,
      );
      break;
    case "settings-420:open-first-diagnostics":
      assert(
        state.open === true,
        `${surfaceId}:${actionId} did not open the first diagnostics disclosure.`,
      );
      assert(
        state.activeTag === "SUMMARY" || state.markedTag === "SUMMARY",
        `${surfaceId}:${actionId} did not focus the diagnostics toggle.`,
      );
      break;
    case "settings-420:focus-first-source-preference":
      assert(
        (state.activeTag === "SELECT" && state.inSources === true) ||
          (state.markedTag === "SELECT" && state.markedInSources === true),
        `${surfaceId}:${actionId} did not focus a source-preference select inside Source Connections.`,
      );
      break;
    case "cursor-detail-360:jump-first-note":
    case "codex-detail-420:jump-first-note":
      assert(
        state.scrollY > 0,
        `${surfaceId}:${actionId} did not scroll the detail frame.`,
      );
      assert(
        typeof state.noteTop === "number" &&
          typeof state.noteBottom === "number" &&
          state.noteBottom > 0 &&
          state.noteTop < state.innerHeight,
        `${surfaceId}:${actionId} did not bring the first note into the viewport.`,
      );
      break;
    case "popup-360:focus-open-dashboard":
      assert(
        (state.activeTag === "BUTTON" &&
          state.activeText.includes("Open dashboard")) ||
          (state.markedTag === "BUTTON" &&
            state.markedText.includes("Open dashboard")),
        `${surfaceId}:${actionId} did not focus the popup dashboard action.`,
      );
      break;
    case "popup-360:focus-first-detail":
      assert(
        (state.activeTag === "BUTTON" &&
          state.activeText.includes("Open detail")) ||
          (state.markedTag === "BUTTON" &&
            state.markedText.includes("Open detail")),
        `${surfaceId}:${actionId} did not focus the featured-provider detail action.`,
      );
      break;
    default:
      assert(false, `Unsupported assertion for ${surfaceId}:${actionId}.`);
  }
}

async function clickPresetAndCapture(page, preset) {
  const buttonSelector = `[data-audit-surface-id="${preset.surfaceId}"] [data-audit-action-id="${preset.actionId}"]`;
  const didRunPreset = await page.evaluate(
    ({ targetSurfaceId, targetActionId, targetButtonSelector }) => {
      const runner = globalThis.__interactionAuditRunPreset;

      if (typeof runner === "function") {
        return runner(targetSurfaceId, targetActionId);
      }

      const button = document.querySelector(targetButtonSelector);

      if (!(button instanceof HTMLButtonElement)) {
        return false;
      }

      button.click();
      return true;
    },
    {
      targetSurfaceId: preset.surfaceId,
      targetActionId: preset.actionId,
      targetButtonSelector: buttonSelector,
    },
  );
  assert(didRunPreset, `${preset.presetId} could not be triggered.`);
  await page.waitForTimeout(180);

  const machineState = await readPresetState(
    page,
    preset.surfaceId,
    preset.actionId,
  );
  assertPresetState(preset.surfaceId, preset.actionId, machineState);

  const auditStatus = await readAuditStatus(page, preset.surfaceId);
  assert(
    auditStatus !== null &&
      auditStatus.label.length > 0 &&
      auditStatus.message.length > 0,
    `${preset.presetId} did not expose readable audit status.`,
  );

  const screenshotFileName = `${String(preset.order).padStart(2, "0")}-${preset.surfaceId}-${preset.actionId}.png`;
  const screenshotPath = path.join(artifactDir, screenshotFileName);

  await page
    .locator(`[data-audit-surface-id="${preset.surfaceId}"]`)
    .screenshot({ path: screenshotPath });

  return {
    order: preset.order,
    presetId: preset.presetId,
    surfaceId: preset.surfaceId,
    surfaceTitle: preset.surfaceTitle,
    actionId: preset.actionId,
    label: preset.label,
    expectation: preset.expectation,
    auditStatus,
    machineState,
    screenshot: path.relative(projectRoot, screenshotPath),
  };
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 2200,
    },
  });

  try {
    await page.goto(
      "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit",
      { waitUntil: "networkidle" },
    );
    await page.waitForSelector("[data-audit-surface-id]");
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll(".interaction-audit-frame")).every(
        (frame) =>
          frame instanceof HTMLIFrameElement &&
          frame.contentDocument?.readyState === "complete",
      ),
    );
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll("[data-audit-action-id]")).every(
        (button) =>
          button instanceof HTMLButtonElement && button.disabled === false,
      ),
    );

    const overflow = await collectOverflowState(page);
    assert(
      overflow.overflowX === 0,
      `interaction audit hub overflowed horizontally (${overflow.overflowX}px).`,
    );

    const presets = await readPresetMetadata(page);
    const evidenceItems = [];

    for (const preset of presets) {
      evidenceItems.push(await clickPresetAndCapture(page, preset));
    }

    const overviewFileName = "interaction-audit-evidence-overview.png";
    const overviewPath = path.join(artifactDir, overviewFileName);
    await page.screenshot({
      path: overviewPath,
      fullPage: true,
    });

    const report = {
      capturedAt: new Date().toISOString(),
      overflow,
      overviewScreenshot: path.relative(projectRoot, overviewPath),
      evidenceItems,
    };
    const reportPath = path.join(artifactDir, "phase69-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase69: saved artifacts under ${artifactDir}`);
    console.log(`phase69: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase69: evidence items=${evidenceItems.length} overflow=${overflow.overflowX}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase69: interaction audit evidence pack failed");
  console.error(error);
  process.exitCode = 1;
});
