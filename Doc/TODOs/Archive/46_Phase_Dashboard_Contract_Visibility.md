# Phase 46 - Dashboard Contract Visibility

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- surface the current provider contract directly on dashboard cards so users do not need to open Settings or provider detail to understand the shipped promise

Depends on:

- phase 45
- [Direction 02 - Personal User Product Semantics](../Roadmap/02_Direction_Personal_User_Product_Semantics.md)

File scope:

- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- show the current provider-contract label on dashboard cards
- show the retained session-page contract on dashboard cards when it differs from the current live path
- keep the card wording compact enough for side-panel density

Done when:

- dashboard cards expose the current contract without drilling into Settings
- mixed-source providers can show a different retained session-page contract when that matters
- tests and build checks pass
- preview is restarted on the latest build

Out of scope:

- new provider integrations
- popup entry work
- new motion or layout refactors

Completion date: 2026-04-23

Completion summary:

- surfaced the current provider-contract label directly on dashboard cards so the shipped promise is visible from the main overview
- showed the retained session-page contract on cards when it differs from the current live path, which makes mixed-source providers legible without drilling into Settings
- kept card wording compact by promoting contract detail and chips instead of duplicating full Settings-level semantics on the dashboard

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel preview responds on `http://127.0.0.1:4173/src/sidepanel/index.html`
- dedicated card-render test: not added in this slice because the repo currently does not have a component-render test harness for side-panel cards; regression coverage comes from the existing state tests plus the production build

Follow-up:

- continue `Direction 02` by deciding whether any deferred contract is mature enough to graduate into a shipped personal or project path
