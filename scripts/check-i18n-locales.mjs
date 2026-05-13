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
    /export const APP_LOCALE_METADATA:[\s\S]*?=\s*\{([\s\S]*?)\};\n\ntype RuntimeMessageId/,
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

console.log(
  `i18n locale check passed for ${supportedChromeLocales.length} Chrome locale catalogs and ${runtimeLocales.length} runtime locales.`,
);
