# Phase 155 - Full-Page Shell Route And Entry Plumbing

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 155` closeout for the first runtime slice under `Direction 10.2`

## Goal

Turn the future full-page shell from a design-only contract into a real shared route-entry baseline that later popup and sidebar expand controls can open without inventing a second app entry or route model.

## Implemented

- created one shared extension-surface helper:
  - [extension-surface-paths.ts](../../src/shared/extension-surface-paths.ts)
- defined one explicit full-page shell contract through the existing sidepanel entry:
  - `src/sidepanel/index.html?surface=full-page#...`
- taught the sidepanel entry to recognize that full-page surface query and label the runtime shell accordingly:
  - [main.tsx](../../src/sidepanel/main.tsx)
  - [material-theme.css](../../src/sidepanel/theme/material-theme.css)
- refactored popup sidepanel routing to use the new shared sidepanel-path helper instead of duplicating route-path strings:
  - [PopupApp.tsx](../../src/popup/PopupApp.tsx)
- added unit coverage for the shared path and preview-url builders:
  - [extension-surface-paths.test.ts](../../src/shared/extension-surface-paths.test.ts)
- added one repeatable preview review for:
  - sidepanel dashboard
  - full-page dashboard
  - full-page settings
  - full-page provider detail
  - [phase155-full-page-shell-entry-review.mjs](../../scripts/phase155-full-page-shell-entry-review.mjs)

## Verification

- `npm run docs:check`
- `npm run phase155:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The repo now has a real route-preserving full-page shell baseline without duplicating the main app entry. This phase did not add popup or sidebar expand buttons yet; it only shipped the shared route contract and the review baseline those later UI slices will reuse.
