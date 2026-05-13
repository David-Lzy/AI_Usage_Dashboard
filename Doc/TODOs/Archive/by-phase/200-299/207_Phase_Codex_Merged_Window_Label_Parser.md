# Phase 207 - Codex Merged Window Label Parser

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Harden Codex personal usage parsing for merged window-label snippets.

## Completed Work

- Added Codex parser support for snippets where a usage-window label and remaining percentage are merged.
- Stripped inline runtime percentages and remaining markers from normalized window labels.
- Preserved reset-time parsing when the reset marker appears in the same merged snippet.
- Added regression coverage for base weekly windows and model weekly windows in merged label/value text.
- Added `phase207:review` for repeatable marker verification.

## Preserved Boundaries

- No provider coverage, source-selection, release-package, archive, popup, dashboard, or Settings behavior changed.
- Codex personal keeps the visible-window truth boundary and does not claim one absolute remaining balance.
- Flex credit balance remains supplemental context rather than a primary quota value.
- Real authenticated operator evidence remains preferred when the live page is available.

## Verification

- `npm run test -- --run src/providers/codex/personal-page-parser.test.ts`
- `npm run phase207:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Prioritize a real authenticated Codex or Cursor operator pass if available. If not, continue with narrow provider robustness slices before returning to store screenshot closure.
