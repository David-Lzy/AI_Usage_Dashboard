# Phase 65 - Progress Honesty And Chip Audit

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- make progress indicators and compact chip roles more system-driven by removing misleading unknown-progress fills and by formalizing chip and progress tones into a repeatable Material-style baseline

Depends on:

- phase 62
- phase 63
- phase 64
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/components/`
- `src/sidepanel/theme/`
- `scripts/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- replace the current fake fixed-width unknown progress fill with an explicit indeterminate visual treatment and accessible progress semantics
- define or tighten shared chip and progress tokens so neutral, warning, error, and success compact surfaces are more system-driven
- add a repeatable review pass that checks chip and progress roles across dashboard, settings, and popup
- update docs and close out preview after verification

Done when:

- unknown progress no longer looks like a real measured percentage
- progress indicators expose clearer accessible state for determinate versus indeterminate values
- compact chip roles read as one coherent system instead of ad-hoc color blocks
- the repo has a repeatable chip-and-progress review command with saved artifacts
- docs, verification, and preview closeout are complete

Out of scope:

- redesigning dashboard information hierarchy
- changing provider contracts or source semantics
- introducing dark mode or a component library migration

Completion date: 2026-04-23

Completion summary:

- replaced the old fake fixed-width unknown progress fill with an explicit indeterminate progress treatment plus accessible `progressbar` semantics for determinate versus unknown values
- tightened compact chip tokens so token chips, status badges, meta chips, and credential-state badges now sit on a clearer shared baseline instead of mixed ad-hoc surfaces
- added `scripts/phase65-chip-progress-review.mjs`, `npm run phase65:review`, and a dedicated `UsageProgress` component test so chip and progress roles now have both automated rendering checks and saved visual review artifacts
- updated README, testing docs, roadmap docs, the manual checklist, and the project TODO index to reflect the new chip-and-progress baseline

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- targeted component tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/components/UsageProgress.test.tsx`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- compact Settings plus reduced-motion review: `npx -y node@22 ./scripts/phase60-compact-settings-review.mjs`
- keyboard interaction review: `npx -y node@22 ./scripts/phase61-interaction-state-review.mjs`
- status-surface review: `npx -y node@22 ./scripts/phase62-status-surface-review.mjs`
- toned-content review: `npx -y node@22 ./scripts/phase63-toned-content-review.mjs`
- pointer-state review: `npx -y node@22 ./scripts/phase64-pointer-state-review.mjs`
- chip-and-progress review: `npx -y node@22 ./scripts/phase65-chip-progress-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by choosing between a real-browser manual interaction audit and a broader Material audit on remaining neutral cards plus detail-field surfaces
