#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const localeRoot = path.join(repoRoot, "public", "_locales");
const supportedChromeLocales = [
  "en",
  "zh_CN",
  "zh_TW",
  "ja",
  "ko",
  "es_419",
  "pt_BR",
  "fr",
  "de",
  "it",
  "ru",
  "ar",
  "hi",
  "id",
];
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

async function readMessagesJson(chromeLocale) {
  const filePath = path.join(localeRoot, chromeLocale, "messages.json");
  const raw = await readFile(filePath, "utf8");

  return JSON.parse(raw);
}

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

console.log(
  `i18n locale check passed for ${supportedChromeLocales.length} Chrome locale catalogs.`,
);
