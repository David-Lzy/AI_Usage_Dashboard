# Phase 91 - Interaction Audit Request Evidence Snapshot Integrity Gate

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make repo-backed interaction-audit request packages tamper-evident by recording a digest for each packaged evidence snapshot and refusing completion when that packaged evidence no longer matches the manifest

Depends on:

- phase 90
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- record one digest plus size descriptor for each packaged request evidence snapshot in the request manifest and README
- teach request-evidence resolution plus preflight to report whether the packaged snapshot still matches that recorded descriptor
- make request completion fail before archive writes if the packaged snapshot digest no longer matches the request manifest
- backfill the shipped pending request so the current repo state carries the same digest-backed request packaging truth
- add repeatable review coverage that proves a tampered request snapshot is rejected by both preflight and completion

Done when:

- newly created repo-backed requests preserve packaged evidence snapshot digest metadata
- the current shipped pending request also preserves that same digest metadata
- preflight fails one request whose packaged evidence snapshot no longer matches its recorded digest
- completion also refuses that same mismatch before any archive state is written
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that a real non-seeded operator review has already been fulfilled
- adding signed or remote-attested evidence storage
- changing ad-hoc archive bundle behavior outside repo-backed requests

Completion date: 2026-04-23

Completion summary:

- repo-backed request manifests now preserve a digest plus byte-size descriptor for `interaction-audit-evidence-pack.json`, and the request README exposes that same packaged-evidence integrity line instead of only the snapshot filename
- request-evidence resolution plus preflight now distinguish “readable snapshot” from “snapshot still matches the recorded manifest digest,” so request packages can be truthful about tampering rather than only readability
- request completion now rejects a packaged evidence snapshot whose current file no longer matches the digest recorded in the request manifest, so archive writes cannot silently proceed from a modified request package
- the shipped pending request under `Doc/testing/operator_review_requests/` was backfilled into the same digest-backed shape, so current repo state now uses the same packaged-evidence integrity model as new requests
- repeatable review now proves that tampering one packaged request snapshot fails both preflight and completion before any archive directory is written

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request evidence review: `npx -y node@22 ./scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs`
- request snapshot review: `npx -y node@22 ./scripts/phase90-interaction-audit-request-evidence-snapshot-review.mjs`
- request snapshot integrity review: `npx -y node@22 ./scripts/phase91-interaction-audit-request-evidence-integrity-review.mjs`
- generated request index refresh: `npm run interaction-audit:refresh-review-request-index`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the eventual first real non-seeded operator export on a request lifecycle that is now request-bound in the UI, preflightable at the CLI layer, evidence-truthful, self-contained, and tamper-evident inside the repo
