# Phase 60 - Compact Settings QA And Reduced Motion Review

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- add a repeatable regression pass for compact-width Settings states, including expanded source-card disclosure and reduced-motion behavior

Depends on:

- phase 59
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `package.json`
- `Doc/testing/`
- `Doc/`

Tasks:

- add a Playwright review script for compact-width Settings states with disclosure expanded
- capture screenshots and machine-readable layout stats for motion-safe and reduced-motion scenarios
- record the new review command and artifact paths in the testing docs

Done when:

- the repo has a repeatable compact Settings QA command
- the command records screenshots plus machine-readable compact-width layout results
- docs, verification, and preview closeout are complete

Out of scope:

- changing provider source semantics
- redesigning the Settings UI again in this phase
- new animation features beyond reviewing the current motion baseline

Completion date: 2026-04-23

Completion summary:

- added a repeatable compact Settings review command covering `360x740` and `420x900` scenarios in both motion-safe and reduced-motion modes
- recorded screenshots and machine-readable layout stats for compact Settings states with one disclosure open
- verified that reduced-motion scenarios resolve the shipped motion duration token to `0ms` while motion-safe scenarios keep a non-zero duration

Verification:

- compact QA review: `npx -y node@22 ./scripts/phase60-compact-settings-review.mjs`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by deciding whether the next slice should be a real-browser manual compact-width pass or a Material-system audit on cards, chips, and form controls
