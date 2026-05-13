# Phase 296 - Store Mixed Screenshot Intake And Archive

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the RDP Chrome screenshot intake and archive completion for the
  Phase 295 mixed Chrome Web Store candidate pack

## Scope

Phase 296 completes the store screenshot file-intake step for `0.1.0-rc.11`.
It does not change runtime code or release-package versioning.

## Archive Result

- fulfilled request:
  - `2026-04-24-surface-expansion-store-screenshot-refresh-request`
- archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive/README.md](../../../store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- source intake:
  - [2026-05-04-rc11-mixed-store-candidate/README.md](../../../store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/README.md)
- reviewed screenshots:
  - `5/5`
- truth-boundary screenshots:
  - `3`

## Captured Surfaces

- `01-toolbar-first-quick-glance.png`
  - native Chrome toolbar popup quick glance with Codex usage-window rings
- `02-setup-guidance.png`
  - full-page dashboard overview with product promise and summary counts
- `03-honest-contract-or-policy-only.png`
  - full-page Codex provider card with window-scoped percentages and reset timing
- `04-settings-and-setup-depth.png`
  - full-page Cursor source/settings boundary with personal partial context
- `05-provider-or-dashboard-depth.png`
  - Chrome side-panel Codex provider-detail route triggered through the shipped popup path

## Commands

- `npm run store:complete-screenshot-capture-request -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --captures-dir Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures --notes-file Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/capture-notes.json --archive-id 2026-05-04-rc11-mixed-store-candidate-archive`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

The screenshot archive blocker is closed. The next store-readiness step is a
submission checklist or final listing package review when the user wants to
prepare the Chrome Web Store submission.
