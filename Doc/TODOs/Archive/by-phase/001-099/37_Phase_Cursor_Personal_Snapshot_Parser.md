# Phase 37 - Cursor Personal Snapshot Parser

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- turn the captured Cursor personal dashboard route into a normalized parser for current billing-period usage and spend state

Depends on:

- phase 29
- phase 31
- phase 34

File scope:

- `src/providers/cursor/`
- `fixtures/cursor/`
- `Doc/provider_notes/Cursor.md`

Tasks:

- implement a parser for the captured Cursor personal usage fixture, preferring boot-data or flight payloads with DOM fallback
- normalize current billing-period usage, spend controls, and reset-window copy into provider snapshot fields
- keep `remaining` and `total` honest when the page does not expose exact included-request capacity
- add tests for both locale-prefixed and non-prefixed route variants
- update the Cursor provider note so the personal parser contract and limits are explicit

Done when:

- the repo has a tested parser for Cursor personal usage pages
- the parser returns `window_only` semantics instead of pretending exact remaining included requests exist
- locale path differences do not break the extraction contract

Out of scope:

- modifying the shipped team Admin API logic
- live settings or registry wiring
- shared source-selection policy

Completion date: 2026-04-22

Completion summary:

- added a new Cursor personal-page parser that normalizes the captured personal dashboard evidence into billing-period usage metadata instead of fake remaining-request counts
- kept the parser compatible with both the existing redacted evidence fixture and the future `CursorPersonalLiveFixture` shape so phase 38 can reuse it directly
- added parser tests for the captured `/cn/` route, a non-locale `/dashboard/usage` route, and failure states for `logged_out` and `route_drift`
- updated the Cursor provider note to record the parser contract, supported fields, and honesty limits

Verification:

- `PATH=$HOME/.local/node-current/bin:$PATH npm run typecheck`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run test -- src/providers/cursor/personal-page-parser.test.ts src/providers/cursor/personal-page-capture.test.ts`

Follow-up:

- phase 38 will wire this parser into the real Cursor personal session-page path
