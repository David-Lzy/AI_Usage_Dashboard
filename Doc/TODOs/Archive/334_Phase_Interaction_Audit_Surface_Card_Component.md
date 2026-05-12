# Phase 334 - Interaction Audit Surface Card Component

## Goal

Move the repeated per-surface audit card rendering out of `src/sidepanel/routes/InteractionAuditPage.tsx` into a focused component.

## Scope

- Add a reusable component for one interaction-audit surface card.
- Keep frame refs, card refs, preset actions, manual checks, signoff status, notes, and frame-load callbacks owned by the route.
- Preserve all data attributes used by audit tooling and operator review flows.

## Preserved Boundaries

- Do not change interaction-audit signoff schemas, storage keys, export content, request binding, or review queue behavior.
- Do not change audit surface definitions, preset action behavior, CSS class names, or route paths.
- Do not change provider/runtime product surfaces.

## Acceptance

- `InteractionAuditPage.tsx` maps surfaces through the new component instead of inlining the full article body.
- Existing operator audit data attributes and callback behavior remain intact.
- Typecheck and build pass.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/sidepanel/components/InteractionAuditSurfaceCard.tsx` for one interaction-audit surface article.
- Kept route-owned refs, signoff state, preset actions, and operator callbacks in `InteractionAuditPage.tsx`.
- Preserved existing audit data attributes, frame sizing variables, manual-check controls, and signoff controls.

Verification:

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

Follow-up:

- None for this slice. Remaining `InteractionAuditPage.tsx` reductions should target larger workspace sections only when a concrete operator-maintenance issue appears.
