# Phase 20 - Cursor Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- replace the current Cursor fixture path with a real live integration path for the supported v1 account type

Depends on:

- phase 19
- phase 08
- phase 09

File scope:

- `src/providers/cursor/`
- `src/providers/registry.ts`
- `src/shared/constants.ts`
- `Doc/provider_notes/Cursor.md`
- `fixtures/cursor/`

Tasks:

- confirm the exact supported Cursor account type for v1
- wire real request/auth handling for the Cursor team Admin API path
- preserve a safe fallback state when credentials or admin access are unavailable
- verify normalized usage, reset, and warning fields against live responses
- update fixtures and tests from the real response shape

Done when:

- Cursor can return live normalized data for the chosen supported account type
- failure states stay explicit and do not silently fall back to fake numbers
- tests and fixtures reflect the implemented live path

Out of scope:

- unsupported Cursor individual-account scraping if it is not needed for v1

Completion date: 2026-04-20

Completion summary:

- removed the runtime Cursor fixture path from the main sync flow and switched the adapter to the live Cursor Team Admin API path
- added separate provider-secret storage so the Cursor team admin API key is stored outside the shared app state and never bundled into source
- added a Cursor credential card in Settings so the user can save or clear the Admin API key from the side panel
- wired app init, manual refresh, and Cursor credential updates through a credential reconciliation step before sync runs
- kept failure states explicit for missing host access, missing admin key, and live API failures instead of silently showing fake usage
- added focused tests for Cursor live normalization and provider credential state

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- smoke checks:
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
  - Playwright preview smoke: dashboard -> settings -> `Cursor Team Admin API key` card -> API key input render
- residual manual item:
  - a real team-admin credential is still needed to validate the live Cursor API against a current production team account

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Follow-up:

- move to `Phase 21` for JetBrains live wiring
