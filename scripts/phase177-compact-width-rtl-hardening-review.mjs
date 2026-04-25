import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(path.join(projectRoot, relativePath), "utf8"),
  );
}

const packageJson = await readJson("package.json");
assert(packageJson.scripts["phase177:review"], "package.json is missing phase177:review.");

const i18nSource = await readFile(
  path.join(projectRoot, "src", "shared", "i18n.ts"),
  "utf8",
);
assert(
  i18nSource.includes("resolvedTextDirection"),
  "src/shared/i18n.ts is missing resolved text direction support.",
);
assert(
  i18nSource.includes("app-dir"),
  "src/shared/i18n.ts is missing app-dir preview override support.",
);
assert(
  i18nSource.includes("syncRuntimeLocaleAttributes"),
  "src/shared/i18n.ts is missing runtime locale attribute syncing.",
);

const appSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "App.tsx"),
  "utf8",
);
assert(
  appSource.includes("syncRuntimeLocaleAttributes"),
  "src/sidepanel/App.tsx is missing runtime locale-attribute sync.",
);

const popupSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupApp.tsx"),
  "utf8",
);
assert(
  popupSource.includes("syncRuntimeLocaleAttributes"),
  "src/popup/PopupApp.tsx is missing runtime locale-attribute sync.",
);

const cssSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "theme", "material-theme.css"),
  "utf8",
);
assert(
  cssSource.includes(
    'html[data-app-direction="rtl"][data-full-page-entry="sidebar-expand"] .app-shell',
  ),
  "material-theme.css is missing the RTL full-page entry transform origin.",
);
assert(
  cssSource.includes("padding-inline-start"),
  "material-theme.css is missing logical inline padding hardening.",
);
assert(
  cssSource.includes("border-inline-end"),
  "material-theme.css is missing logical chevron border hardening.",
);

const directionDoc = await readFile(
  path.join(
    projectRoot,
    "Doc",
    "Roadmap",
    "09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md",
  ),
  "utf8",
);
assert(directionDoc.includes("Phase 177"), "Direction 09 doc is missing Phase 177 state.");
assert(
  directionDoc.includes("app-dir=rtl"),
  "Direction 09 doc is missing the preview RTL override boundary.",
);

console.log("phase177: compact-width and RTL hardening verified");
