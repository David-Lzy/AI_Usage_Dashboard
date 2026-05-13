# Phase 314 - Interaction Audit Frame Actions Split

## Goal

Reduce `src/sidepanel/routes/InteractionAuditPage.tsx` maintenance risk by extracting iframe readiness and audit-preset DOM actions into a focused helper module.

## Scope

- Move interaction-audit iframe readiness checks out of the route component.
- Move iframe audit preset action dispatch out of the route component.
- Add focused tests for not-ready frames, selector readiness, unsupported preset actions, and localized popup dashboard-action matching.
- Preserve interaction-audit signoff state, exports, request binding, download actions, and rendered UI.

## Preserved Boundaries

- Do not change interaction-audit surface definitions, preset ids, manual checks, archive/request schemas, or operator copy.
- Do not change provider behavior, Settings behavior, or release package artifacts.
- Do not split the full interaction-audit render tree in this slice.

## Acceptance

- `src/sidepanel/routes/InteractionAuditPage.tsx` no longer owns low-level iframe DOM selector/action helpers.
- New helper tests cover the extracted behavior without requiring browser automation.
- Existing interaction-audit signoff, queue, and special-route tests still pass.
- TypeScript still verifies the route component after the extraction.

## Planned Verification

- `npm run test -- --run src/sidepanel/interaction-audit-frame-actions.test.ts src/sidepanel/interaction-audit-signoff.test.ts src/sidepanel/interaction-audit-review-queue.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/sidepanel/interaction-audit-frame-actions.ts` for iframe readiness and preset-action helpers.
- Added `src/sidepanel/interaction-audit-frame-actions.test.ts` for focused helper coverage.
- Reduced `src/sidepanel/routes/InteractionAuditPage.tsx` from `1879` lines to `1568` lines while preserving page-owned state, rendering, export/download behavior, and route wiring.

Verification:

- `npm run test -- --run src/sidepanel/interaction-audit-frame-actions.test.ts src/sidepanel/interaction-audit-signoff.test.ts src/sidepanel/interaction-audit-review-queue.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
