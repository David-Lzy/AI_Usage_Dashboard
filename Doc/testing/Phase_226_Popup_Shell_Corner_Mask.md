# Phase 226 - Popup Shell Corner Mask

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Reduce the visible square background at the native toolbar popup edge by applying one popup shell visual corner mask.

## Why This Phase Exists

The Settings-controlled popup corner preference already rounded the internal cards, but the document background could still read as a 90-degree rectangle inside Chrome's action popup. The Chrome action popup host window shape is controlled by Chrome, so the extension cannot make the browser-owned outer window itself click-through or truly transparent.

## What Changed

- Added a popup shell radius token that follows the existing `square`, `soft`, and `rounded` corner preference.
- Made the popup document root transparent so the rectangular document background no longer fights the rounded shell.
- Moved the popup page gradient onto `.popup-shell`, then clipped that shell with a rounded `clip-path`.
- Added the same rounded `clip-path` to `body.popup-page` so the document canvas participates in the mask.
- Added static bootstrap shell-radius and transparent-root rules in `src/popup/index.html` so first paint starts from the same visual contract.

## Real Chrome Evidence

Environment:

- RDP Chrome on `DISPLAY=:10`
- unpacked extension id: `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- extension reloaded from current `dist/` after a fresh build

Captured evidence:

- final native toolbar popup: `tmp/phase226-popup-shell-corner-mask-review/rdp-native-popup-final.png`

Observed result:

- the extension-owned popup content follows the rounded shell mask
- Chrome still paints its own dark native action-popup backing behind transparent popup pixels, so this phase does not claim true browser-window transparency

## Verification

- `npm run phase226:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
- RDP Chrome extension reload through `chrome://extensions/?id=gkjioiklbdjcknhdglaehbeofkjmmdpc`
- native toolbar popup screenshot capture from the real Chrome action bubble

## Follow-Up

Confirm the effect in RDP Chrome after reloading the unpacked extension. If Chrome paints an opaque host color behind transparent popup corners, keep the mask as the best available in-document treatment and avoid promising true native popup window rounding.
