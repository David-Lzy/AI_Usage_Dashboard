# Phase 92 Interaction Audit Request Revision Bound Exports

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- record the request-revision work that now makes repo-backed pending requests reject one exported audit workspace that is still bound to an older revision of the same request package after that request is refreshed in place

## Commands

- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- `npx -y node@22 ./scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs`
- `npx -y node@22 ./scripts/phase90-interaction-audit-request-evidence-snapshot-review.mjs`
- `npx -y node@22 ./scripts/phase91-interaction-audit-request-evidence-integrity-review.mjs`
- `npx -y node@22 ./scripts/phase92-interaction-audit-request-revision-binding-review.mjs`
- `npm run interaction-audit:refresh-review-request-index`

## Result

- repo-backed request manifests now preserve `requestRevisionSha256`, and bound request templates plus exported signoff JSON now carry that same request-package revision context instead of only `requestId + createdAt`
- preflight now reports a dedicated `request-revision` gate, so one export can fail truthfully when it is still bound to an older revision of the same pending request package even though the visible request id still matches
- completion now reuses that same revision gate, so refreshing one pending request in place invalidates older exports before any request or archive write can happen
- the shipped pending request package under `Doc/testing/operator_review_requests/` was backfilled into the same revision-bound shape, and the generated request index now exposes that revision digest

## Artifacts

- machine-readable request-revision review:
  - `tmp/phase92-interaction-audit-request-revision-binding-review/phase92-results.json`

## Notes

- `Phase 91` made request packages tamper-evident; `Phase 92` closes the remaining stale-export gap by proving that older exports cannot silently complete against a later refreshed request package
- this phase still does not claim that the first non-seeded human review has already been fulfilled; it only hardens the repo-backed pending-request lifecycle before that first real export exists
