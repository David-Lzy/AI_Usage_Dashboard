# Phase 13 - Claude Adapter

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- implement the Claude Team or Enterprise adapter using the chosen analytics source

Depends on:

- phase 12

File scope:

- `src/providers/claude-code/adapter.ts`
- `src/providers/claude-code/official.ts`
- `src/providers/claude-code/page-parse.ts`

Tasks:

- implement the selected Claude analytics path
- normalize the result into the shared model
- represent unsupported personal-plan states explicitly
- add validation against saved fixtures
- wire Claude into the registry

Done when:

- one supported Claude account type can sync correctly
- unsupported Claude account types are labeled clearly
- the dashboard handles Claude errors cleanly

Out of scope:

- Gemini live remaining usage

Completion date: 2026-04-20

Completion summary:

- added a Claude Code Analytics Admin API client scaffold backed by the docs-derived fixture
- implemented the first Claude adapter using the official analytics source instead of dashboard parsing
- normalized Claude into an analytics-first snapshot shape using tracked `sessions` rather than pretending to know exact remaining quota
- added an explicit unsupported-state error for personal Pro / Max or non-Admin-API setups
- wired Claude into the provider registry and removed the old mock sync path
- added fixture-driven Vitest coverage for the Claude adapter
- improved the side panel card and detail views so providers with `used` but no `total` render a readable tracked-usage state

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- fixture-mode note:
  - the Claude adapter currently runs in fixture mode because no live Admin API key was available in this phase
  - `live` mode in `src/providers/claude-code/official.ts` intentionally throws until real authenticated access is wired

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 14` for Gemini static quota research / implementation
