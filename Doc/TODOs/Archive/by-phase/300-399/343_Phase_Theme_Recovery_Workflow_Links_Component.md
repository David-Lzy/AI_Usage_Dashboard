# Phase 343 - Theme Recovery Workflow Links Component

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move the theme-recovery workflow checklist and extension/vendor link groups out of `ThemeRecoveryReviewPage.tsx` into one focused component.

## Scope

- Add a dedicated workflow-links component under `src/sidepanel/components/`.
- Move the route-local side-panel and vendor route link constants into that component if they are no longer used by the route.
- Keep refresh behavior, route opening, exports, snapshots, and feedback state owned by the route.
- Preserve existing visible copy, link hrefs, CSS classes, and `data-theme-recovery-link*` hooks.

## Preserved Boundaries

- No provider, storage, theme, popup, release package, Chrome automation, or review export changes.
- No copy rewrite beyond moving existing rendering into the component.
- No changes to linked extension or vendor routes.

## Acceptance

- `ThemeRecoveryReviewPage.tsx` renders workflow steps and links through the new component.
- Link ids, hrefs, labels, and target behavior remain unchanged.
- Route no longer owns link constants that are only used by the workflow card.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `ThemeRecoveryWorkflowLinksCard` for the theme-recovery workflow checklist and route-link groups.
- Moved the side-panel and vendor route link constants into that focused component.
- Kept refresh behavior, route opening, exports, snapshots, and feedback state owned by `ThemeRecoveryReviewPage.tsx`.
- Preserved existing visible copy, link hrefs, target behavior, CSS classes, and `data-theme-recovery-link*` hooks.

## Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future workflow-link changes should use a behavior phase if they alter route ids, target hrefs, or operator workflow copy.
