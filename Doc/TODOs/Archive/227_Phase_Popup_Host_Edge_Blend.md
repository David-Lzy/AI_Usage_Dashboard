# Phase 227 - Popup Host Edge Blend

Date: 2026-04-30

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-30

## Goal

Reduce the visible light square corner that Chrome paints behind the rounded action popup when the document root is transparent.

## Completed Work

- Added `--app-popup-host-edge-color` to popup bootstrap and runtime CSS.
- Made the popup outer `html`, `body`, and root use a system-aware host-edge blend color instead of leaving transparent pixels to Chrome's native popup backing.
- Kept the popup app shell rounded and clipped through the existing appearance corner setting.
- Added stronger `overflow`, `contain: paint`, and CSS mask markers to the popup body, root, and shell.
- Added `phase227:review` to keep the host-edge blend and documentation markers repeatable.

## Preserved Boundaries

- Chrome still owns the native action popup host window and does not expose a true transparent native popup window API to extension CSS.
- This is a visual blend workaround, not a claim that the browser-owned popup window itself became rounded.
- No provider adapter, parser, page-binding, source recovery, i18n, or settings-state behavior changed.

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

If the browser theme is light while the page behind the popup is very dark, the host-edge blend may still be visible as a browser-owned rectangular backing. Avoid promising true native transparency.
