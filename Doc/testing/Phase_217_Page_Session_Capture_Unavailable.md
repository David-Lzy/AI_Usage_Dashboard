# Phase 217 - Page Session Capture Unavailable

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Make unreadable session-page tabs visible as a distinct capture-unavailable state instead of collapsing them into the generic open-page-required path.

## Why This Phase Exists

Phase 215 added active-page binding and Phase 216 marked bound tabs stale when they close or navigate away. The remaining functional gap was a tab that still exists but cannot be read by the extension, such as a loading, blocked, discarded, or otherwise injection-unavailable provider page.

## What Changed

- Added `capture_unavailable` as a page-session result when candidate tabs exist but script capture fails.
- Preserved per-tab `capture_failed` attempt evidence with the thrown capture error.
- Updated Codex and Cursor personal parsers to return `capture_unavailable` when live route captures cannot be read.
- Updated Codex and Cursor adapters to surface `page_session.capture_unavailable` diagnostics with reload guidance.
- Kept parser route drift separate as an adapter parse failure.

## Verification

- `npm run test -- --run src/providers/page-session.test.ts src/providers/codex/personal-page-parser.test.ts src/providers/cursor/personal-page-parser.test.ts src/providers/codex/adapter.test.ts src/providers/cursor/adapter.test.ts`
- `npm run typecheck`
- `npm run phase217:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next real Codex or Cursor operator pass to verify the visible UI copy against an actual unreadable, blocked, or logged-out bound page in RDP Chrome.
