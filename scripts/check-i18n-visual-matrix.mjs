import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

import {
  appendLocaleOverride,
  SUPPORTED_RDP_CAPTURE_LOCALES,
} from "./lib/rdp-extension-locale-route.mjs";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist", "chrome");
const defaultOutputRoot = path.join(projectRoot, ".local", "visual-checks", "i18n");
const defaultWidths = Object.freeze([360, 430, 720, 1280]);
const smokeWidths = Object.freeze([360, 720]);
const smokeLocales = Object.freeze(["en", "de", "ar"]);
const allRouteIds = Object.freeze(["popup", "dashboard", "settings"]);
const viewportHeightByRoute = {
  dashboard: 1200,
  popup: 900,
  settings: 1200,
};
const routes = {
  dashboard: {
    id: "dashboard",
    path: "/src/sidepanel/index.html?surface=full-page#dashboard",
    readySelector: ".dashboard-section",
  },
  popup: {
    id: "popup",
    path: "/src/popup/index.html",
    readySelector: ".popup-shell, .popup-load-state-card",
  },
  settings: {
    id: "settings",
    path: "/src/sidepanel/index.html?surface=full-page#settings",
    readySelector: "#settings-appearance",
  },
};
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath)] ?? "application/octet-stream";
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseCsv(value) {
  return `${value ?? ""}`
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const options = {
    failOnIssues: false,
    output: "",
    routes: [],
    smoke: false,
    widths: [],
    locales: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--smoke") {
      options.smoke = true;
      continue;
    }

    if (arg === "--fail-on-issues") {
      options.failOnIssues = true;
      continue;
    }

    if (
      arg === "--help" ||
      arg === "-h"
    ) {
      printHelp();
      process.exit(0);
    }

    const nextValue = argv[index + 1];

    if (arg === "--output") {
      assert(nextValue, "--output requires a directory.");
      options.output = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--locales") {
      assert(nextValue, "--locales requires a comma-separated locale list.");
      options.locales = parseCsv(nextValue);
      index += 1;
      continue;
    }

    if (arg === "--routes") {
      assert(nextValue, "--routes requires a comma-separated route list.");
      options.routes = parseCsv(nextValue);
      index += 1;
      continue;
    }

    if (arg === "--widths") {
      assert(nextValue, "--widths requires a comma-separated width list.");
      options.widths = parseCsv(nextValue).map((value) => Number(value));
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  const locales =
    options.locales.length > 0
      ? options.locales
      : options.smoke
        ? smokeLocales
        : SUPPORTED_RDP_CAPTURE_LOCALES;
  const widths =
    options.widths.length > 0
      ? options.widths
      : options.smoke
        ? smokeWidths
        : defaultWidths;
  const routeIds = options.routes.length > 0 ? options.routes : allRouteIds;
  const generatedAt = new Date().toISOString();
  const output =
    options.output ||
    path.join(
      defaultOutputRoot,
      generatedAt.replaceAll(":", "-").replaceAll(".", "-"),
    );

  for (const locale of locales) {
    assert(
      SUPPORTED_RDP_CAPTURE_LOCALES.includes(locale),
      `Unsupported locale '${locale}'. Supported: ${SUPPORTED_RDP_CAPTURE_LOCALES.join(", ")}`,
    );
  }

  for (const width of widths) {
    assert(Number.isFinite(width) && width > 0, `Invalid width: ${width}`);
  }

  for (const routeId of routeIds) {
    assert(
      Object.hasOwn(routes, routeId),
      `Unsupported route '${routeId}'. Supported: ${Object.keys(routes).join(", ")}`,
    );
  }

  return {
    ...options,
    generatedAt,
    locales,
    output: path.resolve(projectRoot, output),
    routes: routeIds,
    widths,
  };
}

function printHelp() {
  console.log(`
Usage: npm run i18n:visual-check -- [options]

Options:
  --smoke                  Run a small en,de,ar x 360,720 matrix.
  --locales en,de,ar       Comma-separated locale list.
  --widths 360,720         Comma-separated viewport widths.
  --routes popup,settings  Comma-separated routes: popup,dashboard,settings.
  --output <dir>           Output directory. Defaults to .local/visual-checks/i18n/<timestamp>.
  --fail-on-issues         Exit non-zero when layout issues are detected.
`);
}

function expectedDirection(locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

function appendPreviewOverrides(routePath, locale) {
  const withLocale = appendLocaleOverride(routePath, locale);
  const [pathAndSearch, hash = ""] = withLocale.split("#", 2);
  const separator = pathAndSearch.includes("?") ? "&" : "?";
  const withDirection = `${pathAndSearch}${separator}app-dir=${expectedDirection(locale)}`;

  return hash.length > 0 ? `${withDirection}#${hash}` : withDirection;
}

function slugify(value) {
  return value.replaceAll(/[^a-zA-Z0-9_-]+/g, "-");
}

async function assertDistReady() {
  await stat(path.join(distRoot, "manifest.json"));
  await stat(path.join(distRoot, "src", "sidepanel", "index.html"));
  await stat(path.join(distRoot, "src", "popup", "index.html"));
}

async function startStaticServer(rootDir) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const requestedPath = pathname === "/" ? "/src/sidepanel/index.html" : pathname;
      const candidatePath = path.normalize(path.join(rootDir, requestedPath));

      if (!candidatePath.startsWith(rootDir)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const fileStat = await stat(candidatePath);
      const filePath = fileStat.isDirectory()
        ? path.join(candidatePath, "index.html")
        : candidatePath;
      const body = await readFile(filePath);

      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": getMimeType(filePath),
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  assert(address && typeof address === "object", "Static server did not bind.");

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

async function launchBrowser() {
  const systemBrowserCandidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/opt/google/chrome/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  try {
    return await chromium.launch({
      channel: "chromium",
      headless: true,
    });
  } catch (channelError) {
    for (const executablePath of systemBrowserCandidates) {
      try {
        await stat(executablePath);

        return await chromium.launch({
          executablePath,
          headless: true,
        });
      } catch {
        // Try the next local browser before falling back to Playwright's cache.
      }
    }

    try {
      return await chromium.launch({
        headless: true,
      });
    } catch (defaultError) {
      throw new Error(
        [
          "Unable to launch Chromium for i18n visual checks.",
          channelError instanceof Error ? channelError.message : String(channelError),
          defaultError instanceof Error ? defaultError.message : String(defaultError),
        ].join("\n"),
      );
    }
  }
}

async function collectLayoutSnapshot(page, routeId, expectedDir) {
  return page.evaluate(
    ({ routeId: evaluatedRouteId, expectedDir: evaluatedExpectedDir }) => {
      const root = document.documentElement;
      const body = document.body;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const elementSelector = [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "summary",
        "[role='button']",
        "[data-session-popover-id]",
        ".adaptive-control-grid",
        ".color-choice-dropdown__option",
        ".dashboard-section",
        ".form-field",
        ".material-select",
        ".popup-shell",
        ".progress-gradient-scheme-dropdown__option",
        ".provider-card",
        ".settings-section-anchor",
        ".status-card",
        ".summary-strip",
        ".top-app-bar",
      ].join(",");
      const controlSelector = [
        "button",
        "input",
        "select",
        "textarea",
        "summary",
        "[role='button']",
        ".color-choice-dropdown__option",
        ".material-select button",
        ".progress-gradient-scheme-dropdown__option",
        ".provider-card__meta .meta-chip",
      ].join(",");
      const elements = Array.from(document.querySelectorAll(elementSelector));

      function describeElement(element) {
        const className =
          typeof element.className === "string" ? element.className : "";
        const id = element.id ? `#${element.id}` : "";
        const classes = className
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 3)
          .map((entry) => `.${entry}`)
          .join("");

        return `${element.tagName.toLowerCase()}${id}${classes}`;
      }

      function visibleElement(element) {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0
        );
      }

      function elementText(element) {
        const value =
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement
            ? element.value
            : element.textContent;

        return (
          value?.replace(/\s+/g, " ").trim() ||
          element.getAttribute("aria-label") ||
          element.getAttribute("title") ||
          ""
        ).slice(0, 120);
      }

      const offscreenElements = elements
        .filter(visibleElement)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const leftOverflow = Math.max(0, -rect.left);
          const rightOverflow = Math.max(0, rect.right - viewportWidth);

          return {
            selector: describeElement(element),
            text: elementText(element),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            leftOverflow: Math.round(leftOverflow),
            rightOverflow: Math.round(rightOverflow),
          };
        })
        .filter((entry) => entry.leftOverflow > 1 || entry.rightOverflow > 1)
        .slice(0, 20);
      const clippedControls = Array.from(document.querySelectorAll(controlSelector))
        .filter(visibleElement)
        .filter(
          (element) =>
            element.getAttribute("data-i18n-scrollable-value") !== "true",
        )
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const text = elementText(element);
          const horizontalClip = Math.max(0, element.scrollWidth - element.clientWidth);
          const verticalClip = Math.max(0, element.scrollHeight - element.clientHeight);

          return {
            selector: describeElement(element),
            text,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            horizontalClip: Math.round(horizontalClip),
            verticalClip: Math.round(verticalClip),
          };
        })
        .filter(
          (entry) =>
            entry.text.length > 0 &&
            (entry.horizontalClip > 1 || entry.verticalClip > 2),
        )
        .slice(0, 20);
      const clippedSummaryLabels = Array.from(
        document.querySelectorAll("[data-i18n-summary-label]"),
      )
        .filter(visibleElement)
        .map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(element);
          const textRect = range.getBoundingClientRect();
          const lineHeight = Number.parseFloat(style.lineHeight);
          const horizontalClip = Math.max(
            0,
            element.scrollWidth - element.clientWidth,
            textRect.width - rect.width,
          );
          const verticalClip = Math.max(
            0,
            element.scrollHeight - element.clientHeight,
            textRect.height - rect.height,
          );

          return {
            selector: describeElement(element),
            text: elementText(element),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            horizontalClip: Math.round(horizontalClip),
            verticalClip: Math.round(verticalClip),
            lineCount:
              Number.isFinite(lineHeight) && lineHeight > 0
                ? Math.ceil(textRect.height / lineHeight)
                : null,
            textOverflow: style.textOverflow,
          };
        })
        .filter(
          (entry) =>
            entry.text.length > 0 &&
            (entry.textOverflow === "ellipsis" ||
              entry.horizontalClip > 1 ||
              entry.verticalClip > 1 ||
              (entry.lineCount !== null && entry.lineCount > 2)),
        )
        .slice(0, 20);
      const layoutContracts = Array.from(
        document.querySelectorAll("[data-i18n-layout-contract]"),
      )
        .filter(visibleElement)
        .map((element) => {
          const contract = element.getAttribute("data-i18n-layout-contract") ?? "";
          const rect = element.getBoundingClientRect();
          const controls = Array.from(
            element.querySelectorAll(
              "a, button, input, select, textarea, summary, [role='button']",
            ),
          ).filter(visibleElement);
          const overlaps = [];

          for (let leftIndex = 0; leftIndex < controls.length; leftIndex += 1) {
            const leftControl = controls[leftIndex];
            const leftRect = leftControl.getBoundingClientRect();

            for (
              let rightIndex = leftIndex + 1;
              rightIndex < controls.length;
              rightIndex += 1
            ) {
              const rightControl = controls[rightIndex];
              const rightRect = rightControl.getBoundingClientRect();
              const overlapWidth =
                Math.min(leftRect.right, rightRect.right) -
                Math.max(leftRect.left, rightRect.left);
              const overlapHeight =
                Math.min(leftRect.bottom, rightRect.bottom) -
                Math.max(leftRect.top, rightRect.top);

              if (overlapWidth > 2 && overlapHeight > 2) {
                overlaps.push({
                  left: describeElement(leftControl),
                  right: describeElement(rightControl),
                  overlapWidth: Math.round(overlapWidth),
                  overlapHeight: Math.round(overlapHeight),
                });
              }
            }
          }

          const oversizedControls = controls
            .filter((control) => {
              const controlRect = control.getBoundingClientRect();

              if (contract === "top-app-bar") {
                return (
                  (control.matches(".settings-nav-chip") ||
                    control.matches(".top-app-bar__actions .icon-button")) &&
                  controlRect.height > 64
                );
              }

              if (contract === "settings-navigation") {
                return control.matches(".settings-nav-chip") && controlRect.height > 64;
              }

              return false;
            })
            .map((control) => ({
              selector: describeElement(control),
              text: elementText(control),
              height: Math.round(control.getBoundingClientRect().height),
            }));
          const unexpectedlyTall =
            contract === "compact-order-row" && rect.width >= 340 && rect.height > 72;

          return {
            contract,
            selector: describeElement(element),
            text: elementText(element),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            overlaps: overlaps.slice(0, 10),
            oversizedControls: oversizedControls.slice(0, 10),
            unexpectedlyTall,
          };
        });
      const issues = [];
      const rootOverflow = Math.max(
        0,
        root.scrollWidth - Math.max(root.clientWidth, viewportWidth),
        body ? body.scrollWidth - Math.max(body.clientWidth, viewportWidth) : 0,
      );
      const htmlDir = root.dir || getComputedStyle(root).direction;
      const bodyDir = body?.dir || (body ? getComputedStyle(body).direction : "");
      const datasetLocale = root.dataset.appLocale ?? "";
      const datasetDirection = root.dataset.appDirection ?? "";

      if (rootOverflow > 1) {
        issues.push({
          code: "horizontal_overflow",
          message: `Document scroll width exceeds viewport by ${Math.round(rootOverflow)}px.`,
        });
      }

      if (offscreenElements.length > 0) {
        issues.push({
          code: "element_offscreen",
          message: `${offscreenElements.length} visible elements extend beyond the viewport.`,
        });
      }

      if (clippedControls.length > 0) {
        issues.push({
          code: "clipped_control_text",
          message: `${clippedControls.length} guarded controls or labels have scroll overflow.`,
        });
      }

      if (clippedSummaryLabels.length > 0) {
        issues.push({
          code: "clipped_summary_label",
          message: `${clippedSummaryLabels.length} compact summary labels are clipped, ellipsized, or exceed two lines.`,
        });
      }

      const overlappingContracts = layoutContracts.filter(
        (entry) => entry.overlaps.length > 0,
      );
      const oversizedContractControls = layoutContracts.filter(
        (entry) => entry.oversizedControls.length > 0,
      );
      const unexpectedlyTallContracts = layoutContracts.filter(
        (entry) => entry.unexpectedlyTall,
      );

      if (overlappingContracts.length > 0) {
        issues.push({
          code: "interactive_control_overlap",
          message: `${overlappingContracts.length} layout contracts contain overlapping interactive controls.`,
        });
      }

      if (oversizedContractControls.length > 0) {
        issues.push({
          code: "oversized_compact_control",
          message: `${oversizedContractControls.length} compact layout contracts contain controls taller than 64px.`,
        });
      }

      if (unexpectedlyTallContracts.length > 0) {
        issues.push({
          code: "unexpected_compact_row_wrap",
          message: `${unexpectedlyTallContracts.length} compact ordering rows wrap despite having at least 340px available.`,
        });
      }

      if (htmlDir !== evaluatedExpectedDir || datasetDirection !== evaluatedExpectedDir) {
        issues.push({
          code: "direction_mismatch",
          message: `Expected ${evaluatedExpectedDir}, got html dir '${htmlDir}' and data-app-direction '${datasetDirection}'.`,
        });
      }

      return {
        routeId: evaluatedRouteId,
        viewportWidth,
        viewportHeight,
        documentWidth: root.scrollWidth,
        documentHeight: root.scrollHeight,
        rootOverflow: Math.round(rootOverflow),
        htmlLang: root.lang,
        htmlDir,
        bodyDir,
        datasetLocale,
        datasetDirection,
        offscreenElements,
        clippedControls,
        clippedSummaryLabels,
        layoutContracts,
        issues,
      };
    },
    { routeId, expectedDir },
  );
}

