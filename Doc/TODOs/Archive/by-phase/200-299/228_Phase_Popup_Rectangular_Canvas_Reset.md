# Phase 228 - Popup Rectangular Canvas Reset

Date: 2026-04-30

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-30

## Goal

Replace the host-edge blend workaround with one stable rectangular popup canvas, following the practical community guidance for Chrome `default_popup` surfaces.

## Completed Work

- Removed the runtime popup host-edge blend color from active popup CSS.
- Removed outer body/root/shell clip and mask treatment that made the Chrome-owned host backing visually obvious.
- Restored the popup document root to a full rectangular Material gradient canvas.
- Kept rounded styling on internal cards, provider cards, and controls through the existing popup appearance settings.
- Added `phase228:review` to verify the rectangular popup canvas markers and removed host-edge workaround markers.

## Preserved Boundaries

- Chrome still owns the native action popup host window and does not expose a true transparent native popup window API to extension CSS.
- The `Rounded` popup appearance setting now means rounded internal cards and controls, not a guaranteed rounded native host window.
- No provider adapter, parser, page-binding, source recovery, i18n, or settings-state behavior changed.

## Verification

- `npm run phase228:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
- RDP Chrome extension reload through `chrome://extensions/?id=gkjioiklbdjcknhdglaehbeofkjmmdpc`
- native toolbar popup screenshot capture from the real Chrome action bubble

## Follow-Up

If true transparent rounded floating UI becomes a product requirement, implement it as a separate webpage overlay mode rather than trying to force Chrome's `default_popup` host into a shape it does not support.
