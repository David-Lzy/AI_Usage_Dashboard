# Phase 86 - Interaction Audit Request Regeneration Workflow

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- turn stale pending interaction-audit requests into a recoverable repo workflow by superseding the drifted request and generating one aligned replacement request

Depends on:

- phase 85
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add a repo-backed regenerate command that supersedes one drifted pending request and writes one aligned replacement request from the current source template
- persist superseded-request metadata in request manifests and generated request indexes so stale request history remains linked to the replacement request
- prove the old superseded request can no longer complete while the replacement request can complete normally
- update docs and generated request index output so stale-request recovery is visible instead of implicit

Done when:

- drifted pending requests can be superseded through one reusable command
- generated request indexes show the replacement link for superseded requests
- a repeatable review proves stale-request recovery and replacement completion end to end
- docs, verification, and preview closeout are complete

Out of scope:

- auto-merging old partial human notes into the regenerated request
- replacing the request-bound, shape-gated, or drift-gated completion checks added in earlier phases
- claiming that a real human operator request has already been completed in the repo

Completion date: 2026-04-23

Completion summary:

- added `interaction-audit:regenerate-review-request`, which supersedes one drifted pending request and writes one aligned replacement request from the current source template
- persisted superseded-request metadata in request manifests plus generated request indexes so stale request history now stays linked to the aligned replacement request
- updated repo-backed request docs so stale-request recovery is visible through one explicit regenerate command instead of being left as a manual repo edit
- added a repeatable regeneration review that proves the stale superseded request can no longer complete while the aligned replacement request can complete end to end
- refreshed the repo-backed pending request and generated request index so the current repo truth now includes the regenerate workflow and superseded-request wording

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package regression review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request lifecycle regression review: `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- request-to-archive traceability regression review: `npx -y node@22 ./scripts/phase82-interaction-audit-request-archive-traceability-review.mjs`
- request shape-integrity regression review: `npx -y node@22 ./scripts/phase83-interaction-audit-request-completion-integrity-review.mjs`
- request-bound export-context regression review: `npx -y node@22 ./scripts/phase84-interaction-audit-request-bound-export-context-review.mjs`
- request template-drift gate review: `npx -y node@22 ./scripts/phase85-interaction-audit-request-template-drift-gate-review.mjs`
- request regeneration workflow review: `npx -y node@22 ./scripts/phase86-interaction-audit-request-regeneration-review.mjs`
- repo-backed request index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on a request lifecycle that is now shape-gated, request-bound, drift-gated, and recoverable through explicit stale-request regeneration instead of manual repo edits
