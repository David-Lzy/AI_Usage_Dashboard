# Phase 82 - Interaction Audit Request Archive Traceability

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make fulfilled interaction-audit requests and durable review archives traceable in both directions so one archive can show which repo-backed request produced it

Depends on:

- phase 81
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add optional source-request metadata to durable review archives and generated archive indexes
- pass request linkage through the request-completion flow so archives created from pending requests preserve the originating request id and paths
- add a repeatable review that proves request-linked archives stay truthful in manifest, README, and generated archive index output
- update docs so the request lifecycle explicitly describes this bidirectional traceability

Done when:

- an archive created from `interaction-audit:complete-review-request` can point back to its source request package
- generated archive markdown and machine-readable archive json preserve request linkage when present
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that the repo already contains a fulfilled real human operator request
- redesigning the archive/request lifecycle introduced in phases 78 through 81
- inventing multi-request merges or one archive generated from multiple requests

Completion date: 2026-04-23

Completion summary:

- added optional `sourceRequest` metadata to durable review archives, so archive manifests can now preserve request id plus request README and manifest paths when the archive came from a repo-backed request
- updated the request-completion flow to pass that source-request metadata into the linked archive, making request-linked archives traceable in both directions instead of only from request to archive
- updated the generated archive index to surface linked source requests in both markdown and json output when present
- added a repeatable traceability review and refreshed the repo-backed archive index so the current generated archive docs stay aligned with the new manifest shape

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- archive index regression review: `npx -y node@22 ./scripts/phase79-interaction-audit-review-archive-index-review.mjs`
- request lifecycle regression review: `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- request-archive traceability review: `npx -y node@22 ./scripts/phase82-interaction-audit-request-archive-traceability-review.mjs`
- repo-backed archive index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-archive-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on the same linked request lifecycle, so when that real review arrives the archive will already preserve its request provenance automatically