async function collectStickyOverlapSnapshot(page, routeId) {
  if (routeId !== "settings") {
    return [];
  }

  const anchors = ["#settings-overview", "#settings-appearance", "#settings-provider-display"];
  const snapshots = [];

  for (const anchor of anchors) {
    const exists = await page.evaluate((selector) => {
      return Boolean(document.querySelector(selector));
    }, anchor);

    if (!exists) {
      continue;
    }

    await page.evaluate((selector) => {
      document.querySelector(selector)?.scrollIntoView({
        block: "start",
        inline: "nearest",
      });
    }, anchor);
    await page.waitForTimeout(250);

    snapshots.push(
      await page.evaluate((selector) => {
        const topBar = document.querySelector(".top-app-bar");
        const anchorElement = document.querySelector(selector);
        const topBarRect = topBar?.getBoundingClientRect();
        const anchorRect = anchorElement?.getBoundingClientRect();
        const topBarBottom = topBarRect ? Math.round(topBarRect.bottom) : null;
        const anchorTop = anchorRect ? Math.round(anchorRect.top) : null;

        return {
          selector,
          anchorTop,
          topBarBottom,
          overlap:
            typeof anchorTop === "number" &&
            typeof topBarBottom === "number" &&
            anchorTop < topBarBottom - 4,
        };
      }, anchor),
    );
  }

  return snapshots;
}

