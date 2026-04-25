# Phase 201 - Codex Personal Flex Credit Balance Surfacing

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Make the Codex personal session-page path preserve the visible flex credit balance card as supplemental usage context.

## Why This Phase Exists

`Phase 200` started carrying multiple visible percentage windows, but the same live page can also show a non-percentage balance card such as `余额额度 0`. Dropping that card hides useful operator context, especially when the user is triaging whether Codex can continue after plan-window limits.

## What Changed

- Added optional `usageBalances` metadata beside `usageWindows` on provider snapshots.
- Extended the Codex personal parser to recognize flex credit balance labels, numeric balance values, and nearby explanatory detail text.
- Mapped parsed balances through the Codex personal adapter without letting them override the primary percentage-window quota values.
- Cleared stale balance metadata on official API, failure, and no-source paths.
- Added Provider Card chips and Provider Detail usage-context rows for visible balances.
- Let popup healthy-state secondary copy include balance context through the existing `usageSummary`.
- Added parser and adapter regressions for the Chinese `余额额度 0` page shape.

## Preserved Boundaries

- The primary Codex personal dashboard value still comes from the most constrained visible percentage window.
- A flex credit balance is supplemental context, not a claim that the extension has one absolute plan-wide remaining quota.
- Source-selection behavior did not change.
- Provider coverage gaps still exist, including the lack of a full absolute remaining-credit balance across all Codex windows.
- No store screenshot request, operator evidence package, or archive schema changed.

## Verification

- `npm run test -- src/providers/codex/personal-page-parser.test.ts src/providers/codex/adapter.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue functionality-first work while Codex budget is constrained. The next highest-value slice is a real Chrome Codex personal verification pass that confirms the multi-window plus flex-balance display against the current live page, then another provider live-source hardening slice if time remains.
