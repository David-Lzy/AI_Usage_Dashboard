# Phase 77 - Interaction Audit Review Queue

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- add an explicit review queue to the interaction-audit hub so a human reviewer can see which surface needs attention next and jump there without scanning the whole page manually

Depends on:

- phase 76
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `src/sidepanel/routes/`
- `src/sidepanel/theme/`
- `scripts/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add a review-queue helper that turns current signoff state into explicit queue status plus next-target guidance
- expose a review-queue section in the audit hub with per-surface status, next-target guidance, and direct jump actions
- add a repeatable review pass that verifies queue ordering, next-target updates, and jump-to-surface behavior
- update docs and close out preview after verification

Done when:

- the audit hub shows a clear next review target and per-surface queue status
- a reviewer can jump from the queue to the intended surface without manually scanning the whole page
- docs, verification, and preview closeout are complete

Out of scope:

- inventing automated approval of a real human review
- removing the existing signoff workspace, handoff summary, or export flows
- adding remote collaboration or multi-user review state

Completion date: 2026-04-23

Completion summary:

- added a shared review-queue helper so the interaction-audit workspace now computes explicit `follow_up`, `not_reviewed`, `pending_checks`, and `ready` queue states plus a single next review target from the persisted signoff workspace
- exposed a visible `Review Queue` section in the audit hub with live counts, per-surface queue chips, next-target guidance, and direct jump actions that focus the intended surface signoff control
- tightened audit-hub readiness semantics so preset actions no longer pretend a frame is ready while it is still sitting on `about:blank`; embedded audit frames now load eagerly and the preset buttons stay disabled until their real target content is present
- added `scripts/phase77-interaction-audit-review-queue-review.mjs`, saved artifacts under `tmp/phase77-interaction-audit-review-queue-review/`, and wrote a dedicated testing report for queue ordering, next-target updates, and jump-to-surface focus behavior
- updated README, testing docs, roadmap docs, the phase index, and the project TODO index to reflect the new queue-driven operator-review flow

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
- interaction-audit preset review: `npx -y node@22 ./scripts/phase68-interaction-audit-preset-review.mjs`
- interaction-audit evidence-pack review: `npx -y node@22 ./scripts/phase69-interaction-audit-evidence-pack.mjs`
- interaction-audit manual signoff-pack review: `npx -y node@22 ./scripts/phase70-interaction-audit-manual-signoff-pack.mjs`
- interaction-audit signoff workspace review: `npx -y node@22 ./scripts/phase71-interaction-audit-signoff-workspace-review.mjs`
- interaction-audit signoff import review: `npx -y node@22 ./scripts/phase72-interaction-audit-signoff-import-review.mjs`
- interaction-audit handoff bundle review: `npx -y node@22 ./scripts/phase73-interaction-audit-handoff-bundle-review.mjs`
- interaction-audit operator bundle review: `npx -y node@22 ./scripts/phase74-interaction-audit-operator-bundle-review.mjs`
- interaction-audit review-session metadata review: `npx -y node@22 ./scripts/phase75-interaction-audit-review-session-metadata-review.mjs`
- interaction-audit download-export review: `npx -y node@22 ./scripts/phase76-interaction-audit-download-export-review.mjs`
- interaction-audit review-queue review: `npx -y node@22 ./scripts/phase77-interaction-audit-review-queue-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` with the first true operator QA pass that uses the now-queue-driven audit workspace instead of only seeded navigation through the manual review surfaces
