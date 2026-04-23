# Phase 91 Interaction Audit Request Evidence Snapshot Integrity Gate

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- record the request-integrity work that now makes repo-backed request packages reject packaged evidence snapshots whose current file no longer matches the digest recorded in the request manifest

## Commands

- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- `npx -y node@22 ./scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs`
- `npx -y node@22 ./scripts/phase90-interaction-audit-request-evidence-snapshot-review.mjs`
- `npx -y node@22 ./scripts/phase91-interaction-audit-request-evidence-integrity-review.mjs`
- `npm run interaction-audit:refresh-review-request-index`

## Result

- repo-backed request manifests now preserve one digest plus size descriptor for `interaction-audit-evidence-pack.json`
- request README files and the generated request index now expose that packaged-evidence integrity metadata instead of only the snapshot filename
- request-evidence resolution now reports whether a packaged snapshot still matches the digest recorded in the request manifest
- preflight and completion now both reject a packaged snapshot whose current file no longer matches that recorded digest, and completion fails before any archive directory is written
- the shipped pending request package was backfilled into the same digest-backed shape, so current repo state now uses the same tamper-evident request packaging as newly created requests

## Artifacts

- machine-readable request-integrity review:
  - `tmp/phase91-interaction-audit-request-evidence-integrity-review/phase91-results.json`

## Notes

- `Phase 90` closed the durability gap by making request packages self-contained; `Phase 91` closes the remaining packaged-evidence honesty gap by making those same packages tamper-evident
- this phase still does not claim that a real non-seeded operator review has already been fulfilled; it only hardens the pending request lifecycle before that first real export exists
