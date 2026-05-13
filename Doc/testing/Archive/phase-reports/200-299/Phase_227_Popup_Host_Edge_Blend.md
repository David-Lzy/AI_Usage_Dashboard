# Phase 227 - Popup Host Edge Blend

Date: 2026-04-30

Document class:

- closed evidence

## Goal

Reduce the visible rectangular transition around the rounded Chrome action popup by blending the extension-owned outer document pixels with the surrounding Chrome host surface.

## Why This Phase Exists

Phase 226 moved the popup background onto a rounded shell and made the document root transparent. In real Chrome, those transparent pixels can still reveal an opaque Chrome action popup host backing. On a dark Chrome theme this reads as a light 90-degree rectangle outside the rounded popup content.

Chrome's documented action popup model exposes an HTML document that Chrome displays as a popup, with Chrome controlling the host popup window. The extension can style the HTML document, but it cannot make that browser-owned host window truly transparent.

## What Changed

- Added one popup host-edge blend color for the static popup bootstrap and runtime CSS.
- The blend follows `prefers-color-scheme`, using a light neutral edge for light Chrome surfaces and a dark Chrome-like edge for dark Chrome surfaces.
- The popup body and root now hide overflow instead of only hiding horizontal overflow.
- The popup body and shell now carry mask markers alongside the rounded `clip-path` to reduce corner compositing leaks in Chromium.
- The rounded popup shell, card corner presets, provider-card corner presets, popup size presets, and shadow presets remain unchanged.

## Web Research Notes

- Chrome's official popup guide describes action popups as Chrome-triggered popup windows that display extension HTML and close when focus leaves the popup.
- Chrome's action API reference describes the popup as HTML content shown by Chrome and auto-sized within Chrome's supported popup bounds.
- Community extension discussions consistently describe true native action-popup window transparency or shape changes as outside extension CSS control; in-page overlays can look rounded because they are rendered into the page, but they are not the same surface as `default_popup`.

## Real Chrome Evidence

Environment:

- RDP Chrome on `DISPLAY=:10`
- unpacked extension id: `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- extension reloaded from current `dist/` after a fresh build

Captured evidence:

- final native toolbar popup: `tmp/phase227-popup-host-edge-blend-review/rdp-native-popup-final.png`

Observed result:

- the obvious light rectangular host-edge transition is reduced on the current dark Chrome surface
- the result remains a blend workaround, not a true transparent native popup window

## Verification

- `npm run phase227:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
- RDP Chrome extension reload through `chrome://extensions/?id=gkjioiklbdjcknhdglaehbeofkjmmdpc`
- native toolbar popup screenshot capture from the real Chrome action bubble

## Follow-Up

Keep the current treatment unless a future Chrome extension API exposes transparent or shaped native action popup host windows. If exact visual blending matters for light and dark browser themes, review both RDP themes before store screenshots.
