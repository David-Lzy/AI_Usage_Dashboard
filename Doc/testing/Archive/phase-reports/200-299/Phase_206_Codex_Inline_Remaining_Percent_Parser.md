# Phase 206 - Codex Inline Remaining Percent Parser

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Make Codex personal usage-page parsing tolerate merged DOM text where a remaining percentage and its remaining marker arrive in one snippet.

## Why This Phase Exists

Earlier Codex parser coverage proved repeated standalone percentages and single-character balance values. Real browser text extraction can still merge visible copy into snippets such as `100% 剩余`, `32% remaining`, or full-width `100％ 剩余`. Those snippets should remain parseable without requiring a fresh authenticated operator pass.

## What Changed

- Added inline remaining-percent parsing for Codex personal usage snippets.
- Preserved standalone percentage parsing for the current proven fixture shape.
- Added full-width percent support for merged Chinese DOM text.
- Added regression coverage for merged percentage/remaining snippets plus an inline balance label/value.
- Added `npm run phase206:review` to verify the parser, regression test, and closeout-document markers.

## Preserved Boundaries

- No provider coverage claims changed.
- Codex personal still exposes visible usage-window percentages, reset timing, and optional flex credit balances rather than one absolute remaining balance.
- Flex credit balance remains supplemental context, not the primary quota value.
- Cursor, Claude, Gemini, JetBrains, source-selection, popup layout, and dashboard rendering did not change.

## Artifacts

- `scripts/phase206-codex-inline-remaining-percent-review.mjs`
- `tmp/phase206-codex-inline-remaining-percent-review/codex-inline-remaining-percent-review.json`

## Verification

- `npm run test -- --run src/providers/codex/personal-page-parser.test.ts`
- `npm run phase206:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

If a real authenticated Codex page is available, re-run an operator pass against the live route. Otherwise continue with small parser or user-visible provider-context hardening slices before returning to store screenshot closure.
