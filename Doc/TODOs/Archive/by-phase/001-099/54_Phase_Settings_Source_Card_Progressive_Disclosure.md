# Phase 54 - Settings Source Card Progressive Disclosure

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- reduce Settings source-card density by keeping contract summaries visible while moving deep diagnostics behind explicit progressive disclosure

Depends on:

- phase 53
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- split source-card content into always-visible summary fields and expandable diagnostics
- keep session-page actions visible without requiring users to open diagnostics first
- add testable helper logic for source-card disclosure structure instead of duplicating field lists in JSX

Done when:

- Settings source cards default to a smaller, more scannable summary
- deep diagnostics remain available through an explicit expandable section
- tests, type checks, and build checks pass
- preview is restarted on the latest build

Out of scope:

- changing provider semantics or rollout stages
- redesigning popup or dashboard screens
- shipping motion transitions

Completion date: 2026-04-23

Completion summary:

- split Settings source cards into an always-visible contract summary and an explicit expandable diagnostics section
- kept session-page track actions visible outside the diagnostics disclosure so provider page operations stay easy to reach
- added a testable source-card helper to keep summary and diagnostics field selection out of JSX duplication

Verification:

- settings view-model tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/settings-view-models.test.ts`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by reducing source-card visual repetition further and adding broader width-range QA before introducing motion
