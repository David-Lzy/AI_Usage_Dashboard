# Phase 492 - Six Locale Store Copy Handoff

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Prepare a Chrome Web Store product-detail handoff for the first public-source store update in six priority languages.

## Scope

- Add [Store_Public_Release_6_Locale_Handoff.md](../../../../Store/Store_Public_Release_6_Locale_Handoff.md).
- Refresh product description artifacts for:
  - `en-US`
  - `zh-CN`
  - `zh-TW`
  - `ja`
  - `es-419`
  - `pt-BR`
- Keep [Store_Listing_Localization_14_Locale_Draft.md](../../../../Store/Store_Listing_Localization_14_Locale_Draft.md) intact because `npm run i18n:check` validates its 14-locale coverage.

## Preserved Boundaries

- Do not translate provider names or product names blindly.
- Do not strengthen partial, policy-only, or diagnostic-only provider support into exact live quota claims.
- Do not change runtime locale catalogs or manifest locale files in this phase.

## Acceptance

- The first visible paragraph in each selected store language works as a concise abstract.
- The copy includes source/permission/privacy boundaries in plain language.
- Store README lists the six product description artifacts.
- The 14-locale draft remains compatible with existing i18n checks.

## Verification

- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Run human review for each localized listing before submitting through Chrome Web Store.
- If full 14-language store copy is required, expand from this six-locale handoff without weakening claim boundaries.
