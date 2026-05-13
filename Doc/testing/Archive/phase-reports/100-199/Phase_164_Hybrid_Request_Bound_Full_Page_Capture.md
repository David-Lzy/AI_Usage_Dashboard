# Phase 164 - Hybrid Request-Bound Full-Page Capture

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

Turn the refreshed pending store-screenshot request into one truthful hybrid capture package by auto-staging the request-bound full-page depth slots without pretending the remaining native-toolbar popup slots are already complete.

## Why This Slice Existed

- `Phase 162` created one refreshed pending screenshot request whose popup slots `1` through `3` still explicitly require native toolbar-bubble capture
- `Phase 163` then confirmed that the current `RDP Chrome` session does not expose that native toolbar bubble as one separately capturable X11 top-level window
- the repo still needed a truthful way to stage the deeper full-page-shell screenshots that were already automatable without falsely marking the whole request fulfilled

## What Changed

- added one capture-plan builder for screenshot requests:
  - [store-screenshot-capture-plan.mjs](../../../../../scripts/lib/store-screenshot-capture-plan.mjs)
- updated request-package generation so pending requests now emit one `capture-plan.json` alongside README, notes, and capture scaffolding
- added one hybrid request-bound capture runner:
  - [capture-hybrid-store-screenshot-request-from-rdp.mjs](../../../../../scripts/capture-hybrid-store-screenshot-request-from-rdp.mjs)
- updated the request-bound screenshot plan so refreshed depth slots `4` and `5` now target the full-page shell instead of the older side-panel baseline
- added one repeatable review:
  - [phase164-hybrid-store-screenshot-request-review.mjs](../../../../../scripts/phase164-hybrid-store-screenshot-request-review.mjs)
- refreshed the current pending request package so it now includes:
  - [capture-plan.json](../../../store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/capture-plan.json)
  - staged full-page captures for `04-settings-and-setup-depth.png` and `05-provider-or-dashboard-depth.png`

## Result

The refreshed pending request now has one truthful hybrid state:

- request-bound runner slots: `2`
- manual operator slots: `3`
- staged full-page captures already present for slots `4` and `5`
- popup slots `1` through `3` still unresolved and still marked `not_reviewed` in `capture-notes.json`

Current staged evidence:

- [04-settings-and-setup-depth.png](../../../store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/captures/04-settings-and-setup-depth.png)
- [05-provider-or-dashboard-depth.png](../../../store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/captures/05-provider-or-dashboard-depth.png)

## Truth Boundary

- this slice does not fulfill or archive the refreshed screenshot request
- the hybrid runner stages only the request-bound full-page slots and leaves manual native-toolbar popup slots unresolved
- the pending request therefore remains `pending_operator_capture`
- screenshot truth still stays `1 pending request / 1 archived set` until the remaining popup captures are taken manually and archived together with the staged full-page images

## Verification

- `npm run docs:check`
- `npm run phase164:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- capture slots `1` through `3` manually from the native Chrome toolbar bubble
- complete and archive the refreshed screenshot request only after those manual popup captures are added to the pending package
- then continue with final screenshot ordering and caption tightening for the store asset pack
