# Store Screenshot Capture Files - 2026-04-24-surface-expansion-store-screenshot-refresh-request

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this request has already been fulfilled
- durable archived evidence now lives in `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md`

## Expected Filenames

- `01-toolbar-first-quick-glance.png`
- `02-setup-guidance.png`
- `03-honest-contract-or-policy-only.png`
- `04-settings-and-setup-depth.png`
- `05-provider-or-dashboard-depth.png`

## Capture Plan

- plan file:
  - `../capture-plan.json`

- `01-toolbar-first-quick-glance.png`
  - mode: `manual_operator_capture`
  - surface: `native_toolbar_popup`
  - manual note: This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.
- `02-setup-guidance.png`
  - mode: `manual_operator_capture`
  - surface: `native_toolbar_popup`
  - manual note: This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.
- `03-honest-contract-or-policy-only.png`
  - mode: `manual_operator_capture`
  - surface: `native_toolbar_popup`
  - manual note: This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.
- `04-settings-and-setup-depth.png`
  - mode: `request_bound_rdp_runner`
  - surface: `full_page_shell`
  - route path: `src/sidepanel/index.html?surface=full-page#settings`
- `05-provider-or-dashboard-depth.png`
  - mode: `request_bound_rdp_runner`
  - surface: `full_page_shell`
  - route path: `src/sidepanel/index.html?surface=full-page#provider-detail/codex`

## Notes File

- update `../capture-notes.json` for every required screenshot before running the completion command
