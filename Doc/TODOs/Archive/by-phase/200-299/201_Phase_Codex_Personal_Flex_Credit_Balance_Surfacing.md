# Phase 201 - Codex Personal Flex Credit Balance Surfacing

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Carry Codex personal flex credit balance cards through the normalized snapshot and UI as supplemental usage context.

## Completed Work

- Added optional `ProviderSnapshot.usageBalances` metadata for credit-balance cards.
- Added Codex personal parser support for balance labels, numeric balance values, and nearby detail copy.
- Added Codex adapter mapping, stale-field clearing, and summary copy for parsed balances.
- Added side-panel provider-card and provider-detail surfacing for balance context.
- Added parser and adapter regression coverage for `余额额度 0`.

## Preserved Boundaries

- Balance cards do not replace the primary most-constrained percentage-window display.
- Codex still does not expose one full plan-wide absolute remaining-credit value through this path.
- Source-selection order and provider coverage claims did not change.
- No generated request package, operator archive, or store screenshot package was rewritten.

## Verification

- `npm run test -- src/providers/codex/personal-page-parser.test.ts src/providers/codex/adapter.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Prefer real Chrome Codex personal verification next so the live page proves both the multi-window and balance-card parsing assumptions before returning to i18n diagnostics, store screenshots, or operator evidence closure.
