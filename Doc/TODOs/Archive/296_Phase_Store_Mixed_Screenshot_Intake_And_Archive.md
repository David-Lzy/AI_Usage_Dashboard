# Phase 296 - Store Mixed Screenshot Intake And Archive

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Turn the Phase 295 mixed store screenshot candidate decision into real repo
files and one fulfilled screenshot archive.

## Completed Work

- Captured the current RDP Chrome extension surfaces for the accepted mixed
  screenshot pack.
- Saved the source captures under:
  - `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/`
- Completed the refreshed screenshot request through:
  - `npm run store:complete-screenshot-capture-request`
- Added the durable archive:
  - `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/`
- Refreshed generated screenshot request and archive indexes.
- Updated maintained storyboard, selection, listing-copy, localization, TODO,
  README, and roadmap docs so they point at the refreshed archive instead of a
  pending image-file intake step.

## Archived Pack

1. native toolbar popup quick glance
2. full-page dashboard overview
3. Codex provider usage detail
4. Cursor source/settings boundary detail
5. Chrome side-panel provider detail

## Preserved Boundaries

- Cursor personal still exposes billing-period context, not exact remaining
  included requests.
- Codex personal usage remains window-scoped usage and reset timing, not one
  absolute plan-wide remaining balance.
- The archive is submission-prep evidence, not a submitted Chrome Web Store
  listing receipt.
- Provider closure remains account/product-decision gated for JetBrains, Claude
  personal, and Gemini project metrics.

## Verification

- `npm run store:complete-screenshot-capture-request -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --captures-dir Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures --notes-file Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/capture-notes.json --archive-id 2026-05-04-rc11-mixed-store-candidate-archive`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

When the user wants to move beyond release review, prepare the Chrome Web Store
submission checklist against `0.1.0-rc.11`, the refreshed screenshot archive,
and the maintained listing-copy pack.
