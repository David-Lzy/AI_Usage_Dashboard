# Phase 271 - Settings Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a localization maintainability slice; it extracts Settings structured copy without changing Settings behavior or import compatibility

## Goal

Continue splitting oversized `src/shared/localized-copy.ts` by moving Settings localized copy into a focused shared module.

## Scope

- add `src/shared/settings-localized-copy.ts`
- move `buildSettingsLocalizedCopy`, `getSettingsSourcePreferenceLabel`, and `getSettingsSourceKindLabel` out of `src/shared/localized-copy.ts`
- keep the legacy `src/shared/localized-copy.ts` export path through re-exports
- add focused coverage for English Settings source labels, Simplified Chinese Settings helper copy, and the legacy re-export path

## Preserved Boundaries

- do not change Settings behavior, provider data models, source truth labels, popup copy, provider-detail copy, source-display copy, store workflow copy, operator workspace copy, or runtime locale behavior
- do not change consumer import paths in this slice
- do not split diagnostic presentation copy in this slice

## Completed Work

- Extracted Settings copy into `src/shared/settings-localized-copy.ts`.
- Re-exported Settings copy helpers from `src/shared/localized-copy.ts`.
- Added `src/shared/settings-localized-copy.test.ts`.
- Added `npm run phase271:review` to verify runtime markers, closeout docs, and export-boundary preservation.

## Verification

- `npm run test -- src/shared/settings-localized-copy.test.ts src/shared/i18n.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run phase271:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split diagnostic presentation copy from `src/shared/localized-copy.ts` if it remains large enough to justify another compatibility-preserving module
- reassess `src/sidepanel/standard-app-actions.ts` after the localization split queue is complete
- keep consumer import compatibility unless a later phase deliberately updates call sites
