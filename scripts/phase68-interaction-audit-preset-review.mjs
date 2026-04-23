import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase68-interaction-audit-preset-review",
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

async function readPresetState(page, surfaceId, checkName) {
  return page.evaluate(
    ({ targetSurfaceId, targetCheckName }) => {
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

      switch (`${targetSurfaceId}:${targetCheckName}`) {
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
      targetCheckName: checkName,
    },
  );
}

async function clickPresetAndCapture(page, surfaceId, actionId) {
  const buttonSelector = `[data-audit-surface-id="${surfaceId}"] [data-audit-action-id="${actionId}"]`;
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
      targetSurfaceId: surfaceId,
      targetActionId: actionId,
      targetButtonSelector: buttonSelector,
    },
  );
  assert(didRunPreset, `${surfaceId}:${actionId} could not be triggered.`);

  await page.waitForTimeout(180);

  const state = await readPresetState(page, surfaceId, actionId);

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

  return {
    surfaceId,
    actionId,
    state,
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

    const results = [];

    results.push(
      await clickPresetAndCapture(
        page,
        "dashboard-360",
        "focus-first-provider-open",
      ),
    );
    results.push(
      await clickPresetAndCapture(
        page,
        "settings-420",
        "open-first-diagnostics",
      ),
    );
    results.push(
      await clickPresetAndCapture(
        page,
        "settings-420",
        "focus-first-source-preference",
      ),
    );
    results.push(
      await clickPresetAndCapture(page, "cursor-detail-360", "jump-first-note"),
    );
    results.push(
      await clickPresetAndCapture(page, "codex-detail-420", "jump-first-note"),
    );
    results.push(
      await clickPresetAndCapture(page, "popup-360", "focus-open-dashboard"),
    );
    results.push(
      await clickPresetAndCapture(page, "popup-360", "focus-first-detail"),
    );

    await page.screenshot({
      path: path.join(artifactDir, "interaction-audit-presets.png"),
      fullPage: true,
    });

    const report = {
      overflow,
      results,
    };
    const reportPath = path.join(artifactDir, "phase68-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase68: saved artifacts under ${artifactDir}`);
    console.log(`phase68: saved machine-readable results to ${reportPath}`);
    console.log(`phase68: preset checks=${results.length} overflow=${overflow.overflowX}`);
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase68: interaction audit preset review failed");
  console.error(error);
  process.exitCode = 1;
});
