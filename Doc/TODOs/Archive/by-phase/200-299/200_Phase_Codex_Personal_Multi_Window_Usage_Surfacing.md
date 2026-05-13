# Phase 200 - Codex Personal Multi-Window Usage Surfacing

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Make Codex personal usage-page support prioritize functional quota clarity by carrying multiple visible usage windows into the normalized snapshot and UI.

## Completed Work

- Added optional provider snapshot fields for visible usage windows and usage-window summary copy.
- Updated Codex personal session-page snapshots to use the lowest visible remaining percentage as the primary dashboard/detail value.
- Added Provider Card, Provider Detail, and popup summary surfacing for multi-window Codex personal snapshots.
- Expanded Codex personal page capture snippets so lower cards in the usage page are retained.
- Added regression coverage for a Chinese Codex usage page with `100%` 5-hour remaining and `32%` weekly remaining.

## Preserved Boundaries

- No provider coverage claims changed.
- No source-selection behavior changed.
- No raw provider evidence strings were translated or removed.
- No generated request, archive, store screenshot, or operator package was rewritten.

## Verification

- `npm run test -- src/providers/codex/personal-page-parser.test.ts src/providers/codex/adapter.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue functional-first work while Codex budget is constrained. Prefer real Codex personal multi-window runtime verification or the next live provider-source slice before returning to store screenshots or operator evidence closure.
