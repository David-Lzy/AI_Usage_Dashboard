# Phase 372 - Store Listing Localization Draft Check

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

Make `npm run i18n:check` guard the 14-locale Chrome Web Store listing draft as part of the same localization quality gate used for runtime and manifest locales.

## Scope

- Verify `Doc/Store_Listing_Localization_14_Locale_Draft.md` lists the same supported locale tags as `SUPPORTED_APP_LOCALES`.
- Verify the draft has one section for each shipped runtime locale, in registry order.
- Verify each locale section preserves the product title.
- Verify each locale section has non-empty short description and overview fields.
- Verify each locale section has exactly five feature bullets and five screenshot captions.

## Preserved Boundaries

- No translation content changes.
- No Chrome Web Store submission changes.
- No release package, manifest version, or runtime behavior changes.
- No provider support-claim changes.

## Acceptance

- `npm run i18n:check` fails if the store listing draft is missing a locale.
- `npm run i18n:check` fails if the listing draft locale order drifts from the runtime registry.
- `npm run i18n:check` fails if a section loses required listing fields or the expected bullet/caption counts.
- Existing runtime, manifest, and RDP locale drift checks continue to pass.

## Planned Verification

- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added store-listing localization draft parsing to `scripts/check-i18n-locales.mjs`.
- The standard i18n check now covers runtime registry metadata, Chrome manifest catalogs, the RDP locale capture helper, and the 14-locale store listing draft structure.
- Updated maintained localization docs and phase indexes to mark the store listing draft guard as shipped.

## Verification

- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- This phase checks coverage and structure only; human sampling is still required before any translated Chrome Web Store listing submission.
