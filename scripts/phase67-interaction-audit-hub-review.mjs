import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase67-interaction-audit-hub-review",
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

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 1800,
    },
  });

  try {
    await page.goto(
      "http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit",
      { waitUntil: "networkidle" },
    );
    await page.waitForSelector("text=Interaction Audit");
    await page.waitForSelector("[data-audit-surface-id]");
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll(".interaction-audit-frame")).every(
        (frame) =>
          frame instanceof HTMLIFrameElement &&
          frame.contentDocument?.readyState === "complete",
      ),
    );

    const overflow = await collectOverflowState(page);
    const surfaces = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-audit-surface-id]")).map(
        (element) => {
          if (!(element instanceof HTMLElement)) {
            return null;
          }

          const frameShell = element.querySelector(".interaction-audit-frame-shell");
          const frameViewport = element.querySelector(
            ".interaction-audit-frame-viewport",
          );
          const frame = element.querySelector(".interaction-audit-frame");
          const openLink = element.querySelector(".interaction-audit__open-link");

          if (
            !(frameShell instanceof HTMLElement) ||
            !(frameViewport instanceof HTMLElement) ||
            !(frame instanceof HTMLIFrameElement) ||
            !(openLink instanceof HTMLAnchorElement)
          ) {
            return null;
          }

          const frameViewportRect = frameViewport.getBoundingClientRect();
          const frameRect = frame.getBoundingClientRect();

          return {
            id: element.dataset.auditSurfaceId ?? "",
            configuredWidth: Number(frameShell.dataset.auditFrameWidth ?? 0),
            configuredHeight: Number(frameShell.dataset.auditFrameHeight ?? 0),
            renderedWidth: Math.round(frameViewportRect.width),
            renderedHeight: Math.round(frameRect.height),
            title: frame.title,
            src: frame.getAttribute("src") ?? "",
            openHref: openLink.getAttribute("href") ?? "",
          };
        },
      ),
    );

    const filteredSurfaces = surfaces.filter(Boolean);

    await page.screenshot({
      path: path.join(artifactDir, "interaction-audit-hub.png"),
      fullPage: true,
    });

    assert(
      overflow.overflowX === 0,
      `interaction audit hub overflowed horizontally (${overflow.overflowX}px).`,
    );
    assert(
      filteredSurfaces.length === 5,
      `expected 5 audit surfaces, found ${filteredSurfaces.length}.`,
    );

    for (const surface of filteredSurfaces) {
      assert(
        surface.renderedWidth === surface.configuredWidth,
        `${surface.id}: rendered width ${surface.renderedWidth}px no longer matches configured width ${surface.configuredWidth}px.`,
      );
      assert(
        surface.renderedHeight === surface.configuredHeight,
        `${surface.id}: rendered height ${surface.renderedHeight}px no longer matches configured height ${surface.configuredHeight}px.`,
      );
      assert(
        surface.src.length > 0,
        `${surface.id}: iframe src is missing.`,
      );
      assert(
        surface.openHref.length > 0,
        `${surface.id}: standalone open link is missing.`,
      );
    }

    assert(
      filteredSurfaces.some((surface) => surface.id === "popup-360"),
      "interaction audit hub lost the popup audit frame.",
    );

    const report = {
      overflow,
      surfaces: filteredSurfaces,
    };

    const reportPath = path.join(artifactDir, "phase67-results.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`phase67: saved artifacts under ${artifactDir}`);
    console.log(`phase67: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase67: audit surfaces=${filteredSurfaces.length} overflow=${overflow.overflowX}`,
    );
  } finally {
    await browser.close();
  }
}

void runReview().catch((error) => {
  console.error("phase67: interaction audit hub review failed");
  console.error(error);
  process.exitCode = 1;
});
