import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

import {
  SUPPORTED_RDP_CAPTURE_LOCALES,
  appendLocaleOverride,
  normalizeRdpCaptureLocale,
} from "./lib/rdp-extension-locale-route.mjs";

const expectedLocales = [
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

assert.deepEqual(
  SUPPORTED_RDP_CAPTURE_LOCALES,
  expectedLocales,
  "RDP capture supported locales must match the shipped runtime locale set.",
);

const i18nSource = await readFile("src/shared/i18n.ts", "utf8");
const runtimeLocaleMatch = i18nSource.match(
  /export const SUPPORTED_APP_LOCALES = \[([\s\S]*?)\] as const;/,
);
assert.ok(runtimeLocaleMatch, "Could not read SUPPORTED_APP_LOCALES from src/shared/i18n.ts.");
const runtimeLocales = [...runtimeLocaleMatch[1].matchAll(/"([^"]+)"/g)].map(
  (match) => match[1],
);
assert.deepEqual(
  runtimeLocales,
  SUPPORTED_RDP_CAPTURE_LOCALES,
  "RDP capture locale guard drifted from src/shared/i18n.ts.",
);

assert.equal(normalizeRdpCaptureLocale(""), "");
assert.equal(normalizeRdpCaptureLocale(" ar "), "ar");
assert.throws(
  () => normalizeRdpCaptureLocale("en-US"),
  /Unsupported RDP capture locale: en-US/,
);
assert.throws(
  () => normalizeRdpCaptureLocale("zh_CN"),
  /Unsupported RDP capture locale: zh_CN/,
);

assert.equal(
  appendLocaleOverride("src/popup/index.html", "ar"),
  "src/popup/index.html?app-locale=ar",
);
assert.equal(
  appendLocaleOverride("src/sidepanel/index.html?surface=full-page#settings", "pt-BR"),
  "src/sidepanel/index.html?surface=full-page&app-locale=pt-BR#settings",
);
assert.equal(
  appendLocaleOverride("src/sidepanel/index.html#provider-detail:codex", "es-419"),
  "src/sidepanel/index.html?app-locale=es-419#provider-detail:codex",
);
assert.equal(
  appendLocaleOverride("src/sidepanel/index.html?surface=full-page#dashboard", ""),
  "src/sidepanel/index.html?surface=full-page#dashboard",
);

const captureScript = await readFile("scripts/capture-rdp-extension-window.mjs", "utf8");
assert.ok(
  captureScript.includes("./lib/rdp-extension-locale-route.mjs"),
  "capture-rdp-extension-window.mjs must use the shared locale route helper.",
);
assert.ok(
  !captureScript.includes("function appendLocaleOverride"),
  "capture-rdp-extension-window.mjs must not keep a duplicate locale URL helper.",
);

console.log("phase369: RDP locale capture guard verified");
