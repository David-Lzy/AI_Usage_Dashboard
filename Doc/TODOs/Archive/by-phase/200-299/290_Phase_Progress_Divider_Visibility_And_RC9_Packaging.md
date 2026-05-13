# Phase 290 - Progress Divider Visibility And RC9 Packaging

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

Fix the provider-card linear progress divider lines that still appeared partially hidden in Chrome, then package `0.1.0-rc.9`.

## Completed Work

- Removed the line-style usage-window list gap inside provider cards.
- Replaced row `border-top` separators with explicit `::before` pseudo-dividers.
- Cleared line-row border radius so only the outer progress surface owns the rounded shape.
- Preserved circle progress card borders and spacing.
- Bumped package version to `0.1.0-rc.9`.
- Bumped Chrome manifest version to `0.1.0.9` and `version_name` to `0.1.0-rc.9`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.9.zip`.
- Updated release-facing docs and the phase index.
- Added a Phase 290 release package and CSS marker review script.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.9.zip`
- SHA256: `20657b66802f277cd0f534fe81475e23d97da4d8a6843e192f05676f82501981`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, host-access model, or provider coverage claim changed in this phase.
- `0.1.0-rc.9` only changes provider-card linear divider rendering and distributes the existing Phase 285-289 fixes for Chrome install/review.
- Provider closure waits on real accounts for Claude Pro or Max, JetBrains org-console, and Gemini project-metrics product decisions.
- Store asset closeout still needs the real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.
- The older `0.1.0-rc.8` zip remains historical evidence from Phase 289.

## Verification

- `npm run test -- src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx src/sidepanel/components/UsageProgress.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.9.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.9.zip`
- `npm run phase290:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.9` for the next Chrome review pass. If the divider still reads too subtle, tune only divider color/contrast and preserve provider data semantics.
