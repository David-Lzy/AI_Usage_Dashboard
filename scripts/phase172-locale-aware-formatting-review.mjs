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
assert(packageJson.scripts["phase172:review"], "package.json is missing phase172:review.");

const i18nSource = await readFile(
  path.join(projectRoot, "src", "shared", "i18n.ts"),
  "utf8",
);
assert(i18nSource.includes("formatPercentValue"), "src/shared/i18n.ts is missing formatPercentValue.");
assert(i18nSource.includes("formatTemporalValue"), "src/shared/i18n.ts is missing formatTemporalValue.");

const appSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "App.tsx"),
  "utf8",
);
const popupSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupApp.tsx"),
  "utf8",
);
const popupViewModelSource = await readFile(
  path.join(projectRoot, "src", "popup", "view-models.ts"),
  "utf8",
);
const providerCardSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "components", "ProviderCard.tsx"),
  "utf8",
);
const providerDetailSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "routes", "ProviderDetailPage.tsx"),
  "utf8",
);
assert(appSource.includes("runtimeI18n.formatNumber"), "App.tsx is not passing localized number formatting into dashboard summary items.");
assert(popupSource.includes("runtimeI18n.formatNumber"), "PopupApp.tsx is not passing localized number formatting into popup summary items.");
assert(popupViewModelSource.includes("labels.liveReady"), "Popup view-model summary labels are not using the localized liveReady label.");
assert(popupViewModelSource.includes("labels.policyOnly"), "Popup view-model summary labels are not using the localized policyOnly label.");
assert(providerCardSource.includes("formatPercentValue"), "ProviderCard.tsx is missing locale-aware percentage formatting.");
assert(providerDetailSource.includes("formattedResetAt"), "ProviderDetailPage.tsx is missing localized temporal formatting.");

const contractDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_Message_ID_Contract.md"),
  "utf8",
);
const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(contractDoc.includes("Locale-Aware Formatting Contract"), "I18n message-id contract doc is missing the locale-aware formatting contract section.");
assert(
  inventoryDoc.includes("generated counts, percentages, and parseable timestamp primitives"),
  "I18n string inventory doc does not describe the Phase 172 formatting truth boundary.",
);

console.log("phase172: locale-aware runtime value formatting verified");
