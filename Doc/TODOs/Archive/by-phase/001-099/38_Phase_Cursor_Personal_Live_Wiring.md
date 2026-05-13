# Phase 38 - Cursor Personal Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- ship Cursor personal dashboard support as a real `session_page` source without regressing the shipped team Admin API path

Depends on:

- phase 20
- phase 34
- phase 37

File scope:

- `src/providers/cursor/`
- `src/providers/registry.ts`
- `src/shared/`
- `src/sidepanel/`
- `Doc/testing/`

Tasks:

- wire the personal Cursor parser into a live adapter path
- add or refine `cursor.com` host-access handling and a settings helper for finding or opening the current usage page
- surface the honest semantics of the personal route:
  - current billing-period usage
  - spend or on-demand state
  - no exact included-request remaining unless a later fixture proves otherwise
- preserve the shipped team Admin API path and keep both paths clearly labeled
- add smoke and manual checks for personal Cursor refresh flow

Done when:

- a logged-in Cursor usage tab can refresh the provider in live mode
- the team-admin API path still works with the same credential flow
- users can tell whether their current Cursor numbers came from the Admin API or the personal dashboard page

Out of scope:

- cross-provider source preferences
- reconnect persistence after relaunch
- new research for Claude or Gemini

Completion date: 2026-04-22

Completion summary:

- shipped a real Cursor personal `session_page` adapter path while preserving the existing team Admin API integration
- added a Cursor personal-page client so extension mode reads the logged-in dashboard usage tab and preview mode stays deterministic with a fixture-backed fallback
- updated the Cursor source blueprint, settings UX, and sample app state so the product can honestly present `Official API` and `Session page` Cursor states side by side
- kept the personal path honest by rendering billing-period usage context and on-demand usage state without inventing remaining included requests
- extended automated and manual QA coverage for the new Cursor personal helper flow

Verification:

- `PATH=$HOME/.local/node-current/bin:$PATH npm run typecheck`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run test`
- `PATH=$HOME/.local/node-current/bin:$PATH npm run build`
- `PATH=$HOME/.local/node-current/bin:$PATH node ./scripts/phase19-smoke.mjs`
- restart the preview service and confirm both preview URLs return HTTP 200

Follow-up:

- phase 39 will formalize source-selection and fallback rules; phase 38 still uses the temporary rule `official if Admin API key exists, session_page otherwise`
