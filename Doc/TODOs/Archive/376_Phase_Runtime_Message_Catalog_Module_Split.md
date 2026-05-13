# Phase 376 - Runtime Message Catalog Module Split

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

Keep the runtime i18n layer maintainable after the first 14-locale expansion and the `zh-TW`, `ja`, and `ko` shell pilots by moving the large runtime message catalog out of `src/shared/i18n.ts`.

## Scope

- Move English runtime messages and locale override catalogs into `src/shared/runtime-message-catalogs.ts`.
- Keep locale registry, locale resolution, text direction, runtime formatting, and public i18n helpers in `src/shared/i18n.ts`.
- Export the existing `RuntimeMessages` type so the catalog module keeps the same compile-time key coverage.
- Keep all runtime behavior and shipped translation scope unchanged.

## Preserved Boundaries

- No new translated strings.
- No provider support-claim changes.
- No raw provider evidence, diagnostic raw body, archive/export schema, or vendor-owned string translation.
- No manifest locale, Chrome Web Store listing, release package, or submitted review boundary changes.
- No runtime locale registry changes.

## Acceptance

- `getRuntimeMessageCatalog(locale)` returns the same complete catalogs through the new module boundary.
- `src/shared/i18n.ts` no longer owns the large message literal block.
- Existing i18n completeness, focused runtime i18n tests, and typecheck pass.

## Planned Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added `src/shared/runtime-message-catalogs.ts` for English runtime messages, locale overrides, and catalog building.
- Updated `src/shared/i18n.ts` to import the catalog builder while keeping registry, resolver, formatter, and public helper ownership unchanged.
- Updated maintained docs so future localization work knows where runtime catalog entries now live.

## Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run test`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Future runtime shell pilot locales should add catalog overrides in `src/shared/runtime-message-catalogs.ts`, not in `src/shared/i18n.ts`.
