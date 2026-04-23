# Store Screenshot Capture Request - 2026-04-24-first-real-store-screenshot-capture-request

Date: 2026-04-23

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
  - `2026-04-24-first-real-store-screenshot-capture-request`
- created at:
  - `2026-04-23T18:20:45.169Z`
- status:
  - `pending_operator_capture`
- runtime source:
  - `RDP Chrome unpacked extension`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`
- capture notes:
  - `capture-notes.json`

## Source References

- storyboard:
  - `Doc/Store_Screenshot_Storyboard.md`
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
2. Use the current baseline capture pack and follow the screenshot order exactly.
3. Capture all screenshots from the real extension runtime in RDP Chrome, not from preview-only pages.
4. Review and complete capture-notes.json so every screenshot has one truthful state summary and one explicit boundary note when needed.
5. Treat the request package as pending until the real screenshots are captured and archived.

## Truth Rules

- A pending screenshot-capture request package is not a completed screenshot set.
- The baseline capture pack defines the expected runtime order, not a finished store-submission artifact.
- Do not claim multilingual or unsupported provider coverage in screenshots before the product actually ships it.
