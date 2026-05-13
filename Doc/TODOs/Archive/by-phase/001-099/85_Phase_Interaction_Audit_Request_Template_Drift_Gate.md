# Phase 85 - Interaction Audit Request Template Drift Gate

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- prevent a stale pending interaction-audit request from being fulfilled after the current source template has drifted away from the request's original expected shape

Depends on:

- phase 84
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- detect source-template drift for repo-backed pending requests by comparing each request's stored expected shape against the current template file on disk
- surface that drift state in the generated request index so stale pending requests are visible before completion time
- enforce that `interaction-audit:complete-review-request` rejects a pending request when its current source template has drifted from the request package
- add a repeatable review that proves drifted requests are flagged in the index and rejected during completion until regenerated
- refresh the repo-backed pending request and request index so the current repo truth also carries the new drift wording

Done when:

- pending request indexes expose template-drift state
- completion rejects stale request packages with a concrete drift error
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that a real human operator review has already happened
- changing the visible audit checklist content itself
- adding version-control-aware release metadata to request packages

Completion date: 2026-04-23

Completion summary:

- added template-drift detection for repo-backed pending requests by comparing each request's stored expected shape against the current source template on disk
- surfaced that drift state in the generated request index so stale pending requests now show up as out of date before completion time
- updated `interaction-audit:complete-review-request` to reject stale request packages whose current source template has drifted away from the request package
- refreshed the repo-backed pending request and generated request index so the current repo truth now includes the stronger drift wording and aligned-state output
- added a repeatable drift-gate review that proves drifted requests are flagged in the request index and rejected during completion until regenerated

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
- repo-backed request index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on a request lifecycle that is now shape-gated, request-bound, and template-drift-aware before the repo starts recording real human review archives
