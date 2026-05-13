# Phase 67 - Interaction Audit Hub And Runbook

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make the next real-browser manual QA pass practical by shipping one dedicated interaction-audit hub route with fixed-width embedded product surfaces, then formalizing its repeatable review command and runbook

Depends on:

- phase 66
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/routes/`
- `src/sidepanel/theme/`
- `src/sidepanel/App.tsx`
- `scripts/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add a debug interaction-audit route that embeds the real dashboard, settings, provider-detail, and popup surfaces inside fixed-width audit frames
- give the audit page enough guidance and standalone links so a human reviewer can use it as the real-browser QA hub instead of resizing tabs repeatedly
- add a repeatable automated review pass that verifies the audit hub loads the expected surfaces and preserves fixed-width frame dimensions
- update docs and close out preview after verification

Done when:

- the repo exposes one dedicated interaction-audit route for real-browser QA
- the audit route shows the real shipped surfaces rather than mock screenshots or fake component replicas
- the repo has a repeatable interaction-audit hub review command with saved artifacts
- docs, verification, and preview closeout are complete

Out of scope:

- redesigning the dashboard or settings information hierarchy again
- replacing the popup or side-panel navigation model
- introducing a component library migration or dark mode

Completion date: 2026-04-23

Completion summary:

- added a dedicated `#debug-interaction-audit` route that embeds the shipped dashboard, settings, provider-detail, and popup surfaces inside fixed-width audit frames, so real-browser review no longer depends on repeated manual tab resizing
- added `scripts/phase67-interaction-audit-hub-review.mjs`, `npm run phase67:review`, and saved artifacts under `tmp/phase67-interaction-audit-hub-review/` so the audit hub itself now has a repeatable verification baseline
- documented the new audit route, review command, and manual-review usage across README, the manual test checklist, roadmap docs, the phase index, and the project TODO index

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- compact Settings plus reduced-motion review: `npx -y node@22 ./scripts/phase60-compact-settings-review.mjs`
- keyboard interaction review: `npx -y node@22 ./scripts/phase61-interaction-state-review.mjs`
- status-surface review: `npx -y node@22 ./scripts/phase62-status-surface-review.mjs`
- toned-content review: `npx -y node@22 ./scripts/phase63-toned-content-review.mjs`
- pointer-state review: `npx -y node@22 ./scripts/phase64-pointer-state-review.mjs`
- chip-and-progress review: `npx -y node@22 ./scripts/phase65-chip-progress-review.mjs`
- supporting-surface and detail review: `npx -y node@22 ./scripts/phase66-detail-supporting-surface-review.mjs`
- interaction-audit hub review: `npx -y node@22 ./scripts/phase67-interaction-audit-hub-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` with one explicit real-browser operator pass using the new audit hub so the current automated review stack is paired with a recorded human interaction signoff
