import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const execFile = promisify(execFileCallback);

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase153-popup-bootstrap-width-and-node-runtime-review",
);
const popupUrl = "http://127.0.0.1:4173/src/popup/index.html";
const wrapperPath = path.join(projectRoot, "scripts", "with-preferred-node.sh");

const scenarios = [
  { width: 640, height: 900, expectedWidth: 392 },
  { width: 360, height: 900, expectedWidth: 360 },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseMajor(version) {
  return Number.parseInt(version.replace(/^v/, "").split(".")[0] ?? "", 10);
}

async function waitForPopup(page) {
  await page.waitForFunction(() => {
    const bodyText = document.body?.innerText ?? "";
    return bodyText.includes("Quick glance") || bodyText.includes("Popup load failed");
  });

  const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
  assert(bodyText.includes("Quick glance"), "Popup did not reach the ready state.");
}

async function collectSnapshot(page) {
  return page.evaluate(() => {
    const root = document.getElementById("root");
    const shell = document.querySelector(".popup-shell");
    const htmlRect = document.documentElement.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const rootRect = root?.getBoundingClientRect();
    const shellRect = shell?.getBoundingClientRect();

    return {
      htmlClassList: Array.from(document.documentElement.classList),
      bodyClassList: Array.from(document.body.classList),
      rootClassList: root ? Array.from(root.classList) : [],
      innerWidth: window.innerWidth,
      htmlWidth: Math.round(htmlRect.width),
      bodyWidth: Math.round(bodyRect.width),
      rootWidth: Math.round(rootRect?.width ?? 0),
      shellWidth: Math.round(shellRect?.width ?? 0),
      horizontalOverflow: Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth,
      ),
      bodyOverflowX: getComputedStyle(document.body).overflowX,
    };
  });
}

async function reviewScenario(browser, scenario) {
  const page = await browser.newPage({
    viewport: { width: scenario.width, height: scenario.height },
  });
  page.setDefaultTimeout(20_000);

  await page.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await waitForPopup(page);

  const snapshot = await collectSnapshot(page);

  assert(
    snapshot.htmlClassList.includes("popup-page"),
    `${scenario.width}px: html did not include popup-page class`,
  );
  assert(
    snapshot.bodyClassList.includes("popup-page"),
    `${scenario.width}px: body did not include popup-page class`,
  );
  assert(
    snapshot.rootClassList.includes("popup-page-root"),
    `${scenario.width}px: #root did not include popup-page-root class`,
  );
  assert(
    snapshot.bodyOverflowX === "hidden",
    `${scenario.width}px: body overflow-x was ${JSON.stringify(snapshot.bodyOverflowX)} instead of "hidden"`,
  );
  assert(
    snapshot.horizontalOverflow === 0,
    `${scenario.width}px: popup still overflowed horizontally by ${snapshot.horizontalOverflow}px`,
  );
  assert(
    snapshot.htmlWidth === scenario.expectedWidth,
    `${scenario.width}px: html width was ${snapshot.htmlWidth}px instead of ${scenario.expectedWidth}px`,
  );
  assert(
    snapshot.bodyWidth === scenario.expectedWidth,
    `${scenario.width}px: body width was ${snapshot.bodyWidth}px instead of ${scenario.expectedWidth}px`,
  );
  assert(
    snapshot.rootWidth === scenario.expectedWidth,
    `${scenario.width}px: root width was ${snapshot.rootWidth}px instead of ${scenario.expectedWidth}px`,
  );
  assert(
    snapshot.shellWidth === scenario.expectedWidth,
    `${scenario.width}px: popup shell width was ${snapshot.shellWidth}px instead of ${scenario.expectedWidth}px`,
  );

  const screenshotPath = path.join(artifactDir, `popup-width-${scenario.width}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.close();

  return {
    ...scenario,
    screenshotPath,
    snapshot,
  };
}

await mkdir(artifactDir, { recursive: true });

const popupHtml = await readFile(
  path.join(projectRoot, "src", "popup", "index.html"),
  "utf8",
);
assert(
  popupHtml.includes('<html lang="en" class="popup-page">'),
  "Popup HTML did not statically label the html element with popup-page.",
);
assert(
  popupHtml.includes('<body class="popup-page">'),
  "Popup HTML did not statically label the body element with popup-page.",
);
assert(
  popupHtml.includes('<div id="root" class="popup-page-root"></div>'),
  "Popup HTML did not statically label #root with popup-page-root.",
);
assert(
  popupHtml.includes("width: min(392px, max(360px, 100vw));"),
  "Popup HTML did not include the bootstrap width formula.",
);

const popupCss = await readFile(
  path.join(projectRoot, "src", "sidepanel", "theme", "material-theme.css"),
  "utf8",
);
assert(
  popupCss.includes("max(var(--app-popup-width-min), 100vw)"),
  "Popup CSS did not include the runtime width floor formula.",
);
assert(
  !popupCss.includes("#root.popup-page-root {\n    width: 100%;\n    min-width: 0;\n    max-width: 100%;"),
  "Popup CSS still included the small-screen reset that can collapse the action popup.",
);

const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);
for (const scriptName of ["build", "typecheck", "test", "phase153:review"]) {
  const scriptValue = packageJson.scripts?.[scriptName];
  assert(
    typeof scriptValue === "string" &&
      scriptValue.startsWith("./scripts/with-preferred-node.sh "),
    `package.json script ${scriptName} does not use the preferred-node wrapper.`,
  );
}

const nodeCommand = await execFile(wrapperPath, ["node", "-v"], {
  cwd: projectRoot,
  env: process.env,
});
const whichNodeCommand = await execFile(wrapperPath, ["which", "node"], {
  cwd: projectRoot,
  env: process.env,
});
const npmCommand = await execFile(wrapperPath, ["npm", "-v"], {
  cwd: projectRoot,
  env: process.env,
});

const preferredNodeVersion = nodeCommand.stdout.trim();
const preferredNodePath = whichNodeCommand.stdout.trim();
const preferredNpmVersion = npmCommand.stdout.trim();

assert(
  parseMajor(preferredNodeVersion) >= 22,
  `Preferred node version ${preferredNodeVersion} is below the project floor.`,
);
assert(
  preferredNodePath.includes("/.local/node-current/bin/node"),
  `Preferred node path ${preferredNodePath} did not resolve to ~/.local/node-current/bin/node.`,
);

const browser = await chromium.launch({ headless: true });

try {
  const results = [];

  for (const scenario of scenarios) {
    results.push(await reviewScenario(browser, scenario));
  }

  await writeFile(
    path.join(artifactDir, "phase153-results.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        popupUrl,
        preferredNodeVersion,
        preferredNodePath,
        preferredNpmVersion,
        results,
      },
      null,
      2,
    ),
  );

  console.log("phase153: popup bootstrap width and preferred node runtime verified");
} finally {
  await browser.close();
}