async function captureMatrixEntry(page, serverBaseUrl, outputDir, route, locale, width) {
  const expectedDir = expectedDirection(locale);
  const routePath = appendPreviewOverrides(route.path, locale);
  const url = new URL(routePath, serverBaseUrl).toString();
  const screenshotPath = path.join(
    outputDir,
    "screenshots",
    `${route.id}-${slugify(locale)}-${width}.png`,
  );

  await page.setViewportSize({
    width,
    height: viewportHeightByRoute[route.id] ?? 1200,
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(route.readySelector, { timeout: 20_000 });
  await page.waitForTimeout(250);

  const layout = await collectLayoutSnapshot(page, route.id, expectedDir);

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  const stickyOverlap = await collectStickyOverlapSnapshot(page, route.id);
  const stickyIssues = stickyOverlap
    .filter((entry) => entry.overlap)
    .map((entry) => ({
      code: "sticky_header_overlap",
      message: `${entry.selector} top ${entry.anchorTop}px is under top bar bottom ${entry.topBarBottom}px.`,
    }));
  const issues = [...layout.issues, ...stickyIssues];

  return {
    route: route.id,
    locale,
    expectedDirection: expectedDir,
    width,
    url,
    screenshotPath,
    layout,
    stickyOverlap,
    issues,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  await assertDistReady();
  await mkdir(path.join(options.output, "screenshots"), { recursive: true });

  const server = await startStaticServer(distRoot);
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const results = [];
  const fatalErrors = [];

  try {
    for (const routeId of options.routes) {
      const route = routes[routeId];

      for (const locale of options.locales) {
        for (const width of options.widths) {
          try {
            const result = await captureMatrixEntry(
              page,
              server.baseUrl,
              options.output,
              route,
              locale,
              width,
            );
            results.push(result);
            console.log(
              [
                "i18n:visual-check",
                `${route.id}/${locale}/${width}`,
                `issues=${result.issues.length}`,
                `overflow=${result.layout.rootOverflow}`,
                `dir=${result.layout.datasetDirection || result.layout.htmlDir}`,
              ].join(" "),
            );
          } catch (error) {
            const fatal = {
              route: route.id,
              locale,
              width,
              message: error instanceof Error ? error.message : String(error),
            };

            fatalErrors.push(fatal);
            console.error(
              `i18n:visual-check failed ${route.id}/${locale}/${width}: ${fatal.message}`,
            );
          }
        }
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  const issueEntries = results.flatMap((result) =>
    result.issues.map((issue) => ({
      route: result.route,
      locale: result.locale,
      width: result.width,
      ...issue,
    })),
  );
  const report = {
    generatedAt: options.generatedAt,
    output: options.output,
    distRoot,
    mode: options.smoke ? "smoke" : "full",
    locales: options.locales,
    routes: options.routes,
    widths: options.widths,
    counts: {
      entries: results.length,
      issues: issueEntries.length,
      fatalErrors: fatalErrors.length,
    },
    issues: issueEntries,
    fatalErrors,
    results,
  };
  const reportPath = path.join(options.output, "i18n-visual-matrix-report.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`i18n:visual-check saved report: ${reportPath}`);
  console.log(`i18n:visual-check saved screenshots: ${path.join(options.output, "screenshots")}`);
  console.log(
    `i18n:visual-check summary: entries=${report.counts.entries} issues=${report.counts.issues} fatal=${report.counts.fatalErrors}`,
  );

  if (fatalErrors.length > 0 || (options.failOnIssues && issueEntries.length > 0)) {
    process.exitCode = 1;
  }
}

await run();
