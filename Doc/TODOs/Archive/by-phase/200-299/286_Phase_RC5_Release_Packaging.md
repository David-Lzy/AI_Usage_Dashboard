# Phase 286 - RC5 Release Packaging

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-03

## Goal

Package `0.1.0-rc.5` so the installable Chrome review artifact includes the Phase 285 post-rc4 smoke polish instead of leaving review on the older `rc.4` package boundary.

## Completed Work

- Bumped package version to `0.1.0-rc.5`.
- Bumped Chrome manifest version to `0.1.0.5` and `version_name` to `0.1.0-rc.5`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.5.zip`.
- Updated release-facing docs and the phase index.
- Added a Phase 286 release package review script.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.5.zip`
- SHA256: `34ce63b53bc1cd59d14b64b8021ec03ff2dc170a1f5ed3ccd6b9cb3735e0a7e5`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, UI behavior, host-access model, or provider coverage claim changed in this phase.
- `0.1.0-rc.5` only distributes the already completed Phase 285 fixes for Chrome install/review.
- Provider closure waits on real accounts for Claude Pro or Max, JetBrains org-console, and Gemini project-metrics product decisions.
- Store asset closeout still needs the real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.
- The older `0.1.0-rc.4` zip remains historical evidence from Phase 284.

## Verification

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.5.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.5.zip`
- `npm run phase286:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.5` for the next Chrome review pass, then continue `Direction 10.3` by capturing/importing the real native-toolbar popup screenshots from RDP Chrome and completing the store asset archive. Provider closure should wait until suitable real accounts are available.
