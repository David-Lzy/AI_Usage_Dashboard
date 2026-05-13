# Phase 344 - Theme Recovery Outputs Component

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

Move the theme-recovery export output card and workspace feedback note out of `ThemeRecoveryReviewPage.tsx` into one focused component.

## Scope

- Add a dedicated outputs component under `src/sidepanel/components/`.
- Keep export generation, clipboard/download behavior, route opening, and feedback state owned by the route.
- Preserve existing visible copy, button ordering, CSS classes, data hooks, and output draft rendering.

## Preserved Boundaries

- No provider, storage, theme, popup, release package, Chrome automation, or review export schema changes.
- No copy rewrite beyond moving existing rendering into the component.
- No changes to filenames, MIME types, clipboard behavior, or route-opening behavior.

## Acceptance

- `ThemeRecoveryReviewPage.tsx` renders the output actions, draft previews, and workspace feedback through the new component.
- Existing `data-theme-recovery-copy`, `data-theme-recovery-download`, `data-theme-recovery-summary-draft`, and `data-theme-recovery-json-draft` hooks remain unchanged.
- The route still owns the generated summary/json draft values and action callbacks.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `ThemeRecoveryOutputsSection` for the export action card, summary/json draft previews, and workspace feedback note.
- Kept summary/json draft generation, clipboard writes, text-file downloads, Settings route opening, and feedback state owned by `ThemeRecoveryReviewPage.tsx`.
- Preserved existing button ordering, visible copy, CSS classes, data hooks, filenames, MIME types, and draft rendering.

## Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future output changes should use a behavior phase if they alter export schemas, filenames, MIME types, clipboard/download behavior, or route-opening behavior.
