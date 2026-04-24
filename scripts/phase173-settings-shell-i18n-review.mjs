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
assert(packageJson.scripts["phase173:review"], "package.json is missing phase173:review.");

const i18nSource = await readFile(
  path.join(projectRoot, "src", "shared", "i18n.ts"),
  "utf8",
);
assert(i18nSource.includes('"settings.topbar.title"'), "src/shared/i18n.ts is missing settings.topbar.title.");
assert(i18nSource.includes('"settings.preferences.locale_label"'), "src/shared/i18n.ts is missing the locale selector label.");
assert(i18nSource.includes('"common.actions.save"'), "src/shared/i18n.ts is missing common.actions.save.");

const settingsPageSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "routes", "SettingsPage.tsx"),
  "utf8",
);
const settingsViewModelsSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "settings-view-models.ts"),
  "utf8",
);
const appSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "App.tsx"),
  "utf8",
);
assert(settingsPageSource.includes("createRuntimeI18n"), "SettingsPage.tsx does not use the runtime i18n helper.");
assert(settingsPageSource.includes("onLocalePreferenceChange"), "SettingsPage.tsx is missing locale preference wiring.");
assert(settingsPageSource.includes('settings.preferences.locale_label'), "SettingsPage.tsx is missing the locale selector UI.");
assert(settingsViewModelsSource.includes("SettingsSummaryLabels"), "settings-view-models.ts is missing localized settings summary labels.");
assert(appSource.includes("settings.toast.preferences_saved_title"), "App.tsx is missing the localized preferences-saved toast.");

const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(inventoryDoc.includes("settings shell, overview, section navigation, and locale selector"), "I18n string inventory doc does not describe the Phase 173 settings-shell slice.");

console.log("phase173: settings shell localization and locale selector verified");
