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
assert(packageJson.scripts["phase174:review"], "package.json is missing phase174:review.");

const localizedCopySource = await readFile(
  path.join(projectRoot, "src", "shared", "localized-copy.ts"),
  "utf8",
);
assert(localizedCopySource.includes("buildPopupLocalizedCopy"), "src/shared/localized-copy.ts is missing buildPopupLocalizedCopy.");
assert(localizedCopySource.includes("buildProviderDetailLocalizedCopy"), "src/shared/localized-copy.ts is missing buildProviderDetailLocalizedCopy.");
assert(localizedCopySource.includes("getProviderDetailStatusBadgeLabel"), "src/shared/localized-copy.ts is missing provider-detail status helper.");

const popupAppSource = await readFile(
  path.join(projectRoot, "src", "popup", "PopupApp.tsx"),
  "utf8",
);
assert(popupAppSource.includes("localizePopupViewModel("), "PopupApp.tsx does not localize the popup view model.");
assert(popupAppSource.includes("popupCopy.aria.setupCoverage"), "PopupApp.tsx is missing localized setup-coverage aria copy.");
assert(popupAppSource.includes("popupCopy.aria.featuredProviders"), "PopupApp.tsx is missing localized featured-provider aria copy.");

const providerDetailSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "routes", "ProviderDetailPage.tsx"),
  "utf8",
);
assert(providerDetailSource.includes("buildProviderDetailLocalizedCopy"), "ProviderDetailPage.tsx is missing provider-detail localized copy wiring.");
assert(providerDetailSource.includes("getProviderDetailStatusBadgeLabel"), "ProviderDetailPage.tsx is missing localized provider-detail status badge copy.");
assert(providerDetailSource.includes('copy.sections.providerDetail'), "ProviderDetailPage.tsx is missing localized provider-detail section copy.");
assert(providerDetailSource.includes('copy.notes.trustBoundary'), "ProviderDetailPage.tsx is missing localized provider-detail note copy.");

const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(inventoryDoc.includes("provider-detail shell plus popup explanatory copy"), "I18n string inventory doc does not describe the Phase 174 localized slice.");

console.log("phase174: popup explanatory copy and provider-detail shell localization verified");
