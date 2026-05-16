# Store Screenshot Capture Request - 2026-05-16-public-store-readiness-request

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this request package has been fulfilled by one archived screenshot set
- keep using the archive package as the durable evidence source rather than reinterpreting this request README as the final record

## Request Scope

- request id:
  - `2026-05-16-public-store-readiness-request`
- created at:
  - `2026-05-16T06:30:29.114Z`
- status:
  - `fulfilled_operator_capture`
- runtime source:
  - `RDP Chrome unpacked extension, post-Phase 490 source build`
- capture automation mode:
  - `manual_capture_required`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`
- capture notes:
  - `capture-notes.json`
- capture plan:
  - `capture-plan.json`

## Source References

- storyboard:
  - `Doc/Store/Store_Screenshot_Storyboard.md`
- selection pack:
  - `Doc/Store/Store_Screenshot_Selection_Pack.md`
- baseline archive README:
  - `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md`
- baseline pack README:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
- baseline pack plan:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/capture-plan.json`

## Required Screenshot Filenames

- `01-popup-quick-glance.png`
- `02-dashboard-overview.png`
- `03-provider-detail-contract.png`
- `04-settings-overview-and-theme.png`
- `05-settings-quick-setup-and-appearance.png`

## Capture Plan Summary

- request-bound runner slots:
  - `0`
- manual operator slots:
  - `5`

- `01-popup-quick-glance.png`
  - mode: `manual_operator_capture`
  - surface: `unknown`
  - manual note: No request-bound RDP capture plan entry exists for this screenshot slot, so it remains manual until one truthful automation path is defined.
- `02-dashboard-overview.png`
  - mode: `manual_operator_capture`
  - surface: `unknown`
  - manual note: No request-bound RDP capture plan entry exists for this screenshot slot, so it remains manual until one truthful automation path is defined.
- `03-provider-detail-contract.png`
  - mode: `manual_operator_capture`
  - surface: `unknown`
  - manual note: No request-bound RDP capture plan entry exists for this screenshot slot, so it remains manual until one truthful automation path is defined.
- `04-settings-overview-and-theme.png`
  - mode: `manual_operator_capture`
  - surface: `unknown`
  - manual note: No request-bound RDP capture plan entry exists for this screenshot slot, so it remains manual until one truthful automation path is defined.
- `05-settings-quick-setup-and-appearance.png`
  - mode: `manual_operator_capture`
  - surface: `unknown`
  - manual note: No request-bound RDP capture plan entry exists for this screenshot slot, so it remains manual until one truthful automation path is defined.

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
2. Capture screenshots from real extension runtime surfaces in the RDP Chrome profile, not from static mocks.
3. Use the current dark-mode profile state truthfully; do not fabricate a light/dark split asset until a separate light-mode capture pass is complete.
4. Resize or crop only to meet the Chrome Web Store screenshot dimensions; do not edit provider numbers or source text.
5. Review and complete capture-notes.json so every screenshot has one truthful state summary and one explicit boundary note when needed.
6. Treat this request package as pending until the real refreshed screenshots are archived.

## Manual Popup Intake

- popup notes template:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`
- popup capture checklist:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-capture-checklist.md`
- popup import command:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir>`
- popup import with notes command:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`

## Truth Rules

- A pending screenshot-capture request package is not a completed screenshot set.
- The archive must preserve that these screenshots came from the local RDP profile state and may include live account-specific quota values.
- Do not claim light-mode screenshots if the actual capture is dark-mode.
- Do not claim unsupported provider coverage or exact quota support when a provider only exposes policy or diagnostic state.

## Fulfillment

- fulfilled at:
  - `2026-05-16T06:32:32.545Z`
- archive id:
  - `2026-05-16-public-store-readiness-request-archive`
- archive README:
  - `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md`
- archive manifest:
  - `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/capture-archive.json`
- source capture dir:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures`
- source notes:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/capture-notes.json`
- archive notes:
  - `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/capture-notes.json`
- reviewed screenshots:
  - `5`
- truth-boundary screenshots:
  - `5`
- archived screenshots:
  - `01-popup-quick-glance.png`
  - `02-dashboard-overview.png`
  - `03-provider-detail-contract.png`
  - `04-settings-overview-and-theme.png`
  - `05-settings-quick-setup-and-appearance.png`
