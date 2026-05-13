# Phase 47 - Deferred Contract Graduation Gates

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make the exit criteria for deferred provider contracts explicit so the product states not only that a path is deferred, but also what concrete evidence would allow it to graduate into a shipped path

Depends on:

- phase 46
- [Direction 02 - Personal User Product Semantics](../../../Roadmap/02_Direction_Personal_User_Product_Semantics.md)

File scope:

- `src/shared/`
- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- add structured graduation-gate fields for deferred provider source plans
- surface current and retained session-page graduation gates in Settings and provider detail where relevant
- update docs so deferred providers are described with explicit upgrade conditions instead of vague revisit language

Done when:

- deferred `Claude`, `Gemini`, and `JetBrains` tracks show explicit graduation gates in the UI
- mixed-source providers can expose a deferred session-page gate separately from the current shipped live path
- tests and build checks pass
- preview is restarted on the latest build

Out of scope:

- new provider integrations
- actually graduating a deferred contract into shipped
- popup entry work

Completion date: 2026-04-23

Completion summary:

- added structured graduation-gate fields to provider source plans so deferred tracks can state what concrete evidence is still missing
- surfaced current and retained session-page graduation gates in Settings and provider detail for `Claude`, `Gemini`, and `JetBrains`
- updated docs so deferred providers are described with explicit upgrade conditions rather than only vague revisit language

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/shared/provider-sources.test.ts src/sidepanel/view-models.test.ts`
- unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel preview responds on `http://127.0.0.1:4173/src/sidepanel/index.html`

Follow-up:

- decide whether any deferred contract now has enough evidence to move from a graduation gate into a real shipped path
