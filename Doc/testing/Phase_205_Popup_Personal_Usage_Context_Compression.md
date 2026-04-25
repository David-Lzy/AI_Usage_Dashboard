# Phase 205 - Popup Personal Usage Context Compression

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Make popup featured-provider cards show the most useful personal usage context without carrying the full dashboard/detail usage summary into the small toolbar surface.

## Why This Phase Exists

After Codex and Cursor personal usage context shipped, dashboard and provider detail can show fuller context. The popup should stay compact. For structured Codex personal data, the popup now needs the most-constrained visible usage window and the first visible balance rather than a long all-window summary.

## What Changed

- Added popup usage-context compression for providers with `usageWindows` and `usageBalances`.
- The popup now prefers the most-constrained usage window plus one visible balance for ready or policy-only featured cards.
- Summary-only personal context still falls back to `usageSummary`, preserving the Cursor personal billing-period summary path.
- Localized popup models format compact percentages and credit counts through the runtime i18n helper while keeping raw provider labels source-truthful.
- Added `npm run phase205:review` to verify the popup view-model, test, and closeout-document markers.

## Preserved Boundaries

- Dashboard and provider-detail surfaces keep the fuller usage context.
- Provider parser behavior did not change.
- Source-selection behavior did not change.
- Provider coverage claims did not change.
- Cursor personal still does not claim exact remaining included requests.
- Codex personal still does not claim one full plan-wide absolute remaining balance.

## Artifacts

- `scripts/phase205-popup-personal-usage-context-review.mjs`
- `tmp/phase205-popup-personal-usage-context-review/popup-personal-usage-context-review.json`

## Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run phase205:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Keep the next phase functionality-first. If no real authenticated provider page is available, prefer narrow UX, verification, or release-readiness slices that protect the shipped personal-usage paths.
