# Phase 211 - Popup Appearance Preferences

Date: 2026-04-26

Document class:

- closed evidence

## Goal

Let users tune the toolbar popup's own size and surface style without copying another extension's visual language.

## Why This Phase Exists

The toolbar popup is space constrained, but users may prefer different popup widths and card treatments depending on monitor scale, Chrome zoom, and how much quota context they want visible at once. The requested model was not to copy another extension's style, but to expose our own controlled popup size and style choices such as corner shape and shadow depth.

## What Changed

- Added persisted popup appearance preferences for:
  - size preset
  - corner style
  - shadow style
- Kept the default popup appearance aligned with the existing Phase 210 layout.
- Added Settings controls for popup size, corners, and shadow.
- Applied popup appearance through `data-popup-*` attributes on the popup root document.
- Added popup-only CSS variables for width, card radius, provider-card radius, and card shadow.
- Updated the static popup bootstrap style so first paint and post-load styling use the same width contract.

## Preserved Boundaries

- No provider parser, sync, source-selection, permission, or release-package behavior changed.
- No sidebar or full-page layout behavior changed.
- The popup remains quota-first when provider quota cards are available.
- Provider coverage gaps remain unchanged.

## Artifacts

- `scripts/phase211-popup-appearance-preferences-review.mjs`
- `tmp/phase211-popup-appearance-preferences-review/popup-appearance-preferences-review.json`

## Verification

- `npm run test -- --run src/shared/storage.test.ts`
- `npm run phase211:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real Chrome toolbar-popup pass with all three popup size presets. If `compact` feels too tight for two-column circular quota rings, add a compact-only one-column ring layout instead of widening the compact preset silently.
