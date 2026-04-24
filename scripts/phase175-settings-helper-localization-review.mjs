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
assert(packageJson.scripts["phase175:review"], "package.json is missing phase175:review.");

const localizedCopySource = await readFile(
  path.join(projectRoot, "src", "shared", "localized-copy.ts"),
  "utf8",
);
assert(localizedCopySource.includes("buildSettingsLocalizedCopy"), "src/shared/localized-copy.ts is missing buildSettingsLocalizedCopy.");
assert(localizedCopySource.includes("getSettingsSourcePreferenceLabel"), "src/shared/localized-copy.ts is missing the localized settings source-preference helper.");

const settingsPageSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "routes", "SettingsPage.tsx"),
  "utf8",
);
assert(settingsPageSource.includes("buildSettingsLocalizedCopy"), "SettingsPage.tsx is missing deeper settings localized copy wiring.");
assert(settingsPageSource.includes("getSettingsSourcePreferenceLabel"), "SettingsPage.tsx is missing localized source-preference labels.");
assert(settingsPageSource.includes("settingsCopy.permissions"), "SettingsPage.tsx is missing localized permission-prompt wiring.");

const permissionPromptSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "components", "PermissionPrompt.tsx"),
  "utf8",
);
assert(permissionPromptSource.includes("type PermissionPromptLabels"), "PermissionPrompt.tsx is missing the localized label contract.");
assert(permissionPromptSource.includes("labels: PermissionPromptLabels"), "PermissionPrompt.tsx is missing localized label props.");

const settingsViewModelSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "settings-view-models.ts"),
  "utf8",
);
assert(settingsViewModelSource.includes("type SettingsSourceCardLabels"), "settings-view-models.ts is missing SettingsSourceCardLabels.");
assert(settingsViewModelSource.includes("labels: SettingsSourceCardLabels"), "settings-view-models.ts is missing localized source-card label wiring.");

const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(inventoryDoc.includes("deeper settings helper copy"), "I18n string inventory doc does not describe the Phase 175 localized settings helper slice.");

console.log("phase175: deeper settings helper localization verified");
