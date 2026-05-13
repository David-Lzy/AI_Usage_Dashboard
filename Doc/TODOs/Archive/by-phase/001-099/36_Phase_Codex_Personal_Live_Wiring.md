# Phase 36 - Codex Personal Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- ship Codex personal support as a real `session_page` source that can live alongside the existing Enterprise analytics integration

Depends on:

- phase 24
- phase 34
- phase 35

File scope:

- `src/providers/codex/`
- `src/providers/registry.ts`
- `src/shared/`
- `src/sidepanel/`
- `Doc/testing/`

Tasks:

- wire the new Codex personal parser into a live adapter path
- add or refine `chatgpt.com` host-access handling and the settings helper for finding or opening the required Codex page
- expose honest Codex source states in dashboard, detail, and settings for:
  - Enterprise analytics
  - personal session page
  - missing permission
  - missing open page
- keep Enterprise analytics semantics separate from personal usage-window semantics
- add smoke and manual checks for a real personal-tab refresh flow

Done when:

- a logged-in ChatGPT Codex page can refresh the Codex provider in live mode without raw cookie export
- the existing Enterprise path still works and remains clearly labeled
- Codex can fail into readable source states rather than generic sync errors

Out of scope:

- cross-provider source preferences
- Cursor personal support
- reconnect persistence after browser relaunch

Completion date: 2026-04-22

Completion summary:

- shipped a real Codex personal `session_page` adapter path on top of the new personal-page parser while preserving the existing Enterprise analytics path
- added a Codex personal-page client with live and fixture modes so browser preview keeps working and unpacked extension mode can read the logged-in ChatGPT tab set
- updated the Codex source blueprint and settings UX so Codex personal usage pages are now a shipped `Find or open page` path rather than a future placeholder
- updated provider card and detail formatting so percentage-based usage windows render honestly instead of pretending they are absolute request or credit counts
- updated smoke coverage and manual QA guidance for the new Codex session-page helper path

Verification:

- `PATH=$HOME/.local/node-current/bin:$PATH npm run typecheck`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run test`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run build`
- `PATH=$HOME/.local/node-current/bin:$PATH node ./scripts/phase19-smoke.mjs`
- restarted preview service and confirmed both preview URLs return HTTP 200

Follow-up:

- phase 39 will formalize source preference and fallback behavior; phase 36 still uses the temporary rule `official if analytics config exists, session_page otherwise`
