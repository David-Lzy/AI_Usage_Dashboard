# Phase 90 - Interaction Audit Request Evidence Snapshot Packaging

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- make repo-backed interaction-audit request packages self-contained by snapshotting their evidence pack into the request directory instead of relying on a `tmp/` path staying available

Depends on:

- phase 89
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- snapshot the evidence pack into each new repo-backed request package and record that artifact in the request manifest
- make request evidence resolution prefer the package-local snapshot while still supporting legacy manifests that only carry `sourceEvidencePack`
- propagate that snapshot behavior through request regeneration so replacement requests stay self-contained too
- backfill the current real pending request so the shipped repo state no longer depends on `tmp/phase69...` for its default request evidence path
- add repeatable review coverage that proves request packages now carry their own evidence snapshot and resolve it ahead of any legacy external path

Done when:

- new request packages include a local evidence snapshot artifact
- preflight and completion resolve that request-local snapshot by default
- the current real pending request package is self-contained and no longer relies on `tmp/` for default repo-backed evidence resolution
- docs, verification, and preview closeout are complete

Out of scope:

- changing ad-hoc archive bundle behavior outside repo-backed requests
- claiming that a real non-seeded operator review has already been completed
- adding browser-side automatic fetch of review-request artifacts

Completion date: 2026-04-23

Completion summary:

- request packages now snapshot their evidence report into `interaction-audit-evidence-pack.json`, so repo-backed requests are self-contained after creation instead of depending on an external `tmp/` evidence file
- request-evidence resolution now prefers the package-local snapshot, while still preserving the original source evidence path as provenance and keeping explicit `--evidence` overrides truthful
- request regeneration now carries the request evidence snapshot into the aligned replacement request, so stale-request recovery keeps the same durable packaging model
- the shipped pending request under `Doc/testing/operator_review_requests/` was backfilled into the new self-contained shape, so current repo state no longer relies on `tmp/phase69...` for default request-bound evidence resolution
- repeatable review now proves one request package keeps preflight plus completion working even after the original external evidence file is removed

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request regeneration review: `npx -y node@22 ./scripts/phase86-interaction-audit-request-regeneration-review.mjs`
- request evidence review: `npx -y node@22 ./scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs`
- request snapshot review: `npx -y node@22 ./scripts/phase90-interaction-audit-request-evidence-snapshot-review.mjs`
- generated request index refresh: `npm run interaction-audit:refresh-review-request-index`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the eventual first real non-seeded operator export on a request package that is now request-bound in the UI, preflightable at the CLI layer, evidence-truthful, and self-contained inside the repo
