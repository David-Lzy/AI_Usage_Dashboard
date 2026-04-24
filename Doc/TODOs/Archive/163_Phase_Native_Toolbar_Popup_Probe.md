# Phase 163 - Native Toolbar Popup Probe

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed and archived on `2026-04-24`

## Summary

This slice added one truthful native-toolbar popup probe for the current `RDP Chrome` environment.

The probe verified that the real toolbar bubble is not exposed as one separately capturable X11 top-level window in the current session, so the repo now records helper-window evidence for diagnosis while keeping refreshed store popup slots manual.

## Completed Work

- added one background message path that can request `chrome.action.openPopup()`
- added one debug-only helper route that tries to trigger the native popup inside the real unpacked extension runtime
- added one probe runner and one repeatable review for native-popup exposure
- updated the screenshot runbook and `Direction 10.3` roadmap to preserve manual popup capture as the truthful boundary

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run phase163:review`

## Outcome

- current screenshot truth remains `1 pending request / 1 archived set`
- the next executable slice is still fulfilling and archiving the refreshed screenshot request
- popup slots `1` through `3` stay manual native-toolbar capture until the environment can produce truthful final popup assets
