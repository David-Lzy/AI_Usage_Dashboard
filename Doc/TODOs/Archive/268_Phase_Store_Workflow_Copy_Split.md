# Phase 268 - Store Workflow Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a localization maintainability slice; it extracts store-screenshot workflow copy without changing screenshot seed behavior, native popup probe behavior, or import compatibility

## Goal

Continue splitting oversized `src/shared/localized-copy.ts` by moving store screenshot workflow localized copy into a focused shared module.

## Scope

- add `src/shared/store-workflow-localized-copy.ts`
- move `buildStoreWorkflowLocalizedCopy` out of `src/shared/localized-copy.ts`
- keep the legacy `src/shared/localized-copy.ts` export path through a re-export
- add focused coverage for English store seed copy, Simplified Chinese store workflow copy, native popup probe copy, and the legacy re-export path

## Preserved Boundaries

- do not change store screenshot seed behavior, native popup probe behavior, provider data models, operator copy, Settings copy, popup copy, source display copy, provider-detail copy, or runtime locale behavior
- do not change consumer import paths in this slice
- do not split additional localization surfaces in this slice

## Completed Work

- Extracted store workflow copy into `src/shared/store-workflow-localized-copy.ts`.
- Re-exported `buildStoreWorkflowLocalizedCopy` from `src/shared/localized-copy.ts`.
- Added `src/shared/store-workflow-localized-copy.test.ts`.
- Added `npm run phase268:review` to verify runtime markers, closeout docs, and export-boundary preservation.

## Verification

- `npm run test -- src/shared/store-workflow-localized-copy.test.ts src/sidepanel/special-route-app.test.tsx --run`
- `npm run phase268:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split popup localized copy from `src/shared/localized-copy.ts`
- split operator workspace localized copy from `src/shared/localized-copy.ts`
- keep consumer import compatibility unless a later phase deliberately updates call sites
