# Phase 85 Interaction Audit Request Template Drift Gate

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- record the template-drift gate that now prevents a stale pending interaction-audit request from being fulfilled after the current source template has drifted away from the request package

## Commands

- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- `npx -y node@22 ./scripts/phase82-interaction-audit-request-archive-traceability-review.mjs`
- `npx -y node@22 ./scripts/phase83-interaction-audit-request-completion-integrity-review.mjs`
- `npx -y node@22 ./scripts/phase84-interaction-audit-request-bound-export-context-review.mjs`
- `npx -y node@22 ./scripts/phase85-interaction-audit-request-template-drift-gate-review.mjs`
- `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`

## Result

- generated request indexes now surface whether each pending request is still aligned with the current source template or has drifted out of date
- `interaction-audit:complete-review-request` now rejects a stale pending request package when its current source template no longer matches the request's stored expected shape
- repo-backed request README wording now tells operators that stale request packages must be regenerated before completion instead of being treated as current review scope
- the repo-backed pending request and generated request index were refreshed so the current repo truth includes both request binding and template-drift honesty

## Artifacts

- machine-readable template-drift review:
  - `tmp/phase85-interaction-audit-request-template-drift-gate-review/phase85-results.json`
- refreshed repo-backed request docs:
  - `Doc/testing/Interaction_Audit_Review_Requests.md`
  - `Doc/testing/operator_review_requests/index.json`
  - `Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/README.md`

## Notes

- `Phase 84` already prevented the wrong pending request from being fulfilled by a same-shape exported workspace; `Phase 85` closes the next honesty gap by blocking stale requests whose current source template has moved on since request creation
- this phase still does not claim that the repo already contains a fulfilled real human operator review session; it only keeps pending-request truth aligned with the current review scope
