# Store Screenshot Manual Capture Handoff - 2026-04-24-first-real-store-screenshot-capture-request

Date: 2026-04-23

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
  - `2026-04-24-first-real-store-screenshot-capture-request`
- status:
  - `fulfilled_operator_capture`
- manual slots:
  - `0`
- remaining manual slots:
  - `0`
- manual captures still missing:
  - `0`
- manual notes still incomplete:
  - `0`
- manual slots already ready:
  - `0`
- staged request-bound slots:
  - `5`
- staged ready slots:
  - `5`
- archive ready:
  - `yes`

## Manual Import Commands

- popup notes template:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/manual-popup-notes-overlay.template.json`
- popup capture checklist:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/manual-popup-capture-checklist.md`
- copy popup captures only:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-04-24-first-real-store-screenshot-capture-request --source-dir <native-toolbar-popup-capture-dir>`
- copy popup captures plus popup note overlay:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-04-24-first-real-store-screenshot-capture-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/manual-popup-notes-overlay.template.json`
- completion command:
  - `npm run store:complete-screenshot-capture-request -- --request-id 2026-04-24-first-real-store-screenshot-capture-request`

## Remaining Manual Captures

- none; this request no longer has unresolved manual screenshot work.

## Staged Request-Bound Entries

- `01-toolbar-first-quick-glance.png`
  - slot: Toolbar-first quick glance
  - claim: one click gives a compact, readable AI usage snapshot
  - must show: popup header, top summary, setup coverage, featured provider, and badge-compatible quick-glance framing
  - mode: `request_bound_rdp_runner`
  - surface: `extension_popup_window`
  - capture present: `yes`
  - note status: `approximated_runtime_state`
  - route path: `src/popup/index.html`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/01-toolbar-first-quick-glance.png`
  - state summary: Popup shows a compact quick-glance state with Cursor, Claude Code, and Codex visible in one healthy toolbar-first view.
  - operator note: This is a real extension-mode popup capture from a request-bound seeded runtime state, not a direct live sync snapshot from the current operator session.
- `02-setup-guidance.png`
  - slot: Setup guidance
  - claim: the product tells the user what to do next instead of only showing raw usage cards
  - must show: guidance card, setup stage, and stateful CTA
  - mode: `request_bound_rdp_runner`
  - surface: `extension_popup_window`
  - capture present: `yes`
  - note status: `approximated_runtime_state`
  - route path: `src/popup/index.html`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/02-setup-guidance.png`
  - state summary: Popup shows mixed setup blockers with Cursor missing host access and Codex missing workspace credentials.
  - operator note: This screenshot uses a request-bound seeded runtime state to keep the setup-guidance story stable while staying inside the real unpacked extension runtime.
- `03-honest-contract-or-policy-only.png`
  - slot: Honest contract-only or policy-only state
  - claim: the extension is honest about provider coverage and does not fake live precision
  - must show: setup or contract story without pretending unsupported live data exists
  - mode: `request_bound_rdp_runner`
  - surface: `extension_popup_window`
  - capture present: `yes`
  - note status: `policy_only_fallback`
  - route path: `src/popup/index.html`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/03-honest-contract-or-policy-only.png`
  - state summary: Popup shows Gemini as the only visible provider in a truthful policy-only contract state.
  - operator note: This screenshot intentionally uses Gemini's shipped policy-only fallback instead of implying a live per-user usage source that the product does not currently support.
- `04-settings-and-setup-depth.png`
  - slot: Settings and setup depth
  - claim: setup ownership lives in the deeper workspace instead of a bloated popup
  - must show: theme and source/setup controls with enough surrounding context to read as an expanded extension workspace
  - mode: `request_bound_rdp_runner`
  - surface: `full_page_shell`
  - capture present: `yes`
  - note status: `approximated_runtime_state`
  - route path: `src/sidepanel/index.html?surface=full-page#settings`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/04-settings-and-setup-depth.png`
  - state summary: Settings shows setup ownership in the deeper workspace with the same mixed blockers carried over from the popup story.
  - operator note: This is a real side-panel runtime capture from a request-bound seeded state used to keep the Settings setup story consistent during store screenshot review.
- `05-provider-or-dashboard-depth.png`
  - slot: Provider or dashboard depth
  - claim: the expanded workspace owns deeper review, contract context, and provider detail
  - must show: one deeper inspection surface that clearly extends beyond the popup quick-glance role
  - mode: `request_bound_rdp_runner`
  - surface: `full_page_shell`
  - capture present: `yes`
  - note status: `approximated_runtime_state`
  - route path: `src/sidepanel/index.html?surface=full-page#provider-detail/codex`
  - capture path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/05-provider-or-dashboard-depth.png`
  - state summary: Codex provider detail shows a truthful warning-state review surface beyond the popup.
  - operator note: This screenshot uses a request-bound seeded Codex warning state so the side panel can show deeper contract context without claiming it came from a current live analytics session.

## Archive Readiness

- ready; the request can now be completed with the command below.
