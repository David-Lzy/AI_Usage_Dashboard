import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

function sectionBetween(source, startHeading, endHeading) {
  const start = source.indexOf(startHeading);
  if (start === -1) {
    return "";
  }
  const end = endHeading ? source.indexOf(endHeading, start + startHeading.length) : -1;
  return source.slice(start, end === -1 ? undefined : end);
}

function matchRequired(source, pattern, label, errors) {
  const match = source.match(pattern);
  if (!match) {
    errors.push(`Missing ${label}.`);
    return null;
  }
  return match[1];
}

function normalizeListBlock(block) {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- `"))
    .map((line) => line.replace(/^- `|`$/g, ""));
}

const copyPackPath = path.join(repoRoot, "Doc/Store_Listing_Copy_Pack.md");
const localizationSourcePath = path.join(repoRoot, "Doc/Store_Listing_Localization_Source_Pack.md");
const archiveReadmePath = path.join(
  repoRoot,
  "Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md",
);
const manifestPath = path.join(repoRoot, "src/manifest.json");
const outputDir = path.join(repoRoot, "tmp/phase151-store-listing-localization-source-review");
const outputPath = path.join(outputDir, "phase151-results.json");

const errors = [];

const [copyPack, localizationSource, archiveReadme, manifestRaw] = await Promise.all([
  readFile(copyPackPath, "utf8"),
  readFile(localizationSourcePath, "utf8"),
  readFile(archiveReadmePath, "utf8"),
  readFile(manifestPath, "utf8"),
]);

const manifest = JSON.parse(manifestRaw);

const title = matchRequired(
  sectionBetween(copyPack, "## Store Title", "## Short Description"),
  /- `([^`]+)`/,
  "store title in copy pack",
  errors,
);
const shortDescription = matchRequired(
  sectionBetween(copyPack, "## Short Description", "## Overview Paragraph"),
  /- `([^`]+)`/,
  "short description in copy pack",
  errors,
);
const overview = matchRequired(
  sectionBetween(copyPack, "## Overview Paragraph", "## Feature Bullets"),
  /- `([^`]+)`/,
  "overview paragraph in copy pack",
  errors,
);

const featureSection = sectionBetween(copyPack, "## Feature Bullets", "## Screenshot Caption Pack");
const featureBullets = featureSection
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => /^- `/.test(line))
  .map((line) => line.replace(/^- `|`$/g, ""));

const captionSection = sectionBetween(copyPack, "## Screenshot Caption Pack", "## Claim Guardrails");
const captionMatches = [...captionSection.matchAll(/- caption:\n\s+- `([^`]+)`/g)].map((match) => match[1]);

if (!localizationSource.includes("Store_Listing_Copy_Pack.md")) {
  errors.push("Localization source pack did not reference Store_Listing_Copy_Pack.md.");
}

if (!localizationSource.includes("2026-04-24-first-real-store-screenshot-capture-request-archive")) {
  errors.push("Localization source pack did not reference the first archived screenshot set.");
}

if (!localizationSource.includes("src/manifest.json")) {
  errors.push("Localization source pack did not reference src/manifest.json.");
}

if (!localizationSource.includes("## English Source Strings")) {
  errors.push("Localization source pack did not include an English Source Strings section.");
}

if (!localizationSource.includes("## Truth Anchor Map")) {
  errors.push("Localization source pack did not include a Truth Anchor Map section.");
}

if (!localizationSource.includes("## Translation Guardrails")) {
  errors.push("Localization source pack did not include a Translation Guardrails section.");
}

if (
  !localizationSource.includes(
    "this source pack is for future store-listing localization work and is not evidence that the in-product UI is localized today",
  )
) {
  errors.push("Localization source pack did not explicitly distinguish store listing localization from in-product localization.");
}

if (title && title !== manifest.name) {
  errors.push(`Store title ${JSON.stringify(title)} did not match manifest name ${JSON.stringify(manifest.name)}.`);
}

if (shortDescription && shortDescription !== manifest.description) {
  errors.push(
    `Short description ${JSON.stringify(shortDescription)} did not match manifest description ${JSON.stringify(manifest.description)}.`,
  );
}

const expectedIds = [
  "store.title",
  "store.short_description",
  "store.overview",
  "store.feature.quick_glance",
  "store.feature.setup_guidance",
  "store.feature.honest_coverage",
  "store.feature.sidepanel_depth",
  "store.feature.runtime_evidence",
  "store.screenshot_caption.01_toolbar_first",
  "store.screenshot_caption.02_setup_guidance",
  "store.screenshot_caption.03_honest_contract_or_policy_only",
  "store.screenshot_caption.04_settings_and_setup_depth",
  "store.screenshot_caption.05_provider_or_dashboard_depth",
];

for (const id of expectedIds) {
  if (!localizationSource.includes(`\`${id}\``)) {
    errors.push(`Localization source pack did not include string id ${JSON.stringify(id)}.`);
  }
}

const expectedStrings = [
  title,
  shortDescription,
  overview,
  ...featureBullets,
  ...captionMatches,
].filter(Boolean);

for (const value of expectedStrings) {
  if (!localizationSource.includes(`\`${value}\``)) {
    errors.push(`Localization source pack did not preserve source string ${JSON.stringify(value)}.`);
  }
}

const requiredProperNouns = ["AI Usage Dashboard", "Chrome", "Cursor", "Claude Code", "Codex", "Gemini"];
for (const noun of requiredProperNouns) {
  if (!localizationSource.includes(`\`${noun}\``)) {
    errors.push(`Localization source pack did not include translation guardrail for ${JSON.stringify(noun)}.`);
  }
}

const archiveScreenshotNames = normalizeListBlock(sectionBetween(archiveReadme, "## Archived Screenshots", "## Truth Note"));
for (const filename of archiveScreenshotNames) {
  if (!localizationSource.includes(`\`${filename}\``)) {
    errors.push(`Localization source pack did not reference archived screenshot ${JSON.stringify(filename)}.`);
  }
}

await mkdir(outputDir, { recursive: true });
await writeFile(
  outputPath,
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      title,
      shortDescription,
      overview,
      featureBullets,
      captionMatches,
      archiveScreenshotNames,
      errors,
    },
    null,
    2,
  ),
);

if (errors.length > 0) {
  console.error("phase151: store listing localization source pack review failed");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("phase151: store listing localization source pack verified");
