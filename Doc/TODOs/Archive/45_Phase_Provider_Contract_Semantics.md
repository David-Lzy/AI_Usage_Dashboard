# Phase 45 - Provider Contract Semantics

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- make the product contract for each provider source explicit, especially the difference between shipped personal partial paths, shipped enterprise analytics paths, and deferred personal or org tracks

Depends on:

- phase 44
- [Direction 02 - Personal User Product Semantics](../Roadmap/02_Direction_Personal_User_Product_Semantics.md)

File scope:

- `src/shared/`
- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- add explicit product-contract labels and details to provider source plans
- surface those contract labels in Settings and provider detail
- make deferred personal or org paths legible without relying on long implementation notes
- update docs if the visible product contract changes

Done when:

- the UI shows whether a source is shipped personal partial, shipped enterprise/admin analytics, policy only, or deferred
- deferred `Claude`, `Gemini`, and `JetBrains` paths are clearly framed as deferred contracts instead of vague future work
- tests and build checks pass
- preview is restarted on the latest build

Out of scope:

- new provider integrations
- popup entry work
- cookie-backed or local-estimate experiments

Completion date: 2026-04-23

Completion summary:

- added explicit provider-contract semantics to each source plan so shipped admin analytics, shipped enterprise analytics, shipped personal partial, shipped policy-only, and deferred tracks are no longer implied only through notes
- surfaced current and session-page contract labels in Settings and provider detail so mixed-source providers can show different promises for the live path and the retained session-page track
- updated README and Direction 02 roadmap docs so the visible product contract matches the shipped UI

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel preview responds on `http://127.0.0.1:4173/src/sidepanel/index.html`

Follow-up:

- continue `Direction 02` by deciding whether any deferred provider can graduate from a deferred contract to a real shipped personal or project path
