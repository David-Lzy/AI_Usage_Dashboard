# Phase 162 - Refreshed Store Screenshot Capture Request

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 162` closeout for the second `Direction 10.3` store-asset slice

## Goal

Turn the `Phase 161` screenshot selection/stale-review decision into one current pending screenshot-capture request, while keeping the request generator honest about which requests can still use the automated RDP runner and which now require manual native popup capture.

## Implemented

- updated the screenshot-request template and generated request ledger so refreshed store screenshot requests now carry:
  - one maintained selection-pack reference
  - one explicit baseline-archive reference
  - one explicit `captureAutomationMode`
  - native toolbar-bubble popup capture requirements for screenshot slots `1` through `3`
  - full-page-shell depth requirements for screenshot slots `4` and `5`
  - [operator-capture-request-template.fixture.json](../../../../../fixtures/store-screenshot/operator-capture-request-template.fixture.json)
  - [store-screenshot-capture-request.mjs](../../../../../scripts/lib/store-screenshot-capture-request.mjs)
  - [store-screenshot-capture-request-index.mjs](../../../../../scripts/lib/store-screenshot-capture-request-index.mjs)
- tightened the request-bound RDP runner so manual-only screenshot requests now fail fast instead of silently producing the wrong asset set:
  - [capture-store-screenshot-request-from-rdp.mjs](../../../../../scripts/capture-store-screenshot-request-from-rdp.mjs)
- tightened request-package refresh semantics so fulfilled historical requests now refresh from their recorded manifest state instead of inheriting later template drift:
  - [refresh-store-screenshot-capture-request-packages.mjs](../../../../../scripts/refresh-store-screenshot-capture-request-packages.mjs)
- created one refreshed pending request package for the post-surface-expansion store asset set:
  - [2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md](../../../store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md)
- updated the maintained store screenshot runbook, selection pack, and `Direction 10.3` docs so the next executable step is now fulfilling and archiving that refreshed request rather than regenerating another plan:
  - [Store_Screenshot_Capture_Runbook.md](../../../Store_Screenshot_Capture_Runbook.md)
  - [Store_Screenshot_Selection_Pack.md](../../../../Store/Store_Screenshot_Selection_Pack.md)
  - [10_3_Store_Asset_Pack_And_Submission_TODOs.md](../../../../Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)
- added one repeatable review for the refreshed request package, generator boundary, and fulfilled-request refresh rule:
  - [phase162-store-screenshot-refresh-request-review.mjs](../../../../../scripts/phase162-store-screenshot-refresh-request-review.mjs)
  - [package.json](../../../../../package.json)

## Verification

- `npm run store:create-screenshot-capture-request -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request`
- `npm run store:refresh-screenshot-capture-request-packages`
- `npm run docs:check`
- `npm run phase162:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The repo now has one current pending store screenshot request that matches the post-surface-expansion contract instead of implicitly reusing the first archive. Screenshot truth state is now `1 pending request / 1 archived set`, and the next `Direction 10.3` slice is fulfilling that refreshed request into one new archive.
