# Phase 16 - Codex Adapter Spike

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- implement the smallest honest Codex support slice based on phase 15

Depends on:

- phase 15

File scope:

- `src/providers/codex/adapter.ts`
- `src/providers/codex/official.ts`
- `src/providers/codex/page-parse.ts`

Tasks:

- implement the supported Codex source path if one is stable
- otherwise implement a guarded unsupported-state adapter
- normalize plan and limit information without overstating precision
- wire Codex into the registry

Done when:

- Codex either syncs from a stable workspace source or is explicitly marked unsupported
- the UI never implies a false live-usage number

Out of scope:

- perfect support for every Codex plan type

Completion date: 2026-04-20

Completion summary:

- added Codex as a fifth provider in the normalized app state and registry
- implemented a fixture-backed Codex research client using the docs-derived workspace-surface and rate-card fixtures from phase 15
- implemented the smallest honest Codex adapter slice as a guarded workspace spike instead of a fake live usage integration
- added explicit unsupported-state messaging for personal plans and for missing workspace access
- kept `used`, `remaining`, and `total` as unknown so the UI never implies a false live Codex balance
- added Vitest coverage for the Codex spike path and unsupported-state path

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- spike note:
  - this phase intentionally stops at a workspace-spike warning state because no live Business / Enterprise workspace capture or enterprise analytics API access was available

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 17` for integration QA and polish
