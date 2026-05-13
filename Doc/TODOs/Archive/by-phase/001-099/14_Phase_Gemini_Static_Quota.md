# Phase 14 - Gemini Static Quota

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- add Gemini support at the "documented quota policy" level before live usage support

Depends on:

- phase 07

File scope:

- `src/providers/gemini/adapter.ts`
- `src/providers/gemini/official.ts`
- `Doc/provider_notes/Gemini.md`

Tasks:

- encode documented Gemini quota tiers by account type
- expose plan, quota window, and known request limits
- mark live used and remaining values as unknown where necessary
- document clearly that this is not live account usage yet

Done when:

- Gemini appears in the dashboard with plan-aware quota information
- unknown live usage is shown honestly
- no fake remaining number is invented

Out of scope:

- live remaining usage parsing from Google pages

Completion date: 2026-04-20

Completion summary:

- added Gemini as a fourth provider in the normalized app state and registry
- implemented a documented static quota policy source for Gemini Code Assist tiers
- selected the Enterprise documented quota tier as the default preview / MVP policy path
- added a Gemini adapter that shows known daily quota while keeping live used and remaining values unknown
- added a dedicated Gemini provider research note with the official quota sources and constraints
- improved the card and detail UI so providers with known totals but unknown live usage render as `Unknown / total`
- added Vitest coverage for the Gemini static policy and adapter

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- research validation:
  - reviewed official Google quota, FAQ, setup, and license docs on 2026-04-20
  - verified the implementation does not invent live used or remaining values

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`

Follow-up:

- move into `Phase 15` for Codex research
