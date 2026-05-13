# Phase 205 - Popup Personal Usage Context Compression

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Compress personal usage context in popup featured-provider cards while preserving fuller dashboard and provider-detail context.

## Completed Work

- Added a popup view-model helper that selects the most-constrained usage window for structured personal usage context.
- Added compact popup balance formatting so a visible balance such as flex credits can appear beside the selected window.
- Kept summary-only Cursor personal context visible by falling back to `usageSummary` when no structured windows or balances exist.
- Added English and `zh-CN` popup regression coverage for structured Codex personal usage compression.
- Added summary-only Cursor personal popup regression coverage.
- Added `phase205:review` for repeatable marker verification.

## Preserved Boundaries

- No parser, source-selection, provider-coverage, archive, or release-package semantics changed.
- Dashboard and provider detail remain the richer surfaces for full usage context.
- Popup remains a compact triage surface.
- Codex personal support remains partial rather than one absolute remaining-balance claim.
- Cursor personal support remains summary-only billing-period context rather than exact remaining included requests.

## Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run phase205:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Prioritize real authenticated provider evidence if available. Otherwise continue with narrow popup, provider-context, or release-readiness slices that reduce risk without broad replanning.
