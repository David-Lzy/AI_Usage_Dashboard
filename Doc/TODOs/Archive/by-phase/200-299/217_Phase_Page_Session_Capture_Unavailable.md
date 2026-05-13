# Phase 217 - Page Session Capture Unavailable

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Distinguish unreadable open session-page tabs from missing tabs or parse drift.

## Completed Work

- Added `capture_unavailable` to the page-session result model.
- Returned `capture_unavailable` when at least one candidate tab exists but page capture fails and no logged-in page matches.
- Kept `capture_failed` attempt evidence so diagnostics can still explain the low-level read failure.
- Mapped Codex and Cursor personal live fixtures into parser-level `capture_unavailable` failures.
- Surfaced Codex and Cursor `page_session.capture_unavailable` diagnostics with reload guidance in provider snapshots.

## Preserved Boundaries

- No provider coverage claim, source preference order, credential storage, host permission request, or cookie/auth-header handling changed.
- Route drift remains an adapter parse failure, not a page-session availability failure.
- Open-page-required still means no readable matching page was found.
- Logged-out still remains a separate page-session state.

## Verification

- `npm run test -- --run src/providers/page-session.test.ts src/providers/codex/personal-page-parser.test.ts src/providers/cursor/personal-page-parser.test.ts src/providers/codex/adapter.test.ts src/providers/cursor/adapter.test.ts`
- `npm run typecheck`
- `npm run phase217:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run the next real RDP Chrome Codex or Cursor operator pass against an authenticated page and at least one blocked or unreadable page state to confirm the visible `capture_unavailable` messaging is understandable in the UI.
