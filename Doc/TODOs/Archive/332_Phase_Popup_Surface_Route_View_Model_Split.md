# Phase 332 - Popup Surface Route View Model Split

## Goal

Move popup secondary-action and surface-roles view-model logic out of `src/popup/view-models.ts` and add focused tests for the route-story decisions.

## Scope

- Extract raw and localized action-section builders into a dedicated popup view-model module.
- Extract raw and localized surface-roles card builders into the same module.
- Preserve no-guidance, settings-primary, dashboard-primary, provider-detail-primary, zero-provider, policy-only, and fallback decisions.
- Keep `src/popup/view-models.ts` as the public aggregator import path.

## Preserved Boundaries

- Do not change popup copy, route action kinds, rendering, or provider source truth semantics.
- Do not change guidance-card, featured-section, setup coverage, or snapshot-status behavior.

## Acceptance

- `view-models.ts` imports action-section and surface-roles logic from the new module.
- Existing popup view-model behavior remains unchanged.
- Focused tests cover action-section and surface-roles route-story branches.

## Planned Verification

- `npm run test -- --run src/popup/surface-route-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/popup/surface-route-view-models.ts` for popup secondary-action and surface-ownership route stories.
- Kept `src/popup/view-models.ts` as the public popup view-model aggregator while reducing inline route-story logic.
- Added focused coverage for no-guidance, settings-primary, dashboard-primary, provider-detail-primary, zero-provider, policy-only, and fallback surface-role decisions.

Verification:

- `npm run test -- --run src/popup/surface-route-view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

Follow-up:

- None for this slice. Further popup view-model splitting should remain maintenance-driven and behavior-preserving.
