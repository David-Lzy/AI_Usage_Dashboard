# Phase 93 Interaction Audit Request Revision Visibility And Downloads

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- record the operator-facing revision-visibility work that now makes repo-backed request revisions visible inside the audit hub and preserves them in bound download filenames plus handoff text before the first real non-seeded export enters the repo

## Commands

- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `npx -y node@22 ./scripts/phase88-interaction-audit-request-scope-visibility-review.mjs`
- `npx -y node@22 ./scripts/phase93-interaction-audit-request-revision-visibility-review.mjs`

## Result

- the audit hub review-session summary and `Request Scope` block now surface the bound request revision instead of only the request id plus created-at timestamp
- bound downloads now preserve the current request revision as a short `rev-...` segment in filenames, which makes refreshed request packages easier to distinguish locally before completion
- signoff draft plus handoff summary markdown now preserve the full `Request revision: sha256:...` line, so the exported handoff text matches the audit-hub request truth instead of dropping revision context
- repeatable review now proves the shipped pending request template exposes the current revision in the audit hub and carries that revision through all three bound download artifacts

## Artifacts

- machine-readable request-revision visibility review:
  - `tmp/phase93-interaction-audit-request-revision-visibility-review/phase93-results.json`

## Notes

- `Phase 92` made stale exports rejectable; `Phase 93` closes the operator-visibility gap by making the active request revision obvious before one export is downloaded, shared, or fulfilled
- this phase still does not claim that the first non-seeded human review has already been fulfilled; it only makes the final local handoff artifacts more truthful before that first real export exists
