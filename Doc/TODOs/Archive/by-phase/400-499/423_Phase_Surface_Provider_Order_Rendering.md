# Phase 423 - Surface Provider Order Rendering

Status: completed

## Goal

Apply saved provider order independently for popup, sidebar, and full-page surfaces while retaining the existing health-based order as the default.

## Scope

- Teach provider view-model builders to accept a display surface.
- Use `popup` ordering in popup view models.
- Use `sidebar` ordering in the side-panel dashboard and provider-detail supporting lists.
- Use `fullPage` ordering in the full-page tab dashboard.

## Preserved Boundaries

- Do not change provider enabled state, source truth, permissions, sync, or refresh behavior.
- Do not add Settings controls yet.
- The existing status/health sort remains the default when no user order is saved.

## Acceptance

- Default order remains the current health/status-driven order.
- Saved surface order takes precedence per surface.
- Missing known providers append after ordered providers.
- Disabled providers still stay hidden.

## Planned Verification

- `npm run test -- src/sidepanel/view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 424 adds Settings controls for users to edit the saved surface orders.

## Completion Summary

- Popup view-models now consume the `popup` provider-order preference.
- Standard side-panel route rendering now chooses `sidebar` or `fullPage` provider order based on the current surface.
- Default provider health/status sorting remains unchanged when no surface preference is supplied.
- Added focused tests for custom per-surface provider order and popup featured-provider selection.

## Verification

- `npm run test -- src/sidepanel/view-models.test.ts src/popup/view-models.test.ts`
- `npm run typecheck`
- `git diff --check`
