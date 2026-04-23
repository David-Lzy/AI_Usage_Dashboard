# Phase 11 - JetBrains Adapter

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- implement JetBrains AI usage ingestion from the chosen console source

Depends on:

- phase 10

File scope:

- `src/providers/jetbrains/adapter.ts`
- `src/providers/jetbrains/official.ts`
- `src/providers/jetbrains/page-parse.ts`

Tasks:

- implement the chosen JetBrains fetch or parse path
- normalize AI Credits usage into the shared model
- map quota and top-up behavior clearly
- add adapter validation against captured fixtures
- wire JetBrains into the registry

Done when:

- JetBrains snapshots can be synced and displayed
- used, remaining, and reset semantics are consistent
- sync failures are user-readable

Out of scope:

- Claude, Gemini, or Codex work

Completion date: 2026-04-20

Completion summary:

- added a JetBrains console client scaffold with a fixture-backed `Users and licensing` source
- implemented a parser for the sanitized JetBrains fixture HTML covering cards, user rows, license quotas, and top-up fields
- implemented a JetBrains adapter that normalizes parsed data into the shared provider snapshot model
- wired JetBrains into the provider registry so refresh flows now run through the real adapter path instead of mock math
- added fixture-driven Vitest coverage for the parser and adapter
- aligned the JetBrains HTML fixture with the extracted fixture record by making the `users almost out of AI Credits` count explicit

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- fixture-mode note:
  - the JetBrains adapter currently runs in fixture mode because no live Central Console session capture is available yet
  - `live` mode in `src/providers/jetbrains/official.ts` intentionally throws until a real authenticated source is confirmed

Preview:

- command: `/home/davidli/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin/node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`
- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 12` for Claude research
