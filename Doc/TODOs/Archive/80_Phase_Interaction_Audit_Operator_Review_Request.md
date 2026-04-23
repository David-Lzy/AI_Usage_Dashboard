# Phase 80 - Interaction Audit Operator Review Request

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- create the first repo-backed pending operator review-request workflow so the first real non-seeded human interaction-audit pass can start from a durable request package instead of an ad-hoc blank file

Depends on:

- phase 79
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `fixtures/interaction-audit/`
- `src/sidepanel/`
- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- move interaction-audit surface definitions into a shared module so blank review-request templates can stay aligned with the shipped audit-hub surfaces
- add a reusable command that writes a pending operator review-request package with a blank importable signoff template
- create the first repo-backed non-seeded request package for the first real human operator pass
- update docs and add a repeatable review pass for request-package layout and honesty wording

Done when:

- the repo can create a pending operator review-request package without hand-editing a blank signoff export
- the first request package exists under `Doc/testing/operator_review_requests/`
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that the pending request is already a completed human review
- replacing the archive flow from phases 78 and 79
- inventing remote assignment or multi-user review state

Completion date: 2026-04-23

Completion summary:

- moved the interaction-audit surface definitions into a shared module so blank request templates can stay aligned with the current audit-hub surfaces instead of drifting behind a copied inline list
- added a blank operator review-request template fixture plus a regression test that proves the fixture still matches the current signoff-export shape for the shipped audit surfaces
- added a reusable `interaction-audit:create-review-request` command that writes a pending operator review package with `README.md`, `review-request.json`, and an importable `interaction-audit-signoff-template.json`
- created the first repo-backed pending request at `Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/` so the first non-seeded human operator pass can start from a durable package instead of a scratch file
- updated README, testing docs, roadmap docs, the phase index, and the project TODO index to reflect the new request workflow

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- interaction-audit operator review-request review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- repo-backed request generation: `npx -y node@22 ./scripts/create-interaction-audit-review-request.mjs --request-id 2026-04-23-first-real-operator-review-request`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by taking the new pending request package through a real exported human operator pass and then archiving that non-seeded review through the self-indexing archive flow from phases 78 and 79
