import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const outputDir = path.join(
  projectRoot,
  "tmp",
  "phase150-store-listing-copy-pack-review",
);
const listingCopyPath = path.join(projectRoot, "Doc/Store/Store_Listing_Copy_Pack.md");

function extractField(documentText, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = documentText.match(
    new RegExp(`^${escapedLabel}:\\n\\n\`([^\\n]+)\`$`, "m"),
  );
  return match ? match[1] : null;
}

async function run() {
  const issues = [];
  const listingCopy = await readFile(listingCopyPath, "utf8");
  const englishMessages = JSON.parse(
    await readFile(path.join(projectRoot, "public/_locales/en/messages.json"), "utf8"),
  );
  const title = extractField(listingCopy, "Title");
  const shortDescription = extractField(listingCopy, "Short description");
  const overview = extractField(listingCopy, "Collapsed-view abstract");

  if (title !== englishMessages.manifest_ext_name?.message) {
    issues.push(
      `Store title ${JSON.stringify(title)} did not match the English manifest name ${JSON.stringify(englishMessages.manifest_ext_name?.message)}.`,
    );
  }
  if (shortDescription !== englishMessages.manifest_ext_description?.message) {
    issues.push(
      `Short description ${JSON.stringify(shortDescription)} did not match the English manifest description ${JSON.stringify(englishMessages.manifest_ext_description?.message)}.`,
    );
  }
  if (!shortDescription) {
    issues.push("Store listing copy pack is missing the short description.");
  } else if (shortDescription.length > 132) {
    issues.push(
      `Short description length was ${shortDescription.length}, exceeding the 132-character limit.`,
    );
  }
  if (!overview) {
    issues.push("Store listing copy pack is missing the collapsed-view abstract.");
  }
  for (const marker of [
    "Feature bullets:",
    "Screenshot captions:",
    "## Claim Guardrails",
    "Sub2API-compatible",
  ]) {
    if (!listingCopy.includes(marker)) {
      issues.push(`Store listing copy pack is missing ${JSON.stringify(marker)}.`);
    }
  }

  const uploadLocales = ["en-US", "zh-CN", "zh-TW", "ja", "es-419", "pt-BR"];
  for (const locale of uploadLocales) {
    const descriptionPath = path.join(
      projectRoot,
      "Doc/Store",
      `Chrome_Web_Store_Product_Description_${locale}.md`,
    );
    const description = await readFile(descriptionPath, "utf8");
    if (!description.includes("Sub2API")) {
      issues.push(`${locale} upload description is missing bounded Sub2API coverage.`);
    }
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, "phase150-results.json"),
    `${JSON.stringify(
      {
        issues,
        title,
        shortDescription,
        shortDescriptionLength: shortDescription?.length ?? null,
        overview,
        uploadLocales,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  if (issues.length > 0) {
    throw new Error(
      `phase150: store listing copy pack review found ${issues.length} issue(s).\n${issues
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
  }

  console.log("phase150: current store listing copy pack verified");
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
