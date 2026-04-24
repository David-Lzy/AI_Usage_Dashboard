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
assert(packageJson.scripts["phase176:review"], "package.json is missing phase176:review.");

const i18nSource = await readFile(
  path.join(projectRoot, "src", "shared", "i18n.ts"),
  "utf8",
);
assert(i18nSource.includes("localizeRelativeRuntimeLabel"), "src/shared/i18n.ts is missing localized relative-runtime label support.");
assert(i18nSource.includes("localizeResetRuntimeLabel"), "src/shared/i18n.ts is missing localized reset-runtime label support.");

const providerCardSource = await readFile(
  path.join(projectRoot, "src", "sidepanel", "components", "ProviderCard.tsx"),
  "utf8",
);
assert(providerCardSource.includes("localizeRelativeRuntimeLabel"), "ProviderCard.tsx is missing localized freshness labels.");
assert(providerCardSource.includes("localizeResetRuntimeLabel"), "ProviderCard.tsx is missing localized reset labels.");

const popupViewModelSource = await readFile(
  path.join(projectRoot, "src", "popup", "view-models.ts"),
  "utf8",
);
assert(popupViewModelSource.includes("buildLocalizedPopupFeaturedMetaChips"), "popup view-models are missing localized featured-provider freshness chips.");
assert(popupViewModelSource.includes("i18n.localizeRelativeRuntimeLabel"), "popup view-models are missing localized runtime freshness labels.");

const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(inventoryDoc.includes("duration-bearing runtime labels"), "I18n string inventory doc does not describe the Phase 176 duration slice.");

console.log("phase176: locale-aware duration and freshness labels verified");
