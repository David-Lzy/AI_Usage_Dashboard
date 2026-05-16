# Phase 502 - RC23 Provider Display Cleanup Packaging

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status:

- completed

## Goal

Package the completed provider setup/display cleanup as a follow-up Chrome Web Store candidate after the numbered queue closed at `Phase 501`.

## Scope

- Bump `package.json` and `package-lock.json` to `0.1.0-rc.23`.
- Bump `src/manifest.json` to Chrome manifest version `0.1.0.23` and display version `0.1.0-rc.23`.
- Run the full release gate.
- Generate `release/ai-usage-dashboard-0.1.0-rc.23.zip`.
- Record the RC23 milestone, SHA256, and current store handoff boundary.

## Preserved Boundaries

- Do not mutate the historical RC13 submitted Chrome Web Store review milestone.
- Do not change provider support promises, permissions, raw evidence, export schemas, or store listing claims.
- Do not claim an automatic Chrome Web Store upload.

## Acceptance

- Package and manifest versions align at `0.1.0-rc.23` / `0.1.0.23`.
- `npm run release:check` passes.
- `npm run release:package` creates the RC23 zip.
- The milestone and current docs point to RC23 as the latest packaged follow-up candidate while preserving RC13 as the submitted-review boundary.

## Completion Summary

- Bumped package and Chrome manifest versions to `0.1.0-rc.23` / `0.1.0.23`.
- Ran the full release gate: i18n, typecheck, all tests, and production build passed.
- Generated `release/ai-usage-dashboard-0.1.0-rc.23.zip`.
- Recorded SHA256 `77f69c57a24ec7056b1013db48e27c4e11f095732dbd1d3775aeaf40c88f78a4`.
- Added the RC23 milestone as the latest packaged follow-up candidate and kept RC13 as the submitted store-review boundary.

## Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.23.zip`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the user chooses to resubmit, manually upload `release/ai-usage-dashboard-0.1.0-rc.23.zip` to Chrome Web Store and create a fresh submitted-review milestone.
