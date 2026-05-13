# Phase 370 - I18n Registry Drift Guard

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Make `npm run i18n:check` guard the full locale contract after the 14-locale expansion, not only the hard-coded Chrome `_locales` directory set.

## Scope

- Derive the Chrome manifest locale directory list from `APP_LOCALE_METADATA` in `src/shared/i18n.ts`.
- Verify `APP_LOCALE_METADATA.locale` entries stay aligned with `SUPPORTED_APP_LOCALES`.
- Verify Chrome locale directory names are complete and unique.
- Verify the RDP capture locale guard from `scripts/lib/rdp-extension-locale-route.mjs` stays aligned with the runtime locale registry.
- Preserve the existing manifest message-id completeness checks.

## Preserved Boundaries

- No runtime UI behavior changes.
- No locale list changes.
- No translation content changes.
- No manifest, package, release artifact, or Chrome Web Store boundary changes.
- No changes to provider support, permissions, or source contracts.

## Acceptance

- `npm run i18n:check` fails if a runtime locale exists without matching metadata.
- `npm run i18n:check` fails if Chrome `_locales` directory names drift from registry metadata.
- `npm run i18n:check` fails if the RDP capture helper supports a different locale list than runtime.
- Existing manifest message catalogs are still checked for the stable manifest ids.

## Planned Verification

- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Updated `scripts/check-i18n-locales.mjs` to parse the runtime locale registry from `src/shared/i18n.ts`.
- Changed manifest catalog checking to use the registry-derived Chrome locale directory names.
- Added duplicate and alignment checks for runtime locale metadata.
- Added an RDP capture locale alignment check so Phase 369's helper is guarded by the standard i18n command.

## Verification

- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Future translation-review phases can now change the locale registry with one standard drift check covering runtime, manifest, and RDP visual-QA helpers.
