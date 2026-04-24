# Store Screenshot Manual Capture Handoff - 2026-04-24-surface-expansion-store-screenshot-refresh-request

Date: 2026-04-24

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
  - `2026-04-24-surface-expansion-store-screenshot-refresh-request`
- status:
  - `pending_operator_capture`
- manual slots:
  - `3`
- remaining manual slots:
  - `3`
- manual captures still missing:
  - `3`
- manual notes still incomplete:
  - `3`
- manual slots already ready:
  - `0`
- staged request-bound slots:
  - `2`
- staged ready slots:
  - `2`
- archive ready:
  - `no`

## Manual Import Commands

- popup notes template:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-notes-overlay.template.json`
- popup capture checklist:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-capture-checklist.md`
- copy popup captures only:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --source-dir <native-toolbar-popup-capture-dir>`
- copy popup captures plus popup note overlay:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-notes-overlay.template.json`
- completion command:
  - `npm run store:complete-screenshot-capture-request -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --captures-dir Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/captures`

## Remaining Manual Captures

- `01-toolbar-first-quick-glance.png`
  - slot: Toolbar-first quick glance
  - claim: one click gives a compact, readable AI usage snapshot
  - must show: popup header, top summary, setup coverage, featured provider, and badge-compatible quick-glance framing
  - mode: `manual_operator_capture`
  - surface: `native_toolbar_popup`
  - capture present: `no`
  - note status: `not_reviewed`
  - preferred size: `640x400`
  - fallback size: `640x400`
  - manual note: This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.
- `02-setup-guidance.png`
  - slot: Setup guidance
  - claim: the product tells the user what to do next instead of only showing raw usage cards
  - must show: guidance card, setup stage, and stateful CTA
  - mode: `manual_operator_capture`
  - surface: `native_toolbar_popup`
  - capture present: `no`
  - note status: `not_reviewed`
  - preferred size: `640x400`
  - fallback size: `640x400`
  - manual note: This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.
- `03-honest-contract-or-policy-only.png`
  - slot: Honest contract-only or policy-only state
  - claim: the extension is honest about provider coverage and does not fake live precision
  - must show: setup or contract story without pretending unsupported live data exists
  - mode: `manual_operator_capture`
  - surface: `native_toolbar_popup`
  - capture present: `no`
  - note status: `not_reviewed`
  - preferred size: `640x400`
  - fallback size: `640x400`
  - manual note: This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.

## Staged Request-Bound Entries

- `04-settings-and-setup-depth.png`
  - slot: Settings and setup depth
  - claim: setup ownership lives in the deeper workspace instead of a bloated popup
  - must show: theme and source/setup controls with enough surrounding context to read as an expanded extension workspace
  - mode: `request_bound_rdp_runner`
  - surface: `full_page_shell`
  - capture present: `yes`
  - note status: `approximated_runtime_state`
  - route path: `src/sidepanel/index.html?surface=full-page#settings`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/captures/04-settings-and-setup-depth.png`
  - state summary: Full-page Settings shows setup ownership in the deeper workspace with the same mixed blockers carried over from the popup story.
  - operator note: This is a real full-page shell capture from a request-bound seeded state used to keep the Settings setup story consistent during refreshed store screenshot review.
- `05-provider-or-dashboard-depth.png`
  - slot: Provider or dashboard depth
  - claim: the expanded workspace owns deeper review, contract context, and provider detail
  - must show: one deeper inspection surface that clearly extends beyond the popup quick-glance role
  - mode: `request_bound_rdp_runner`
  - surface: `full_page_shell`
  - capture present: `yes`
  - note status: `approximated_runtime_state`
  - route path: `src/sidepanel/index.html?surface=full-page#provider-detail/codex`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/captures/05-provider-or-dashboard-depth.png`
  - state summary: Full-page Codex provider detail shows a truthful warning-state review surface beyond the popup.
  - operator note: This screenshot uses a request-bound seeded Codex warning state so the full-page shell can show deeper contract context without claiming it came from a current live analytics session.

## Archive Readiness

- Capture file is still missing for `01-toolbar-first-quick-glance.png`.
- Capture notes are still `not_reviewed` for `01-toolbar-first-quick-glance.png`.
- Capture notes are missing `stateSummary` for `01-toolbar-first-quick-glance.png`.
- Capture file is still missing for `02-setup-guidance.png`.
- Capture notes are still `not_reviewed` for `02-setup-guidance.png`.
- Capture notes are missing `stateSummary` for `02-setup-guidance.png`.
- Capture file is still missing for `03-honest-contract-or-policy-only.png`.
- Capture notes are still `not_reviewed` for `03-honest-contract-or-policy-only.png`.
- Capture notes are missing `stateSummary` for `03-honest-contract-or-policy-only.png`.
