# Phase 09 - Cursor Adapter

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- implement the first real provider adapter using Cursor team data

Depends on:

- phase 08

File scope:

- `src/providers/cursor/adapter.ts`
- `src/providers/cursor/official.ts`
- `src/providers/cursor/page-parse.ts`
- `src/providers/normalize.ts`

Tasks:

- implement the Cursor official client path
- normalize Cursor usage into the shared model
- add provider-specific errors
- add fixture-driven adapter tests or validation checks
- wire Cursor into the registry

Done when:

- Cursor data can be refreshed into storage
- the dashboard can render one real Cursor snapshot
- failures degrade into a usable error state

Out of scope:

- second provider support

Completion date: 2026-04-20

Completion summary:

- added a Cursor official client with typed members, spend, and daily-usage responses
- added a Cursor adapter that normalizes official response data into the shared provider snapshot model
- added a page-parse stub that explicitly marks dashboard parsing as out of the MVP path
- refactored the provider registry and sync engine so provider adapters can run asynchronously
- wired app initialization and manual refresh through the Cursor adapter so the dashboard can render a fixture-backed official Cursor snapshot

Verification:

- unit tests: no formal test runner was added in this phase
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - smoke test:
    - `npx -y tsx /tmp/phase09-smoke.ts`
    - verified `app:init` returns a Cursor snapshot normalized from the official fixture path
- live-api note:
  - no real Cursor Admin API key was available in this phase, so the official client currently runs in fixture mode

Preview:

- command: `/home/davidli/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin/node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`
- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 10` for JetBrains research
