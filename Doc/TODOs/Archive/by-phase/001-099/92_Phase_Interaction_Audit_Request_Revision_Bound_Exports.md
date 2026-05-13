# Phase 92 - Interaction Audit Request Revision Bound Exports

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make repo-backed interaction-audit request packages reject exported workspace state that is still bound to an older revision of the same pending request after that request package has been refreshed in place

Depends on:

- phase 91
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `scripts/`
- `fixtures/`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- record one request-package revision digest in repo-backed request manifests and bound request templates
- preserve that revision context through signoff import, local workspace state, and exported signoff JSON instead of only preserving request id plus created-at metadata
- make preflight fail when one export is still bound to an older revision of the same pending request package even if the request id still matches
- make completion reuse that same revision gate before any request or archive write can happen
- backfill the shipped pending request into the same revision-bound shape and refresh the generated request index
- add repeatable review coverage that proves one outdated export is rejected after an in-place request refresh while a refreshed export still succeeds

Done when:

- repo-backed request manifests preserve `requestRevisionSha256`
- bound request templates and exported signoff JSON also preserve that same revision context
- preflight rejects one export whose request id still matches but whose request revision is outdated
- completion also rejects that same outdated export before any archive write happens
- the shipped pending request and generated request index reflect the same revision-bound truth
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that a real non-seeded operator review has already been fulfilled
- adding signed or remote-attested request packages
- changing ad-hoc archive flow semantics outside repo-backed requests

Completion date: 2026-04-23

Completion summary:

- repo-backed request manifests now preserve `requestRevisionSha256`, and the request-bound signoff template plus exported workspace state now carry that same revision context instead of only `requestId + requestCreatedAt`
- the request-preflight truth gates now include one explicit `request-revision` check, so one export can be rejected after an in-place request refresh even when the visible request id still matches the target pending request
- request completion now reuses that same revision gate, which closes the stale-export gap before any fulfilled request or archive write can be recorded
- the shipped pending request under `Doc/testing/operator_review_requests/` was backfilled into the same revision-bound shape, and the generated request index plus request README now expose the current request-package revision digest
- repeatable review now proves an outdated export fails both preflight and completion while one refreshed export still passes and archives normally

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request evidence review: `npx -y node@22 ./scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs`
- request snapshot review: `npx -y node@22 ./scripts/phase90-interaction-audit-request-evidence-snapshot-review.mjs`
- request snapshot integrity review: `npx -y node@22 ./scripts/phase91-interaction-audit-request-evidence-integrity-review.mjs`
- request revision review: `npx -y node@22 ./scripts/phase92-interaction-audit-request-revision-binding-review.mjs`
- generated request index refresh: `npm run interaction-audit:refresh-review-request-index`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the eventual first real non-seeded operator export on a request lifecycle that is now request-bound, shape-gated, evidence-truthful, tamper-evident, and revision-bound even when one pending request package is refreshed in place
