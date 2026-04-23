# Phase 81 - Interaction Audit Review Request Lifecycle

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- close the repo-backed operator review-request lifecycle so a pending non-seeded request can be fulfilled by an archived exported signoff session without hand-editing request docs or indexes

Depends on:

- phase 80
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add a generated request index plus machine-readable request catalog under `Doc/testing/operator_review_requests/`
- add a reusable command that fulfills a pending review request by archiving an exported non-seeded signoff JSON and linking the request to that archive
- make the default create and complete request commands refresh the request index automatically instead of relying on hand-edited markdown
- add a repeatable lifecycle review that proves pending request creation, fulfillment, archive linkage, and generated request index output using tmp-local artifacts

Done when:

- pending request state and fulfilled request state can both be represented truthfully without manual doc edits
- the request workflow has a reusable completion command that links a request package to a durable archived review record
- generated request index markdown and machine-readable request catalog stay aligned with request manifests
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that Codex performed a real human operator review
- replacing the existing review-archive workflow from phases 78 and 79
- inventing multi-reviewer assignment, approvals, or remote synchronization

Completion date: 2026-04-23

Completion summary:

- added a generated request index plus `operator_review_requests/index.json`, so pending and fulfilled request states now come from request manifests instead of hand-edited markdown
- added `interaction-audit:complete-review-request`, which fulfills one pending request by archiving one exported non-seeded signoff JSON and linking the request record to the resulting durable archive
- updated the default create and complete request commands to refresh the request index automatically, and refreshed the existing repo-backed pending request so its README now points to the new completion command
- added a repeatable lifecycle review that proves pending request creation, seeded-input rejection, fulfillment, archive linkage, and generated request-index output using tmp-local artifacts

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- interaction-audit request lifecycle review: `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- repo-backed request index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by using the request lifecycle on the first real non-seeded operator review export, then archive that finished session into the repo-backed operator review history without changing its unresolved-work truth
