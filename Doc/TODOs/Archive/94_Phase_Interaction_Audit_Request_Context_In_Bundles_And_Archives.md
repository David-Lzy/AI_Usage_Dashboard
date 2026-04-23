# Phase 94 - Interaction Audit Request Context In Bundles And Archives

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- preserve repo-backed request binding plus request revision through handoff bundle generation, durable archive writing, and generated archive indexing so request-bound exports stay truthful after they leave the audit hub

Depends on:

- phase 74
- phase 78
- phase 93
- [Direction 04 - Material, Motion, And Responsive Hardening](../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/lib/`
- `scripts/`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- preserve `requestContext` inside generated handoff bundle JSON plus markdown when the signoff export is bound to one repo-backed request
- preserve that same request context inside durable archive manifests and archive README output in addition to the higher-level `sourceRequest` link
- surface request binding plus request revision in the generated archive index when one archive comes from a request-bound export
- add one repeatable review that proves the same request identity survives bundle generation, archive writing, and archive-index refresh
- update docs, verification, and preview closeout to reflect the new request-context continuity

Done when:

- request-bound handoff bundles preserve request binding plus request revision in both markdown and JSON output
- durable archives preserve request binding plus request revision in both `review-archive.json` and archive `README.md`
- generated archive index output surfaces request binding plus request revision when present
- repeatable review proves one request-bound export keeps the same request identity through bundle plus archive output
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that the first non-seeded human operator review has already been fulfilled
- changing request-completion truth gates beyond preserving request context in later handoff and archive layers
- adding signed or remote-attested provenance beyond the repo-local request-bound context already preserved today

Completion date: 2026-04-23

Completion summary:

- generated handoff bundles now preserve `requestContext`, so request-bound signoff exports carry their request binding plus request revision into both bundle JSON and bundle markdown
- durable review archives now preserve that same request context in both the archive manifest and archive README, so repo-backed archive records keep the exact bound export identity instead of only the broader `sourceRequest` link
- the generated archive index now surfaces request binding plus request revision for request-bound archives, which keeps repo-level review history truthful without forcing reviewers to open raw archive manifests
- added `scripts/phase94-interaction-audit-request-context-bundle-archive-review.mjs` plus `npm run phase94:review`, then proved one request-bound export preserves the same request identity through bundle generation, archive writing, and archive-index refresh

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- operator bundle review: `npx -y node@22 ./scripts/phase74-interaction-audit-operator-bundle-review.mjs`
- archive workflow review: `npx -y node@22 ./scripts/phase78-interaction-audit-review-archive-review.mjs`
- request-context bundle and archive review: `npx -y node@22 ./scripts/phase94-interaction-audit-request-context-bundle-archive-review.mjs`
- archive-index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-archive-index.mjs`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the eventual first real non-seeded operator export truthful not only inside the audit hub, but also through generated bundle artifacts and durable repo-backed archive records
