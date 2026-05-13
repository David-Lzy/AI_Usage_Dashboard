# Phase 295 - Store Mixed Screenshot Candidate

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the accepted Chrome Web Store screenshot candidate composition after user review

## Scope

Phase 295 is a documentation and product-decision closeout. It does not import
image files and does not create a final screenshot archive.

The user accepted a mixed store screenshot candidate pack:

- one native toolbar popup quick-glance image
- full-page dashboard overview
- Codex provider usage detail
- Cursor source/settings boundary detail
- optional side-panel Settings/responsive setup image

## Review Result

The previous strict plan required three native-toolbar popup screenshots. After
reviewing the current `0.1.0-rc.11` surfaces, the accepted store story now uses
the native popup only for the quick-glance proof and uses larger surfaces for
dashboard, provider, and source-boundary depth.

This keeps the store story clearer while preserving truth boundaries:

- no exact Cursor personal remaining included-request claim
- no plan-wide absolute Codex remaining-balance claim
- no JetBrains, Claude personal, or Gemini live-support graduation
- no preview-only image treated as final archive evidence

## Commands

- `npm run docs:check`
- `git diff --check`

## Follow-Up

Save the accepted screenshots as files and run the store screenshot
import/archive workflow. The maintained docs now point the next work at
image-file intake/import/archive instead of more screenshot-selection debate.
