# Phase 83 - Interaction Audit Request Completion Integrity

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- prevent a pending interaction-audit request from being fulfilled by an unrelated exported workspace shape by adding explicit request-template integrity checks to the completion flow

Depends on:

- phase 82
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `fixtures/interaction-audit/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- store a stable expected export shape in repo-backed request manifests at create time
- enforce that `interaction-audit:complete-review-request` rejects exported workspaces whose surface ids or manual-check structure do not match the request template
- add a repeatable review that proves mismatched exports are rejected while matching exports still complete successfully
- update docs and the existing repo-backed pending request so the new integrity metadata is present without claiming any completed human review

Done when:

- pending requests carry explicit expected-shape metadata derived from their template
- completion rejects mismatched exported workspace shapes with a concrete error
- docs, verification, and preview closeout are complete

Out of scope:

- changing the audit-hub surface model itself
- inventing cryptographic signing or remote attestation for exported review state
- claiming that the repo already contains a fulfilled real human operator request

Completion date: 2026-04-23

Completion summary:

- added explicit `expectedShape` metadata to repo-backed request manifests so pending requests now preserve the exact surface ids and manual-check structure they expect at completion time
- updated `interaction-audit:complete-review-request` to reject exported workspace shapes that do not match that request template instead of fulfilling the wrong request
- refreshed the repo-backed pending request and generated request index so the current request docs now reflect the new expected-shape integrity metadata and honesty wording
- added a repeatable integrity review that proves mismatched exports are rejected while matching exports still complete successfully

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package regression review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request lifecycle regression review: `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- request completion integrity review: `npx -y node@22 ./scripts/phase83-interaction-audit-request-completion-integrity-review.mjs`
- repo-backed request index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on the same integrity-gated request lifecycle, so a wrong exported workspace shape cannot be linked to the wrong durable request record by accident
