# Phase 284 - RC4 Release Packaging

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-03

## Goal

Package `0.1.0-rc.4` after the user confirmed Phase 283 in RDP Chrome, so the installable release artifact includes the current Codex page-session reload retry plus the post-`rc.3` UI, source-binding, and maintenance changes.

## Completed Work

- Recorded that Phase 283 RDP Chrome real-device validation passed with no issue reported.
- Clarified that operator evidence means archived real human/operator exports from interaction-audit or theme-recovery workspaces, not a new runtime feature.
- Bumped package version to `0.1.0-rc.4`.
- Bumped Chrome manifest version to `0.1.0.4` and `version_name` to `0.1.0-rc.4`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.4.zip`.
- Updated release-facing docs and the phase index.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.4.zip`
- SHA256: `3287cb832ff336594e816e62719631cc757b3db79663d83c227d186a9122cc3f`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, UI behavior, host-access model, or provider coverage claim changed in this phase.
- Provider closure waits on real accounts for Claude Pro or Max, JetBrains org-console, and Gemini project-metrics product decisions.
- Store asset closeout still needs real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.
- The older `0.1.0-rc.3` zip remains historical evidence from Phase 214.

## Verification

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.4.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.4.zip`
- `npm run phase284:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.4` for review passes, then continue `Direction 10.3` by capturing/importing the real native-toolbar popup screenshots from RDP Chrome and completing the store asset archive. Provider closure should wait until suitable real accounts are available.
