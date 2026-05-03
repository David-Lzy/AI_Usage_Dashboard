# Phase 266 - Provider Source Display Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a localization maintainability slice; it extracts provider-source display copy without changing copy text, provider source contracts, or import compatibility

## Goal

Continue splitting oversized `src/shared/localized-copy.ts` by moving provider-source display localized copy into a focused shared module.

## Scope

- add `src/shared/provider-source-display-localized-copy.ts`
- move `buildProviderSourceDisplayLocalizedCopy` out of `src/shared/localized-copy.ts`
- keep the legacy `src/shared/localized-copy.ts` export path through a re-export
- add focused coverage for English default-copy identity, Simplified Chinese labels, and the legacy re-export path

## Preserved Boundaries

- do not change provider data models, source-selection semantics, provider truth labels, source fidelity copy, Settings copy, popup copy, provider detail copy, or runtime locale behavior
- do not change consumer import paths in this slice
- do not split additional localization surfaces in this slice

## Completed Work

- Extracted provider-source display copy into `src/shared/provider-source-display-localized-copy.ts`.
- Re-exported `buildProviderSourceDisplayLocalizedCopy` from `src/shared/localized-copy.ts`.
- Added `src/shared/provider-source-display-localized-copy.test.ts`.
- Added `npm run phase266:review` to verify runtime markers, closeout docs, and export-boundary preservation.

## Verification

- `npm run test -- src/shared/provider-source-display-localized-copy.test.ts src/shared/provider-sources.test.ts --run`
- `npm run phase266:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split popup localized copy from `src/shared/localized-copy.ts`
- split operator/store workflow localized copy from `src/shared/localized-copy.ts`
- keep consumer import compatibility unless a later phase deliberately updates call sites
