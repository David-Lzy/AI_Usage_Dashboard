# Phase 152 - Popup Action Width Contract

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 152` closeout for the popup host-width stabilization slice under `Direction 10`

## Goal

Stop the real Chrome action popup from depending on browser-guessed document width so the popup does not collapse or clip unpredictably in extension mode.

## Implemented

- marked popup runtime surfaces explicitly in [src/popup/main.tsx](../../src/popup/main.tsx) with:
  - `html.popup-page`
  - `body.popup-page`
  - `#root.popup-page-root`
- added popup-only sizing tokens in [tokens.css](../../src/sidepanel/theme/tokens.css)
- added popup-only host width and overflow contract in [material-theme.css](../../src/sidepanel/theme/material-theme.css) so:
  - wider preview windows keep the popup at one stable action-popup width
  - compact widths still collapse back to `100%`
  - horizontal overflow remains disabled
- added repeatable review coverage in [phase152-popup-action-width-contract-review.mjs](../../scripts/phase152-popup-action-width-contract-review.mjs)

## Verification

- `npm run docs:check`
- `npm run phase152:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The popup no longer leaves action-popup sizing to Chrome's intrinsic document-width guess. The page now carries an explicit host-width contract that stays at `392px` in wider windows and collapses cleanly to `360px` when the available width is narrower.
