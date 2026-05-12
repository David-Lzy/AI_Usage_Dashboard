# Phase 335 - Interaction Audit Review Queue Component

## Goal

Move the interaction-audit review queue rendering out of `src/sidepanel/routes/InteractionAuditPage.tsx` into a focused component.

## Scope

- Add a presentational review-queue component for the existing queue summary and jump list.
- Keep queue construction and jump behavior owned by `InteractionAuditPage.tsx`.
- Preserve all review-queue data attributes used by operator tooling.

## Preserved Boundaries

- Do not change review-queue sorting, readiness semantics, signoff state, storage, export, or request binding.
- Do not localize or rewrite operator review queue copy in this slice.
- Do not change interaction-audit surface definitions or runtime product surfaces.

## Acceptance

- `InteractionAuditPage.tsx` renders the review queue through the new component.
- Existing data attributes and jump behavior remain intact.
- Typecheck and build pass.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/sidepanel/components/InteractionAuditReviewQueueSection.tsx` for the operator review queue summary and jump list.
- Kept queue construction and jump behavior in `InteractionAuditPage.tsx`.
- Preserved review queue data attributes, counts, labels, and jump actions.

Verification:

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

Follow-up:

- None for this slice. Additional interaction-audit extraction should target self-contained workspace sections only.
