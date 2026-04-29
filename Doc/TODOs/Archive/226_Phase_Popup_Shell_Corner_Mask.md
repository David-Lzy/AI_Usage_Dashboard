# Phase 226 - Popup Shell Corner Mask

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Apply a popup shell visual corner mask so the native toolbar popup no longer shows the extension document background as a hard 90-degree rectangle.

## Completed Work

- Added `--app-popup-shell-radius` and mapped it to the existing popup corner preference presets.
- Made `html.popup-page`, `body.popup-page`, and `#root.popup-page-root` transparent for popup mode.
- Applied the popup gradient background, border radius, and rounded `clip-path` to `.popup-shell`.
- Applied a matching rounded `clip-path` to `body.popup-page`.
- Added static bootstrap transparent-root and shell-radius rules to the popup HTML entry for first-paint consistency.
- Added `phase226:review` to keep the CSS and documentation markers repeatable.
- Captured the reloaded RDP Chrome native toolbar popup at `tmp/phase226-popup-shell-corner-mask-review/rdp-native-popup-final.png`.

## Preserved Boundaries

- The Chrome action popup host window shape remains browser-owned and cannot be made truly rounded by extension CSS.
- No provider adapter, parser, page-binding, source recovery, i18n, or settings-state behavior changed.
- Existing popup size, card-corner, provider-card, and shadow preferences remain intact.

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

Use RDP Chrome to inspect the native toolbar popup after extension reload and record whether Chrome exposes transparent document corners or falls back to its host popup background.
