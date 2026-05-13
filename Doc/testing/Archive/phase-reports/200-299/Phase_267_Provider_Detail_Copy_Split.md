# Phase 267 - Provider Detail Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 267 provider-detail copy split and regression checks

## Scope

Phase 267 moved provider-detail localized copy and small label helpers from `src/shared/localized-copy.ts` into:

- `src/shared/provider-detail-localized-copy.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `buildProviderDetailLocalizedCopy`, `getProviderDetailStatusBadgeLabel`, and `getPermissionStatusLabel`, so existing provider-detail consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/provider-detail-localized-copy.test.ts src/sidepanel/routes/ProviderDetailPage.test.tsx --run`
  - verifies English provider-detail labels, usage copy, badge fallbacks, and permission labels
  - verifies Simplified Chinese provider-detail labels and usage copy
  - verifies the existing `localized-copy` re-export path still works
  - keeps the provider detail page component test adjacent to the moved copy
- `npm run phase267:review`
  - verifies `phase267:review` package script wiring
  - verifies provider-detail copy moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/provider-detail-localized-copy.test.ts src/sidepanel/routes/ProviderDetailPage.test.tsx --run`
- `npm run phase267:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
