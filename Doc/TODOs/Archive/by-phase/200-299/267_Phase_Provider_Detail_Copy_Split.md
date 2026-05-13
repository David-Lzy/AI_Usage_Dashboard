# Phase 267 - Provider Detail Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a localization maintainability slice; it extracts provider-detail copy without changing copy text, badge semantics, permission labels, or import compatibility

## Goal

Continue splitting oversized `src/shared/localized-copy.ts` by moving provider-detail localized copy and small provider-detail label helpers into a focused shared module.

## Scope

- add `src/shared/provider-detail-localized-copy.ts`
- move `buildProviderDetailLocalizedCopy`, `getProviderDetailStatusBadgeLabel`, and `getPermissionStatusLabel` out of `src/shared/localized-copy.ts`
- keep the legacy `src/shared/localized-copy.ts` export path through re-exports
- add focused coverage for English labels, Simplified Chinese labels, badge fallback rules, permission labels, and the legacy re-export path

## Preserved Boundaries

- do not change provider data models, provider detail rendering, badge logic, permission semantics, provider truth labels, Settings copy, popup copy, source display copy, or runtime locale behavior
- do not change consumer import paths in this slice
- do not split additional localization surfaces in this slice

## Completed Work

- Extracted provider-detail copy into `src/shared/provider-detail-localized-copy.ts`.
- Re-exported provider-detail copy helpers from `src/shared/localized-copy.ts`.
- Added `src/shared/provider-detail-localized-copy.test.ts`.
- Added `npm run phase267:review` to verify runtime markers, closeout docs, and export-boundary preservation.

## Verification

- `npm run test -- src/shared/provider-detail-localized-copy.test.ts src/sidepanel/routes/ProviderDetailPage.test.tsx --run`
- `npm run phase267:review`
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
