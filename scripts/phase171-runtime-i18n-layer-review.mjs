import { access, readFile } from "node:fs/promises";
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
assert(packageJson.scripts["phase171:review"], "package.json is missing phase171:review.");

await access(path.join(projectRoot, "src", "shared", "i18n.ts"));

const i18nSource = await readFile(
  path.join(projectRoot, "src", "shared", "i18n.ts"),
  "utf8",
);
assert(i18nSource.includes("export function createRuntimeI18n"), "src/shared/i18n.ts is missing createRuntimeI18n.");
assert(i18nSource.includes('"dashboard.hero.title"'), "src/shared/i18n.ts is missing dashboard hero runtime messages.");
assert(i18nSource.includes('"popup.header.title"'), "src/shared/i18n.ts is missing popup header runtime messages.");

const manifest = await readJson("src/manifest.json");
assert(manifest.default_locale === "en", "manifest default_locale must stay `en`.");

const appSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "App.tsx"),
  "utf8",
);
const dashboardSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "routes", "DashboardPage.tsx"),
  "utf8",
);
const popupSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupApp.tsx"),
  "utf8",
);
assert(appSource.includes("createRuntimeI18n"), "App.tsx does not use the runtime i18n helper.");
assert(dashboardSource.includes("createRuntimeI18n"), "DashboardPage.tsx does not use the runtime i18n helper.");
assert(popupSource.includes("createRuntimeI18n"), "PopupApp.tsx does not use the runtime i18n helper.");

const contractDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_Message_ID_Contract.md"),
  "utf8",
);
const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(contractDoc.includes("dashboard.hero.title"), "Message ID contract doc does not list dashboard.hero.title.");
assert(inventoryDoc.includes("narrow localized shell slice"), "String inventory doc does not describe the Phase 171 runtime truth boundary.");

console.log("phase171: runtime i18n helper and first popup/dashboard shell slice verified");
