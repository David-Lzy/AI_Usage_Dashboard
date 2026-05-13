# Phase 22 - Claude Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- replace the current Claude analytics fixture path with a real supported live admin or analytics integration

Depends on:

- phase 21
- phase 12
- phase 13

File scope:

- `src/providers/claude-code/`
- `src/providers/registry.ts`
- `Doc/provider_notes/Claude.md`
- `fixtures/claude/`

Tasks:

- confirm the exact Claude org or admin account type supported in v1
- wire the live analytics or admin source
- preserve the current honest behavior when exact remaining quota is unavailable
- verify session metrics, timestamps, and warning summaries from live data
- update tests and fixtures from the real response shape

Done when:

- Claude Code can return live analytics-backed normalized data for the chosen supported account type
- the UI still distinguishes tracked usage from exact remaining quota
- unsupported account types remain explicit in adapter errors

Out of scope:

- pretending that personal plans expose the same data as admin-enabled orgs

Completion date: 2026-04-20

Completion summary:

- replaced the runtime Claude fixture path with the live Claude Code Analytics Admin API path
- extended provider-secret storage so Claude Admin API keys are stored separately from the shared app state
- generalized the Settings credential flow so both Cursor and Claude Admin API keys can be saved or cleared from the side panel
- implemented live Anthropic requests with `x-api-key` and `anthropic-version` headers and support for cursor-based pagination on the analytics endpoint
- kept the adapter honest about scope: organization Admin API access is supported, but exact remaining included subscription quota is still unavailable and remains `null`
- added focused tests for the Claude live client, Claude adapter, and shared provider-credential reconciliation

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- smoke checks:
  - Playwright preview smoke: dashboard -> settings -> Cursor credential card -> Claude credential card
- residual manual item:
  - a real Anthropic organization Admin API key is still needed to validate the live response shape and real production error handling

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Follow-up:

- move to `Phase 23` for Gemini live wiring
