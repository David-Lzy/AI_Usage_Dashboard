# Phase 287 - Progress Row Spacing And RC6 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Fix the cramped dashboard provider-card linear progress rows reported during `0.1.0-rc.5` Chrome review, then package `0.1.0-rc.6` so the next install/review artifact contains the spacing fix.

## Completed Work

- Restored vertical padding for provider-card linear usage-window rows.
- Kept the first and last linear rows flush with the progress surface edges while separating internal divider lines from row content.
- Hardened usage-progress meta layout so the left label can shrink/wrap and the right remaining percentage remains fixed and non-wrapping.
- Bumped package version to `0.1.0-rc.6`.
- Bumped Chrome manifest version to `0.1.0.6` and `version_name` to `0.1.0-rc.6`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.6.zip`.
- Updated release-facing docs and the phase index.
- Added a Phase 287 release package and CSS marker review script.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.6.zip`
- SHA256: `406475217595ddb75a74a7e1db306080a77ec7b878ad7c46079e46638d8f752c`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, host-access model, or provider coverage claim changed in this phase.
- `0.1.0-rc.6` only changes provider-card progress-row spacing and distributes the existing Phase 285/286 fixes for Chrome install/review.
- Provider closure waits on real accounts for Claude Pro or Max, JetBrains org-console, and Gemini project-metrics product decisions.
- Store asset closeout still needs the real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.
- The older `0.1.0-rc.5` zip remains historical evidence from Phase 286.

## Verification

- `npm run test -- src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx src/sidepanel/components/UsageProgress.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.6.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.6.zip`
- `npm run phase287:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.6` for the next Chrome review pass. If the visual still feels too dense, the next safe adjustment should tune the provider-card progress surface spacing only, without changing provider data semantics.
