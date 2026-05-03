# Phase 270 - Popup Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a localization maintainability slice; it extracts popup structured copy without changing popup behavior or import compatibility

## Goal

Continue splitting oversized `src/shared/localized-copy.ts` by moving popup localized copy into a focused shared module.

## Scope

- add `src/shared/popup-localized-copy.ts`
- move `buildPopupLocalizedCopy` and its popup-local count helper out of `src/shared/localized-copy.ts`
- keep the legacy `src/shared/localized-copy.ts` export path through a re-export
- add focused coverage for English popup setup copy, Simplified Chinese popup copy, and the legacy re-export path

## Preserved Boundaries

- do not change popup behavior, provider data models, source truth labels, Settings copy, provider-detail copy, source-display copy, store workflow copy, operator workspace copy, or runtime locale behavior
- do not change consumer import paths in this slice
- do not split Settings localized copy or diagnostic presentation copy in this slice

## Completed Work

- Extracted popup copy into `src/shared/popup-localized-copy.ts`.
- Re-exported `buildPopupLocalizedCopy` from `src/shared/localized-copy.ts`.
- Added `src/shared/popup-localized-copy.test.ts`.
- Added `npm run phase270:review` to verify runtime markers, closeout docs, and export-boundary preservation.

## Verification

- `npm run test -- src/shared/popup-localized-copy.test.ts src/shared/i18n.test.ts src/popup/view-models.test.ts --run`
- `npm run phase270:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split Settings localized copy from `src/shared/localized-copy.ts`
- reassess `src/sidepanel/standard-app-actions.ts` after the localization split queue is complete
- keep consumer import compatibility unless a later phase deliberately updates call sites
