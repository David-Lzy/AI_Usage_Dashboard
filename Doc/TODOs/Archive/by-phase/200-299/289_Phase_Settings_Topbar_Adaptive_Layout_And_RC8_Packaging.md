# Phase 289 - Settings Topbar Adaptive Layout And RC8 Packaging

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

Fix the Settings top app bar density issue reported during `0.1.0-rc.7` Chrome review: wide tab mode should not leave section chips alone in the lower-left area, and sidebar widths should center action/navigation rows.

## Completed Work

- Changed Settings-only top app bar layout to a wide title/chips/actions row.
- Kept section chips centered in the available middle column on wide surfaces.
- Reflowed sidebar-width Settings top app bar into title, centered actions, and centered section chips.
- Updated section anchor offset for the broader stacked Settings top-bar breakpoint.
- Bumped package version to `0.1.0-rc.8`.
- Bumped Chrome manifest version to `0.1.0.8` and `version_name` to `0.1.0-rc.8`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.8.zip`.
- Updated release-facing docs and the phase index.
- Added a Phase 289 release package and CSS marker review script.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.8.zip`
- SHA256: `1611335d8e83513d890c486b14696ab3f7a048917f6b5fa47ee44fe4d2cd634a`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, host-access model, or provider coverage claim changed in this phase.
- `0.1.0-rc.8` only changes Settings top app bar layout and distributes the existing Phase 285-288 fixes for Chrome install/review.
- Provider closure waits on real accounts for Claude Pro or Max, JetBrains org-console, and Gemini project-metrics product decisions.
- Store asset closeout still needs the real native-toolbar popup screenshot capture/import/archive work under `Direction 10.3`.
- The older `0.1.0-rc.7` zip remains historical evidence from Phase 288.

## Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/components/TopBar.test.tsx --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.8.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.8.zip`
- `npm run phase289:review`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.8` for the next Chrome review pass. If the first row still feels crowded in a specific width, tune only Settings top-bar layout breakpoints and spacing, preserving Settings navigation semantics.
