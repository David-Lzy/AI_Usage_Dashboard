# Phase 35 - Codex Personal Snapshot Parser

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- turn the proven Codex personal live fixture into a normalized parser that can describe personal usage-window data without touching the shipped Enterprise analytics path yet

Depends on:

- phase 29
- phase 30
- phase 30.1
- phase 34

File scope:

- `src/providers/codex/`
- `fixtures/codex/`
- `Doc/provider_notes/Codex.md`

Tasks:

- implement a parser for the proven `chatgpt.com/codex/cloud/settings/analytics#usage` live fixture
- map visible remaining percentage, reset timing, and usage-window copy into a normalized provider snapshot contract
- classify non-happy-path outcomes:
  - logged out
  - open page required
  - route drift or unsupported DOM shape
- add unit tests that cover the live fixture and the earlier route-evidence fixture
- update the Codex provider note so the parser contract and honesty limits are explicit

Done when:

- the repo has a tested parser that can turn the captured personal Codex page into normalized session-page usage fields
- the parser keeps unsupported or drifted shapes explicit instead of silently inventing numbers
- no sync-engine or settings wiring is required yet

Out of scope:

- changing the shipped Enterprise analytics adapter
- source-selection UX or fallback rules across providers
- Cursor personal implementation

Completion date: 2026-04-22

Completion summary:

- added a new Codex personal-page parser that consumes the redacted live fixture and returns structured window-percent snapshots for the proven `chatgpt.com/codex/cloud/settings/analytics#usage` route
- added explicit parser failure classes for `logged_out`, `open_page_required`, and `route_drift`
- added parser tests for the real live fixture, a no-match open-page case, a logged-out case, and a drifted matched-page case
- updated the Codex provider note to record the parser contract and honesty limits for personal usage windows

Verification:

- `npm run typecheck`
- `npm run test -- src/providers/codex/personal-page-parser.test.ts src/providers/codex/personal-page-capture.test.ts`

Follow-up:

- phase 36 will wire the parser into the live Codex personal session-page path
