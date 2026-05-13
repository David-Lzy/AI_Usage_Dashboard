#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";

import { SUPPORTED_RDP_CAPTURE_LOCALES } from "./lib/rdp-extension-locale-route.mjs";

const repoRoot = process.cwd();
const localeRoot = path.join(repoRoot, "public", "_locales");
const requiredManifestIds = [
  "manifest_ext_name",
  "manifest_ext_description",
  "manifest_action_default_title",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArrayEqual(left, right, message) {
  assert(JSON.stringify(left) === JSON.stringify(right), message);
}

async function readMessagesJson(chromeLocale) {
  const filePath = path.join(localeRoot, chromeLocale, "messages.json");
  const raw = await readFile(filePath, "utf8");

  return JSON.parse(raw);
}

async function readRuntimeLocaleContract() {
  const source = await readFile(
    path.join(repoRoot, "src", "shared", "i18n.ts"),
    "utf8",
  );
  const supportedLocaleMatch = source.match(
    /export const SUPPORTED_APP_LOCALES = \[([\s\S]*?)\] as const;/,
  );
  assert(
    supportedLocaleMatch,
    "Could not read SUPPORTED_APP_LOCALES from src/shared/i18n.ts.",
  );

  const runtimeLocales = [...supportedLocaleMatch[1].matchAll(/"([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert(
    runtimeLocales.length > 0,
    "SUPPORTED_APP_LOCALES must include at least one runtime locale.",
  );
  assert(
    new Set(runtimeLocales).size === runtimeLocales.length,
    "SUPPORTED_APP_LOCALES contains duplicate runtime locale tags.",
  );

  const metadataBlockMatch = source.match(
    /export const APP_LOCALE_METADATA:[\s\S]*?=\s*\{([\s\S]*?)\};\n\n(?:export\s+)?type RuntimeMessageId/,
  );
  assert(
    metadataBlockMatch,
    "Could not read APP_LOCALE_METADATA from src/shared/i18n.ts.",
  );

  const metadataLocales = [
    ...metadataBlockMatch[1].matchAll(/locale:\s+"([^"]+)"/g),
  ].map((match) => match[1]);
  const chromeLocales = [
    ...metadataBlockMatch[1].matchAll(/chromeLocale:\s+"([^"]+)"/g),
  ].map((match) => match[1]);

  assertArrayEqual(
    metadataLocales,
    runtimeLocales,
    "APP_LOCALE_METADATA locale entries drifted from SUPPORTED_APP_LOCALES.",
  );
  assert(
    chromeLocales.length === runtimeLocales.length,
    "APP_LOCALE_METADATA must define one chromeLocale for every runtime locale.",
  );
  assert(
    new Set(chromeLocales).size === chromeLocales.length,
    "APP_LOCALE_METADATA contains duplicate chromeLocale directory names.",
  );

  return {
    runtimeLocales,
    chromeLocales,
  };
}

function extractStoreListingSections(text) {
  const headingMatches = [...text.matchAll(/^## ([^\n]+)\n/gm)];

  return headingMatches.map((match, index) => {
    const nextMatch = headingMatches[index + 1];
    const startIndex = match.index + match[0].length;
    const endIndex = nextMatch ? nextMatch.index : text.length;

    return {
      locale: match[1],
      body: text.slice(startIndex, endIndex),
    };
  });
}

function extractListBlock(sectionBody, startLabel, nextLabel) {
  const marker = `${startLabel}:\n`;
  const startIndex = sectionBody.indexOf(marker);
  assert(startIndex !== -1, `Store listing section is missing ${startLabel}.`);

  const blockStart = startIndex + marker.length;
  const nextMarker = nextLabel ? `\n${nextLabel}:` : "";
  const endIndex =
    nextMarker.length > 0
      ? sectionBody.indexOf(nextMarker, blockStart)
      : sectionBody.length;

  assert(
    endIndex !== -1,
    `Store listing section is missing ${nextLabel} after ${startLabel}.`,
  );

  return sectionBody.slice(blockStart, endIndex);
}

function countMarkdownListItems(block) {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .length;
}

async function verifyStoreListingLocalizationDraft(runtimeLocales) {
  const text = await readFile(
    path.join(repoRoot, "Doc", "Store_Listing_Localization_14_Locale_Draft.md"),
    "utf8",
  );
  const supportedLocalesMatch = text.match(/^Supported locales:\s*(.+)$/m);
  assert(
    supportedLocalesMatch,
    "Store listing localization draft is missing a Supported locales line.",
  );
  const supportedLocales = [
    ...supportedLocalesMatch[1].matchAll(/`([^`]+)`/g),
  ].map((match) => match[1]);

  assertArrayEqual(
    supportedLocales,
    runtimeLocales,
    "Store listing Supported locales line drifted from SUPPORTED_APP_LOCALES.",
  );

  const sections = extractStoreListingSections(text);
  const sectionLocales = sections.map((section) => section.locale);

  assertArrayEqual(
    sectionLocales,
    runtimeLocales,
    "Store listing locale sections drifted from SUPPORTED_APP_LOCALES.",
  );

  for (const section of sections) {
    const titleMatch = section.body.match(/^Title:\s*(.+)$/m);
    const shortDescriptionMatch = section.body.match(
      /^Short description:\s*(.+)$/m,
    );
    const overviewMatch = section.body.match(/^Overview:\s*(.+)$/m);

    assert(
      titleMatch?.[1]?.trim() === "AI Usage Dashboard",
      `${section.locale} store listing title must preserve the product name.`,
    );
    assert(
      shortDescriptionMatch?.[1]?.trim().length > 0,
      `${section.locale} store listing short description is missing.`,
    );
    assert(
      overviewMatch?.[1]?.trim().length > 0,
      `${section.locale} store listing overview is missing.`,
    );

    const featureBullets = extractListBlock(
      section.body,
      "Feature bullets",
      "Screenshot captions",
    );
    const screenshotCaptions = extractListBlock(
      section.body,
      "Screenshot captions",
      null,
    );

    assert(
      countMarkdownListItems(featureBullets) === 5,
      `${section.locale} store listing must include exactly 5 feature bullets.`,
    );
    assert(
      countMarkdownListItems(screenshotCaptions) === 5,
      `${section.locale} store listing must include exactly 5 screenshot captions.`,
    );
  }
}

const { runtimeLocales, chromeLocales: supportedChromeLocales } =
  await readRuntimeLocaleContract();

assertArrayEqual(
  SUPPORTED_RDP_CAPTURE_LOCALES,
  runtimeLocales,
  "RDP capture supported locales drifted from SUPPORTED_APP_LOCALES.",
);

for (const chromeLocale of supportedChromeLocales) {
  const messages = await readMessagesJson(chromeLocale);
  const keys = Object.keys(messages).sort();

  assert(
    JSON.stringify(keys) === JSON.stringify([...requiredManifestIds].sort()),
    `${chromeLocale} messages.json keys differ from manifest contract: ${keys.join(", ")}`,
  );

  for (const id of requiredManifestIds) {
    const message = messages[id]?.message;
    assert(
      typeof message === "string" && message.trim().length > 0,
      `${chromeLocale}.${id} is missing a non-empty message.`,
    );
  }
}

await verifyStoreListingLocalizationDraft(runtimeLocales);

console.log(
  `i18n locale check passed for ${supportedChromeLocales.length} Chrome locale catalogs, ${runtimeLocales.length} runtime locales, and the store listing localization draft.`,
);
