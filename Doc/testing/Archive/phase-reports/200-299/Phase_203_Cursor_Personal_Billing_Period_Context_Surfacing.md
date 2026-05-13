# Phase 203 - Cursor Personal Billing Period Context Surfacing

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Surface Cursor personal billing-period context across dashboard, provider detail, and popup while keeping the product honest that the page does not expose an exact remaining included-request counter.

## Why This Phase Exists

Cursor personal support already had parser and adapter coverage for the dashboard usage page, but the visible page context was mostly collapsed into reset labels and warning copy. After the Codex usage-context work, Cursor needed parity for the same compact usage-summary path without pretending it has exact remaining quota values.

## What Changed

- Added Cursor personal `usageSummary` output for billing period, usage-series label, visible plan labels, on-demand state, and CSV export availability.
- Cleared stale Cursor usage-summary metadata on official API and no-source paths.
- Expanded Cursor personal DOM capture to preserve short usage labels such as `Pro`, `Pro+`, `Ultra`, `By Model`, `Spend`, and `Export CSV`.
- Added dashboard provider-card support for summary-only usage context when no structured usage windows or balances exist.
- Added provider-detail support for summary-only usage context under the existing `Visible usage context` note.
- Added `npm run phase203:review` as a repeatable unpacked-extension review for Cursor personal billing-period context.

## Preserved Boundaries

- Cursor personal remains a billing-period usage-context path, not an exact remaining included-request counter.
- The dashboard usage value still shows unknown request totals for Cursor personal because the current page does not expose exact included remaining values.
- Official API team usage remains the exact remaining-request path when configured.
- Store screenshots, operator archives, and provider coverage claims were not rewritten.
- The review uses a synthetic logged-in Cursor page in an unpacked-extension runtime, not the user's live authenticated Cursor session.

## Artifacts

- `scripts/phase203-cursor-usage-context-extension-review.mjs`
- `tmp/phase203-cursor-usage-context-extension-review/dashboard-cursor-usage-context.png`
- `tmp/phase203-cursor-usage-context-extension-review/provider-detail-cursor-usage-context.png`
- `tmp/phase203-cursor-usage-context-extension-review/popup-cursor-usage-context.png`
- `tmp/phase203-cursor-usage-context-extension-review/phase203-results.json`

## Verification

- `npm run test -- --run src/providers/cursor/personal-page-capture.test.ts src/providers/cursor/personal-page-parser.test.ts src/providers/cursor/adapter.test.ts`
- `npm run build`
- `npm run phase203:review`

## Follow-Up

Keep the next slice functionality-first if budget allows. The highest-value next options are a real authenticated Codex or Cursor operator pass, or returning to the deferred diagnostic raw-fallback regression line once the live provider display work is stable.
