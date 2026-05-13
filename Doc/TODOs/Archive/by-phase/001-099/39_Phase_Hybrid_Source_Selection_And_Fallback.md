# Phase 39 - Hybrid Source Selection And Fallback

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- make source selection deterministic and user-readable once `Codex` and `Cursor` each have both official and session-page paths

Depends on:

- phase 36
- phase 38

File scope:

- `src/shared/`
- `src/background/`
- `src/sidepanel/`
- `Doc/testing/`
- `README.md`

Tasks:

- add per-provider source preference state such as:
  - `auto`
  - `official`
  - `session_page`
- define fallback rules for missing credentials, missing host access, missing open page, and source-sync failure
- surface the active source choice and fallback reason in settings and provider detail
- add tests for mixed-source conflict cases and deterministic fallback behavior
- update QA and README guidance so mixed account types stay understandable

Done when:

- `Codex` and `Cursor` have explicit, testable source-selection behavior
- users can tell why the extension chose one source over another
- the product no longer relies on implicit heuristics when both source types are available

Out of scope:

- reconnect persistence after tab closure or browser relaunch
- release packaging

Completion date: 2026-04-22

Completion summary:

- added persisted per-provider source preference state with explicit `auto`, `official_api`, and `session_page` modes for hybrid providers
- replaced the old implicit `has credential then official else page` behavior in `Codex` and `Cursor` with deterministic attempt ordering and explicit fallback rules
- surfaced the active source preference, selection reason, and fallback reason in Settings and provider detail so mixed-source behavior is user-readable
- extended shared source helpers and regression tests to cover preference normalization, attempt ordering, and hybrid fallback cases

Verification:

- `PATH=$HOME/.local/node-current/bin:$PATH npm run typecheck`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run test`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run build`
- `PATH=$HOME/.local/node-current/bin:$PATH node ./scripts/phase19-smoke.mjs`
- restart the preview service and confirm both preview URLs return HTTP 200

Follow-up:

- phase 40 should make the chosen session-page binding persist and reconnect across page closure and browser relaunch without undoing the new source-preference rules
