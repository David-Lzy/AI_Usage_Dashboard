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
const archiveId = "2026-04-24-first-real-store-screenshot-capture-request-archive";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractSectionValue(documentText, sectionLabel) {
  const escapedLabel = sectionLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = documentText.match(
    new RegExp(`- ${escapedLabel}:\\n  - \`([^\\n]+)\``, "m"),
  );
  return match ? match[1] : null;
}

async function run() {
  const issues = [];

  await mkdir(outputDir, { recursive: true });

  const listingCopy = await readFile(listingCopyPath, "utf8");
  const manifest = JSON.parse(
    await readFile(path.join(projectRoot, "src/manifest.json"), "utf8"),
  );

  const preferredTitle = extractSectionValue(listingCopy, "preferred store title");
  const shortDescription = extractSectionValue(
    listingCopy,
    "preferred short description",
  );
  const statedShortDescriptionLength = extractSectionValue(
    listingCopy,
    "short-description length",
  );

  if (!listingCopy.includes(archiveId)) {
    issues.push("Store listing copy pack did not reference the first real screenshot archive.");
  }

  if (!listingCopy.includes("## Screenshot Caption Pack")) {
    issues.push("Store listing copy pack is missing the screenshot caption section.");
  }

  const screenshotFilenames = [
    "01-toolbar-first-quick-glance.png",
    "02-setup-guidance.png",
    "03-honest-contract-or-policy-only.png",
    "04-settings-and-setup-depth.png",
    "05-provider-or-dashboard-depth.png",
  ];

  for (const filename of screenshotFilenames) {
    if (!listingCopy.includes(filename)) {
      issues.push(`Store listing copy pack is missing screenshot mapping for ${filename}.`);
    }
  }

  if (preferredTitle !== manifest.name) {
    issues.push(
      `Preferred store title ${JSON.stringify(preferredTitle)} did not match manifest name ${JSON.stringify(manifest.name)}.`,
    );
  }

  if (shortDescription !== manifest.description) {
    issues.push(
      `Preferred short description ${JSON.stringify(shortDescription)} did not match manifest description ${JSON.stringify(manifest.description)}.`,
    );
  }

  if (shortDescription === null) {
    issues.push("Store listing copy pack is missing the preferred short description.");
  } else if (shortDescription.length > 132) {
    issues.push(
      `Preferred short description length was ${shortDescription.length}, exceeding the 132-character target.`,
    );
  }

  if (statedShortDescriptionLength !== String(shortDescription?.length ?? "")) {
    issues.push(
      `Store listing copy pack declared short-description length ${JSON.stringify(statedShortDescriptionLength)} but actual length was ${shortDescription?.length ?? "unknown"}.`,
    );
  }

  if (!listingCopy.includes("## Claim Guardrails")) {
    issues.push("Store listing copy pack is missing claim guardrails.");
  }

  await writeFile(
    path.join(outputDir, "phase150-results.json"),
    `${JSON.stringify(
      {
        issues,
        preferredTitle,
        shortDescription,
        shortDescriptionLength: shortDescription?.length ?? null,
        archiveId,
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

  console.log("phase150: store listing copy pack verified");
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
