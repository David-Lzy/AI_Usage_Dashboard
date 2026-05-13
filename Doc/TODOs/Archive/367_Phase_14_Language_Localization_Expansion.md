# Phase 367 - 14-Language Localization Expansion

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Expand the current `en + zh-CN` localization pilot into a 14-locale architecture for runtime locale resolution, Chrome manifest surfaces, and Chrome Web Store listing copy drafts.

## Scope

- Add a unified locale registry for `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id`.
- Preserve `system` as the persisted locale preference default.
- Resolve system browser languages to the closest shipped runtime locale, including `zh-TW`, `pt-BR`, `es-*`, and `ar`.
- Mark Arabic as `rtl` and keep the remaining shipped locales `ltr`.
- Generate Settings language options from the registry instead of hard-coded `en / zh-CN` options.
- Add a preview-only `?app-locale=<supported-locale>` override and RDP capture `--locale` option for locale visual checks without mutating saved settings.
- Expand Chrome manifest `_locales` catalogs for all 14 shipped locale directories while keeping the existing manifest message IDs stable.
- Add a Chrome Web Store listing localization draft covering title, short description, overview, feature bullets, and screenshot captions.
- Add repeatable i18n catalog checks for manifest locale completeness and runtime catalog key coverage.

## Preserved Boundaries

- No provider support-claim changes.
- No release package, manifest version, or Chrome Web Store submitted boundary changes.
- No runtime permission expansion.
- Raw provider evidence, diagnostic raw bodies, archive/export payloads, provider ids, API names, host origins, and vendor-owned source strings remain source-truth and are not translated.
- Deep structured copy beyond the current reviewed `zh-CN` pilot falls back to English until a future translation-review phase replaces those entries.

## Acceptance

- `AppLocalePreference` accepts `system` plus the 14 explicit shipped locale tags.
- `ResolvedAppLocale` covers exactly the 14 explicit runtime locales.
- Settings locale options include `system` plus exactly 14 explicit locale options from the registry.
- Runtime catalogs are complete for every supported locale by key, with English fallback where reviewed translations are not yet present.
- `ar` resolves to `rtl`; all other shipped locales resolve to `ltr`.
- All expected `public/_locales/<chrome_locale>/messages.json` files exist and contain the stable manifest message IDs.
- Store listing localization draft exists for all 14 target locales and preserves product/provider/platform naming guardrails.

## Planned Verification

- `npm run test -- src/shared/i18n.test.ts src/sidepanel/settings-preference-options.test.ts`
- `npm run i18n:check`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale en --output tmp/phase367-locale-rdp/dashboard-en.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale zh-CN --output tmp/phase367-locale-rdp/dashboard-zh-CN.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale ja --output tmp/phase367-locale-rdp/dashboard-ja.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale de --output tmp/phase367-locale-rdp/dashboard-de.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale ar --output tmp/phase367-locale-rdp/dashboard-ar-clean.png`
- `npm run store:capture-rdp-extension-window -- --route settings --locale ar --output tmp/phase367-locale-rdp/settings-ar.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ar --output tmp/phase367-locale-rdp/popup-ar.png`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added `SUPPORTED_APP_LOCALES` and `APP_LOCALE_METADATA` in `src/shared/i18n.ts`, covering runtime tags, Chrome locale directory names, native labels, Intl/html language tags, and text direction.
- Updated runtime locale normalization and system language resolution to support all 14 explicit locales plus `system`.
- Changed Settings locale options to be generated from the locale registry and shared common copy helpers for recurring labels such as remaining, reset, visible usage context, and toolbar badge copy.
- Added complete manifest catalogs under `public/_locales/` for the 14 target locales while preserving `manifest_ext_name`, `manifest_ext_description`, and `manifest_action_default_title`.
- Added locale override support for extension-window QA and wired `npm run store:capture-rdp-extension-window -- --locale <tag>` through the existing RDP capture helper.
- Added `npm run i18n:check` for manifest catalog completeness.
- Added `Doc/Store_Listing_Localization_14_Locale_Draft.md` as a guarded machine-draft Chrome Web Store localization pack.
- Updated targeted unit coverage for supported locale normalization, system resolution, RTL direction, Settings language options, runtime catalog completeness, and the operator runtime locale helper.

## Verification

- `npm run test -- src/shared/i18n.test.ts src/sidepanel/settings-preference-options.test.ts`
- `npm run i18n:check`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale en --output tmp/phase367-locale-rdp/dashboard-en.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale zh-CN --output tmp/phase367-locale-rdp/dashboard-zh-CN.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale ja --output tmp/phase367-locale-rdp/dashboard-ja.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale de --output tmp/phase367-locale-rdp/dashboard-de.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --locale ar --output tmp/phase367-locale-rdp/dashboard-ar-clean.png`
- `npm run store:capture-rdp-extension-window -- --route settings --locale ar --output tmp/phase367-locale-rdp/settings-ar.png`
- `npm run store:capture-rdp-extension-window -- --route popup --locale ar --output tmp/phase367-locale-rdp/popup-ar.png`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- A future translation-review slice should replace English fallback runtime copy for the new non-English locales with reviewed catalog entries.
- The RDP Arabic checks confirmed the `rtl` surfaces open and remain nonblank; because deep non-reviewed runtime copy still falls back to English, some punctuation reads awkwardly in RTL until Arabic runtime copy is translated.
