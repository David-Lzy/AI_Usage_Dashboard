# Store Screenshot Candidate Intake - 2026-05-04 RC11 Mixed Store Candidate

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this package is a file-intake handoff for the user-approved mixed store screenshot candidate pack
- it is not a completed screenshot archive until the PNG files are saved and the completion command succeeds

## Scope

This intake package accepts the `0.1.0-rc.11` mixed store screenshot candidate
pack selected in Phase 295.

Source request:

- `2026-04-24-surface-expansion-store-screenshot-refresh-request`

Candidate decision:

- first screenshot remains a native toolbar popup quick-glance capture
- remaining screenshots use full-page dashboard, Codex provider detail, Cursor
  source-boundary detail, and Chrome side-panel provider detail
- the old requirement for three native toolbar popup screenshots is no longer
  the current product requirement

## Required Files

Save the accepted screenshots into `captures/` with these exact filenames:

1. `01-toolbar-first-quick-glance.png`
2. `02-setup-guidance.png`
3. `03-honest-contract-or-policy-only.png`
4. `04-settings-and-setup-depth.png`
5. `05-provider-or-dashboard-depth.png`

Current semantic mapping:

- `01-toolbar-first-quick-glance.png`
  - native toolbar popup quick glance showing Codex usage-window rings
- `02-setup-guidance.png`
  - full-page dashboard overview showing product promise and summary cards
- `03-honest-contract-or-policy-only.png`
  - Codex provider usage detail showing remaining percentages and reset timing
- `04-settings-and-setup-depth.png`
  - Cursor source/settings detail showing the personal partial boundary
- `05-provider-or-dashboard-depth.png`
  - Chrome side-panel provider-detail view triggered through the shipped popup path

The filenames intentionally preserve the existing request contract so the
current archive tooling can complete the request without a generator rewrite.
The capture notes in this package record the updated semantic mapping.

## Completion Command

After the PNG files are saved, run from the repo root:

```bash
npm run store:complete-screenshot-capture-request -- \
  --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request \
  --captures-dir Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures \
  --notes-file Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/capture-notes.json \
  --archive-id 2026-05-04-rc11-mixed-store-candidate-archive
```

Expected result:

- the pending request becomes fulfilled
- a new archive appears under `Doc/testing/store_screenshot_archives/`
- request and archive indexes are refreshed

## Truth Boundaries

- Do not use generated or edited mock screenshots.
- Do not claim exact Cursor personal remaining included requests.
- Do not claim one absolute plan-wide Codex remaining balance.
- Do not present JetBrains, Claude personal, or Gemini project metrics as newly
  live-supported.
- Do not treat this intake package as store-ready until the archive exists.
