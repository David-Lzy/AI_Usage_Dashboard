# Phase 213 - Native Toolbar Popup Density Review

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Close the real Chrome toolbar-popup follow-up from `Phase 210` through `Phase 212` by checking the native action bubble after extension reload and tightening the popup circular quota density where needed.

## Why This Phase Exists

The Settings preview and app-window popup reviews proved the preference wiring, but the native Chrome toolbar popup is the truthful runtime for final toolbar density. The current Codex state exposes four visible usage windows, which is the highest-risk compact popup case because the popup must show useful quota progress without becoming a small side panel.

## What Changed

- Reduced popup-only circular quota ring size inside featured provider cards.
- Hid reset detail text only in popup circular quota mode.
- Kept quota labels visible with a two-line clamp so each ring remains identifiable.
- Preserved sidebar and full-page quota details, including reset timing.
- Preserved provider parsing, sync, source-selection, storage schema, and provider coverage claims.

## Real Chrome Evidence

Environment:

- RDP Chrome on `DISPLAY=:10`
- unpacked extension id: `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- extension reloaded from current `dist/` after a fresh build

Captured evidence:

- before density fix: `tmp/phase213-native-toolbar-popup-review/native-popup-balanced-desktop.png`
- after density fix: `tmp/phase213-native-toolbar-popup-review/native-popup-balanced-after-density-fix.png`

Observed result:

- before the fix, the balanced native popup displayed the four Codex quota rings but consumed too much vertical space and showed a scrollable native popup area
- after the fix, the same four quota rings fit more cleanly in the native toolbar bubble with the reset detail removed from the popup-only circular presentation
- the popup still puts quotas first and keeps the lower action visible

## Verification

- `npm run build`
- RDP Chrome extension reload through `chrome://extensions/?id=gkjioiklbdjcknhdglaehbeofkjmmdpc`
- native toolbar popup screenshot capture from the real Chrome action bubble
- `npm run phase213:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- targeted progress component tests
- full test suite
- `npm run build`

## Follow-Up

Package a new release candidate so the distributable zip includes the post-`rc.2` Phase 200-213 functional and toolbar changes.
