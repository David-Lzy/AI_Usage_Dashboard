# Phase 86 Interaction Audit Request Regeneration Workflow

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- record the stale-request regeneration workflow that now supersedes one drifted pending interaction-audit request and writes one aligned replacement request instead of leaving recovery as a manual repo edit

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
- `npx -y node@22 ./scripts/phase86-interaction-audit-request-regeneration-review.mjs`
- `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`

## Result

- repo-backed request tooling now ships `interaction-audit:regenerate-review-request`, which supersedes one drifted pending request and writes one aligned replacement request from the current source template
- request manifests and generated request indexes now preserve `superseded_by_regenerated_request` history so stale request recovery remains visible instead of being overwritten
- superseded requests can no longer be completed, while the aligned replacement request can complete normally through the existing repo-backed request lifecycle
- the repo-backed pending request and generated request index were refreshed so the current repo truth exposes both the regenerate command and the superseded-request recovery path

## Artifacts

- machine-readable regeneration review:
  - `tmp/phase86-interaction-audit-request-regeneration-review/phase86-results.json`
- refreshed repo-backed request docs:
  - `Doc/testing/Interaction_Audit_Review_Requests.md`
  - `Doc/testing/operator_review_requests/index.json`
  - `Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/README.md`

## Notes

- `Phase 85` already surfaced stale pending requests and rejected them during completion; `Phase 86` closes the recovery gap by replacing manual repo edits with one explicit supersede-and-regenerate workflow
- this phase still does not claim that the repo already contains a fulfilled real human operator review session; it only makes stale request recovery truthful, linked, and repeatable
