# Phase 159 - Full-Page Entry Motion Polish

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 159` closeout for the full-page entry motion-polish slice under `Direction 10.2`

## Goal

Add one restrained continuity treatment for popup-expand and sidepanel-expand full-page entry without inventing a brittle cross-window shared-element transition, and keep reduced-motion mode fully honored.

## Implemented

- added one shared short-lived full-page entry helper plus unit coverage so popup and sidepanel expand flows can record where a new full-page tab came from and full-page boot can consume that hint exactly once:
  - [extension-surface-entry.ts](../../../../../src/shared/extension-surface-entry.ts)
  - [extension-surface-entry.test.ts](../../../../../src/shared/extension-surface-entry.test.ts)
- updated popup expand to seed a `popup-expand` entry hint before opening the full-page dashboard tab:
  - [PopupApp.tsx](../../../../../src/popup/PopupApp.tsx)
- updated sidepanel expand to seed a `sidebar-expand` entry hint before opening the route-preserving full-page shell:
  - [App.tsx](../../../../../src/sidepanel/App.tsx)
- updated full-page boot to consume the pending hint once and expose the source as a runtime dataset marker for CSS motion decisions:
  - [main.tsx](../../../../../src/sidepanel/main.tsx)
- added one restrained source-aware full-page entry motion language plus one reduced-motion override that keeps those entry animations disabled when motion reduction is requested:
  - [material-theme.css](../../../../../src/sidepanel/theme/material-theme.css)
- added one repeatable review plus package script for popup-expand, sidepanel-expand, and reduced-motion entry behavior:
  - [phase159-full-page-entry-motion-review.mjs](../../../../../scripts/phase159-full-page-entry-motion-review.mjs)
  - [package.json](../../../../../package.json)

## Verification

- `npm run docs:check`
- `npm run phase159:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The standard full-page shell now enters differently when it was opened from popup expand versus sidepanel expand, while still avoiding any fake true shared-element transition. Reduced-motion mode keeps the full-page shell animation-free. The next `Direction 10.2` runtime slice is now the RDP Chrome QA refresh for popup, sidepanel, and full-page captures after the shipped expand, theme, and motion work.
