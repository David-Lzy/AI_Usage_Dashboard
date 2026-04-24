# Phase 165 - Manual Store Screenshot Handoff And Archive Preflight

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Turn the remaining native-toolbar popup work inside the refreshed screenshot request into one explicit operator handoff and archive-readiness preflight instead of leaving those remaining manual steps buried inside the larger pending package.

## Why This Slice Existed

- `Phase 164` already staged the two request-bound full-page screenshots inside the refreshed pending request
- the remaining blocker is still the three native-toolbar popup slots that must be captured manually from the real Chrome action bubble
- the repo needed one smaller request-bound handoff artifact that makes the remaining manual slots, current staged depth evidence, and archive readiness visible in one place

## What Changed

- added one manual screenshot handoff builder:
  - [store-screenshot-manual-handoff.mjs](../../scripts/lib/store-screenshot-manual-handoff.mjs)
- updated request-package generation so request packages now emit:
  - `manual-capture-handoff.json`
  - `manual-capture-handoff.md`
- added one request-specific operator command:
  - [prepare-store-screenshot-manual-handoff.mjs](../../scripts/prepare-store-screenshot-manual-handoff.mjs)
- added one repeatable review:
  - [phase165-store-screenshot-manual-handoff-review.mjs](../../scripts/phase165-store-screenshot-manual-handoff-review.mjs)
- updated the screenshot runbook and `Direction 10.3` docs so the remaining popup work now has one explicit handoff and preflight path instead of only one generic pending request README

## Result

The refreshed pending request now ships one dedicated manual handoff bundle that states:

- `3` remaining manual native-toolbar popup slots
- `2` staged request-bound full-page slots already ready inside the pending package
- `archiveReady = false` until the remaining popup captures are added and reviewed

Current handoff evidence:

- [manual-capture-handoff.md](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-capture-handoff.md)
- [manual-capture-handoff.json](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-capture-handoff.json)

## Truth Boundary

- this slice does not fulfill or archive the refreshed screenshot request
- it does not fabricate native-toolbar popup screenshots
- it keeps the request truthful as `1 pending request / 1 archived set`
- it only makes the remaining popup work explicit and easier to complete without losing the already-staged full-page evidence

## Verification

- `npm run store:refresh-screenshot-capture-request-packages`
- `npm run store:prepare-manual-screenshot-handoff -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request`
- `npm run docs:check`
- `npm run phase165:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- capture the remaining three popup screenshots from the native Chrome toolbar bubble
- refresh the manual handoff once those popup captures and note updates are added
- complete and archive the refreshed screenshot request only after the handoff reports archive readiness
