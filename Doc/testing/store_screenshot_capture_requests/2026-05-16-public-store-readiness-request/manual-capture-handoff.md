# Store Screenshot Manual Capture Handoff - 2026-05-16-public-store-readiness-request

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this file is the current manual-capture handoff for one request-bound screenshot package
- refresh or regenerate it through the request refresh or manual handoff command instead of editing it by hand

## Handoff Summary

- request id:
  - `2026-05-16-public-store-readiness-request`
- status:
  - `fulfilled_operator_capture`
- manual slots:
  - `5`
- remaining manual slots:
  - `0`
- manual captures still missing:
  - `0`
- manual notes still incomplete:
  - `0`
- manual slots already ready:
  - `5`
- staged request-bound slots:
  - `0`
- staged ready slots:
  - `0`
- archive ready:
  - `yes`

## Manual Import And Finalize Commands

- popup notes template:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`
- popup capture checklist:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-capture-checklist.md`
- copy popup captures only:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir>`
- copy popup captures plus popup note overlay:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`
- finalize popup import plus archive when ready:
  - `npm run store:finalize-manual-screenshot-request -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir>`
- finalize popup import plus popup note overlay plus archive when ready:
  - `npm run store:finalize-manual-screenshot-request -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`
- completion command:
  - `npm run store:complete-screenshot-capture-request -- --request-id 2026-05-16-public-store-readiness-request`

## Remaining Manual Captures

- none; this request no longer has unresolved manual screenshot work.

## Staged Request-Bound Entries

- none; this request does not currently carry staged request-bound entries.

## Archive Readiness

- ready; the request can now be completed with the command below.
