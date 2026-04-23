# Phase 87 - Interaction Audit Request Completion Preflight

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- add a no-side-effect preflight path that evaluates whether one exported interaction-audit workspace is eligible to fulfill one repo-backed pending request before any archive or request record is written

Depends on:

- phase 86
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- factor the request-completion gate checks into one shared preflight helper instead of keeping them only inside the archive-writing completion command
- add a repo-backed preflight command that reports request status, request binding, seeded-state rejection, shape integrity, and current-template drift without mutating request or archive records
- prove preflight catches mismatched or drifted exports while leaving the pending request untouched
- update request docs and generated indexes so reviewers can run preflight before the real completion command

Done when:

- one reusable preflight command can evaluate a pending request without writing archive output
- the completion command reuses the same gate logic instead of drifting away from the preflight checks
- repeatable review proves preflight reports pass and fail states truthfully while keeping the request pending
- docs, verification, and preview closeout are complete

Out of scope:

- auto-fulfilling a request when preflight passes
- claiming that a real human operator review has already been archived
- replacing the existing request-bound, shape-gated, drift-gated, or regenerate-based truth model

Completion date: 2026-04-23

Completion summary:

- added `interaction-audit:preflight-review-request`, which evaluates one pending request and one exported signoff JSON without writing archive or request state
- factored the request-completion truth gates into one shared preflight helper so seeded-state rejection, request binding, workspace shape, and template-drift checks now stay aligned between preflight and completion
- updated generated request docs so reviewers can run preflight before the real completion command instead of discovering request failures only after attempting archive writes
- added a repeatable preflight review that proves aligned exports pass, wrong-bound exports fail, drifted requests fail, and the pending request remains unchanged after those checks
- refreshed the repo-backed pending request and generated request index so the current repo truth now exposes the preflight workflow alongside completion and regeneration

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
- request completion preflight review: `npx -y node@22 ./scripts/phase87-interaction-audit-request-completion-preflight-review.mjs`
- repo-backed request index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on a request lifecycle that is now shape-gated, request-bound, drift-gated, recoverable through regeneration, and previewable through one no-side-effect completion preflight
