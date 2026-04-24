# Store Screenshot Capture Request - 2026-04-24-surface-expansion-store-screenshot-refresh-request

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this request package is a pending operator capture workflow, not a completed screenshot set
- refresh or regenerate it through the request command instead of treating it as one free-standing authored plan

## Request Scope

- request id:
  - `2026-04-24-surface-expansion-store-screenshot-refresh-request`
- created at:
  - `2026-04-24T08:50:12.783Z`
- status:
  - `pending_operator_capture`
- runtime source:
  - `RDP Chrome unpacked extension`
- capture automation mode:
  - `manual_capture_required`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`
- capture notes:
  - `capture-notes.json`

## Source References

- storyboard:
  - `Doc/Store_Screenshot_Storyboard.md`
- selection pack:
  - `Doc/Store_Screenshot_Selection_Pack.md`
- baseline archive README:
  - `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md`
- baseline pack README:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
- baseline pack plan:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/capture-plan.json`

## Required Screenshot Filenames

- `01-toolbar-first-quick-glance.png`
- `02-setup-guidance.png`
- `03-honest-contract-or-policy-only.png`
- `04-settings-and-setup-depth.png`
- `05-provider-or-dashboard-depth.png`

## Capture Notes

- notes file:
  - `capture-notes.json`
- completion requires one reviewed note per screenshot
- every note must include:
  - one non-placeholder `captureTruth`
  - one short `stateSummary`
  - one non-empty `operatorNote` when the screenshot uses approximation, omission, or a fallback contract state

Allowed `captureTruth` values:

- `not_reviewed`
- `exact_runtime_capture`
- `approximated_runtime_state`
- `policy_only_fallback`
- `provider_omitted`
- `other_truth_boundary`

## Workflow

1. Run a fresh build and reload the unpacked extension in chrome://extensions before trusting any capture state.
2. Use the current selection pack and storyboard together; the first archived screenshot set is now a historical baseline, not the final submission pack.
3. Capture screenshot slots 1 through 3 from the native Chrome toolbar action bubble, not from the popup app-window smoke helper.
4. Capture screenshot slots 4 and 5 from the full-page shell using the current expanded workspace contract.
5. Close each popup or extension tab before opening the next runtime surface so the RDP Chrome session does not accumulate stale windows.
6. Review and complete capture-notes.json so every screenshot has one truthful state summary and one explicit boundary note when needed.
7. Treat the request package as pending until the real refreshed screenshots are captured and archived.

## Truth Rules

- A pending screenshot-capture request package is not a completed screenshot set.
- The selection pack defines which screenshot slots are stale and why; do not silently reuse the first archive as if it were the final submission pack.
- Do not use popup app-window smoke capture as the final replacement for the native toolbar bubble.
- Do not claim multilingual or unsupported provider coverage in screenshots before the product actually ships it.
