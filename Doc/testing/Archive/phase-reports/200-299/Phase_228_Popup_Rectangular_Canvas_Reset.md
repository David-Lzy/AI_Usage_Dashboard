# Phase 228 - Popup Rectangular Canvas Reset

Date: 2026-04-30

Document class:

- closed evidence

## Goal

Reset the Chrome toolbar popup to a clean rectangular popup canvas while preserving rounded internal cards and controls.

## Why This Phase Exists

Phase 227 reduced the light native-host edge on dark Chrome surfaces, but the resulting dark rectangular corner still looked worse than a conventional extension popup. The community default_popup guidance is consistent: Chrome owns the toolbar popup host window, so extension authors either accept a rectangular popup document, inject a separate webpage overlay, or use a different surface such as a window, tab, or side panel.

This phase chooses the stable `default_popup` route: rectangular outer document, rounded internal UI.

## What Changed

- Removed the active popup host-edge blend color from bootstrap and runtime CSS.
- Removed body/root/shell masking and rounded clipping from the outer popup document.
- Restored the popup root background to a full rectangular Material gradient.
- Kept Settings-controlled card corner presets for internal status cards, provider cards, and controls.
- Kept popup width, size presets, shadow presets, source recovery actions, and quota rendering unchanged.

## Community Notes

- Chrome official docs describe action popups as extension HTML content displayed by Chrome and automatically sized by Chrome.
- Community answers repeatedly state that `default_popup` cannot make the browser-owned popup window transparent or change its native shape.
- The common working alternative for true rounded transparency is a content-script overlay rendered into the current webpage, which is a different surface with different permission and page-compatibility tradeoffs.

## Real Chrome Evidence

Environment:

- RDP Chrome on `DISPLAY=:10`
- unpacked extension id: `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- extension reloaded from current `dist/` after a fresh build

Captured evidence:

- final native toolbar popup: `tmp/phase228-popup-rectangular-canvas-review/rdp-native-popup-final.png`

Observed result:

- the popup no longer shows a dark host-edge rectangle around the rounded shell
- the popup reads as a standard rectangular Chrome extension popup with rounded internal cards and controls

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

Do not describe the popup corner setting as changing the native toolbar popup window shape. If that wording appears in future UI copy, narrow it to internal cards and controls.
