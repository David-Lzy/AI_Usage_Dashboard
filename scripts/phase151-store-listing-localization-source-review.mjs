import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const copyPackPath = path.join(repoRoot, "Doc/Store/Store_Listing_Copy_Pack.md");
const localizationSourcePath = path.join(
  repoRoot,
  "Doc/Store/Store_Listing_Localization_Source_Pack.md",
);
const localeDraftPath = path.join(
  repoRoot,
  "Doc/Store/Store_Listing_Localization_14_Locale_Draft.md",
);
const outputDir = path.join(
  repoRoot,
  "tmp/phase151-store-listing-localization-source-review",
);

function extractField(documentText, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = documentText.match(
    new RegExp(`^${escapedLabel}:\\n\\n\`([^\\n]+)\`$`, "m"),
  );
  return match ? match[1] : null;
}

const [copyPack, localizationSource, localeDraft, englishMessagesRaw] =
  await Promise.all([
    readFile(copyPackPath, "utf8"),
    readFile(localizationSourcePath, "utf8"),
    readFile(localeDraftPath, "utf8"),
    readFile(path.join(repoRoot, "public/_locales/en/messages.json"), "utf8"),
  ]);

const errors = [];
const englishMessages = JSON.parse(englishMessagesRaw);
const title = extractField(copyPack, "Title");
const shortDescription = extractField(copyPack, "Short description");
const overview = extractField(copyPack, "Collapsed-view abstract");

if (title !== englishMessages.manifest_ext_name?.message) {
  errors.push("Copy-pack title drifted from the English manifest catalog.");
}
if (shortDescription !== englishMessages.manifest_ext_description?.message) {
  errors.push("Copy-pack short description drifted from the English manifest catalog.");
}

for (const marker of [
  "Store_Listing_Copy_Pack.md",
  "src/manifest.json",
  "Store_Listing_Localization_14_Locale_Draft.md",
  "## English Source Strings",
  "## Translation Guardrails",
  "`store.title`",
  "`store.short_description`",
  "`store.overview`",
  "`store.feature.custom_sources`",
  "`Sub2API`",
]) {
  if (!localizationSource.includes(marker)) {
    errors.push(`Localization source pack is missing ${JSON.stringify(marker)}.`);
  }
}

for (const value of [title, shortDescription, overview].filter(Boolean)) {
  if (!localizationSource.includes(`\`${value}\``)) {
    errors.push(`Localization source pack did not preserve ${JSON.stringify(value)}.`);
  }
}

const supportedLocales = [
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "es-419",
  "pt-BR",
  "fr",
  "de",
  "it",
  "ru",
  "ar",
  "hi",
  "id",
];
for (const locale of supportedLocales) {
  const sectionStart = localeDraft.indexOf(`## ${locale}\n`);
  const nextSection = localeDraft.indexOf("\n## ", sectionStart + 4);
  const section = localeDraft.slice(
    sectionStart,
    nextSection === -1 ? undefined : nextSection,
  );
  if (sectionStart === -1) {
    errors.push(`Locale draft is missing ${locale}.`);
  } else if (!section.includes("Sub2API")) {
    errors.push(`Locale draft ${locale} section is missing Sub2API coverage.`);
  }
}

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "phase151-results.json"),
  `${JSON.stringify(
    { title, shortDescription, overview, supportedLocales, errors },
    null,
    2,
  )}\n`,
  "utf8",
);

if (errors.length > 0) {
  console.error("phase151: store listing localization source review failed");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("phase151: current store listing localization source verified");
