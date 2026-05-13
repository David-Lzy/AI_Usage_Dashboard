# Phase 163 - Native Toolbar Popup Probe

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Turn the remaining uncertainty around native toolbar-popup capture in the current `RDP Chrome` session into one truthful, repeatable probe result before the refreshed store-screenshot request is fulfilled.

## Why This Slice Existed

- `Phase 162` created one refreshed pending screenshot request whose popup slots `1` through `3` explicitly require native toolbar-bubble capture
- the repo already had strong popup QA evidence, but that evidence still opened the popup route in its own extension app window rather than the real toolbar bubble
- before attempting another archive pass, the repo needed to know whether the current `RDP Chrome` environment exposes the native popup as one separately capturable X11 top-level window

## What Changed

- added one background message path for `app:open-action-popup`
- added one debug-only helper route at `#debug-native-popup-probe`
- added one native-toolbar popup probe runner:
  - [probe-rdp-native-toolbar-popup.mjs](../../../../../scripts/probe-rdp-native-toolbar-popup.mjs)
- added one repeatable review:
  - [phase163-native-toolbar-popup-probe-review.mjs](../../../../../scripts/phase163-native-toolbar-popup-probe-review.mjs)
- added one package script:
  - `npm run store:probe-native-toolbar-popup`
- updated the store screenshot runbook and `Direction 10.3` docs to keep manual popup capture as the truthful boundary when the native bubble is not separately exposed

## Result

The current `RDP Chrome` session does not expose the native toolbar popup as one separately capturable X11 top-level window.

The probe now records:

- one helper Chrome window used to request the real popup
- one helper-window screenshot as truthful diagnostic evidence
- one results JSON file that explicitly reports `popupWindow: null` when the native bubble is not exposed as a standalone capturable window

Current evidence:

- [phase163-results.json](../../../../../tmp/phase163-native-toolbar-popup-probe-review/phase163-results.json)
- `helperWindow.title = "AI Usage Dashboard Native Popup Probe - Google Chrome"`
- `popupWindow = null`

## Truth Boundary

- helper-window evidence from this probe is valid for runtime diagnosis and for documenting the current automation boundary
- helper-window evidence is not a truthful replacement for the final Chrome Web Store popup screenshot
- refreshed store screenshot request slots `1` through `3` therefore remain manual native-toolbar captures
- deeper refreshed request slots can still continue through the existing full-page-shell capture workflow

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run phase163:review`

## Follow-Up

- keep the current screenshot state at `1 pending request / 1 archived set`
- fulfill the refreshed screenshot request with truthful manual popup capture for slots `1` through `3`
- archive the next screenshot set only after those manual popup captures and the updated full-page-shell depth captures are assembled together
