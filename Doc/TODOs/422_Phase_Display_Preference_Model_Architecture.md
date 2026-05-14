# Phase 422 - Display Preference Model Architecture

Status: active

## Goal

Add the shared storage and normalization model for per-surface provider order and per-surface provider quota-item display preferences.

## Scope

- Add `popup`, `sidebar`, and `fullPage` display-surface types.
- Extend `AppSettings` with:
  - `providerOrderBySurface`
  - `progressItemsBySurface`
- Add defaults, normalizers, and storage migration behavior for legacy states.
- Keep the existing visible provider behavior unchanged until later rendering phases consume the new preferences.

## Preserved Boundaries

- Do not change provider snapshots, source-selection contracts, host permissions, credentials, or sync behavior.
- Do not change existing popup/sidebar/full-page rendering order in this phase.
- Do not add UI controls in this phase.
- Unknown provider ids or progress item ids must be dropped during normalization.

## Acceptance

- Legacy stored states normalize to valid default display preferences.
- Unknown provider ids are removed from provider-order preferences.
- New/missing known providers are appended in default provider order.
- Unknown progress item ids are removed while known explicit entries keep their saved order and visibility.
- Existing `popupProgressStyle`, `sidebarProgressStyle`, and `fullPageProgressStyle` behavior remains intact.

## Planned Verification

- `npm run test -- src/shared/display-preferences.test.ts src/shared/storage.test.ts`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 423 consumes provider order preferences in popup/sidebar/full-page view-model rendering.
