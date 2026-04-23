# Phase 95 - Interaction Audit Evidence Provenance In Bundles And Archives

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- preserve actual evidence source plus integrity summary through generated handoff bundles, durable archive records, and generated archive indexes so repo-backed audit history keeps provenance that is richer than one path string

Depends on:

- phase 89
- phase 94
- [Direction 04 - Material, Motion, And Responsive Hardening](../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/lib/`
- `scripts/`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- preserve evidence provenance metadata in generated handoff bundle JSON plus markdown
- preserve evidence provenance metadata in archive manifests and archive README output
- surface evidence source plus integrity state in the generated archive index
- add one repeatable review that proves evidence provenance survives bundle write, archive write, and archive-index refresh
- update docs, verification, and preview closeout to reflect the new provenance continuity

Done when:

- generated handoff bundles preserve evidence source plus integrity summary
- durable archives preserve evidence source plus integrity summary in both `review-archive.json` and archive `README.md`
- generated archive index surfaces evidence source plus integrity state when present
- repeatable review proves one bundle plus archive flow keeps evidence provenance intact end to end
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that the first non-seeded human operator review has already been fulfilled
- changing preflight or completion gate outcomes beyond preserving their already-resolved evidence provenance in later artifacts
- adding cryptographic attestation beyond the repo-local provenance summary already preserved today

Completion date: 2026-04-23

Completion summary:

- generated handoff bundles now preserve evidence provenance metadata, so bundle JSON plus markdown state which evidence source was used and whether integrity was verified or not applicable
- durable review archives now preserve that same evidence provenance in both archive manifest and archive README output, so request-completion records no longer collapse actual evidence truth to one `sourceEvidencePack` path alone
- the generated archive index now surfaces evidence source plus integrity state for archives that preserve that metadata, which keeps repo-level review history scan-friendly without requiring raw manifest reads
- added `scripts/phase95-interaction-audit-evidence-provenance-bundle-archive-review.mjs` plus `npm run phase95:review`, then proved evidence provenance survives bundle generation, archive writing, and archive-index refresh

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-context bundle and archive review: `npx -y node@22 ./scripts/phase94-interaction-audit-request-context-bundle-archive-review.mjs`
- evidence-provenance bundle and archive review: `npx -y node@22 ./scripts/phase95-interaction-audit-evidence-provenance-bundle-archive-review.mjs`
- archive-index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-archive-index.mjs`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the eventual first real non-seeded operator export truthful not only about request identity, but also about the exact evidence provenance used when that export is eventually fulfilled
